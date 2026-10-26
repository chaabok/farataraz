import { PromissoryNote } from "../entities/promissory-note.entity";
export interface IPromissoryNoteRepository {
    findAll(): Promise<PromissoryNote[]>;
    findWithPagination?(params: any): Promise<{
        data: PromissoryNote[];
        total: number;
    }>;
    findById(id: number): Promise<PromissoryNote | null>;
    create(data: Partial<PromissoryNote>): Promise<PromissoryNote>;
    update(id: number, data: Partial<PromissoryNote>): Promise<PromissoryNote>;
    delete(id: number): Promise<void>;
}
export declare const IPromissoryNoteRepositoryToken: unique symbol;
