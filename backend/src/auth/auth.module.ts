import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../core/iam/entities/user.entity';
import { BaseSettings } from '../softwares/common/domain/entities/base-settings.entity';
import { CoreModule } from '../core/core.module';

@Module({
  imports: [
    forwardRef(() => CoreModule),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || (() => {
          if (process.env.NODE_ENV === 'production') {
            throw new Error('JWT_SECRET is not defined in production environment');
          }
          return 'fallback_secret_for_development';
        })(),
        signOptions: { expiresIn: '60m' },
      }),
    }),
    TypeOrmModule.forFeature([User, BaseSettings]),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
