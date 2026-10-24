import { Request } from 'express';
import { PromissoryNoteService } from '../../application/services/promissory-note.service';
import { CreatePromissoryNoteDto } from '../../application/dtos/create-promissory-note.dto';
export declare class PromissoryNoteController {
    private readonly promissoryNoteService;
    constructor(promissoryNoteService: PromissoryNoteService);
    findAll(pageIndex?: string, pageSize?: string, sorting?: string, columnFilters?: string, globalFilter?: string, advancedFilters?: string): Promise<import("../../domain/entities/promissory-note.entity").PromissoryNote[] | {
        data: import("../../domain/entities/promissory-note.entity").PromissoryNote[];
        total: number;
    }>;
    getUnusedItems(): Promise<{
        data: any;
    }>;
    findOne(id: number): Promise<{
        data: import("../../domain/entities/promissory-note.entity").PromissoryNote;
    }>;
    create(req: Request, createDto: CreatePromissoryNoteDto): Promise<import("../../domain/entities/promissory-note.entity").PromissoryNote>;
    update(id: number, updateDto: any): Promise<import("../../domain/entities/promissory-note.entity").PromissoryNote>;
    remove(id: number): Promise<{
        success: boolean;
        id: number;
    }>;
}
