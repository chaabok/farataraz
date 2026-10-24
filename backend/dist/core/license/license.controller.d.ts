import { LicenseService } from './license.service';
export declare class LicenseController {
    private readonly licenseService;
    constructor(licenseService: LicenseService);
    getStatus(): Promise<{
        isValid: boolean;
        needsActivation: boolean;
        message: string;
        licenseType: any;
        features: any[];
        modules: any[];
        limits: any;
        machineId: string;
        licensee?: undefined;
        product?: undefined;
        expiryDate?: undefined;
        daysLeft?: undefined;
        isDevTrial?: undefined;
    } | {
        isValid: boolean;
        needsActivation: boolean;
        licensee: string;
        product: string;
        licenseType: string;
        features: string[];
        modules: string[];
        limits: any;
        expiryDate: string;
        daysLeft: number;
        machineId: string;
        isDevTrial: boolean;
        message?: undefined;
    }>;
    verify(): Promise<{
        isValid: boolean;
        needsActivation: boolean;
        message: string;
        licenseType: any;
        features: any[];
        modules: any[];
        limits: any;
        machineId: string;
        licensee?: undefined;
        product?: undefined;
        expiryDate?: undefined;
        daysLeft?: undefined;
        isDevTrial?: undefined;
    } | {
        isValid: boolean;
        needsActivation: boolean;
        licensee: string;
        product: string;
        licenseType: string;
        features: string[];
        modules: string[];
        limits: any;
        expiryDate: string;
        daysLeft: number;
        machineId: string;
        isDevTrial: boolean;
        message?: undefined;
    }>;
    getMachineId(): {
        machineId: string;
    };
    activate(body: {
        code?: string;
        licenseString?: string;
        license?: string;
    }): Promise<{
        success: boolean;
    }>;
}
