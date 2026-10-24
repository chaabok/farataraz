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
var ActivityLogService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const activity_log_entity_1 = require("../entities/activity-log.entity");
const request_context_service_1 = require("./request-context.service");
const user_entity_1 = require("../iam/entities/user.entity");
const id_generation_service_1 = require("./id-generation.service");
let ActivityLogService = ActivityLogService_1 = class ActivityLogService {
    constructor(activityLogRepository, idGenerationService) {
        this.activityLogRepository = activityLogRepository;
        this.idGenerationService = idGenerationService;
        this.logger = new common_1.Logger(ActivityLogService_1.name);
    }
    logActionAsync(payload) {
        const store = request_context_service_1.RequestContextService.getStore();
        const userId = store?.get('userId');
        const ip = store?.get('ip');
        const userAgent = store?.get('userAgent');
        const url = store?.get('url');
        const method = store?.get('method');
        Promise.resolve().then(async () => {
            try {
                const userIdNum = userId ? Number(userId) : 1;
                const newId = await this.idGenerationService.generateNextId('ActivityLog');
                const log = this.activityLogRepository.create({
                    ...payload,
                    id: String(newId),
                    creator: userIdNum,
                    lastModifier: userIdNum,
                    ipAddress: ip ? String(ip) : payload.ipAddress,
                    userAgent: userAgent ? String(userAgent) : payload.userAgent,
                    url: url ? String(url) : payload.url,
                    method: method ? String(method) : payload.method,
                });
                await this.activityLogRepository.save(log);
            }
            catch (error) {
                this.logger.error('Failed to save activity log asynchronously', error.stack || error);
            }
        }).catch(err => {
            this.logger.error('Unhandled async error in log action', err.stack || err);
        });
    }
    async findAll() {
        return this.activityLogRepository.createQueryBuilder('log')
            .leftJoinAndMapOne('log.creatorUser', user_entity_1.User, 'user', 'user.id = log.creator')
            .orderBy('log.creationDate', 'DESC')
            .take(200)
            .getMany();
    }
};
exports.ActivityLogService = ActivityLogService;
exports.ActivityLogService = ActivityLogService = ActivityLogService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(activity_log_entity_1.ActivityLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        id_generation_service_1.IdGenerationService])
], ActivityLogService);
//# sourceMappingURL=activity-log.service.js.map