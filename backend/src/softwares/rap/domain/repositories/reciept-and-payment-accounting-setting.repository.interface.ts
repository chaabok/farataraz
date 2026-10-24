import { RecieptAndPaymentAccountingSetting } from '../entities/reciept-and-payment-accounting-setting.entity';

export interface IRecieptAndPaymentAccountingSettingRepository {
  create(entity: RecieptAndPaymentAccountingSetting): Promise<RecieptAndPaymentAccountingSetting>;
  update(entity: RecieptAndPaymentAccountingSetting): Promise<RecieptAndPaymentAccountingSetting>;
  delete(id: number): Promise<void>;
  findById(id: number): Promise<RecieptAndPaymentAccountingSetting | null>;
  findAll(options?: any): Promise<{items: RecieptAndPaymentAccountingSetting[], total: number}>;
  findByCode(code: string): Promise<RecieptAndPaymentAccountingSetting | null>;
  calculateNextCode(businessStructureId: number, companyId: number): Promise<{ numberingMethod: string; nextValue: string; error?: string }>;
}

export const IRecieptAndPaymentAccountingSettingRepositoryToken = Symbol('IRecieptAndPaymentAccountingSettingRepository');
