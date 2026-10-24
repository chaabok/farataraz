import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, Index } from "typeorm";
import { AppBaseEntity } from "../../../../core/entities/app-base.entity";
import { PromissoryNote } from "./promissory-note.entity";

@Entity({ schema: 'Rap', name: 'PromissoryNoteItems' })
export class PromissoryNoteItem extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'PromissoryNoteItemID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  promissoryNoteItemId: number;

  @ManyToOne(() => PromissoryNote, (note) => note.items)
  @JoinColumn({ name: "PromissoryNoteRef", referencedColumnName: "promissoryNoteId" })
  promissoryNote: PromissoryNote;

  @Index()
  @Column({ name: "PromissoryNoteRef", type: "bigint", nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  promissoryNoteRef: number;

  @Column({ name: "PromissoryNoteNumber", type: "bigint", nullable: false })
  promissoryNoteNumber: number;

  @Column({ name: "Value", type: "decimal", precision: 18, scale: 2, nullable: false })
  value: number;

  @Column({ name: "Status", type: "int", default: 1 }) // 1: Unused, 2: Used, 3: Voided
  status: number;
}
