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
exports.SalesOrderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sales_order_entity_1 = require("../../domain/entities/sales-order.entity");
const sales_order_item_entity_1 = require("../../domain/entities/sales-order-item.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const typeorm_query_builder_1 = require("../../../../core/utils/typeorm-query-builder");
let SalesOrderService = class SalesOrderService {
    constructor(repository, itemRepository, idGenerationService, requestContextService) {
        this.repository = repository;
        this.itemRepository = itemRepository;
        this.idGenerationService = idGenerationService;
        this.requestContextService = requestContextService;
    }
    getScope() {
        let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
        let compId = this.requestContextService.getCompanyId() ?? 2;
        let fiscalYearId = this.requestContextService.getFiscalYearId() ?? 1;
        if (bsId <= 1)
            bsId = 2;
        if (compId <= 1)
            compId = 2;
        return { bsId, compId, fiscalYearId };
    }
    async getNextNumber() {
        const { bsId, compId, fiscalYearId } = this.getScope();
        const maxResult = await this.repository
            .createQueryBuilder('so')
            .select('MAX(so.OrderNumber)', 'max')
            .where('so.businessStructureRef = :bsId', { bsId })
            .andWhere('so.companyRef = :compId', { compId })
            .andWhere('so.FiscalYearRef = :fiscalYearId', { fiscalYearId })
            .getRawOne();
        const maxVal = maxResult?.max ? parseInt(maxResult.max, 10) : 0;
        return { documentNumber: maxVal + 1 };
    }
    validateRequiredRefs(dto) {
        const missing = [];
        if (!dto.SalesTypeRef || !Number(dto.SalesTypeRef))
            missing.push('نوع فروش');
        if (!dto.SalesCenterRef || !Number(dto.SalesCenterRef))
            missing.push('مرکز فروش');
        if (!dto.DeliveryLocationRef || !Number(dto.DeliveryLocationRef))
            missing.push('محل تحویل');
        if (!dto.SettlementMethodRef || !Number(dto.SettlementMethodRef))
            missing.push('روش تسویه');
        if (missing.length > 0) {
            throw new common_1.BadRequestException(`لطفاً ${missing.join('، ')} را انتخاب کنید`);
        }
    }
    async create(dto) {
        const { bsId, compId, fiscalYearId } = this.getScope();
        const userId = this.requestContextService.getUserId() || 1;
        this.validateRequiredRefs(dto);
        let orderNumber = dto.OrderNumber ? Number(dto.OrderNumber) : 0;
        if (!orderNumber || orderNumber <= 0) {
            const next = await this.getNextNumber();
            orderNumber = next.documentNumber;
        }
        const salesOrderId = await this.idGenerationService.generateNextIdBlock('SalesOrders', 1);
        const order = this.repository.create({
            SalesOrderID: salesOrderId,
            OrderNumber: orderNumber,
            OrderDate: dto.OrderDate || null,
            DeliveryDate: dto.DeliveryDate || null,
            CustomerRef: dto.CustomerRef ? Number(dto.CustomerRef) : null,
            CustomerName: dto.CustomerName || null,
            SalesTypeRef: dto.SalesTypeRef ? Number(dto.SalesTypeRef) : null,
            SalesCenterRef: dto.SalesCenterRef ? Number(dto.SalesCenterRef) : null,
            DeliveryLocationRef: dto.DeliveryLocationRef ? Number(dto.DeliveryLocationRef) : null,
            SettlementMethodRef: dto.SettlementMethodRef ? Number(dto.SettlementMethodRef) : null,
            Status: Number(dto.Status || 1),
            Description: dto.Description || null,
            businessStructureRef: bsId,
            companyRef: compId,
            FiscalYearRef: fiscalYearId,
            creator: userId,
        });
        await this.repository.save(order);
        const validItems = (Array.isArray(dto.items) ? dto.items : []).filter((i) => i.ItemRef && !isNaN(Number(i.ItemRef)));
        if (validItems.length > 0) {
            await this.saveItems(salesOrderId, validItems);
        }
        return this.findOne(salesOrderId);
    }
    async saveItems(salesOrderId, items) {
        const startItemId = await this.idGenerationService.generateNextIdBlock('SalesOrderItems', items.length);
        const itemsToSave = items.map((d, idx) => {
            const qty = Number(d.Quantity || 0);
            const price = Number(d.UnitPrice || 0);
            return this.itemRepository.create({
                SalesOrderItemID: startItemId + idx,
                SalesOrderRef: salesOrderId,
                RowNo: idx + 1,
                ItemRef: Number(d.ItemRef),
                ItemCode: d.ItemCode || null,
                ItemName: d.ItemName || null,
                UnitName: d.UnitName || null,
                Quantity: qty,
                UnitPrice: price,
                TotalPrice: d.TotalPrice !== undefined && d.TotalPrice !== null && d.TotalPrice !== ''
                    ? Math.round(Number(d.TotalPrice))
                    : Math.round(qty * price),
                Description: d.Description || null,
                TrackingFactorValues: d.trackingFactorValues ?? d.TrackingFactorValues ?? d.trackingFactors ?? null,
            });
        });
        await this.itemRepository.save(itemsToSave);
    }
    async findAll(query) {
        const { bsId, compId, fiscalYearId } = this.getScope();
        const qb = this.repository
            .createQueryBuilder('so')
            .where('so.businessStructureRef = :bsId', { bsId })
            .andWhere('so.companyRef = :compId', { compId })
            .andWhere('so.FiscalYearRef = :fiscalYearId', { fiscalYearId })
            .orderBy('so.OrderNumber', 'DESC');
        const searchQ = (0, typeorm_query_builder_1.toLatinDigits)(String(query?.search ?? query?.globalFilter ?? '')).trim();
        if (searchQ) {
            qb.andWhere(new typeorm_2.Brackets((b) => {
                b.where('CAST(so.OrderNumber AS VARCHAR) ILIKE :soSearch', { soSearch: `%${searchQ}%` })
                    .orWhere('so.CustomerName ILIKE :soSearch', { soSearch: `%${searchQ}%` })
                    .orWhere('so.Description ILIKE :soSearch', { soSearch: `%${searchQ}%` });
            }));
        }
        const hasPageSize = query && query.pageSize !== undefined && query.pageSize !== null && String(query.pageSize).trim() !== '';
        (0, typeorm_query_builder_1.applyDataGridParams)(qb, query, 'so', { skipPagination: !hasPageSize });
        const [items, total] = await qb.getManyAndCount();
        return { items, total };
    }
    async findOne(id) {
        const order = await this.repository.findOne({
            where: { SalesOrderID: id },
            relations: ['items'],
        });
        if (!order) {
            throw new common_1.NotFoundException(`سفارش فروش با شناسه ${id} یافت نشد`);
        }
        return order;
    }
    async update(id, dto) {
        const order = await this.findOne(id);
        const userId = this.requestContextService.getUserId() || 1;
        this.validateRequiredRefs(dto);
        if (dto.OrderNumber !== undefined && dto.OrderNumber !== null && Number(dto.OrderNumber) > 0) {
            order.OrderNumber = Number(dto.OrderNumber);
        }
        order.OrderDate = dto.OrderDate !== undefined ? dto.OrderDate : order.OrderDate;
        order.DeliveryDate = dto.DeliveryDate !== undefined ? (dto.DeliveryDate || null) : order.DeliveryDate;
        order.CustomerRef = dto.CustomerRef !== undefined ? (dto.CustomerRef ? Number(dto.CustomerRef) : null) : order.CustomerRef;
        order.CustomerName = dto.CustomerName !== undefined ? dto.CustomerName : order.CustomerName;
        order.SalesTypeRef = dto.SalesTypeRef !== undefined ? (dto.SalesTypeRef ? Number(dto.SalesTypeRef) : null) : order.SalesTypeRef;
        order.SalesCenterRef = dto.SalesCenterRef !== undefined ? (dto.SalesCenterRef ? Number(dto.SalesCenterRef) : null) : order.SalesCenterRef;
        order.DeliveryLocationRef = dto.DeliveryLocationRef !== undefined ? (dto.DeliveryLocationRef ? Number(dto.DeliveryLocationRef) : null) : order.DeliveryLocationRef;
        order.SettlementMethodRef = dto.SettlementMethodRef !== undefined ? (dto.SettlementMethodRef ? Number(dto.SettlementMethodRef) : null) : order.SettlementMethodRef;
        order.Status = dto.Status !== undefined ? Number(dto.Status || 1) : order.Status;
        order.Description = dto.Description !== undefined ? dto.Description : order.Description;
        order.lastModifier = userId;
        await this.repository.save(order);
        await this.itemRepository.delete({ SalesOrderRef: id });
        const validItems = (Array.isArray(dto.items) ? dto.items : []).filter((i) => i.ItemRef && !isNaN(Number(i.ItemRef)));
        if (validItems.length > 0) {
            await this.saveItems(id, validItems);
        }
        return this.findOne(id);
    }
    async remove(id) {
        const order = await this.findOne(id);
        await this.itemRepository.delete({ SalesOrderRef: id });
        await this.repository.remove(order);
        return { success: true };
    }
};
exports.SalesOrderService = SalesOrderService;
exports.SalesOrderService = SalesOrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sales_order_entity_1.SalesOrder)),
    __param(1, (0, typeorm_1.InjectRepository)(sales_order_item_entity_1.SalesOrderItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], SalesOrderService);
//# sourceMappingURL=sales-order.service.js.map