"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const party_repository_interface_1 = require("../../domain/repositories/party.repository.interface");
const party_related_entity_1 = require("../../domain/entities/party-related.entity");
const party_address_entity_1 = require("../../domain/entities/party-address.entity");
const party_phone_entity_1 = require("../../domain/entities/party-phone.entity");
const detailed_account_service_1 = require("../../../accounting/application/services/detailed-account.service");
const detailed_accounts_numbering_service_1 = require("../../application/services/detailed-accounts-numbering.service");
const detailed_type_service_1 = require("../../../accounting/application/services/detailed-type.service");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const moment_jalaali_1 = __importDefault(require("moment-jalaali"));
let PartyService = class PartyService {
    constructor(partyRepository, partyRelatedRepository, partyAddressRepository, partyPhoneRepository, detailedAccountService, detailedAccountsNumberingService, detailedTypeService, idGenerationService) {
        this.partyRepository = partyRepository;
        this.partyRelatedRepository = partyRelatedRepository;
        this.partyAddressRepository = partyAddressRepository;
        this.partyPhoneRepository = partyPhoneRepository;
        this.detailedAccountService = detailedAccountService;
        this.detailedAccountsNumberingService = detailedAccountsNumberingService;
        this.detailedTypeService = detailedTypeService;
        this.idGenerationService = idGenerationService;
    }
    async validateDuplicates(dto, existing, excludeId) {
        const newFirstName = dto.firstName !== undefined ? dto.firstName : existing?.firstName;
        const newLastName = dto.lastName !== undefined ? dto.lastName : existing?.lastName;
        if (newFirstName !== undefined || newLastName !== undefined) {
            const isDuplicateName = await this.partyRepository.findDuplicatesByFullName(newFirstName || '', newLastName || '', excludeId);
            if (isDuplicateName) {
                throw new common_1.BadRequestException('ترکیب نام و نام خانوادگی وارد شده تکراری است.');
            }
        }
        const checkField = async (field, value, label) => {
            if (value !== undefined && value !== null && value.trim() !== '') {
                const isDuplicate = await this.checkDuplicate(field, value, excludeId);
                if (isDuplicate) {
                    throw new common_1.BadRequestException(`${label} وارد شده تکراری است.`);
                }
            }
        };
        await checkField('nationalCode', dto.nationalCode, 'کد ملی');
        await checkField('economicCode', dto.economicCode, 'کد اقتصادی');
        await checkField('passportNumber', dto.passportNumber, 'شماره گذرنامه');
        await checkField('nationalId', dto.nationalId, 'شناسه ملی');
        await checkField('registrationNumber', dto.registrationNumber, 'شماره ثبت');
    }
    async create(createDto) {
        const isReal = createDto.nature !== 'legal_entity';
        await this.validateDuplicates(createDto);
        let detailedAccountId = null;
        let detailedAccountCode = '';
        const detailedTypes = await this.detailedTypeService.findAll();
        const typeCode = isReal ? '6' : '7';
        const typeParty = detailedTypes.find(t => t.code === typeCode);
        if (typeParty) {
            detailedAccountCode = await this.detailedAccountsNumberingService.getNextCode(typeParty.detailedTypesId);
            const title = isReal
                ? `${createDto.firstName || ''} ${createDto.lastName || ''}`.trim()
                : (createDto.firstName || '').trim();
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
        const data = {
            ...createDto,
            detailedAccountId: detailedAccountId,
        };
        if (createDto.birthDate !== undefined) {
            if (typeof createDto.birthDate === 'string' && createDto.birthDate.includes('/')) {
                data.birthDate = (0, moment_jalaali_1.default)(createDto.birthDate, 'jYYYY/jMM/jDD').toDate();
            }
            else if (createDto.birthDate) {
                data.birthDate = new Date(createDto.birthDate);
            }
        }
        delete data.PartyRelatedPersons;
        delete data.partyRelatedPersons;
        delete data.PartyAddresses;
        delete data.partyAddresses;
        delete data.PartyPhones;
        delete data.partyPhones;
        const savedParty = await this.partyRepository.create(data);
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
    async update(id, updateDto) {
        const existing = await this.findOne(id);
        const isReal = (updateDto.nature || existing.nature) !== 'legal_entity';
        await this.validateDuplicates(updateDto, existing, id);
        if (existing.detailedAccountId && existing.detailedAccount) {
            const title = isReal
                ? `${updateDto.firstName ?? existing.firstName ?? ''} ${updateDto.lastName ?? existing.lastName ?? ''}`.trim()
                : (updateDto.firstName ?? existing.firstName ?? '').trim();
            const latinTitle = isReal
                ? `${updateDto.latinFirstName ?? existing.latinFirstName ?? ''} ${updateDto.latinLastName ?? existing.latinLastName ?? ''}`.trim()
                : (updateDto.latinFirstName ?? existing.latinFirstName ?? '').trim();
            await this.detailedAccountService.update(existing.detailedAccountId, {
                code: existing.detailedAccount.code,
                title: title || 'بدون نام',
                title_en: latinTitle,
                detailedTypesId: existing.detailedAccount.detailedTypesId,
                isActive: updateDto.isActive ?? existing.isActive,
            });
        }
        const data = {
            ...updateDto,
        };
        if (updateDto.birthDate !== undefined) {
            if (typeof updateDto.birthDate === 'string' && updateDto.birthDate.includes('/')) {
                data.birthDate = (0, moment_jalaali_1.default)(updateDto.birthDate, 'jYYYY/jMM/jDD').toDate();
            }
            else if (updateDto.birthDate) {
                data.birthDate = new Date(updateDto.birthDate);
            }
        }
        delete data.detailedAccountId;
        delete data.PartyRelatedPersons;
        delete data.partyRelatedPersons;
        delete data.PartyAddresses;
        delete data.partyAddresses;
        delete data.PartyPhones;
        delete data.partyPhones;
        const updatedParty = await this.partyRepository.update(id, data);
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
    async findOne(id) {
        const item = await this.partyRepository.findById(id);
        if (!item) {
            throw new common_1.NotFoundException(`Party with ID ${id} not found`);
        }
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
    async findAll(options) {
        return this.partyRepository.findAll(options);
    }
    async findWithPagination(params) {
        const [items, total] = await this.partyRepository.findAdvanced(params);
        return { items, total };
    }
    async remove(id) {
        const existing = await this.findOne(id);
        const detailedAccountId = existing.detailedAccountId;
        await this.partyRepository.delete(id);
        if (detailedAccountId) {
            try {
                await this.detailedAccountService.remove(detailedAccountId);
            }
            catch (e) {
            }
        }
    }
    async checkDuplicate(field, value, excludeId) {
        if (field === 'fullName') {
            const parts = value.split('|');
            const fname = parts[0] || '';
            const lname = parts[1] || '';
            return this.partyRepository.findDuplicatesByFullName(fname, lname, excludeId);
        }
        return this.partyRepository.checkDuplicate(field, value, excludeId);
    }
};
exports.PartyService = PartyService;
exports.PartyService = PartyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(party_repository_interface_1.IPartyRepositoryToken)),
    __param(1, (0, typeorm_1.InjectRepository)(party_related_entity_1.PartyRelated)),
    __param(2, (0, typeorm_1.InjectRepository)(party_address_entity_1.PartyAddress)),
    __param(3, (0, typeorm_1.InjectRepository)(party_phone_entity_1.PartyPhone)),
    __metadata("design:paramtypes", [Object, typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        detailed_account_service_1.DetailedAccountService,
        detailed_accounts_numbering_service_1.DetailedAccountsNumberingService,
        detailed_type_service_1.DetailedTypeService,
        id_generation_service_1.IdGenerationService])
], PartyService);
//# sourceMappingURL=party.service.js.map