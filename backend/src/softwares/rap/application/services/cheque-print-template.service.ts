import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { IChequePrintTemplateRepository, IChequePrintTemplateRepositoryToken } from '../../domain/repositories/cheque-print-template.repository.interface';
import { ChequePrintTemplate } from '../../domain/entities/cheque-print-template.entity';

@Injectable()
export class ChequePrintTemplateService {
  constructor(
    @Inject(IChequePrintTemplateRepositoryToken)
    private readonly repo: IChequePrintTemplateRepository,
  ) {}

  async create(createDto: any): Promise<ChequePrintTemplate> {
    return this.repo.create(createDto);
  }

  async update(id: number, updateDto: any): Promise<ChequePrintTemplate> {
    await this.findOne(id);
    await this.repo.update(id, updateDto);
    return this.findOne(id);
  }

  async findAll(): Promise<ChequePrintTemplate[]> {
    return this.repo.findAll();
  }

  async findWithPagination(params: any): Promise<{ items: ChequePrintTemplate[], total: number }> {
    const [items, total] = await this.repo.findAdvanced(params);
    return { items, total };
  }

  async findOne(id: number): Promise<ChequePrintTemplate> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw new NotFoundException(`ChequePrintTemplate with ID ${id} not found`);
    }
    return item;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
