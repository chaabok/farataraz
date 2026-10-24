import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IBankReconciliationRepositoryToken, IBankReconciliationRepository } from '../../domain/repositories/bank-reconciliation.repository.interface';
import { CreateBankReconciliationDto } from '../dtos/create-bank-reconciliation.dto';
import { UpdateBankReconciliationDto } from '../dtos/update-bank-reconciliation.dto';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { BankReconciliationItem } from '../../domain/entities/bank-reconciliation-item.entity';

@Injectable()
export class BankReconciliationService {
  constructor(
    @Inject(IBankReconciliationRepositoryToken)
    private readonly bankReconciliationRepository: IBankReconciliationRepository,
    private readonly requestContextService: RequestContextService,
    private readonly idGenerationService: IdGenerationService,
  ) {}

  async getNextNumbers(jalaliDateStr: string) {
    const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;
    const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId()! > 1) ? this.requestContextService.getBusinessStructureId()! : 2;
    
    const docRes = await this.bankReconciliationRepository.calculateNextDocumentNumber(jalaliDateStr, businessStructureId, companyId);
    return {
      isDocumentNumberAuto: docRes.numberingMethod === '2',
      documentNumber: docRes.nextValue,
      error: docRes.error,
    };
  }

  async create(createDto: CreateBankReconciliationDto) {
    const companyId = this.requestContextService.getCompanyId() || 2;
    const businessStructureId = this.requestContextService.getBusinessStructureId() || 2;
    const id = await this.idGenerationService.generateNextId('BankReconciliation');

    let Number = createDto.Number;
    if (!Number) {
      Number = id.toString();
    }

    const items = [];
    if (createDto.items) {
      for (const itemDto of createDto.items) {
        const itemId = await this.idGenerationService.generateNextId('BankReconciliationItem');
        const item = new BankReconciliationItem();
        item.BankReconciliationItemID = itemId;
        item.BankStatementItemRef = itemDto.BankStatementItemRef;
        item.BookItemRef = itemDto.BookItemRef;
        item.matchId = itemDto.matchId;
        item.companyRef = companyId;
        item.businessStructureRef = businessStructureId;
        item.BankReconciliationRef = id;
        items.push(item);
      }
    }

    const entity = this.bankReconciliationRepository.create({
      ...createDto,
      Number,
      BankReconciliationID: id,
      items,
      companyRef: companyId,
      businessStructureRef: businessStructureId,
    });

    return this.bankReconciliationRepository.save(entity);
  }

  async findAll() {
    const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;
    const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId()! > 1) ? this.requestContextService.getBusinessStructureId()! : 2;
    return this.bankReconciliationRepository.find({
      where: {
        companyRef: companyId,
        businessStructureRef: businessStructureId,
      },
      relations: ['bankAccount', 'bankStatement', 'items'],
    });
  }

  async findOne(id: number) {
    const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;
    const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId()! > 1) ? this.requestContextService.getBusinessStructureId()! : 2;
    const entity = await this.bankReconciliationRepository.findOne({
      where: {
        BankReconciliationID: id,
        companyRef: companyId,
        businessStructureRef: businessStructureId,
      },
      relations: ['bankAccount', 'bankStatement', 'items'],
    });
    if (!entity) throw new NotFoundException('BankReconciliation not found');
    return entity;
  }

  async update(id: number, updateDto: UpdateBankReconciliationDto) {
    const entity = await this.findOne(id);
    const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;
    const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId()! > 1) ? this.requestContextService.getBusinessStructureId()! : 2;

    if (updateDto.items) {
      const items = [];
      for (const itemDto of updateDto.items) {
        const itemId = await this.idGenerationService.generateNextId('BankReconciliationItem');
        const item = new BankReconciliationItem();
        item.BankReconciliationItemID = itemId;
        item.BankStatementItemRef = itemDto.BankStatementItemRef;
        item.BookItemRef = itemDto.BookItemRef;
        item.matchId = itemDto.matchId;
        item.companyRef = companyId;
        item.businessStructureRef = businessStructureId;
        item.BankReconciliationRef = id;
        items.push(item);
      }
      entity.items = items;
    }

    Object.assign(entity, {
      ...updateDto,
      items: entity.items,
    });

    return this.bankReconciliationRepository.save(entity);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    return this.bankReconciliationRepository.remove(entity);
  }
}
