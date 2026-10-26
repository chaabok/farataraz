import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { TrackingFactor } from './tracking-factor.entity';
export declare class TrackingFactorConstantValue extends AppBaseEntity {
    TrackingFactorConstantValueID: number;
    TrackingFactorRef: number;
    RowNumber: number;
    ConstantValue: string;
    trackingFactor: TrackingFactor;
}
