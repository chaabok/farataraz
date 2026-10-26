"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IamModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./entities/user.entity");
const role_entity_1 = require("./entities/role.entity");
const permission_entity_1 = require("./entities/permission.entity");
const role_permission_entity_1 = require("./entities/role-permission.entity");
const user_role_entity_1 = require("./entities/user-role.entity");
const user_group_entity_1 = require("./entities/user-group.entity");
const user_group_permission_entity_1 = require("./entities/user-group-permission.entity");
const core_1 = require("@nestjs/core");
const user_activity_interceptor_1 = require("./interceptors/user-activity.interceptor");
const business_structure_user_entity_1 = require("./entities/business-structure-user.entity");
const iam_service_1 = require("./services/iam.service");
const iam_controller_1 = require("./controllers/iam.controller");
let IamModule = class IamModule {
};
exports.IamModule = IamModule;
exports.IamModule = IamModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                role_entity_1.Role,
                permission_entity_1.Permission,
                role_permission_entity_1.RolePermission,
                user_role_entity_1.UserRole,
                user_group_entity_1.UserGroup,
                user_group_permission_entity_1.UserGroupPermission,
                business_structure_user_entity_1.BusinessStructureUsers,
            ]),
        ],
        providers: [
            iam_service_1.IamService,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: user_activity_interceptor_1.UserActivityInterceptor,
            },
        ],
        controllers: [iam_controller_1.IamController],
        exports: [iam_service_1.IamService],
    })
], IamModule);
//# sourceMappingURL=iam.module.js.map