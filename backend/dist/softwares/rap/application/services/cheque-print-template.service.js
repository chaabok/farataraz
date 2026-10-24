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
exports.ChequePrintTemplateService = void 0;
const common_1 = require("@nestjs/common");
const cheque_print_template_repository_interface_1 = require("../../domain/repositories/cheque-print-template.repository.interface");
let ChequePrintTemplateService = class ChequePrintTemplateService {
    constructor(repo) {
        this.repo = repo;
    }
    async create(createDto) {
        return this.repo.create(createDto);
    }
    async update(id, updateDto) {
        await this.findOne(id);
        await this.repo.update(id, updateDto);
        return this.findOne(id);
    }
    async findAll() {
        return this.repo.findAll();
    }
    async findWithPagination(params) {
        const [items, total] = await this.repo.findAdvanced(params);
        return { items, total };
    }
    async findOne(id) {
        const item = await this.repo.findById(id);
        if (!item) {
            throw new common_1.NotFoundException(`ChequePrintTemplate with ID ${id} not found`);
        }
        return item;
    }
    async remove(id) {
        await this.findOne(id);
        await this.repo.delete(id);
    }
};
exports.ChequePrintTemplateService = ChequePrintTemplateService;
exports.ChequePrintTemplateService = ChequePrintTemplateService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cheque_print_template_repository_interface_1.IChequePrintTemplateRepositoryToken)),
    __metadata("design:paramtypes", [Object])
], ChequePrintTemplateService);
//# sourceMappingURL=cheque-print-template.service.js.map