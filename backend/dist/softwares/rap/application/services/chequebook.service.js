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
exports.ChequebookService = void 0;
const common_1 = require("@nestjs/common");
const chequebook_repository_interface_1 = require("../../domain/repositories/chequebook.repository.interface");
const chequebook_entity_1 = require("../../domain/entities/chequebook.entity");
const chequebook_item_entity_1 = require("../../domain/entities/chequebook-item.entity");
const activity_log_service_1 = require("../../../../core/services/activity-log.service");
let ChequebookService = class ChequebookService {
    constructor(chequebookRepository, activityLogService) {
        this.chequebookRepository = chequebookRepository;
        this.activityLogService = activityLogService;
    }
    async create(createDto) {
        const chequebook = new chequebook_entity_1.Chequebook();
        Object.assign(chequebook, createDto);
        if (!chequebook.items || chequebook.items.length === 0) {
            chequebook.items = Array.from({ length: chequebook.leafCount }).map((_, idx) => {
                const item = new chequebook_item_entity_1.ChequebookItem();
                item.checkNumber = Number(chequebook.startSerial) + idx;
                return item;
            });
        }
        else {
            chequebook.items = chequebook.items.map(dto => {
                const item = new chequebook_item_entity_1.ChequebookItem();
                Object.assign(item, dto);
                return item;
            });
        }
        const created = await this.chequebookRepository.create(chequebook);
        this.activityLogService.logActionAsync({
            action: 'Create',
            entityName: 'Rap.Chequebooks',
            entityId: created.chequebookId ? created.chequebookId.toString() : '',
            newValues: created
        });
        return created;
    }
    async update(id, updateDto) {
        let newItems = undefined;
        if (updateDto.items) {
            newItems = updateDto.items.map(dto => {
                const item = new chequebook_item_entity_1.ChequebookItem();
                Object.assign(item, dto);
                return item;
            });
        }
        const payload = { ...updateDto };
        if (newItems) {
            payload.items = newItems;
        }
        const updated = await this.chequebookRepository.update(id, payload);
        this.activityLogService.logActionAsync({
            action: 'Update',
            entityName: 'Rap.Chequebooks',
            entityId: id.toString(),
            newValues: updated
        });
        return updated;
    }
    async delete(id) {
        await this.chequebookRepository.delete(id);
        this.activityLogService.logActionAsync({
            action: 'Delete',
            entityName: 'Rap.Chequebooks',
            entityId: id.toString()
        });
    }
    async findById(id) {
        return this.chequebookRepository.findById(id);
    }
    async findAll(options) {
        return this.chequebookRepository.findAll(options);
    }
};
exports.ChequebookService = ChequebookService;
exports.ChequebookService = ChequebookService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(chequebook_repository_interface_1.IChequebookRepositoryToken)),
    __metadata("design:paramtypes", [Object, activity_log_service_1.ActivityLogService])
], ChequebookService);
//# sourceMappingURL=chequebook.service.js.map