import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Account } from '../../domain/entities/account.entity';
import { IAccountRepository, IAccountRepositoryToken } from '../../domain/repositories/account.repository.interface';

@Injectable()
export class AccountService {
  constructor(
    @Inject(IAccountRepositoryToken)
    private readonly accountRepository: IAccountRepository,
  ) {}

  async create(data: Partial<Account>): Promise<Account> {
    if (data.code === '0') {
      throw new BadRequestException('Cannot interact with reserved code 0');
    }
    await this.checkDuplicateCode(data.code);
    await this.validateNatureAdjustments(data, data.relatedDetailedAccounts || [], data.code);
    return this.accountRepository.create(data);
  }

  async update(id: number, data: Partial<Account>): Promise<Account> {
    const existing = await this.accountRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    if (existing.code === '0' || data.code === '0') {
      throw new BadRequestException('Cannot update the root account');
    }
    if (data.code && data.code !== existing.code) {
      await this.checkDuplicateCode(data.code, id);
    }
    const currentDetailedLevels = data.relatedDetailedAccounts || existing.relatedDetailedAccounts || [];
    const currentCode = data.code || existing.code;
    await this.validateNatureAdjustments(data, currentDetailedLevels, currentCode);
    return this.accountRepository.update(id, data);
  }

  private async validateNatureAdjustments(data: Partial<Account>, mainLevels: any[], currentCode?: string) {
    if (!data.natureAdjustments || data.natureAdjustments.length === 0) return;
    
    for (const adj of data.natureAdjustments) {
      if (!adj.moinCode) continue;
      
      const adjAccount = await this.accountRepository.findByCode(adj.moinCode);
      if (!adjAccount || !adjAccount.relatedDetailedAccounts) continue;
      
      // 7th Filter: Cannot be in the same group account
      if (currentCode && adj.moinCode) {
        const grpLen = await this.accountRepository.getGroupAccountLength();
        const mainGroup = currentCode.substring(0, grpLen);
        const adjGroup = adj.moinCode.substring(0, grpLen);
        if (mainGroup && adjGroup && mainGroup === adjGroup) {
          throw new BadRequestException(`خطا: حساب معین طرف مقابل تعدیل ماهیت (${adj.moinCode}) نمی‌تواند با حساب معین جاری (${currentCode}) در یک گروه حساب قرار داشته باشد.`);
        }
      }

      const adjLevels = adjAccount.relatedDetailedAccounts;
      
      for (const mainLevel of mainLevels) {
        const hasLevel = adjLevels.some(x => Number(x.detailedLevel) === Number(mainLevel.detailedLevel));
        if (hasLevel) {
          const matchingAdjLevel = adjLevels.find(x => 
            Number(x.detailedLevel) === Number(mainLevel.detailedLevel) && 
            String(x.detailedTypeId) === String(mainLevel.detailedTypeId)
          );
          if (!matchingAdjLevel) {
            throw new BadRequestException(`خطا: سطح تفصیلی ${mainLevel.detailedLevel} در معین انتخاب شده متناقض است. هر دو معین باید در سطح تفصیلی یکسان، به نوع تفصیلی همسانی متصل باشند`);
          }
        }
      }

      for (const adjLevel of adjLevels) {
        const hasLevel = mainLevels.some(x => Number(x.detailedLevel) === Number(adjLevel.detailedLevel));
        if (hasLevel) {
          const matchingMainLevel = mainLevels.find(x => 
            Number(x.detailedLevel) === Number(adjLevel.detailedLevel) && 
            String(x.detailedTypeId) === String(adjLevel.detailedTypeId)
          );
          if (!matchingMainLevel) {
            throw new BadRequestException(`خطا: سطح تفصیلی ${adjLevel.detailedLevel} در معین انتخاب شده متناقض است. هر دو معین باید در سطح تفصیلی یکسان، به نوع تفصیلی همسانی متصل باشند`);
          }
        }
      }
    }
  }

  private async checkDuplicateCode(code?: string, excludeId?: number) {
    if (!code) return;
    const isDuplicate = await this.accountRepository.checkDuplicate('code', code, excludeId);
    if (isDuplicate) {
      throw new BadRequestException('حسابی با این کد از قبل وجود دارد');
    }
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    return this.accountRepository.checkDuplicate(field, value, excludeId);
  }

  async findAll(search?: string, level?: number, options?: any): Promise<Account[]> {
    return this.accountRepository.findAll(search, level, options);
  }

  async findOne(id: number): Promise<Account> {
    const item = await this.accountRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    return item;
  }

  async remove(id: number): Promise<void> {
    const existing = await this.accountRepository.findById(id);
    if (existing && existing.code === '0') {
      throw new BadRequestException('Cannot delete the root account');
    }
    await this.accountRepository.delete(id);
  }


  async seedDefaultTree(type: number = 1, lengths: { group: number, total: number, specific: number }) {
    // Check if any accounts exist other than root
    const all = await this.accountRepository.findAll();
    if (all.length > 1) {
      throw new BadRequestException('کدینگ حساب‌ها خالی نیست. امکان ایجاد کدینگ پیش‌فرض وجود ندارد.');
    }

    let root = await this.accountRepository.findByCode('0');
    if (!root) {
      root = await this.accountRepository.create({
        code: '0',
        title: 'کدینگ حسابها',
        isActive: true,
      });
    }

    const { group, total, specific } = lengths;
    const pad = (num: number, len: number) => num.toString().padStart(len, '0');

    let templateGroups: Array<{
      title: string;
      accountType: number;
      accountNature: number;
      totals: Array<{
        title: string;
        specifics: Array<{ title: string }>;
      }>;
    }> = [];

    if (type === 1) {
      // 1-کدینگ تولیدی
      templateGroups = [
        {
          title: 'دارایی‌های جاری', accountType: 1, accountNature: 1,
          totals: [
            { title: 'موجودی نقد و بانک', specifics: [{ title: 'صندوق‌ها' }, { title: 'بانک‌ها' }] },
            { title: 'حساب‌ها و اسناد دریافتنی تجاری', specifics: [{ title: 'حسابهاي دريافتني تجاري' }, { title: 'چکهاي دريافتني نزد صندوق' }, { title: 'چکهاي در جریان وصول' }, { title: 'اسناد واخواست شده' }, { title: 'ذخیره مطالبات مشکوک الوصول' }] },
            { title: 'ساير حسابها و اسناد دريافتني', specifics: [{ title: 'مساعده حقوق' }, { title: 'وام کارکنان' }, { title: 'جاري شركا' }, { title: 'ساير حسابهاي دريافتني' }, { title: 'کسر صندوق' }, { title: 'ودیعه اجاره' }, { title: 'خسارات قابل دریافت ازبیمه' }] },
            { title: 'سرمايه گذاري ‌هاي كوتاه مدت', specifics: [{ title: 'سپرده هاي کوتاه مدت نزد بانکها' }] },
            { title: 'موجودی مواد و کالا', specifics: [{ title: 'موجودي انبار مواد اوليه' }, { title: 'موجودي انبار محصولات' }, { title: 'موجودي انبار ملزومات و مواد مصرفي' }, { title: 'موجودي انبار مرجوعي' }, { title: 'موجودي انبار ضايعات' }, { title: 'موجودي انبار پاي كار' }, { title: 'موجودي انبار بسته بندي' }, { title: 'موجودي انبار قطعات و لوازم يدكي' }, { title: 'موجودي انبار تاسيسات' }, { title: 'موجودي انبار ابزارآلات و تجهيزات' }, { title: 'كالاي اماني ما نزد ديگران' }, { title: 'واسط انتقال بین انبار' }] },
            { title: 'كار درجريان ساخت', specifics: [{ title: 'کار درجریان ساخت' }] },
            { title: 'سفارشات و اقلام در راه', specifics: [{ title: 'بهاي اصلی سفارش' }, { title: 'هزینه های ثبت سفارش' }, { title: 'هزینه های بیمه سفارش' }, { title: 'هزینه های بانکی سفارش' }, { title: 'هزینه های گمرکی' }, { title: 'حقوق و عوارض بندري' }, { title: 'هزینه بازرسی گمرکی' }, { title: 'هزینه حق العمل ترخیص' }, { title: 'هزینه حمل واردات' }, { title: 'هزینه حمل داخلی سفارش' }, { title: 'هزینه های انبارداری و دموراژ' }, { title: 'سایر هزینه های واردات' }, { title: 'سفارشات در راه' }] },
            { title: 'پيش پرداختها', specifics: [{ title: 'پیش پرداخت خرید موجودی ها' }, { title: 'پیش پرداخت خرید دارایی های ثابت' }, { title: 'پیش پرداخت هزینه های جاری' }, { title: 'پیش پرداخت بیمه آتش سوزی' }, { title: 'پیش پرداخت بیمه مسئولیت' }, { title: 'پیش پرداخت بیمه تکمیل درمان' }, { title: 'پیش پرداخت مالیات' }, { title: 'پیش پرداخت اجاره' }, { title: 'پیش پرداخت هزینه سود و کارمزد وامها' }, { title: 'پیش پرداخت مالیات ارزش افزوده' }, { title: 'پیش پرداخت عوارض ارزش افزوده' }, { title: 'پیش پرداخت خرید خدمات' }, { title: 'پیش پرداخت بیمه دارائیها' }] },
          ]
        },
        {
          title: 'دارایی‌های غیرجاری', accountType: 1, accountNature: 1,
          totals: [
            { title: 'دارایی‌های ثابت مشهود', specifics: [{ title: 'زمین' }, { title: 'ساختمانها' }, { title: 'تاسیسات' }, { title: 'ماشین آلات و تجهیزات تولید' }, { title: 'وسائط نقلیه' }, { title: 'کامپیوتر و تجهیزات شبکه و اینترنت' }, { title: 'اثاثیه و منصوبات' }] },
            { title: 'استهلاک انباشته', specifics: [{ title: 'استهلاک انباشته ساختمان' }, { title: 'استهلاک انباشته ماشین‌آلات' }] },
          ]
        },
        {
          title: 'بدهی‌های جاری', accountType: 1, accountNature: 2,
          totals: [
            { title: 'حساب‌ها و اسناد پرداختنی تجاری', specifics: [{ title: 'حساب‌های پرداختنی تجاری (تامین‌کنندگان)' }, { title: 'اسناد پرداختنی تجاری' }] },
            { title: 'سایر پرداختنی‌ها و کسورات', specifics: [{ title: 'مالیات تکلیفی و ارزش افزوده' }, { title: 'بیمه پرداختنی' }] },
          ]
        },
        {
          title: 'بدهی‌های غیرجاری', accountType: 1, accountNature: 2,
          totals: [
            { title: 'تسهیلات مالی بلندمدت', specifics: [{ title: 'تسهیلات دریافتنی بلندمدت بانکی' }] },
            { title: 'ذخیره مزایای پایان خدمت', specifics: [{ title: 'ذخیره سنوات خدمت کارکنان' }] },
          ]
        },
        {
          title: 'حقوق مالکانه', accountType: 1, accountNature: 2,
          totals: [
            { title: 'سرمایه', specifics: [{ title: 'سرمایه ثبت شده' }] },
            { title: 'سود و زیان انباشته', specifics: [{ title: 'سود (زیان) انباشته' }] },
          ]
        },
        {
          title: 'درآمدها', accountType: 2, accountNature: 2,
          totals: [
            { title: 'فروش محصولات تولیدی', specifics: [{ title: 'فروش محصولات اصلی' }, { title: 'برگشت از فروش و تخفیفات' }] },
          ]
        },
        {
          title: 'بهای تمام شده کالای فروش رفته', accountType: 2, accountNature: 1,
          totals: [
            { title: 'بهای تمام شده محصولات تولیدی', specifics: [{ title: 'مصرف مواد مستقیم' }, { title: 'دستمزد مستقیم تولید' }, { title: 'سربار ساخت و تولید' }, { title: 'تغییرات موجودی کالای در جریان ساخت' }] },
          ]
        },
        {
          title: 'هزینه‌ها', accountType: 2, accountNature: 1,
          totals: [
            { title: 'هزینه‌های عمومی و اداری', specifics: [{ title: 'حقوق و دستمزد اداری' }, { title: 'هزینه استهلاک اداری' }] },
            { title: 'هزینه‌های توزیع و فروش', specifics: [{ title: 'هزینه‌های حمل و نقل و بازاریابی' }] },
          ]
        },
        {
          title: 'حساب‌های انتظامی', accountType: 3, accountNature: 7,
          totals: [
            { title: 'حساب‌های انتظامی', specifics: [{ title: 'اسناد ضمانتی نزد دیگران' }] },
            { title: 'طرف حساب‌های انتظامی', specifics: [{ title: 'طرف اسناد ضمانتی' }] },
          ]
        },
      ];
    } else if (type === 2) {
      // 2-کدینگ بازرگانی
      templateGroups = [
        {
          title: 'دارایی‌های جاری', accountType: 1, accountNature: 1,
          totals: [
            { title: 'موجودی نقد و بانک', specifics: [{ title: 'صندوق و تنخواه' }, { title: 'حساب‌های بانکی' }] },
            { title: 'اسناد و حساب‌های دریافتنی', specifics: [{ title: 'اسناد دریافتنی تجاری' }, { title: 'بدهکاران تجاری' }] },
            { title: 'موجودی کالای بازرگانی', specifics: [{ title: 'موجودی کالای بازرگانی در انبار' }, { title: 'کالای در راه' }] },
          ]
        },
        {
          title: 'دارایی‌های غیرجاری', accountType: 1, accountNature: 1,
          totals: [
            { title: 'دارایی‌های ثابت مشهود', specifics: [{ title: 'اموال و اثاثیه اداری' }, { title: 'وسایل نقلیه' }] },
          ]
        },
        {
          title: 'بدهی‌های جاری', accountType: 1, accountNature: 2,
          totals: [
            { title: 'اسناد و حساب‌های پرداختنی', specifics: [{ title: 'بستانکاران تجاری (فروشندگان کالا)' }, { title: 'اسناد پرداختنی کوتاه مدت' }] },
          ]
        },
        {
          title: 'بدهی‌های غیرجاری', accountType: 1, accountNature: 2,
          totals: [
            { title: 'دیون بلندمدت', specifics: [{ title: 'تسهیلات بانکی بلندمدت' }] },
          ]
        },
        {
          title: 'حقوق صاحبان سهام', accountType: 1, accountNature: 2,
          totals: [
            { title: 'سرمایه و اندوخته‌ها', specifics: [{ title: 'سرمایه' }, { title: 'اندوخته قانونی' }] },
          ]
        },
        {
          title: 'درآمدها', accountType: 2, accountNature: 2,
          totals: [
            { title: 'فروش کالا', specifics: [{ title: 'فروش ناخالص کالا' }, { title: 'تخفیفات نقدی فروش' }, { title: 'برگشت از فروش' }] },
          ]
        },
        {
          title: 'بهای تمام شده کالای فروش رفته', accountType: 2, accountNature: 1,
          totals: [
            { title: 'بهای تمام شده کالای خریداری شده', specifics: [{ title: 'خرید کالا' }, { title: 'تخفیفات نقدی خرید' }, { title: 'هزینه حمل کالای خریداری شده' }] },
          ]
        },
        {
          title: 'هزینه‌های عملیاتی', accountType: 2, accountNature: 1,
          totals: [
            { title: 'هزینه‌های فروش و اداری', specifics: [{ title: 'حقوق و مزایای پرسنل' }, { title: 'هزینه اجاره دفتر و انبار' }, { title: 'هزینه تبلیغات و آگهی' }] },
          ]
        },
        {
          title: 'حساب‌های انتظامی', accountType: 3, accountNature: 7,
          totals: [
            { title: 'حساب‌های انتظامی', specifics: [{ title: 'چك‌های امانی و ضمانتی' }] },
          ]
        },
      ];
    } else if (type === 3) {
      // 3-کدینگ خدماتی
      templateGroups = [
        {
          title: 'دارایی‌های جاری', accountType: 1, accountNature: 1,
          totals: [
            { title: 'نقد و بانک', specifics: [{ title: 'صندوق' }, { title: 'بانک‌ها' }] },
            { title: 'مطالبات و دریافتنی‌ها', specifics: [{ title: 'حساب‌های دریافتنی مشتریان' }, { title: 'پیش‌پرداخت هزینه‌ها' }] },
          ]
        },
        {
          title: 'دارایی‌های غیرجاری', accountType: 1, accountNature: 1,
          totals: [
            { title: 'تجهیزات و نرم‌افزارها', specifics: [{ title: 'تجهیزات رایانه‌ای و اداری' }, { title: 'نرم‌افزارها و دارایی‌های نامشهود' }] },
          ]
        },
        {
          title: 'بدهی‌های جاری', accountType: 1, accountNature: 2,
          totals: [
            { title: 'بدهی‌ها و پرداختنی‌ها', specifics: [{ title: 'حساب‌های پرداختنی' }, { title: 'پیش‌دریافت ارائه خدمات' }] },
          ]
        },
        {
          title: 'بدهی‌های غیرجاری', accountType: 1, accountNature: 2,
          totals: [
            { title: 'ذخایر و بدهی‌های بلندمدت', specifics: [{ title: 'ذخیره سنوات پرسنل' }] },
          ]
        },
        {
          title: 'حقوق صاحبان سهام', accountType: 1, accountNature: 2,
          totals: [
            { title: 'سرمایه و سود انباشته', specifics: [{ title: 'سرمایه شرکت' }, { title: 'سود (زیان) انباشته' }] },
          ]
        },
        {
          title: 'درآمدها', accountType: 2, accountNature: 2,
          totals: [
            { title: 'درآمد ارائه خدمات', specifics: [{ title: 'درآمد قراردادهای خدماتی' }, { title: 'درآمد مشاوره و پشتیبانی' }] },
          ]
        },
        {
          title: 'بهای تمام شده ارائه خدمات', accountType: 2, accountNature: 1,
          totals: [
            { title: 'هزینه‌های مستقیم خدمات', specifics: [{ title: 'حقوق و دستمزد کارشناسان ارائه خدمات' }, { title: 'هزینه‌های مستقیم پروژه‌های خدماتی' }] },
          ]
        },
        {
          title: 'هزینه‌های عمومی و اداری', accountType: 2, accountNature: 1,
          totals: [
            { title: 'هزینه‌های اداری و پشتیبانی', specifics: [{ title: 'حقوق پرسنل اداری' }, { title: 'هزینه اجاره و قبوض' }, { title: 'هزینه‌های مالی و کارمزد بانکی' }] },
          ]
        },
        {
          title: 'حساب‌های انتظامی', accountType: 3, accountNature: 7,
          totals: [
            { title: 'حساب‌های انتظامی', specifics: [{ title: 'ضمانت‌نامه‌های دریافتنی/پرداختنی' }] },
          ]
        },
      ];
    } else if (type === 4) {
      // 4-کدینگ پیمانکاری
      templateGroups = [
        {
          title: 'دارایی‌های جاری', accountType: 1, accountNature: 1,
          totals: [
            { title: 'نقد و بانک و تنخواه', specifics: [{ title: 'حساب‌های بانکی پروژه' }, { title: 'تنخواه‌گردان کارگاه‌ها' }] },
            { title: 'دریافتنی‌های پیمانکاری', specifics: [{ title: 'کارفرمایان - صورت وضعیت‌های ارسالی' }, { title: 'پیش‌پرداخت پیمان‌ها' }, { title: 'سپرده حسن انجام کار دریافتنی' }] },
            { title: 'پیمان‌های در دست اجرا', specifics: [{ title: 'بهای تمام شده انباشته پیمان‌ها' }] },
          ]
        },
        {
          title: 'دارایی‌های غیرجاری', accountType: 1, accountNature: 1,
          totals: [
            { title: 'ماشین‌آلات و تجهیزات پیمانکاری', specifics: [{ title: 'ماشین‌آلات سنگین و کارگاهی' }, { title: 'استهلاک انباشته ماشین‌آلات' }] },
          ]
        },
        {
          title: 'بدهی‌های جاری', accountType: 1, accountNature: 2,
          totals: [
            { title: 'پرداختنی‌های پیمانکاری', specifics: [{ title: 'پیمانکاران دست دوم' }, { title: 'پیش‌دریافت از کارفرمایان' }, { title: 'سپرده حسن انجام کار پرداختنی' }] },
          ]
        },
        {
          title: 'بدهی‌های غیرجاری', accountType: 1, accountNature: 2,
          totals: [
            { title: 'تسهیلات و ذخایر', specifics: [{ title: 'تسهیلات بانکی پروژه‌ها' }] },
          ]
        },
        {
          title: 'حقوق مالکانه', accountType: 1, accountNature: 2,
          totals: [
            { title: 'سرمایه شرکت', specifics: [{ title: 'سرمایه ثبتی' }] },
          ]
        },
        {
          title: 'درآمدها', accountType: 2, accountNature: 2,
          totals: [
            { title: 'درآمد پیمان‌ها', specifics: [{ title: 'درآمد تایید شده صورت وضعیت‌ها' }] },
          ]
        },
        {
          title: 'بهای تمام شده پیمان‌ها', accountType: 2, accountNature: 1,
          totals: [
            { title: 'هزینه‌های مستقیم کارگاه و پروژه', specifics: [{ title: 'مصالح و مواد مصرفی کارگاه' }, { title: 'دستمزد کارگران و پیمانکاران جزء' }, { title: 'هزینه اجاره و کارکرد ماشین‌آلات' }] },
          ]
        },
        {
          title: 'هزینه‌های دفتر مرکزی', accountType: 2, accountNature: 1,
          totals: [
            { title: 'هزینه‌های عمومی و اداری دفتر مرکزی', specifics: [{ title: 'حقوق پرسنل دفتر مرکزی' }, { title: 'هزینه‌های مناقصات و بازاریابی' }] },
          ]
        },
        {
          title: 'حساب‌های انتظامی', accountType: 3, accountNature: 7,
          totals: [
            { title: 'ضمانت‌نامه‌های پیمانکاری', specifics: [{ title: 'ضمانت‌نامه شرکت در مناقصه' }, { title: 'ضمانت‌نامه حسن انجام تعهدات' }] },
          ]
        },
      ];
    } else {
      // 5-کدینگ مبتنی بر صورتهای مالی بعد از 1398
      templateGroups = [
        {
          title: 'دارایی‌های جاری', accountType: 1, accountNature: 1,
          totals: [
            { title: 'موجودی نقد', specifics: [{ title: 'موجودی نزد بانک‌ها' }, { title: 'صندوق و تنخواه‌گردان' }] },
            { title: 'دریافتنی‌های تجاری و سایر دریافتنی‌ها', specifics: [{ title: 'دریافتنی‌های تجاری' }, { title: 'سایر دریافتنی‌ها' }] },
            { title: 'موجودی مواد و کالا', specifics: [{ title: 'موجودی مواد اولیه و قطعات' }, { title: 'موجودی کالای ساخت/بازرگانی' }] },
            { title: 'پیش‌پرداخت‌ها و سفارشات', specifics: [{ title: 'پیش‌پرداخت‌ها' }] },
          ]
        },
        {
          title: 'دارایی‌های غیرجاری', accountType: 1, accountNature: 1,
          totals: [
            { title: 'دارایی‌های ثابت مشهود', specifics: [{ title: 'زمین، ساختمان و تأسیسات' }, { title: 'استهلاک انباشته دارایی‌های ثابت' }] },
            { title: 'دارایی‌های نامشهود', specifics: [{ title: 'نرم‌افزارها و حق امتیازها' }] },
          ]
        },
        {
          title: 'بدهی‌های جاری', accountType: 1, accountNature: 2,
          totals: [
            { title: 'پرداختنی‌های تجاری و سایر پرداختنی‌ها', specifics: [{ title: 'پرداختنی‌های تجاری' }, { title: 'سایر پرداختنی‌ها' }] },
            { title: 'پیش‌دریافت‌ها', specifics: [{ title: 'پیش‌دریافت از مشتریان' }] },
          ]
        },
        {
          title: 'بدهی‌های غیرجاری', accountType: 1, accountNature: 2,
          totals: [
            { title: 'پرداختنی‌های بلندمدت', specifics: [{ title: 'تسهیلات مالی بلندمدت' }] },
            { title: 'ذخیره مزایای پایان خدمت کارکنان', specifics: [{ title: 'ذخیره سنوات' }] },
          ]
        },
        {
          title: 'حقوق مالکانه', accountType: 1, accountNature: 2,
          totals: [
            { title: 'سرمایه و اندوخته‌ها', specifics: [{ title: 'سرمایه' }, { title: 'اندوخته قانونی' }, { title: 'سود (زیان) انباشته' }] },
          ]
        },
        {
          title: 'درآمدهای عملیاتی', accountType: 2, accountNature: 2,
          totals: [
            { title: 'درآمدهای حاصل از فروش و ارائه خدمات', specifics: [{ title: 'درآمد عملیاتی اصلی' }, { title: 'تخفیفات و تعدیلات فروش' }] },
          ]
        },
        {
          title: 'بهای تمام شده درآمدهای عملیاتی', accountType: 2, accountNature: 1,
          totals: [
            { title: 'بهای تمام شده کالا و خدمات فروش رفته', specifics: [{ title: 'بهای تمام شده عملیاتی' }] },
          ]
        },
        {
          title: 'هزینه‌های فروش، اداری و عمومی', accountType: 2, accountNature: 1,
          totals: [
            { title: 'هزینه‌های فروش، اداری و عمومی', specifics: [{ title: 'هزینه‌های اداری و عمومی' }, { title: 'هزینه‌های فروش و توزیع' }, { title: 'هزینه‌های مالی' }] },
          ]
        },
        {
          title: 'حساب‌های انتظامی', accountType: 3, accountNature: 7,
          totals: [
            { title: 'حساب‌های انتظامی', specifics: [{ title: 'اسناد و وثایق انتظامی' }] },
          ]
        },
      ];
    }

    for (let gIdx = 0; gIdx < templateGroups.length; gIdx++) {
      const g = templateGroups[gIdx];
      const gCode = pad(gIdx + 1, group);

      const parentGroup = await this.accountRepository.create({
        code: gCode,
        title: g.title,
        accountType: g.accountType,
        accountNature: g.accountNature,
        isActive: true,
        parentId: root.id,
      });

      if (g.totals && g.totals.length > 0) {
        for (let tIdx = 0; tIdx < g.totals.length; tIdx++) {
          const t = g.totals[tIdx];
          const tCode = gCode + pad(tIdx + 1, total);

          const parentTotal = await this.accountRepository.create({
            code: tCode,
            title: t.title,
            accountType: g.accountType,
            accountNature: g.accountNature,
            isActive: true,
            parentId: parentGroup.id,
          });

          if (t.specifics && t.specifics.length > 0) {
            for (let sIdx = 0; sIdx < t.specifics.length; sIdx++) {
              const s = t.specifics[sIdx];
              const sCode = tCode + pad(sIdx + 1, specific);

              await this.accountRepository.create({
                code: sCode,
                title: s.title,
                accountType: g.accountType,
                accountNature: g.accountNature,
                isActive: true,
                parentId: parentTotal.id,
              });
            }
          }
        }
      }
    }
  }

  async seedData() {
    const root = await this.accountRepository.findByCode('0');
    if (!root) {
      await this.accountRepository.create({
        code: '0',
        title: 'کدینگ حسابها',
        isActive: true,
      });
      console.log('AccountService: Created root account coding node');
    }
  }
}
