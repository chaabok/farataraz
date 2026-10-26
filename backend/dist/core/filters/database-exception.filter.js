"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DatabaseExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let DatabaseExceptionFilter = DatabaseExceptionFilter_1 = class DatabaseExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(DatabaseExceptionFilter_1.name);
        this.tableToFormMap = {
            'FiscalYear': 'سال مالی',
            'Currency': 'ارز',
            'Parties': 'شخص',
            'GeoLocations': 'موقعیت جغرافیایی',
            'BusinessStructure': 'ساختار سازمانی',
            'Account': 'سرفصل حساب',
            'Accounts': 'سرفصل حساب',
            'DetailedAccount': 'سرفصل تفصیلی',
            'DetailedAccounts': 'سرفصل تفصیلی',
            'DetailedType': 'نوع تفصیلی',
            'DetailedTypes': 'نوع تفصیلی',
            'VoucherType': 'نوع سند',
            'CostCenter': 'مرکز هزینه',
            'Bank': 'بانک',
            'Banks': 'بانک',
            'BankBranch': 'شعبه بانک',
            'BankBranchs': 'شعبه بانک',
            'BankAccount': 'حساب بانکی',
            'BankAccounts': 'حساب بانکی',
            'BankAccountType': 'نوع حساب بانکی',
            'BankAccountTypes': 'نوع حساب بانکی',
            'Cash': 'صندوق',
            'Cashes': 'صندوق',
            'Cashier': 'صندوقدار',
            'Cashiers': 'صندوقدار',
            'Contract': 'قرارداد',
            'Contracts': 'قرارداد',
            'Project': 'پروژه',
            'Projects': 'پروژه',
            'AccountsRelatedDetailedAccount': 'ارتباط حساب با تفصیلی',
            'BaseSettings': 'تنظیمات پایه',
            'Entities': 'موجودیت عمومی',
            'DetailedAccountsNumbering': 'شماره‌گذاری تفصیلی',
            'User': 'کاربر',
            'Users': 'کاربر',
            'Role': 'نقش کاربری',
            'Roles': 'نقش کاربری',
            'Permission': 'دسترسی',
            'Permissions': 'دسترسی',
            'UserGroup': 'گروه کاربری',
            'UserRole': 'نقش تخصیص داده شده به کاربر',
            'RolePermission': 'دسترسی تخصیص داده شده به نقش',
            'UserGroupPermission': 'دسترسی تخصیص داده شده به گروه',
            'BusinessStructureUser': 'ارتباط کاربر با ساختار',
            'Report': 'گزارش',
            'Reports': 'گزارش',
            'ReportGroup': 'گروه گزارش',
            'ReportGroups': 'گروه گزارش',
        };
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const message = exception.message;
        const detail = exception.detail || '';
        const code = exception.code;
        if (code === '23503' ||
            message.includes('FOREIGN KEY constraint failed') ||
            (message.includes('violates') && message.includes('foreign key constraint'))) {
            let formName = 'بخش‌های دیگر';
            const fullError = `${message} ${detail}`;
            const pgMatch = fullError.match(/referenced from table (?:"?[\w\d_]+"?"?\.)?"?([\w\d_]+)"?/i);
            const genericMatches = Array.from(fullError.matchAll(/on table (?:"?[\w\d_]+"?"?\.)?"?([\w\d_]+)"?/gi));
            const genericMatch = genericMatches.length > 0 ? genericMatches[genericMatches.length - 1] : null;
            let tableName = '';
            if (pgMatch && pgMatch[1]) {
                tableName = pgMatch[1];
            }
            else if (genericMatch && genericMatch[1]) {
                tableName = genericMatch[1];
            }
            if (tableName) {
                formName = this.tableToFormMap[tableName] || tableName;
            }
            else {
                const tableNames = Object.keys(this.tableToFormMap).sort((a, b) => b.length - a.length);
                for (const table of tableNames) {
                    if (fullError.includes(table)) {
                        formName = this.tableToFormMap[table];
                        tableName = table;
                        break;
                    }
                }
            }
            this.logger.log(`Database Constraint Handled: Table=${tableName}, Form=${formName}`);
            return response.status(common_1.HttpStatus.BAD_REQUEST).json({
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: `از این اطلاعات در فرم "${formName}" استفاده شده است.`,
                error: 'Bad Request',
            });
        }
        this.logger.error(`Database Error: ${message}`, exception.stack);
        if (code === '23505' || message.includes('UNIQUE constraint failed')) {
            return response.status(common_1.HttpStatus.BAD_REQUEST).json({
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: 'اطلاعات وارد شده تکراری است.',
                error: 'Bad Request',
            });
        }
        if (code === '22P02' || message.includes('invalid input syntax')) {
            return response.status(common_1.HttpStatus.BAD_REQUEST).json({
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: 'مقدار وارد شده برای یکی از فیلدها معتبر نمی‌باشد.',
                error: 'Bad Request',
            });
        }
        if (code === '23502' || message.includes('null value in column')) {
            this.logger.warn(`Not-Null Violation (23502): ${message} ${detail}`);
            return response.status(common_1.HttpStatus.BAD_REQUEST).json({
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: 'تکمیل تمامی فیلدهای اجباری الزامی است.',
                error: 'Bad Request',
            });
        }
        return response.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'خطایی در پردازش درخواست پایگاه داده رخ داد.',
            error: `Internal Server Error: ${message} - ${detail}`,
        });
    }
};
exports.DatabaseExceptionFilter = DatabaseExceptionFilter;
exports.DatabaseExceptionFilter = DatabaseExceptionFilter = DatabaseExceptionFilter_1 = __decorate([
    (0, common_1.Catch)(typeorm_1.QueryFailedError)
], DatabaseExceptionFilter);
//# sourceMappingURL=database-exception.filter.js.map