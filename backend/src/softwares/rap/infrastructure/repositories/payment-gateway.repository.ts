import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentGateway } from '../../domain/entities/payment-gateway.entity';
import { IPaymentGatewayRepository } from '../../domain/repositories/payment-gateway.repository.interface';
import { PaymentGatewayContact } from '../../domain/entities/payment-gateway-contact.entity';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class PaymentGatewayRepository implements IPaymentGatewayRepository {
  constructor(
    @InjectRepository(PaymentGateway)
    private readonly repository: Repository<PaymentGateway>,
    @InjectRepository(PaymentGatewayContact)
    private readonly contactRepository: Repository<PaymentGatewayContact>,
    private readonly requestContextService: RequestContextService,
  ) {}

  private async getScope(overrideBsId?: number, overrideCompId?: number) {
    const bsId = overrideBsId ?? this.requestContextService.getBusinessStructureId() ?? 2;
    const compId = overrideCompId ?? this.requestContextService.getCompanyId() ?? 2;
    let isShared = true;

    try {
      const rows = await this.repository.manager.connection.query(
        `SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`,
        [bsId]
      );
      if (rows && rows.length > 0) {
        if (rows.some((r: any) => {
          const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
          return val === false || val === 0 || val === 'false' || val === null;
        })) {
          isShared = false;
        }
      } else {
        isShared = false;
      }
    } catch (err) {
      isShared = false;
    }

    return { bsId, compId, isShared };
  }

  async findById(id: number): Promise<PaymentGateway | null> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = { paymentGatewayId: id };
    if (isShared) where.businessStructureRef = bsId;
    else where.companyRef = compId;
    return this.repository.findOne({ where, relations: ['party', 'detailedAccount', 'bankAccount', 'contacts'] });
  }

  async findAll(where: any = {}): Promise<PaymentGateway[]> {
    const { bsId, compId, isShared } = await this.getScope(where.businessStructureRef, where.companyRef);
    delete where.businessStructureRef;
    delete where.companyRef;
    if (isShared) {
      where.businessStructureRef = bsId;
    } else {
      where.companyRef = compId;
    }
    return this.repository.find({ where, relations: ['party', 'detailedAccount', 'bankAccount', 'contacts'], order: { paymentGatewayId: 'DESC' } });
  }

  async create(data: Partial<PaymentGateway>): Promise<PaymentGateway> {
    const { bsId, compId } = await this.getScope();
    if (!data.businessStructureRef || data.businessStructureRef <= 1) data.businessStructureRef = bsId;
    if (!data.companyRef || data.companyRef <= 1) data.companyRef = compId;
    const contacts = data.contacts || [];
    delete data.contacts;
    const entity = this.repository.create(data);
    const saved = await this.repository.save(entity);

    if (contacts && contacts.length > 0) {
      const contactsToSave = contacts.map(c => this.contactRepository.create({ ...c, paymentGatewayRef: saved.paymentGatewayId }));
      await this.contactRepository.save(contactsToSave);
      saved.contacts = contactsToSave;
    }
    return saved;
  }

  async update(id: number, data: Partial<PaymentGateway>): Promise<PaymentGateway> {
    const existing = await this.findById(id);
    if (!existing) throw new NotFoundException('Payment Gateway not found');
    
    const contacts = data.contacts;
    delete data.contacts;

    Object.assign(existing, data);
    const saved = await this.repository.save(existing);

    if (contacts) {
      await this.contactRepository.delete({ paymentGatewayRef: id });
      if (contacts.length > 0) {
         const contactsToSave = contacts.map(c => this.contactRepository.create({ ...c, paymentGatewayRef: saved.paymentGatewayId }));
         await this.contactRepository.save(contactsToSave);
         saved.contacts = contactsToSave;
      } else {
         saved.contacts = [];
      }
    }
    
    return saved;
  }

  async delete(id: number): Promise<void> {
    await this.contactRepository.delete({ paymentGatewayRef: id });
    await this.repository.delete(id);
  }
}
