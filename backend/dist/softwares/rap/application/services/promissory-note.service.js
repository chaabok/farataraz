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
exports.PromissoryNoteService = void 0;
const common_1 = require("@nestjs/common");
const promissory_note_repository_interface_1 = require("../../domain/repositories/promissory-note.repository.interface");
let PromissoryNoteService = class PromissoryNoteService {
    constructor(repository) {
        this.repository = repository;
    }
    async findAll() {
        return this.repository.findAll();
    }
    async findWithPagination(params) {
        if (this.repository.findWithPagination) {
            return this.repository.findWithPagination(params);
        }
        return { data: await this.repository.findAll(), total: 0 };
    }
    async findOne(id) {
        const note = await this.repository.findById(id);
        if (!note) {
            throw new common_1.NotFoundException(`PromissoryNote with ID ${id} not found`);
        }
        return { data: note };
    }
    async findUnusedItems() {
        if (this.repository.findUnusedItems) {
            return this.repository.findUnusedItems();
        }
        return [];
    }
    async create(data) {
        return this.repository.create(data);
    }
    async update(id, data) {
        return this.repository.update(id, data);
    }
    async remove(id) {
        return this.repository.delete(id);
    }
};
exports.PromissoryNoteService = PromissoryNoteService;
exports.PromissoryNoteService = PromissoryNoteService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(promissory_note_repository_interface_1.IPromissoryNoteRepositoryToken)),
    __metadata("design:paramtypes", [Object])
], PromissoryNoteService);
//# sourceMappingURL=promissory-note.service.js.map