"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const id_generation_entity_1 = require("./entities/id-generation.entity");
const activity_log_entity_1 = require("./entities/activity-log.entity");
const id_generation_service_1 = require("./services/id-generation.service");
const database_schema_service_1 = require("./services/database-schema.service");
const iam_module_1 = require("./iam/iam.module");
const license_module_1 = require("./license/license.module");
const request_context_service_1 = require("./services/request-context.service");
const entity_audit_subscriber_1 = require("./subscribers/entity-audit.subscriber");
const activity_log_service_1 = require("./services/activity-log.service");
const activity_log_controller_1 = require("./activity-log.controller");
const usage_check_service_1 = require("./services/usage-check.service");
const usage_check_controller_1 = require("./controllers/usage-check.controller");
let CoreModule = class CoreModule {
};
exports.CoreModule = CoreModule;
exports.CoreModule = CoreModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([id_generation_entity_1.IDGeneration, activity_log_entity_1.ActivityLog]),
            iam_module_1.IamModule,
            license_module_1.LicenseModule,
        ],
        controllers: [activity_log_controller_1.ActivityLogController, usage_check_controller_1.UsageCheckController],
        providers: [
            id_generation_service_1.IdGenerationService,
            database_schema_service_1.DatabaseSchemaService,
            request_context_service_1.RequestContextService,
            activity_log_service_1.ActivityLogService,
            entity_audit_subscriber_1.EntityAuditSubscriber,
            usage_check_service_1.UsageCheckService,
        ],
        exports: [typeorm_1.TypeOrmModule, id_generation_service_1.IdGenerationService, database_schema_service_1.DatabaseSchemaService, iam_module_1.IamModule, license_module_1.LicenseModule, request_context_service_1.RequestContextService, activity_log_service_1.ActivityLogService, usage_check_service_1.UsageCheckService],
    })
], CoreModule);
//# sourceMappingURL=core.module.js.map