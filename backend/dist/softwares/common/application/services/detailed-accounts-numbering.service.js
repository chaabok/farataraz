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
exports.DetailedAccountsNumberingService = void 0;
const common_1 = require("@nestjs/common");
const detailed_accounts_numbering_repository_interface_1 = require("../../domain/repositories/detailed-accounts-numbering.repository.interface");
const detailed_type_service_1 = require("../../../accounting/application/services/detailed-type.service");
const detailed_account_service_1 = require("../../../accounting/application/services/detailed-account.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let DetailedAccountsNumberingService = class DetailedAccountsNumberingService {
    constructor(repo, detailedTypeService, detailedAccountService, requestContextService) {
        this.repo = repo;
        this.detailedTypeService = detailedTypeService;
        this.detailedAccountService = detailedAccountService;
        this.requestContextService = requestContextService;
    }
    async getViewList() {
        const companyId = (this.requestContextService?.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        await this.detailedTypeService.seedForBusinessStructure(companyId);
        const types = await this.detailedTypeService.findAll();
        const settings = await this.repo.findAll();
        const settingsMap = new Map(settings.map(s => [s.detailedTypesId, s]));
        types.sort((a, b) => parseInt(a.code) - parseInt(b.code));
        let nextAvailableStartNumber = 1;
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
            };
        });
    }
    async saveList(dataList) {
        for (const data of dataList) {
            if (data.detailedTypesId) {
                await this.repo.upsert(data.detailedTypesId, data);
            }
        }
    }
    async getNextCode(detailedTypesId) {
        const numberings = await this.getViewList();
        const numbering = numberings.find(n => n.detailedTypesId === detailedTypesId || n.detailedTypeCode === '13' || n.detailedTypesId === 13);
        let nextCodeInt = numbering ? numbering.startNumber : 1;
        const allDAs = await this.detailedAccountService.findAll();
        let targetDAs = allDAs;
        if (numbering) {
            targetDAs = allDAs.filter((da) => {
                const c = parseInt(da.code, 10);
                return !isNaN(c) && c >= numbering.startNumber && c <= numbering.endNumber;
            });
            if (targetDAs.length === 0) {
                targetDAs = allDAs.filter((da) => da.detailedTypesId === detailedTypesId || da.detailedTypesId === numbering.detailedTypesId || !da.detailedTypesId);
            }
        }
        if (targetDAs.length > 0) {
            let maxCodeInt = numbering ? numbering.startNumber - 1 : 0;
            targetDAs.forEach((da) => {
                const c = parseInt(da.code, 10);
                if (!isNaN(c) && c > maxCodeInt) {
                    maxCodeInt = c;
                }
            });
            nextCodeInt = maxCodeInt + 1;
        }
        else if (numbering) {
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
};
exports.DetailedAccountsNumberingService = DetailedAccountsNumberingService;
exports.DetailedAccountsNumberingService = DetailedAccountsNumberingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(detailed_accounts_numbering_repository_interface_1.IDetailedAccountsNumberingRepositoryToken)),
    __metadata("design:paramtypes", [Object, detailed_type_service_1.DetailedTypeService,
        detailed_account_service_1.DetailedAccountService,
        request_context_service_1.RequestContextService])
], DetailedAccountsNumberingService);
//# sourceMappingURL=detailed-accounts-numbering.service.js.map