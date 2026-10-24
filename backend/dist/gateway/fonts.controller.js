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
var FontsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pg_identifier_util_1 = require("./pg-identifier.util");
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.ttf', '.otf', '.woff', '.woff2'];
const ALLOWED_MIME_TYPES = [
    'font/ttf',
    'font/otf',
    'font/woff',
    'font/woff2',
    'application/x-font-ttf',
    'application/x-font-opentype',
    'application/font-woff',
    'application/font-woff2',
];
let FontsController = FontsController_1 = class FontsController {
    constructor() {
        this.logger = new common_1.Logger(FontsController_1.name);
    }
    fontsDir() {
        return path.join((0, pg_identifier_util_1.frontendPublicDir)(), 'uploads', 'fonts');
    }
    list() {
        try {
            const fontsDir = this.fontsDir();
            if (!fs.existsSync(fontsDir)) {
                return { fonts: [] };
            }
            const files = fs.readdirSync(fontsDir);
            const fonts = files
                .filter(file => ALLOWED_EXTENSIONS.includes('.' + (file.split('.').pop() || '').toLowerCase()))
                .map(file => ({
                filename: file,
                url: `/uploads/fonts/${file}`,
            }));
            return { fonts };
        }
        catch (error) {
            this.logger.error('Error listing fonts:', error instanceof Error ? error.stack : error);
            throw new common_1.HttpException({ error: 'خطا در دریافت لیست فونت‌ها' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    upload(file) {
        try {
            if (!file || !file.buffer) {
                throw new common_1.BadRequestException({ error: 'فایلی انتخاب نشده است.' });
            }
            const rawExtension = file.originalname ? file.originalname.split('.').pop() || '' : '';
            const fileExtension = '.' + rawExtension.toLowerCase();
            if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
                throw new common_1.BadRequestException({
                    error: 'فقط آپلود فونت‌های استاندارد (ttf, otf, woff, woff2) مجاز است.',
                });
            }
            if ((file.size || 0) > MAX_FILE_SIZE) {
                throw new common_1.BadRequestException({ error: 'حجم فونت نمی‌تواند بیشتر از 10 مگابایت باشد.' });
            }
            const restrictedMimeTypes = [
                'application/x-msdownload',
                'application/x-ms-dos-executable',
                'application/x-exe',
                'application/x-sh',
                'application/java-archive',
                'text/javascript',
                'application/javascript',
                'text/html',
            ];
            if (file.mimetype && restrictedMimeTypes.includes(file.mimetype)) {
                throw new common_1.BadRequestException({ error: 'فرمت فایل معتبر نیست.' });
            }
            const buffer = Buffer.from(file.buffer);
            const publicDir = this.fontsDir();
            if (!fs.existsSync(publicDir)) {
                fs.mkdirSync(publicDir, { recursive: true });
            }
            const safeFilename = (file.originalname || 'font').replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const filepath = path.join(publicDir, safeFilename);
            fs.writeFileSync(filepath, buffer);
            const url = `/uploads/fonts/${safeFilename}`;
            return {
                success: true,
                url,
                filename: safeFilename,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            this.logger.error('Font upload error:', error instanceof Error ? error.stack : error);
            throw new common_1.HttpException({ error: 'خطای سرور در آپلود فونت.' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    remove(filename) {
        try {
            if (!filename) {
                throw new common_1.BadRequestException({ error: 'نام فایل ارسال نشده است.' });
            }
            const safeFilename = path.basename(filename);
            const publicDir = this.fontsDir();
            const filepath = path.join(publicDir, safeFilename);
            if (!filepath.startsWith(publicDir)) {
                throw new common_1.BadRequestException({ error: 'مسیر فایل نامعتبر است.' });
            }
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
                return { success: true, message: 'فایل با موفقیت حذف شد.' };
            }
            else {
                throw new common_1.NotFoundException({ error: 'فایل یافت نشد.' });
            }
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            this.logger.error('Error deleting font:', error instanceof Error ? error.stack : error);
            throw new common_1.HttpException({ error: 'خطا در حذف فونت' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.FontsController = FontsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FontsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FontsController.prototype, "upload", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Query)('filename')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FontsController.prototype, "remove", null);
exports.FontsController = FontsController = FontsController_1 = __decorate([
    (0, common_1.Controller)('fonts')
], FontsController);
//# sourceMappingURL=fonts.controller.js.map