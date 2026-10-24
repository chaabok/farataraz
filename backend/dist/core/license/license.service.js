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
var LicenseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseService = void 0;
const id_generation_service_1 = require("../services/id-generation.service");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const license_activation_entity_1 = require("./entities/license-activation.entity");
const license_types_1 = require("./license.types");
const license_crypto_1 = require("./license-crypto");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let LicenseService = LicenseService_1 = class LicenseService {
    constructor(activationRepo, idGenService) {
        this.activationRepo = activationRepo;
        this.idGenService = idGenService;
        this.logger = new common_1.Logger(LicenseService_1.name);
        this.currentLicense = null;
        this.currentLicenseString = null;
        this.currentLicenseIsDevTrial = false;
        this.LICENSE_FILE_PATHS = [
            path.join(process.cwd(), 'license.key'),
            path.join(process.cwd(), '.hidden_license.data'),
            path.join(process.cwd(), 'backend', 'license.key'),
            path.join(process.cwd(), 'backend', '.hidden_license.data'),
        ];
    }
    async onModuleInit() {
        this.logger.log('Initializing License Service (Ed25519)...');
        this.loadLicense();
        if (!this.isLicenseValid()) {
            if (process.env.NODE_ENV === 'production' || process.env.LICENSE_ENFORCEMENT === 'false') {
                this.logger.warn('No valid license found. Enforcement will apply (guard active).');
            }
            else {
                this.issueDevTrial();
            }
        }
    }
    resolvePublicKeyPem() {
        const envKey = (process.env.LICENSE_PUBLIC_KEY || '').trim();
        if (envKey) {
            try {
                const pem = envKey.includes('PUBLIC KEY') ? envKey : (0, license_crypto_1.base64ToPem)(envKey);
                if (pem.includes('PUBLIC KEY'))
                    return pem;
                this.logger.warn('LICENSE_PUBLIC_KEY env is set but not a valid PEM — ignoring.');
            }
            catch {
                this.logger.warn('LICENSE_PUBLIC_KEY env could not be decoded — ignoring.');
            }
        }
        const candidates = [
            path.join(process.cwd(), 'keys', 'license_public_key.pem'),
            path.join(process.cwd(), 'backend', 'keys', 'license_public_key.pem'),
            path.resolve(__dirname, '../../..', 'keys', 'license_public_key.pem'),
            path.resolve(__dirname, '../../../..', 'backend', 'keys', 'license_public_key.pem'),
        ];
        for (const p of candidates) {
            try {
                if (fs.existsSync(p))
                    return fs.readFileSync(p, 'utf8');
            }
            catch {
            }
        }
        return (0, license_crypto_1.base64ToPem)('LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUNvd0JRWURLMlZ3QXlFQWdqU1NDYUFNRUwveEdDeEZDRGprY2oyTmxwcjI3SnI2Um5LcG5waXJubUk9Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQo=');
    }
    loadLicense() {
        let raw = null;
        for (const p of this.LICENSE_FILE_PATHS) {
            try {
                if (fs.existsSync(p)) {
                    const content = fs.readFileSync(p, 'utf-8').trim();
                    if (content) {
                        raw = content;
                        break;
                    }
                }
            }
            catch {
            }
        }
        if (!raw) {
            this.logger.warn('No license file found.');
            return;
        }
        const result = (0, license_crypto_1.verifyLicense)(raw, this.resolvePublicKeyPem());
        if (result.valid && result.data) {
            this.currentLicenseString = raw;
            this.currentLicense = { alg: 'Ed25519', data: result.data, signature: '' };
            try {
                const envelope = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
                this.currentLicense.signature = envelope.signature;
            }
            catch {
            }
            this.currentLicenseIsDevTrial = false;
            this.logger.log(`License loaded: licensee="${result.data.licensee}" type=${result.data.licenseType || 'FULL'} ` +
                `expiry=${result.data.expiryDate || 'perpetual'} features=${(result.data.features || []).join('|')}`);
        }
        else {
            this.logger.error(`License file rejected (reason: ${result.reason}).`);
            this.currentLicense = null;
            this.currentLicenseString = null;
        }
    }
    issueDevTrial() {
        const now = new Date();
        const expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const data = {
            licensee: 'Development Trial',
            product: 'Parsa ERP',
            issuedAt: now.toISOString(),
            expiryDate: expiry.toISOString(),
            features: ['all'],
            machineId: null,
            licenseType: 'DEV-TRIAL',
        };
        this.currentLicense = { alg: 'Ed25519', data, signature: 'dev-trial' };
        this.currentLicenseString = null;
        this.currentLicenseIsDevTrial = true;
        console.warn('[LICENSE] No valid license found — a 7-day in-memory DEV-TRIAL license was auto-issued ' +
            '(non-production only, never persisted). For production, install a signed license via ' +
            'backend/scripts/generate-license.cjs or the activation window.');
    }
    getMachineId() {
        return (0, license_crypto_1.currentMachineId)();
    }
    getLicense() {
        return this.currentLicense;
    }
    isDevTrial() {
        return this.currentLicenseIsDevTrial;
    }
    isLicenseValid() {
        if (!this.currentLicense)
            return false;
        if (this.currentLicenseIsDevTrial) {
            const expiry = this.currentLicense.data?.expiryDate;
            return !!expiry && new Date(expiry).getTime() >= Date.now();
        }
        if (this.currentLicenseString) {
            const result = (0, license_crypto_1.verifyLicense)(this.currentLicenseString, this.resolvePublicKeyPem());
            return result.valid;
        }
        return false;
    }
    async getActivationStatus() {
        if (!this.isLicenseValid() || !this.currentLicense) {
            return {
                isValid: false,
                needsActivation: false,
                message: 'Invalid or missing license.',
                licenseType: null,
                features: [],
                modules: [],
                limits: null,
                machineId: this.getMachineId(),
            };
        }
        const data = this.currentLicense.data;
        const features = data.features || [];
        const modules = features.includes('all') || features.includes('*')
            ? Object.values(license_types_1.AppModules)
            : [...features];
        const expiry = data.expiryDate ? new Date(data.expiryDate) : null;
        const daysLeft = expiry
            ? Math.max(0, Math.ceil((expiry.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
            : null;
        return {
            isValid: true,
            needsActivation: false,
            licensee: data.licensee,
            product: data.product,
            licenseType: data.licenseType || 'FULL',
            features,
            modules,
            limits: null,
            expiryDate: data.expiryDate,
            daysLeft,
            machineId: this.getMachineId(),
            isDevTrial: this.currentLicenseIsDevTrial,
        };
    }
    async activateLicense(licenseString) {
        if (!licenseString || typeof licenseString !== 'string') {
            throw new common_1.UnauthorizedException('License string is required.');
        }
        const result = (0, license_crypto_1.verifyLicense)(licenseString.trim(), this.resolvePublicKeyPem());
        if (!result.valid || !result.data) {
            const messages = {
                malformed: 'قالب لایسنس نامعتبر است.',
                'legacy-or-forged': 'این لایسنس با فرمت قدیمی/جعل‌شده است و پذیرفته نمی‌شود.',
                'bad-signature': 'امضای لایسنس معتبر نیست.',
                expired: 'لایسنس منقضی شده است.',
                'machine-mismatch': 'این لایسنس برای این سیستم صادر نشده است.',
            };
            throw new common_1.UnauthorizedException(messages[result.reason || ''] || 'لایسنس نامعتبر است.');
        }
        const envelope = JSON.parse(Buffer.from(licenseString.trim(), 'base64').toString('utf8'));
        const signature = envelope.signature;
        this.currentLicense = { alg: 'Ed25519', data: result.data, signature };
        this.currentLicenseString = licenseString.trim();
        this.currentLicenseIsDevTrial = false;
        for (const p of this.LICENSE_FILE_PATHS) {
            try {
                fs.writeFileSync(p, licenseString.trim(), 'utf-8');
                this.logger.log(`License persisted to ${p}`);
            }
            catch (e) {
                this.logger.warn(`Could not persist license to ${p}: ${e?.message}`);
            }
        }
        try {
            let record = await this.activationRepo.findOne({ where: { licenseSignature: signature } });
            if (!record) {
                const nextId = await this.idGenService.generateNextId('LicenseActivation');
                record = new license_activation_entity_1.LicenseActivation();
                record.LicenseActivationID = String(nextId);
                record.licenseSignature = signature;
                record.isActivated = true;
                record.firstPromptAt = new Date();
            }
            else {
                record.isActivated = true;
            }
            await this.activationRepo.save(record);
        }
        catch (e) {
            this.logger.warn(`License activation audit row not saved: ${e?.message}`);
        }
        this.logger.log(`License activated: licensee="${result.data.licensee}"`);
        return true;
    }
    hasModuleAccess(module) {
        if (!this.isLicenseValid() || !this.currentLicense)
            return false;
        const features = this.currentLicense.data.features || [];
        return features.includes('all') || features.includes('*') || features.includes(module);
    }
    getLimits() {
        return null;
    }
};
exports.LicenseService = LicenseService;
exports.LicenseService = LicenseService = LicenseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(license_activation_entity_1.LicenseActivation)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => id_generation_service_1.IdGenerationService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        id_generation_service_1.IdGenerationService])
], LicenseService);
//# sourceMappingURL=license.service.js.map