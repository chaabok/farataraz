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
exports.PettyCashRequestService = void 0;
const common_1 = require("@nestjs/common");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const usage_check_service_1 = require("../../../../core/services/usage-check.service");
const moment_jalaali_1 = __importDefault(require("moment-jalaali"));
let PettyCashRequestService = class PettyCashRequestService {
    constructor(repository, idGenerationService, requestContextService, usageCheckService) {
        this.repository = repository;
        this.idGenerationService = idGenerationService;
        this.requestContextService = requestContextService;
        this.usageCheckService = usageCheckService;
    }
    async getNextNumbers(jalaliDateStr) {
        const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        let dateStr = jalaliDateStr;
        if (!dateStr) {
            dateStr = (0, moment_jalaali_1.default)().format('jYYYY/jMM/jDD');
        }
        const docRes = await this.repository.calculateNextDocumentNumber(dateStr, businessStructureId, companyId);
        return {
            documentNumber: docRes.nextValue,
            isDocumentNumberAuto: docRes.numberingMethod === '2',
            error: docRes.error || null,
        };
    }
    async create(createDto) {
        const businessStructureId = this.requestContextService.getBusinessStructureId() || 2;
        const companyId = this.requestContextService.getCompanyId() || 2;
        const fiscalYearId = createDto.fiscalYearRef || this.requestContextService.getFiscalYearId() || 1;
        let dateStr = '';
        let requestDateObj = new Date();
        if (createDto.requestDate) {
            if (typeof createDto.requestDate === 'string' && createDto.requestDate.includes('/')) {
                const m = (0, moment_jalaali_1.default)(createDto.requestDate, 'jYYYY/jMM/jDD', true);
                if (m.isValid()) {
                    dateStr = m.format('jYYYY/jMM/jDD');
                    requestDateObj = m.toDate();
                }
                else {
                    dateStr = (0, moment_jalaali_1.default)(createDto.requestDate).format('jYYYY/jMM/jDD');
                    requestDateObj = (0, moment_jalaali_1.default)(createDto.requestDate).toDate();
                }
            }
            else {
                const m = (0, moment_jalaali_1.default)(createDto.requestDate);
                dateStr = m.format('jYYYY/jMM/jDD');
                requestDateObj = m.toDate();
            }
        }
        else {
            dateStr = (0, moment_jalaali_1.default)().format('jYYYY/jMM/jDD');
        }
        const docRes = await this.repository.calculateNextDocumentNumber(dateStr, businessStructureId, companyId);
        if (docRes.error) {
            throw new common_1.BadRequestException(docRes.error);
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
    async findAll(options) {
        const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        const filters = {
            ...options,
            businessStructureRef: businessStructureId,
            companyRef: companyId,
        };
        return this.repository.findAll(filters);
    }
    async findOne(id) {
        const entity = await this.repository.findById(id);
        if (!entity) {
            throw new common_1.NotFoundException(`PettyCashRequest with ID ${id} not found`);
        }
        const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        if (entity.businessStructureRef !== businessStructureId && entity.businessStructureRef !== null) {
            if (entity.companyRef !== companyId) {
                throw new common_1.NotFoundException(`PettyCashRequest with ID ${id} not found`);
            }
        }
        return entity;
    }
    async update(id, updateDto) {
        const entity = await this.findOne(id);
        const usage = await this.usageCheckService.isRecordUsed('PettyCashRequest', id);
        if (usage.isUsed) {
            throw new common_1.ConflictException(`این درخواست در فرم ${usage.usedInEntity || usage.usedInTable} استفاده شده است و امکان ویرایش آن وجود ندارد.`);
        }
        const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        let dateStr = '';
        if (updateDto.requestDate) {
            if (typeof updateDto.requestDate === 'string' && updateDto.requestDate.includes('/')) {
                const m = (0, moment_jalaali_1.default)(updateDto.requestDate, 'jYYYY/jMM/jDD', true);
                if (m.isValid()) {
                    dateStr = m.format('jYYYY/jMM/jDD');
                    updateDto.requestDate = m.toDate();
                }
                else {
                    dateStr = (0, moment_jalaali_1.default)(updateDto.requestDate).format('jYYYY/jMM/jDD');
                    updateDto.requestDate = (0, moment_jalaali_1.default)(updateDto.requestDate).toDate();
                }
            }
            else {
                const m = (0, moment_jalaali_1.default)(updateDto.requestDate);
                dateStr = m.format('jYYYY/jMM/jDD');
                updateDto.requestDate = m.toDate();
            }
        }
        else if (entity.requestDate) {
            dateStr = (0, moment_jalaali_1.default)(entity.requestDate).format('jYYYY/jMM/jDD');
        }
        const docRes = await this.repository.calculateNextDocumentNumber(dateStr, businessStructureId, companyId);
        if (docRes.numberingMethod === '2') {
            if (updateDto.requestNumber !== undefined) {
                updateDto.requestNumber = entity.requestNumber;
            }
        }
        return this.repository.update(id, updateDto);
    }
    async remove(id) {
        await this.findOne(id);
        const usage = await this.usageCheckService.isRecordUsed('PettyCashRequest', id);
        if (usage.isUsed) {
            throw new common_1.ConflictException(`این درخواست در فرم ${usage.usedInEntity || usage.usedInTable} استفاده شده است و امکان حذف آن وجود ندارد.`);
        }
        return this.repository.delete(id);
    }
};
exports.PettyCashRequestService = PettyCashRequestService;
exports.PettyCashRequestService = PettyCashRequestService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IPettyCashRequestRepository')),
    __metadata("design:paramtypes", [Object, id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService,
        usage_check_service_1.UsageCheckService])
], PettyCashRequestService);
//# sourceMappingURL=petty-cash-request.service.js.map