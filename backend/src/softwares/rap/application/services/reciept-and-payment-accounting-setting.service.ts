import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IRecieptAndPaymentAccountingSettingRepository, IRecieptAndPaymentAccountingSettingRepositoryToken } from '../../domain/repositories/reciept-and-payment-accounting-setting.repository.interface';
import { CreateRecieptAndPaymentAccountingSettingDto } from '../dtos/create-reciept-and-payment-accounting-setting.dto';
import { UpdateRecieptAndPaymentAccountingSettingDto } from '../dtos/update-reciept-and-payment-accounting-setting.dto';
import { RecieptAndPaymentAccountingSetting } from '../../domain/entities/reciept-and-payment-accounting-setting.entity';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { DataSource } from 'typeorm';

@Injectable()
export class RecieptAndPaymentAccountingSettingService {
  constructor(
    @Inject(IRecieptAndPaymentAccountingSettingRepositoryToken)
    private readonly repository: IRecieptAndPaymentAccountingSettingRepository,
    private readonly idGenerationService: IdGenerationService,
    private readonly requestContextService: RequestContextService,
    private readonly dataSource: DataSource,
  ) {}

  private async isBasicInfoShared(businessStructureId: number): Promise<boolean> {
      const q = `SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`;
      const rows = await this.dataSource.query(q, [businessStructureId]);
      if (rows && rows.length > 0) {
        if (rows.some((r: any) => {
          const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
          return val === false || val === 0 || val === 'false' || val === null;
        })) {
          return false;
        }
        return true;
      }
      return false;
  }

  async getNextNumber(): Promise<{ documentNumber: string, isDocumentNumberAuto: boolean, error?: string }> {
    const bsRef = this.requestContextService.getBusinessStructureId() || 2;
    const compRef = this.requestContextService.getCompanyId() || 2;
    
    const res = await this.repository.calculateNextCode(bsRef, compRef);
    
    return {
      documentNumber: res.nextValue,
      isDocumentNumberAuto: res.numberingMethod === '2',
      error: res.error,
    };
  }

  async create(createDto: CreateRecieptAndPaymentAccountingSettingDto): Promise<RecieptAndPaymentAccountingSetting> {
    const setting = new RecieptAndPaymentAccountingSetting();
    Object.assign(setting, createDto);

    const bsRef = this.requestContextService.getBusinessStructureId() || 2;
    const compRef = this.requestContextService.getCompanyId() || 2;
    const isShared = await this.isBasicInfoShared(bsRef);

    let codeToSave = setting.code;
    const docRes = await this.repository.calculateNextCode(bsRef, compRef);
    
    // Auto numbering
    if (docRes.numberingMethod === '2' || !codeToSave) {
      if (docRes.error) {
        throw new Error(docRes.error);
      }
      codeToSave = docRes.nextValue;
    }

    setting.code = codeToSave;

    // Check for uniqueness (Rule 1)
    if (setting.code) {
      const existing = await this.repository.findByCode(setting.code);
      if (existing) {
         throw new Error("RecieptAndPaymentAccountingSetting with this code already exists in the current scope.");
      }
    }

    setting.recieptAndPaymentAccountingSettingId = await this.idGenerationService.generateNextId('RecieptAndPaymentAccountingSetting');

    setting.businessStructureRef = bsRef;
    setting.companyRef = compRef;
    
    // Subscriber handles audit logging automatically
    return await this.repository.create(setting);
  }

  async update(id: number, updateDto: UpdateRecieptAndPaymentAccountingSettingDto): Promise<RecieptAndPaymentAccountingSetting> {
    const setting = await this.repository.findById(id);
    if (!setting) {
      throw new NotFoundException(`RecieptAndPaymentAccountingSetting with ID ${id} not found`);
    }

    Object.assign(setting, updateDto);
    return await this.repository.update(setting);
  }

  async delete(id: number): Promise<void> {
    const setting = await this.repository.findById(id);
    if (!setting) {
      throw new NotFoundException(`RecieptAndPaymentAccountingSetting with ID ${id} not found`);
    }
    await this.repository.delete(id);
  }

  async findById(id: number): Promise<RecieptAndPaymentAccountingSetting> {
    const setting = await this.repository.findById(id);
    if (!setting) {
      throw new NotFoundException(`RecieptAndPaymentAccountingSetting with ID ${id} not found`);
    }
    return setting;
  }

  async findAll(options?: any): Promise<{ items: RecieptAndPaymentAccountingSetting[], total: number }> {
    return await this.repository.findAll(options);
  }
}

