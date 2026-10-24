import { AppBaseEntity } from "../../../../core/entities/app-base.entity";
import { PromissoryNote } from "./promissory-note.entity";
export declare class PromissoryNoteItem extends AppBaseEntity {
    promissoryNoteItemId: number;
    promissoryNote: PromissoryNote;
    promissoryNoteRef: number;
    promissoryNoteNumber: number;
    value: number;
    status: number;
}
