import { AppBaseEntity } from "../../../../core/entities/app-base.entity";
import { PromissoryNoteItem } from "./promissory-note-item.entity";
import { Cash } from "./cash.entity";
export declare class PromissoryNote extends AppBaseEntity {
    promissoryNoteId: number;
    cash: Cash;
    cashRef: number;
    series: string;
    leafCount: number;
    status: number;
    startSerial: number;
    valueEach: number;
    items: PromissoryNoteItem[];
}
