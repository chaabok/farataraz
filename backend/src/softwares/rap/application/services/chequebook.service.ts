import { Injectable, Inject } from '@nestjs/common';
import { IChequebookRepository, IChequebookRepositoryToken } from '../../domain/repositories/chequebook.repository.interface';
import { CreateChequebookDto } from '../dtos/create-chequebook.dto';
import { UpdateChequebookDto } from '../dtos/update-chequebook.dto';
import { Chequebook } from '../../domain/entities/chequebook.entity';
import { ChequebookItem } from '../../domain/entities/chequebook-item.entity';
import { ActivityLogService } from '../../../../core/services/activity-log.service';

@Injectable()
export class ChequebookService {
  constructor(
    @Inject(IChequebookRepositoryToken)
    private readonly chequebookRepository: IChequebookRepository,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async create(createDto: CreateChequebookDto): Promise<Chequebook> {
    const chequebook = new Chequebook();
    Object.assign(chequebook, createDto);

    if (!chequebook.items || chequebook.items.length === 0) {
      chequebook.items = Array.from({ length: chequebook.leafCount }).map((_, idx) => {
        const item = new ChequebookItem();
        item.checkNumber = Number(chequebook.startSerial) + idx;
        return item;
      });
    } else {
      chequebook.items = chequebook.items.map(dto => {
        const item = new ChequebookItem();
        Object.assign(item, dto);
        return item;
      });
    }

    const created = await this.chequebookRepository.create(chequebook);
    this.activityLogService.logActionAsync({
      action: 'Create',
      entityName: 'Rap.Chequebooks',
      entityId: created.chequebookId ? created.chequebookId.toString() : '',
      newValues: created
    });
    return created;
  }

  async update(id: number, updateDto: UpdateChequebookDto): Promise<Chequebook> {
    let newItems = undefined;
    if (updateDto.items) {
      newItems = updateDto.items.map(dto => {
        const item = new ChequebookItem();
        Object.assign(item, dto);
        return item;
      });
    }

    const payload: Partial<Chequebook> = { ...updateDto } as Partial<Chequebook>;
    if (newItems) {
       payload.items = newItems;
    }

    const updated = await this.chequebookRepository.update(id, payload);
    this.activityLogService.logActionAsync({
      action: 'Update',
      entityName: 'Rap.Chequebooks',
      entityId: id.toString(),
      newValues: updated
    });
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.chequebookRepository.delete(id);
    this.activityLogService.logActionAsync({
      action: 'Delete',
      entityName: 'Rap.Chequebooks',
      entityId: id.toString()
    });
  }

  async findById(id: number): Promise<Chequebook | null> {
    return this.chequebookRepository.findById(id);
  }

  async findAll(options?: any): Promise<{items: Chequebook[], total: number}> {
    return this.chequebookRepository.findAll(options);
  }
}
