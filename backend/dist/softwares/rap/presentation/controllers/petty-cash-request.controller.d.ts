import { PettyCashRequestService } from '../../application/services/petty-cash-request.service';
import { CreatePettyCashRequestDto } from '../../application/dtos/create-petty-cash-request.dto';
import { UpdatePettyCashRequestDto } from '../../application/dtos/update-petty-cash-request.dto';
export declare class PettyCashRequestController {
    private readonly service;
    constructor(service: PettyCashRequestService);
    create(createDto: CreatePettyCashRequestDto): Promise<{
        success: boolean;
        data: any;
    }>;
    findAll(query: any): Promise<{
        success: boolean;
        data: any[];
        total: number;
    }>;
    getNextNumbers(date: string): Promise<{
        success: boolean;
        data: {
            documentNumber: string;
            isDocumentNumberAuto: boolean;
            error: string;
        };
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: any;
    }>;
    update(id: string, updateDto: UpdatePettyCashRequestDto): Promise<{
        success: boolean;
        data: any;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
