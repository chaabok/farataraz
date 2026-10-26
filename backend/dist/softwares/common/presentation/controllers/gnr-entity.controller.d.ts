import { Repository } from 'typeorm';
import { GnrEntity } from '../../domain/entities/gnr-entity.entity';
export declare class GnrEntityController {
    private readonly gnrEntityRepository;
    constructor(gnrEntityRepository: Repository<GnrEntity>);
    findAll(): Promise<{
        data: GnrEntity[];
    }>;
}
