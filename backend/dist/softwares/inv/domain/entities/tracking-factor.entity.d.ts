import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { TrackingFactorItemRelated } from './tracking-factor-item-related.entity';
import { TrackingFactorConstantValue } from './tracking-factor-constant-value.entity';
export declare class TrackingFactor extends AppBaseEntity {
    TrackingFactorID: number;
    TrackingFactorCode: number;
    TrackingFactorName: string;
    TrackingFactorName2: string | null;
    TrackingFactorType: number;
    StartValue: string | null;
    EndValue: string | null;
    IsConstantValue: boolean;
    DisplayPriority: number;
    IsActive: boolean;
    relatedItems: TrackingFactorItemRelated[];
    constantValues: TrackingFactorConstantValue[];
}
