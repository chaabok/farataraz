import { IChequebookRepository } from '../../domain/repositories/chequebook.repository.interface';
import { CreateChequebookDto } from '../dtos/create-chequebook.dto';
import { UpdateChequebookDto } from '../dtos/update-chequebook.dto';
import { Chequebook } from '../../domain/entities/chequebook.entity';
import { ActivityLogService } from '../../../../core/services/activity-log.service';
export declare class ChequebookService {
    private readonly chequebookRepository;
    private readonly activityLogService;
    constructor(chequebookRepository: IChequebookRepository, activityLogService: ActivityLogService);
    create(createDto: CreateChequebookDto): Promise<Chequebook>;
    update(id: number, updateDto: UpdateChequebookDto): Promise<Chequebook>;
    delete(id: number): Promise<void>;
    findById(id: number): Promise<Chequebook | null>;
    findAll(options?: any): Promise<{
        items: Chequebook[];
        total: number;
    }>;
}
