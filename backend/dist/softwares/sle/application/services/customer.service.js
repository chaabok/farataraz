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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const common_1 = require("@nestjs/common");
const customer_repository_interface_1 = require("../../domain/repositories/customer.repository.interface");
const customer_entity_1 = require("../../domain/entities/customer.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const party_service_1 = require("../../../common/application/services/party.service");
let CustomerService = class CustomerService {
    constructor(repository, idGenerationService, requestContextService, partyService) {
        this.repository = repository;
        this.idGenerationService = idGenerationService;
        this.requestContextService = requestContextService;
        this.partyService = partyService;
    }
    async getScope() {
        let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
        let compId = this.requestContextService.getCompanyId() ?? 2;
        if (bsId <= 1)
            bsId = 2;
        if (compId <= 1)
            compId = 2;
        let isShared = true;
        try {
            const rows = await this.repository.manager.connection.query(`SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`, [bsId]);
            if (rows && rows.length > 0) {
                if (rows.some((r) => {
                    const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
                    return val === false || val === 0 || val === 'false' || val === null;
                })) {
                    isShared = false;
                }
            }
            else {
                isShared = false;
            }
        }
        catch (err) {
            isShared = false;
        }
        return { bsId, compId, isShared };
    }
    async findAll() {
        const { bsId, compId, isShared } = await this.getScope();
        const where = isShared ? { BusinessStructureRef: bsId } : { CompanyRef: compId };
        return this.repository.findAll({ where });
    }
    async findById(id) {
        const item = await this.repository.findById(id);
        if (!item) {
            throw new common_1.NotFoundException(`Customer with ID ${id} not found`);
        }
        return item;
    }
    async getNextCode() {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.repository.manager.createQueryBuilder(customer_entity_1.Customer, 'c');
        if (isShared) {
            qb.andWhere('c.BusinessStructureRef = :bsId', { bsId });
        }
        else {
            qb.andWhere('c.CompanyRef = :compId', { compId });
        }
        const maxResult = await qb.select('MAX(c.Code)', 'max').getRawOne();
        const max = maxResult?.max ? parseInt(maxResult.max, 10) || 0 : 0;
        return { code: String(max + 1) };
    }
    async create(dto) {
        const { bsId, compId, isShared } = await this.getScope();
        const userId = this.requestContextService.getUserId() || 1;
        if (!dto.Code) {
            const next = await this.getNextCode();
            dto.Code = next.code;
        }
        if (!dto.PartyRef) {
            throw new common_1.BadRequestException('انتخاب طرف حساب (مشتری) الزامی است.');
        }
        const existingCustomer = await this.repository.manager.findOne(customer_entity_1.Customer, {
            where: { PartyRef: Number(dto.PartyRef) },
        });
        if (existingCustomer) {
            throw new common_1.BadRequestException('این طرف حساب قبلاً به عنوان مشتری ثبت شده است.');
        }
        if (!dto.SalesTypes || (Array.isArray(dto.SalesTypes) && dto.SalesTypes.length === 0)) {
            throw new common_1.BadRequestException('نوع فروش الزامی است.');
        }
        if (!dto.CurrencyRef) {
            throw new common_1.BadRequestException('انتخاب ارز الزامی است.');
        }
        const id = dto.CustomerID || (await this.idGenerationService.generateNextId('Customers'));
        const entity = this.repository.manager.create(customer_entity_1.Customer, {
            CustomerID: id,
            Code: String(dto.Code),
            CustomerType: dto.CustomerType !== undefined ? Number(dto.CustomerType) : 1,
            PartyRef: dto.PartyRef ? Number(dto.PartyRef) : null,
            CustomerGroupRef: dto.CustomerGroupRef ? Number(dto.CustomerGroupRef) : null,
            SalesChannels: typeof dto.SalesChannels === 'object' ? JSON.stringify(dto.SalesChannels) : dto.SalesChannels,
            SalesStatus: dto.SalesStatus !== undefined ? Number(dto.SalesStatus) : 1,
            SalesIntermediaryRef: dto.SalesIntermediaryRef ? Number(dto.SalesIntermediaryRef) : null,
            SalesTypes: typeof dto.SalesTypes === 'object' ? JSON.stringify(dto.SalesTypes) : dto.SalesTypes,
            CurrencyRef: dto.CurrencyRef ? Number(dto.CurrencyRef) : null,
            IsActive: dto.IsActive !== undefined ? dto.IsActive : true,
            CreatorRef: userId,
            CreationDate: new Date(),
            LastModifierRef: userId,
            LastModificationDate: new Date(),
            CompanyRef: compId,
            BusinessStructureRef: bsId,
        });
        const savedCustomer = await this.repository.create(entity);
        if (dto.PartyRef && (dto.PartyPhones || dto.partyPhones || dto.PartyAddresses || dto.partyAddresses)) {
            await this.partyService.update(Number(dto.PartyRef), {
                PartyPhones: dto.PartyPhones || dto.partyPhones,
                PartyAddresses: dto.PartyAddresses || dto.partyAddresses,
            }).catch(() => { });
        }
        return savedCustomer;
    }
    async update(id, dto) {
        const existing = await this.findById(id);
        const userId = this.requestContextService.getUserId() || 1;
        const partyRefToCheck = dto.PartyRef !== undefined ? (dto.PartyRef ? Number(dto.PartyRef) : null) : existing.PartyRef;
        if (partyRefToCheck) {
            const existingCustomer = await this.repository.manager.findOne(customer_entity_1.Customer, {
                where: { PartyRef: partyRefToCheck },
            });
            if (existingCustomer && Number(existingCustomer.CustomerID) !== Number(id)) {
                throw new common_1.BadRequestException('این طرف حساب قبلاً به عنوان مشتری ثبت شده است.');
            }
        }
        const updateData = {
            Code: dto.Code !== undefined ? String(dto.Code) : existing.Code,
            CustomerType: dto.CustomerType !== undefined ? Number(dto.CustomerType) : existing.CustomerType,
            PartyRef: dto.PartyRef !== undefined ? (dto.PartyRef ? Number(dto.PartyRef) : null) : existing.PartyRef,
            CustomerGroupRef: dto.CustomerGroupRef !== undefined ? (dto.CustomerGroupRef ? Number(dto.CustomerGroupRef) : null) : existing.CustomerGroupRef,
            SalesChannels: dto.SalesChannels !== undefined ? (typeof dto.SalesChannels === 'object' ? JSON.stringify(dto.SalesChannels) : dto.SalesChannels) : existing.SalesChannels,
            SalesStatus: dto.SalesStatus !== undefined ? Number(dto.SalesStatus) : existing.SalesStatus,
            SalesIntermediaryRef: dto.SalesIntermediaryRef !== undefined ? (dto.SalesIntermediaryRef ? Number(dto.SalesIntermediaryRef) : null) : existing.SalesIntermediaryRef,
            SalesTypes: dto.SalesTypes !== undefined ? (typeof dto.SalesTypes === 'object' ? JSON.stringify(dto.SalesTypes) : dto.SalesTypes) : existing.SalesTypes,
            CurrencyRef: dto.CurrencyRef !== undefined ? (dto.CurrencyRef ? Number(dto.CurrencyRef) : null) : existing.CurrencyRef,
            IsActive: dto.IsActive !== undefined ? dto.IsActive : existing.IsActive,
            LastModifierRef: userId,
            LastModificationDate: new Date(),
        };
        const updatedCustomer = await this.repository.update(id, updateData);
        if (partyRefToCheck && (dto.PartyPhones || dto.partyPhones || dto.PartyAddresses || dto.partyAddresses)) {
            await this.partyService.update(Number(partyRefToCheck), {
                PartyPhones: dto.PartyPhones || dto.partyPhones,
                PartyAddresses: dto.PartyAddresses || dto.partyAddresses,
            }).catch(() => { });
        }
        return updatedCustomer;
    }
    async remove(id) {
        await this.findById(id);
        await this.repository.delete(id);
    }
};
exports.CustomerService = CustomerService;
exports.CustomerService = CustomerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(customer_repository_interface_1.ICustomerRepositoryToken)),
    __metadata("design:paramtypes", [Object, id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService,
        party_service_1.PartyService])
], CustomerService);
//# sourceMappingURL=customer.service.js.map