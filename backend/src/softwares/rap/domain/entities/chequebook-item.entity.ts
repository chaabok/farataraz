import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { AppBaseEntity } from "../../../../core/entities/app-base.entity";
import { Chequebook } from "./chequebook.entity";

export enum CheckStatus {
  NORMAL = 1,
  CANCELED = 2,
  ISSUED = 3,
  PASSED = 4,
}

@Entity({ schema: 'Rap', name: 'ChequebookItems' })
export class ChequebookItem extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'ChequebookItemID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  chequebookItemId: number;

  @ManyToOne(() => Chequebook, cb => cb.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "ChequebookRef", referencedColumnName: "chequebookId" })
  chequebook: Chequebook;

  @Column({ name: "ChequebookRef", type: "bigint", nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  chequebookRef: number;

  @Column({ name: "CheckNumber", type: "bigint", nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  } })
  checkNumber: number;

  @Column({ name: "Receiver", type: "varchar", length: 255, nullable: true })
  receiver: string;

  @Column({ name: "IssueDate", type: "varchar", length: 15, nullable: true })
  issueDate: string;

  @Column({ name: "Amount", type: "numeric", precision: 20, scale: 4, nullable: true, transformer: {
    to: (value: number | null) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseFloat(value.toString()) : null
  } })
  amount: number;

  @Column({ name: "Status", type: "int", default: CheckStatus.NORMAL })
  status: CheckStatus;
}
