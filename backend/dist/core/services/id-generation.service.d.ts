import { Repository } from 'typeorm';
import { IDGeneration } from '../entities/id-generation.entity';
export declare class IdGenerationService {
    private readonly idGenRepo;
    constructor(idGenRepo: Repository<IDGeneration>);
    private getNextIdGenerationId;
    private getTableInfoFromMetadata;
    private getMaxTableId;
    generateNextId(tableName: string): Promise<number>;
    generateNextIdBlock(tableName: string, count: number): Promise<number>;
}
