import { RapReason } from '../entities/rap-reason.entity';

export interface IRapReasonRepository {
  create(data: Partial<RapReason>): Promise<RapReason>;
  findAll(authContext: { businessStructureId: number; companyId: number }, isBasicInfoShared: boolean): Promise<RapReason[]>;
  findById(id: number, authContext: { businessStructureId: number; companyId: number }, isBasicInfoShared: boolean): Promise<RapReason | null>;
  update(id: number, data: Partial<RapReason>): Promise<RapReason>;
  delete(id: number): Promise<void>;
}
export const IRapReasonRepositoryToken = Symbol('IRapReasonRepository');
