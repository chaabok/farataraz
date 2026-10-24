import { SeedInitializerService } from '../../application/services/seed-initializer.service';
export declare class SeedController {
    private readonly seedInitializerService;
    constructor(seedInitializerService: SeedInitializerService);
    runSeedStep(companyId: number, step: string): Promise<{
        success: boolean;
        message?: string;
    }>;
    unseedStep(companyId: number, step: string): Promise<{
        success: boolean;
        message?: string;
    }>;
}
