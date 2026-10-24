import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IDGeneration } from './entities/id-generation.entity';
import { ActivityLog } from './entities/activity-log.entity';
import { IdGenerationService } from './services/id-generation.service';
import { DatabaseSchemaService } from './services/database-schema.service';
import { IamModule } from './iam/iam.module';
import { LicenseModule } from './license/license.module';
import { RequestContextService } from './services/request-context.service';
import { EntityAuditSubscriber } from './subscribers/entity-audit.subscriber';
import { ActivityLogService } from './services/activity-log.service';
import { ActivityLogController } from './activity-log.controller';
import { UsageCheckService } from './services/usage-check.service';
import { UsageCheckController } from './controllers/usage-check.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([IDGeneration, ActivityLog]),
    IamModule,
    LicenseModule,
  ],
  controllers: [ActivityLogController, UsageCheckController],
  providers: [
    IdGenerationService,
    DatabaseSchemaService,
    RequestContextService,
    ActivityLogService,
    EntityAuditSubscriber,
    UsageCheckService,
  ],
  exports: [TypeOrmModule, IdGenerationService, DatabaseSchemaService, IamModule, LicenseModule, RequestContextService, ActivityLogService, UsageCheckService],
})
export class CoreModule {}
