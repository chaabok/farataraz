import { Controller, Get, Post, Body, UnauthorizedException } from '@nestjs/common';
import { LicenseService } from './license.service';
import { Public } from '../../auth/public.decorator';

/**
 * Licensing endpoints are intentionally public: the frontend checks the
 * license state before/after login and the activation endpoint itself only
 * succeeds with a validly-signed license string (Ed25519, Task 5-b).
 */
@Public()
@Controller('license')
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Get('status')
  async getStatus() {
    return this.licenseService.getActivationStatus();
  }

  /** Compatibility alias used by the frontend polling/providers layer. */
  @Get('verify')
  async verify() {
    return this.licenseService.getActivationStatus();
  }

  @Get('machine-id')
  getMachineId() {
    return { machineId: this.licenseService.getMachineId() };
  }

  /**
   * Body: { code: <license string> } — the frontend ActivationModal keeps
   * posting the `code` field; it now carries the signed license string.
   * Also accepts { licenseString } / { license } for API callers.
   */
  @Post('activate')
  async activate(@Body() body: { code?: string; licenseString?: string; license?: string }) {
    const licenseString = body?.code || body?.licenseString || body?.license;
    if (!licenseString) {
      throw new UnauthorizedException('License string is required.');
    }
    const success = await this.licenseService.activateLicense(licenseString);
    if (!success) {
      throw new UnauthorizedException('لایسنس نامعتبر است.');
    }
    return { success: true };
  }
}
