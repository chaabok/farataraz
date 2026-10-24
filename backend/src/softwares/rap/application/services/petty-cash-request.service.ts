import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { IPettyCashRequestRepository } from '../../domain/repositories/petty-cash-request.repository.interface';
import { CreatePettyCashRequestDto } from '../dtos/create-petty-cash-request.dto';
import { UpdatePettyCashRequestDto } from '../dtos/update-petty-cash-request.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { UsageCheckService } from '../../../../core/services/usage-check.service';
import momentJalaali from 'moment-jalaali';

@Injectable()
export class PettyCashRequestService {
  constructor(
    @Inject('IPettyCashRequestRepository')
    private readonly repository: IPettyCashRequestRepository,
    private readonly idGenerationService: IdGenerationService,
    private readonly requestContextService: RequestContextService,
    private readonly usageCheckService: UsageCheckService,
  ) {}

  async getNextNumbers(jalaliDateStr: string) {
    const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId()! > 1) ? this.requestContextService.getBusinessStructureId()! : 2;
    const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;
    
    let dateStr = jalaliDateStr;
    if (!dateStr) {
      dateStr = momentJalaali().format('jYYYY/jMM/jDD');
    }

    const docRes = await this.repository.calculateNextDocumentNumber(dateStr, businessStructureId, companyId);
    
    return {
      documentNumber: docRes.nextValue,
      isDocumentNumberAuto: docRes.numberingMethod === '2',
      error: docRes.error || null,
    };
  }

  async create(createDto: CreatePettyCashRequestDto) {
    const businessStructureId = this.requestContextService.getBusinessStructureId() || 2;
    const companyId = this.requestContextService.getCompanyId() || 2;
    const fiscalYearId = createDto.fiscalYearRef || this.requestContextService.getFiscalYearId() || 1;

    let dateStr = '';
    let requestDateObj: Date = new Date();
    
    if (createDto.requestDate) {
      if (typeof createDto.requestDate === 'string' && createDto.requestDate.includes('/')) {
        const m = momentJalaali(createDto.requestDate, 'jYYYY/jMM/jDD', true);
        if (m.isValid()) {
          dateStr = m.format('jYYYY/jMM/jDD');
          requestDateObj = m.toDate();
        } else {
          dateStr = momentJalaali(createDto.requestDate).format('jYYYY/jMM/jDD');
          requestDateObj = momentJalaali(createDto.requestDate).toDate();
        }
      } else {
        const m = momentJalaali(createDto.requestDate);
        dateStr = m.format('jYYYY/jMM/jDD');
        requestDateObj = m.toDate();
      }
    } else {
      dateStr = momentJalaali().format('jYYYY/jMM/jDD');
    }
    
    const docRes = await this.repository.calculateNextDocumentNumber(dateStr, businessStructureId, companyId);
    if (docRes.error) {
      throw new BadRequestException(docRes.error);
    }

    let requestNumber = createDto.requestNumber;
    if (docRes.numberingMethod === '2' || !requestNumber) {
      requestNumber = docRes.nextValue;
    }

    const newId = await this.idGenerationService.generateNextId('PettyCashRequests');

    const data = {
      ...createDto,
      pettyCashRequestId: newId,
      requestNumber,
      requestDate: requestDateObj,
      businessStructureRef: businessStructureId,
      companyRef: companyId,
      fiscalYearRef: fiscalYearId,
    };

    return this.repository.create(data);
  }

  async findAll(options: any) {
    const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId()! > 1) ? this.requestContextService.getBusinessStructureId()! : 2;
    const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;
    const filters = {
      ...options,
      businessStructureRef: businessStructureId,
      companyRef: companyId,
    };
    return this.repository.findAll(filters);
  }

  async findOne(id: number) {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`PettyCashRequest with ID ${id} not found`);
    }
    
    // Check context
    const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId()! > 1) ? this.requestContextService.getBusinessStructureId()! : 2;
    const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;
    if (entity.businessStructureRef !== businessStructureId && entity.businessStructureRef !== null) {
       // Check if it belongs to this structure or shared
       if (entity.companyRef !== companyId) {
          throw new NotFoundException(`PettyCashRequest with ID ${id} not found`);
       }
    }

    return entity;
  }

  async update(id: number, updateDto: UpdatePettyCashRequestDto) {
    const entity = await this.findOne(id); // Ensure it exists and belongs to context
    
    // Rule 15: Check usage for update if needed
    const usage = await this.usageCheckService.isRecordUsed('PettyCashRequest', id);
    if (usage.isUsed) {
      throw new ConflictException(`این درخواست در فرم ${usage.usedInEntity || usage.usedInTable} استفاده شده است و امکان ویرایش آن وجود ندارد.`);
    }

    const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId()! > 1) ? this.requestContextService.getBusinessStructureId()! : 2;
    const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;
    
    let dateStr = '';
    if (updateDto.requestDate) {
      if (typeof updateDto.requestDate === 'string' && updateDto.requestDate.includes('/')) {
        const m = momentJalaali(updateDto.requestDate, 'jYYYY/jMM/jDD', true);
        if (m.isValid()) {
          dateStr = m.format('jYYYY/jMM/jDD');
          updateDto.requestDate = m.toDate();
        } else {
          dateStr = momentJalaali(updateDto.requestDate).format('jYYYY/jMM/jDD');
          updateDto.requestDate = momentJalaali(updateDto.requestDate).toDate();
        }
      } else {
        const m = momentJalaali(updateDto.requestDate);
        dateStr = m.format('jYYYY/jMM/jDD');
        updateDto.requestDate = m.toDate();
      }
    } else if (entity.requestDate) {
      dateStr = momentJalaali(entity.requestDate).format('jYYYY/jMM/jDD');
    }

    const docRes = await this.repository.calculateNextDocumentNumber(dateStr, businessStructureId, companyId);
    if (docRes.numberingMethod === '2') {
       if (updateDto.requestNumber !== undefined) {
          updateDto.requestNumber = entity.requestNumber;
       }
    }

    return this.repository.update(id, updateDto);
  }

  async remove(id: number) {
    await this.findOne(id); // Ensure it exists and belongs to context
    
    // Rule 15: Check usage
    const usage = await this.usageCheckService.isRecordUsed('PettyCashRequest', id);
    if (usage.isUsed) {
      throw new ConflictException(`این درخواست در فرم ${usage.usedInEntity || usage.usedInTable} استفاده شده است و امکان حذف آن وجود ندارد.`);
    }

    return this.repository.delete(id);
  }
}
