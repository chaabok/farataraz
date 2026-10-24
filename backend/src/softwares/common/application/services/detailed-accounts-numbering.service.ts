import { Injectable, Inject } from '@nestjs/common';
import { IDetailedAccountsNumberingRepository, IDetailedAccountsNumberingRepositoryToken } from '../../domain/repositories/detailed-accounts-numbering.repository.interface';
import { DetailedAccountsNumbering } from '../../domain/entities/detailed-accounts-numbering.entity';
import { DetailedTypeService } from '../../../accounting/application/services/detailed-type.service';
import { DetailedAccountService } from '../../../accounting/application/services/detailed-account.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

export interface DetailedAccountsNumberingView {
  id: number;
  detailedTypesId: number;
  detailedTypeCode: string;
  detailedTypeTitle: string;
  isHeadquarterSelected: boolean;
  isCompanySelected: boolean;
  startNumber: number;
  endNumber: number;
}

@Injectable()
export class DetailedAccountsNumberingService {
  constructor(
    @Inject(IDetailedAccountsNumberingRepositoryToken)
    private readonly repo: IDetailedAccountsNumberingRepository,
    private readonly detailedTypeService: DetailedTypeService,
    private readonly detailedAccountService: DetailedAccountService,
    private readonly requestContextService: RequestContextService,
  ) {}

  async getViewList(): Promise<DetailedAccountsNumberingView[]> {
    const companyId = (this.requestContextService?.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;
    await this.detailedTypeService.seedForBusinessStructure(companyId);

    const types = await this.detailedTypeService.findAll();
    const settings = await this.repo.findAll();
    const settingsMap = new Map(settings.map(s => [s.detailedTypesId, s]));

    // Sort types by code so that the generated numbering is nicely ordered by code
    types.sort((a, b) => parseInt(a.code) - parseInt(b.code));

    let nextAvailableStartNumber = 1;
    // Calculate the maximum endNumber from existing settings to avoid overlapping when appending new ones
    settings.forEach(s => {
      if (s.endNumber >= nextAvailableStartNumber) {
        nextAvailableStartNumber = s.endNumber + 1;
      }
    });

    return types.map(type => {
      const existing = settingsMap.get(type.detailedTypesId);
      
      let defaultGap = 1000;
      if (type.title === 'اشخاص حقیقی' || type.title === 'اشخاص حقوقی') {
        defaultGap = 10000;
      }
      
      const startNumber = existing ? existing.startNumber : nextAvailableStartNumber;
      const endNumber = existing ? existing.endNumber : startNumber + defaultGap - 1;

      if (!existing) {
         nextAvailableStartNumber = endNumber + 1;
      }

      return {
        id: existing?.id,
        detailedTypesId: type.detailedTypesId,
        detailedTypeCode: type.code,
        detailedTypeTitle: type.title,
        isHeadquarterSelected: existing ? existing.isHeadquarterSelected : true,
        isCompanySelected: existing ? existing.isCompanySelected : false,
        startNumber,
        endNumber,
      } as DetailedAccountsNumberingView;
    });
  }

  async saveList(dataList: Partial<DetailedAccountsNumbering>[]): Promise<void> {
    for (const data of dataList) {
      if (data.detailedTypesId) {
        await this.repo.upsert(data.detailedTypesId, data);
      }
    }
  }

  async getNextCode(detailedTypesId: number): Promise<string> {
    const numberings = await this.getViewList();
    const numbering = numberings.find(n => n.detailedTypesId === detailedTypesId || n.detailedTypeCode === '13' || n.detailedTypesId === 13);
    
    let nextCodeInt = numbering ? numbering.startNumber : 1;
    
    const allDAs = await this.detailedAccountService.findAll();
    
    let targetDAs = allDAs;
    if (numbering) {
      targetDAs = allDAs.filter((da: any) => {
        const c = parseInt(da.code, 10);
        return !isNaN(c) && c >= numbering.startNumber && c <= numbering.endNumber;
      });
      if (targetDAs.length === 0) {
        targetDAs = allDAs.filter((da: any) => da.detailedTypesId === detailedTypesId || da.detailedTypesId === numbering.detailedTypesId || !da.detailedTypesId);
      }
    }

    if (targetDAs.length > 0) {
      let maxCodeInt = numbering ? numbering.startNumber - 1 : 0;
      targetDAs.forEach((da: any) => {
          const c = parseInt(da.code, 10);
          if (!isNaN(c) && c > maxCodeInt) {
              maxCodeInt = c;
          }
      });
      nextCodeInt = maxCodeInt + 1;
    } else if (numbering) {
      nextCodeInt = numbering.startNumber;
    }

    if (numbering) {
      if (nextCodeInt < numbering.startNumber) {
        nextCodeInt = numbering.startNumber;
      }
      if (nextCodeInt > numbering.endNumber) {
        nextCodeInt = numbering.endNumber;
      }
    }
    
    return nextCodeInt.toString();
  }
}


