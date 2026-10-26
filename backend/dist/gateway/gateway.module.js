"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayModule = void 0;
const common_1 = require("@nestjs/common");
const core_module_1 = require("../core/core.module");
const upload_controller_1 = require("./upload.controller");
const fonts_controller_1 = require("./fonts.controller");
const help_controller_1 = require("./help.controller");
const permissions_tree_controller_1 = require("./permissions-tree.controller");
const ai_chat_controller_1 = require("./ai-chat.controller");
const db_init_controller_1 = require("./db-init.controller");
const reports_files_controller_1 = require("./reports-files.controller");
const reports_db_query_controller_1 = require("./reports-db-query.controller");
const accounting_proxy_controller_1 = require("./accounting-proxy.controller");
let GatewayModule = class GatewayModule {
};
exports.GatewayModule = GatewayModule;
exports.GatewayModule = GatewayModule = __decorate([
    (0, common_1.Module)({
        imports: [core_module_1.CoreModule],
        controllers: [
            upload_controller_1.UploadController,
            fonts_controller_1.FontsController,
            help_controller_1.HelpController,
            permissions_tree_controller_1.PermissionsTreeController,
            ai_chat_controller_1.AiChatController,
            db_init_controller_1.DbInitController,
            reports_files_controller_1.ReportsFilesController,
            reports_db_query_controller_1.ReportsDbQueryController,
            accounting_proxy_controller_1.AccountingProxyController,
        ],
    })
], GatewayModule);
//# sourceMappingURL=gateway.module.js.map