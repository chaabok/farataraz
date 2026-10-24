import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, Res } from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';
import { AuthService } from './auth.service';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './public.decorator';
import { Response } from 'express';
import { ActivityLogService } from '../core/services/activity-log.service';
import { ActivityAction } from '../core/entities/activity-log.entity';

class LoginDto {
  @IsString()
  @IsNotEmpty()
  username?: string;

  @IsString()
  @IsNotEmpty()
  password?: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private activityLogService: ActivityLogService
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() signInDto: LoginDto, @Res({ passthrough: true }) response: Response, @Request() req) {
    try {
      const user = await this.authService.validateUser(signInDto.username, signInDto.password);

      const result = await this.authService.login(user) as any;
      
      if (result && result.access_token) {
        this.activityLogService.logActionAsync({
          action: 'LOGIN' as ActivityAction,
          entityName: 'User',
          entityId: user.userId?.toString(), // FIX: use userId instead of id
          description: `کاربر ${user.username} وارد سیستم شد`,
          url: req.url,
          method: req.method,
          ipAddress: req.ip || req.connection?.remoteAddress,
          userAgent: req.headers['user-agent'],
          creator: user.userId // FIX: use userId instead of id
        });
        response.cookie('authentication', result.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days (or use an appropriate max age)
        });
        response.cookie('refresh_token', result.refresh_token, {
           httpOnly: true,
           secure: process.env.NODE_ENV === 'production',
           sameSite: 'lax',
           maxAge: 7 * 24 * 60 * 60 * 1000
        });
      }
      return result;
    } catch (error) {
      // Never log credentials or error internals containing sensitive data
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req, @Res({ passthrough: true }) response: Response) {
    this.activityLogService.logActionAsync({
      action: 'LOGOUT' as ActivityAction,
      entityName: 'User',
      entityId: req.user?.userId?.toString(),
      description: `کاربر از سیستم خارج شد`,
      url: req.url,
      method: req.method,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      creator: req.user?.userId
    });
    response.clearCookie('authentication');
    response.clearCookie('refresh_token');
    return this.authService.logout(req.user.userId);
  }

  @Public()
  @Post('refresh')
  async refresh(@Request() req, @Body('refresh_token') bodyRefreshToken: string, @Res({ passthrough: true }) response: Response) {
    const refreshToken = req.cookies?.['refresh_token'] || bodyRefreshToken;
    const result = await this.authService.refreshToken(refreshToken) as any;
    if (result && result.access_token) {
      response.cookie('authentication', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      response.cookie('refresh_token', result.refresh_token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'lax',
         maxAge: 7 * 24 * 60 * 60 * 1000
      });
    }
    return result;
  }

  @Public()
  @Post('2fa/verify')
  async verify2FA(@Body('userId') userId: number, @Body('token') token: string, @Res({ passthrough: true }) response: Response, @Request() req) {
    const result = await this.authService.verifyTwoFactor(userId, token) as any;
    if (result && result.access_token) {
      this.activityLogService.logActionAsync({
        action: 'LOGIN' as ActivityAction,
        entityName: 'User',
        entityId: userId?.toString(),
        description: `کاربر با استفاده از احراز هویت دو مرحله‌ای وارد سیستم شد`,
        url: req.url,
        method: req.method,
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        creator: userId
      });
      response.cookie('authentication', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      response.cookie('refresh_token', result.refresh_token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'lax',
         maxAge: 7 * 24 * 60 * 60 * 1000
      });
    }
    return result;
  }


  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  async generate2FA(@Request() req) {
    return this.authService.generateTwoFactorSecret(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  async enable2FA(@Request() req, @Body('token') token: string) {
    return this.authService.enableTwoFactor(req.user.userId, token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Request() req,
    @Body('oldPassword') oldPass: string,
    @Body('newPassword') newPass: string,
  ) {
    return this.authService.changePassword(req.user.userId, oldPass, newPass);
  }
}
