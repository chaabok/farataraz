import { AuthService } from './auth.service';
import { Response } from 'express';
import { ActivityLogService } from '../core/services/activity-log.service';
declare class LoginDto {
    username?: string;
    password?: string;
}
export declare class AuthController {
    private authService;
    private activityLogService;
    constructor(authService: AuthService, activityLogService: ActivityLogService);
    login(signInDto: LoginDto, response: Response, req: any): Promise<any>;
    logout(req: any, response: Response): Promise<{
        success: boolean;
    }>;
    refresh(req: any, bodyRefreshToken: string, response: Response): Promise<any>;
    verify2FA(userId: number, token: string, response: Response, req: any): Promise<any>;
    generate2FA(req: any): Promise<{
        secret: any;
        qrCodeDataUrl: string;
    }>;
    enable2FA(req: any, token: string): Promise<{
        success: boolean;
    }>;
    changePassword(req: any, oldPass: string, newPass: string): Promise<{
        success: boolean;
    }>;
}
export {};
