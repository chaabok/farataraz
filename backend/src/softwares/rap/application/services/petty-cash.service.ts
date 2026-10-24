import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IPettyCashRepository } from '../../domain/repositories/petty-cash.repository.interface';
import { CreatePettyCashDto } from '../dtos/create-petty-cash.dto';
import { UpdatePettyCashDto } from '../dtos/update-petty-cash.dto';
import { PettyCash } from '../../domain/entities/petty-cash.entity';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class PettyCashService {
  constructor(
    @Inject('IPettyCashRepository') private readonly repository: IPettyCashRepository,
    private readonly idService: IdGenerationService,
    private readonly requestContext: RequestContextService,
  ) {}

  async findAll(): Promise<PettyCash[]> {
    const companyId = (this.requestContext.getCompanyId() && this.requestContext.getCompanyId()! > 1) ? this.requestContext.getCompanyId()! : 2;
    const businessStructureId = (this.requestContext.getBusinessStructureId() && this.requestContext.getBusinessStructureId()! > 1) ? this.requestContext.getBusinessStructureId()! : 2;
    const fiscalYearId = this.requestContext.getFiscalYearId() || 1;
    return this.repository.findAll(companyId, businessStructureId, fiscalYearId);
  }

  async findOne(id: number): Promise<PettyCash> {
    const fiscalYearId = this.requestContext.getFiscalYearId() || 1;
    const entity = await this.repository.findById(id, fiscalYearId);
    if (!entity) throw new NotFoundException('PettyCash not found');
    return entity;
  }

  async create(dto: CreatePettyCashDto): Promise<PettyCash> {
    const companyId = this.requestContext.getCompanyId() || 2;
    const businessStructureId = this.requestContext.getBusinessStructureId() || 2;
    const userId = this.requestContext.getUserId() || 1;
    const entity = new PettyCash();
    const id = await this.idService.generateNextId('PettyCash');
    
    Object.assign(entity, dto);
    
    entity.pettyCashId = id;
    entity.companyRef = companyId;
    entity.businessStructureRef = businessStructureId;
    entity.creator = userId;
    entity.lastModifier = userId;

    return this.repository.create(entity);
  }

  async update(id: number, dto: UpdatePettyCashDto): Promise<PettyCash> {
    const entity = await this.findOne(id);
    const userId = this.requestContext.getUserId() || 1;

    Object.assign(entity, dto);
    if(dto.openingDate) {
        entity.openingDate = new Date(dto.openingDate);
    }
    
    entity.lastModifier = userId;

    return this.repository.update(entity);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repository.delete(id);
  }

  async isUsed(id: number): Promise<boolean> {
    return this.repository.isUsed(id);
  }
}
