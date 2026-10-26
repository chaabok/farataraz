import { ChequePrintTemplate } from '../entities/cheque-print-template.entity';
export declare const IChequePrintTemplateRepositoryToken: unique symbol;
export interface IChequePrintTemplateRepository {
    create(data: Partial<ChequePrintTemplate>): Promise<ChequePrintTemplate>;
    update(id: number, data: Partial<ChequePrintTemplate>): Promise<ChequePrintTemplate>;
    delete(id: number): Promise<void>;
    findById(id: number): Promise<ChequePrintTemplate | null>;
    findAll(): Promise<ChequePrintTemplate[]>;
    findAdvanced(params: any): Promise<[ChequePrintTemplate[], number]>;
}
