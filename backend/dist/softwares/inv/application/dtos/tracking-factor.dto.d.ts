export declare class RelatedItemDto {
    ItemRef: number;
}
export declare class ConstantValueDto {
    RowNumber?: number;
    ConstantValue: string;
}
export declare class CreateTrackingFactorDto {
    TrackingFactorCode?: number;
    TrackingFactorName: string;
    TrackingFactorName2?: string;
    TrackingFactorType?: number;
    StartValue?: string;
    EndValue?: string;
    IsConstantValue?: boolean;
    DisplayPriority?: number;
    IsActive?: boolean;
    relatedItemIds?: number[];
    relatedItems?: RelatedItemDto[];
    constantValues?: ConstantValueDto[];
}
export declare class UpdateTrackingFactorDto {
    TrackingFactorCode?: number;
    TrackingFactorName?: string;
    TrackingFactorName2?: string;
    TrackingFactorType?: number;
    StartValue?: string;
    EndValue?: string;
    IsConstantValue?: boolean;
    DisplayPriority?: number;
    IsActive?: boolean;
    relatedItemIds?: number[];
    relatedItems?: RelatedItemDto[];
    constantValues?: ConstantValueDto[];
}
