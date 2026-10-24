import { IdGenerationService } from '../services/id-generation.service';
import { Injectable, Logger, OnModuleInit, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LicenseActivation } from './entities/license-activation.entity';
import { AppModules, DecryptedLicense, LicenseData } from './license.types';
import { verifyLicense, currentMachineId, base64ToPem, VerifyResult } from './license-crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Task 5-b (Phase 2): real Ed25519 license verification + enforcement support.
 *
 * - The license string is base64(JSON { alg:'Ed25519', data, signature }) and
 *   its signature is verified against the trusted public key (see
 *   resolvePublicKeyPem). The legacy unkeyed-sha256 format is rejected
 *   ('legacy-or-forged').
 * - Activation no longer accepts the mock code 123456: the activation
 *   endpoint accepts the license FILE CONTENT (the signed license string)
 *   and persists it to the license files + LicenseActivations table.
 * - No mock license is generated at boot. In non-production (developer
 *   experience) a 7-day in-memory DEV-TRIAL is auto-issued when no valid
 *   license exists; it is never persisted.
 * - The enforcement decision is exposed via isLicenseValid() and consumed by
 *   the global LicenseEnforcementGuard (auth/license/health routes exempt).
 */
@Injectable()
export class LicenseService implements OnModuleInit {
  private readonly logger = new Logger(LicenseService.name);
  private currentLicense: DecryptedLicense | null = null;
  /** Raw license string currently loaded (file or activation) — re-verified lazily. */
  private currentLicenseString: string | null = null;
  private currentLicenseIsDevTrial = false;

  /** Candidate license file locations (all kept in sync for compatibility). */
  private readonly LICENSE_FILE_PATHS: string[] = [
    path.join(process.cwd(), 'license.key'),
    path.join(process.cwd(), '.hidden_license.data'),
    path.join(process.cwd(), 'backend', 'license.key'),
    path.join(process.cwd(), 'backend', '.hidden_license.data'),
  ];

  constructor(
    @InjectRepository(LicenseActivation)
    private readonly activationRepo: Repository<LicenseActivation>,
    @Inject(forwardRef(() => IdGenerationService))
    private readonly idGenService: IdGenerationService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing License Service (Ed25519)...');
    // NOTE: the legacy mock-license generation (activation code 123456,
    // unkeyed sha256) was removed in Task 5-b. A real signed license ships at
    // the project root (license.key / .hidden_license.data + backend copies).
    this.loadLicense();

    if (!this.isLicenseValid()) {
      if (process.env.NODE_ENV === 'production' || process.env.LICENSE_ENFORCEMENT === 'false') {
        this.logger.warn('No valid license found. Enforcement will apply (guard active).');
      } else {
        this.issueDevTrial();
      }
    }
  }

  // ------------------------------------------------------------------ keys --

  /**
   * Trusted public key resolution order:
   *  1. LICENSE_PUBLIC_KEY env (base64 PEM or raw PEM) — production deployments
   *     MUST supply their own here (or via backend/keys/license_public_key.pem).
   *  2. backend/keys/license_public_key.pem
   *  3. Built-in development fallback: the public key of the keypair generated
   *     for this source tree (fingerprint
   *     2b017647aa082755797f550971d17ec8f20b5fcb45ef667f56d88320bc55018e).
   *     PRODUCTION DEPLOYMENTS MUST OVERRIDE IT via LICENSE_PUBLIC_KEY env —
   *     anyone with this source could otherwise sign their own licenses.
   */
  public resolvePublicKeyPem(): string {
    const envKey = (process.env.LICENSE_PUBLIC_KEY || '').trim();
    if (envKey) {
      try {
        const pem = envKey.includes('PUBLIC KEY') ? envKey : base64ToPem(envKey);
        if (pem.includes('PUBLIC KEY')) return pem;
        this.logger.warn('LICENSE_PUBLIC_KEY env is set but not a valid PEM — ignoring.');
      } catch {
        this.logger.warn('LICENSE_PUBLIC_KEY env could not be decoded — ignoring.');
      }
    }

    const candidates = [
      path.join(process.cwd(), 'keys', 'license_public_key.pem'),
      path.join(process.cwd(), 'backend', 'keys', 'license_public_key.pem'),
      path.resolve(__dirname, '../../..', 'keys', 'license_public_key.pem'), // from dist/core/license
      path.resolve(__dirname, '../../../..', 'backend', 'keys', 'license_public_key.pem'), // from dist (cwd=root)
    ];
    for (const p of candidates) {
      try {
        if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
      } catch {
        /* ignore and continue */
      }
    }

    // Development fallback ONLY (see comment above).
    return base64ToPem(
      'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUNvd0JRWURLMlZ3QXlFQWdqU1NDYUFNRUwveEdDeEZDRGprY2oyTmxwcjI3SnI2Um5LcG5waXJubUk9Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQo=',
    );
  }

  // ----------------------------------------------------------------- loading --

  private loadLicense(): void {
    let raw: string | null = null;
    for (const p of this.LICENSE_FILE_PATHS) {
      try {
        if (fs.existsSync(p)) {
          const content = fs.readFileSync(p, 'utf-8').trim();
          if (content) {
            raw = content;
            break;
          }
        }
      } catch {
        /* try next candidate */
      }
    }

    if (!raw) {
      this.logger.warn('No license file found.');
      return;
    }

    const result = verifyLicense(raw, this.resolvePublicKeyPem());
    if (result.valid && result.data) {
      this.currentLicenseString = raw;
      this.currentLicense = { alg: 'Ed25519', data: result.data, signature: '' } as DecryptedLicense;
      // keep the real signature available for audit rows
      try {
        const envelope = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
        this.currentLicense.signature = envelope.signature;
      } catch {
        /* signature stays empty; validity already established */
      }
      this.currentLicenseIsDevTrial = false;
      this.logger.log(
        `License loaded: licensee="${result.data.licensee}" type=${result.data.licenseType || 'FULL'} ` +
          `expiry=${result.data.expiryDate || 'perpetual'} features=${(result.data.features || []).join('|')}`,
      );
    } else {
      this.logger.error(`License file rejected (reason: ${result.reason}).`);
      this.currentLicense = null;
      this.currentLicenseString = null;
    }
  }

  /** Developer-experience only: 7-day in-memory trial, never persisted. */
  private issueDevTrial(): void {
    const now = new Date();
    const expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const data: LicenseData = {
      licensee: 'Development Trial',
      product: 'Parsa ERP',
      issuedAt: now.toISOString(),
      expiryDate: expiry.toISOString(),
      features: ['all'],
      machineId: null,
      licenseType: 'DEV-TRIAL',
    };
    this.currentLicense = { alg: 'Ed25519', data, signature: 'dev-trial' };
    this.currentLicenseString = null; // in-memory only
    this.currentLicenseIsDevTrial = true;
    console.warn(
      '[LICENSE] No valid license found — a 7-day in-memory DEV-TRIAL license was auto-issued ' +
        '(non-production only, never persisted). For production, install a signed license via ' +
        'backend/scripts/generate-license.cjs or the activation window.',
    );
  }

  // ------------------------------------------------------------------ state --

  public getMachineId(): string {
    return currentMachineId();
  }

  public getLicense(): DecryptedLicense | null {
    return this.currentLicense;
  }

  public isDevTrial(): boolean {
    return this.currentLicenseIsDevTrial;
  }

  /**
   * Fresh verification of the currently-installed license (re-checks expiry
   * and machine binding on every call — used by LicenseEnforcementGuard).
   */
  public isLicenseValid(): boolean {
    if (!this.currentLicense) return false;
    if (this.currentLicenseIsDevTrial) {
      // DEV-TRIAL: re-check its expiry.
      const expiry = this.currentLicense.data?.expiryDate;
      return !!expiry && new Date(expiry).getTime() >= Date.now();
    }
    if (this.currentLicenseString) {
      const result: VerifyResult = verifyLicense(this.currentLicenseString, this.resolvePublicKeyPem());
      return result.valid;
    }
    return false;
  }

  public async getActivationStatus() {
    if (!this.isLicenseValid() || !this.currentLicense) {
      return {
        isValid: false,
        needsActivation: false, // legacy contract: never triggers the old countdown modal
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
    // 'all' -> expand to every known module for backward compatibility
    // (the frontend licenseStore consumes `modules` from /api/license/status).
    const modules =
      features.includes('all') || features.includes('*')
        ? Object.values(AppModules)
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
      limits: null, // legacy field; new license format has no seat limits
      expiryDate: data.expiryDate,
      daysLeft,
      machineId: this.getMachineId(),
      isDevTrial: this.currentLicenseIsDevTrial,
    };
  }

  // -------------------------------------------------------------- activation --

  /**
   * Activation accepts a SIGNED LICENSE STRING (the content of license.key).
   * The mock 6-digit code path (123456) was removed in Task 5-b.
   */
  public async activateLicense(licenseString: string): Promise<boolean> {
    if (!licenseString || typeof licenseString !== 'string') {
      throw new UnauthorizedException('License string is required.');
    }

    const result = verifyLicense(licenseString.trim(), this.resolvePublicKeyPem());
    if (!result.valid || !result.data) {
      const messages: Record<string, string> = {
        malformed: 'قالب لایسنس نامعتبر است.',
        'legacy-or-forged': 'این لایسنس با فرمت قدیمی/جعل‌شده است و پذیرفته نمی‌شود.',
        'bad-signature': 'امضای لایسنس معتبر نیست.',
        expired: 'لایسنس منقضی شده است.',
        'machine-mismatch': 'این لایسنس برای این سیستم صادر نشده است.',
      };
      throw new UnauthorizedException(messages[result.reason || ''] || 'لایسنس نامعتبر است.');
    }

    const envelope = JSON.parse(Buffer.from(licenseString.trim(), 'base64').toString('utf8'));
    const signature: string = envelope.signature;

    // In-memory install
    this.currentLicense = { alg: 'Ed25519', data: result.data, signature };
    this.currentLicenseString = licenseString.trim();
    this.currentLicenseIsDevTrial = false;

    // Persist to all known license file locations (best-effort).
    for (const p of this.LICENSE_FILE_PATHS) {
      try {
        fs.writeFileSync(p, licenseString.trim(), 'utf-8');
        this.logger.log(`License persisted to ${p}`);
      } catch (e: any) {
        this.logger.warn(`Could not persist license to ${p}: ${e?.message}`);
      }
    }

    // Audit trail in Gnr.LicenseActivations (best-effort, never fatal).
    try {
      let record = await this.activationRepo.findOne({ where: { licenseSignature: signature } });
      if (!record) {
        const nextId = await this.idGenService.generateNextId('LicenseActivation');
        record = new LicenseActivation();
        record.LicenseActivationID = String(nextId);
        record.licenseSignature = signature;
        record.isActivated = true;
        record.firstPromptAt = new Date();
      } else {
        record.isActivated = true;
      }
      await this.activationRepo.save(record);
    } catch (e: any) {
      this.logger.warn(`License activation audit row not saved: ${e?.message}`);
    }

    this.logger.log(`License activated: licensee="${result.data.licensee}"`);
    return true;
  }

  // ------------------------------------------------------------ feature checks --

  public hasModuleAccess(module: AppModules): boolean {
    if (!this.isLicenseValid() || !this.currentLicense) return false;
    const features = this.currentLicense.data.features || [];
    return features.includes('all') || features.includes('*') || features.includes(module);
  }

  public getLimits() {
    return null; // legacy concept removed with the new license format
  }
}
