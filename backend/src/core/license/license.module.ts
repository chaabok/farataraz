import { Global, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LicenseActivation } from './entities/license-activation.entity';
import { LicenseService } from './license.service';
import { LicenseController } from './license.controller';
import { CoreModule } from '../core.module';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([LicenseActivation]), forwardRef(() => CoreModule)],
  providers: [LicenseService],
  controllers: [LicenseController],
  exports: [LicenseService],
})
export class LicenseModule {}
