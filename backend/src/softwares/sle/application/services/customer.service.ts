import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ICustomerRepository, ICustomerRepositoryToken } from '../../domain/repositories/customer.repository.interface';
import { Customer } from '../../domain/entities/customer.entity';
import { CreateCustomerDto, UpdateCustomerDto } from '../dtos/create-customer.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { PartyService } from '../../../common/application/services/party.service';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(ICustomerRepositoryToken)
    private readonly repository: ICustomerRepository,
    private readonly idGenerationService: IdGenerationService,
    private readonly requestContextService: RequestContextService,
    private readonly partyService: PartyService,
  ) {}

  private async getScope() {
    let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
    let compId = this.requestContextService.getCompanyId() ?? 2;
    if (bsId <= 1) bsId = 2;
    if (compId <= 1) compId = 2;
    let isShared = true;

    try {
      const rows = await this.repository.manager.connection.query(
        `SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`,
        [bsId]
      );
      if (rows && rows.length > 0) {
        if (rows.some((r: any) => {
          const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
          return val === false || val === 0 || val === 'false' || val === null;
        })) {
          isShared = false;
        }
      } else {
        isShared = false;
      }
    } catch (err) {
      isShared = false;
    }

    return { bsId, compId, isShared };
  }

  async findAll(): Promise<Customer[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where = isShared ? { BusinessStructureRef: bsId } : { CompanyRef: compId };
    return this.repository.findAll({ where });
  }

  async findById(id: number): Promise<Customer> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return item;
  }

  async getNextCode(): Promise<{ code: string }> {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.repository.manager.createQueryBuilder(Customer, 'c');
    if (isShared) {
      qb.andWhere('c.BusinessStructureRef = :bsId', { bsId });
    } else {
      qb.andWhere('c.CompanyRef = :compId', { compId });
    }
    const maxResult = await qb.select('MAX(c.Code)', 'max').getRawOne();
    const max = maxResult?.max ? parseInt(maxResult.max, 10) || 0 : 0;
    return { code: String(max + 1) };
  }

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const { bsId, compId, isShared } = await this.getScope();
    const userId = this.requestContextService.getUserId() || 1;

    if (!dto.Code) {
      const next = await this.getNextCode();
      dto.Code = next.code;
    }

    if (!dto.PartyRef) {
      throw new BadRequestException('انتخاب طرف حساب (مشتری) الزامی است.');
    }

    const existingCustomer = await this.repository.manager.findOne(Customer, {
      where: { PartyRef: Number(dto.PartyRef) },
    });
    if (existingCustomer) {
      throw new BadRequestException('این طرف حساب قبلاً به عنوان مشتری ثبت شده است.');
    }

    if (!dto.SalesTypes || (Array.isArray(dto.SalesTypes) && dto.SalesTypes.length === 0)) {
      throw new BadRequestException('نوع فروش الزامی است.');
    }
    if (!dto.CurrencyRef) {
      throw new BadRequestException('انتخاب ارز الزامی است.');
    }

    const id = dto.CustomerID || (await this.idGenerationService.generateNextId('Customers'));

    const entity = this.repository.manager.create(Customer, {
      CustomerID: id,
      Code: String(dto.Code),
      CustomerType: dto.CustomerType !== undefined ? Number(dto.CustomerType) : 1,
      PartyRef: dto.PartyRef ? Number(dto.PartyRef) : null,
      CustomerGroupRef: dto.CustomerGroupRef ? Number(dto.CustomerGroupRef) : null,
      SalesChannels: typeof dto.SalesChannels === 'object' ? JSON.stringify(dto.SalesChannels) : dto.SalesChannels,
      SalesStatus: dto.SalesStatus !== undefined ? Number(dto.SalesStatus) : 1,
      SalesIntermediaryRef: dto.SalesIntermediaryRef ? Number(dto.SalesIntermediaryRef) : null,
      SalesTypes: typeof dto.SalesTypes === 'object' ? JSON.stringify(dto.SalesTypes) : dto.SalesTypes,
      CurrencyRef: dto.CurrencyRef ? Number(dto.CurrencyRef) : null,
      IsActive: dto.IsActive !== undefined ? dto.IsActive : true,
      CreatorRef: userId,
      CreationDate: new Date(),
      LastModifierRef: userId,
      LastModificationDate: new Date(),
      CompanyRef: compId,
      BusinessStructureRef: bsId,
    });

    const savedCustomer = await this.repository.create(entity);

    if (dto.PartyRef && (dto.PartyPhones || dto.partyPhones || dto.PartyAddresses || dto.partyAddresses)) {
      await this.partyService.update(Number(dto.PartyRef), {
        PartyPhones: dto.PartyPhones || dto.partyPhones,
        PartyAddresses: dto.PartyAddresses || dto.partyAddresses,
      }).catch(() => {});
    }

    return savedCustomer;
  }

  async update(id: number, dto: UpdateCustomerDto): Promise<Customer> {
    const existing = await this.findById(id);
    const userId = this.requestContextService.getUserId() || 1;

    const partyRefToCheck = dto.PartyRef !== undefined ? (dto.PartyRef ? Number(dto.PartyRef) : null) : existing.PartyRef;
    if (partyRefToCheck) {
      const existingCustomer = await this.repository.manager.findOne(Customer, {
        where: { PartyRef: partyRefToCheck },
      });
      if (existingCustomer && Number(existingCustomer.CustomerID) !== Number(id)) {
        throw new BadRequestException('این طرف حساب قبلاً به عنوان مشتری ثبت شده است.');
      }
    }

    const updateData: Partial<Customer> = {
      Code: dto.Code !== undefined ? String(dto.Code) : existing.Code,
      CustomerType: dto.CustomerType !== undefined ? Number(dto.CustomerType) : existing.CustomerType,
      PartyRef: dto.PartyRef !== undefined ? (dto.PartyRef ? Number(dto.PartyRef) : null) : existing.PartyRef,
      CustomerGroupRef: dto.CustomerGroupRef !== undefined ? (dto.CustomerGroupRef ? Number(dto.CustomerGroupRef) : null) : existing.CustomerGroupRef,
      SalesChannels: dto.SalesChannels !== undefined ? (typeof dto.SalesChannels === 'object' ? JSON.stringify(dto.SalesChannels) : dto.SalesChannels) : existing.SalesChannels,
      SalesStatus: dto.SalesStatus !== undefined ? Number(dto.SalesStatus) : existing.SalesStatus,
      SalesIntermediaryRef: dto.SalesIntermediaryRef !== undefined ? (dto.SalesIntermediaryRef ? Number(dto.SalesIntermediaryRef) : null) : existing.SalesIntermediaryRef,
      SalesTypes: dto.SalesTypes !== undefined ? (typeof dto.SalesTypes === 'object' ? JSON.stringify(dto.SalesTypes) : dto.SalesTypes) : existing.SalesTypes,
      CurrencyRef: dto.CurrencyRef !== undefined ? (dto.CurrencyRef ? Number(dto.CurrencyRef) : null) : existing.CurrencyRef,
      IsActive: dto.IsActive !== undefined ? dto.IsActive : existing.IsActive,
      LastModifierRef: userId,
      LastModificationDate: new Date(),
    };

    const updatedCustomer = await this.repository.update(id, updateData);

    if (partyRefToCheck && (dto.PartyPhones || dto.partyPhones || dto.PartyAddresses || dto.partyAddresses)) {
      await this.partyService.update(Number(partyRefToCheck), {
        PartyPhones: dto.PartyPhones || dto.partyPhones,
        PartyAddresses: dto.PartyAddresses || dto.partyAddresses,
      }).catch(() => {});
    }

    return updatedCustomer;
  }

  async remove(id: number): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }
}
