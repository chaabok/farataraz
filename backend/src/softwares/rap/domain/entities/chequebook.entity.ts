import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { AppBaseEntity } from "../../../../core/entities/app-base.entity";
import { BankAccount } from "./bank-account.entity";
import { ChequebookItem } from "./chequebook-item.entity";

@Entity({ schema: 'Rap', name: 'Chequebooks' })
export class Chequebook extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'ChequebookID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  chequebookId: number;

  @ManyToOne(() => BankAccount)
  @JoinColumn({ name: "BankAccountRef", referencedColumnName: "bankAccountId" })
  bankAccount: BankAccount;

  @Column({ name: "BankAccountRef", type: "bigint", nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  bankAccountRef: number;

  @Column({ name: "Series", type: "varchar", length: 50, nullable: true })
  series: string;

  @Column({ name: "LeafCount", type: "int", nullable: false })
  leafCount: number;

  @Column({ name: "StartSerial", type: "bigint", nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  startSerial: number;

  @Column({ name: "IsActive", type: "boolean", default: true })
  isActive: boolean;

  @OneToMany(() => ChequebookItem, (item) => item.chequebook, { cascade: ["insert", "update", "remove"], eager: true })
  items: ChequebookItem[];
}
