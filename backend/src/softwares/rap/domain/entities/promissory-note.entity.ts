import { Entity, Column, PrimaryColumn, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { AppBaseEntity } from "../../../../core/entities/app-base.entity";
import { PromissoryNoteItem } from "./promissory-note-item.entity";
import { Cash } from "./cash.entity";

@Entity({ schema: 'Rap', name: 'PromissoryNotes' })
export class PromissoryNote extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'PromissoryNoteID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  promissoryNoteId: number;

  @ManyToOne(() => Cash)
  @JoinColumn({ name: "CashRef", referencedColumnName: "cashId" })
  cash: Cash;

  @Column({ name: "CashRef", type: "bigint", nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  cashRef: number;

  @Column({ name: "Series", type: "varchar", length: 50, nullable: true })
  series: string;

  @Column({ name: "LeafCount", type: "int", nullable: false })
  leafCount: number;

  @Column({ name: 'Status', type: 'int', default: 1 })
  status: number;

  @Column({ name: "StartSerial", type: "bigint", nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  startSerial: number;

  @Column({ name: "ValueEach", type: "decimal", precision: 18, scale: 2, nullable: false })
  valueEach: number;

  @OneToMany(() => PromissoryNoteItem, (item) => item.promissoryNote, { cascade: ["insert", "update"] })
  items: PromissoryNoteItem[];
}
