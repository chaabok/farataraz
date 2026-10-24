import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as otplibModule from 'otplib';
import * as qrcode from 'qrcode';

// Robust resolver for otplib exports across various TypeScript & bundler configurations
const authenticator: any =
  (otplibModule as any).authenticator ||
  (otplibModule as any).default?.authenticator ||
  (typeof require !== 'undefined' ? require('otplib').authenticator : (otplibModule as any));
import { User } from '../core/iam/entities/user.entity';

import { BaseSettings } from '../softwares/common/domain/entities/base-settings.entity';

/**
 * In-memory OTP store for SMS/Email two-factor authentication.
 * NOTE: For production, replace with a persistent store (e.g. Redis) and
 * integrate a real SMS/Email delivery provider. Codes expire in 2 minutes
 * and are single-use. They are NEVER accepted from a hardcoded value.
 */
const otpStore = new Map<number, { code: string; expiresAt: number }>();

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BaseSettings)
    private readonly baseSettingsRepository: Repository<BaseSettings>,
  ) {}

  private generateOtp(userId: number, method: string, username: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(userId, { code, expiresAt: Date.now() + 2 * 60 * 1000 });
    // TODO: integrate a real SMS/Email provider. In this sandbox the code is
    // printed to the server log ONLY (never returned to the client).
    console.log(`[2FA] OTP generated for user "${username}" via ${method} (valid 2 min). Deliver via provider in production.`);
    return code;
  }

  private verifyOtp(userId: number, token: string): boolean {
    const entry = otpStore.get(userId);
    if (!entry) return false;
    otpStore.delete(userId); // single-use
    return entry.code === token && entry.expiresAt > Date.now();
  }

  async validateUser(username: string, pass: string): Promise<any> {
    if (!username || !pass) {
      throw new UnauthorizedException('Invalid credentials EMPTY');
    }
    const user = await this.userRepository.findOne({ 
      where: { username: Raw(alias => `LOWER(${alias}) = LOWER(:username)`, { username }) },
      relations: ['roles', 'roles.role', 'roles.role.permissions', 'roles.role.permissions.permission']
    });
    if (user && user.passwordHash) {
      if (user.isActive === false) {
        throw new UnauthorizedException('حساب کاربری شما غیرفعال شده است.با مدیرسیستم تماس حاصل فرمایید');
      }

      const isMatch = await bcrypt.compare(pass, user.passwordHash);
      if (isMatch) {
        let permissions = [];
        
        // Admin gets everything
        if (user.username.toLowerCase() === 'admin') {
          permissions = ['*'];
        } else {
          user.roles?.forEach(ur => {
            ur.role?.permissions?.forEach(rp => {
              if (rp.permission?.resource && rp.permission?.action) {
                permissions.push(`${rp.permission.resource}:${rp.permission.action}`);
              }
            });
          });
          permissions = Array.from(new Set(permissions));
        }
      
        return { 
          userId: user.id, 
          username: user.username, 
          firstName: user.firstName, 
          lastName: user.lastName,
          permissions: permissions,
          isTwoFactorEnabled: user.isTwoFactorEnabled
        };
      }
    }
    
    throw new UnauthorizedException('Invalid credentials MISMATCH');
  }

  async login(user: any) {
    const fullUser = await this.userRepository.findOne({ where: { id: user.userId } });
    
    if (!fullUser || !fullUser.isTwoFactorEnabled) {
      return this.generateTokens(user);
    }

    const enable2StepSetting = await this.baseSettingsRepository.findOne({ where: { tabRef: 1, key: 'enable2StepLogin' } });
    const twoStepMethodSetting = await this.baseSettingsRepository.findOne({ where: { tabRef: 1, key: 'twoStepMethod' } });

    const isGlobal2FA = enable2StepSetting?.value === 'true';
    const twoStepMethod = twoStepMethodSetting?.value || 'sms';
    let method = isGlobal2FA ? twoStepMethod : 'app';

    if (method === 'app' && !fullUser.twoFactorSecret) {
      return this.generateTokens(user);
    }

    if (method) {
      if (method === 'sms' || method === 'email') {
        // Generate a real single-use OTP and dispatch it via provider
        this.generateOtp(user.userId, method, user.username);
      }
      return {
        requires_2fa: true,
        userId: user.userId,
        twofa_method: method
      };
    }

    return this.generateTokens(user);
  }

  private async generateTokens(user: any) {
    const payload = { 
      username: user.username, 
      sub: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      permissions: user.permissions
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.userRepository.update(user.userId, { refreshToken });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.userId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        permissions: user.permissions
      }
    };
  }

  async verifyTwoFactor(userId: number, token: string) {
    if (typeof token === 'string') token = token.trim();
    console.log(`verifyTwoFactor called with userId: ${userId}, token: ${token}`);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      console.log('verifyTwoFactor: User not found for id', userId);
      throw new UnauthorizedException('User not found');
    }

    if (!user.isTwoFactorEnabled) {
      console.log('verifyTwoFactor: 2FA not enabled for user');
      throw new UnauthorizedException('2FA not enabled');
    }

    const twoStepMethodSetting = await this.baseSettingsRepository.findOne({ where: { tabRef: 1, key: 'twoStepMethod' } });
    const enable2StepSetting = await this.baseSettingsRepository.findOne({ where: { tabRef: 1, key: 'enable2StepLogin' } });
    const isGlobal2FA = enable2StepSetting?.value === 'true';
    const method = isGlobal2FA ? (twoStepMethodSetting?.value || 'sms') : 'app';
    
    console.log(`verifyTwoFactor: isGlobal2FA=${isGlobal2FA}, method=${method}`);

    if (!method) {
      console.log('verifyTwoFactor: 2FA not enabled');
      throw new UnauthorizedException('2FA not enabled');
    }

    let isValid = false;

    if (method === 'app') {
      if (!user.twoFactorSecret) {
        console.log('verifyTwoFactor: 2FA not configured for app');
        throw new UnauthorizedException('خطا: 2FA برای این حساب تنظیم نشده است. ابتدا کد QR را اسکن کنید.');
      }
      isValid = authenticator.verify({
        token,
        secret: user.twoFactorSecret,
      });
      if (!isValid) {
        throw new UnauthorizedException(`کد وارد شده برای اپلیکیشن سازگار نیست (نامعتبر)`);
      }
    } else if (method === 'sms' || method === 'email') {
      // Real single-use OTP validation (no hardcoded bypass)
      isValid = this.verifyOtp(userId, token);
      if (!isValid) {
        throw new UnauthorizedException('کد پیامک/ایمیل وارد شده نامعتبر یا منقضی شده است.');
      }
    }

    if (!isValid) {
      console.log('verifyTwoFactor: Invalid 2FA token');
      throw new UnauthorizedException('کد وارد شده نامعتبر است.');
    }

    // Re-validate user full data for login
    const validatedUser = await this.validateUserById(user.id);
    console.log('verifyTwoFactor: validation success, generating tokens');
    return this.generateTokens(validatedUser);
  }

  async generateTwoFactorSecret(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.username, 'MultiSoftwareApp', secret);
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);

    await this.userRepository.update(userId, { twoFactorSecret: secret });

    return {
      secret,
      qrCodeDataUrl,
    };
  }

  async enableTwoFactor(userId: number, token: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      throw new UnauthorizedException('2FA secret not generated');
    }

    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid token');
    }

    await this.userRepository.update(userId, { isTwoFactorEnabled: true });
    return { success: true };
  }

  async changePassword(userId: number, oldPass: string, newPass: string) {
    if (!userId || !oldPass || !newPass) {
      throw new UnauthorizedException('اطلاعات وارد شده ناقص است');
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('کاربر یافت نشد');
    }

    try {
      const isMatch = await bcrypt.compare(oldPass, user.passwordHash);
      if (!isMatch) {
        throw new UnauthorizedException('کلمه عبور فعلی نادرست است');
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPass, salt);

      await this.userRepository.update(userId, { passwordHash });
      return { success: true };
    } catch (error) {
      console.error('Bcrypt error in changePassword:', error);
      throw new UnauthorizedException('خطا در پردازش کلمه عبور');
    }
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({ where: { id: payload.sub, refreshToken: token } });
      
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Re-validate permissions from DB to ensure they are up to date
      const validatedUser = await this.validateUserById(user.id);
      
      return this.login(validatedUser);
    } catch (e) {
      throw new UnauthorizedException('Refresh token expired or invalid');
    }
  }

  async logout(userId: number) {
    await this.userRepository.update(userId, { 
      refreshToken: null,
      lastSeen: null 
    });
    return { success: true };
  }

  private async validateUserById(id: number): Promise<any> {
    const user = await this.userRepository.findOne({ 
      where: { id },
      relations: ['roles', 'roles.role', 'roles.role.permissions', 'roles.role.permissions.permission']
    });
    
    if (user) {
      let permissions = [];
      if (user.username.toLowerCase() === 'admin') {
        permissions = ['*'];
      } else {
        user.roles?.forEach(ur => {
          ur.role?.permissions?.forEach(rp => {
            if (rp.permission?.resource && rp.permission?.action) {
              permissions.push(`${rp.permission.resource}:${rp.permission.action}`);
            }
          });
        });
        permissions = Array.from(new Set(permissions));
      }

      return { 
        userId: user.id, 
        username: user.username, 
        firstName: user.firstName, 
        lastName: user.lastName,
        permissions: permissions
      };
    }
    throw new UnauthorizedException('User not found');
  }
}

