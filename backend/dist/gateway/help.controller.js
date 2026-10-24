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
var HelpController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../auth/public.decorator");
const help_content_data_1 = require("./help-content.data");
let HelpController = HelpController_1 = class HelpController {
    constructor() {
        this.logger = new common_1.Logger(HelpController_1.name);
    }
    getHelp(topic) {
        try {
            const key = topic || '';
            let content = help_content_data_1.helpContents[key];
            if (!content && key) {
                const matchedKey = Object.keys(help_content_data_1.helpContents).find(k => key.includes(k) || k.includes(key));
                if (matchedKey) {
                    content = help_content_data_1.helpContents[matchedKey];
                }
                else {
                    content = help_content_data_1.helpContents['default'];
                }
            }
            if (!content) {
                content = help_content_data_1.helpContents['default'];
            }
            return content || 'هیچ راهنمایی برای این بخش یافت نشد.';
        }
        catch (error) {
            this.logger.error('Help endpoint error:', error instanceof Error ? error.stack : error);
            throw new common_1.HttpException('هیچ راهنمایی برای این بخش یافت نشد.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.HelpController = HelpController;
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, common_1.Header)('Content-Type', 'text/markdown; charset=utf-8'),
    __param(0, (0, common_1.Query)('topic')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", String)
], HelpController.prototype, "getHelp", null);
exports.HelpController = HelpController = HelpController_1 = __decorate([
    (0, common_1.Controller)('help')
], HelpController);
//# sourceMappingURL=help.controller.js.map