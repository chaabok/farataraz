"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CntModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const project_entity_1 = require("./domain/entities/project.entity");
const contract_entity_1 = require("./domain/entities/contract.entity");
const project_service_1 = require("./application/services/project.service");
const contract_service_1 = require("./application/services/contract.service");
const project_controller_1 = require("./application/controllers/project.controller");
const contract_controller_1 = require("./application/controllers/contract.controller");
const detailed_type_entity_1 = require("../accounting/domain/entities/detailed-type.entity");
const detailed_accounts_numbering_entity_1 = require("../common/domain/entities/detailed-accounts-numbering.entity");
const accounting_module_1 = require("../accounting/accounting.module");
const common_module_1 = require("../common/common.module");
const core_module_1 = require("../../core/core.module");
let CntModule = class CntModule {
};
exports.CntModule = CntModule;
exports.CntModule = CntModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                project_entity_1.Project,
                contract_entity_1.Contract,
                detailed_type_entity_1.DetailedType,
                detailed_accounts_numbering_entity_1.DetailedAccountsNumbering
            ]),
            accounting_module_1.AccountingModule,
            common_module_1.CommonModule,
            core_module_1.CoreModule,
        ],
        controllers: [project_controller_1.ProjectController, contract_controller_1.ContractController],
        providers: [project_service_1.ProjectService, contract_service_1.ContractService],
        exports: [project_service_1.ProjectService, contract_service_1.ContractService],
    })
], CntModule);
//# sourceMappingURL=cnt.module.js.map