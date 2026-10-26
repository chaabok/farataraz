import { OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
export declare class DatabaseSchemaService implements OnModuleInit {
    private dataSource;
    constructor(dataSource: DataSource);
    onModuleInit(): Promise<void>;
    ensureSchemas(): Promise<void>;
}
