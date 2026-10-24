import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { IFiscalYearRepository } from '../../domain/repositories/fiscal-year.repository.interface';
import { CreateFiscalYearDto } from '../dtos/create-fiscal-year.dto';
import { UpdateFiscalYearDto } from '../dtos/update-fiscal-year.dto';

@Injectable()
export class FiscalYearService {
  constructor(
    @Inject('IFiscalYearRepository')
    private readonly repository: IFiscalYearRepository,
  ) {}

  private validateDates(startDate: Date, endDate: Date) {
    if (endDate < startDate) {
      throw new BadRequestException('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.');
    }
    const utc1 = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
    const utc2 = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());
    const diffDays = Math.round(Math.abs(utc2 - utc1) / (1000 * 60 * 60 * 24));
    
    // max 366 days
    if (diffDays > 366) {
      throw new BadRequestException('بازه سال مالی نمی‌تواند بیشتر از 366 روز باشد.');
    }
  }

  async checkDuplicateTitle(title: string, excludeId?: number) {
    if (!title) return { isDuplicate: false };
    const existing = await this.repository.findByTitle(title);
    if (existing && (!excludeId || existing.fiscalYearID !== excludeId)) {
      return { isDuplicate: true };
    }
    return { isDuplicate: false };
  }

  async create(data: CreateFiscalYearDto, companyId: number = 2, branchId?: number, agencyId?: number) {
    if (data.title) {
      const existing = await this.repository.findByTitle(data.title);
      if (existing) {
        throw new BadRequestException(`سال مالی با عنوان ${data.title} از قبل وجود دارد.`);
      }
    }
    
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    
    this.validateDates(start, end);

    const entityData: any = {
      ...data,
      companyRef: companyId,
      startDate: start,
      endDate: end,
    };
    if (branchId !== undefined) entityData.branchRef = branchId;
    if (agencyId !== undefined) entityData.agencyRef = agencyId;
    
    return this.repository.create(entityData);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findWithPagination(params: {
    pageIndex: number;
    pageSize: number;
    sorting?: string;
    columnFilters?: string;
    globalFilter?: string;
    advancedFilters?: string;
  }) {
    const [items, total] = await this.repository.findAdvanced(params);
    return { items, total };
  }

  async findOne(id: number) {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException(`Fiscal year with ID ${id} not found`);
    }
    return item;
  }

  async findByTitle(title: string) {
    return this.repository.findByTitle(title);
  }

  async update(id: number, data: UpdateFiscalYearDto, companyId: number = 2, branchId?: number, agencyId?: number) {
    const item = await this.findOne(id);

    if (data.title) {
      const existing = await this.repository.findByTitle(data.title);
      if (existing && existing.fiscalYearID !== id) {
        throw new BadRequestException(`سال مالی با عنوان ${data.title} از قبل وجود دارد.`);
      }
    }
    
    const start = data.startDate ? new Date(data.startDate) : new Date(item.startDate);
    const end = data.endDate ? new Date(data.endDate) : new Date(item.endDate);
    
    if (data.startDate || data.endDate) {
      this.validateDates(start, end);
    }
    
    const entityData: any = { ...data };
    if (data.startDate) entityData.startDate = start;
    if (data.endDate) entityData.endDate = end;
    if (branchId !== undefined) entityData.branchRef = branchId;
    if (agencyId !== undefined) entityData.agencyRef = agencyId;
    
    return this.repository.update(id, entityData);
  }

  async remove(id: number) {
    return this.repository.delete(id);
  }
}
