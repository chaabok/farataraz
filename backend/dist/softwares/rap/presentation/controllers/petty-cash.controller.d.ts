import { PettyCashService } from '../../application/services/petty-cash.service';
import { CreatePettyCashDto } from '../../application/dtos/create-petty-cash.dto';
import { UpdatePettyCashDto } from '../../application/dtos/update-petty-cash.dto';
export declare class PettyCashController {
    private readonly service;
    constructor(service: PettyCashService);
    create(createDto: CreatePettyCashDto): Promise<import("../../domain/entities/petty-cash.entity").PettyCash>;
    findAll(): Promise<import("../../domain/entities/petty-cash.entity").PettyCash[]>;
    isUsed(id: string): Promise<boolean>;
    findOne(id: string): Promise<import("../../domain/entities/petty-cash.entity").PettyCash>;
    update(id: string, updateDto: UpdatePettyCashDto): Promise<import("../../domain/entities/petty-cash.entity").PettyCash>;
    remove(id: string): Promise<void>;
}
