import { IChequePrintTemplateRepository } from '../../domain/repositories/cheque-print-template.repository.interface';
import { ChequePrintTemplate } from '../../domain/entities/cheque-print-template.entity';
export declare class ChequePrintTemplateService {
    private readonly repo;
    constructor(repo: IChequePrintTemplateRepository);
    create(createDto: any): Promise<ChequePrintTemplate>;
    update(id: number, updateDto: any): Promise<ChequePrintTemplate>;
    findAll(): Promise<ChequePrintTemplate[]>;
    findWithPagination(params: any): Promise<{
        items: ChequePrintTemplate[];
        total: number;
    }>;
    findOne(id: number): Promise<ChequePrintTemplate>;
    remove(id: number): Promise<void>;
}
