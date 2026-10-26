import { ChequebookService } from '../../application/services/chequebook.service';
import { CreateChequebookDto } from '../../application/dtos/create-chequebook.dto';
import { UpdateChequebookDto } from '../../application/dtos/update-chequebook.dto';
export declare class ChequebookController {
    private readonly chequebookService;
    constructor(chequebookService: ChequebookService);
    create(createDto: CreateChequebookDto): Promise<import("../../domain/entities/chequebook.entity").Chequebook>;
    findAll(query: any): Promise<{
        items: import("../../domain/entities/chequebook.entity").Chequebook[];
        total: number;
    }>;
    findOne(id: string): Promise<import("../../domain/entities/chequebook.entity").Chequebook>;
    update(id: string, updateDto: UpdateChequebookDto): Promise<import("../../domain/entities/chequebook.entity").Chequebook>;
    remove(id: string): Promise<{
        success: boolean;
        id: string;
    }>;
}
