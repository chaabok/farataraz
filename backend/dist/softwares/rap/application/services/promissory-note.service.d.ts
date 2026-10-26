import { IPromissoryNoteRepository } from '../../domain/repositories/promissory-note.repository.interface';
import { CreatePromissoryNoteDto } from '../dtos/create-promissory-note.dto';
export declare class PromissoryNoteService {
    private readonly repository;
    constructor(repository: IPromissoryNoteRepository);
    findAll(): Promise<import("../../domain/entities/promissory-note.entity").PromissoryNote[]>;
    findWithPagination(params: any): Promise<{
        data: import("../../domain/entities/promissory-note.entity").PromissoryNote[];
        total: number;
    }>;
    findOne(id: number): Promise<{
        data: import("../../domain/entities/promissory-note.entity").PromissoryNote;
    }>;
    findUnusedItems(): Promise<any>;
    create(data: CreatePromissoryNoteDto): Promise<import("../../domain/entities/promissory-note.entity").PromissoryNote>;
    update(id: number, data: any): Promise<import("../../domain/entities/promissory-note.entity").PromissoryNote>;
    remove(id: number): Promise<void>;
}
