declare class PromissoryNoteItemDto {
    promissoryNoteNumber: number;
    value: number;
    status: number;
}
export declare class CreatePromissoryNoteDto {
    cashRef: number;
    series: string;
    leafCount: number;
    startSerial: number;
    valueEach: number;
    status?: number;
    items: PromissoryNoteItemDto[];
}
export {};
