import { Entity, PrimaryColumn, Column , Generated, ManyToOne, JoinColumn} from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { BusinessStructureType } from './business-structure.enum';

@Entity({ schema: 'Gnr', name: 'BusinessStructure' })
export class BusinessStructure extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'BusinessStructureID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    businessStructureId: number;

  @Column({ 
    name: 'ParentRef', 
    type: 'bigint', 
    nullable: false, 
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  parentRef: number;

  @Column({ name: 'Code', type: 'varchar', length: 100, nullable: false })
  code: string;

  @Column({ name: 'Title', type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ name: 'Title_En', type: 'varchar', length: 255, nullable: false })
  title_en: string;

  @Column({ name: 'BusinessStructure', type: 'int', nullable: false })
  businessStructure: BusinessStructureType;

  @Column({ name: 'BusinessStructureName', type: 'varchar', length: 255, nullable: true })
  businessStructureName: string;

  @Column({ name: 'Manager', type: 'varchar', length: 255, nullable: true })
  manager: string;

  @Column({ name: 'IsActive', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'IsSystem', type: 'boolean', default: false })
  isSystem: boolean;

  @Column({ name: 'LogoUrl', type: 'text', nullable: true })
  logoUrl: string;

  @Column({ name: 'IsBasicInfoShared', type: 'boolean', default: false })
  isBasicInfoShared: boolean;

  @Column({ name: 'ActiveStructureTypes', type: 'varchar', length: 255, nullable: true })
  activeStructureTypes: string;

  // Overrides to disable self-referential foreign key constraints that block company/structure deletions
  @ManyToOne('BusinessStructure', { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'BusinessStructureRef', referencedColumnName: 'businessStructureId' })
  businessStructureEntity?: any;

  @ManyToOne('BusinessStructure', { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'CompanyRef', referencedColumnName: 'businessStructureId' })
  companyEntity?: any;

  @ManyToOne('BusinessStructure', { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'BranchRef', referencedColumnName: 'businessStructureId' })
  branchEntity?: any;

  @ManyToOne('BusinessStructure', { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'AgencyRef', referencedColumnName: 'businessStructureId' })
  agencyEntity?: any;
}

