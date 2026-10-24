import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPartyRepository, IPartyRepositoryToken } from '../../domain/repositories/party.repository.interface';
import { Party } from '../../domain/entities/party.entity';
import { PartyRelated } from '../../domain/entities/party-related.entity';
import { PartyAddress } from '../../domain/entities/party-address.entity';
import { PartyPhone } from '../../domain/entities/party-phone.entity';
import { CreatePartyDto } from '../dtos/create-party.dto';
import { UpdatePartyDto } from '../dtos/update-party.dto';
import { DetailedAccountService } from '../../../accounting/application/services/detailed-account.service';
import { DetailedAccountsNumberingService } from '../../application/services/detailed-accounts-numbering.service';
import { DetailedTypeService } from '../../../accounting/application/services/detailed-type.service';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import momentJalaali from 'moment-jalaali';

@Injectable()
export class PartyService {
  constructor(
    @Inject(IPartyRepositoryToken)
    private readonly partyRepository: IPartyRepository,
    @InjectRepository(PartyRelated)
    private readonly partyRelatedRepository: Repository<PartyRelated>,
    @InjectRepository(PartyAddress)
    private readonly partyAddressRepository: Repository<PartyAddress>,
    @InjectRepository(PartyPhone)
    private readonly partyPhoneRepository: Repository<PartyPhone>,
    private readonly detailedAccountService: DetailedAccountService,
    private readonly detailedAccountsNumberingService: DetailedAccountsNumberingService,
    private readonly detailedTypeService: DetailedTypeService,
    private readonly idGenerationService: IdGenerationService,
  ) {}

  private async validateDuplicates(dto: Partial<CreatePartyDto | UpdatePartyDto>, existing?: Party, excludeId?: number) {
    // Determine new values or fallback to existing
    const newFirstName = dto.firstName !== undefined ? dto.firstName : existing?.firstName;
    const newLastName = dto.lastName !== undefined ? dto.lastName : existing?.lastName;

    // Check firstName and lastName duplication
    if (newFirstName !== undefined || newLastName !== undefined) {
      const isDuplicateName = await this.partyRepository.findDuplicatesByFullName(
        newFirstName || '',
        newLastName || '',
        excludeId
      );
      if (isDuplicateName) {
        throw new BadRequestException('ترکیب نام و نام خانوادگی وارد شده تکراری است.');
      }
    }

    // Check other unique fields if they are provided and not empty
    const checkField = async (field: string, value: string | undefined, label: string) => {
      if (value !== undefined && value !== null && value.trim() !== '') {
        const isDuplicate = await this.checkDuplicate(field, value, excludeId);
        if (isDuplicate) {
          throw new BadRequestException(`${label} وارد شده تکراری است.`);
        }
      }
    };

    await checkField('nationalCode', dto.nationalCode, 'کد ملی');
    await checkField('economicCode', dto.economicCode, 'کد اقتصادی');
    await checkField('passportNumber', dto.passportNumber, 'شماره گذرنامه');
    await checkField('nationalId', dto.nationalId, 'شناسه ملی');
    await checkField('registrationNumber', dto.registrationNumber, 'شماره ثبت');
  }

  async create(createDto: CreatePartyDto): Promise<Party> {
    const isReal = createDto.nature !== 'legal_entity';
    await this.validateDuplicates(createDto);


    // 1. Generate detailed account
    let detailedAccountId: number | null = null;
    let detailedAccountCode = '';
    
    // Find detailed type '6' for real person, '7' for legal entity
    const detailedTypes = await this.detailedTypeService.findAll();
    const typeCode = isReal ? '6' : '7';
    const typeParty = detailedTypes.find(t => t.code === typeCode);
    
    if (typeParty) {
      detailedAccountCode = await this.detailedAccountsNumberingService.getNextCode(typeParty.detailedTypesId);
      
      const title = isReal 
        ? `${createDto.firstName || ''} ${createDto.lastName || ''}`.trim() 
        : (createDto.firstName || '').trim(); // for legal entity, the name is likely put in firstName
      const latinTitle = isReal 
        ? `${createDto.latinFirstName || ''} ${createDto.latinLastName || ''}`.trim() 
        : (createDto.latinFirstName || '').trim();

      const newDa = await this.detailedAccountService.create({
        code: detailedAccountCode,
        title: title || 'بدون نام',
        title_en: latinTitle,
        detailedTypesId: typeParty.detailedTypesId,
        isActive: createDto.isActive ?? true,
      });
      detailedAccountId = newDa.detailedAccountId;
    }

    // 2. Create Party
    const data: Partial<Party> = {
      ...(createDto as any),
      detailedAccountId: detailedAccountId,
    };
    
    if (createDto.birthDate !== undefined) {
      if (typeof createDto.birthDate === 'string' && createDto.birthDate.includes('/')) {
        data.birthDate = momentJalaali(createDto.birthDate, 'jYYYY/jMM/jDD').toDate();
      } else if (createDto.birthDate) {
        data.birthDate = new Date(createDto.birthDate);
      }
    }
    
    delete (data as any).PartyRelatedPersons;
    delete (data as any).partyRelatedPersons;
    delete (data as any).PartyAddresses;
    delete (data as any).partyAddresses;
    delete (data as any).PartyPhones;
    delete (data as any).partyPhones;

    const savedParty = await this.partyRepository.create(data);

    // Save related persons if provided
    const relatedPersonsToSave = createDto.PartyRelatedPersons || createDto.partyRelatedPersons;
    if (relatedPersonsToSave && Array.isArray(relatedPersonsToSave)) {
      for (const item of relatedPersonsToSave) {
        if (item.firstName || item.lastName) {
          const related = this.partyRelatedRepository.create({
            partyRef: savedParty.partyId,
            firstName: item.firstName || '',
            lastName: item.lastName || '',
            relation: item.relation || null,
            nationalCode: item.nationalCode ? String(item.nationalCode) : null,
            phone: item.phone ? String(item.phone) : null,
            description: item.description || null,
          });
          await this.partyRelatedRepository.save(related);
        }
      }
    }

    // Save party addresses if provided
    const addressesToSave = createDto.PartyAddresses || createDto.partyAddresses;
    if (addressesToSave && Array.isArray(addressesToSave)) {
      for (const item of addressesToSave) {
        if (item.city || item.fullAddress) {
          const addressId = await this.idGenerationService.generateNextId('PartiesAddresses');
          const address = this.partyAddressRepository.create({
            partyAddressId: addressId,
            partyRef: savedParty.partyId,
            addressType: item.addressType || null,
            city: item.city || '',
            fullAddress: item.fullAddress || '',
            postalCode: item.postalCode || null,
            longitude: item.longitude || null,
            latitude: item.latitude || null,
          });
          await this.partyAddressRepository.save(address);
        }
      }
    }

    // Save party phones if provided
    const phonesToSave = createDto.PartyPhones || createDto.partyPhones;
    if (phonesToSave && Array.isArray(phonesToSave)) {
      for (const item of phonesToSave) {
        if (item.phoneNumber) {
          const phoneId = await this.idGenerationService.generateNextId('PartiesPhones');
          const phone = this.partyPhoneRepository.create({
            partyPhoneId: phoneId,
            partyRef: savedParty.partyId,
            phoneType: item.phoneType || null,
            phoneNumber: item.phoneNumber || '',
            internal: item.internal || null,
            description: item.description || null,
          });
          await this.partyPhoneRepository.save(phone);
        }
      }
    }

    return savedParty;
  }

  async update(id: number, updateDto: UpdatePartyDto): Promise<Party> {
    const existing = await this.findOne(id);
    const isReal = (updateDto.nature || existing.nature) !== 'legal_entity';

    await this.validateDuplicates(updateDto, existing, id);

    // Update Detailed Account Title
    if (existing.detailedAccountId && existing.detailedAccount) {
        const title = isReal 
          ? `${updateDto.firstName ?? existing.firstName ?? ''} ${updateDto.lastName ?? existing.lastName ?? ''}`.trim() 
          : (updateDto.firstName ?? existing.firstName ?? '').trim();
        
        const latinTitle = isReal 
          ? `${updateDto.latinFirstName ?? existing.latinFirstName ?? ''} ${updateDto.latinLastName ?? existing.latinLastName ?? ''}`.trim() 
          : (updateDto.latinFirstName ?? existing.latinFirstName ?? '').trim();

       await this.detailedAccountService.update(existing.detailedAccountId, {
           code: existing.detailedAccount.code, // keep code the same
           title: title || 'بدون نام',
           title_en: latinTitle,
           detailedTypesId: existing.detailedAccount.detailedTypesId,
           isActive: updateDto.isActive ?? existing.isActive,
       });
    }

    const data: Partial<Party> = {
      ...(updateDto as any),
    };
    
    if (updateDto.birthDate !== undefined) {
      if (typeof updateDto.birthDate === 'string' && updateDto.birthDate.includes('/')) {
        data.birthDate = momentJalaali(updateDto.birthDate, 'jYYYY/jMM/jDD').toDate();
      } else if (updateDto.birthDate) {
        data.birthDate = new Date(updateDto.birthDate);
      }
    }
    // don't overwrite detailedAccountId
    delete (data as any).detailedAccountId;
    delete (data as any).PartyRelatedPersons;
    delete (data as any).partyRelatedPersons;
    delete (data as any).PartyAddresses;
    delete (data as any).partyAddresses;
    delete (data as any).PartyPhones;
    delete (data as any).partyPhones;

    const updatedParty = await this.partyRepository.update(id, data);

    // Update PartyRelatedPersons if provided
    const relatedPersonsToUpdate = updateDto.PartyRelatedPersons || updateDto.partyRelatedPersons;
    if (relatedPersonsToUpdate !== undefined && Array.isArray(relatedPersonsToUpdate)) {
      await this.partyRelatedRepository.delete({ partyRef: id });

      for (const item of relatedPersonsToUpdate) {
        if (item.firstName || item.lastName) {
          const related = this.partyRelatedRepository.create({
            partyRef: id,
            firstName: item.firstName || '',
            lastName: item.lastName || '',
            relation: item.relation || null,
            nationalCode: item.nationalCode ? String(item.nationalCode) : null,
            phone: item.phone ? String(item.phone) : null,
            description: item.description || null,
          });
          await this.partyRelatedRepository.save(related);
        }
      }
    }

    // Update PartyAddresses if provided
    const addressesToUpdate = updateDto.PartyAddresses || updateDto.partyAddresses;
    if (addressesToUpdate !== undefined && Array.isArray(addressesToUpdate)) {
      await this.partyAddressRepository.delete({ partyRef: id });

      for (const item of addressesToUpdate) {
        if (item.city || item.fullAddress) {
          const addressId = await this.idGenerationService.generateNextId('PartiesAddresses');
          const address = this.partyAddressRepository.create({
            partyAddressId: addressId,
            partyRef: id,
            addressType: item.addressType || null,
            city: item.city || '',
            fullAddress: item.fullAddress || '',
            postalCode: item.postalCode || null,
            longitude: item.longitude || null,
            latitude: item.latitude || null,
          });
          await this.partyAddressRepository.save(address);
        }
      }
    }

    // Update PartyPhones if provided
    const phonesToUpdate = updateDto.PartyPhones || updateDto.partyPhones;
    if (phonesToUpdate !== undefined && Array.isArray(phonesToUpdate)) {
      await this.partyPhoneRepository.delete({ partyRef: id });

      for (const item of phonesToUpdate) {
        if (item.phoneNumber) {
          const phoneId = await this.idGenerationService.generateNextId('PartiesPhones');
          const phone = this.partyPhoneRepository.create({
            partyPhoneId: phoneId,
            partyRef: id,
            phoneType: item.phoneType || null,
            phoneNumber: item.phoneNumber || '',
            internal: item.internal || null,
            description: item.description || null,
          });
          await this.partyPhoneRepository.save(phone);
        }
      }
    }

    return updatedParty;
  }

  async findOne(id: number): Promise<any> {
    const item = await this.partyRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Party with ID ${id} not found`);
    }
    
    // Explicitly find related persons, addresses, and phones and attach them
    const related = await this.partyRelatedRepository.find({ where: { partyRef: id } });
    const addresses = await this.partyAddressRepository.find({ where: { partyRef: id } });
    const phones = await this.partyPhoneRepository.find({ where: { partyRef: id } });
    return {
      ...item,
      PartyRelatedPersons: related,
      partyRelatedPersons: related,
      PartyAddresses: addresses,
      partyAddresses: addresses,
      PartyPhones: phones,
      partyPhones: phones,
    };
  }

  async findAll(options?: any): Promise<Party[]> {
    return this.partyRepository.findAll(options);
  }

  async findWithPagination(params: any): Promise<{ items: Party[], total: number }> {
    const [items, total] = await this.partyRepository.findAdvanced(params);
    return { items, total };
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    const detailedAccountId = existing.detailedAccountId;
    await this.partyRepository.delete(id);

    if (detailedAccountId) {
      try {
        await this.detailedAccountService.remove(detailedAccountId);
      } catch (e) {
        // ignore if used elsewhere
      }
    }
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    if (field === 'fullName') {
      const parts = value.split('|');
      const fname = parts[0] || '';
      const lname = parts[1] || '';
      return this.partyRepository.findDuplicatesByFullName(fname, lname, excludeId);
    }
    return this.partyRepository.checkDuplicate(field, value, excludeId);
  }
}
