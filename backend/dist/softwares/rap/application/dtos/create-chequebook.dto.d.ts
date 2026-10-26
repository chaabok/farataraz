export declare class ChequebookItemDto {
    chequebookItemId?: number;
    chequebookRef?: number;
    checkNumber: number;
    receiver?: string;
    issueDate?: string;
    amount?: number;
    status: number;
}
export declare class CreateChequebookDto {
    bankAccountRef: number;
    series?: string;
    leafCount: number;
    startSerial: number;
    isActive?: boolean;
    items?: ChequebookItemDto[];
}
