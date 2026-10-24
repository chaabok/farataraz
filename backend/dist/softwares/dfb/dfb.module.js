"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DfbModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const core_module_1 = require("../../core/core.module");
const dynamic_form_entity_1 = require("./domain/entities/dynamic-form.entity");
const dynamic_form_record_entity_1 = require("./domain/entities/dynamic-form-record.entity");
const dynamic_menu_entity_1 = require("./domain/entities/dynamic-menu.entity");
const dynamic_form_repository_1 = require("./infrastructure/repositories/dynamic-form.repository");
const dynamic_form_record_repository_1 = require("./infrastructure/repositories/dynamic-form-record.repository");
const dynamic_form_repository_interface_1 = require("./domain/repositories/dynamic-form.repository.interface");
const dynamic_form_record_repository_interface_1 = require("./domain/repositories/dynamic-form-record.repository.interface");
const dynamic_form_service_1 = require("./application/services/dynamic-form.service");
const dynamic_form_controller_1 = require("./presentation/controllers/dynamic-form.controller");
const dynamic_menu_controller_1 = require("./presentation/controllers/dynamic-menu.controller");
let DfbModule = class DfbModule {
};
exports.DfbModule = DfbModule;
exports.DfbModule = DfbModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([dynamic_form_entity_1.DynamicForm, dynamic_form_record_entity_1.DynamicFormRecord, dynamic_menu_entity_1.DynamicMenu]),
            core_module_1.CoreModule,
        ],
        controllers: [dynamic_form_controller_1.DynamicFormController, dynamic_menu_controller_1.DynamicMenuController],
        providers: [
            {
                provide: dynamic_form_repository_interface_1.IDynamicFormRepositoryToken,
                useClass: dynamic_form_repository_1.DynamicFormRepository,
            },
            {
                provide: dynamic_form_record_repository_interface_1.IDynamicFormRecordRepositoryToken,
                useClass: dynamic_form_record_repository_1.DynamicFormRecordRepository,
            },
            dynamic_form_service_1.DynamicFormService,
        ],
        exports: [
            dynamic_form_service_1.DynamicFormService,
            dynamic_form_repository_interface_1.IDynamicFormRepositoryToken,
            dynamic_form_record_repository_interface_1.IDynamicFormRecordRepositoryToken,
        ],
    })
], DfbModule);
//# sourceMappingURL=dfb.module.js.map