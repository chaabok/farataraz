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
exports.EntityNumberingController = void 0;
const common_1 = require("@nestjs/common");
const entity_numbering_service_1 = require("../../application/services/entity-numbering.service");
const fiscal_year_service_1 = require("../../application/services/fiscal-year.service");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
const permissions_decorator_1 = require("../../../../auth/permissions.decorator");
const ENTITY_TITLES = {
    accounting_doc: 'شماره سند حسابداری',
    accounting_ref: 'شماره عطف حسابداری',
    accounting_fixed: 'شماره ثابت حسابداری',
    detailed_account: 'حساب تفصیلی',
    cost_center: 'مرکز هزینه',
    product: 'کالا و خدمت',
    item: 'کالا و خدمت',
    item_account_category: 'طبقه کالا',
    item_service_group: 'گروه کالا و خدمت',
    measurement_unit: 'واحد سنجش',
    warehouse: 'انبار و محل فیزیکی کالا',
    party: 'طرف حساب',
    fiscal_year: 'سال مالی',
    currency: 'ارز',
    stocktaking_settings: 'تنظیمات انبارگردانی',
    stocktaking_tag_header: 'شماره فرم صدور تگ انبارگردانی',
    stocktaking_tag: 'صدور تگ انبارگردانی',
    StocktakingTagForm: 'شماره فرم صدور تگ انبارگردانی',
    stocktaking_tag_issuance: 'صدور تگ انبارگردانی',
    stocktaking_count: 'شمارش انبارگردانی',
    StocktakingForm: 'شمارش انبارگردانی',
    stocktaking_form: 'شمارش انبارگردانی',
    StocktakingCount: 'شمارش انبارگردانی',
    warehouse_receipt: 'رسید انبار',
    warehouse_issue: 'حواله انبار',
    warehouse_pricing: 'قیمت گذاری اسناد انبار',
    temporary_item_receipt: 'رسید موقت کالا',
    return_temporary_item_receipt: 'برگشت رسید موقت کالا',
    item_request: 'درخواست کالا',
    service_request: 'درخواست خدمت',
    item_supply_request: 'درخواست تامین کالا',
    service_supply_request: 'درخواست تامین خدمت',
    sales_invoice: 'فاکتور فروش',
    sales_order: 'سفارش فروش',
    sales_proforma: 'پیش فاکتور فروش',
    payment_notification: 'اعلامیه پرداخت',
    receipt_notification: 'رسید دریافت',
    received_cheque_operation: 'عملیات چک دریافتنی',
    petty_cash_summary: 'صورتخلاصه تنخواه',
    petty_cash_request: 'درخواست تنخواه',
    reconcile_bank_statement: 'صورتحساب بانکی',
    bank_reconciliation: 'مغایرت بانکی',
    paid_document_clearing: 'وصول اسناد پرداختنی',
    rap_accounting_setting: 'عملیات حسابداری',
    cash: 'صندوق',
    petty_cash: 'تنخواه',
    bank_account: 'حساب بانکی',
    chequebook: 'دسته چک',
    project: 'پروژه',
    contract: 'قرارداد',
};
let EntityNumberingController = class EntityNumberingController {
    constructor(service, fiscalYearService) {
        this.service = service;
        this.fiscalYearService = fiscalYearService;
    }
    async findAll(search) {
        const list = await this.service.findAll();
        const mapped = list.map(item => {
            const rawRef = item.entityRef?.startsWith('entity.') ? item.entityRef.replace('entity.', '') : item.entityRef;
            const title = ENTITY_TITLES[rawRef] || rawRef;
            return {
                ...item,
                entityTitle: title,
                title,
            };
        });
        if (search && search.trim()) {
            const q = search.trim().toLowerCase();
            const filtered = mapped.filter(item => (item.entityTitle && item.entityTitle.toLowerCase().includes(q)) ||
                (item.entityRef && item.entityRef.toLowerCase().includes(q)));
            return { data: filtered };
        }
        return { data: mapped };
    }
    async getByEntityRef(entityRef) {
        let data = await this.service.findByEntityRef(entityRef);
        const fiscalYears = (await this.fiscalYearService.findAll()) || [];
        if (!data) {
            const defaultBase = entityRef === 'warehouse'
                ? ['warehouse']
                : (entityRef === 'stocktaking_tag' || entityRef === 'StocktakingTagForm' || entityRef === 'stocktaking_tag_header')
                    ? ['fiscalYear', 'warehouse']
                    : ['fiscalYear'];
            data = {
                entityRef,
                numberingMethod: '2',
                numberingType: '1',
                baseNumbering: defaultBase,
                items: {
                    fiscalYears: entityRef === 'warehouse' ? [{
                            _id: '1',
                            fixedChar: '',
                            startNumber: '1',
                            endNumber: '999999',
                            gapNumber: 'ignore',
                        }] : fiscalYears.map(fy => ({
                        _id: fy.fiscalYearID?.toString() || Math.random().toString(),
                        fiscalYearTitle: fy.title,
                        startDate: fy.startDate,
                        warehouseTitle: '',
                        fixedChar: '',
                        startNumber: '1',
                        endNumber: '999999',
                        gapNumber: 'ignore',
                    }))
                }
            };
        }
        else {
            if (entityRef === 'stocktaking_tag' || entityRef === 'StocktakingTagForm' || entityRef === 'stocktaking_tag_header') {
                if (!data.baseNumbering || (Array.isArray(data.baseNumbering) && data.baseNumbering.length === 0)) {
                    data.baseNumbering = ['fiscalYear', 'warehouse'];
                }
                else {
                    let b = data.baseNumbering;
                    if (typeof b === 'string') {
                        try {
                            b = JSON.parse(b);
                        }
                        catch { }
                    }
                    if (Array.isArray(b)) {
                        if (!b.includes('fiscalYear'))
                            b.push('fiscalYear');
                        if (!b.includes('warehouse'))
                            b.push('warehouse');
                        data.baseNumbering = b;
                    }
                }
            }
            if (typeof data.items === 'string') {
                try {
                    data.items = JSON.parse(data.items);
                }
                catch (e) {
                    console.error('Failed to parse entity-numbering items JSON:', e);
                }
            }
            if (!data.items) {
                data.items = { fiscalYears: [] };
            }
            if (Array.isArray(data.items)) {
                data.items = { fiscalYears: data.items };
            }
            if (!data.items.fiscalYears || !Array.isArray(data.items.fiscalYears)) {
                data.items.fiscalYears = [];
            }
            if (data.items.fiscalYears.length === 0 && fiscalYears && fiscalYears.length > 0) {
                fiscalYears.forEach(fy => {
                    data.items.fiscalYears.push({
                        _id: fy.fiscalYearID?.toString() || Math.random().toString(),
                        fiscalYearTitle: fy.title,
                        startDate: fy.startDate,
                        fixedChar: '',
                        startNumber: '1',
                        endNumber: '999999',
                        gapNumber: 'ignore',
                    });
                });
            }
        }
        return { data };
    }
    async saveByEntityRef(entityRef, body) {
        const saved = await this.service.save(entityRef, {
            numberingMethod: body.numberingMethod,
            numberingType: body.numberingType,
            baseNumbering: body.baseNumbering || [],
            items: body.items,
        });
        return { data: saved, message: 'Settings saved successfully' };
    }
    async deleteByEntityRef(entityRef) {
        await this.service.remove(entityRef);
        return { message: 'Settings deleted successfully' };
    }
};
exports.EntityNumberingController = EntityNumberingController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('FormNumbering:Read'),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EntityNumberingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':entityRef'),
    (0, permissions_decorator_1.Permissions)('FormNumbering:Read'),
    __param(0, (0, common_1.Param)('entityRef')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EntityNumberingController.prototype, "getByEntityRef", null);
__decorate([
    (0, common_1.Put)(':entityRef'),
    (0, permissions_decorator_1.Permissions)('FormNumbering:Update'),
    __param(0, (0, common_1.Param)('entityRef')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EntityNumberingController.prototype, "saveByEntityRef", null);
__decorate([
    (0, common_1.Delete)(':entityRef'),
    (0, permissions_decorator_1.Permissions)('FormNumbering:Update'),
    __param(0, (0, common_1.Param)('entityRef')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EntityNumberingController.prototype, "deleteByEntityRef", null);
exports.EntityNumberingController = EntityNumberingController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('common/entity-numbering'),
    __metadata("design:paramtypes", [entity_numbering_service_1.EntityNumberingService,
        fiscal_year_service_1.FiscalYearService])
], EntityNumberingController);
//# sourceMappingURL=entity-numbering.controller.js.map