import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from '../../core/core.module';
import { DynamicForm } from './domain/entities/dynamic-form.entity';
import { DynamicFormRecord } from './domain/entities/dynamic-form-record.entity';
import { DynamicMenu } from './domain/entities/dynamic-menu.entity';
import { DynamicFormRepository } from './infrastructure/repositories/dynamic-form.repository';
import { DynamicFormRecordRepository } from './infrastructure/repositories/dynamic-form-record.repository';
import { IDynamicFormRepositoryToken } from './domain/repositories/dynamic-form.repository.interface';
import { IDynamicFormRecordRepositoryToken } from './domain/repositories/dynamic-form-record.repository.interface';
import { DynamicFormService } from './application/services/dynamic-form.service';
import { DynamicFormController } from './presentation/controllers/dynamic-form.controller';
import { DynamicMenuController } from './presentation/controllers/dynamic-menu.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([DynamicForm, DynamicFormRecord, DynamicMenu]),
    CoreModule,
  ],
  controllers: [DynamicFormController, DynamicMenuController],
  providers: [
    {
      provide: IDynamicFormRepositoryToken,
      useClass: DynamicFormRepository,
    },
    {
      provide: IDynamicFormRecordRepositoryToken,
      useClass: DynamicFormRecordRepository,
    },
    DynamicFormService,
  ],
  exports: [
    DynamicFormService,
    IDynamicFormRepositoryToken,
    IDynamicFormRecordRepositoryToken,
  ],
})
export class DfbModule {}
