import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IPaymentGatewayRepository, IPaymentGatewayRepositoryToken } from '../../domain/repositories/payment-gateway.repository.interface';
import { CreatePaymentGatewayDto } from '../dtos/create-payment-gateway.dto';
import { UpdatePaymentGatewayDto } from '../dtos/update-payment-gateway.dto';
import { PaymentGateway } from '../../domain/entities/payment-gateway.entity';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { DetailedAccountService } from '../../../accounting/application/services/detailed-account.service';
import { DetailedTypeService } from '../../../accounting/application/services/detailed-type.service';
import { DetailedAccountsNumberingService } from '../../../common/application/services/detailed-accounts-numbering.service';
import { PaymentGatewayType } from '../../domain/entities/payment-gateway-type.enum';
import { PartyService } from '../../../common/application/services/party.service'; // We might need this for party name or we can just use generic title

@Injectable()
export class PaymentGatewayService {
  constructor(
    @Inject(IPaymentGatewayRepositoryToken)
    private readonly repository: IPaymentGatewayRepository,
    private readonly idGenService: IdGenerationService,
    private readonly detailedAccountService: DetailedAccountService,
    private readonly detailedTypeService: DetailedTypeService,
    private readonly detailedAccountsNumberingService: DetailedAccountsNumberingService,
    private readonly partyService: PartyService
  ) {}

  async findAll(companyId?: number, businessStructureId?: number, isActive?: boolean): Promise<PaymentGateway[]> {
    const where: any = {};
    if (companyId) where.companyRef = companyId;
    if (businessStructureId) where.businessStructureRef = businessStructureId;
    if (isActive !== undefined) where.isActive = isActive;
    return this.repository.findAll(where);
  }

  async findOne(id: number): Promise<PaymentGateway> {
    const entity = await this.repository.findById(id);
    if (!entity) throw new NotFoundException('Payment Gateway not found');
    return entity;
  }

  async create(data: CreatePaymentGatewayDto): Promise<PaymentGateway> {
    const nextId = await this.idGenService.generateNextId('PaymentGateway');
    const entityData: Partial<PaymentGateway> = { ...data, paymentGatewayId: nextId } as any;
    
    // Generate/assign Detailed Account
    const isInternet = data.gatewayType === PaymentGatewayType.INTERNET;
    const typeCode = isInternet ? '4' : '3';
    
    const detailedTypes = await this.detailedTypeService.findAll();
    const targetType = detailedTypes.find(t => t.code === typeCode);
    
    if (targetType) {
      let detailedAccountCode = data.detailedAccountCode;
      if (!detailedAccountCode) {
         detailedAccountCode = await this.detailedAccountsNumberingService.getNextCode(targetType.detailedTypesId);
      }
      
      let title = "درگاه " + (isInternet ? "اینترنتی" : "کارتخوان") + " (" + (data.gatewayIdString || '') + ")";
      try {
        const party = await this.partyService.findOne(data.partiesRef);
        if (party) {
          title = "درگاه " + (party.firstName || party.lastName || '') + " " + (data.gatewayIdString || '');
        }
      } catch (e) {
        // ignore party fetch error
      }
      
      const newDa = await this.detailedAccountService.create({
        code: detailedAccountCode,
        title: title.trim(),
        detailedTypesId: targetType.detailedTypesId,
        isActive: data.isActive ?? true,
      });
      entityData.detailedAccountRef = newDa.detailedAccountId;
    }
    
    delete (entityData as any).detailedAccountCode;

    if (data.contacts && data.contacts.length > 0) {
       let contactCount = data.contacts.length;
       const startContactId = await this.idGenService.generateNextIdBlock('PaymentGatewayContact', contactCount);
       entityData.contacts = data.contacts.map((c, idx) => ({
           ...c,
           paymentGatewayContactId: startContactId + idx,
           paymentGatewayRef: nextId
       })) as any;
    }

    return this.repository.create(entityData);
  }

  async update(id: number, data: UpdatePaymentGatewayDto): Promise<PaymentGateway> {
    const existing = await this.findOne(id);
    
    if (existing.detailedAccountRef && existing.detailedAccount) {
      const isInternet = data.gatewayType !== undefined ? data.gatewayType === PaymentGatewayType.INTERNET : existing.gatewayType === PaymentGatewayType.INTERNET;
      let title = "درگاه " + (isInternet ? "اینترنتی" : "کارتخوان") + " (" + (data.gatewayIdString || existing.gatewayIdString || '') + ")";
      try {
        const partyRef = data.partiesRef || existing.partiesRef;
        if (partyRef) {
          const party = await this.partyService.findOne(partyRef);
          if (party) {
            title = "درگاه " + (party.firstName || party.lastName || '') + " " + (data.gatewayIdString || existing.gatewayIdString || '');
          }
        }
      } catch (e) { }

      await this.detailedAccountService.update(existing.detailedAccountRef, {
        code: data.detailedAccountCode || existing.detailedAccount.code,
        title: title.trim(),
        detailedTypesId: existing.detailedAccount.detailedTypesId,
        isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
      });
    }

    const entityData = { ...data };
    delete (entityData as any).detailedAccountCode;

    if (entityData.contacts && entityData.contacts.length > 0) {
       let contactCount = entityData.contacts.length;
       const startContactId = await this.idGenService.generateNextIdBlock('PaymentGatewayContact', contactCount);
       (entityData as any).contacts = entityData.contacts.map((c, idx) => ({
           ...c,
           paymentGatewayContactId: startContactId + idx,
           paymentGatewayRef: id
       }));
    }
    return this.repository.update(id, entityData as any);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    const detailedAccountId = existing.detailedAccountRef;
    
    await this.repository.delete(id);
    
    if (detailedAccountId) {
      try {
        await this.detailedAccountService.remove(detailedAccountId);
      } catch (e) {}
    }
  }
}

