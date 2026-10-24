import { ProjectService } from '../services/project.service';
import { Project } from '../../domain/entities/project.entity';
export declare class ProjectController {
    private readonly projectService;
    constructor(projectService: ProjectService);
    findAll(): Promise<Project[]>;
    findOne(id: string): Promise<Project>;
    create(data: Partial<Project>): Promise<Project>;
    update(id: string, data: Partial<Project>): Promise<Project>;
    remove(id: string): Promise<void>;
}
