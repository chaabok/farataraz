import { NatureAdjustmentService } from '../../application/services/nature-adjustment.service';
export declare class NatureAdjustmentController {
    private readonly natureAdjustmentService;
    constructor(natureAdjustmentService: NatureAdjustmentService);
    getContraryBalances(fiscalYearId: number): Promise<{
        success: boolean;
        data: any[];
    }>;
    saveAdjustment(payload: any): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
}
