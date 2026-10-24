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
exports.WarehouseService = void 0;
const common_1 = require("@nestjs/common");
const warehouse_repository_interface_1 = require("../../domain/repositories/warehouse.repository.interface");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const usage_check_service_1 = require("../../../../core/services/usage-check.service");
let WarehouseService = class WarehouseService {
    constructor(repository, idGenerationService, usageCheckService) {
        this.repository = repository;
        this.idGenerationService = idGenerationService;
        this.usageCheckService = usageCheckService;
    }
    async findAll(businessStructureRef, companyRef) {
        return this.repository.findAll(businessStructureRef, companyRef);
    }
    async findById(id, businessStructureRef, companyRef) {
        const record = await this.repository.findById(id, businessStructureRef, companyRef);
        if (!record) {
            throw new common_1.NotFoundException(`Warehouse with ID ${id} not found`);
        }
        return record;
    }
    async getNextNumber(businessStructureRef, companyRef) {
        const bsId = (businessStructureRef && businessStructureRef > 1) ? businessStructureRef : 2;
        const compId = (companyRef && companyRef > 1) ? companyRef : 2;
        const res = await this.repository.calculateNextCode(bsId, compId);
        return {
            documentNumber: res.nextValue,
            isDocumentNumberAuto: res.numberingMethod === '2',
            error: res.error,
        };
    }
    validateWarehouse(dto) {
        if (dto.WarehouseType === undefined || dto.WarehouseType === null || dto.WarehouseType === '') {
            throw new common_1.BadRequestException('فیلد نوع (انبار/محل فیزیکی) اجباری است');
        }
        if (dto.WarehouseCode === undefined || dto.WarehouseCode === null || dto.WarehouseCode.toString().trim() === '') {
            throw new common_1.BadRequestException('فیلد کد انبار اجباری است');
        }
        if (!dto.WarehouseTitle || dto.WarehouseTitle.toString().trim() === '') {
            throw new common_1.BadRequestException('فیلد عنوان انبار اجباری است');
        }
        if (dto.WarehouseNature === undefined || dto.WarehouseNature === null || dto.WarehouseNature === '') {
            throw new common_1.BadRequestException('فیلد ماهیت انبار اجباری است');
        }
        if (dto.WarehouseProducts && dto.WarehouseProducts.length > 0) {
            for (let i = 0; i < dto.WarehouseProducts.length; i++) {
                const prod = dto.WarehouseProducts[i];
                if (!prod.ProductCode || prod.ProductCode.toString().trim() === '') {
                    throw new common_1.BadRequestException(`کد کالا در ردیف ${i + 1} تب کالاهای مرتبط اجباری است`);
                }
            }
        }
    }
    async validateDuplicates(dto, businessStructureRef, companyRef, excludeId) {
        if (dto.WarehouseCode !== undefined && dto.WarehouseCode !== null && dto.WarehouseCode.toString().trim() !== '') {
            const isDuplicateCode = await this.repository.checkDuplicate('WarehouseCode', dto.WarehouseCode.toString().trim(), businessStructureRef, companyRef, excludeId);
            if (isDuplicateCode) {
                throw new common_1.BadRequestException('کد انبار تکراری است');
            }
        }
        if (dto.WarehouseTitle !== undefined && dto.WarehouseTitle !== null && dto.WarehouseTitle.toString().trim() !== '') {
            const isDuplicateTitle = await this.repository.checkDuplicate('WarehouseTitle', dto.WarehouseTitle.toString().trim(), businessStructureRef, companyRef, excludeId);
            if (isDuplicateTitle) {
                throw new common_1.BadRequestException('عنوان انبار تکراری است');
            }
        }
        if (dto.WarehouseTitle2 !== undefined && dto.WarehouseTitle2 !== null && dto.WarehouseTitle2.toString().trim() !== '') {
            const isDuplicateTitle2 = await this.repository.checkDuplicate('WarehouseTitle2', dto.WarehouseTitle2.toString().trim(), businessStructureRef, companyRef, excludeId);
            if (isDuplicateTitle2) {
                throw new common_1.BadRequestException('عنوان (۲) انبار تکراری است');
            }
        }
    }
    async create(createDto, businessStructureRef, companyRef, userRef) {
        const docRes = await this.repository.calculateNextCode(businessStructureRef, companyRef);
        if (docRes.numberingMethod === '2' || !createDto.WarehouseCode || createDto.WarehouseCode.toString().trim() === '') {
            if (docRes.error) {
                throw new common_1.BadRequestException(docRes.error);
            }
            if (!createDto.WarehouseCode || docRes.numberingMethod === '2') {
                createDto.WarehouseCode = docRes.nextValue;
            }
        }
        this.validateWarehouse(createDto);
        await this.validateDuplicates(createDto, businessStructureRef, companyRef);
        const WarehouseID = await this.idGenerationService.generateNextId('Warehouses');
        const entityToCreate = {
            ...createDto,
            WarehouseID,
            businessStructureRef: businessStructureRef,
            companyRef: companyRef,
            creator: userRef,
            creationDate: new Date(),
        };
        if (createDto.WarehouseProducts && createDto.WarehouseProducts.length > 0) {
            const itemsNeedingId = createDto.WarehouseProducts.filter((p) => !p.WarehouseProductID);
            let startId = itemsNeedingId.length > 0 ? await this.idGenerationService.generateNextIdBlock('WarehouseProducts', itemsNeedingId.length) : 0;
            let newIdIdx = 0;
            entityToCreate.WarehouseProducts = createDto.WarehouseProducts.map((p) => {
                const id = p.WarehouseProductID || (startId + newIdIdx++);
                return {
                    ...p,
                    WarehouseProductID: id,
                    WarehouseRef: WarehouseID,
                    businessStructureRef: businessStructureRef,
                    companyRef: companyRef,
                    creator: userRef,
                    creationDate: new Date(),
                };
            });
        }
        if (createDto.WarehouseUsers && createDto.WarehouseUsers.length > 0) {
            const itemsNeedingId = createDto.WarehouseUsers.filter((u) => !u.WarehouseUserID);
            let startId = itemsNeedingId.length > 0 ? await this.idGenerationService.generateNextIdBlock('WarehouseUsers', itemsNeedingId.length) : 0;
            let newIdIdx = 0;
            entityToCreate.WarehouseUsers = createDto.WarehouseUsers.map((u) => {
                const id = u.WarehouseUserID || (startId + newIdIdx++);
                return {
                    ...u,
                    WarehouseUserID: id,
                    WarehouseRef: WarehouseID,
                    businessStructureRef: businessStructureRef,
                    companyRef: companyRef,
                    creator: userRef,
                    creationDate: new Date(),
                };
            });
        }
        if (createDto.WarehouseAddresses && createDto.WarehouseAddresses.length > 0) {
            const itemsNeedingId = createDto.WarehouseAddresses.filter((a) => !a.WarehouseAddressID);
            let startId = itemsNeedingId.length > 0 ? await this.idGenerationService.generateNextIdBlock('WarehouseAddresses', itemsNeedingId.length) : 0;
            let newIdIdx = 0;
            entityToCreate.WarehouseAddresses = createDto.WarehouseAddresses.map((a) => {
                const id = a.WarehouseAddressID || (startId + newIdIdx++);
                return {
                    ...a,
                    WarehouseAddressID: id,
                    WarehouseRef: WarehouseID,
                    businessStructureRef: businessStructureRef,
                    companyRef: companyRef,
                    creator: userRef,
                    creationDate: new Date(),
                };
            });
            const firstAddr = createDto.WarehouseAddresses[0];
            if (firstAddr) {
                entityToCreate.AddressState = firstAddr.AddressState || entityToCreate.AddressState;
                entityToCreate.AddressCity = firstAddr.AddressCity || entityToCreate.AddressCity;
                entityToCreate.AddressTitle = firstAddr.AddressTitle || entityToCreate.AddressTitle;
                entityToCreate.AddressTitle2 = firstAddr.AddressTitle2 || entityToCreate.AddressTitle2;
                entityToCreate.PostalCode = firstAddr.PostalCode || entityToCreate.PostalCode;
                entityToCreate.Longitude = firstAddr.Longitude || entityToCreate.Longitude;
                entityToCreate.Latitude = firstAddr.Latitude || entityToCreate.Latitude;
            }
        }
        if (createDto.WarehouseKeepers && createDto.WarehouseKeepers.length > 0) {
            const itemsNeedingId = createDto.WarehouseKeepers.filter((k) => !k.WarehouseKeeperID);
            let startId = itemsNeedingId.length > 0 ? await this.idGenerationService.generateNextIdBlock('WarehouseKeepers', itemsNeedingId.length) : 0;
            let newIdIdx = 0;
            entityToCreate.WarehouseKeepers = createDto.WarehouseKeepers.map((k) => {
                const id = k.WarehouseKeeperID || (startId + newIdIdx++);
                return {
                    ...k,
                    WarehouseKeeperID: id,
                    WarehouseRef: WarehouseID,
                    WarehouseKeeperRef: k.WarehouseKeeperRef || (typeof k === 'object' ? k.WarehouseKeeperRef : k),
                    businessStructureRef: businessStructureRef,
                    companyRef: companyRef,
                    creator: userRef,
                    creationDate: new Date(),
                };
            });
            const firstKeeper = createDto.WarehouseKeepers[0];
            if (firstKeeper) {
                entityToCreate.WarehouseKeeperRef = firstKeeper.WarehouseKeeperRef || (typeof firstKeeper === 'object' ? firstKeeper.WarehouseKeeperRef : firstKeeper);
            }
        }
        return this.repository.create(entityToCreate);
    }
    async update(id, updateDto, businessStructureRef, companyRef, userRef) {
        this.validateWarehouse(updateDto);
        const existing = await this.repository.findById(id, businessStructureRef, companyRef);
        if (!existing) {
            throw new common_1.NotFoundException(`Warehouse with ID ${id} not found`);
        }
        await this.validateDuplicates(updateDto, businessStructureRef, companyRef, id);
        let updatedProducts = undefined;
        if (updateDto.WarehouseProducts !== undefined) {
            const products = updateDto.WarehouseProducts || [];
            const itemsNeedingId = products.filter((p) => !p.WarehouseProductID);
            let startId = itemsNeedingId.length > 0 ? await this.idGenerationService.generateNextIdBlock('WarehouseProducts', itemsNeedingId.length) : 0;
            let newIdIdx = 0;
            updatedProducts = products.map((p) => {
                const id = p.WarehouseProductID || (startId + newIdIdx++);
                return {
                    ...p,
                    WarehouseProductID: id,
                    WarehouseRef: id,
                    businessStructureRef: businessStructureRef,
                    companyRef: companyRef,
                    creator: userRef,
                    creationDate: new Date(),
                };
            });
        }
        let updatedUsers = undefined;
        if (updateDto.WarehouseUsers !== undefined) {
            const users = updateDto.WarehouseUsers || [];
            const itemsNeedingId = users.filter((u) => !u.WarehouseUserID);
            let startId = itemsNeedingId.length > 0 ? await this.idGenerationService.generateNextIdBlock('WarehouseUsers', itemsNeedingId.length) : 0;
            let newIdIdx = 0;
            updatedUsers = users.map((u) => {
                const id = u.WarehouseUserID || (startId + newIdIdx++);
                return {
                    ...u,
                    WarehouseUserID: id,
                    WarehouseRef: id,
                    businessStructureRef: businessStructureRef,
                    companyRef: companyRef,
                    creator: userRef,
                    creationDate: new Date(),
                };
            });
        }
        let updatedAddresses = undefined;
        if (updateDto.WarehouseAddresses !== undefined) {
            const addresses = updateDto.WarehouseAddresses || [];
            const itemsNeedingId = addresses.filter((a) => !a.WarehouseAddressID);
            let startId = itemsNeedingId.length > 0 ? await this.idGenerationService.generateNextIdBlock('WarehouseAddresses', itemsNeedingId.length) : 0;
            let newIdIdx = 0;
            updatedAddresses = addresses.map((a) => {
                const id = a.WarehouseAddressID || (startId + newIdIdx++);
                return {
                    ...a,
                    WarehouseAddressID: id,
                    WarehouseRef: id,
                    businessStructureRef: businessStructureRef,
                    companyRef: companyRef,
                    creator: userRef,
                    creationDate: new Date(),
                };
            });
        }
        let updatedKeepers = undefined;
        if (updateDto.WarehouseKeepers !== undefined) {
            const keepers = updateDto.WarehouseKeepers || [];
            const itemsNeedingId = keepers.filter((k) => !k.WarehouseKeeperID);
            let startId = itemsNeedingId.length > 0 ? await this.idGenerationService.generateNextIdBlock('WarehouseKeepers', itemsNeedingId.length) : 0;
            let newIdIdx = 0;
            updatedKeepers = keepers.map((k) => {
                const id = k.WarehouseKeeperID || (startId + newIdIdx++);
                return {
                    ...k,
                    WarehouseKeeperID: id,
                    WarehouseRef: id,
                    WarehouseKeeperRef: k.WarehouseKeeperRef || (typeof k === 'object' ? k.WarehouseKeeperRef : k),
                    businessStructureRef: businessStructureRef,
                    companyRef: companyRef,
                    creator: userRef,
                    creationDate: new Date(),
                };
            });
        }
        const entityToUpdate = {
            ...updateDto,
            WarehouseProducts: updatedProducts,
            WarehouseUsers: updatedUsers,
            WarehouseAddresses: updatedAddresses,
            WarehouseKeepers: updatedKeepers,
        };
        if (updatedAddresses && updatedAddresses.length > 0) {
            const firstAddr = updatedAddresses[0];
            entityToUpdate.AddressState = firstAddr.AddressState || entityToUpdate.AddressState;
            entityToUpdate.AddressCity = firstAddr.AddressCity || entityToUpdate.AddressCity;
            entityToUpdate.AddressTitle = firstAddr.AddressTitle || entityToUpdate.AddressTitle;
            entityToUpdate.AddressTitle2 = firstAddr.AddressTitle2 || entityToUpdate.AddressTitle2;
            entityToUpdate.PostalCode = firstAddr.PostalCode || entityToUpdate.PostalCode;
            entityToUpdate.Longitude = firstAddr.Longitude || entityToUpdate.Longitude;
            entityToUpdate.Latitude = firstAddr.Latitude || entityToUpdate.Latitude;
        }
        if (updatedKeepers && updatedKeepers.length > 0) {
            const firstKeeper = updatedKeepers[0];
            entityToUpdate.WarehouseKeeperRef = firstKeeper.WarehouseKeeperRef || (typeof firstKeeper === 'object' ? firstKeeper.WarehouseKeeperRef : firstKeeper);
        }
        return this.repository.update(id, entityToUpdate);
    }
    async remove(id, businessStructureRef, companyRef) {
        const existing = await this.repository.findById(id, businessStructureRef, companyRef);
        if (!existing) {
            throw new common_1.NotFoundException(`Warehouse with ID ${id} not found`);
        }
        const childrenCount = await this.repository.countChildren(id);
        if (childrenCount > 0) {
            throw new common_1.BadRequestException('امکان حذف این شاخه وجود ندارد زیرا دارای زیرشاخه است.');
        }
        const usageCheck = await this.usageCheckService.isRecordUsed('Warehouses', id);
        if (usageCheck.isUsed) {
            throw new common_1.BadRequestException('امکان حذف این رکورد وجود ندارد زیرا در سایر بخش‌های سیستم استفاده شده است.');
        }
        await this.repository.remove(id);
    }
};
exports.WarehouseService = WarehouseService;
exports.WarehouseService = WarehouseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(warehouse_repository_interface_1.IWarehouseRepositoryToken)),
    __metadata("design:paramtypes", [Object, id_generation_service_1.IdGenerationService,
        usage_check_service_1.UsageCheckService])
], WarehouseService);
//# sourceMappingURL=warehouse.service.js.map