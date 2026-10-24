import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  // Mapping from table names to Persian "Form" names
  private readonly tableToFormMap: Record<string, string> = {
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

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message;
    const detail = (exception as any).detail || '';
    const code = (exception as any).code;

    // Foreign Key Constraint Violation (Postgres: 23503, SQLite: SQLITE_CONSTRAINT)
    if (code === '23503' || 
        message.includes('FOREIGN KEY constraint failed') || 
        (message.includes('violates') && message.includes('foreign key constraint'))) {
      let formName = 'بخش‌های دیگر';

      // Combine message and detail for comprehensive search
      const fullError = `${message} ${detail}`;

      // 1. Try Postgres specific detail: referenced from table "X"
      // It might include schema like "Rap"."BankBranchs" or simply "BankBranchs"
      const pgMatch = fullError.match(/referenced from table (?:"?[\w\d_]+"?"?\.)?"?([\w\d_]+)"?/i);
      
      // 2. Try generic Postgres/other pattern: on table "X" 
      // Error example: update or delete on table "Banks" violates ... on table "BankBranchs"
      // We want the LAST one (the child table that holds the reference)
      const genericMatches = Array.from(fullError.matchAll(/on table (?:"?[\w\d_]+"?"?\.)?"?([\w\d_]+)"?/gi));
      const genericMatch = genericMatches.length > 0 ? genericMatches[genericMatches.length - 1] : null;

      let tableName = '';
      if (pgMatch && pgMatch[1]) {
        tableName = pgMatch[1];
      } else if (genericMatch && genericMatch[1]) {
        tableName = genericMatch[1];
      }

      if (tableName) {
        formName = this.tableToFormMap[tableName] || tableName;
      } else {
        // 3. Fallback: scan the map for any known table names in the error
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

      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `از این اطلاعات در فرم "${formName}" استفاده شده است.`,
        error: 'Bad Request',
      });
    }

    this.logger.error(`Database Error: ${message}`, exception.stack);

    // Unique Constraint Violation (Postgres: 23505)
    if (code === '23505' || message.includes('UNIQUE constraint failed')) {
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'اطلاعات وارد شده تکراری است.',
          error: 'Bad Request',
        });
    }

    // Invalid Input Syntax (Postgres: 22P02)
    if (code === '22P02' || message.includes('invalid input syntax')) {
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'مقدار وارد شده برای یکی از فیلدها معتبر نمی‌باشد.',
          error: 'Bad Request',
        });
    }

    // Not-Null Violation (Postgres: 23502)
    if (code === '23502' || message.includes('null value in column')) {
        this.logger.warn(`Not-Null Violation (23502): ${message} ${detail}`);
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'تکمیل تمامی فیلدهای اجباری الزامی است.',
          error: 'Bad Request',
        });
    }

    // Default database error response
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'خطایی در پردازش درخواست پایگاه داده رخ داد.',
      error: `Internal Server Error: ${message} - ${detail}`,
    });
  }
}
