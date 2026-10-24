import { Entity, PrimaryColumn, Generated, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity({ name: 'IDGeneration', schema: 'Gnr' })
@Unique(['tableName'])
export class IDGeneration {
  @PrimaryColumn({ 
    name: 'IDGenerationID',
    type: 'bigint',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    idGenerationId: number;

  @Column({ type: 'varchar', length: 255, name: 'TableName' })
  tableName: string;

  @Column({ 
    type: 'bigint', 
    name: 'LastID', 
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  lastId: number;
}
