import { RapReasonNature } from '../../domain/entities/rap-reason.entity';
export declare class CreateRapReasonDto {
    Code?: string;
    Title: string;
    Title_En?: string;
    AccountRef?: number | null;
    Nature?: RapReasonNature;
    Description?: string;
    IsActive?: boolean;
    ParentRef?: number | null;
}
