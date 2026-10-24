"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const otplibModule = __importStar(require("otplib"));
const qrcode = __importStar(require("qrcode"));
const authenticator = otplibModule.authenticator ||
    otplibModule.default?.authenticator ||
    (typeof require !== 'undefined' ? require('otplib').authenticator : otplibModule);
const user_entity_1 = require("../core/iam/entities/user.entity");
const base_settings_entity_1 = require("../softwares/common/domain/entities/base-settings.entity");
const otpStore = new Map();
let AuthService = class AuthService {
    constructor(jwtService, userRepository, baseSettingsRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.baseSettingsRepository = baseSettingsRepository;
    }
    generateOtp(userId, method, username) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(userId, { code, expiresAt: Date.now() + 2 * 60 * 1000 });
        console.log(`[2FA] OTP generated for user "${username}" via ${method} (valid 2 min). Deliver via provider in production.`);
        return code;
    }
    verifyOtp(userId, token) {
        const entry = otpStore.get(userId);
        if (!entry)
            return false;
        otpStore.delete(userId);
        return entry.code === token && entry.expiresAt > Date.now();
    }
    async validateUser(username, pass) {
        if (!username || !pass) {
            throw new common_1.UnauthorizedException('Invalid credentials EMPTY');
        }
        const user = await this.userRepository.findOne({
            where: { username: (0, typeorm_2.Raw)(alias => `LOWER(${alias}) = LOWER(:username)`, { username }) },
            relations: ['roles', 'roles.role', 'roles.role.permissions', 'roles.role.permissions.permission']
        });
        if (user && user.passwordHash) {
            if (user.isActive === false) {
                throw new common_1.UnauthorizedException('حساب کاربری شما غیرفعال شده است.با مدیرسیستم تماس حاصل فرمایید');
            }
            const isMatch = await bcrypt.compare(pass, user.passwordHash);
            if (isMatch) {
                let permissions = [];
                if (user.username.toLowerCase() === 'admin') {
                    permissions = ['*'];
                }
                else {
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
        throw new common_1.UnauthorizedException('Invalid credentials MISMATCH');
    }
    async login(user) {
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
    async generateTokens(user) {
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
    async verifyTwoFactor(userId, token) {
        if (typeof token === 'string')
            token = token.trim();
        console.log(`verifyTwoFactor called with userId: ${userId}, token: ${token}`);
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            console.log('verifyTwoFactor: User not found for id', userId);
            throw new common_1.UnauthorizedException('User not found');
        }
        if (!user.isTwoFactorEnabled) {
            console.log('verifyTwoFactor: 2FA not enabled for user');
            throw new common_1.UnauthorizedException('2FA not enabled');
        }
        const twoStepMethodSetting = await this.baseSettingsRepository.findOne({ where: { tabRef: 1, key: 'twoStepMethod' } });
        const enable2StepSetting = await this.baseSettingsRepository.findOne({ where: { tabRef: 1, key: 'enable2StepLogin' } });
        const isGlobal2FA = enable2StepSetting?.value === 'true';
        const method = isGlobal2FA ? (twoStepMethodSetting?.value || 'sms') : 'app';
        console.log(`verifyTwoFactor: isGlobal2FA=${isGlobal2FA}, method=${method}`);
        if (!method) {
            console.log('verifyTwoFactor: 2FA not enabled');
            throw new common_1.UnauthorizedException('2FA not enabled');
        }
        let isValid = false;
        if (method === 'app') {
            if (!user.twoFactorSecret) {
                console.log('verifyTwoFactor: 2FA not configured for app');
                throw new common_1.UnauthorizedException('خطا: 2FA برای این حساب تنظیم نشده است. ابتدا کد QR را اسکن کنید.');
            }
            isValid = authenticator.verify({
                token,
                secret: user.twoFactorSecret,
            });
            if (!isValid) {
                throw new common_1.UnauthorizedException(`کد وارد شده برای اپلیکیشن سازگار نیست (نامعتبر)`);
            }
        }
        else if (method === 'sms' || method === 'email') {
            isValid = this.verifyOtp(userId, token);
            if (!isValid) {
                throw new common_1.UnauthorizedException('کد پیامک/ایمیل وارد شده نامعتبر یا منقضی شده است.');
            }
        }
        if (!isValid) {
            console.log('verifyTwoFactor: Invalid 2FA token');
            throw new common_1.UnauthorizedException('کد وارد شده نامعتبر است.');
        }
        const validatedUser = await this.validateUserById(user.id);
        console.log('verifyTwoFactor: validation success, generating tokens');
        return this.generateTokens(validatedUser);
    }
    async generateTwoFactorSecret(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        const secret = authenticator.generateSecret();
        const otpauthUrl = authenticator.keyuri(user.username, 'MultiSoftwareApp', secret);
        const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
        await this.userRepository.update(userId, { twoFactorSecret: secret });
        return {
            secret,
            qrCodeDataUrl,
        };
    }
    async enableTwoFactor(userId, token) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user || !user.twoFactorSecret) {
            throw new common_1.UnauthorizedException('2FA secret not generated');
        }
        const isValid = authenticator.verify({
            token,
            secret: user.twoFactorSecret,
        });
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
        await this.userRepository.update(userId, { isTwoFactorEnabled: true });
        return { success: true };
    }
    async changePassword(userId, oldPass, newPass) {
        if (!userId || !oldPass || !newPass) {
            throw new common_1.UnauthorizedException('اطلاعات وارد شده ناقص است');
        }
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException('کاربر یافت نشد');
        }
        try {
            const isMatch = await bcrypt.compare(oldPass, user.passwordHash);
            if (!isMatch) {
                throw new common_1.UnauthorizedException('کلمه عبور فعلی نادرست است');
            }
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(newPass, salt);
            await this.userRepository.update(userId, { passwordHash });
            return { success: true };
        }
        catch (error) {
            console.error('Bcrypt error in changePassword:', error);
            throw new common_1.UnauthorizedException('خطا در پردازش کلمه عبور');
        }
    }
    async refreshToken(token) {
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.userRepository.findOne({ where: { id: payload.sub, refreshToken: token } });
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const validatedUser = await this.validateUserById(user.id);
            return this.login(validatedUser);
        }
        catch (e) {
            throw new common_1.UnauthorizedException('Refresh token expired or invalid');
        }
    }
    async logout(userId) {
        await this.userRepository.update(userId, {
            refreshToken: null,
            lastSeen: null
        });
        return { success: true };
    }
    async validateUserById(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['roles', 'roles.role', 'roles.role.permissions', 'roles.role.permissions.permission']
        });
        if (user) {
            let permissions = [];
            if (user.username.toLowerCase() === 'admin') {
                permissions = ['*'];
            }
            else {
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
        throw new common_1.UnauthorizedException('User not found');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(base_settings_entity_1.BaseSettings)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map