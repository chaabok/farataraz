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
exports.OtherDetailsService = void 0;
const common_1 = require("@nestjs/common");
const other_details_repository_interface_1 = require("../../domain/repositories/other-details.repository.interface");
let OtherDetailsService = class OtherDetailsService {
    constructor(otherDetailsRepository) {
        this.otherDetailsRepository = otherDetailsRepository;
    }
    async create(createDto, companyId = 2, branchId, agencyId) {
        if (companyId <= 1)
            companyId = 2;
        const data = { ...createDto, businessStructureRef: companyId, companyRef: companyId };
        if (branchId !== undefined)
            data.branchRef = branchId;
        if (agencyId !== undefined)
            data.agencyRef = agencyId;
        return this.otherDetailsRepository.create(data);
    }
    async update(id, updateDto, companyId = 2, branchId, agencyId) {
        if (companyId <= 1)
            companyId = 2;
        await this.findOne(id);
        const data = { ...updateDto, businessStructureRef: companyId, companyRef: companyId };
        if (branchId !== undefined)
            data.branchRef = branchId;
        if (agencyId !== undefined)
            data.agencyRef = agencyId;
        return this.otherDetailsRepository.update(id, data);
    }
    async findAll() {
        return this.otherDetailsRepository.findAll();
    }
    async findWithPagination(params) {
        const [items, total] = await this.otherDetailsRepository.findAdvanced(params);
        return { items, total };
    }
    async findOne(id) {
        const type = await this.otherDetailsRepository.findById(id);
        if (!type) {
            throw new common_1.NotFoundException(`OtherDetails with ID ${id} not found`);
        }
        return type;
    }
    async remove(id) {
        await this.findOne(id);
        await this.otherDetailsRepository.delete(id);
    }
    async checkDuplicate(field, value, excludeId) {
        return this.otherDetailsRepository.checkDuplicate(field, value, excludeId);
    }
};
exports.OtherDetailsService = OtherDetailsService;
exports.OtherDetailsService = OtherDetailsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(other_details_repository_interface_1.IOtherDetailsRepositoryToken)),
    __metadata("design:paramtypes", [Object])
], OtherDetailsService);
//# sourceMappingURL=other-details.service.js.map