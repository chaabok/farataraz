import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { OtherDetails } from '../../domain/entities/other-details.entity';
import { CreateOtherDetailsDto } from '../dtos/create-other-details.dto';
import { UpdateOtherDetailsDto } from '../dtos/update-other-details.dto';
import { IOtherDetailsRepository, IOtherDetailsRepositoryToken } from '../../domain/repositories/other-details.repository.interface';

@Injectable()
export class OtherDetailsService {
  constructor(
    @Inject(IOtherDetailsRepositoryToken)
    private readonly otherDetailsRepository: IOtherDetailsRepository,
  ) {}

  async create(createDto: CreateOtherDetailsDto, companyId: number = 2, branchId?: number, agencyId?: number): Promise<OtherDetails> {
    if (companyId <= 1) companyId = 2;
    const data: any = { ...createDto, businessStructureRef: companyId, companyRef: companyId };
    if (branchId !== undefined) data.branchRef = branchId;
    if (agencyId !== undefined) data.agencyRef = agencyId;
    return this.otherDetailsRepository.create(data);
  }

  async update(id: number, updateDto: UpdateOtherDetailsDto, companyId: number = 2, branchId?: number, agencyId?: number): Promise<OtherDetails> {
    if (companyId <= 1) companyId = 2;
    await this.findOne(id); // check existence
    const data: any = { ...updateDto, businessStructureRef: companyId, companyRef: companyId };
    if (branchId !== undefined) data.branchRef = branchId;
    if (agencyId !== undefined) data.agencyRef = agencyId;
    return this.otherDetailsRepository.update(id, data);
  }

  async findAll(): Promise<OtherDetails[]> {
    return this.otherDetailsRepository.findAll();
  }

  async findWithPagination(params: {
    pageIndex: number;
    pageSize: number;
    sorting?: string;
    columnFilters?: string;
    globalFilter?: string;
    advancedFilters?: string;
  }): Promise<{ items: OtherDetails[], total: number }> {
    const [items, total] = await this.otherDetailsRepository.findAdvanced(params);
    return { items, total };
  }

  async findOne(id: number): Promise<OtherDetails> {
    const type = await this.otherDetailsRepository.findById(id);
    if (!type) {
      throw new NotFoundException(`OtherDetails with ID ${id} not found`);
    }
    return type;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // will throw 404 if not found
    await this.otherDetailsRepository.delete(id);
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    return this.otherDetailsRepository.checkDuplicate(field, value, excludeId);
  }
}
