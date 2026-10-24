import { Column, VersionColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate, ManyToOne, JoinColumn } from 'typeorm';

export abstract class AppBaseEntity {
  @VersionColumn({ 
    name: 'Version', 
    type: 'bigint', 
    default: 1,
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 1
    }
  })
  version: number;

  @Column({ 
    name: 'Creator', 
    type: 'bigint', 
    nullable: false, 
    default: 1,
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 1
    }
  })
  creator: number;

  @CreateDateColumn({ name: 'CreationDate', nullable: false })
  creationDate: Date;

  @Column({ name: 'CreateTime', type: 'varchar', length: 8, nullable: false, default: '00:00:00' })
  createTime: string;

  @Column({ 
    name: 'LastModifier', 
    type: 'bigint', 
    nullable: false, 
    default: 1,
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 1
    }
  })
  lastModifier: number;

  @UpdateDateColumn({ name: 'LastModificationDate', nullable: false })
  lastModificationDate: Date;

  @Column({ name: 'LastModificationTime', type: 'varchar', length: 8, nullable: false, default: '00:00:00' })
  lastModificationTime: string;

  @Column({ 
    name: 'BusinessStructureRef', 
    type: 'bigint', 
    nullable: false, 
    default: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 2
    }
  })
  businessStructureRef: number;

  @ManyToOne('BusinessStructure', { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'BusinessStructureRef', referencedColumnName: 'businessStructureId' })
  businessStructureEntity?: any;

  @Column({ 
    name: 'CompanyRef', 
    type: 'bigint', 
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
    }
  })
  companyRef?: number;

  @ManyToOne('BusinessStructure', { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'CompanyRef', referencedColumnName: 'businessStructureId' })
  companyEntity?: any;

  @Column({ 
    name: 'BranchRef', 
    type: 'bigint', 
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
    }
  })
  branchRef?: number;

  @ManyToOne('BusinessStructure', { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'BranchRef', referencedColumnName: 'businessStructureId' })
  branchEntity?: any;

  @Column({ 
    name: 'AgencyRef', 
    type: 'bigint', 
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
    }
  })
  agencyRef?: number;

  @ManyToOne('BusinessStructure', { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'AgencyRef', referencedColumnName: 'businessStructureId' })
  agencyEntity?: any;

  @BeforeInsert()
  setCreateTime() {
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0]; // "HH:MM:SS"
    this.createTime = timeString;
    this.lastModificationTime = timeString;
  }

  @BeforeUpdate()
  setUpdateTime() {
    const now = new Date();
    this.lastModificationTime = now.toTimeString().split(' ')[0];
  }
}
