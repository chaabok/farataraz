import { OtherDetails } from '../entities/other-details.entity';

export interface IOtherDetailsRepository {
  create(data: Partial<OtherDetails>): Promise<OtherDetails>;
  update(id: number, data: Partial<OtherDetails>): Promise<OtherDetails>;
  findAll(): Promise<OtherDetails[]>;
  findWithPagination(skip: number, take: number): Promise<[OtherDetails[], number]>;
  findAdvanced(params: any): Promise<[OtherDetails[], number]>;
  findById(id: number): Promise<OtherDetails | null>;
  delete(id: number): Promise<void>;
  checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
}

export const IOtherDetailsRepositoryToken = Symbol('IOtherDetailsRepository');
