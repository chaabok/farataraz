import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../core/iam/entities/user.entity';
import { BaseSettings } from '../softwares/common/domain/entities/base-settings.entity';
export declare class AuthService {
    private jwtService;
    private readonly userRepository;
    private readonly baseSettingsRepository;
    constructor(jwtService: JwtService, userRepository: Repository<User>, baseSettingsRepository: Repository<BaseSettings>);
    private generateOtp;
    private verifyOtp;
    validateUser(username: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            username: any;
            firstName: any;
            lastName: any;
            permissions: any;
        };
    } | {
        requires_2fa: boolean;
        userId: any;
        twofa_method: string;
    }>;
    private generateTokens;
    verifyTwoFactor(userId: number, token: string): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            username: any;
            firstName: any;
            lastName: any;
            permissions: any;
        };
    }>;
    generateTwoFactorSecret(userId: number): Promise<{
        secret: any;
        qrCodeDataUrl: string;
    }>;
    enableTwoFactor(userId: number, token: string): Promise<{
        success: boolean;
    }>;
    changePassword(userId: number, oldPass: string, newPass: string): Promise<{
        success: boolean;
    }>;
    refreshToken(token: string): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            username: any;
            firstName: any;
            lastName: any;
            permissions: any;
        };
    } | {
        requires_2fa: boolean;
        userId: any;
        twofa_method: string;
    }>;
    logout(userId: number): Promise<{
        success: boolean;
    }>;
    private validateUserById;
}
