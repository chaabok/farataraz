import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesDocumentSettings } from '../../domain/entities/sales-document-settings.entity';
import { ISalesDocumentSettingsRepository } from '../../domain/repositories/sales-document-settings.repository.interface';

@Injectable()
export class SalesDocumentSettingsRepository implements ISalesDocumentSettingsRepository {
  constructor(
    @InjectRepository(SalesDocumentSettings)
    private readonly repo: Repository<SalesDocumentSettings>,
  ) {}

  get manager() {
    return this.repo.manager;
  }

  async findAll(options?: any): Promise<SalesDocumentSettings[]> {
    return this.repo.find(options);
  }

  async findById(id: number): Promise<SalesDocumentSettings | null> {
    return this.repo.findOne({ where: { SalesDocumentSettingsID: id } as any });
  }

  async findByType(type: number, businessStructureRef?: number): Promise<SalesDocumentSettings | null> {
    const where: any = { SalesDocumentType: type };
    if (businessStructureRef) {
      where.BusinessStructureRef = businessStructureRef;
    }
    return this.repo.findOne({ where });
  }

  async create(entity: SalesDocumentSettings): Promise<SalesDocumentSettings> {
    return this.repo.save(entity);
  }

  async update(id: number, attrs: Partial<SalesDocumentSettings>): Promise<SalesDocumentSettings> {
    await this.repo.update({ SalesDocumentSettingsID: id } as any, attrs);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`SalesDocumentSettings with ID ${id} not found after update`);
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete({ SalesDocumentSettingsID: id } as any);
  }
}
