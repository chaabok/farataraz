import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { UploadController } from './upload.controller';
import { FontsController } from './fonts.controller';
import { HelpController } from './help.controller';
import { PermissionsTreeController } from './permissions-tree.controller';
import { AiChatController } from './ai-chat.controller';
import { DbInitController } from './db-init.controller';
import { ReportsFilesController } from './reports-files.controller';
import { ReportsDbQueryController } from './reports-db-query.controller';
import { AccountingProxyController } from './accounting-proxy.controller';

/**
 * Gateway module (Task 5-a): consolidates the API surface that used to be
 * implemented as Next.js route handlers (app/api/**) into the NestJS backend,
 * giving every endpoint exact path parity under the global `api` prefix.
 *
 * It is imported FIRST in AppModule so the accounting proxy paths are matched
 * here and delegated in-process to the underlying report controllers.
 *
 * Auth: every gateway route is protected by the global JwtAuthGuard except
 * /api/help which is deliberately @Public() (the frontend HelpModal fetches
 * it without credentials; the content is static help text).
 */
@Module({
  imports: [CoreModule],
  controllers: [
    UploadController,
    FontsController,
    HelpController,
    PermissionsTreeController,
    AiChatController,
    DbInitController,
    ReportsFilesController,
    ReportsDbQueryController,
    AccountingProxyController,
  ],
})
export class GatewayModule {}
