import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IPromissoryNoteRepository, IPromissoryNoteRepositoryToken } from '../../domain/repositories/promissory-note.repository.interface';
import { CreatePromissoryNoteDto } from '../dtos/create-promissory-note.dto';

@Injectable()
export class PromissoryNoteService {
  constructor(
    @Inject(IPromissoryNoteRepositoryToken)
    private readonly repository: IPromissoryNoteRepository,
  ) {}

  async findAll() {
    return this.repository.findAll();
  }

  async findWithPagination(params: any) {
    if (this.repository.findWithPagination) {
      return this.repository.findWithPagination(params);
    }
    // Fallback if not implemented in repository
    return { data: await this.repository.findAll(), total: 0 };
  }
  
  async findOne(id: number) {
    const note = await this.repository.findById(id);
    if (!note) {
      throw new NotFoundException(`PromissoryNote with ID ${id} not found`);
    }
    return { data: note };
  }

  async findUnusedItems() {
    if ((this.repository as any).findUnusedItems) {
      return (this.repository as any).findUnusedItems();
    }
    return [];
  }

  async create(data: CreatePromissoryNoteDto) {
    return this.repository.create(data as any);
  }
  
  async update(id: number, data: any) {
    return this.repository.update(id, data);
  }
  
  async remove(id: number) {
    return this.repository.delete(id);
  }
}
