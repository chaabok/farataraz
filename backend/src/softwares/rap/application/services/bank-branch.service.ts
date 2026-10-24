import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { IBankBranchRepository, IBankBranchRepositoryToken } from '../../domain/repositories/bank-branch.repository.interface';
import { BankBranch } from '../../domain/entities/bank-branch.entity';
import { CreateBankBranchDto } from '../dtos/create-bank-branch.dto';
import { UpdateBankBranchDto } from '../dtos/update-bank-branch.dto';

@Injectable()
export class BankBranchService {
  constructor(
    @Inject(IBankBranchRepositoryToken)
    private readonly bankBranchRepository: IBankBranchRepository,
  ) {}

  async create(createDto: CreateBankBranchDto): Promise<BankBranch> {
    await this.validateDuplicates(createDto);
    return this.bankBranchRepository.create(createDto);
  }

  async update(id: number, updateDto: UpdateBankBranchDto): Promise<BankBranch> {
    const existing = await this.findOne(id);
    await this.validateDuplicates(updateDto, id);
    await this.bankBranchRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async findAll(): Promise<BankBranch[]> {
    return this.bankBranchRepository.findAll();
  }

  async findWithPagination(params: any): Promise<{ items: BankBranch[], total: number }> {
    const [items, total] = await this.bankBranchRepository.findAdvanced(params);
    return { items, total };
  }

  async findOne(id: number): Promise<BankBranch> {
    const item = await this.bankBranchRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Bank branch with ID ${id} not found`);
    }
    return item;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.bankBranchRepository.delete(id);
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    return this.bankBranchRepository.checkDuplicate(field, value, excludeId);
  }

  private async validateDuplicates(dto: Partial<CreateBankBranchDto | UpdateBankBranchDto>, excludeId?: number) {
    if (dto.title !== undefined) {
      const isDuplicateTitle = await this.checkDuplicate('title', dto.title, excludeId);
      if (isDuplicateTitle) {
        throw new BadRequestException('عنوان شعبه تکراری است');
      }
    }
  }
}
