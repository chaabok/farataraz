export interface LicenseData {
    licensee: string;
    product: string;
    version?: string;
    activationCodeHash?: string;
    issuedAt: string;
    expiryDate: string | null;
    features: string[];
    machineId: string | null;
    licenseType?: string;
}
export interface VerifyResult {
    valid: boolean;
    reason?: 'malformed' | 'legacy-or-forged' | 'bad-signature' | 'expired' | 'machine-mismatch';
    data?: LicenseData;
}
export declare function generateKeyPair(): {
    privateKeyPem: string;
    publicKeyPem: string;
};
export declare function pemToBase64(pem: string): string;
export declare function base64ToPem(b64: string): string;
export declare function currentMachineId(): string;
export declare function signLicense(data: LicenseData, privateKeyPem: string): string;
export declare function verifyLicense(licenseString: string, publicKeyPem: string): VerifyResult;
