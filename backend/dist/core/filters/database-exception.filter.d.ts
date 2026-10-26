import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';
export declare class DatabaseExceptionFilter implements ExceptionFilter {
    private readonly logger;
    private readonly tableToFormMap;
    catch(exception: QueryFailedError, host: ArgumentsHost): Response<any, Record<string, any>>;
}
