import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { UserRole } from './entities/user-role.entity';
import { UserGroup } from './entities/user-group.entity';
import { UserGroupPermission } from './entities/user-group-permission.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UserActivityInterceptor } from './interceptors/user-activity.interceptor';
import { BusinessStructureUsers } from './entities/business-structure-user.entity';
import { IamService } from './services/iam.service';
import { IamController } from './controllers/iam.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      Permission,
      RolePermission,
      UserRole,
      UserGroup,
      UserGroupPermission,
      BusinessStructureUsers,
    ]),
  ],
  providers: [
    IamService,
    {
      provide: APP_INTERCEPTOR,
      useClass: UserActivityInterceptor,
    },
  ],
  controllers: [IamController],
  exports: [IamService],
})
export class IamModule {}
