import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
export declare class ChequePrintTemplate extends AppBaseEntity {
    chequePrintTemplateId: number;
    bankRef: number;
    title: string;
    imageBlob: string;
    config: any;
}
