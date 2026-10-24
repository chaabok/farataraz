import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'LicenseActivations', schema: 'Gnr' })
export class LicenseActivation {
  @PrimaryColumn({ type: 'bigint' })
  LicenseActivationID: string;

  @Column({ type: 'varchar', unique: true })
  licenseSignature: string;

  @Column({ type: 'boolean', default: false })
  isActivated: boolean;

  @Column({ type: 'timestamp', nullable: true })
  firstPromptAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
