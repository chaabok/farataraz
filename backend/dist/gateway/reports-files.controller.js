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
var ReportsFilesController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsFilesController = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pg_identifier_util_1 = require("./pg-identifier.util");
function isSafeReportName(name) {
    return /^[A-Za-z0-9][A-Za-z0-9 _-]*$/.test(name) && !name.includes('..');
}
function findReportFile(baseDir, reportName) {
    if (!isSafeReportName(reportName))
        return null;
    if (!fs.existsSync(baseDir))
        return null;
    const targetName = reportName.endsWith('.json') ? reportName : `${reportName}.json`;
    const directPath = path.join(baseDir, targetName);
    if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
        return directPath;
    }
    const entries = fs.readdirSync(baseDir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory()) {
            const subPath = path.join(baseDir, entry.name);
            const found = findReportFile(subPath, reportName);
            if (found)
                return found;
        }
    }
    return null;
}
let ReportsFilesController = ReportsFilesController_1 = class ReportsFilesController {
    constructor() {
        this.logger = new common_1.Logger(ReportsFilesController_1.name);
    }
    getReport(reportName) {
        if (!reportName) {
            throw new common_1.BadRequestException({ message: 'نام گزارش الزامی است' });
        }
        const reportsBaseDir = path.join((0, pg_identifier_util_1.frontendRoot)(), 'Reports');
        const filePath = findReportFile(reportsBaseDir, reportName);
        if (!filePath) {
            throw new common_1.HttpException({ message: 'Report layout not found' }, common_1.HttpStatus.NOT_FOUND);
        }
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(content);
        }
        catch (error) {
            this.logger.error('Error reading report file:', error instanceof Error ? error.stack : error);
            throw new common_1.HttpException({ message: 'Error reading file' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    saveReport(data) {
        try {
            const { reportName, title, category, input, script, layouts, items, formulas, aggregates, isSystemReport, reportID } = data || {};
            if (!reportName) {
                throw new common_1.BadRequestException({ message: 'نام گزارش الزامی است' });
            }
            if (!isSafeReportName(reportName)) {
                throw new common_1.BadRequestException({ message: 'نام گزارش شامل کاراکترهای غیرمجاز است' });
            }
            const isSystem = !!isSystemReport ||
                (category && category.toLowerCase().includes('system')) ||
                (layouts && Array.isArray(layouts) && layouts[0]?.isSystemReport === true) ||
                reportName === 'PaymentNotificationA4' ||
                reportName === 'ReceiptNotificationA4';
            const baseFolderName = isSystem ? 'SystemReports' : 'UserReports';
            const rawTable = (data.primaryTable || data.primarytable || '').toLowerCase();
            const rawTargetForm = (data.targetForm || data.targetform || '').toLowerCase();
            const rawCategory = (category || '').toLowerCase();
            let softwareName = 'General';
            if (rawTable.startsWith('rap.') || rawTargetForm.includes('rap.') || rawCategory === 'rap') {
                softwareName = 'RAP';
            }
            else if (rawTable.startsWith('acc.') || rawTargetForm.includes('acc.') || rawCategory === 'accounting' || rawCategory === 'acc') {
                softwareName = 'Accounting';
            }
            else if (rawTable.startsWith('cnt.') || rawTargetForm.includes('cnt.') || rawCategory === 'cnt' || rawCategory === 'contract') {
                softwareName = 'Contract';
            }
            else if (rawTable.startsWith('gnr.') || rawTargetForm.includes('gnr.') || rawCategory === 'common' || rawCategory === 'general') {
                softwareName = 'Common';
            }
            else if (data.softwareName) {
                const sw = data.softwareName.trim().toUpperCase();
                if (sw === 'RAP')
                    softwareName = 'RAP';
                else if (sw === 'ACCOUNTING' || sw === 'ACC')
                    softwareName = 'Accounting';
                else if (sw === 'CONTRACT' || sw === 'CNT')
                    softwareName = 'Contract';
                else if (sw === 'COMMON')
                    softwareName = 'Common';
                else {
                    softwareName = sw.charAt(0).toUpperCase() + sw.slice(1).toLowerCase();
                }
            }
            let finalFileName = reportName;
            if (!isSystem) {
                const isAlreadyFormatted = /^Report[A-Z0-9]+$/i.test(reportName);
                if (!isAlreadyFormatted) {
                    const uniqueId = reportID || Date.now().toString().slice(-7);
                    finalFileName = `Report${softwareName.toUpperCase()}${uniqueId}`;
                }
            }
            if (!isSafeReportName(finalFileName)) {
                throw new common_1.BadRequestException({ message: 'نام فایل گزارش نامعتبر است' });
            }
            const targetDir = path.join((0, pg_identifier_util_1.frontendRoot)(), 'Reports', baseFolderName, softwareName);
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            const filePath = path.join(targetDir, `${finalFileName}.json`);
            const reportContent = {
                reportID: reportID || undefined,
                reportName: finalFileName,
                title: title || reportName,
                category,
                input,
                script,
                layouts,
                items,
                formulas,
                aggregates,
                isSystemReport: isSystem,
                updatedAt: new Date().toISOString(),
            };
            fs.writeFileSync(filePath, JSON.stringify(reportContent, null, 2), 'utf-8');
            return {
                message: 'Report saved successfully',
                fileName: finalFileName,
                filePath: `/Reports/${baseFolderName}/${softwareName}/${finalFileName}.json`,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            this.logger.error('Error saving report:', error instanceof Error ? error.stack : error);
            throw new common_1.InternalServerErrorException({
                message: 'Server error saving report',
                error: error?.message,
            });
        }
    }
};
exports.ReportsFilesController = ReportsFilesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('reportName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportsFilesController.prototype, "getReport", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReportsFilesController.prototype, "saveReport", null);
exports.ReportsFilesController = ReportsFilesController = ReportsFilesController_1 = __decorate([
    (0, common_1.Controller)('reports/save')
], ReportsFilesController);
//# sourceMappingURL=reports-files.controller.js.map