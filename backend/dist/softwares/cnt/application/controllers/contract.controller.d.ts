import { ContractService } from '../services/contract.service';
import { Contract } from '../../domain/entities/contract.entity';
export declare class ContractController {
    private readonly contractService;
    constructor(contractService: ContractService);
    checkDuplicate(field: string, value: string): Promise<{
        isDuplicate: boolean;
    }>;
    findAll(): Promise<Contract[]>;
    findOne(id: string): Promise<Contract>;
    create(data: Partial<Contract>): Promise<Contract>;
    update(id: string, data: Partial<Contract>): Promise<Contract>;
    remove(id: string): Promise<void>;
}
