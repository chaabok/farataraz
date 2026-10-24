import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
export declare class BaseSettings extends AppBaseEntity {
    baseSettingsID: number;
    tabRef: number;
    key: string;
    value: string;
}
