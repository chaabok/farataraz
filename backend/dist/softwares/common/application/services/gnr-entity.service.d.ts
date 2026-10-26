import { Repository, DataSource } from 'typeorm';
import { GnrEntity } from '../../domain/entities/gnr-entity.entity';
export declare class GnrEntityService {
    private readonly gnrEntityRepository;
    private readonly dataSource;
    constructor(gnrEntityRepository: Repository<GnrEntity>, dataSource: DataSource);
    seedEntities(): Promise<void>;
}
