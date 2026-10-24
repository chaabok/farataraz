export enum AppModules {
  ACCOUNTING = 'accounting',
  INVENTORY = 'inventory',
  SALES = 'sales',
  FIXED_ASSETS = 'fixed_assets',
  RECEIPT_PAYMENT = 'receipt_payment',
  CURRENCY_SUBSYSTEM = 'currency_subsystem',
  FINANCIAL_STATEMENTS = 'financial_statements',
  MANAGEMENT_REPORTS = 'management_reports',
  INTERNAL_PROCUREMENT = 'internal_procurement',
  EXTERNAL_ORDERS = 'external_orders',
  PAYROLL = 'payroll',
  RECRUITMENT = 'recruitment',
  EMPLOYEE_TRAINING = 'employee_training',
  ATTENDANCE = 'attendance',
  PRODUCTION_PLANNING = 'production_planning',
  MATERIAL_DELIVERY_CONTROL = 'material_delivery_control',
  COSTING = 'costing',
  HOT_DISTRIBUTION = 'hot_distribution',
  COLD_DISTRIBUTION = 'cold_distribution',
  OFFICE_AUTOMATION = 'office_automation',
  RETAIL = 'retail',
  AFTER_SALES_SERVICE = 'after_sales_service',
  CRM = 'crm',
  ONLINE_WEBSITE = 'online_website',
  WEB_SERVICE = 'web_service',
  FORM_BUILDER = 'form_builder',
  REPORT_BUILDER = 'report_builder',
  WORKFLOW_MANAGEMENT = 'workflow_management',
}

/**
 * License payload signed with Ed25519 (see license-crypto.ts).
 * Task 5-b replaced the legacy forgeable format
 * (customerName/issueDate/hardwareId/modules/limits + sha256).
 */
export interface LicenseData {
  licensee: string;
  product: string;
  version?: string;
  activationCodeHash?: string;
  issuedAt: string;
  expiryDate: string | null; // null = perpetual
  features: string[]; // ['all'] or explicit module/feature names
  machineId: string | null; // null = site license (any machine)
  licenseType?: string; // 'FULL' | 'TRIAL' | 'DEV-TRIAL' ...
}

/** Decoded license envelope: alg:'Ed25519' + data + base64 signature. */
export interface DecryptedLicense {
  alg: 'Ed25519';
  data: LicenseData;
  signature: string;
}
