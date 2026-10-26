"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UploadController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const activity_log_service_1 = require("../core/services/activity-log.service");
const pg_identifier_util_1 = require("./pg-identifier.util");
let UploadController = UploadController_1 = class UploadController {
    constructor(activityLogService) {
        this.activityLogService = activityLogService;
        this.logger = new common_1.Logger(UploadController_1.name);
    }
    async upload(file) {
        try {
            if (!file || !file.buffer) {
                throw new common_1.BadRequestException({ error: 'File is required.' });
            }
            const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];
            const rawExtension = file.originalname ? file.originalname.split('.').pop() || '' : '';
            const fileExtension = '.' + rawExtension.toLowerCase();
            if (!allowedExtensions.includes(fileExtension)) {
                throw new common_1.BadRequestException({ error: 'آپلود این نوع فایل مجاز نمی‌باشد.' });
            }
            const MAX_FILE_SIZE = 10 * 1024 * 1024;
            if ((file.size || 0) > MAX_FILE_SIZE) {
                throw new common_1.BadRequestException({ error: 'حجم فایل بیشتر از ۱۰ مگابایت مجاز نیست.' });
            }
            const restrictedMimeTypes = [
                'application/x-msdownload',
                'application/x-ms-dos-executable',
                'application/x-exe',
                'application/x-sh',
                'application/java-archive',
                'text/javascript',
                'application/javascript',
                'image/svg+xml',
                'text/html',
            ];
            if (file.mimetype && restrictedMimeTypes.includes(file.mimetype)) {
                throw new common_1.BadRequestException({ error: 'آپلود این نوع فایل مجاز نمی‌باشد.' });
            }
            const buffer = Buffer.from(file.buffer);
            if (buffer.length >= 4) {
                const header = buffer.toString('hex', 0, 4);
                const maliciousSignatures = [
                    '4d5a',
                    '7f454c46',
                    '2321',
                    'cafebabe',
                ];
                const isMalicious = maliciousSignatures.some(sig => header.startsWith(sig));
                if (isMalicious) {
                    throw new common_1.BadRequestException({ error: 'محتوای فایل نامعتبر یا مخرب است.' });
                }
            }
            const publicDir = path.join((0, pg_identifier_util_1.frontendPublicDir)(), 'image');
            if (!fs.existsSync(publicDir)) {
                fs.mkdirSync(publicDir, { recursive: true });
            }
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const safeName = (file.originalname || 'upload').replace(/[^a-zA-Z0-9.]/g, '_');
            const filename = uniqueSuffix + '-' + safeName;
            const filepath = path.join(publicDir, filename);
            fs.writeFileSync(filepath, buffer);
            try {
                this.activityLogService.logActionAsync({
                    action: 'UPLOAD',
                    entityName: 'FILE',
                    description: `User uploaded file: ${file.originalname} (${((file.size || 0) / 1024).toFixed(2)} KB)`,
                });
            }
            catch (logErr) {
                this.logger.warn(`Activity log for upload failed: ${logErr instanceof Error ? logErr.message : logErr}`);
            }
            const url = `/image/${filename}`;
            return { url };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            this.logger.error('File upload error:', error instanceof Error ? error.stack : error);
            throw new common_1.HttpException({ error: 'Internal server error uploading file' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "upload", null);
exports.UploadController = UploadController = UploadController_1 = __decorate([
    (0, common_1.Controller)('upload'),
    __metadata("design:paramtypes", [activity_log_service_1.ActivityLogService])
], UploadController);
//# sourceMappingURL=upload.controller.js.map