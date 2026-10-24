import * as crypto from 'crypto';
import { machineIdSync } from 'node-machine-id';

/**
 * Ed25519 license cryptography (Task 5-b, Phase 2).
 *
 * License wire format: base64( JSON{ alg:'Ed25519', data, signature:<base64> } )
 * - `data` is signed with Ed25519 over its canonical JSON.stringify() form.
 * - The legacy format (no `alg` field / unkeyed sha256-hex signature) is
 *   REJECTED as invalid with reason 'legacy-or-forged': an unkeyed hash could
 *   be recomputed by anyone, so it offers no authenticity at all.
 *
 * The PRIVATE key never lives in source control or on the application box in
 * production: licenses are produced offline with scripts/generate-license.cjs
 * (or LICENSE_PRIVATE_KEY env) and shipped to the customer as a file.
 * The application only ever needs the PUBLIC key.
 */

export interface LicenseData {
  licensee: string;
  product: string;
  version?: string;
  activationCodeHash?: string;
  issuedAt: string;
  expiryDate: string | null; // null = perpetual
  features: string[]; // e.g. ['all'] or ['accounting','inventory',...]
  machineId: string | null; // null = site license (any machine)
  licenseType?: string; // e.g. 'FULL' | 'DEV-TRIAL' | 'TRIAL'
}

export interface VerifyResult {
  valid: boolean;
  reason?: 'malformed' | 'legacy-or-forged' | 'bad-signature' | 'expired' | 'machine-mismatch';
  data?: LicenseData;
}

/** Ed25519 keypair as PEM (private PKCS8, public SPKI). */
export function generateKeyPair(): { privateKeyPem: string; publicKeyPem: string } {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
  return {
    privateKeyPem: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
    publicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
  };
}

/** Base64 (of the PEM) helper used for env vars / embedded fallbacks. */
export function pemToBase64(pem: string): string {
  return Buffer.from(pem, 'utf8').toString('base64');
}

export function base64ToPem(b64: string): string {
  return Buffer.from(b64, 'base64').toString('utf8');
}

/** Current machine fingerprint (node-machine-id). Falls back gracefully. */
export function currentMachineId(): string {
  try {
    return machineIdSync();
  } catch {
    return 'UNKNOWN_MACHINE_ID';
  }
}

/**
 * Signs license data with Ed25519 and returns the portable license string:
 * base64(JSON { alg, data, signature }).
 */
export function signLicense(data: LicenseData, privateKeyPem: string): string {
  const canonical = JSON.stringify(data);
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  const signature = crypto.sign(null, Buffer.from(canonical, 'utf8'), privateKey);
  const envelope = {
    alg: 'Ed25519',
    data,
    signature: signature.toString('base64'),
  };
  return Buffer.from(JSON.stringify(envelope), 'utf8').toString('base64');
}

/**
 * Verifies a license string against the trusted public key.
 *
 * Validation rules (after signature check):
 *  - expiryDate !== null && new Date(expiryDate) < now  -> 'expired'
 *  - machineId !== null && machineId !== currentMachineId() -> 'machine-mismatch'
 *  - machineId === null  -> site license, valid on any machine
 */
export function verifyLicense(licenseString: string, publicKeyPem: string): VerifyResult {
  let envelope: any;
  try {
    const trimmed = (licenseString || '').trim();
    const decoded = Buffer.from(trimmed, 'base64').toString('utf8');
    envelope = JSON.parse(decoded);
  } catch {
    return { valid: false, reason: 'malformed' };
  }

  // Legacy (pre-Ed25519) format has no `alg` field and an unkeyed sha256 hex
  // signature -> forgeable by design. Reject explicitly.
  if (!envelope || envelope.alg !== 'Ed25519' || !envelope.data || !envelope.signature) {
    return { valid: false, reason: 'legacy-or-forged' };
  }

  let signatureOk = false;
  try {
    const canonical = JSON.stringify(envelope.data);
    const publicKey = crypto.createPublicKey(publicKeyPem);
    const sig = Buffer.from(envelope.signature, 'base64');
    signatureOk = crypto.verify(null, Buffer.from(canonical, 'utf8'), publicKey, sig);
  } catch {
    signatureOk = false;
  }
  if (!signatureOk) {
    return { valid: false, reason: 'bad-signature' };
  }

  const data = envelope.data as LicenseData;

  if (data.expiryDate !== null && data.expiryDate !== undefined) {
    const expiry = new Date(data.expiryDate);
    if (!isNaN(expiry.getTime()) && expiry.getTime() < Date.now()) {
      return { valid: false, reason: 'expired', data };
    }
  }

  if (data.machineId !== null && data.machineId !== undefined && data.machineId !== '') {
    if (data.machineId !== currentMachineId()) {
      return { valid: false, reason: 'machine-mismatch', data };
    }
  }

  return { valid: true, data };
}
