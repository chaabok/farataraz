-- ============================================================
-- Parsa ERP Full Database Backup
-- Database : parsaDb
-- Server   : PostgreSQL 17.5 on x86_64-pc-linux-gnu, compiled by gcc (Ubuntu 7.5.0-3ubuntu1~18.04) 7.5.0, 64-bit
-- Taken at : 2026-10-25T17:33:11.624Z
-- Encoding : UTF8
-- ============================================================
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

CREATE SCHEMA IF NOT EXISTS "Acc";
CREATE SCHEMA IF NOT EXISTS "Cnt";
CREATE SCHEMA IF NOT EXISTS "Dfb";
CREATE SCHEMA IF NOT EXISTS "Gnr";
CREATE SCHEMA IF NOT EXISTS "Iam";
CREATE SCHEMA IF NOT EXISTS "Inv";
CREATE SCHEMA IF NOT EXISTS "Rap";
CREATE SCHEMA IF NOT EXISTS "Rpt";
CREATE SCHEMA IF NOT EXISTS "Sle";
CREATE SCHEMA IF NOT EXISTS "public";
CREATE TABLE IF NOT EXISTS "Acc"."Accounts" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "AccountID" bigint NOT NULL,
  "Code" varchar(20) NOT NULL,
  "Title" varchar(100) NOT NULL,
  "Title_En" varchar(100),
  "ParentID" bigint,
  "AccountType" integer,
  "AccountNature" integer DEFAULT 7,
  "NatureControl" integer,
  "IsActive" boolean DEFAULT true,
  "TrackingFeature" boolean DEFAULT false,
  "CurrencyFeature" boolean DEFAULT false,
  "ExchangeableFeature" boolean DEFAULT false,
  "TrackingQuantity" boolean DEFAULT false,
  "TrackingNumber" boolean DEFAULT false,
  "TrackingDate" boolean DEFAULT false,
  PRIMARY KEY ("AccountID")
);
CREATE TABLE IF NOT EXISTS "Acc"."AccountsNatureAdjusting" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "AccountsNatureAdjustingID" bigint NOT NULL,
  "AccountID" bigint NOT NULL,
  "MoinCode" varchar(50),
  "MoinTitle" varchar(200),
  "Nature" varchar(100),
  "Description" varchar(500),
  "Description2" varchar(500),
  PRIMARY KEY ("AccountsNatureAdjustingID")
);
CREATE TABLE IF NOT EXISTS "Acc"."AccountsRelatedDeatailedAccounts" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "AccountsRelatedDeatailedAccountsID" bigint NOT NULL,
  "AccountID" bigint NOT NULL,
  "DetailedLevel" integer NOT NULL,
  "DetailedTypesID" bigint NOT NULL,
  PRIMARY KEY ("AccountsRelatedDeatailedAccountsID")
);
CREATE TABLE IF NOT EXISTS "Acc"."AccountsVoucherDecriptions" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "AccountsVoucherDecriptionID" bigint NOT NULL,
  "AccountID" bigint NOT NULL,
  "Description" varchar(500),
  "Description_En" varchar(500),
  PRIMARY KEY ("AccountsVoucherDecriptionID")
);
CREATE TABLE IF NOT EXISTS "Acc"."ClosingTemporaryAccount" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ClosingTemporaryAccountID" bigint NOT NULL,
  "Description" varchar(250),
  "ToDate" varchar(10),
  "Type" varchar(50),
  "Status" varchar(50),
  "VoucherRef" bigint,
  PRIMARY KEY ("ClosingTemporaryAccountID")
);
CREATE TABLE IF NOT EXISTS "Acc"."ClosingTemporaryAccountItem" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ClosingTemporaryAccountItemID" bigint NOT NULL,
  "ClosingTemporaryAccountRef" bigint NOT NULL,
  "IntermediaryAccountRef" bigint,
  "IntermediaryCode" varchar(20),
  "Percentage" numeric(5,2),
  "DetailedAccountRef1" bigint,
  "DetailedAccountRef2" bigint,
  "DetailedAccountRef3" bigint,
  PRIMARY KEY ("ClosingTemporaryAccountItemID")
);
CREATE TABLE IF NOT EXISTS "Acc"."ClosingTemporaryAccountSelected" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ClosingTemporaryAccountSelectedID" bigint NOT NULL,
  "ClosingTemporaryAccountRef" bigint NOT NULL,
  "AccountRef" bigint,
  "AccountCode" varchar(20),
  "AccountTitle" varchar(150),
  "DetailedAccountRef" bigint,
  PRIMARY KEY ("ClosingTemporaryAccountSelectedID")
);
CREATE TABLE IF NOT EXISTS "Acc"."CostCenter" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "CostCenterID" bigint NOT NULL,
  "Code" varchar(20) NOT NULL,
  "Title" varchar(100) NOT NULL,
  "Title_En" varchar(100),
  "CostCenterType" integer NOT NULL,
  "DetailedAccountID" bigint,
  "isActive" boolean DEFAULT true,
  "Description" text,
  PRIMARY KEY ("CostCenterID")
);
CREATE TABLE IF NOT EXISTS "Acc"."DetailedAccounts" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "DetailedAccountID" bigint NOT NULL,
  "Code" varchar(20) NOT NULL,
  "Title" varchar(100) NOT NULL,
  "Title_En" varchar(100),
  "DetailedTypesID" bigint,
  "Description" text,
  "isActive" boolean DEFAULT true,
  PRIMARY KEY ("DetailedAccountID")
);
CREATE TABLE IF NOT EXISTS "Acc"."DetailedTypes" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "DetailedTypesID" bigint NOT NULL,
  "Code" varchar(20) NOT NULL,
  "Title" varchar(50) NOT NULL,
  "Title_En" varchar(50),
  "Description" text,
  "isActive" boolean DEFAULT true,
  PRIMARY KEY ("DetailedTypesID")
);
CREATE TABLE IF NOT EXISTS "Acc"."OtherDetails" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "OtherDetailsID" bigint NOT NULL,
  "Title" varchar(150) NOT NULL,
  "Title_En" varchar(150),
  "DetailedCode" bigint,
  "Description" varchar(500),
  "isActive" boolean DEFAULT true,
  PRIMARY KEY ("OtherDetailsID")
);
CREATE TABLE IF NOT EXISTS "Acc"."Voucher" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "VoucherID" bigint NOT NULL,
  "VoucherTypeID" bigint,
  "VoucherNumber" integer NOT NULL,
  "VoucherDate" date NOT NULL,
  "Description" varchar(500),
  "ReferenceNumber" varchar(100),
  "SubNumber" varchar(100),
  "VoucherNature" varchar(100) DEFAULT 'عادی'::character varying,
  "Description2" varchar(500),
  "SourceDocDate" date,
  "DailyNumber" integer,
  "TotalDebit" numeric(18,4) DEFAULT '0'::numeric,
  "TotalCredit" numeric(18,4) DEFAULT '0'::numeric,
  "Status" smallint DEFAULT '2'::smallint,
  "PreviousStatus" smallint,
  "FiscalYearRef" bigint,
  PRIMARY KEY ("VoucherID")
);
CREATE TABLE IF NOT EXISTS "Acc"."VoucherItem" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "VoucherItemID" bigint NOT NULL,
  "VoucherID" bigint NOT NULL,
  "RowNumber" integer NOT NULL,
  "AccountID" bigint NOT NULL,
  "DetailedAccountID1" bigint,
  "DetailedAccountID2" bigint,
  "DetailedAccountID3" bigint,
  "DetailedAccountID4" bigint,
  "DetailedAccountID5" bigint,
  "DetailedAccountID6" bigint,
  "DetailedAccountID7" bigint,
  "DetailedAccountID8" bigint,
  "DetailedAccountID9" bigint,
  "DetailedAccountID10" bigint,
  "Debit" numeric(18,4) DEFAULT '0'::numeric,
  "Credit" numeric(18,4) DEFAULT '0'::numeric,
  "Description" varchar(500),
  "CurrencyID" bigint,
  "CurrencyAmount" numeric(18,4),
  "ExchangeRate" numeric(18,6),
  "TrackingNumber" varchar(50),
  "TrackingDate" date,
  "IsSystemGenerated" boolean DEFAULT false,
  PRIMARY KEY ("VoucherItemID")
);
CREATE TABLE IF NOT EXISTS "Acc"."VoucherType" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "VoucherTypeID" bigint NOT NULL,
  "Code" bigint DEFAULT '0'::bigint,
  "Title" varchar(255) NOT NULL,
  "Title_En" varchar(255),
  "isActive" boolean DEFAULT true,
  PRIMARY KEY ("VoucherTypeID")
);
CREATE TABLE IF NOT EXISTS "Cnt"."Contracts" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ContractID" bigint NOT NULL,
  "DocumentNumber" varchar(100) NOT NULL,
  "Date" varchar(20) NOT NULL,
  "ProjectID" bigint,
  "WorkLocation" varchar(200),
  "PartyID" bigint NOT NULL,
  "DetailedAccountCode" varchar(50),
  "DetailedAccountID" bigint,
  "Subject1" varchar(200) NOT NULL,
  "Subject2" varchar(200),
  "DetailedAccountTitle" varchar(200) NOT NULL,
  "DetailedAccountTitle2" varchar(200),
  "StartDate" varchar(20),
  "EndDate" varchar(20),
  "DurationDays" integer,
  "Amount" bigint NOT NULL,
  "Description1" text,
  "Description2" text,
  "IsActive" boolean DEFAULT true,
  PRIMARY KEY ("ContractID")
);
CREATE TABLE IF NOT EXISTS "Cnt"."Projects" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ProjectID" bigint NOT NULL,
  "Code" varchar(20) NOT NULL,
  "Title" varchar(200) NOT NULL,
  "Title_En" varchar(200),
  "DetailedAccountCode" varchar(50),
  "DetailedAccountID" bigint,
  "IsActive" boolean DEFAULT true,
  PRIMARY KEY ("ProjectID")
);
CREATE TABLE IF NOT EXISTS "Dfb"."DynamicForm" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "DynamicFormID" bigint NOT NULL,
  "FormCode" varchar(100) NOT NULL,
  "Title" varchar(255) NOT NULL,
  "Description" varchar(500),
  "ComponentName" varchar(100),
  "Bands" jsonb DEFAULT '[]'::jsonb,
  "Fields" jsonb DEFAULT '[]'::jsonb,
  "Styles" jsonb DEFAULT '{}'::jsonb,
  "MenuConfig" jsonb DEFAULT '{}'::jsonb,
  "Options" jsonb DEFAULT '{}'::jsonb,
  "ShowPrintList" boolean DEFAULT false,
  "ShowVoucherActionbar" boolean DEFAULT false,
  "IsActive" boolean DEFAULT true,
  PRIMARY KEY ("DynamicFormID")
);
CREATE TABLE IF NOT EXISTS "Dfb"."DynamicFormRecord" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "DynamicFormRecordID" bigint NOT NULL,
  "FormRef" bigint NOT NULL,
  "Data" jsonb DEFAULT '{}'::jsonb,
  PRIMARY KEY ("DynamicFormRecordID")
);
CREATE TABLE IF NOT EXISTS "Dfb"."DynamicMenu" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "DynamicMenuID" bigint NOT NULL,
  "MenuType" varchar(50) NOT NULL,
  "MenuKey" varchar(150) NOT NULL,
  "GroupId" varchar(100),
  "MenuTitle" varchar(255),
  "Title" varchar(255),
  "TitleEn" varchar(255),
  "Icon" varchar(100),
  "Color" varchar(50),
  "Priority" integer DEFAULT 0,
  "Config" jsonb DEFAULT '{}'::jsonb,
  "IsActive" boolean DEFAULT true,
  PRIMARY KEY ("DynamicMenuID")
);
CREATE TABLE IF NOT EXISTS "Gnr"."ActivityLog" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "id" bigint NOT NULL,
  "Action" varchar(50) NOT NULL,
  "EntityName" varchar(150),
  "EntityId" varchar(100),
  "OldValues" text,
  "NewValues" text,
  "IpAddress" varchar(50),
  "UserAgent" varchar(500),
  "Url" varchar(1000),
  "Method" varchar(10),
  "Description" text,
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "Gnr"."BaseSettings" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "BaseSettingsID" bigint NOT NULL,
  "TabRef" integer NOT NULL,
  "Key" varchar(50) NOT NULL,
  "Value" text NOT NULL,
  PRIMARY KEY ("BaseSettingsID")
);
CREATE TABLE IF NOT EXISTS "Gnr"."BusinessStructure" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "BusinessStructureID" bigint NOT NULL,
  "ParentRef" bigint DEFAULT '0'::bigint,
  "Code" varchar(100) NOT NULL,
  "Title" varchar(255) NOT NULL,
  "Title_En" varchar(255) NOT NULL,
  "BusinessStructure" integer NOT NULL,
  "BusinessStructureName" varchar(255),
  "Manager" varchar(255),
  "IsActive" boolean DEFAULT true,
  "IsSystem" boolean DEFAULT false,
  "LogoUrl" text,
  "IsBasicInfoShared" boolean DEFAULT false,
  "ActiveStructureTypes" varchar(255),
  PRIMARY KEY ("BusinessStructureID")
);
CREATE TABLE IF NOT EXISTS "Gnr"."Currency" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "CurrencyID" bigint NOT NULL,
  "Code" integer NOT NULL,
  "Title" text NOT NULL,
  "Title_En" text NOT NULL,
  "ExchangeUnit" integer NOT NULL,
  "PrecisionCount" integer NOT NULL,
  "PrecisionTitle" varchar(50),
  "PrecisionTitle_En" varchar(50),
  "IsActive" boolean DEFAULT true,
  PRIMARY KEY ("CurrencyID")
);
CREATE TABLE IF NOT EXISTS "Gnr"."CurrencyExchangeRate" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "CurrencyExchangeRateID" bigint NOT NULL,
  "BaseCurrencyRef" bigint NOT NULL,
  "TargetCurrencyRef" bigint NOT NULL,
  "EffectiveDate" date NOT NULL,
  "ExchangeRate" numeric(18,6) NOT NULL,
  PRIMARY KEY ("CurrencyExchangeRateID")
);
CREATE TABLE IF NOT EXISTS "Gnr"."DetailedAccountsNumbering" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "DetailedAccountsNumberingID" bigint NOT NULL,
  "DetailedTypesID" bigint NOT NULL,
  "IsHeadquarterSelected" boolean DEFAULT true,
  "IsCompanySelected" boolean DEFAULT false,
  "StartNumber" bigint DEFAULT '1'::bigint,
  "EndNumber" bigint DEFAULT '1000'::bigint,
  PRIMARY KEY ("DetailedAccountsNumberingID")
);
CREATE TABLE IF NOT EXISTS "Gnr"."Entities" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "EntityID" bigint NOT NULL,
  "ParentRef" bigint,
  "EntityName" text NOT NULL,
  "EntityType" integer NOT NULL,
  PRIMARY KEY ("EntityID")
);
CREATE TABLE IF NOT EXISTS "Gnr"."EntityNumbering" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "EntityNumberingID" bigint NOT NULL,
  "EntityRef" varchar(100) NOT NULL,
  "NumberingMethod" varchar(10) DEFAULT '2'::character varying,
  "NumberingType" varchar(10) DEFAULT '1'::character varying,
  "BaseNumbering" text,
  "Items" text,
  PRIMARY KEY ("EntityNumberingID")
);
CREATE TABLE IF NOT EXISTS "Gnr"."FiscalYear" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "FiscalYearID" bigint NOT NULL,
  "Title" varchar(50) NOT NULL,
  "StartDate" date NOT NULL,
  "EndDate" date NOT NULL,
  "IsActive" boolean DEFAULT true,
  PRIMARY KEY ("FiscalYearID")
);
CREATE TABLE IF NOT EXISTS "Gnr"."GeoLocations" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "GeolocationID" bigint NOT NULL,
  "ParentRef" bigint DEFAULT '0'::bigint,
  "GeographicType" integer NOT NULL,
  "Code" varchar(100) NOT NULL,
  "Title" varchar(255) NOT NULL,
  "Title_En" varchar(255) NOT NULL,
  "IsActive" boolean DEFAULT true,
  PRIMARY KEY ("GeolocationID")
);
CREATE TABLE IF NOT EXISTS "Gnr"."IDGeneration" (
  "IDGenerationID" bigint NOT NULL,
  "TableName" varchar(255) NOT NULL,
  "LastID" bigint DEFAULT '0'::bigint,
  PRIMARY KEY ("IDGenerationID")
);
CREATE TABLE IF NOT EXISTS "Gnr"."LicenseActivations" (
  "LicenseActivationID" bigint NOT NULL,
  "licenseSignature" varchar NOT NULL,
  "isActivated" boolean DEFAULT false,
  "firstPromptAt" timestamp,
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now(),
  PRIMARY KEY ("LicenseActivationID")
);
CREATE TABLE IF NOT EXISTS "Gnr"."Parties" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PartyID" bigint NOT NULL,
  "Nature" varchar(50) DEFAULT 'real_person'::character varying,
  "IsActive" boolean DEFAULT true,
  "SubType" varchar(50),
  "Website" varchar(250),
  "EmailAddress" varchar(250),
  "FirstName" varchar(150),
  "LatinFirstName" varchar(150),
  "LastName" varchar(150),
  "LatinLastName" varchar(150),
  "DetailedAccountID" bigint,
  "EconomicCode" varchar(50),
  "NationalCode" varchar(50),
  "PassportNumber" varchar(50),
  "BirthDate" date,
  "MarriageDate" date,
  "NationalId" varchar(50),
  "RegistrationNumber" varchar(50),
  "IsSupplier" boolean DEFAULT false,
  "Balance" varchar(50),
  "BalanceStatus" varchar(50),
  "IsCustomer" boolean DEFAULT false,
  "CustomerBalance" varchar(50),
  "CustomerBalanceStatus" varchar(50),
  "IsSalesIntermediary" boolean DEFAULT false,
  "SalesIntermediaryBalance" varchar(50),
  "SalesIntermediaryBalanceStatus" varchar(50),
  PRIMARY KEY ("PartyID")
);
CREATE TABLE IF NOT EXISTS "Gnr"."PartiesAddresses" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PartyAddressID" bigint NOT NULL,
  "PartyRef" bigint NOT NULL,
  "AddressType" varchar(100),
  "City" varchar(150),
  "FullAddress" varchar(500),
  "PostalCode" varchar(50),
  "Longitude" varchar(50),
  "Latitude" varchar(50),
  PRIMARY KEY ("PartyAddressID")
);
CREATE TABLE IF NOT EXISTS "Gnr"."PartiesPhones" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PartyPhoneID" bigint NOT NULL,
  "PartyRef" bigint NOT NULL,
  "PhoneType" varchar(100),
  "PhoneNumber" varchar(50),
  "Internal" varchar(50),
  "Description" varchar(500),
  PRIMARY KEY ("PartyPhoneID")
);
CREATE TABLE IF NOT EXISTS "Gnr"."PartiesRelated" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PartyRelatedID" bigint NOT NULL,
  "PartyRef" bigint NOT NULL,
  "FirstName" varchar(150) NOT NULL,
  "LastName" varchar(150) NOT NULL,
  "Relation" varchar(150),
  "NationalCode" varchar(50),
  "Phone" varchar(50),
  "Description" varchar(500),
  PRIMARY KEY ("PartyRelatedID")
);
CREATE TABLE IF NOT EXISTS "Iam"."BusinessStructureUsers" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "businessStructureUsersId" bigint NOT NULL,
  "UserRef" bigint NOT NULL,
  PRIMARY KEY ("businessStructureUsersId")
);
CREATE TABLE IF NOT EXISTS "Iam"."Permission" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PermissionID" bigint NOT NULL,
  "resource" varchar NOT NULL,
  "action" varchar NOT NULL,
  "description" varchar,
  "isAutoDiscovered" boolean DEFAULT true,
  PRIMARY KEY ("PermissionID")
);
CREATE TABLE IF NOT EXISTS "Iam"."Role" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "RoleID" bigint NOT NULL,
  "name" varchar NOT NULL,
  "description" varchar,
  "level" varchar,
  PRIMARY KEY ("RoleID")
);
CREATE TABLE IF NOT EXISTS "Iam"."RolePermission" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "RolePermissionID" bigint NOT NULL,
  "RoleID" bigint NOT NULL,
  "PermissionID" bigint NOT NULL,
  "conditions" text,
  PRIMARY KEY ("RolePermissionID")
);
CREATE TABLE IF NOT EXISTS "Iam"."User" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "UserID" bigint NOT NULL,
  "username" varchar NOT NULL,
  "passwordHash" varchar NOT NULL,
  "firstName" varchar,
  "lastName" varchar,
  "isActive" boolean DEFAULT true,
  "repeatChangePassword" integer DEFAULT 0,
  "BusinessStructureID" bigint,
  "UserGroupRef" bigint,
  "refreshToken" varchar,
  "lastSeen" timestamp,
  "twoFactorSecret" varchar,
  "isTwoFactorEnabled" boolean DEFAULT false,
  PRIMARY KEY ("UserID")
);
CREATE TABLE IF NOT EXISTS "Iam"."UserGroupPermissions" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "UserGroupPermissionsID" bigint NOT NULL,
  "UserGroupRef" bigint NOT NULL,
  "permissionKey" varchar NOT NULL,
  "value" boolean DEFAULT true,
  PRIMARY KEY ("UserGroupPermissionsID")
);
CREATE TABLE IF NOT EXISTS "Iam"."UserGroups" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "UserGroupID" bigint NOT NULL,
  "code" varchar NOT NULL,
  "title" varchar NOT NULL,
  "Title_En" varchar,
  "isActive" boolean DEFAULT true,
  PRIMARY KEY ("UserGroupID")
);
CREATE TABLE IF NOT EXISTS "Iam"."UserRole" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "UserRoleID" bigint NOT NULL,
  "UserID" bigint NOT NULL,
  "RoleID" bigint NOT NULL,
  PRIMARY KEY ("UserRoleID")
);
CREATE TABLE IF NOT EXISTS "Inv"."ItemAccountCategories" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ItemAccountCategoryID" bigint NOT NULL,
  "ItemAccountCategoryCode" integer,
  "ItemAccountCategoryName" varchar(150),
  "ItemAccountCategoryName2" varchar(150),
  "PricingMethod" integer DEFAULT 1,
  "StandardRate" integer DEFAULT 1,
  "IsActive" boolean DEFAULT true,
  "InventorySlAccountRef" bigint,
  "IndividualPurchaseSlAccountRef" bigint,
  "CorporatePurchaseSlAccountRef" bigint,
  "FreightSlAccountRef" bigint,
  "SuspensePurchaseSlAccountRef" bigint,
  "ForeignPurchaseSlAccountRef" bigint,
  "ScrapExpenseSlAccountRef" bigint,
  "ConsignmentOursSlAccountRef" bigint,
  "ConsignmentOthersSlAccountRef" bigint,
  "ConsignmentOffsetSlAccountRef" bigint,
  "IndividualPrepaymentSlAccountRef" bigint,
  "CorporatePrepaymentSlAccountRef" bigint,
  "ScrapIncomeSlAccountRef" bigint,
  PRIMARY KEY ("ItemAccountCategoryID")
);
CREATE TABLE IF NOT EXISTS "Inv"."ItemImages" (
  "ItemImageID" bigint NOT NULL,
  "Version" bigint DEFAULT 1,
  "Creator" bigint DEFAULT 1,
  "CreationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT 1,
  "LastModificationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT 2,
  "CompanyRef" bigint DEFAULT 2,
  "ItemRef" bigint NOT NULL,
  "ImageName" varchar(250),
  "IsMain" boolean DEFAULT false,
  "ThumbnailUrl" text,
  "MediumUrl" text,
  "OriginalUrl" text,
  "FileSize" bigint DEFAULT 0,
  PRIMARY KEY ("ItemImageID")
);
CREATE TABLE IF NOT EXISTS "Inv"."ItemInventoryControls" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ItemInventoryControlID" bigint NOT NULL,
  "ItemRef" bigint NOT NULL,
  "EffectiveDate" varchar(10),
  "MinQuantity" numeric(18,4) DEFAULT '0'::numeric,
  "MaxQuantity" numeric(18,4) DEFAULT '0'::numeric,
  "OrderQuantity" numeric(18,4) DEFAULT '0'::numeric,
  "ReorderPoint" numeric(18,4) DEFAULT '0'::numeric,
  "Description" varchar(500),
  PRIMARY KEY ("ItemInventoryControlID")
);
CREATE TABLE IF NOT EXISTS "Inv"."ItemPackageDetails" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ItemPackageDetailID" bigint NOT NULL,
  "ItemPackageRef" bigint NOT NULL,
  "RowNo" integer DEFAULT 1,
  "ItemRef" bigint NOT NULL,
  "MeasurementUnitRef" bigint,
  "Quantity" numeric(18,4) DEFAULT '1'::numeric,
  "Description" text,
  "FiscalYearRef" bigint,
  PRIMARY KEY ("ItemPackageDetailID")
);
CREATE TABLE IF NOT EXISTS "Inv"."ItemPackages" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ItemPackageID" bigint NOT NULL,
  "ItemType" integer DEFAULT 1,
  "PackageCode" varchar(100),
  "PackageTitle" varchar(250) NOT NULL,
  "PackageTitle2" varchar(250),
  "MeasurementUnitRef" bigint,
  "Quantity" numeric(18,4) DEFAULT '1'::numeric,
  "Description" text,
  "IsActive" boolean DEFAULT true,
  "FiscalYearRef" bigint,
  PRIMARY KEY ("ItemPackageID")
);
CREATE TABLE IF NOT EXISTS "Inv"."ItemPhysicalLocations" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ItemPhysicalLocationID" bigint NOT NULL,
  "ItemRef" bigint NOT NULL,
  "WarehouseRef" bigint NOT NULL,
  "IsDefault" boolean DEFAULT false,
  PRIMARY KEY ("ItemPhysicalLocationID")
);
CREATE TABLE IF NOT EXISTS "Inv"."ItemRequestDetails" (
  "ItemRequestDetailID" bigint NOT NULL,
  "ItemRequestRef" bigint NOT NULL,
  "RowNo" integer NOT NULL,
  "ItemRef" bigint NOT NULL,
  "RequestQuantity" numeric(18,4) DEFAULT 0,
  "ApprovedQuantity" numeric(18,4) DEFAULT 0,
  "Description" varchar(500),
  "TrackingFactorValues" jsonb,
  "DeliveryDate" timestamp,
  PRIMARY KEY ("ItemRequestDetailID")
);
CREATE TABLE IF NOT EXISTS "Inv"."ItemRequestTrackingFactors" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ItemRequestTrackingFactorID" bigint NOT NULL,
  "ItemRequestDetailRef" bigint NOT NULL,
  "TrackingFactorRef" bigint,
  "TrackingFactorCode" integer,
  "TrackingFactorName" varchar(200),
  "Quantity" numeric(18,4) DEFAULT '0'::numeric,
  "FactorValue" text,
  "StartValue" varchar(100),
  "EndValue" varchar(100),
  "TrackingFactorValues" jsonb,
  PRIMARY KEY ("ItemRequestTrackingFactorID")
);
CREATE TABLE IF NOT EXISTS "Inv"."ItemRequests" (
  "ItemRequestID" bigint NOT NULL,
  "Creator" bigint DEFAULT 1,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT 1,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT 2,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "BasisType" integer DEFAULT 1,
  "WarehouseRef" bigint,
  "FiscalYearRef" bigint,
  "RequestType" integer DEFAULT 1,
  "Priority" integer DEFAULT 1,
  "Status" integer DEFAULT 1,
  "Requester" varchar(200),
  "RequesterRef" bigint,
  "Version" integer DEFAULT 1,
  "RequestNumber" bigint NOT NULL,
  "RequestDate" timestamp,
  "Description" varchar(1000),
  "ProjectRef" bigint,
  PRIMARY KEY ("ItemRequestID")
);
CREATE TABLE IF NOT EXISTS "Inv"."ItemServiceGroupFields" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ItemServiceGroupFieldID" bigint NOT NULL,
  "ItemServiceGroupRef" bigint NOT NULL,
  "FieldTitle" varchar(150) NOT NULL,
  "FieldTitle2" varchar(150),
  "FieldType" integer DEFAULT 1,
  "IsRequired" boolean DEFAULT false,
  "Options" text,
  "RowNo" integer DEFAULT 1,
  PRIMARY KEY ("ItemServiceGroupFieldID")
);
CREATE TABLE IF NOT EXISTS "Inv"."ItemServiceGroupRelatedProducts" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ItemServiceGroupRelatedProductID" bigint NOT NULL,
  "ItemServiceGroupRef" bigint NOT NULL,
  "ProductCode" varchar(50),
  "ProductName" varchar(250),
  "Unit" varchar(50),
  "IsActive" boolean DEFAULT true,
  "Description" varchar(500),
  PRIMARY KEY ("ItemServiceGroupRelatedProductID")
);
CREATE TABLE IF NOT EXISTS "Inv"."ItemServiceGroups" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ItemServiceGroupID" bigint NOT NULL,
  "ItemServiceGroupCode" varchar(50),
  "ItemServiceGroupName" varchar(250),
  "ItemServiceGroupName2" varchar(250),
  "Description" varchar(500),
  "IsMandatory" boolean DEFAULT false,
  "ParentRef" bigint,
  PRIMARY KEY ("ItemServiceGroupID")
);
CREATE TABLE IF NOT EXISTS "Inv"."ItemSimilarItems" (
  "ItemSimilarItemID" bigint NOT NULL,
  "Version" bigint DEFAULT 1,
  "Creator" bigint DEFAULT 1,
  "CreationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT 1,
  "LastModificationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT 2,
  "CompanyRef" bigint DEFAULT 2,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ItemRef" bigint NOT NULL,
  "SimilarItemRef" bigint NOT NULL,
  "MeasurementUnitRef" bigint,
  "QuantityRatio" numeric(18,4) DEFAULT 1,
  "Priority" integer DEFAULT 1,
  "Description" varchar(500),
  PRIMARY KEY ("ItemSimilarItemID")
);
CREATE TABLE IF NOT EXISTS "Inv"."ItemSubUnits" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ItemSubUnitID" bigint NOT NULL,
  "ItemRef" bigint NOT NULL,
  "SubUnitRef" bigint NOT NULL,
  "MainToSubRatio" numeric(18,4) DEFAULT '1'::numeric,
  "IsVariableRatio" integer DEFAULT 2,
  "TolerancePercent" numeric(18,4) DEFAULT '0'::numeric,
  PRIMARY KEY ("ItemSubUnitID")
);
CREATE TABLE IF NOT EXISTS "Inv"."ItemSupplyRequestDetails" (
  "ItemSupplyRequestDetailID" bigint NOT NULL,
  "ItemSupplyRequestRef" bigint NOT NULL,
  "RowNo" integer NOT NULL,
  "ItemRef" bigint NOT NULL,
  "RequestQuantity" numeric(18,4) DEFAULT 0,
  "ApprovedQuantity" numeric(18,4) DEFAULT 0,
  "DeliveryDate" timestamp,
  "Description" varchar(500),
  "TrackingFactorValues" jsonb,
  PRIMARY KEY ("ItemSupplyRequestDetailID")
);
CREATE TABLE IF NOT EXISTS "Inv"."ItemSupplyRequestTrackingFactors" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ItemSupplyRequestTrackingFactorID" bigint NOT NULL,
  "ItemSupplyRequestDetailRef" bigint NOT NULL,
  "TrackingFactorRef" bigint,
  "TrackingFactorCode" integer,
  "TrackingFactorName" varchar(200),
  "Quantity" numeric(18,4) DEFAULT '0'::numeric,
  "FactorValue" text,
  "StartValue" varchar(100),
  "EndValue" varchar(100),
  "TrackingFactorValues" jsonb,
  PRIMARY KEY ("ItemSupplyRequestTrackingFactorID")
);
CREATE TABLE IF NOT EXISTS "Inv"."ItemSupplyRequests" (
  "ItemSupplyRequestID" bigint NOT NULL,
  "Creator" bigint DEFAULT 1,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT 1,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT 2,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "BasisType" integer DEFAULT 1,
  "RequestNumber" bigint NOT NULL,
  "RequestDate" timestamp,
  "RequestType" integer DEFAULT 1,
  "Priority" integer DEFAULT 1,
  "Status" integer DEFAULT 1,
  "Requester" varchar(200),
  "RequesterRef" bigint,
  "WarehouseRef" bigint,
  "Description" varchar(1000),
  "FiscalYearRef" bigint,
  "Version" integer DEFAULT 1,
  PRIMARY KEY ("ItemSupplyRequestID")
);
CREATE TABLE IF NOT EXISTS "Inv"."ItemVolumeCbms" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ItemVolumeCbmID" bigint NOT NULL,
  "ItemRef" bigint NOT NULL,
  "Quantity" numeric(18,4) DEFAULT '1'::numeric,
  "MeasurementUnitRef" bigint,
  "Length" numeric(18,4) DEFAULT '0'::numeric,
  "Width" numeric(18,4) DEFAULT '0'::numeric,
  "Height" numeric(18,4) DEFAULT '0'::numeric,
  "Volume" numeric(18,4) DEFAULT '0'::numeric,
  "Description" varchar(500),
  PRIMARY KEY ("ItemVolumeCbmID")
);
CREATE TABLE IF NOT EXISTS "Inv"."Items" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ItemID" bigint NOT NULL,
  "ItemType" integer DEFAULT 1,
  "ItemCode" integer,
  "ItemName" varchar(250),
  "ItemName2" varchar(250),
  "MeasurementUnitRef" bigint,
  "TechnicalSpecification" text,
  "DetailedAccountCode" varchar(100),
  "TaxRate" numeric(18,4) DEFAULT '0'::numeric,
  "DutyRate" numeric(18,4) DEFAULT '0'::numeric,
  "IranCode" varchar(50),
  "ItemAccountCategoryRef" bigint,
  "PricingMethod" integer DEFAULT 1,
  "TaxAndDutyExemption" integer DEFAULT 1,
  "IsSalable" boolean DEFAULT true,
  "IsActive" boolean DEFAULT true,
  PRIMARY KEY ("ItemID")
);
CREATE TABLE IF NOT EXISTS "Inv"."MeasurementUnits" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "MeasurementUnitID" bigint NOT NULL,
  "MeasurementUnitCode" integer,
  "MeasurementUnitName" varchar(150),
  "MeasurementUnitName2" varchar(150),
  "IsActive" boolean DEFAULT true,
  PRIMARY KEY ("MeasurementUnitID")
);
CREATE TABLE IF NOT EXISTS "Inv"."PurchaseInvoiceDetails" (
  "PurchaseInvoiceDetailID" bigint NOT NULL,
  "PurchaseInvoiceRef" bigint NOT NULL,
  "RowNo" integer DEFAULT 1,
  "ItemRef" bigint,
  "UnitType" integer DEFAULT 1,
  "Quantity" numeric(18,4) DEFAULT '1'::numeric,
  "UnitPrice" numeric(18,4) DEFAULT '0'::numeric,
  "Discount" numeric(18,4) DEFAULT '0'::numeric,
  "Description" varchar(500),
  "TrackingFactorValues" jsonb,
  PRIMARY KEY ("PurchaseInvoiceDetailID")
);
CREATE TABLE IF NOT EXISTS "Inv"."PurchaseInvoiceFactors" (
  "PurchaseInvoiceFactorID" bigint NOT NULL,
  "PurchaseInvoiceRef" bigint NOT NULL,
  "RowNo" integer DEFAULT 1,
  "FactorTitle" varchar(200),
  "FactorType" integer DEFAULT 1,
  "Amount" numeric(18,4) DEFAULT '0'::numeric,
  "Description" varchar(500),
  PRIMARY KEY ("PurchaseInvoiceFactorID")
);
CREATE TABLE IF NOT EXISTS "Inv"."PurchaseInvoiceTrackingFactors" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PurchaseInvoiceTrackingFactorID" bigint NOT NULL,
  "PurchaseInvoiceDetailRef" bigint NOT NULL,
  "TrackingFactorRef" bigint,
  "TrackingFactorCode" integer,
  "TrackingFactorName" varchar(200),
  "Quantity" numeric(18,4) DEFAULT '0'::numeric,
  "FactorValue" text,
  "StartValue" varchar(100),
  "EndValue" varchar(100),
  "TrackingFactorValues" jsonb,
  PRIMARY KEY ("PurchaseInvoiceTrackingFactorID")
);
CREATE TABLE IF NOT EXISTS "Inv"."PurchaseInvoices" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PurchaseInvoiceID" bigint NOT NULL,
  "BaseType" integer DEFAULT 1,
  "SupplyRequestRef" bigint,
  "SupplierRef" bigint,
  "SupplierName" varchar(200),
  "InvoiceNumber" bigint NOT NULL,
  "InvoiceDate" timestamp,
  "BaseDocumentNumber" varchar(100),
  "Status" integer DEFAULT 1,
  "CurrencyRef" integer DEFAULT 1,
  "Description" varchar(1000),
  "FiscalYearRef" bigint,
  PRIMARY KEY ("PurchaseInvoiceID")
);
CREATE TABLE IF NOT EXISTS "Inv"."PurchaseSalesParameterValues" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PurchaseSalesParameterValueID" bigint NOT NULL,
  "PurchaseSalesParameterRef" bigint NOT NULL,
  "RowNo" integer DEFAULT 1,
  "StartDate" varchar(10),
  "EndDate" varchar(10),
  "ParameterValue" numeric(18,4) DEFAULT '0'::numeric,
  "Description" text,
  "ProductServiceRef" bigint,
  "ProductServiceCode" varchar(100),
  "ProductServiceName" varchar(250),
  "MeasurementUnitName" varchar(100),
  PRIMARY KEY ("PurchaseSalesParameterValueID")
);
CREATE TABLE IF NOT EXISTS "Inv"."PurchaseSalesParameters" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PurchaseSalesParameterID" bigint NOT NULL,
  "IsProcurement" boolean DEFAULT false,
  "IsWarehouse" boolean DEFAULT true,
  "IsSales" boolean DEFAULT false,
  "Title" varchar(200),
  "Title2" varchar(200),
  "CalculationPriority" integer DEFAULT 1,
  "PrintPriority" integer DEFAULT 1,
  "ParameterType" integer DEFAULT 1,
  "CalculationMethod" integer DEFAULT 1,
  "CalculationCondition" integer DEFAULT 1,
  "RelationType" integer DEFAULT 1,
  "OperationType" integer DEFAULT 1,
  "AmountAllocationMethod" integer DEFAULT 1,
  "CategoryOther" integer DEFAULT 1,
  "HasAccountingVoucher" boolean DEFAULT false,
  "SlAccountRef" bigint,
  "IsNonDefiniteAmount" boolean DEFAULT false,
  "IsMandatory" boolean DEFAULT false,
  "IsFactorValueEditableByUser" boolean DEFAULT false,
  "IsActive" boolean DEFAULT true,
  "Description" text,
  PRIMARY KEY ("PurchaseSalesParameterID")
);
CREATE TABLE IF NOT EXISTS "Inv"."ServicePurchaseInvoiceDetails" (
  "ServicePurchaseInvoiceDetailID" bigint NOT NULL,
  "ServicePurchaseInvoiceRef" bigint NOT NULL,
  "RowNo" integer DEFAULT 1,
  "ItemRef" bigint,
  "UnitType" integer DEFAULT 1,
  "Quantity" numeric(18,4) DEFAULT '1'::numeric,
  "UnitPrice" numeric(18,4) DEFAULT '0'::numeric,
  "Discount" numeric(18,4) DEFAULT '0'::numeric,
  "Description" varchar(500),
  PRIMARY KEY ("ServicePurchaseInvoiceDetailID")
);
CREATE TABLE IF NOT EXISTS "Inv"."ServicePurchaseInvoiceFactors" (
  "ServicePurchaseInvoiceFactorID" bigint NOT NULL,
  "ServicePurchaseInvoiceRef" bigint NOT NULL,
  "RowNo" integer DEFAULT 1,
  "FactorTitle" varchar(200),
  "FactorType" integer DEFAULT 1,
  "Amount" numeric(18,4) DEFAULT '0'::numeric,
  "Description" varchar(500),
  PRIMARY KEY ("ServicePurchaseInvoiceFactorID")
);
CREATE TABLE IF NOT EXISTS "Inv"."ServicePurchaseInvoices" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ServicePurchaseInvoiceID" bigint NOT NULL,
  "BaseType" integer DEFAULT 1,
  "SupplyRequestRef" bigint,
  "SupplierRef" bigint,
  "SupplierName" varchar(200),
  "InvoiceNumber" bigint NOT NULL,
  "InvoiceDate" timestamp,
  "BaseDocumentNumber" varchar(100),
  "Status" integer DEFAULT 1,
  "CurrencyRef" integer DEFAULT 1,
  "Description" varchar(1000),
  "FiscalYearRef" bigint,
  PRIMARY KEY ("ServicePurchaseInvoiceID")
);
CREATE TABLE IF NOT EXISTS "Inv"."ServiceRequestDetails" (
  "ServiceRequestDetailID" bigint NOT NULL,
  "ServiceRequestRef" bigint NOT NULL,
  "RowNo" integer NOT NULL,
  "ItemRef" bigint NOT NULL,
  "RequestQuantity" numeric(18,4) DEFAULT 0,
  "ApprovedQuantity" numeric(18,4) DEFAULT 0,
  "DeliveryDate" varchar(10),
  "Description" varchar(500),
  PRIMARY KEY ("ServiceRequestDetailID")
);
CREATE TABLE IF NOT EXISTS "Inv"."ServiceRequests" (
  "ServiceRequestID" bigint NOT NULL,
  "Creator" bigint DEFAULT 1,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT 1,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT 2,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "RequestNumber" bigint NOT NULL,
  "Priority" integer DEFAULT 1,
  "Status" integer DEFAULT 1,
  "Requester" varchar(200),
  "RequesterRef" bigint,
  "Description" varchar(1000),
  "FiscalYearRef" bigint,
  "BaseSource" integer DEFAULT 1,
  "Version" integer DEFAULT 1,
  "RequestDate" timestamp,
  PRIMARY KEY ("ServiceRequestID")
);
CREATE TABLE IF NOT EXISTS "Inv"."ServiceSupplyRequestDetails" (
  "ServiceSupplyRequestDetailID" bigint NOT NULL,
  "ServiceSupplyRequestRef" bigint NOT NULL,
  "RowNo" integer NOT NULL,
  "ItemRef" bigint NOT NULL,
  "RequestQuantity" numeric(18,4) DEFAULT 0,
  "ApprovedQuantity" numeric(18,4) DEFAULT 0,
  "DeliveryDate" timestamp,
  "Description" varchar(500),
  PRIMARY KEY ("ServiceSupplyRequestDetailID")
);
CREATE TABLE IF NOT EXISTS "Inv"."ServiceSupplyRequests" (
  "ServiceSupplyRequestID" bigint NOT NULL,
  "Creator" bigint DEFAULT 1,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT 1,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT 2,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "BasisType" integer DEFAULT 1,
  "RequestNumber" bigint NOT NULL,
  "RequestDate" timestamp,
  "RequestType" integer DEFAULT 1,
  "Priority" integer DEFAULT 1,
  "Status" integer DEFAULT 1,
  "Requester" varchar(200),
  "RequesterRef" bigint,
  "WarehouseRef" bigint,
  "Description" varchar(1000),
  "FiscalYearRef" bigint,
  "Version" integer DEFAULT 1,
  PRIMARY KEY ("ServiceSupplyRequestID")
);
CREATE TABLE IF NOT EXISTS "Inv"."StandardItemRateDetails" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "StandardItemRateDetailID" bigint NOT NULL,
  "StandardItemRateRef" bigint NOT NULL,
  "ItemRef" bigint NOT NULL,
  "UnitRate" numeric(18,4) DEFAULT '0'::numeric,
  PRIMARY KEY ("StandardItemRateDetailID")
);
CREATE TABLE IF NOT EXISTS "Inv"."StandardItemRates" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "StandardItemRateID" bigint NOT NULL,
  "FiscalYearRef" bigint,
  "ItemAccountCategoryRef" bigint,
  "EffectiveDate" varchar(10),
  "Description" varchar(500),
  PRIMARY KEY ("StandardItemRateID")
);
CREATE TABLE IF NOT EXISTS "Inv"."StocktakingCountDetails" (
  "StocktakingCountDetailID" bigint NOT NULL,
  "StocktakingCountRef" bigint NOT NULL,
  "RowNumber" integer NOT NULL,
  "ItemRef" bigint NOT NULL,
  "TagNumber" varchar(100),
  "CountedQuantity" numeric(18,4) DEFAULT '0'::numeric,
  "Description" varchar(500),
  PRIMARY KEY ("StocktakingCountDetailID")
);
CREATE TABLE IF NOT EXISTS "Inv"."StocktakingCountTrackingFactors" (
  "StocktakingCountTrackingFactorID" bigint NOT NULL,
  "StocktakingCountDetailRef" bigint NOT NULL,
  "TrackingFactorRef" bigint NOT NULL,
  "FactorValue" varchar(255),
  "CountedQuantity" numeric(18,4) DEFAULT '0'::numeric,
  PRIMARY KEY ("StocktakingCountTrackingFactorID")
);
CREATE TABLE IF NOT EXISTS "Inv"."StocktakingCounts" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "StocktakingCountID" bigint NOT NULL,
  "StocktakingTagHeaderRef" bigint NOT NULL,
  "WarehouseRef" bigint NOT NULL,
  "StocktakingDate" varchar(20) NOT NULL,
  "StocktakingNumber" bigint NOT NULL,
  "CountRound" integer DEFAULT 1,
  "Status" integer DEFAULT 1,
  "Description" varchar(500),
  "FiscalYearRef" bigint,
  PRIMARY KEY ("StocktakingCountID")
);
CREATE TABLE IF NOT EXISTS "Inv"."StocktakingSettingWarehouses" (
  "StocktakingSettingWarehouseID" bigint NOT NULL,
  "StocktakingSettingRef" bigint NOT NULL,
  "WarehouseRef" bigint NOT NULL,
  PRIMARY KEY ("StocktakingSettingWarehouseID")
);
CREATE TABLE IF NOT EXISTS "Inv"."StocktakingSettings" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "StocktakingSettingID" bigint NOT NULL,
  "MethodName" varchar(150),
  "CountTimes" integer DEFAULT 1,
  "CountWithTrackingFactors" boolean DEFAULT false,
  "Count1MinQty" numeric(18,4) DEFAULT '0'::numeric,
  "Count1MinRial" numeric(18,4) DEFAULT '0'::numeric,
  "Count1MinTurnover" numeric(18,4) DEFAULT '0'::numeric,
  "Count2ListType" varchar(50) DEFAULT 'all_first'::character varying,
  "Count2DiscrepancyPercent" numeric(18,4) DEFAULT '0'::numeric,
  "Count3CombineType" varchar(10) DEFAULT 'OR'::character varying,
  "Count3DiscrepancyPercent" numeric(18,4) DEFAULT '0'::numeric,
  "Count3Discrepancy1And2" boolean DEFAULT false,
  "Count3Discrepancy1AndInv" boolean DEFAULT false,
  "Count3Discrepancy2AndInv" boolean DEFAULT false,
  PRIMARY KEY ("StocktakingSettingID")
);
CREATE TABLE IF NOT EXISTS "Inv"."StocktakingTagDetails" (
  "StocktakingTagDetailID" bigint NOT NULL,
  "StocktakingTagHeaderRef" bigint NOT NULL,
  "WarehouseRef" bigint NOT NULL,
  "ItemRef" bigint NOT NULL,
  "TagNumber" varchar(100),
  PRIMARY KEY ("StocktakingTagDetailID")
);
CREATE TABLE IF NOT EXISTS "Inv"."StocktakingTagHeaders" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "StocktakingTagHeaderID" bigint NOT NULL,
  "StocktakingPeriod" varchar(150),
  "StocktakingSettingRef" bigint NOT NULL,
  "StocktakingDate" varchar(20) NOT NULL,
  "StocktakingNumber" bigint NOT NULL,
  "OfficerPartyRef" bigint,
  "Description" text,
  "FiscalYearRef" bigint,
  PRIMARY KEY ("StocktakingTagHeaderID")
);
CREATE TABLE IF NOT EXISTS "Inv"."StocktakingTags" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "StocktakingTagID" bigint NOT NULL,
  "StocktakingRef" bigint NOT NULL,
  "WarehouseRef" bigint NOT NULL,
  "ItemRef" bigint NOT NULL,
  "TagNumber" varchar(100),
  PRIMARY KEY ("StocktakingTagID")
);
CREATE TABLE IF NOT EXISTS "Inv"."TemporaryItemReceiptDetails" (
  "TemporaryItemReceiptDetailID" bigint NOT NULL,
  "TemporaryItemReceiptRef" bigint NOT NULL,
  "RowNo" integer DEFAULT 1,
  "ItemRef" bigint,
  "BaseNumber" varchar(100),
  "UnitName" varchar(100),
  "UnitType" integer DEFAULT 1,
  "Quantity" numeric(18,4) DEFAULT '1'::numeric,
  "UnitPrice" numeric(18,4) DEFAULT '0'::numeric,
  "Discount" numeric(18,4) DEFAULT '0'::numeric,
  "Description" varchar(500),
  "TrackingFactorValues" jsonb,
  PRIMARY KEY ("TemporaryItemReceiptDetailID")
);
CREATE TABLE IF NOT EXISTS "Inv"."TemporaryItemReceiptFactors" (
  "TemporaryItemReceiptFactorID" bigint NOT NULL,
  "TemporaryItemReceiptRef" bigint NOT NULL,
  "RowNo" integer DEFAULT 1,
  "FactorTitle" varchar(200) NOT NULL,
  "FactorType" integer DEFAULT 1,
  "Amount" numeric(18,4) DEFAULT '0'::numeric,
  "Description" varchar(500),
  PRIMARY KEY ("TemporaryItemReceiptFactorID")
);
CREATE TABLE IF NOT EXISTS "Inv"."TemporaryItemReceiptTrackingFactors" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "TemporaryItemReceiptTrackingFactorID" bigint NOT NULL,
  "TemporaryItemReceiptDetailRef" bigint NOT NULL,
  "TrackingFactorRef" bigint,
  "TrackingFactorCode" integer,
  "TrackingFactorName" varchar(200),
  "Quantity" numeric(18,4) DEFAULT '0'::numeric,
  "FactorValue" text,
  "StartValue" varchar(100),
  "EndValue" varchar(100),
  "TrackingFactorValues" jsonb,
  PRIMARY KEY ("TemporaryItemReceiptTrackingFactorID")
);
CREATE TABLE IF NOT EXISTS "Inv"."TemporaryItemReceipts" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "TemporaryItemReceiptID" bigint NOT NULL,
  "Type" integer DEFAULT 1,
  "BaseType" integer DEFAULT 1,
  "SupplyRequestRef" bigint,
  "SupplierRef" bigint,
  "SupplierName" varchar(200),
  "ReceiptNumber" bigint NOT NULL,
  "ReceiptDate" timestamp,
  "BaseDocumentNumber" varchar(100),
  "Status" integer DEFAULT 1,
  "CurrencyRef" integer DEFAULT 1,
  "Description" varchar(1000),
  "FiscalYearRef" bigint,
  PRIMARY KEY ("TemporaryItemReceiptID")
);
CREATE TABLE IF NOT EXISTS "Inv"."TrackingFactorConstantValue" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "TrackingFactorConstantValueID" bigint NOT NULL,
  "TrackingFactorRef" bigint NOT NULL,
  "RowNumber" integer,
  "ConstantValue" varchar(500) NOT NULL,
  PRIMARY KEY ("TrackingFactorConstantValueID")
);
CREATE TABLE IF NOT EXISTS "Inv"."TrackingFactorItemRelated" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "TrackingFactorItemRelatedID" bigint NOT NULL,
  "TrackingFactorRef" bigint NOT NULL,
  "ItemRef" bigint NOT NULL,
  PRIMARY KEY ("TrackingFactorItemRelatedID")
);
CREATE TABLE IF NOT EXISTS "Inv"."TrackingFactors" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "TrackingFactorID" bigint NOT NULL,
  "TrackingFactorCode" bigint,
  "TrackingFactorName" varchar(250) NOT NULL,
  "TrackingFactorName2" varchar(250),
  "TrackingFactorType" integer DEFAULT 1,
  "StartValue" varchar(250),
  "EndValue" varchar(250),
  "IsConstantValue" boolean DEFAULT false,
  "DisplayPriority" integer DEFAULT 1,
  "IsActive" boolean DEFAULT true,
  PRIMARY KEY ("TrackingFactorID")
);
CREATE TABLE IF NOT EXISTS "Inv"."WarehouseAddresses" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "WarehouseAddressID" bigint NOT NULL,
  "WarehouseRef" bigint,
  "AddressState" varchar(100),
  "AddressCity" varchar(100),
  "AddressTitle" varchar(250),
  "AddressTitle2" varchar(250),
  "PostalCode" varchar(50),
  "Longitude" varchar(50),
  "Latitude" varchar(50),
  PRIMARY KEY ("WarehouseAddressID")
);
CREATE TABLE IF NOT EXISTS "Inv"."WarehouseDocumentTypes" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "WarehouseDocumentTypeID" bigint NOT NULL,
  "WarehouseDocumentTypeCode" integer,
  "WarehouseDocumentTypeTitle" varchar(200),
  "WarehouseDocumentTypeTitle2" varchar(200),
  "WarehouseDocumentNature" integer DEFAULT 1,
  "HasBaseDocument" boolean DEFAULT false,
  "BaseDocumentTypeRefs" json,
  "WarehouseName" varchar(200),
  "DetailedName" varchar(200),
  "RelatedDetailedTypeRefs" json,
  "DisplayableItemNatures" json,
  "ShowPurchaseSalesParameters" boolean DEFAULT false,
  "HasAccountingDocument" boolean DEFAULT false,
  "IsActive" boolean DEFAULT true,
  PRIMARY KEY ("WarehouseDocumentTypeID")
);
CREATE TABLE IF NOT EXISTS "Inv"."WarehouseIssueTrackingFactors" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "WarehouseIssueTrackingFactorID" bigint NOT NULL,
  "WarehouseIssueDetailRef" bigint NOT NULL,
  "TrackingFactorRef" bigint,
  "TrackingFactorCode" integer,
  "TrackingFactorName" varchar(200),
  "Quantity" numeric(18,4) DEFAULT '0'::numeric,
  "FactorValue" text,
  "StartValue" varchar(100),
  "EndValue" varchar(100),
  "TrackingFactorValues" jsonb,
  PRIMARY KEY ("WarehouseIssueTrackingFactorID")
);
CREATE TABLE IF NOT EXISTS "Inv"."WarehouseKeepers" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "WarehouseKeeperID" bigint NOT NULL,
  "WarehouseRef" bigint,
  "WarehouseKeeperRef" bigint,
  "Address" varchar(250),
  "MobilePhone" varchar(50),
  "Phone" varchar(50),
  PRIMARY KEY ("WarehouseKeeperID")
);
CREATE TABLE IF NOT EXISTS "Inv"."WarehouseProducts" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "WarehouseProductID" bigint NOT NULL,
  "WarehouseRef" bigint,
  "ProductCode" varchar(50),
  "ProductTitle" varchar(150),
  "MeasurementUnitRef" bigint,
  PRIMARY KEY ("WarehouseProductID")
);
CREATE TABLE IF NOT EXISTS "Inv"."WarehouseReceiptTrackingFactors" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "WarehouseReceiptTrackingFactorID" bigint NOT NULL,
  "WarehouseReceiptDetailRef" bigint NOT NULL,
  "TrackingFactorRef" bigint,
  "TrackingFactorCode" integer,
  "TrackingFactorName" varchar(200),
  "Quantity" numeric(18,4) DEFAULT '0'::numeric,
  "FactorValue" text,
  "StartValue" varchar(100),
  "EndValue" varchar(100),
  "TrackingFactorValues" jsonb,
  PRIMARY KEY ("WarehouseReceiptTrackingFactorID")
);
CREATE TABLE IF NOT EXISTS "Inv"."WarehouseUsers" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "WarehouseUserID" bigint NOT NULL,
  "WarehouseRef" bigint,
  "UserRef" bigint,
  PRIMARY KEY ("WarehouseUserID")
);
CREATE TABLE IF NOT EXISTS "Inv"."WarehouseVouchers" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "WarehouseReceiptID" bigint NOT NULL,
  "BaseType" integer DEFAULT 1,
  "WarehouseDocumentTypeRef" bigint,
  "WarehouseRef" bigint,
  "WarehouseName" varchar(200),
  "TemporaryReceiptRef" bigint,
  "SupplyRequestRef" bigint,
  "PurchaseInvoiceRef" bigint,
  "SupplierRef" bigint,
  "SupplierName" varchar(200),
  "ReceiptNumber" bigint NOT NULL,
  "ReceiptDate" timestamp,
  "BaseDocumentNumber" varchar(100),
  "Status" integer DEFAULT 1,
  "CurrencyRef" integer DEFAULT 1,
  "Description" varchar(1000),
  "FiscalYearRef" bigint,
  PRIMARY KEY ("WarehouseReceiptID")
);
CREATE TABLE IF NOT EXISTS "Inv"."WarehouseVouchersDetails" (
  "WarehouseReceiptDetailID" bigint NOT NULL,
  "WarehouseReceiptRef" bigint NOT NULL,
  "RowNo" integer DEFAULT 1,
  "ItemRef" bigint,
  "WarehouseRef" bigint,
  "BaseNumber" varchar(100),
  "UnitName" varchar(100),
  "UnitType" integer DEFAULT 1,
  "Quantity" numeric(18,4) DEFAULT '1'::numeric,
  "UnitPrice" numeric(18,4) DEFAULT '0'::numeric,
  "Discount" numeric(18,4) DEFAULT '0'::numeric,
  "TotalPrice" numeric(18,4) DEFAULT '0'::numeric,
  "Description" varchar(500),
  "TrackingFactorValues" jsonb,
  PRIMARY KEY ("WarehouseReceiptDetailID")
);
CREATE TABLE IF NOT EXISTS "Inv"."WarehouseVouchersFactors" (
  "WarehouseReceiptFactorID" bigint NOT NULL,
  "WarehouseReceiptRef" bigint NOT NULL,
  "RowNo" integer DEFAULT 1,
  "FactorTitle" varchar(200),
  "FactorType" integer DEFAULT 1,
  "Amount" numeric(18,4) DEFAULT '0'::numeric,
  "Description" varchar(500),
  PRIMARY KEY ("WarehouseReceiptFactorID")
);
CREATE TABLE IF NOT EXISTS "Inv"."WarehouseVouchersPricing" (
  "WarehouseVouchersPricingID" bigint NOT NULL,
  "PricingType" integer DEFAULT 1,
  "WarehouseVoucherRef" bigint,
  "WarehouseVoucherDetailRef" bigint,
  "ItemRef" bigint,
  "UnitPrice" numeric(18,4) DEFAULT '0'::numeric,
  "Additions" numeric(18,4) DEFAULT '0'::numeric,
  "Deductions" numeric(18,4) DEFAULT '0'::numeric,
  "NetPrice" numeric(18,4) DEFAULT '0'::numeric,
  "Description" varchar(500),
  "businessStructureRef" bigint,
  "companyRef" bigint,
  "FiscalYearRef" bigint,
  "creator" bigint,
  "createTime" varchar(50),
  "lastModifier" bigint,
  "lastModificationTime" varchar(50),
  PRIMARY KEY ("WarehouseVouchersPricingID")
);
CREATE TABLE IF NOT EXISTS "Inv"."Warehouses" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "WarehouseID" bigint NOT NULL,
  "WarehouseType" integer,
  "WarehouseCode" varchar(50),
  "WarehouseTitle" varchar(150),
  "WarehouseTitle2" varchar(150),
  "WarehouseNature" integer,
  "Phone" varchar(50),
  "DetailedAccountRef" bigint,
  "IsActive" boolean DEFAULT true,
  "ParentRef" bigint,
  "AddressState" varchar(100),
  "AddressCity" varchar(100),
  "AddressTitle" varchar(250),
  "AddressTitle2" varchar(250),
  "PostalCode" varchar(50),
  "Longitude" varchar(50),
  "Latitude" varchar(50),
  "WarehouseKeeperRef" bigint,
  PRIMARY KEY ("WarehouseID")
);
CREATE TABLE IF NOT EXISTS "Rap"."BankAccountTypes" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "BankAccountTypeID" bigint NOT NULL,
  "Code" bigint DEFAULT '0'::bigint,
  "Title" varchar(150) NOT NULL,
  "LatinTitle" varchar(150),
  "IsActive" boolean DEFAULT true,
  PRIMARY KEY ("BankAccountTypeID")
);
CREATE TABLE IF NOT EXISTS "Rap"."BankAccounts" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "BankAccountID" bigint NOT NULL,
  "BankBranchRef" bigint NOT NULL,
  "BankAccountTypeRef" bigint NOT NULL,
  "AccountNumber" varchar(50) NOT NULL,
  "Title" varchar(250),
  "LatinTitle" varchar(250),
  "ShabaNumber" varchar(50),
  "DetailedCode" bigint NOT NULL,
  "AccountRef" bigint,
  "CurrencyRef" bigint,
  "InitialBalance" numeric(18,2) DEFAULT '1'::numeric,
  "OpeningDate" timestamp,
  "AccountHolderName" varchar(150),
  "IsActive" boolean DEFAULT true,
  PRIMARY KEY ("BankAccountID")
);
CREATE TABLE IF NOT EXISTS "Rap"."BankBranchs" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "BankBranchID" bigint NOT NULL,
  "BankID" bigint NOT NULL,
  "BranchCode" bigint,
  "Title" varchar(150) NOT NULL,
  "LatinTitle" varchar(150),
  "CityRef" bigint,
  "Phone" varchar(50),
  "Address" text,
  "ContactName" varchar(150),
  PRIMARY KEY ("BankBranchID")
);
CREATE TABLE IF NOT EXISTS "Rap"."BankReconciliation" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "BankReconciliationID" bigint NOT NULL,
  "BankAccountRef" bigint NOT NULL,
  "ReconcileBankStatementRef" bigint NOT NULL,
  "Number" varchar(50),
  "Date" varchar(50),
  "isOpening" boolean DEFAULT false,
  PRIMARY KEY ("BankReconciliationID")
);
CREATE TABLE IF NOT EXISTS "Rap"."BankReconciliationItem" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "BankReconciliationItemID" bigint NOT NULL,
  "BankReconciliationRef" bigint NOT NULL,
  "BankStatementItemRef" bigint,
  "BookItemRef" varchar(250),
  "matchId" varchar(50),
  PRIMARY KEY ("BankReconciliationItemID")
);
CREATE TABLE IF NOT EXISTS "Rap"."Banks" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "BankID" bigint NOT NULL,
  "Code" bigint DEFAULT '0'::bigint,
  "Title" varchar(150) NOT NULL,
  "LatinTitle" varchar(150),
  "BankType" integer DEFAULT 1,
  "SwiftCode" varchar(20),
  "NationalityRef" bigint,
  "Phone" varchar(50),
  "Website" varchar(200),
  "Description" text,
  PRIMARY KEY ("BankID")
);
CREATE TABLE IF NOT EXISTS "Rap"."Cashes" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "CashID" bigint NOT NULL,
  "Code" varchar(50) NOT NULL,
  "Title" varchar(150) NOT NULL,
  "Title_En" varchar(150),
  "CashTypeID" integer DEFAULT 1,
  "DetailedAccountID" bigint,
  "CurrencyID" bigint NOT NULL,
  "InitialBalance" numeric(18,4) DEFAULT '0'::numeric,
  "OpeningDate" date,
  "IsActive" boolean DEFAULT true,
  "Description" text,
  PRIMARY KEY ("CashID")
);
CREATE TABLE IF NOT EXISTS "Rap"."Cashiers" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "CashierID" bigint NOT NULL,
  "CashID" bigint NOT NULL,
  "UserID" bigint NOT NULL,
  PRIMARY KEY ("CashierID")
);
CREATE TABLE IF NOT EXISTS "Rap"."ChequePrintTemplates" (
  "ChequePrintTemplateID" bigint NOT NULL,
  "Creator" bigint DEFAULT 1,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT 1,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT 2,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "BankRef" bigint NOT NULL,
  "Title" varchar(150) NOT NULL,
  "ImageBlob" text,
  "Config" jsonb DEFAULT '{}'::jsonb,
  "Version" integer DEFAULT 1,
  PRIMARY KEY ("ChequePrintTemplateID")
);
CREATE TABLE IF NOT EXISTS "Rap"."ChequebookItems" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ChequebookItemID" bigint NOT NULL,
  "ChequebookRef" bigint NOT NULL,
  "CheckNumber" bigint NOT NULL,
  "Receiver" varchar(255),
  "IssueDate" varchar(15),
  "Amount" numeric(20,4),
  "Status" integer DEFAULT 1,
  PRIMARY KEY ("ChequebookItemID")
);
CREATE TABLE IF NOT EXISTS "Rap"."Chequebooks" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ChequebookID" bigint NOT NULL,
  "BankAccountRef" bigint NOT NULL,
  "Series" varchar(50),
  "LeafCount" integer NOT NULL,
  "StartSerial" bigint NOT NULL,
  "IsActive" boolean DEFAULT true,
  PRIMARY KEY ("ChequebookID")
);
CREATE TABLE IF NOT EXISTS "Rap"."DocumentAccountingInfo" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "DocumentAccountingInfoID" bigint NOT NULL,
  "DocumentType" varchar(100) NOT NULL,
  "DocumentRef" bigint NOT NULL,
  "RowType" varchar(100),
  "RowRef" bigint,
  "OpDetail1Ref" bigint,
  "OpDetail2Ref" bigint,
  "OpDetail3Ref" bigint,
  "OpDetail4Ref" bigint,
  "OpDetail5Ref" bigint,
  "OpDetail6Ref" bigint,
  "ForDetail1Ref" bigint,
  "ForDetail2Ref" bigint,
  "ForDetail3Ref" bigint,
  "ForDetail4Ref" bigint,
  "ForDetail5Ref" bigint,
  "ForDetail6Ref" bigint,
  PRIMARY KEY ("DocumentAccountingInfoID")
);
CREATE TABLE IF NOT EXISTS "Rap"."PaidDocumentClearing" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PaidDocumentClearingID" bigint NOT NULL,
  "Number" varchar(50) NOT NULL,
  "Date" varchar(20) NOT NULL,
  "Description" text,
  "Status" integer DEFAULT 2,
  "FiscalYearRef" bigint NOT NULL,
  "BankAccountRef" bigint NOT NULL,
  "VoucherHeaderRef" bigint,
  PRIMARY KEY ("PaidDocumentClearingID")
);
CREATE TABLE IF NOT EXISTS "Rap"."PaidDocumentClearingItem" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PaidDocumentClearingItemID" bigint NOT NULL,
  "PaidDocumentClearingRef" bigint NOT NULL,
  "DocumentType" varchar(50) NOT NULL,
  "DocumentId" bigint NOT NULL,
  PRIMARY KEY ("PaidDocumentClearingItemID")
);
CREATE TABLE IF NOT EXISTS "Rap"."PaymentAssignment" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PaymentAssignmentID" bigint NOT NULL,
  "PaymentNotificationRef" bigint NOT NULL,
  "AccountingSettingRef" bigint,
  "ReceiptChequeRef" bigint,
  "ReasonRef" bigint,
  "Amount" numeric(18,4) NOT NULL,
  "Description" text,
  "DynamicDetailedData" jsonb,
  PRIMARY KEY ("PaymentAssignmentID")
);
CREATE TABLE IF NOT EXISTS "Rap"."PaymentCash" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PaymentCashID" bigint NOT NULL,
  "PaymentNotificationRef" bigint NOT NULL,
  "CashRef" bigint NOT NULL,
  "Amount" numeric(18,4) NOT NULL,
  "EquivalentAmount" numeric(18,4),
  "Description" text,
  "ReasonRef" bigint,
  "AccountingSettingRef" bigint,
  "DynamicDetailedData" jsonb,
  PRIMARY KEY ("PaymentCashID")
);
CREATE TABLE IF NOT EXISTS "Rap"."PaymentCheque" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PaymentChequeID" bigint NOT NULL,
  "PaymentNotificationRef" bigint NOT NULL,
  "AccountingSettingRef" bigint,
  "BankAccountRef" bigint,
  "ChequebookRef" bigint,
  "ReasonRef" bigint,
  "Amount" numeric(18,4) NOT NULL,
  "ChequeNumber" varchar(50),
  "Currency" varchar(50),
  "DueDate" date,
  "SayyadNumber" varchar(50),
  "EndorsementNumber" varchar(50),
  "Description" text,
  "DynamicDetailedData" jsonb,
  PRIMARY KEY ("PaymentChequeID")
);
CREATE TABLE IF NOT EXISTS "Rap"."PaymentGatewayContacts" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PaymentGatewayContactID" bigint NOT NULL,
  "PaymentGatewayRef" bigint NOT NULL,
  "Title" varchar(150),
  "Title2" varchar(150),
  "PhoneNumber" varchar(50),
  "Description" text,
  PRIMARY KEY ("PaymentGatewayContactID")
);
CREATE TABLE IF NOT EXISTS "Rap"."PaymentGateways" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PaymentGatewayID" bigint NOT NULL,
  "GatewayType" varchar(50) DEFAULT 'internet'::character varying,
  "PartiesRef" bigint NOT NULL,
  "DetailedAccountRef" bigint NOT NULL,
  "BankAccountRef" bigint NOT NULL,
  "GatewayIdString" varchar(150),
  "IsActive" boolean DEFAULT true,
  PRIMARY KEY ("PaymentGatewayID")
);
CREATE TABLE IF NOT EXISTS "Rap"."PaymentGuarantee" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PaymentGuaranteeID" bigint NOT NULL,
  "PaymentNotificationRef" bigint NOT NULL,
  "AccountingSettingRef" bigint,
  "ReasonRef" bigint,
  "CashRef" bigint,
  "Amount" numeric(18,4) NOT NULL,
  "CurrencyRef" bigint,
  "EquivalentAmount" numeric(18,4),
  "DueDate" date,
  "GuaranteeNumber" varchar(150) NOT NULL,
  "GuaranteeType" smallint,
  "BaseDocument" varchar(150),
  "Description" text,
  "BankRef" bigint,
  "BankAccountRef" bigint,
  "AccountNumber" varchar(150),
  "NotificationDate" date,
  "DynamicDetailedData" jsonb,
  PRIMARY KEY ("PaymentGuaranteeID")
);
CREATE TABLE IF NOT EXISTS "Rap"."PaymentNotifications" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PaymentNotificationID" bigint NOT NULL,
  "BaseType" integer DEFAULT 1,
  "BaseNumber" varchar(50),
  "PaymentType" integer DEFAULT 1,
  "DocumentNumber" varchar(50) NOT NULL,
  "DocumentDate" date NOT NULL,
  "PartyRef" bigint,
  "CurrencyRef" bigint,
  "VoucherHeaderRef" bigint,
  "ExchangeRate" numeric(18,4),
  "Description" text,
  "Status" integer DEFAULT 1,
  "FiscalYearRef" bigint DEFAULT '1'::bigint,
  PRIMARY KEY ("PaymentNotificationID")
);
CREATE TABLE IF NOT EXISTS "Rap"."PaymentPromissoryNote" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PaymentPromissoryNoteID" bigint NOT NULL,
  "PaymentNotificationRef" bigint NOT NULL,
  "AccountingSettingRef" bigint,
  "ReasonRef" bigint,
  "PromissoryNoteItemRef" bigint,
  "Amount" numeric(18,4) NOT NULL,
  "CurrencyRef" bigint,
  "EquivalentAmount" numeric(18,4),
  "DueDate" date,
  "Description" text,
  "DynamicDetailedData" jsonb,
  PRIMARY KEY ("PaymentPromissoryNoteID")
);
CREATE TABLE IF NOT EXISTS "Rap"."PaymentReturnedReceivedCheque" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PaymentReturnedReceivedChequeID" bigint NOT NULL,
  "PaymentNotificationRef" bigint NOT NULL,
  "ReceiptChequeRef" bigint,
  "CashRef" bigint,
  "Amount" numeric(18,4) NOT NULL,
  "ReasonRef" bigint,
  "AccountingSettingRef" bigint,
  "Description" text,
  "DynamicDetailedData" jsonb,
  PRIMARY KEY ("PaymentReturnedReceivedChequeID")
);
CREATE TABLE IF NOT EXISTS "Rap"."PaymentReturnedReceivedPromissoryNote" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PaymentReturnedReceivedPromissoryNoteID" bigint NOT NULL,
  "PaymentNotificationRef" bigint NOT NULL,
  "ReceiptPromissoryNoteRef" bigint,
  "Amount" numeric(18,4) NOT NULL,
  "ReasonRef" bigint,
  "AccountingSettingRef" bigint,
  "Description" text,
  "DynamicDetailedData" jsonb,
  PRIMARY KEY ("PaymentReturnedReceivedPromissoryNoteID")
);
CREATE TABLE IF NOT EXISTS "Rap"."PaymentWithdrawal" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PaymentWithdrawalID" bigint NOT NULL,
  "PaymentNotificationRef" bigint NOT NULL,
  "BankAccountRef" bigint NOT NULL,
  "Amount" numeric(18,4) NOT NULL,
  "TrackingNumber" varchar(100),
  "EquivalentAmount" numeric(18,4),
  "Description" text,
  "ReasonRef" bigint,
  "AccountingSettingRef" bigint,
  "DynamicDetailedData" jsonb,
  PRIMARY KEY ("PaymentWithdrawalID")
);
CREATE TABLE IF NOT EXISTS "Rap"."PettyCashRequests" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PettyCashRequestID" bigint NOT NULL,
  "PettyCashRef" bigint NOT NULL,
  "RequestNumber" varchar(100) NOT NULL,
  "RequestDate" date NOT NULL,
  "Basis" integer DEFAULT 0,
  "PettyCashSummaryRef" bigint,
  "Status" integer DEFAULT 2,
  "RequestedAmount" numeric(18,4) DEFAULT '0'::numeric,
  "Description" varchar(1000),
  "FiscalYearRef" bigint DEFAULT '1'::bigint,
  PRIMARY KEY ("PettyCashRequestID")
);
CREATE TABLE IF NOT EXISTS "Rap"."PettyCashSummaries" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "pettyCashSummaryId" bigint NOT NULL,
  "PettyCashRef" bigint NOT NULL,
  "Number" bigint NOT NULL,
  "Date" date NOT NULL,
  "Description" varchar(1000),
  "FiscalYearRef" bigint DEFAULT '1'::bigint,
  "State" integer DEFAULT 1,
  "VoucherHeaderRef" bigint,
  PRIMARY KEY ("pettyCashSummaryId")
);
CREATE TABLE IF NOT EXISTS "Rap"."PettyCashSummaryItems" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "pettyCashSummaryItemId" bigint NOT NULL,
  "PettyCashSummaryRef" bigint NOT NULL,
  "ReasonRef" bigint,
  "PaymentReceiptNumber" varchar(50),
  "PaymentReceiptDate" date,
  "Amount" numeric(18,4) DEFAULT '0'::numeric,
  "Description" varchar(500),
  PRIMARY KEY ("pettyCashSummaryItemId")
);
CREATE TABLE IF NOT EXISTS "Rap"."PettyCashes" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PettyCashID" bigint NOT NULL,
  "Title" varchar(150) NOT NULL,
  "CurrencyID" bigint NOT NULL,
  "OpeningDate" date,
  "InitialBalance" numeric(18,4) DEFAULT '0'::numeric,
  "PettyCashLimit" numeric(18,4) DEFAULT '0'::numeric,
  "CurrentBalance" numeric(18,4) DEFAULT '0'::numeric,
  "AccountRef" bigint,
  "PartyRef" bigint,
  "IsPettyCashLimitControlled" boolean DEFAULT false,
  "IsActive" boolean DEFAULT true,
  PRIMARY KEY ("PettyCashID")
);
CREATE TABLE IF NOT EXISTS "Rap"."PromissoryNoteItems" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PromissoryNoteItemID" bigint NOT NULL,
  "PromissoryNoteRef" bigint NOT NULL,
  "PromissoryNoteNumber" bigint NOT NULL,
  "Value" numeric(18,2) NOT NULL,
  "Status" integer DEFAULT 1,
  PRIMARY KEY ("PromissoryNoteItemID")
);
CREATE TABLE IF NOT EXISTS "Rap"."PromissoryNotes" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "PromissoryNoteID" bigint NOT NULL,
  "CashRef" bigint NOT NULL,
  "Series" varchar(50),
  "LeafCount" integer NOT NULL,
  "Status" integer DEFAULT 1,
  "StartSerial" bigint NOT NULL,
  "ValueEach" numeric(18,2) NOT NULL,
  PRIMARY KEY ("PromissoryNoteID")
);
CREATE TABLE IF NOT EXISTS "Rap"."Reasons" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "RapReasonID" bigint NOT NULL,
  "Code" varchar(50),
  "Title" varchar(255) NOT NULL,
  "Title_En" varchar(255),
  "AccountRef" bigint,
  "Nature" integer DEFAULT 3,
  "Description" varchar(1000),
  "IsActive" boolean DEFAULT true,
  "ParentRef" bigint,
  PRIMARY KEY ("RapReasonID")
);
CREATE TABLE IF NOT EXISTS "Rap"."ReceiptCash" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ReceiptCashID" bigint NOT NULL,
  "ReceiptNotificationRef" bigint NOT NULL,
  "CashRef" bigint NOT NULL,
  "Amount" numeric(18,4) NOT NULL,
  "EquivalentAmount" numeric(18,4),
  "Description" text,
  "ReasonRef" bigint,
  "AccountingSettingRef" bigint,
  "DynamicDetailedData" jsonb,
  PRIMARY KEY ("ReceiptCashID")
);
CREATE TABLE IF NOT EXISTS "Rap"."ReceiptCheque" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ReceiptChequeID" bigint NOT NULL,
  "ReceiptNotificationRef" bigint NOT NULL,
  "AccountingSettingRef" bigint,
  "CashRef" bigint,
  "BankRef" bigint,
  "BranchName" varchar(150),
  "AccountNumber" varchar(100) NOT NULL,
  "ReasonRef" bigint,
  "Amount" numeric(18,4) NOT NULL,
  "ChequeNumber" varchar(50),
  "Currency" varchar(50),
  "DueDate" date,
  "SayyadNumber" varchar(50),
  "EndorsementNumber" varchar(50),
  "Description" text,
  "DynamicDetailedData" jsonb,
  PRIMARY KEY ("ReceiptChequeID")
);
CREATE TABLE IF NOT EXISTS "Rap"."ReceiptDeposit" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ReceiptDepositID" bigint NOT NULL,
  "ReceiptNotificationRef" bigint NOT NULL,
  "BankAccountRef" bigint NOT NULL,
  "Amount" numeric(18,4) NOT NULL,
  "TrackingNumber" varchar(100),
  "EquivalentAmount" numeric(18,4),
  "Description" text,
  "ReasonRef" bigint,
  "AccountingSettingRef" bigint,
  "DynamicDetailedData" jsonb,
  PRIMARY KEY ("ReceiptDepositID")
);
CREATE TABLE IF NOT EXISTS "Rap"."ReceiptGuarantee" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ReceiptGuaranteeID" bigint NOT NULL,
  "ReceiptNotificationRef" bigint NOT NULL,
  "AccountingSettingRef" bigint,
  "CashRef" bigint,
  "ReasonRef" bigint,
  "Amount" numeric(18,4) NOT NULL,
  "GuaranteeNumber" varchar(150) NOT NULL,
  "GuaranteeType" smallint,
  "BaseDocument" varchar(150),
  "Description" text,
  "BankRef" bigint,
  "AccountNumber" varchar(150),
  "NotificationDate" date,
  "DynamicDetailedData" jsonb,
  PRIMARY KEY ("ReceiptGuaranteeID")
);
CREATE TABLE IF NOT EXISTS "Rap"."ReceiptNotifications" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ReceiptNotificationID" bigint NOT NULL,
  "BaseType" varchar(100) DEFAULT 'بدون مبنا'::character varying,
  "BaseNumber" varchar(50),
  "ReceiptType" varchar(100) DEFAULT 'تسویه تعهدات'::character varying,
  "DocumentNumber" varchar(50) NOT NULL,
  "DocumentDate" date NOT NULL,
  "PartyRef" bigint,
  "CurrencyRef" bigint,
  "VoucherHeaderRef" bigint,
  "ExchangeRate" numeric(18,4),
  "ReasonRef" bigint,
  "Description" text,
  "Status" integer DEFAULT 1,
  "FiscalYearRef" bigint DEFAULT '1'::bigint,
  PRIMARY KEY ("ReceiptNotificationID")
);
CREATE TABLE IF NOT EXISTS "Rap"."ReceiptPromissoryNote" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ReceiptPromissoryNoteID" bigint NOT NULL,
  "ReceiptNotificationRef" bigint NOT NULL,
  "AccountingSettingRef" bigint,
  "CashRef" bigint,
  "ReasonRef" bigint,
  "Amount" numeric(18,4) NOT NULL,
  "PromissoryNoteNumber" varchar(150) NOT NULL,
  "PromissoryNoteValue" numeric(18,4),
  "Description" text,
  "DynamicDetailedData" jsonb,
  PRIMARY KEY ("ReceiptPromissoryNoteID")
);
CREATE TABLE IF NOT EXISTS "Rap"."ReceiptReturnedPaidCheque" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ReceiptReturnedPaidChequeID" bigint NOT NULL,
  "ReceiptNotificationRef" bigint NOT NULL,
  "PaymentChequeRef" bigint,
  "CashRef" bigint,
  "AccountingSettingRef" bigint,
  "ReasonRef" bigint,
  "Amount" numeric(18,4) NOT NULL,
  "Description" text,
  "DynamicDetailedData" jsonb,
  PRIMARY KEY ("ReceiptReturnedPaidChequeID")
);
CREATE TABLE IF NOT EXISTS "Rap"."ReceiptReturnedPaymentAssignment" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ReceiptReturnedPaymentAssignmentID" bigint NOT NULL,
  "ReceiptNotificationRef" bigint NOT NULL,
  "PaymentAssignmentRef" bigint,
  "AccountingSettingRef" bigint,
  "CashRef" bigint,
  "ReasonRef" bigint,
  "Amount" numeric(18,4) NOT NULL,
  "Description" text,
  "DynamicDetailedData" jsonb,
  PRIMARY KEY ("ReceiptReturnedPaymentAssignmentID")
);
CREATE TABLE IF NOT EXISTS "Rap"."ReceiptReturnedPaymentPromissoryNote" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ReceiptReturnedPaymentPromissoryNoteID" bigint NOT NULL,
  "ReceiptNotificationRef" bigint NOT NULL,
  "PaymentPromissoryNoteRef" bigint,
  "AccountingSettingRef" bigint,
  "ReasonRef" bigint,
  "Amount" numeric(18,4) NOT NULL,
  "Description" text,
  "DynamicDetailedData" jsonb,
  PRIMARY KEY ("ReceiptReturnedPaymentPromissoryNoteID")
);
CREATE TABLE IF NOT EXISTS "Rap"."ReceivedChequeOperation" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ReceivedChequeOperationID" bigint NOT NULL,
  "OperationType" integer NOT NULL,
  "DocumentNumber" varchar(50) NOT NULL,
  "DocumentDate" varchar(20) NOT NULL,
  "AssignmentNumber" varchar(50),
  "Status" integer DEFAULT 1,
  "BankAccountRef" bigint,
  "RealizerRef" bigint,
  "VoucherHeaderRef" bigint,
  "FiscalYearRef" bigint NOT NULL,
  PRIMARY KEY ("ReceivedChequeOperationID")
);
CREATE TABLE IF NOT EXISTS "Rap"."ReceivedChequeOperationItem" (
  "ReceivedChequeOperationItemID" bigint NOT NULL,
  "OperationRef" bigint NOT NULL,
  "ReceiptChequeRef" bigint NOT NULL,
  "ChequeStatus" integer,
  "ForecastDate" varchar(20),
  "CashRef" bigint,
  PRIMARY KEY ("ReceivedChequeOperationItemID")
);
CREATE TABLE IF NOT EXISTS "Rap"."RecieptAndPaymentAccountingSetting" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "RecieptAndPaymentAccountingSettingID" bigint NOT NULL,
  "Code" varchar(50) NOT NULL,
  "Title" varchar(255) NOT NULL,
  "Title_En" varchar(255),
  "AccountRef" bigint,
  "usedEntryType" integer DEFAULT 1,
  "operationType" integer DEFAULT 1,
  "detailedType" integer DEFAULT 1,
  "termType" integer DEFAULT 3,
  "isDefault" boolean DEFAULT false,
  "isActive" boolean DEFAULT true,
  PRIMARY KEY ("RecieptAndPaymentAccountingSettingID")
);
CREATE TABLE IF NOT EXISTS "Rap"."ReconcileBankStatement" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ReconcileBankStatementID" bigint NOT NULL,
  "BankAccountRef" bigint,
  "Number" varchar(50),
  "Date" varchar(50),
  "fromDate" varchar(50),
  "previousBalance" numeric(18,4) DEFAULT '0'::numeric,
  "balance" numeric(18,4) DEFAULT '0'::numeric,
  "fiscalYearRef" bigint,
  PRIMARY KEY ("ReconcileBankStatementID")
);
CREATE TABLE IF NOT EXISTS "Rap"."ReconcileBankStatementItem" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "ReconcileBankStatementItemID" bigint NOT NULL,
  "ReconcileBankStatementRef" bigint,
  "documentNumber" varchar(100),
  "documentDate" varchar(50),
  "debit" numeric(18,4) DEFAULT '0'::numeric,
  "credit" numeric(18,4) DEFAULT '0'::numeric,
  "description" text,
  PRIMARY KEY ("ReconcileBankStatementItemID")
);
CREATE TABLE IF NOT EXISTS "Rpt"."Report" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "reportID" bigint NOT NULL,
  "ReportGroupRef" bigint,
  "title" varchar(500),
  "direction" varchar(50),
  "paperSize" varchar(50),
  "paperOrientation" varchar(50),
  "showInstitutionName" boolean DEFAULT false,
  "showDate" boolean DEFAULT false,
  "showRowNumber" boolean DEFAULT false,
  "showFilters" boolean DEFAULT false,
  "pageNumberType" varchar(50),
  "showLogo" boolean DEFAULT false,
  "hideDuplicates" boolean DEFAULT false,
  "dataSourceType" varchar(50),
  "primaryTable" varchar(255),
  "targetForm" varchar(150),
  "isDefaultTemplate" boolean DEFAULT false,
  "isSystemReport" boolean DEFAULT false,
  "sqlScript" text,
  PRIMARY KEY ("reportID")
);
CREATE TABLE IF NOT EXISTS "Rpt"."ReportAggregate" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "reportAggregateID" bigint NOT NULL,
  "ReportRef" bigint NOT NULL,
  "field" varchar(255),
  "groupBy" varchar(255),
  "printPosition" varchar(50),
  "hasPageTotal" boolean DEFAULT false,
  "hasGrandTotal" boolean DEFAULT false,
  PRIMARY KEY ("reportAggregateID")
);
CREATE TABLE IF NOT EXISTS "Rpt"."ReportField" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "reportFieldID" bigint NOT NULL,
  "ReportRef" bigint NOT NULL,
  "tableName" varchar(255),
  "fieldName" varchar(255),
  "alias" varchar(255),
  "orderIndex" integer,
  "isVisible" boolean DEFAULT true,
  PRIMARY KEY ("reportFieldID")
);
CREATE TABLE IF NOT EXISTS "Rpt"."ReportFilter" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "reportFilterID" bigint NOT NULL,
  "ReportRef" bigint NOT NULL,
  "tableName" varchar(255),
  "fieldName" varchar(255),
  "operator" varchar(50),
  "valueType" varchar(50),
  "value" text,
  "logicalOperator" varchar(50),
  "orderIndex" integer,
  PRIMARY KEY ("reportFilterID")
);
CREATE TABLE IF NOT EXISTS "Rpt"."ReportFormula" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "reportFormulaID" bigint NOT NULL,
  "ReportRef" bigint NOT NULL,
  "formulaName" varchar(255),
  "expression" text,
  PRIMARY KEY ("reportFormulaID")
);
CREATE TABLE IF NOT EXISTS "Rpt"."ReportGroup" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "reportGroupID" bigint NOT NULL,
  "title" varchar(500),
  PRIMARY KEY ("reportGroupID")
);
CREATE TABLE IF NOT EXISTS "Rpt"."ReportGrouping" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "reportGroupingID" bigint NOT NULL,
  "ReportRef" bigint NOT NULL,
  "tableName" varchar(255),
  "fieldName" varchar(255),
  "orderIndex" integer,
  PRIMARY KEY ("reportGroupingID")
);
CREATE TABLE IF NOT EXISTS "Rpt"."ReportPermission" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "reportPermissionID" bigint NOT NULL,
  "ReportRef" bigint NOT NULL,
  "userRef" bigint,
  "userGroupRef" bigint,
  "canView" boolean DEFAULT false,
  "canEdit" boolean DEFAULT false,
  "canDelete" boolean DEFAULT false,
  PRIMARY KEY ("reportPermissionID")
);
CREATE TABLE IF NOT EXISTS "Rpt"."ReportSorting" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "reportSortingID" bigint NOT NULL,
  "ReportRef" bigint NOT NULL,
  "tableName" varchar(255),
  "fieldName" varchar(255),
  "sortDirection" varchar(50),
  "orderIndex" integer,
  PRIMARY KEY ("reportSortingID")
);
CREATE TABLE IF NOT EXISTS "Rpt"."ReportUserData" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "reportUserDataID" bigint NOT NULL,
  "ReportName" varchar(500),
  "DynamicKey" varchar(100) NOT NULL,
  "Value" text,
  PRIMARY KEY ("reportUserDataID")
);
CREATE TABLE IF NOT EXISTS "Sle"."CustomerGroups" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "CustomerGroupID" bigint NOT NULL,
  "Code" varchar(50),
  "Title" varchar(250) NOT NULL,
  "Title2" varchar(250),
  "DetailedAccountRef" bigint,
  "Description" varchar(500),
  "IsMandatory" boolean DEFAULT false,
  "ParentRef" bigint,
  PRIMARY KEY ("CustomerGroupID")
);
CREATE TABLE IF NOT EXISTS "Sle"."Customers" (
  "CustomerID" bigint NOT NULL,
  "Code" varchar(50) NOT NULL,
  "CustomerType" integer DEFAULT 1,
  "PartyRef" bigint,
  "CustomerGroupRef" bigint,
  "SalesChannels" text,
  "SalesStatus" integer DEFAULT 1,
  "SalesIntermediaryRef" bigint,
  "SalesTypes" text,
  "CurrencyRef" bigint,
  "IsActive" boolean DEFAULT true,
  "BusinessStructureRef" bigint,
  "CompanyRef" bigint,
  "FiscalYearRef" bigint,
  "CreatorRef" bigint,
  "CreationDate" timestamp,
  "LastModifierRef" bigint,
  "LastModificationDate" timestamp,
  PRIMARY KEY ("CustomerID")
);
CREATE TABLE IF NOT EXISTS "Sle"."DeliveryLocations" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "DeliveryLocationID" bigint NOT NULL,
  "Code" bigint NOT NULL,
  "Title" varchar(250) NOT NULL,
  "Title2" varchar(250) NOT NULL,
  "IsActive" boolean DEFAULT true,
  "Description" varchar(1000),
  PRIMARY KEY ("DeliveryLocationID")
);
CREATE TABLE IF NOT EXISTS "Sle"."SalesAccountCategories" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "SalesAccountCategoryID" bigint NOT NULL,
  "SalesAccountCategoryCode" integer,
  "SalesAccountCategoryName" varchar(150),
  "SalesAccountCategoryName2" varchar(150),
  "IsActive" boolean DEFAULT true,
  "InventorySlAccountRef" bigint,
  "IndividualPurchaseSlAccountRef" bigint,
  "CorporatePurchaseSlAccountRef" bigint,
  "FreightSlAccountRef" bigint,
  "SuspensePurchaseSlAccountRef" bigint,
  "ForeignPurchaseSlAccountRef" bigint,
  "CurrencyRef" bigint,
  PRIMARY KEY ("SalesAccountCategoryID")
);
CREATE TABLE IF NOT EXISTS "Sle"."SalesCenters" (
  "SalesCenterID" bigint NOT NULL,
  "Code" integer NOT NULL,
  "Type" integer NOT NULL,
  "ReferenceRef" bigint,
  "Title" varchar(255) NOT NULL,
  "Title2" varchar(255) NOT NULL,
  "IsActive" boolean DEFAULT true,
  "Description" text,
  "BusinessStructureRef" bigint,
  "CompanyRef" bigint,
  "FiscalYearRef" bigint,
  "CreatorRef" bigint,
  "CreationDate" timestamp,
  "LastModifierRef" bigint,
  "LastModificationDate" timestamp,
  PRIMARY KEY ("SalesCenterID")
);
CREATE TABLE IF NOT EXISTS "Sle"."SalesChannels" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "SalesChannelID" bigint NOT NULL,
  "Code" integer NOT NULL,
  "Title" varchar(250) NOT NULL,
  "Title2" varchar(250) NOT NULL,
  "Type" integer DEFAULT 1,
  "IsActive" boolean DEFAULT true,
  "Description" varchar(500),
  PRIMARY KEY ("SalesChannelID")
);
CREATE TABLE IF NOT EXISTS "Sle"."SalesDocumentSettings" (
  "SalesDocumentSettingsID" bigint NOT NULL,
  "SalesDocumentType" integer NOT NULL,
  "HasBaseDocument" boolean DEFAULT false,
  "BaseDocumentTypes" text,
  "ShowWarehouse" boolean DEFAULT false,
  "DefaultWarehouseRef" bigint,
  "ShowSalesCenter" boolean DEFAULT false,
  "DefaultSalesCenterRef" bigint,
  "ShowSalesType" boolean DEFAULT false,
  "DefaultSalesTypeRef" bigint,
  "ShowDeliveryLocations" boolean DEFAULT false,
  "DefaultDeliveryLocationRef" bigint,
  "HasAccountingDocument" boolean DEFAULT false,
  "ShowPurchaseSalesParameters" boolean DEFAULT false,
  "IsActive" boolean DEFAULT true,
  "BusinessStructureRef" bigint,
  "CompanyRef" bigint,
  "CreatorRef" bigint,
  "CreationDate" timestamp,
  "LastModifierRef" bigint,
  "LastModificationDate" timestamp,
  "ShowSettlementMethod" boolean DEFAULT false,
  "DefaultSettlementMethodRef" bigint,
  PRIMARY KEY ("SalesDocumentSettingsID")
);
CREATE TABLE IF NOT EXISTS "Sle"."SalesItemGroupRelatedProducts" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "SalesItemGroupRelatedProductID" bigint NOT NULL,
  "SalesItemGroupRef" bigint NOT NULL,
  "ProductCode" varchar(100),
  "ProductName" varchar(250),
  "Unit" varchar(100),
  "IsActive" boolean DEFAULT true,
  "Description" varchar(500),
  PRIMARY KEY ("SalesItemGroupRelatedProductID")
);
CREATE TABLE IF NOT EXISTS "Sle"."SalesItemGroups" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "SalesItemGroupID" bigint NOT NULL,
  "SalesItemGroupCode" varchar(50),
  "SalesItemGroupName" varchar(250),
  "SalesItemGroupName2" varchar(250),
  "Description" varchar(500),
  "IsMandatory" boolean DEFAULT false,
  "ParentRef" bigint,
  PRIMARY KEY ("SalesItemGroupID")
);
CREATE TABLE IF NOT EXISTS "Sle"."SalesOrderItems" (
  "SalesOrderItemID" bigint NOT NULL,
  "SalesOrderRef" bigint NOT NULL,
  "RowNo" integer DEFAULT 1,
  "ItemRef" bigint,
  "ItemCode" varchar(100),
  "ItemName" varchar(250),
  "UnitName" varchar(100),
  "Quantity" numeric(18,4) DEFAULT 0,
  "UnitPrice" numeric(18,2) DEFAULT 0,
  "TotalPrice" numeric(18,2) DEFAULT 0,
  "Description" varchar(500),
  "TrackingFactorValues" jsonb,
  PRIMARY KEY ("SalesOrderItemID")
);
CREATE TABLE IF NOT EXISTS "Sle"."SalesOrders" (
  "SalesOrderID" bigint NOT NULL,
  "Version" bigint DEFAULT 1,
  "Creator" bigint DEFAULT 1,
  "CreationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT 1,
  "LastModificationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT 2,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "OrderNumber" integer NOT NULL,
  "OrderDate" varchar(10),
  "CustomerRef" bigint,
  "CustomerName" varchar(200),
  "Status" integer DEFAULT 1,
  "Description" varchar(1000),
  "FiscalYearRef" bigint,
  "DeliveryDate" varchar(10),
  "SalesTypeRef" bigint,
  "DeliveryLocationRef" bigint,
  "SettlementMethodRef" bigint,
  PRIMARY KEY ("SalesOrderID")
);
CREATE TABLE IF NOT EXISTS "Sle"."SalesTypes" (
  "SalesTypeID" bigint NOT NULL,
  "Code" integer NOT NULL,
  "Title" varchar(255) NOT NULL,
  "Title2" varchar(255) NOT NULL,
  "IsActive" boolean DEFAULT true,
  "Description" text,
  "BusinessStructureRef" bigint,
  "CompanyRef" bigint,
  "FiscalYearRef" bigint,
  "CreatorRef" bigint,
  "CreationDate" timestamp,
  "LastModifierRef" bigint,
  "LastModificationDate" timestamp,
  PRIMARY KEY ("SalesTypeID")
);
CREATE TABLE IF NOT EXISTS "Sle"."SettlementMethods" (
  "SettlementMethodID" bigint NOT NULL,
  "Version" bigint DEFAULT 1,
  "Creator" bigint DEFAULT 1,
  "CreationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT 1,
  "LastModificationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT 2,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "Code" integer NOT NULL,
  "Title" varchar(250) NOT NULL,
  "Title2" varchar(250) NOT NULL,
  "IsActive" boolean DEFAULT true,
  "Description" varchar(500),
  PRIMARY KEY ("SettlementMethodID")
);
CREATE TABLE IF NOT EXISTS "Sle"."Wallets" (
  "Version" integer DEFAULT 1,
  "Creator" bigint DEFAULT '1'::bigint,
  "CreationDate" timestamp DEFAULT now(),
  "CreateTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "LastModifier" bigint DEFAULT '1'::bigint,
  "LastModificationDate" timestamp DEFAULT now(),
  "LastModificationTime" varchar(8) DEFAULT '00:00:00'::character varying,
  "BusinessStructureRef" bigint DEFAULT '2'::bigint,
  "CompanyRef" bigint,
  "BranchRef" bigint,
  "AgencyRef" bigint,
  "WalletID" bigint NOT NULL,
  "Code" integer NOT NULL,
  "Title" varchar(250) NOT NULL,
  "Title2" varchar(250) NOT NULL,
  "Nature" integer DEFAULT 1,
  "IsActive" boolean DEFAULT true,
  "Description" varchar(500),
  PRIMARY KEY ("WalletID")
);

-- ==================== DATA ====================

-- Data for Acc.Accounts (2 rows)
INSERT INTO "Acc"."Accounts" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "AccountID", "Code", "Title", "Title_En", "ParentID", "AccountType", "AccountNature", "NatureControl", "IsActive", "TrackingFeature", "CurrencyFeature", "ExchangeableFeature", "TrackingQuantity", "TrackingNumber", "TrackingDate") VALUES (1, '1', '2026-10-23 04:12:55.341', '00:00:00', '1', '2026-10-23 04:12:55.341', '00:00:00', '2', '2', NULL, NULL, '1', '0', 'کدینگ حسابها', NULL, NULL, NULL, 7, NULL, true, false, false, false, false, false, false);
INSERT INTO "Acc"."Accounts" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "AccountID", "Code", "Title", "Title_En", "ParentID", "AccountType", "AccountNature", "NatureControl", "IsActive", "TrackingFeature", "CurrencyFeature", "ExchangeableFeature", "TrackingQuantity", "TrackingNumber", "TrackingDate") VALUES (1, '1', '2026-10-23 04:12:55.739', '00:00:00', '1', '2026-10-23 04:12:55.739', '00:00:00', '2', '3', NULL, NULL, '2', '0', 'کدینگ حسابها', NULL, NULL, NULL, 7, NULL, true, false, false, false, false, false, false);

-- Data for Acc.DetailedAccounts (6 rows)
INSERT INTO "Acc"."DetailedAccounts" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedAccountID", "Code", "Title", "Title_En", "DetailedTypesID", "Description", "isActive") VALUES (1, '1', '2026-10-24 02:14:00.754', '02:14:00', '1', '2026-10-24 02:14:00.754', '02:14:00', '2', '2', NULL, NULL, '1', '10001', 'Ghodsi Sharifi', 'Ghodsi Sharifi', '6', NULL, true);
INSERT INTO "Acc"."DetailedAccounts" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedAccountID", "Code", "Title", "Title_En", "DetailedTypesID", "Description", "isActive") VALUES (1, '1', '2026-10-24 02:47:21.313', '02:47:21', '1', '2026-10-24 02:47:21.313', '02:47:21', '2', '2', NULL, NULL, '2', '10002', 'علی جهانی', '', '6', NULL, true);
INSERT INTO "Acc"."DetailedAccounts" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedAccountID", "Code", "Title", "Title_En", "DetailedTypesID", "Description", "isActive") VALUES (1, '1', '2026-10-24 02:47:21.376', '02:47:21', '1', '2026-10-24 02:47:21.376', '02:47:21', '2', '2', NULL, NULL, '3', '30001', 'شرکت پارس داده', '', '7', NULL, true);
INSERT INTO "Acc"."DetailedAccounts" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedAccountID", "Code", "Title", "Title_En", "DetailedTypesID", "Description", "isActive") VALUES (1, '1', '2026-10-24 05:35:28.848', '05:35:28', '1', '2026-10-24 05:35:28.848', '05:35:28', '2', '2', NULL, NULL, '7', '1', 'گروه فروش مستقیم', NULL, '13', NULL, true);
INSERT INTO "Acc"."DetailedAccounts" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedAccountID", "Code", "Title", "Title_En", "DetailedTypesID", "Description", "isActive") VALUES (1, '1', '2026-10-24 05:35:28.919', '05:35:28', '1', '2026-10-24 05:35:28.919', '05:35:28', '2', '2', NULL, NULL, '8', '1', 'فروش آنلاین', NULL, '13', NULL, true);
INSERT INTO "Acc"."DetailedAccounts" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedAccountID", "Code", "Title", "Title_En", "DetailedTypesID", "Description", "isActive") VALUES (1, '1', '2026-10-24 05:35:28.976', '05:35:28', '1', '2026-10-24 05:35:28.976', '05:35:28', '2', '2', NULL, NULL, '9', '2', 'فروش سیار', NULL, '13', NULL, true);

-- Data for Acc.DetailedTypes (21 rows)
INSERT INTO "Acc"."DetailedTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedTypesID", "Code", "Title", "Title_En", "Description", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.120', '04:12:55', '1', '2026-10-23 04:12:55.120', '04:12:55', '2', '2', NULL, NULL, '1', '1', 'حساب بانکی', NULL, NULL, true);
INSERT INTO "Acc"."DetailedTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedTypesID", "Code", "Title", "Title_En", "Description", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.124', '04:12:55', '1', '2026-10-23 04:12:55.124', '04:12:55', '2', '2', NULL, NULL, '2', '2', 'صندوق', NULL, NULL, true);
INSERT INTO "Acc"."DetailedTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedTypesID", "Code", "Title", "Title_En", "Description", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.129', '04:12:55', '1', '2026-10-23 04:12:55.129', '04:12:55', '2', '2', NULL, NULL, '3', '3', 'کارتخوان', NULL, NULL, true);
INSERT INTO "Acc"."DetailedTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedTypesID", "Code", "Title", "Title_En", "Description", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.132', '04:12:55', '1', '2026-10-23 04:12:55.132', '04:12:55', '2', '2', NULL, NULL, '4', '4', 'درگاه های اینترنتی', NULL, NULL, true);
INSERT INTO "Acc"."DetailedTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedTypesID", "Code", "Title", "Title_En", "Description", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.135', '04:12:55', '1', '2026-10-23 04:12:55.135', '04:12:55', '2', '2', NULL, NULL, '5', '5', 'تنخواه گردان', NULL, NULL, true);
INSERT INTO "Acc"."DetailedTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedTypesID", "Code", "Title", "Title_En", "Description", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.138', '04:12:55', '1', '2026-10-23 04:12:55.138', '04:12:55', '2', '2', NULL, NULL, '6', '6', 'اشخاص حقیقی', NULL, NULL, true);
INSERT INTO "Acc"."DetailedTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedTypesID", "Code", "Title", "Title_En", "Description", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.143', '04:12:55', '1', '2026-10-23 04:12:55.143', '04:12:55', '2', '2', NULL, NULL, '7', '7', 'اشخاص حقوقی', NULL, NULL, true);
INSERT INTO "Acc"."DetailedTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedTypesID", "Code", "Title", "Title_En", "Description", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.146', '04:12:55', '1', '2026-10-23 04:12:55.146', '04:12:55', '2', '2', NULL, NULL, '8', '8', 'پروژه', NULL, NULL, true);
INSERT INTO "Acc"."DetailedTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedTypesID", "Code", "Title", "Title_En", "Description", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.149', '04:12:55', '1', '2026-10-23 04:12:55.149', '04:12:55', '2', '2', NULL, NULL, '9', '9', 'قرارداد', NULL, NULL, true);
INSERT INTO "Acc"."DetailedTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedTypesID", "Code", "Title", "Title_En", "Description", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.153', '04:12:55', '1', '2026-10-23 04:12:55.153', '04:12:55', '2', '2', NULL, NULL, '10', '10', 'انبار', NULL, NULL, true);
INSERT INTO "Acc"."DetailedTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedTypesID", "Code", "Title", "Title_En", "Description", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.156', '04:12:55', '1', '2026-10-23 04:12:55.156', '04:12:55', '2', '2', NULL, NULL, '11', '11', 'کالاها و خدمات', NULL, NULL, true);
INSERT INTO "Acc"."DetailedTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedTypesID", "Code", "Title", "Title_En", "Description", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.158', '04:12:55', '1', '2026-10-23 04:12:55.158', '04:12:55', '2', '2', NULL, NULL, '12', '12', 'اعتبارات اسنادی', NULL, NULL, true);
INSERT INTO "Acc"."DetailedTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedTypesID", "Code", "Title", "Title_En", "Description", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.161', '04:12:55', '1', '2026-10-23 04:12:55.161', '04:12:55', '2', '2', NULL, NULL, '13', '13', 'گروه مشتریان', NULL, NULL, true);
INSERT INTO "Acc"."DetailedTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedTypesID", "Code", "Title", "Title_En", "Description", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.186', '04:12:55', '1', '2026-10-23 04:12:55.186', '04:12:55', '2', '2', NULL, NULL, '14', '14', 'گروه تامین کنندگان', NULL, NULL, true);
INSERT INTO "Acc"."DetailedTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedTypesID", "Code", "Title", "Title_En", "Description", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.188', '04:12:55', '1', '2026-10-23 04:12:55.188', '04:12:55', '2', '2', NULL, NULL, '15', '15', 'مراکز هزینه', NULL, NULL, true);
INSERT INTO "Acc"."DetailedTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedTypesID", "Code", "Title", "Title_En", "Description", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.191', '04:12:55', '1', '2026-10-23 04:12:55.191', '04:12:55', '2', '2', NULL, NULL, '16', '16', 'تسهیلات مالی', NULL, NULL, true);
INSERT INTO "Acc"."DetailedTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedTypesID", "Code", "Title", "Title_En", "Description", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.195', '04:12:55', '1', '2026-10-23 04:12:55.195', '04:12:55', '2', '2', NULL, NULL, '17', '17', 'دارایی های ثابت', NULL, NULL, true);
INSERT INTO "Acc"."DetailedTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedTypesID", "Code", "Title", "Title_En", "Description", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.201', '04:12:55', '1', '2026-10-23 04:12:55.201', '04:12:55', '2', '2', NULL, NULL, '18', '18', 'سایر', NULL, NULL, true);
INSERT INTO "Acc"."DetailedTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedTypesID", "Code", "Title", "Title_En", "Description", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.204', '04:12:55', '1', '2026-10-23 04:12:55.204', '04:12:55', '2', '2', NULL, NULL, '19', '19', 'گروه بندی کالا انبار', NULL, NULL, true);
INSERT INTO "Acc"."DetailedTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedTypesID", "Code", "Title", "Title_En", "Description", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.207', '04:12:55', '1', '2026-10-23 04:12:55.207', '04:12:55', '2', '2', NULL, NULL, '20', '20', 'گروه بندی کالا فروش', NULL, NULL, true);
INSERT INTO "Acc"."DetailedTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DetailedTypesID", "Code", "Title", "Title_En", "Description", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.209', '04:12:55', '1', '2026-10-23 04:12:55.209', '04:12:55', '2', '2', NULL, NULL, '21', '21', 'کانال فروش', NULL, NULL, true);

-- Data for Acc.VoucherType (18 rows)
INSERT INTO "Acc"."VoucherType" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "VoucherTypeID", "Code", "Title", "Title_En", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.047', '04:12:55', '1', '2026-10-23 04:12:55.047', '04:12:55', '2', '2', NULL, NULL, '1', '1', 'سند عادی', NULL, true);
INSERT INTO "Acc"."VoucherType" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "VoucherTypeID", "Code", "Title", "Title_En", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.052', '04:12:55', '1', '2026-10-23 04:12:55.052', '04:12:55', '2', '2', NULL, NULL, '2', '2', 'سند افتتاحیه', NULL, true);
INSERT INTO "Acc"."VoucherType" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "VoucherTypeID", "Code", "Title", "Title_En", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.064', '04:12:55', '1', '2026-10-23 04:12:55.064', '04:12:55', '2', '2', NULL, NULL, '3', '3', 'سند اختتامیه', NULL, true);
INSERT INTO "Acc"."VoucherType" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "VoucherTypeID", "Code", "Title", "Title_En", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.090', '04:12:55', '1', '2026-10-23 04:12:55.090', '04:12:55', '2', '2', NULL, NULL, '4', '4', 'سند بستن حساب‌ها', NULL, true);
INSERT INTO "Acc"."VoucherType" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "VoucherTypeID", "Code", "Title", "Title_En", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.094', '04:12:55', '1', '2026-10-23 04:12:55.094', '04:12:55', '2', '2', NULL, NULL, '5', '5', 'سند سود و زیان', NULL, true);
INSERT INTO "Acc"."VoucherType" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "VoucherTypeID", "Code", "Title", "Title_En", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.098', '04:12:55', '1', '2026-10-23 04:12:55.098', '04:12:55', '2', '2', NULL, NULL, '6', '6', 'سند انتقال', NULL, true);
INSERT INTO "Acc"."VoucherType" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "VoucherTypeID", "Code", "Title", "Title_En", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.101', '04:12:55', '1', '2026-10-23 04:12:55.101', '04:12:55', '2', '2', NULL, NULL, '7', '7', 'اصلاح حساب', NULL, true);
INSERT INTO "Acc"."VoucherType" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "VoucherTypeID", "Code", "Title", "Title_En", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.107', '04:12:55', '1', '2026-10-23 04:12:55.107', '04:12:55', '2', '2', NULL, NULL, '8', '8', 'حقوق و دستمزد', NULL, true);
INSERT INTO "Acc"."VoucherType" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "VoucherTypeID", "Code", "Title", "Title_En", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.114', '04:12:55', '1', '2026-10-23 04:12:55.114', '04:12:55', '2', '2', NULL, NULL, '9', '9', 'هزینه‌های عمومی', NULL, true);
INSERT INTO "Acc"."VoucherType" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "VoucherTypeID", "Code", "Title", "Title_En", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.502', '04:12:55', '1', '2026-10-23 04:12:55.502', '04:12:55', '2', '2', NULL, NULL, '10', '1', 'سند عادی', NULL, true);
INSERT INTO "Acc"."VoucherType" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "VoucherTypeID", "Code", "Title", "Title_En", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.505', '04:12:55', '1', '2026-10-23 04:12:55.505', '04:12:55', '2', '2', NULL, NULL, '11', '2', 'سند افتتاحیه', NULL, true);
INSERT INTO "Acc"."VoucherType" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "VoucherTypeID", "Code", "Title", "Title_En", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.508', '04:12:55', '1', '2026-10-23 04:12:55.508', '04:12:55', '2', '2', NULL, NULL, '12', '3', 'سند اختتامیه', NULL, true);
INSERT INTO "Acc"."VoucherType" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "VoucherTypeID", "Code", "Title", "Title_En", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.514', '04:12:55', '1', '2026-10-23 04:12:55.514', '04:12:55', '2', '2', NULL, NULL, '13', '4', 'سند بستن حساب‌ها', NULL, true);
INSERT INTO "Acc"."VoucherType" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "VoucherTypeID", "Code", "Title", "Title_En", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.516', '04:12:55', '1', '2026-10-23 04:12:55.516', '04:12:55', '2', '2', NULL, NULL, '14', '5', 'سند سود و زیان', NULL, true);
INSERT INTO "Acc"."VoucherType" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "VoucherTypeID", "Code", "Title", "Title_En", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.518', '04:12:55', '1', '2026-10-23 04:12:55.518', '04:12:55', '2', '2', NULL, NULL, '15', '6', 'سند انتقال', NULL, true);
INSERT INTO "Acc"."VoucherType" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "VoucherTypeID", "Code", "Title", "Title_En", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.521', '04:12:55', '1', '2026-10-23 04:12:55.521', '04:12:55', '2', '2', NULL, NULL, '16', '7', 'اصلاح حساب', NULL, true);
INSERT INTO "Acc"."VoucherType" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "VoucherTypeID", "Code", "Title", "Title_En", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.525', '04:12:55', '1', '2026-10-23 04:12:55.525', '04:12:55', '2', '2', NULL, NULL, '17', '8', 'حقوق و دستمزد', NULL, true);
INSERT INTO "Acc"."VoucherType" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "VoucherTypeID", "Code", "Title", "Title_En", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.527', '04:12:55', '1', '2026-10-23 04:12:55.527', '04:12:55', '2', '2', NULL, NULL, '18', '9', 'هزینه‌های عمومی', NULL, true);

-- Data for Gnr.ActivityLog (201 rows)
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 04:23:31.470', '04:23:31', '1', '2026-10-23 04:23:31.470', '04:23:31', '2', NULL, NULL, NULL, '1', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 04:27:46.877', '04:27:46', '1', '2026-10-23 04:27:46.877', '04:27:46', '2', NULL, NULL, NULL, '2', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 04:27:53.782', '04:27:53', '1', '2026-10-23 04:27:53.782', '04:27:53', '2', NULL, NULL, NULL, '3', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 19:33:44.548', '19:33:44', '1', '2026-10-23 19:33:44.548', '19:33:44', '2', NULL, NULL, NULL, '4', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 19:33:49.725', '19:33:49', '1', '2026-10-23 19:33:49.725', '19:33:49', '2', NULL, NULL, NULL, '5', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 19:34:07.004', '19:34:07', '1', '2026-10-23 19:34:07.004', '19:34:07', '2', NULL, NULL, NULL, '6', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 19:48:37.907', '19:48:37', '1', '2026-10-23 19:48:37.907', '19:48:37', '2', NULL, NULL, NULL, '7', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 19:48:49.117', '19:48:49', '1', '2026-10-23 19:48:49.117', '19:48:49', '2', NULL, NULL, NULL, '8', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 19:48:57.675', '19:48:57', '1', '2026-10-23 19:48:57.675', '19:48:57', '2', NULL, NULL, NULL, '9', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 19:48:57.721', '19:48:57', '1', '2026-10-23 19:48:57.721', '19:48:57', '2', NULL, NULL, NULL, '10', 'DELETE', 'SettlementMethod', NULL, NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/sle/settlement-methods/1', 'DELETE', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 19:48:57.734', '19:48:57', '1', '2026-10-23 19:48:57.734', '19:48:57', '2', NULL, NULL, NULL, '11', 'DELETE', 'SettlementMethod', NULL, NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/sle/settlement-methods/2', 'DELETE', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 19:49:19.516', '19:49:19', '1', '2026-10-23 19:49:19.516', '19:49:19', '2', NULL, NULL, NULL, '12', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 19:54:01.879', '19:54:01', '1', '2026-10-23 19:54:01.879', '19:54:01', '2', NULL, NULL, NULL, '13', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 19:54:01.897', '19:54:01', '1', '2026-10-23 19:54:01.897', '19:54:01', '2', NULL, NULL, NULL, '14', 'DELETE', 'SettlementMethod', NULL, NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/sle/settlement-methods/3', 'DELETE', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 19:57:05.962', '19:57:05', '1', '2026-10-23 19:57:05.962', '19:57:05', '2', NULL, NULL, NULL, '15', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 20:19:54.002', '20:19:54', '1', '2026-10-23 20:19:54.002', '20:19:54', '2', NULL, NULL, NULL, '16', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 20:25:13.547', '20:25:13', '1', '2026-10-23 20:25:13.547', '20:25:13', '2', NULL, NULL, NULL, '17', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 20:29:21.130', '20:29:21', '1', '2026-10-23 20:29:21.130', '20:29:21', '2', NULL, NULL, NULL, '18', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 20:29:30.235', '20:29:30', '1', '2026-10-23 20:29:30.235', '20:29:30', '2', NULL, NULL, NULL, '19', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 20:29:30.318', '20:29:30', '1', '2026-10-23 20:29:30.318', '20:29:30', '2', NULL, NULL, NULL, '20', 'DELETE', 'SalesOrder', '1', '{"version":2,"creator":1,"creationDate":"2026-10-23T20:29:21.171Z","createTime":"20:29:21","lastModifier":1,"lastModificationDate":"2026-10-23T20:29:30.286Z","lastModificationTime":"20:29:30","businessStructureRef":2,"companyRef":2,"branchRef":null,"agencyRef":null,"SalesOrderID":"1","OrderNumber":1,"OrderDate":"2026-10-23","CustomerRef":"99","CustomerName":"مشتری ویرایش‌شده","Status":1,"Description":"سفارش تست","FiscalYearRef":"1"}', NULL, '127.0.0.1', 'curl/8.14.1', '/api/sle/sales-orders/1', 'DELETE', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 20:30:48.908', '20:30:48', '1', '2026-10-23 20:30:48.908', '20:30:48', '2', NULL, NULL, NULL, '21', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 20:30:56.966', '20:30:56', '1', '2026-10-23 20:30:56.966', '20:30:56', '2', NULL, NULL, NULL, '22', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 20:31:13.755', '20:31:13', '1', '2026-10-23 20:31:13.755', '20:31:13', '2', NULL, NULL, NULL, '23', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 20:35:40.883', '20:35:40', '1', '2026-10-23 20:35:40.883', '20:35:40', '2', NULL, NULL, NULL, '24', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 20:37:21.338', '20:37:21', '1', '2026-10-23 20:37:21.338', '20:37:21', '2', NULL, NULL, NULL, '25', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 20:37:21.370', '20:37:21', '1', '2026-10-23 20:37:21.370', '20:37:21', '2', NULL, NULL, NULL, '26', 'DELETE', 'SalesOrder', '2', '{"version":1,"creator":1,"creationDate":"2026-10-23T20:35:40.898Z","createTime":"20:35:40","lastModifier":1,"lastModificationDate":"2026-10-23T20:35:40.898Z","lastModificationTime":"20:35:40","businessStructureRef":2,"companyRef":2,"branchRef":null,"agencyRef":null,"SalesOrderID":"2","OrderNumber":5,"OrderDate":"2026-10-23","CustomerRef":"9001","CustomerName":"مشتری تستی سفارش","Status":1,"Description":null,"FiscalYearRef":"1"}', NULL, '127.0.0.1', 'curl/8.14.1', '/api/sle/sales-orders/2', 'DELETE', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 20:37:21.391', '20:37:21', '1', '2026-10-23 20:37:21.391', '20:37:21', '2', NULL, NULL, NULL, '27', 'DELETE', 'SalesOrder', '3', '{"version":1,"creator":1,"creationDate":"2026-10-23T20:36:04.123Z","createTime":"20:36:04","lastModifier":1,"lastModificationDate":"2026-10-23T20:36:04.123Z","lastModificationTime":"20:36:04","businessStructureRef":2,"companyRef":2,"branchRef":null,"agencyRef":null,"SalesOrderID":"3","OrderNumber":9,"OrderDate":"2026-10-23","CustomerRef":"9001","CustomerName":"مشتری تستی سفارش","Status":1,"Description":null,"FiscalYearRef":"1"}', NULL, '127.0.0.1', 'curl/8.14.1', '/api/sle/sales-orders/3', 'DELETE', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 21:12:09.091', '21:12:09', '1', '2026-10-23 21:12:09.091', '21:12:09', '2', NULL, NULL, NULL, '28', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 21:12:16.281', '21:12:16', '1', '2026-10-23 21:12:16.281', '21:12:16', '2', NULL, NULL, NULL, '29', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 21:12:33.920', '21:12:33', '1', '2026-10-23 21:12:33.920', '21:12:33', '2', NULL, NULL, NULL, '30', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 21:33:21.352', '21:33:21', '1', '2026-10-23 21:33:21.352', '21:33:21', '2', NULL, NULL, NULL, '31', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 22:05:51.331', '22:05:51', '1', '2026-10-23 22:05:51.331', '22:05:51', '2', NULL, NULL, NULL, '32', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 22:06:16.176', '22:06:16', '1', '2026-10-23 22:06:16.176', '22:06:16', '2', NULL, NULL, NULL, '33', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 22:06:27.106', '22:06:27', '1', '2026-10-23 22:06:27.106', '22:06:27', '2', NULL, NULL, NULL, '34', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 22:06:38.187', '22:06:38', '1', '2026-10-23 22:06:38.187', '22:06:38', '2', NULL, NULL, NULL, '35', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 22:06:56.738', '22:06:56', '1', '2026-10-23 22:06:56.738', '22:06:56', '2', NULL, NULL, NULL, '36', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 22:08:26.602', '22:08:26', '1', '2026-10-23 22:08:26.602', '22:08:26', '2', NULL, NULL, NULL, '37', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 22:13:14.951', '22:13:14', '1', '2026-10-23 22:13:14.951', '22:13:14', '2', NULL, NULL, NULL, '38', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-23 22:41:10.861', '22:41:10', '1', '2026-10-23 22:41:10.861', '22:41:10', '2', NULL, NULL, NULL, '39', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 01:45:32.142', '01:45:32', '1', '2026-10-24 01:45:32.142', '01:45:32', '2', NULL, NULL, NULL, '40', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 01:45:39.816', '01:45:39', '1', '2026-10-24 01:45:39.816', '01:45:39', '2', NULL, NULL, NULL, '41', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 01:57:40.441', '01:57:40', '1', '2026-10-24 01:57:40.441', '01:57:40', '2', NULL, NULL, NULL, '42', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 02:19:47.245', '02:19:47', '1', '2026-10-24 02:19:47.245', '02:19:47', '2', NULL, NULL, NULL, '43', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 02:47:21.261', '02:47:21', '1', '2026-10-24 02:47:21.261', '02:47:21', '2', NULL, NULL, NULL, '44', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 02:47:26.383', '02:47:26', '1', '2026-10-24 02:47:26.383', '02:47:26', '2', NULL, NULL, NULL, '45', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 02:47:35.352', '02:47:35', '1', '2026-10-24 02:47:35.352', '02:47:35', '2', NULL, NULL, NULL, '46', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 02:47:56.153', '02:47:56', '1', '2026-10-24 02:47:56.153', '02:47:56', '2', NULL, NULL, NULL, '47', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 02:48:04.999', '02:48:05', '1', '2026-10-24 02:48:04.999', '02:48:05', '2', NULL, NULL, NULL, '48', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 02:48:29.166', '02:48:29', '1', '2026-10-24 02:48:29.166', '02:48:29', '2', NULL, NULL, NULL, '49', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 02:56:48.534', '02:56:48', '1', '2026-10-24 02:56:48.534', '02:56:48', '2', NULL, NULL, NULL, '50', 'DELETE', 'PartyAddress', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/sle/customers', 'POST', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 02:56:48.537', '02:56:48', '1', '2026-10-24 02:56:48.537', '02:56:48', '2', NULL, NULL, NULL, '51', 'DELETE', 'PartyPhone', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/sle/customers', 'POST', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 03:11:49.569', '03:11:49', '1', '2026-10-24 03:11:49.569', '03:11:49', '2', NULL, NULL, NULL, '52', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 03:11:55.968', '03:11:55', '1', '2026-10-24 03:11:55.968', '03:11:55', '2', NULL, NULL, NULL, '53', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'node', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 03:12:00.760', '03:12:00', '1', '2026-10-24 03:12:00.760', '03:12:00', '2', NULL, NULL, NULL, '54', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'node', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 03:12:04.496', '03:12:04', '1', '2026-10-24 03:12:04.496', '03:12:04', '2', NULL, NULL, NULL, '55', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'node', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 03:14:29.298', '03:14:29', '1', '2026-10-24 03:14:29.298', '03:14:29', '2', NULL, NULL, NULL, '56', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'node', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 03:14:49.555', '03:14:49', '1', '2026-10-24 03:14:49.555', '03:14:49', '2', NULL, NULL, NULL, '57', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 03:23:30.696', '03:23:30', '1', '2026-10-24 03:23:30.696', '03:23:30', '2', NULL, NULL, NULL, '58', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'node', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 03:24:30.909', '03:24:30', '1', '2026-10-24 03:24:30.909', '03:24:30', '2', NULL, NULL, NULL, '59', 'DELETE', 'PartyAddress', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/sle/customers/1', 'PUT', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 03:24:30.913', '03:24:30', '1', '2026-10-24 03:24:30.913', '03:24:30', '2', NULL, NULL, NULL, '60', 'DELETE', 'PartyPhone', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/sle/customers/1', 'PUT', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 03:24:37.912', '03:24:37', '1', '2026-10-24 03:24:37.912', '03:24:37', '2', NULL, NULL, NULL, '61', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'node', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 04:32:53.001', '04:32:53', '1', '2026-10-24 04:32:53.001', '04:32:53', '2', NULL, NULL, NULL, '62', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'node', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 04:33:47.955', '04:33:47', '1', '2026-10-24 04:33:47.955', '04:33:47', '2', NULL, NULL, NULL, '63', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 04:43:06.920', '04:43:06', '1', '2026-10-24 04:43:06.920', '04:43:06', '2', NULL, NULL, NULL, '64', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 04:45:11.883', '04:45:11', '1', '2026-10-24 04:45:11.883', '04:45:11', '2', NULL, NULL, NULL, '65', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 04:56:53.768', '04:56:53', '1', '2026-10-24 04:56:53.768', '04:56:53', '2', NULL, NULL, NULL, '66', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 04:58:59.837', '04:58:59', '1', '2026-10-24 04:58:59.837', '04:58:59', '2', NULL, NULL, NULL, '67', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 04:59:31.164', '04:59:31', '1', '2026-10-24 04:59:31.164', '04:59:31', '2', NULL, NULL, NULL, '68', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 05:00:16.834', '05:00:16', '1', '2026-10-24 05:00:16.834', '05:00:16', '2', NULL, NULL, NULL, '69', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 05:00:21.450', '05:00:21', '1', '2026-10-24 05:00:21.450', '05:00:21', '2', NULL, NULL, NULL, '70', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 05:01:42.019', '05:01:42', '1', '2026-10-24 05:01:42.019', '05:01:42', '2', NULL, NULL, NULL, '71', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 05:33:32.357', '05:33:32', '1', '2026-10-24 05:33:32.357', '05:33:32', '2', NULL, NULL, NULL, '72', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 05:34:31.585', '05:34:31', '1', '2026-10-24 05:34:31.585', '05:34:31', '2', NULL, NULL, NULL, '73', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 05:34:59.989', '05:34:59', '1', '2026-10-24 05:34:59.989', '05:34:59', '2', NULL, NULL, NULL, '74', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 05:35:00.040', '05:35:00', '1', '2026-10-24 05:35:00.040', '05:35:00', '2', NULL, NULL, NULL, '75', 'DELETE', 'CustomerGroup', NULL, NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/sle/customer-groups/4', 'DELETE', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 05:35:00.048', '05:35:00', '1', '2026-10-24 05:35:00.048', '05:35:00', '2', NULL, NULL, NULL, '76', 'DELETE', 'DetailedAccount', NULL, NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/sle/customer-groups/4', 'DELETE', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 05:35:00.081', '05:35:00', '1', '2026-10-24 05:35:00.081', '05:35:00', '2', NULL, NULL, NULL, '77', 'DELETE', 'CustomerGroup', NULL, NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/sle/customer-groups/3', 'DELETE', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 05:35:00.084', '05:35:00', '1', '2026-10-24 05:35:00.084', '05:35:00', '2', NULL, NULL, NULL, '78', 'DELETE', 'DetailedAccount', NULL, NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/sle/customer-groups/3', 'DELETE', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 05:35:00.120', '05:35:00', '1', '2026-10-24 05:35:00.120', '05:35:00', '2', NULL, NULL, NULL, '79', 'DELETE', 'CustomerGroup', NULL, NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/sle/customer-groups/2', 'DELETE', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 05:35:00.123', '05:35:00', '1', '2026-10-24 05:35:00.123', '05:35:00', '2', NULL, NULL, NULL, '80', 'DELETE', 'DetailedAccount', NULL, NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/sle/customer-groups/2', 'DELETE', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 05:35:28.812', '05:35:28', '1', '2026-10-24 05:35:28.812', '05:35:28', '2', NULL, NULL, NULL, '81', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 08:57:04.459', '08:57:04', '1', '2026-10-24 08:57:04.459', '08:57:04', '2', NULL, NULL, NULL, '82', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 08:58:43.431', '08:58:43', '1', '2026-10-24 08:58:43.431', '08:58:43', '2', NULL, NULL, NULL, '83', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 08:58:47.345', '08:58:47', '1', '2026-10-24 08:58:47.345', '08:58:47', '2', NULL, NULL, NULL, '84', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 08:59:43.968', '08:59:43', '1', '2026-10-24 08:59:43.968', '08:59:43', '2', NULL, NULL, NULL, '85', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 09:01:32.375', '09:01:32', '1', '2026-10-24 09:01:32.375', '09:01:32', '2', NULL, NULL, NULL, '86', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 09:17:38.105', '09:17:38', '1', '2026-10-24 09:17:38.105', '09:17:38', '2', NULL, NULL, NULL, '87', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 09:22:31.530', '09:22:31', '1', '2026-10-24 09:22:31.530', '09:22:31', '2', NULL, NULL, NULL, '88', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 09:25:27.840', '09:25:27', '1', '2026-10-24 09:25:27.840', '09:25:27', '2', NULL, NULL, NULL, '89', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 09:49:00.125', '09:49:00', '1', '2026-10-24 09:49:00.125', '09:49:00', '2', NULL, NULL, NULL, '90', 'DELETE', 'PartyAddress', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/sle/customers/1', 'PUT', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 09:49:00.131', '09:49:00', '1', '2026-10-24 09:49:00.131', '09:49:00', '2', NULL, NULL, NULL, '91', 'DELETE', 'PartyPhone', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/sle/customers/1', 'PUT', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 11:21:53.022', '11:21:53', '1', '2026-10-24 11:21:53.022', '11:21:53', '2', NULL, NULL, NULL, '92', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 11:26:04.025', '11:26:04', '1', '2026-10-24 11:26:04.025', '11:26:04', '2', NULL, NULL, NULL, '93', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 11:26:25.210', '11:26:25', '1', '2026-10-24 11:26:25.210', '11:26:25', '2', NULL, NULL, NULL, '94', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 11:26:47.447', '11:26:47', '1', '2026-10-24 11:26:47.447', '11:26:47', '2', NULL, NULL, NULL, '95', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 11:33:15.622', '11:33:15', '1', '2026-10-24 11:33:15.622', '11:33:15', '2', NULL, NULL, NULL, '96', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 11:35:27.030', '11:35:27', '1', '2026-10-24 11:35:27.030', '11:35:27', '2', NULL, NULL, NULL, '97', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 11:36:59.031', '11:36:59', '1', '2026-10-24 11:36:59.031', '11:36:59', '2', NULL, NULL, NULL, '98', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 12:10:14.637', '12:10:14', '1', '2026-10-24 12:10:14.637', '12:10:14', '2', NULL, NULL, NULL, '99', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 12:10:30.100', '12:10:30', '1', '2026-10-24 12:10:30.100', '12:10:30', '2', NULL, NULL, NULL, '100', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 12:10:45.958', '12:10:45', '1', '2026-10-24 12:10:45.958', '12:10:45', '2', NULL, NULL, NULL, '101', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 12:11:00.035', '12:11:00', '1', '2026-10-24 12:11:00.035', '12:11:00', '2', NULL, NULL, NULL, '102', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 12:11:09.228', '12:11:09', '1', '2026-10-24 12:11:09.228', '12:11:09', '2', NULL, NULL, NULL, '103', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 12:11:20.530', '12:11:20', '1', '2026-10-24 12:11:20.530', '12:11:20', '2', NULL, NULL, NULL, '104', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 12:11:33.413', '12:11:33', '1', '2026-10-24 12:11:33.413', '12:11:33', '2', NULL, NULL, NULL, '105', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 12:12:02.781', '12:12:02', '1', '2026-10-24 12:12:02.781', '12:12:02', '2', NULL, NULL, NULL, '106', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 12:18:29.774', '12:18:29', '1', '2026-10-24 12:18:29.774', '12:18:29', '2', NULL, NULL, NULL, '107', 'DELETE', 'PartyAddress', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/sle/customers', 'POST', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 12:18:29.778', '12:18:29', '1', '2026-10-24 12:18:29.778', '12:18:29', '2', NULL, NULL, NULL, '108', 'DELETE', 'PartyPhone', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/sle/customers', 'POST', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 12:23:03.229', '12:23:03', '1', '2026-10-24 12:23:03.229', '12:23:03', '2', NULL, NULL, NULL, '109', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 12:25:43.385', '12:25:43', '1', '2026-10-24 12:25:43.385', '12:25:43', '2', NULL, NULL, NULL, '110', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 12:31:51.150', '12:31:51', '1', '2026-10-24 12:31:51.150', '12:31:51', '2', NULL, NULL, NULL, '111', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 12:39:11.131', '12:39:11', '1', '2026-10-24 12:39:11.131', '12:39:11', '2', NULL, NULL, NULL, '112', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 12:40:21.875', '12:40:21', '1', '2026-10-24 12:40:21.875', '12:40:21', '2', NULL, NULL, NULL, '113', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 12:48:19.453', '12:48:19', '1', '2026-10-24 12:48:19.453', '12:48:19', '2', NULL, NULL, NULL, '114', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 13:11:25.449', '13:11:25', '1', '2026-10-24 13:11:25.449', '13:11:25', '2', NULL, NULL, NULL, '115', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 13:24:39.033', '13:24:39', '1', '2026-10-24 13:24:39.033', '13:24:39', '2', NULL, NULL, NULL, '116', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 13:24:59.652', '13:24:59', '1', '2026-10-24 13:24:59.652', '13:24:59', '2', NULL, NULL, NULL, '117', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 13:25:19.897', '13:25:19', '1', '2026-10-24 13:25:19.897', '13:25:19', '2', NULL, NULL, NULL, '118', 'DELETE', 'Item', NULL, NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/inv/items/1', 'DELETE', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 13:32:26.602', '13:32:26', '1', '2026-10-24 13:32:26.602', '13:32:26', '2', NULL, NULL, NULL, '119', 'DELETE', 'Item', NULL, NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/inv/items/2', 'DELETE', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 15:02:23.361', '15:02:23', '1', '2026-10-24 15:02:23.361', '15:02:23', '2', NULL, NULL, NULL, '120', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 15:07:24.846', '15:07:24', '1', '2026-10-24 15:07:24.846', '15:07:24', '2', NULL, NULL, NULL, '121', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 15:21:22.006', '15:21:22', '1', '2026-10-24 15:21:22.006', '15:21:22', '2', NULL, NULL, NULL, '122', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 15:28:33.298', '15:28:33', '1', '2026-10-24 15:28:33.298', '15:28:33', '2', NULL, NULL, NULL, '123', 'DELETE', 'Item', NULL, NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/inv/items/3', 'DELETE', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 15:28:33.347', '15:28:33', '1', '2026-10-24 15:28:33.347', '15:28:33', '2', NULL, NULL, NULL, '124', 'DELETE', 'Item', NULL, NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/inv/items/4', 'DELETE', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 15:28:33.401', '15:28:33', '1', '2026-10-24 15:28:33.401', '15:28:33', '2', NULL, NULL, NULL, '125', 'DELETE', 'Item', NULL, NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/inv/items/5', 'DELETE', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 15:32:37.629', '15:32:37', '1', '2026-10-24 15:32:37.629', '15:32:37', '2', NULL, NULL, NULL, '126', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 16:00:35.767', '16:00:35', '1', '2026-10-24 16:00:35.767', '16:00:35', '2', NULL, NULL, NULL, '127', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 16:12:16.978', '16:12:16', '1', '2026-10-24 16:12:16.978', '16:12:16', '2', NULL, NULL, NULL, '128', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 16:13:00.465', '16:13:00', '1', '2026-10-24 16:13:00.465', '16:13:00', '2', NULL, NULL, NULL, '129', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 16:18:46.124', '16:18:46', '1', '2026-10-24 16:18:46.124', '16:18:46', '2', NULL, NULL, NULL, '130', 'DELETE', 'WarehouseProduct', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/inv/warehouses/1', 'PUT', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 16:18:46.130', '16:18:46', '1', '2026-10-24 16:18:46.130', '16:18:46', '2', NULL, NULL, NULL, '131', 'DELETE', 'WarehouseUser', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/inv/warehouses/1', 'PUT', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 16:18:46.148', '16:18:46', '1', '2026-10-24 16:18:46.148', '16:18:46', '2', NULL, NULL, NULL, '132', 'DELETE', 'WarehouseKeeper', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/inv/warehouses/1', 'PUT', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 16:18:46.175', '16:18:46', '1', '2026-10-24 16:18:46.175', '16:18:46', '2', NULL, NULL, NULL, '133', 'DELETE', 'WarehouseAddress', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/inv/warehouses/1', 'PUT', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 16:22:47.304', '16:22:47', '1', '2026-10-24 16:22:47.304', '16:22:47', '2', NULL, NULL, NULL, '134', 'DELETE', 'WarehouseUser', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/inv/warehouses/1', 'PUT', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 16:22:47.309', '16:22:47', '1', '2026-10-24 16:22:47.309', '16:22:47', '2', NULL, NULL, NULL, '135', 'DELETE', 'WarehouseProduct', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/inv/warehouses/1', 'PUT', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 16:22:47.320', '16:22:47', '1', '2026-10-24 16:22:47.320', '16:22:47', '2', NULL, NULL, NULL, '136', 'DELETE', 'WarehouseAddress', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/inv/warehouses/1', 'PUT', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 16:22:47.329', '16:22:47', '1', '2026-10-24 16:22:47.329', '16:22:47', '2', NULL, NULL, NULL, '137', 'DELETE', 'WarehouseKeeper', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/inv/warehouses/1', 'PUT', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 16:23:15.410', '16:23:15', '1', '2026-10-24 16:23:15.410', '16:23:15', '2', NULL, NULL, NULL, '138', 'DELETE', 'WarehouseUser', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/inv/warehouses/1', 'PUT', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 16:23:15.416', '16:23:15', '1', '2026-10-24 16:23:15.416', '16:23:15', '2', NULL, NULL, NULL, '139', 'DELETE', 'WarehouseProduct', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/inv/warehouses/1', 'PUT', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 16:23:15.422', '16:23:15', '1', '2026-10-24 16:23:15.422', '16:23:15', '2', NULL, NULL, NULL, '140', 'DELETE', 'WarehouseKeeper', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/inv/warehouses/1', 'PUT', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 16:23:15.428', '16:23:15', '1', '2026-10-24 16:23:15.428', '16:23:15', '2', NULL, NULL, NULL, '141', 'DELETE', 'WarehouseAddress', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/inv/warehouses/1', 'PUT', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 16:23:47.270', '16:23:47', '1', '2026-10-24 16:23:47.270', '16:23:47', '2', NULL, NULL, NULL, '142', 'DELETE', 'WarehouseProduct', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/inv/warehouses/1', 'PUT', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 16:23:47.307', '16:23:47', '1', '2026-10-24 16:23:47.307', '16:23:47', '2', NULL, NULL, NULL, '143', 'DELETE', 'WarehouseUser', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/inv/warehouses/1', 'PUT', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 16:23:47.318', '16:23:47', '1', '2026-10-24 16:23:47.318', '16:23:47', '2', NULL, NULL, NULL, '144', 'DELETE', 'WarehouseAddress', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/inv/warehouses/1', 'PUT', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 16:23:47.358', '16:23:47', '1', '2026-10-24 16:23:47.358', '16:23:47', '2', NULL, NULL, NULL, '145', 'DELETE', 'WarehouseKeeper', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/inv/warehouses/1', 'PUT', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 18:21:08.984', '18:21:08', '1', '2026-10-24 18:21:08.984', '18:21:08', '2', NULL, NULL, NULL, '146', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 19:46:45.422', '19:46:45', '1', '2026-10-24 19:46:45.422', '19:46:45', '2', NULL, NULL, NULL, '147', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 20:28:16.484', '20:28:16', '1', '2026-10-24 20:28:16.484', '20:28:16', '2', NULL, NULL, NULL, '148', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 20:31:16.558', '20:31:16', '1', '2026-10-24 20:31:16.558', '20:31:16', '2', NULL, NULL, NULL, '149', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 20:31:29.623', '20:31:29', '1', '2026-10-24 20:31:29.623', '20:31:29', '2', NULL, NULL, NULL, '150', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 00:36:46.951', '00:36:46', '1', '2026-10-25 00:36:46.951', '00:36:46', '2', NULL, NULL, NULL, '177', 'DELETE', 'WarehouseUser', NULL, NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/inv/warehouses/2', 'PUT', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 20:39:22.516', '20:39:22', '1', '2026-10-24 20:39:22.516', '20:39:22', '2', NULL, NULL, NULL, '151', 'DELETE', 'SalesOrder', '9', '{"version":1,"creator":1,"creationDate":"2026-10-24T20:37:18.672Z","createTime":"20:37:18","lastModifier":1,"lastModificationDate":"2026-10-24T20:37:18.672Z","lastModificationTime":"20:37:18","businessStructureRef":2,"companyRef":2,"branchRef":null,"agencyRef":null,"SalesOrderID":"9","OrderNumber":2,"OrderDate":"2026/10/24","DeliveryDate":null,"CustomerRef":"2","CustomerName":"علی جهانی","SalesTypeRef":"2","DeliveryLocationRef":"2","SettlementMethodRef":"4","Status":2,"Description":null,"FiscalYearRef":"1"}', NULL, '127.0.0.1', 'curl/8.14.1', '/api/sle/sales-orders/9', 'DELETE', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 20:48:56.997', '20:48:56', '1', '2026-10-24 20:48:56.997', '20:48:56', '2', NULL, NULL, NULL, '152', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 21:16:39.468', '21:16:39', '1', '2026-10-24 21:16:39.468', '21:16:39', '2', NULL, NULL, NULL, '153', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 21:23:44.440', '21:23:44', '1', '2026-10-24 21:23:44.440', '21:23:44', '2', NULL, NULL, NULL, '154', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 21:23:48.608', '21:23:48', '1', '2026-10-24 21:23:48.608', '21:23:48', '2', NULL, NULL, NULL, '155', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 21:23:52.649', '21:23:52', '1', '2026-10-24 21:23:52.649', '21:23:52', '2', NULL, NULL, NULL, '156', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 21:24:19.873', '21:24:19', '1', '2026-10-24 21:24:19.873', '21:24:19', '2', NULL, NULL, NULL, '157', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 21:28:46.190', '21:28:46', '1', '2026-10-24 21:28:46.190', '21:28:46', '2', NULL, NULL, NULL, '158', 'DELETE', 'SalesOrder', '10', '{"version":1,"creator":1,"creationDate":"2026-10-24T21:28:20.251Z","createTime":"21:28:20","lastModifier":1,"lastModificationDate":"2026-10-24T21:28:20.251Z","lastModificationTime":"21:28:20","businessStructureRef":2,"companyRef":2,"branchRef":null,"agencyRef":null,"SalesOrderID":"10","OrderNumber":2,"OrderDate":"2026/10/24","DeliveryDate":null,"CustomerRef":"2","CustomerName":"علی جهانی","SalesTypeRef":"2","DeliveryLocationRef":"2","SettlementMethodRef":"4","Status":2,"Description":null,"FiscalYearRef":"1"}', NULL, '127.0.0.1', 'curl/8.14.1', '/api/sle/sales-orders/10', 'DELETE', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 21:54:52.513', '21:54:52', '1', '2026-10-24 21:54:52.513', '21:54:52', '2', NULL, NULL, NULL, '159', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 21:55:07.537', '21:55:07', '1', '2026-10-24 21:55:07.537', '21:55:07', '2', NULL, NULL, NULL, '160', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 22:16:46.824', '22:16:46', '1', '2026-10-24 22:16:46.824', '22:16:46', '2', NULL, NULL, NULL, '161', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 22:26:51.433', '22:26:51', '1', '2026-10-24 22:26:51.433', '22:26:51', '2', NULL, NULL, NULL, '162', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 22:29:05.266', '22:29:05', '1', '2026-10-24 22:29:05.266', '22:29:05', '2', NULL, NULL, NULL, '163', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 22:29:17.800', '22:29:17', '1', '2026-10-24 22:29:17.800', '22:29:17', '2', NULL, NULL, NULL, '164', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 22:29:30.905', '22:29:30', '1', '2026-10-24 22:29:30.905', '22:29:30', '2', NULL, NULL, NULL, '165', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 22:29:51.728', '22:29:51', '1', '2026-10-24 22:29:51.728', '22:29:51', '2', NULL, NULL, NULL, '166', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 22:53:40.435', '22:53:40', '1', '2026-10-24 22:53:40.435', '22:53:40', '2', NULL, NULL, NULL, '167', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 23:20:53.866', '23:20:53', '1', '2026-10-24 23:20:53.866', '23:20:53', '2', NULL, NULL, NULL, '168', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 23:20:53.907', '23:20:53', '1', '2026-10-24 23:20:53.907', '23:20:53', '2', NULL, NULL, NULL, '169', 'DELETE', 'SalesOrder', '12', '{"version":1,"creator":1,"creationDate":"2026-10-24T23:16:43.420Z","createTime":"23:16:43","lastModifier":1,"lastModificationDate":"2026-10-24T23:16:43.420Z","lastModificationTime":"23:16:43","businessStructureRef":2,"companyRef":2,"branchRef":null,"agencyRef":null,"SalesOrderID":"12","OrderNumber":3,"OrderDate":"2026/10/24","DeliveryDate":null,"CustomerRef":"2","CustomerName":"علی جهانی","SalesTypeRef":"2","DeliveryLocationRef":"2","SettlementMethodRef":"4","Status":2,"Description":null,"FiscalYearRef":"1"}', NULL, '127.0.0.1', 'curl/8.14.1', '/api/sle/sales-orders/12', 'DELETE', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-24 23:25:21.678', '23:25:21', '1', '2026-10-24 23:25:21.678', '23:25:21', '2', NULL, NULL, NULL, '170', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 00:19:35.520', '00:19:35', '1', '2026-10-25 00:19:35.520', '00:19:35', '2', NULL, NULL, NULL, '171', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 00:27:59.259', '00:27:59', '1', '2026-10-25 00:27:59.259', '00:27:59', '2', NULL, NULL, NULL, '172', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 00:34:13.128', '00:34:13', '1', '2026-10-25 00:34:13.128', '00:34:13', '2', NULL, NULL, NULL, '173', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 00:34:33.503', '00:34:33', '1', '2026-10-25 00:34:33.503', '00:34:33', '2', NULL, NULL, NULL, '174', 'DELETE', 'WarehouseUser', NULL, NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/inv/warehouses/1', 'PUT', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 00:34:43.959', '00:34:43', '1', '2026-10-25 00:34:43.959', '00:34:43', '2', NULL, NULL, NULL, '175', 'DELETE', 'WarehouseUser', NULL, NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/inv/warehouses/3', 'PUT', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 00:35:22.893', '00:35:22', '1', '2026-10-25 00:35:22.893', '00:35:22', '2', NULL, NULL, NULL, '176', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 05:10:10.955', '05:10:10', '1', '2026-10-25 05:10:10.955', '05:10:10', '2', NULL, NULL, NULL, '178', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 05:36:03.790', '05:36:03', '1', '2026-10-25 05:36:03.790', '05:36:03', '2', NULL, NULL, NULL, '179', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 05:37:16.143', '05:37:16', '1', '2026-10-25 05:37:16.143', '05:37:16', '2', NULL, NULL, NULL, '180', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 05:37:49.398', '05:37:49', '1', '2026-10-25 05:37:49.398', '05:37:49', '2', NULL, NULL, NULL, '181', 'LOGOUT', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/logout', 'POST', 'کاربر از سیستم خارج شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 05:37:58.730', '05:37:58', '1', '2026-10-25 05:37:58.730', '05:37:58', '2', NULL, NULL, NULL, '182', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 05:59:44.329', '05:59:44', '1', '2026-10-25 05:59:44.329', '05:59:44', '2', NULL, NULL, NULL, '183', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 08:40:00.683', '08:40:00', '1', '2026-10-25 08:40:00.683', '08:40:00', '2', NULL, NULL, NULL, '184', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 09:17:36.182', '09:17:36', '1', '2026-10-25 09:17:36.182', '09:17:36', '2', NULL, NULL, NULL, '185', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 09:18:12.622', '09:18:12', '1', '2026-10-25 09:18:12.622', '09:18:12', '2', NULL, NULL, NULL, '186', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 09:53:22.837', '09:53:22', '1', '2026-10-25 09:53:22.837', '09:53:22', '2', NULL, NULL, NULL, '187', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 10:09:55.088', '10:09:55', '1', '2026-10-25 10:09:55.088', '10:09:55', '2', NULL, NULL, NULL, '188', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 11:03:33.871', '11:03:33', '1', '2026-10-25 11:03:33.871', '11:03:33', '2', NULL, NULL, NULL, '189', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 11:05:32.445', '11:05:32', '1', '2026-10-25 11:05:32.445', '11:05:32', '2', NULL, NULL, NULL, '190', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 11:08:34.379', '11:08:34', '1', '2026-10-25 11:08:34.379', '11:08:34', '2', NULL, NULL, NULL, '191', 'DELETE', 'SalesChannel', NULL, NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/sle/sales-channels/2', 'DELETE', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 11:21:35.431', '11:21:35', '1', '2026-10-25 11:21:35.431', '11:21:35', '2', NULL, NULL, NULL, '192', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 12:23:00.894', '12:23:00', '1', '2026-10-25 12:23:00.894', '12:23:00', '2', NULL, NULL, NULL, '193', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 12:27:35.580', '12:27:35', '1', '2026-10-25 12:27:35.580', '12:27:35', '2', NULL, NULL, NULL, '194', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 13:36:44.335', '13:36:44', '1', '2026-10-25 13:36:44.335', '13:36:44', '2', NULL, NULL, NULL, '195', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 13:54:18.766', '13:54:18', '1', '2026-10-25 13:54:18.766', '13:54:18', '2', NULL, NULL, NULL, '196', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'curl/8.14.1', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 13:54:45.114', '13:54:45', '1', '2026-10-25 13:54:45.114', '13:54:45', '2', NULL, NULL, NULL, '197', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 14:06:11.143', '14:06:11', '1', '2026-10-25 14:06:11.143', '14:06:11', '2', NULL, NULL, NULL, '198', 'DELETE', 'SalesOrder', '13', '{"version":2,"creator":1,"creationDate":"2026-10-25T13:58:04.409Z","createTime":"13:58:04","lastModifier":1,"lastModificationDate":"2026-10-25T14:02:05.091Z","lastModificationTime":"14:02:05","businessStructureRef":2,"companyRef":2,"branchRef":null,"agencyRef":null,"SalesOrderID":"13","OrderNumber":3,"OrderDate":"2026/10/25","DeliveryDate":null,"CustomerRef":"2","CustomerName":"علی جهانی","SalesTypeRef":"2","DeliveryLocationRef":"2","SettlementMethodRef":"4","Status":2,"Description":"","FiscalYearRef":"1"}', NULL, '127.0.0.1', 'curl/8.14.1', '/api/sle/sales-orders/13', 'DELETE', NULL);
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 16:06:57.363', '16:06:57', '1', '2026-10-25 16:06:57.363', '16:06:57', '2', NULL, NULL, NULL, '199', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 17:11:27.535', '17:11:27', '1', '2026-10-25 17:11:27.535', '17:11:27', '2', NULL, NULL, NULL, '200', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');
INSERT INTO "Gnr"."ActivityLog" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "id", "Action", "EntityName", "EntityId", "OldValues", "NewValues", "IpAddress", "UserAgent", "Url", "Method", "Description") VALUES (1, '1', '2026-10-25 17:25:17.398', '17:25:17', '1', '2026-10-25 17:25:17.398', '17:25:17', '2', NULL, NULL, NULL, '201', 'LOGIN', 'User', '1', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '/api/auth/login', 'POST', 'کاربر admin وارد سیستم شد');

-- Data for Gnr.BaseSettings (75 rows)
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.220', '04:12:55', '1', '2026-10-23 04:12:55.220', '04:12:55', '2', '2', NULL, NULL, '1', 2, 'detailedLevelsCount', '10');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.220', '04:12:55', '1', '2026-10-23 04:12:55.220', '04:12:55', '2', '2', NULL, NULL, '2', 2, 'showTrackingColumnsInVoucher', 'true');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.220', '04:12:55', '1', '2026-10-23 04:12:55.220', '04:12:55', '2', '2', NULL, NULL, '3', 2, 'requireTrackingInfoIfEnabled', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.220', '04:12:55', '1', '2026-10-23 04:12:55.220', '04:12:55', '2', '2', NULL, NULL, '4', 2, 'showCurrencyColumnsInVoucher', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.220', '04:12:55', '1', '2026-10-23 04:12:55.220', '04:12:55', '2', '2', NULL, NULL, '5', 2, 'enableLedgerAccessControl', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.220', '04:12:55', '1', '2026-10-23 04:12:55.220', '04:12:55', '2', '2', NULL, NULL, '6', 2, 'defaultCurrency', 'ریال');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.220', '04:12:55', '1', '2026-10-23 04:12:55.220', '04:12:55', '2', '2', NULL, NULL, '7', 2, 'detailedCodeLength', '6');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.220', '04:12:55', '1', '2026-10-23 04:12:55.220', '04:12:55', '2', '2', NULL, NULL, '8', 2, 'totalAccountCodeLength', '6');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.226', '04:12:55', '1', '2026-10-23 04:12:55.226', '04:12:55', '2', '2', NULL, NULL, '9', 1, 'systemDate', 'Jalali');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.226', '04:12:55', '1', '2026-10-23 04:12:55.226', '04:12:55', '2', '2', NULL, NULL, '10', 1, 'enable2StepLogin', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.226', '04:12:55', '1', '2026-10-23 04:12:55.226', '04:12:55', '2', '2', NULL, NULL, '11', 1, 'twoStepMethod', 'sms');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.231', '04:12:55', '1', '2026-10-23 04:12:55.231', '04:12:55', '2', '2', NULL, NULL, '12', 7, 'shareHeadquarterData', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.231', '04:12:55', '1', '2026-10-23 04:12:55.231', '04:12:55', '2', '2', NULL, NULL, '13', 7, 'activeBusinessStructures', '1,2,3,4');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.258', '04:12:55', '1', '2026-10-23 04:12:55.258', '04:12:55', '2', '2', NULL, NULL, '14', 3, 'itemCodeLength', '10');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.258', '04:12:55', '1', '2026-10-23 04:12:55.258', '04:12:55', '2', '2', NULL, NULL, '15', 3, 'isItemCodeLengthFixed', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.258', '04:12:55', '1', '2026-10-23 04:12:55.258', '04:12:55', '2', '2', NULL, NULL, '16', 3, 'allowItemCodeLetters', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.258', '04:12:55', '1', '2026-10-23 04:12:55.258', '04:12:55', '2', '2', NULL, NULL, '17', 3, 'isItemCodeLatin', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.258', '04:12:55', '1', '2026-10-23 04:12:55.258', '04:12:55', '2', '2', NULL, NULL, '18', 3, 'allowDuplicateItemName', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.258', '04:12:55', '1', '2026-10-23 04:12:55.258', '04:12:55', '2', '2', NULL, NULL, '19', 3, 'itemCodingMethod', '1');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.258', '04:12:55', '1', '2026-10-23 04:12:55.258', '04:12:55', '2', '2', NULL, NULL, '20', 3, 'counterStart', '1');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.258', '04:12:55', '1', '2026-10-23 04:12:55.258', '04:12:55', '2', '2', NULL, NULL, '21', 3, 'totalProductServiceGroupLength', '6');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.258', '04:12:55', '1', '2026-10-23 04:12:55.258', '04:12:55', '2', '2', NULL, NULL, '22', 3, 'mainBranchLength', '2');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.258', '04:12:55', '1', '2026-10-23 04:12:55.258', '04:12:55', '2', '2', NULL, NULL, '23', 3, 'level1BranchLength', '2');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.258', '04:12:55', '1', '2026-10-23 04:12:55.258', '04:12:55', '2', '2', NULL, NULL, '24', 3, 'level2BranchLength', '2');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.258', '04:12:55', '1', '2026-10-23 04:12:55.258', '04:12:55', '2', '2', NULL, NULL, '25', 3, 'level3BranchLength', '0');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.258', '04:12:55', '1', '2026-10-23 04:12:55.258', '04:12:55', '2', '2', NULL, NULL, '26', 3, 'level4BranchLength', '0');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.258', '04:12:55', '1', '2026-10-23 04:12:55.258', '04:12:55', '2', '2', NULL, NULL, '27', 3, 'level5BranchLength', '0');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.258', '04:12:55', '1', '2026-10-23 04:12:55.258', '04:12:55', '2', '2', NULL, NULL, '28', 3, 'trackingFactorLevelsCount', '20');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.258', '04:12:55', '1', '2026-10-23 04:12:55.258', '04:12:55', '2', '2', NULL, NULL, '29', 3, 'isTrackingFactorActiveInWarehouse', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.258', '04:12:55', '1', '2026-10-23 04:12:55.258', '04:12:55', '2', '2', NULL, NULL, '30', 3, 'isTrackingFactorActiveInItemRequest', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.258', '04:12:55', '1', '2026-10-23 04:12:55.258', '04:12:55', '2', '2', NULL, NULL, '31', 3, 'isTrackingFactorActiveInItemSupplyRequest', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.258', '04:12:55', '1', '2026-10-23 04:12:55.258', '04:12:55', '2', '2', NULL, NULL, '32', 3, 'isTrackingFactorActiveInPurchaseInvoice', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.258', '04:12:55', '1', '2026-10-23 04:12:55.258', '04:12:55', '2', '2', NULL, NULL, '33', 3, 'isTrackingFactorActiveInTemporaryReceipt', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.293', '04:12:55', '1', '2026-10-23 04:12:55.293', '04:12:55', '2', '2', NULL, NULL, '34', 4, 'isWalletActive', 'true');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.621', '04:12:55', '1', '2026-10-23 04:12:55.621', '04:12:55', '3', '3', NULL, NULL, '35', 2, 'detailedLevelsCount', '10');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.621', '04:12:55', '1', '2026-10-23 04:12:55.621', '04:12:55', '3', '3', NULL, NULL, '36', 2, 'showTrackingColumnsInVoucher', 'true');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.621', '04:12:55', '1', '2026-10-23 04:12:55.621', '04:12:55', '3', '3', NULL, NULL, '37', 2, 'requireTrackingInfoIfEnabled', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.621', '04:12:55', '1', '2026-10-23 04:12:55.621', '04:12:55', '3', '3', NULL, NULL, '38', 2, 'showCurrencyColumnsInVoucher', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.621', '04:12:55', '1', '2026-10-23 04:12:55.621', '04:12:55', '3', '3', NULL, NULL, '39', 2, 'enableLedgerAccessControl', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.621', '04:12:55', '1', '2026-10-23 04:12:55.621', '04:12:55', '3', '3', NULL, NULL, '40', 2, 'defaultCurrency', 'ریال');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.621', '04:12:55', '1', '2026-10-23 04:12:55.621', '04:12:55', '3', '3', NULL, NULL, '41', 2, 'detailedCodeLength', '6');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.621', '04:12:55', '1', '2026-10-23 04:12:55.621', '04:12:55', '3', '3', NULL, NULL, '42', 2, 'totalAccountCodeLength', '6');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.629', '04:12:55', '1', '2026-10-23 04:12:55.629', '04:12:55', '3', '3', NULL, NULL, '43', 1, 'systemDate', 'Jalali');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.629', '04:12:55', '1', '2026-10-23 04:12:55.629', '04:12:55', '3', '3', NULL, NULL, '44', 1, 'enable2StepLogin', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.629', '04:12:55', '1', '2026-10-23 04:12:55.629', '04:12:55', '3', '3', NULL, NULL, '45', 1, 'twoStepMethod', 'sms');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.633', '04:12:55', '1', '2026-10-23 04:12:55.633', '04:12:55', '3', '3', NULL, NULL, '46', 7, 'shareHeadquarterData', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.633', '04:12:55', '1', '2026-10-23 04:12:55.633', '04:12:55', '3', '3', NULL, NULL, '47', 7, 'activeBusinessStructures', '1,2,3,4');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.662', '04:12:55', '1', '2026-10-23 04:12:55.662', '04:12:55', '3', '3', NULL, NULL, '48', 3, 'itemCodeLength', '10');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.662', '04:12:55', '1', '2026-10-23 04:12:55.662', '04:12:55', '3', '3', NULL, NULL, '49', 3, 'isItemCodeLengthFixed', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.662', '04:12:55', '1', '2026-10-23 04:12:55.662', '04:12:55', '3', '3', NULL, NULL, '50', 3, 'allowItemCodeLetters', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.662', '04:12:55', '1', '2026-10-23 04:12:55.662', '04:12:55', '3', '3', NULL, NULL, '51', 3, 'isItemCodeLatin', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.662', '04:12:55', '1', '2026-10-23 04:12:55.662', '04:12:55', '3', '3', NULL, NULL, '52', 3, 'allowDuplicateItemName', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.662', '04:12:55', '1', '2026-10-23 04:12:55.662', '04:12:55', '3', '3', NULL, NULL, '53', 3, 'itemCodingMethod', '1');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.662', '04:12:55', '1', '2026-10-23 04:12:55.662', '04:12:55', '3', '3', NULL, NULL, '54', 3, 'counterStart', '1');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.662', '04:12:55', '1', '2026-10-23 04:12:55.662', '04:12:55', '3', '3', NULL, NULL, '55', 3, 'totalProductServiceGroupLength', '6');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.662', '04:12:55', '1', '2026-10-23 04:12:55.662', '04:12:55', '3', '3', NULL, NULL, '56', 3, 'mainBranchLength', '2');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.662', '04:12:55', '1', '2026-10-23 04:12:55.662', '04:12:55', '3', '3', NULL, NULL, '57', 3, 'level1BranchLength', '2');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.662', '04:12:55', '1', '2026-10-23 04:12:55.662', '04:12:55', '3', '3', NULL, NULL, '58', 3, 'level2BranchLength', '2');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.662', '04:12:55', '1', '2026-10-23 04:12:55.662', '04:12:55', '3', '3', NULL, NULL, '59', 3, 'level3BranchLength', '0');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.662', '04:12:55', '1', '2026-10-23 04:12:55.662', '04:12:55', '3', '3', NULL, NULL, '60', 3, 'level4BranchLength', '0');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.662', '04:12:55', '1', '2026-10-23 04:12:55.662', '04:12:55', '3', '3', NULL, NULL, '61', 3, 'level5BranchLength', '0');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.662', '04:12:55', '1', '2026-10-23 04:12:55.662', '04:12:55', '3', '3', NULL, NULL, '62', 3, 'trackingFactorLevelsCount', '20');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.662', '04:12:55', '1', '2026-10-23 04:12:55.662', '04:12:55', '3', '3', NULL, NULL, '63', 3, 'isTrackingFactorActiveInWarehouse', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.662', '04:12:55', '1', '2026-10-23 04:12:55.662', '04:12:55', '3', '3', NULL, NULL, '64', 3, 'isTrackingFactorActiveInItemRequest', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.662', '04:12:55', '1', '2026-10-23 04:12:55.662', '04:12:55', '3', '3', NULL, NULL, '65', 3, 'isTrackingFactorActiveInItemSupplyRequest', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.662', '04:12:55', '1', '2026-10-23 04:12:55.662', '04:12:55', '3', '3', NULL, NULL, '66', 3, 'isTrackingFactorActiveInPurchaseInvoice', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.662', '04:12:55', '1', '2026-10-23 04:12:55.662', '04:12:55', '3', '3', NULL, NULL, '67', 3, 'isTrackingFactorActiveInTemporaryReceipt', 'false');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (1, '1', '2026-10-23 04:12:55.684', '04:12:55', '1', '2026-10-23 04:12:55.684', '04:12:55', '3', '3', NULL, NULL, '68', 4, 'isWalletActive', 'true');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (2, '1', '2026-10-25 12:29:18.044', '12:29:18', '1', '2026-10-25 13:37:18.270', '13:37:18', '2', '2', NULL, NULL, '72', 4, 'showTrackingFactorInSalesProforma', 'true');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (2, '1', '2026-10-25 12:29:18.044', '12:29:18', '1', '2026-10-25 13:37:18.270', '13:37:18', '2', '2', NULL, NULL, '73', 4, 'showTrackingFactorInSalesContract', 'true');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (2, '1', '2026-10-25 12:29:18.044', '12:29:18', '1', '2026-10-25 13:37:18.270', '13:37:18', '2', '2', NULL, NULL, '74', 4, 'showTrackingFactorInSalesPermission', 'true');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (2, '1', '2026-10-25 12:29:18.044', '12:29:18', '1', '2026-10-25 13:37:18.270', '13:37:18', '2', '2', NULL, NULL, '75', 4, 'showTrackingFactorInSalesReturnInvoice', 'true');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (3, '1', '2026-10-25 12:29:18.044', '12:29:18', '1', '2026-10-25 13:37:18.270', '13:37:18', '2', '2', NULL, NULL, '70', 4, 'showTrackingFactorInSalesInvoice', 'true');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (3, '1', '2026-10-25 12:29:18.044', '12:29:18', '1', '2026-10-25 13:37:18.270', '13:37:18', '2', '2', NULL, NULL, '71', 4, 'showTrackingFactorInSalesReturnPermission', 'true');
INSERT INTO "Gnr"."BaseSettings" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BaseSettingsID", "TabRef", "Key", "Value") VALUES (5, '1', '2026-10-25 12:29:18.044', '12:29:18', '1', '2026-10-25 14:04:43.557', '14:04:43', '2', '2', NULL, NULL, '69', 4, 'showTrackingFactorInSalesOrder', 'true');

-- Data for Gnr.BusinessStructure (3 rows)
INSERT INTO "Gnr"."BusinessStructure" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BusinessStructureID", "ParentRef", "Code", "Title", "Title_En", "BusinessStructure", "BusinessStructureName", "Manager", "IsActive", "IsSystem", "LogoUrl", "IsBasicInfoShared", "ActiveStructureTypes") VALUES (1, '1', '2026-10-23 04:12:55.015', '04:12:55', '1', '2026-10-23 04:12:55.015', '04:12:55', '2', NULL, NULL, NULL, '1', '0', 'ROOT', 'ساختار سیستم', 'System Root', 1, NULL, NULL, true, true, NULL, false, NULL);
INSERT INTO "Gnr"."BusinessStructure" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BusinessStructureID", "ParentRef", "Code", "Title", "Title_En", "BusinessStructure", "BusinessStructureName", "Manager", "IsActive", "IsSystem", "LogoUrl", "IsBasicInfoShared", "ActiveStructureTypes") VALUES (1, '1', '2026-10-23 04:12:55.020', '04:12:55', '1', '2026-10-23 04:12:55.020', '04:12:55', '2', NULL, NULL, NULL, '2', '1', '01', 'دفتر مرکزی', 'Headquarters', 1, 'Headquarters', NULL, true, true, NULL, true, '1,2,3,4');
INSERT INTO "Gnr"."BusinessStructure" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BusinessStructureID", "ParentRef", "Code", "Title", "Title_En", "BusinessStructure", "BusinessStructureName", "Manager", "IsActive", "IsSystem", "LogoUrl", "IsBasicInfoShared", "ActiveStructureTypes") VALUES (1, '1', '2026-10-23 04:12:55.496', '04:12:55', '1', '2026-10-23 04:12:55.496', '04:12:55', '2', NULL, NULL, NULL, '3', '2', '01-01', 'شرکت نمونه یک', 'Sample Company One', 2, 'Sample Company', NULL, true, true, NULL, true, NULL);

-- Data for Gnr.Currency (2 rows)
INSERT INTO "Gnr"."Currency" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "CurrencyID", "Code", "Title", "Title_En", "ExchangeUnit", "PrecisionCount", "PrecisionTitle", "PrecisionTitle_En", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.032', '04:12:55', '1', '2026-10-23 04:12:55.032', '04:12:55', '2', '2', NULL, NULL, '1', 1, 'ریال ایران', 'Iranian Rial', 1, 0, 'دینار', 'Dinar', true);
INSERT INTO "Gnr"."Currency" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "CurrencyID", "Code", "Title", "Title_En", "ExchangeUnit", "PrecisionCount", "PrecisionTitle", "PrecisionTitle_En", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.041', '04:12:55', '1', '2026-10-23 04:12:55.041', '04:12:55', '2', '2', NULL, NULL, '2', 2, 'دلار آمریکا', 'US Dollar', 1, 2, 'سنت', 'Cent', true);

-- Data for Gnr.FiscalYear (1 rows)
INSERT INTO "Gnr"."FiscalYear" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "FiscalYearID", "Title", "StartDate", "EndDate", "IsActive") VALUES (1, '1', '2026-10-23 04:26:03.547', '04:30:00', '1', '2026-10-23 04:26:03.547', '04:30:00', '2', '2', NULL, NULL, '1', '1404', '2025-03-21 00:00:00.000', '2026-03-20 00:00:00.000', true);

-- Data for Gnr.GeoLocations (2 rows)
INSERT INTO "Gnr"."GeoLocations" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "GeolocationID", "ParentRef", "GeographicType", "Code", "Title", "Title_En", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.295', '00:00:00', '1', '2026-10-23 04:12:55.295', '00:00:00', '2', '2', NULL, NULL, '1', '0', 1, 'IR', 'ایران', 'Iran', true);
INSERT INTO "Gnr"."GeoLocations" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "GeolocationID", "ParentRef", "GeographicType", "Code", "Title", "Title_En", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.687', '00:00:00', '1', '2026-10-23 04:12:55.687', '00:00:00', '2', '3', NULL, NULL, '2', '0', 1, 'IR', 'ایران', 'Iran', true);

-- Data for Gnr.IDGeneration (42 rows)
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('14', 'FiscalYear', '1');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('15', 'SalesDocumentSettings', '1');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('16', 'SalesItemGroups', '3');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('3', 'Currency', '2');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('5', 'DetailedTypes', '42');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('17', 'SettlementMethods', '4');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('11', 'RecieptAndPaymentAccountingSetting', '114');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('12', 'Warehouses', '6');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('7', 'GeoLocations', '2');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('2', 'BusinessStructure', '3');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('8', 'Banks', '48');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('1', 'WarehouseDocumentTypes', '80');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('9', 'BankAccountTypes', '10');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('4', 'VoucherType', '18');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('10', 'Accounts', '2');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('23', 'Parties', '3');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('20', 'SalesTypes', '2');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('26', 'CustomerGroups', '7');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('22', 'DetailedAccounts', '9');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('29', 'Items', '6');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('31', 'WarehouseAddresses', '1');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('30', 'WarehouseProducts', '2');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('34', 'WarehouseUsers', '3');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('35', 'WarehouseVouchers', '1');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('36', 'WarehouseVouchersDetails', '1');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('37', 'WarehouseVouchersPricing', '1');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('24', 'Customers', '2');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('38', 'PurchaseSalesParameters', '1');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('27', 'MeasurementUnits', '2');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('32', 'ItemPhysicalLocations', '2');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('33', 'ItemSubUnits', '1');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('39', 'PurchaseSalesParameterValues', '1');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('21', 'DeliveryLocations', '3');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('28', 'ItemAccountCategories', '3');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('40', 'SalesCenters', '2');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('25', 'SalesChannels', '2');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('6', 'BaseSettings', '75');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('41', 'TrackingFactors', '1');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('42', 'TrackingFactorItemRelated', '1');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('18', 'SalesOrders', '14');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('19', 'SalesOrderItems', '25');
INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ('13', 'ActivityLog', '201');

-- Data for Gnr.Parties (3 rows)
INSERT INTO "Gnr"."Parties" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "PartyID", "Nature", "IsActive", "SubType", "Website", "EmailAddress", "FirstName", "LatinFirstName", "LastName", "LatinLastName", "DetailedAccountID", "EconomicCode", "NationalCode", "PassportNumber", "BirthDate", "MarriageDate", "NationalId", "RegistrationNumber", "IsSupplier", "Balance", "BalanceStatus", "IsCustomer", "CustomerBalance", "CustomerBalanceStatus", "IsSalesIntermediary", "SalesIntermediaryBalance", "SalesIntermediaryBalanceStatus") VALUES (1, '1', '2026-10-24 02:47:21.382', '02:47:21', '1', '2026-10-24 02:47:21.382', '02:47:21', '2', '2', NULL, NULL, '3', 'legal_entity', true, NULL, NULL, NULL, 'شرکت پارس داده', NULL, NULL, NULL, '3', '411223344', NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, true, NULL, NULL, false, NULL, NULL);
INSERT INTO "Gnr"."Parties" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "PartyID", "Nature", "IsActive", "SubType", "Website", "EmailAddress", "FirstName", "LatinFirstName", "LastName", "LatinLastName", "DetailedAccountID", "EconomicCode", "NationalCode", "PassportNumber", "BirthDate", "MarriageDate", "NationalId", "RegistrationNumber", "IsSupplier", "Balance", "BalanceStatus", "IsCustomer", "CustomerBalance", "CustomerBalanceStatus", "IsSalesIntermediary", "SalesIntermediaryBalance", "SalesIntermediaryBalanceStatus") VALUES (4, '1', '2026-10-24 02:14:00.760', '02:14:00', '1', '2026-10-24 09:49:00.111', '02:14:00', '2', '2', NULL, NULL, '1', 'real_person', true, NULL, NULL, NULL, 'Ghodsi', 'Ghodsi', 'Sharifi', 'Sharifi', '1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '', '', true, '', '', false, NULL, NULL);
INSERT INTO "Gnr"."Parties" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "PartyID", "Nature", "IsActive", "SubType", "Website", "EmailAddress", "FirstName", "LatinFirstName", "LastName", "LatinLastName", "DetailedAccountID", "EconomicCode", "NationalCode", "PassportNumber", "BirthDate", "MarriageDate", "NationalId", "RegistrationNumber", "IsSupplier", "Balance", "BalanceStatus", "IsCustomer", "CustomerBalance", "CustomerBalanceStatus", "IsSalesIntermediary", "SalesIntermediaryBalance", "SalesIntermediaryBalanceStatus") VALUES (2, '1', '2026-10-24 02:47:21.321', '02:47:21', '1', '2026-10-24 12:18:29.761', '02:47:21', '2', '2', NULL, NULL, '2', 'real_person', true, NULL, NULL, NULL, 'علی', NULL, 'جهانی', NULL, '2', NULL, '1234567890', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, true, NULL, NULL, false, NULL, NULL);

-- Data for Iam.User (1 rows)
INSERT INTO "Iam"."User" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "UserID", "username", "passwordHash", "firstName", "lastName", "isActive", "repeatChangePassword", "BusinessStructureID", "UserGroupRef", "refreshToken", "lastSeen", "twoFactorSecret", "isTwoFactorEnabled") VALUES (21000, '1', '2026-10-23 04:12:54.958', '04:12:54', '1', '2026-10-25 17:32:47.958', '04:12:54', '2', '2', NULL, NULL, '1', 'admin', '$2a$12$cv1x6..1PRuxod8tbCfqBuLXCYugySC0SIuvkuy5SI9FDZo9GNADS', 'مدیر', 'سیستم', true, 0, NULL, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwic3ViIjoxLCJmaXJzdE5hbWUiOiLZhdiv24zYsSIsImxhc3ROYW1lIjoi2LPbjNiz2KrZhSIsInBlcm1pc3Npb25zIjpbIioiXSwiaWF0IjoxNzkyOTQ5MTE3LCJleHAiOjE3OTM1NTM5MTd9.kTq7KzbqvecLMj9KlbMxa-gQLuP-qYN5FM5OCd_8xD4', '2026-10-25 17:32:47.957', NULL, false);

-- Data for Inv.ItemAccountCategories (1 rows)
INSERT INTO "Inv"."ItemAccountCategories" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "ItemAccountCategoryID", "ItemAccountCategoryCode", "ItemAccountCategoryName", "ItemAccountCategoryName2", "PricingMethod", "StandardRate", "IsActive", "InventorySlAccountRef", "IndividualPurchaseSlAccountRef", "CorporatePurchaseSlAccountRef", "FreightSlAccountRef", "SuspensePurchaseSlAccountRef", "ForeignPurchaseSlAccountRef", "ScrapExpenseSlAccountRef", "ConsignmentOursSlAccountRef", "ConsignmentOthersSlAccountRef", "ConsignmentOffsetSlAccountRef", "IndividualPrepaymentSlAccountRef", "CorporatePrepaymentSlAccountRef", "ScrapIncomeSlAccountRef") VALUES (2, '1', '2026-10-24 13:15:00.581', '13:15:00', '1', '2026-10-24 13:15:06.460', '13:15:00', '2', '2', NULL, NULL, '3', 1, 'طبقه مواداولیه', 'طبقه مواداولیه', 1, 2, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- Data for Inv.ItemPhysicalLocations (1 rows)
INSERT INTO "Inv"."ItemPhysicalLocations" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "ItemPhysicalLocationID", "ItemRef", "WarehouseRef", "IsDefault") VALUES (1, '1', '2026-10-24 20:09:15.905', '00:00:00', '1', '2026-10-24 20:09:15.905', '00:00:00', '2', '2', NULL, NULL, '2', '6', '2', true);

-- Data for Inv.ItemSubUnits (1 rows)
INSERT INTO "Inv"."ItemSubUnits" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "ItemSubUnitID", "ItemRef", "SubUnitRef", "MainToSubRatio", "IsVariableRatio", "TolerancePercent") VALUES (1, '1', '2026-10-24 20:09:15.908', '00:00:00', '1', '2026-10-24 20:09:15.908', '00:00:00', '2', '2', NULL, NULL, '1', '6', '2', '50.0000', 1, '5.0000');

-- Data for Inv.Items (1 rows)
INSERT INTO "Inv"."Items" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "ItemID", "ItemType", "ItemCode", "ItemName", "ItemName2", "MeasurementUnitRef", "TechnicalSpecification", "DetailedAccountCode", "TaxRate", "DutyRate", "IranCode", "ItemAccountCategoryRef", "PricingMethod", "TaxAndDutyExemption", "IsSalable", "IsActive") VALUES (3, '1', '2026-10-24 15:55:28.512', '15:55:28', '1', '2026-10-24 20:09:15.899', '15:55:28', '2', '2', NULL, NULL, '6', 1, 1, 'نشاسته', 'نشاسته', '1', '', '', '0.0000', '0.0000', '', '3', 1, 1, true, true);

-- Data for Inv.MeasurementUnits (2 rows)
INSERT INTO "Inv"."MeasurementUnits" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "MeasurementUnitID", "MeasurementUnitCode", "MeasurementUnitName", "MeasurementUnitName2", "IsActive") VALUES (1, '1', '2026-10-24 13:07:45.619', '13:07:45', '1', '2026-10-24 13:07:45.619', '13:07:45', '2', '2', NULL, NULL, '1', 1, 'عدد', '', true);
INSERT INTO "Inv"."MeasurementUnits" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "MeasurementUnitID", "MeasurementUnitCode", "MeasurementUnitName", "MeasurementUnitName2", "IsActive") VALUES (1, '1', '2026-10-24 20:03:32.196', '20:03:32', '1', '2026-10-24 20:03:32.196', '20:03:32', '2', '2', NULL, NULL, '2', 2, 'بسته', '', true);

-- Data for Inv.TrackingFactorItemRelated (1 rows)
INSERT INTO "Inv"."TrackingFactorItemRelated" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "TrackingFactorItemRelatedID", "TrackingFactorRef", "ItemRef") VALUES (1, '1', '2026-10-25 13:54:23.258', '13:54:23', '1', '2026-10-25 13:54:23.258', '13:54:23', '2', '2', NULL, NULL, '1', '1', '6');

-- Data for Inv.TrackingFactors (1 rows)
INSERT INTO "Inv"."TrackingFactors" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "TrackingFactorID", "TrackingFactorCode", "TrackingFactorName", "TrackingFactorName2", "TrackingFactorType", "StartValue", "EndValue", "IsConstantValue", "DisplayPriority", "IsActive") VALUES (1, '1', '2026-10-25 13:54:23.251', '13:54:23', '1', '2026-10-25 13:54:23.251', '13:54:23', '2', '2', NULL, NULL, '1', '1', 'شماره سریال تست', 'Serial No Test', 6, NULL, NULL, false, 1, true);

-- Data for Inv.WarehouseAddresses (1 rows)
INSERT INTO "Inv"."WarehouseAddresses" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseAddressID", "WarehouseRef", "AddressState", "AddressCity", "AddressTitle", "AddressTitle2", "PostalCode", "Longitude", "Latitude") VALUES (1, '1', '2026-10-24 16:23:47.248', '16:23:47', '1', '2026-10-24 16:23:47.362', '16:23:47', '2', '2', NULL, NULL, '1', '1', '', '', '', '', '', '', '');

-- Data for Inv.WarehouseDocumentTypes (80 rows)
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:54.977', '00:00:00', '1', '2026-10-23 04:12:54.977', '00:00:00', '2', '2', NULL, NULL, '1', 1, 'موجودی ابتدای دوره', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:54.987', '00:00:00', '1', '2026-10-23 04:12:54.987', '00:00:00', '2', '2', NULL, NULL, '3', 3, 'رسید موقت', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:54.989', '00:00:00', '1', '2026-10-23 04:12:54.989', '00:00:00', '2', '2', NULL, NULL, '4', 4, 'دریافت از تولید', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:54.994', '00:00:00', '1', '2026-10-23 04:12:54.994', '00:00:00', '2', '2', NULL, NULL, '5', 5, 'برگشت از مصرف مرکز', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:54.998', '00:00:00', '1', '2026-10-23 04:12:54.998', '00:00:00', '2', '2', NULL, NULL, '6', 7, 'برگشت از مصرف پروژه', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.002', '00:00:00', '1', '2026-10-23 04:12:55.002', '00:00:00', '2', '2', NULL, NULL, '7', 12, 'اضافی انبارگردانی', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.004', '00:00:00', '1', '2026-10-23 04:12:55.004', '00:00:00', '2', '2', NULL, NULL, '8', 16, 'رسید برگشت از ضایعات', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.008', '00:00:00', '1', '2026-10-23 04:12:55.008', '00:00:00', '2', '2', NULL, NULL, '9', 17, 'رسید انتقال بین انبارها', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.010', '00:00:00', '1', '2026-10-23 04:12:55.010', '00:00:00', '2', '2', NULL, NULL, '10', 18, 'برگشت از فروش', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.013', '00:00:00', '1', '2026-10-23 04:12:55.013', '00:00:00', '2', '2', NULL, NULL, '11', 19, 'رسید تبدیل کالا', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.017', '00:00:00', '1', '2026-10-23 04:12:55.017', '00:00:00', '2', '2', NULL, NULL, '12', 20, 'برگشت از تولید', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.020', '00:00:00', '1', '2026-10-23 04:12:55.020', '00:00:00', '2', '2', NULL, NULL, '13', 22, 'دریافت از پروژه', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.024', '00:00:00', '1', '2026-10-23 04:12:55.024', '00:00:00', '2', '2', NULL, NULL, '14', 23, 'دریافت امانی دیگران نزد ما', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.029', '00:00:00', '1', '2026-10-23 04:12:55.029', '00:00:00', '2', '2', NULL, NULL, '15', 24, 'برگشت امانی ما نزد دیگران', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.032', '00:00:00', '1', '2026-10-23 04:12:55.032', '00:00:00', '2', '2', NULL, NULL, '16', 25, 'رسید تغییر عامل کنترل موجودی', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.036', '00:00:00', '1', '2026-10-23 04:12:55.036', '00:00:00', '2', '2', NULL, NULL, '17', 26, 'مرجوعی از فروش جهت اصلاح', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.039', '00:00:00', '1', '2026-10-23 04:12:55.039', '00:00:00', '2', '2', NULL, NULL, '18', 51, 'مصرف مرکز', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.042', '00:00:00', '1', '2026-10-23 04:12:55.042', '00:00:00', '2', '2', NULL, NULL, '19', 52, 'مرجوعی به تولید', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.045', '00:00:00', '1', '2026-10-23 04:12:55.045', '00:00:00', '2', '2', NULL, NULL, '20', 53, 'مصرف پروژه', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.049', '00:00:00', '1', '2026-10-23 04:12:55.049', '00:00:00', '2', '2', NULL, NULL, '21', 55, 'برگشت به خرید داخلی', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.052', '00:00:00', '1', '2026-10-23 04:12:55.052', '00:00:00', '2', '2', NULL, NULL, '22', 57, 'ارسال به تولید', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.055', '00:00:00', '1', '2026-10-23 04:12:55.055', '00:00:00', '2', '2', NULL, NULL, '23', 62, 'کسری انبارگردانی', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.064', '00:00:00', '1', '2026-10-23 04:12:55.064', '00:00:00', '2', '2', NULL, NULL, '24', 64, 'برگشت به خرید خارجی', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.085', '00:00:00', '1', '2026-10-23 04:12:55.085', '00:00:00', '2', '2', NULL, NULL, '25', 66, 'تحویل ضایعات', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.089', '00:00:00', '1', '2026-10-23 04:12:55.089', '00:00:00', '2', '2', NULL, NULL, '26', 68, 'حواله انتقال بین انبارها', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.092', '00:00:00', '1', '2026-10-23 04:12:55.092', '00:00:00', '2', '2', NULL, NULL, '27', 69, 'تحویل فروش', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.094', '00:00:00', '1', '2026-10-23 04:12:55.094', '00:00:00', '2', '2', NULL, NULL, '28', 70, 'حواله تبدیل کالا', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.097', '00:00:00', '1', '2026-10-23 04:12:55.097', '00:00:00', '2', '2', NULL, NULL, '29', 71, 'تحویل دارایی ثابت', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.099', '00:00:00', '1', '2026-10-23 04:12:55.099', '00:00:00', '2', '2', NULL, NULL, '30', 72, 'مرجوعی به پروژه', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.102', '00:00:00', '1', '2026-10-23 04:12:55.102', '00:00:00', '2', '2', NULL, NULL, '31', 73, 'ارسال امانی ما نزد دیگران', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.105', '00:00:00', '1', '2026-10-23 04:12:55.105', '00:00:00', '2', '2', NULL, NULL, '32', 74, 'برگشت امانی دیگران نزد ما', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.110', '00:00:00', '1', '2026-10-23 04:12:55.110', '00:00:00', '2', '2', NULL, NULL, '33', 75, 'حواله تغییر عامل کنترل موجودی', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.114', '00:00:00', '1', '2026-10-23 04:12:55.114', '00:00:00', '2', '2', NULL, NULL, '34', 79, 'تخفیفات و جوایز جنسی', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.118', '00:00:00', '1', '2026-10-23 04:12:55.118', '00:00:00', '2', '2', NULL, NULL, '35', 100, 'امحاء / ضایعات', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.121', '00:00:00', '1', '2026-10-23 04:12:55.121', '00:00:00', '2', '2', NULL, NULL, '36', 9999, 'فاکتور خرید کالا', NULL, 3, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.123', '00:00:00', '1', '2026-10-23 04:12:55.123', '00:00:00', '2', '2', NULL, NULL, '37', 9998, 'درخواست تامین کالا', NULL, 3, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.126', '00:00:00', '1', '2026-10-23 04:12:55.126', '00:00:00', '2', '2', NULL, NULL, '38', 9997, 'درخواست کالا', NULL, 3, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.129', '00:00:00', '1', '2026-10-23 04:12:55.129', '00:00:00', '2', '2', NULL, NULL, '39', 9996, 'رسید موقت', NULL, 3, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.131', '00:00:00', '1', '2026-10-23 04:12:55.131', '00:00:00', '2', '2', NULL, NULL, '40', 9995, 'شمارش انبارگردانی', NULL, 3, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.838', '00:00:00', '1', '2026-10-23 04:12:55.838', '00:00:00', '2', '3', NULL, NULL, '41', 1, 'موجودی ابتدای دوره', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.839', '00:00:00', '1', '2026-10-23 04:12:55.839', '00:00:00', '2', '3', NULL, NULL, '42', 2, 'رسید خرید', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.840', '00:00:00', '1', '2026-10-23 04:12:55.840', '00:00:00', '2', '3', NULL, NULL, '43', 3, 'رسید موقت', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.842', '00:00:00', '1', '2026-10-23 04:12:55.842', '00:00:00', '2', '3', NULL, NULL, '44', 4, 'دریافت از تولید', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.843', '00:00:00', '1', '2026-10-23 04:12:55.843', '00:00:00', '2', '3', NULL, NULL, '45', 5, 'برگشت از مصرف مرکز', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.845', '00:00:00', '1', '2026-10-23 04:12:55.845', '00:00:00', '2', '3', NULL, NULL, '46', 7, 'برگشت از مصرف پروژه', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.847', '00:00:00', '1', '2026-10-23 04:12:55.847', '00:00:00', '2', '3', NULL, NULL, '47', 12, 'اضافی انبارگردانی', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.848', '00:00:00', '1', '2026-10-23 04:12:55.848', '00:00:00', '2', '3', NULL, NULL, '48', 16, 'رسید برگشت از ضایعات', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.849', '00:00:00', '1', '2026-10-23 04:12:55.849', '00:00:00', '2', '3', NULL, NULL, '49', 17, 'رسید انتقال بین انبارها', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.851', '00:00:00', '1', '2026-10-23 04:12:55.851', '00:00:00', '2', '3', NULL, NULL, '50', 18, 'برگشت از فروش', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.853', '00:00:00', '1', '2026-10-23 04:12:55.853', '00:00:00', '2', '3', NULL, NULL, '51', 19, 'رسید تبدیل کالا', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.854', '00:00:00', '1', '2026-10-23 04:12:55.854', '00:00:00', '2', '3', NULL, NULL, '52', 20, 'برگشت از تولید', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.856', '00:00:00', '1', '2026-10-23 04:12:55.856', '00:00:00', '2', '3', NULL, NULL, '53', 22, 'دریافت از پروژه', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.857', '00:00:00', '1', '2026-10-23 04:12:55.857', '00:00:00', '2', '3', NULL, NULL, '54', 23, 'دریافت امانی دیگران نزد ما', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.859', '00:00:00', '1', '2026-10-23 04:12:55.859', '00:00:00', '2', '3', NULL, NULL, '55', 24, 'برگشت امانی ما نزد دیگران', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.884', '00:00:00', '1', '2026-10-23 04:12:55.884', '00:00:00', '2', '3', NULL, NULL, '56', 25, 'رسید تغییر عامل کنترل موجودی', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.887', '00:00:00', '1', '2026-10-23 04:12:55.887', '00:00:00', '2', '3', NULL, NULL, '57', 26, 'مرجوعی از فروش جهت اصلاح', NULL, 1, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.890', '00:00:00', '1', '2026-10-23 04:12:55.890', '00:00:00', '2', '3', NULL, NULL, '58', 51, 'مصرف مرکز', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.891', '00:00:00', '1', '2026-10-23 04:12:55.891', '00:00:00', '2', '3', NULL, NULL, '59', 52, 'مرجوعی به تولید', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.893', '00:00:00', '1', '2026-10-23 04:12:55.893', '00:00:00', '2', '3', NULL, NULL, '60', 53, 'مصرف پروژه', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.894', '00:00:00', '1', '2026-10-23 04:12:55.894', '00:00:00', '2', '3', NULL, NULL, '61', 55, 'برگشت به خرید داخلی', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.897', '00:00:00', '1', '2026-10-23 04:12:55.897', '00:00:00', '2', '3', NULL, NULL, '62', 57, 'ارسال به تولید', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.899', '00:00:00', '1', '2026-10-23 04:12:55.899', '00:00:00', '2', '3', NULL, NULL, '63', 62, 'کسری انبارگردانی', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.900', '00:00:00', '1', '2026-10-23 04:12:55.900', '00:00:00', '2', '3', NULL, NULL, '64', 64, 'برگشت به خرید خارجی', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.902', '00:00:00', '1', '2026-10-23 04:12:55.902', '00:00:00', '2', '3', NULL, NULL, '65', 66, 'تحویل ضایعات', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.941', '00:00:00', '1', '2026-10-23 04:12:55.941', '00:00:00', '2', '3', NULL, NULL, '66', 68, 'حواله انتقال بین انبارها', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.948', '00:00:00', '1', '2026-10-23 04:12:55.948', '00:00:00', '2', '3', NULL, NULL, '67', 69, 'تحویل فروش', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.953', '00:00:00', '1', '2026-10-23 04:12:55.953', '00:00:00', '2', '3', NULL, NULL, '68', 70, 'حواله تبدیل کالا', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.962', '00:00:00', '1', '2026-10-23 04:12:55.962', '00:00:00', '2', '3', NULL, NULL, '69', 71, 'تحویل دارایی ثابت', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.992', '00:00:00', '1', '2026-10-23 04:12:55.992', '00:00:00', '2', '3', NULL, NULL, '70', 72, 'مرجوعی به پروژه', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.993', '00:00:00', '1', '2026-10-23 04:12:55.993', '00:00:00', '2', '3', NULL, NULL, '71', 73, 'ارسال امانی ما نزد دیگران', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.995', '00:00:00', '1', '2026-10-23 04:12:55.995', '00:00:00', '2', '3', NULL, NULL, '72', 74, 'برگشت امانی دیگران نزد ما', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.997', '00:00:00', '1', '2026-10-23 04:12:55.997', '00:00:00', '2', '3', NULL, NULL, '73', 75, 'حواله تغییر عامل کنترل موجودی', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.998', '00:00:00', '1', '2026-10-23 04:12:55.998', '00:00:00', '2', '3', NULL, NULL, '74', 79, 'تخفیفات و جوایز جنسی', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.999', '00:00:00', '1', '2026-10-23 04:12:55.999', '00:00:00', '2', '3', NULL, NULL, '75', 100, 'امحاء / ضایعات', NULL, 2, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:56.001', '00:00:00', '1', '2026-10-23 04:12:56.001', '00:00:00', '2', '3', NULL, NULL, '76', 9999, 'فاکتور خرید کالا', NULL, 3, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:56.002', '00:00:00', '1', '2026-10-23 04:12:56.002', '00:00:00', '2', '3', NULL, NULL, '77', 9998, 'درخواست تامین کالا', NULL, 3, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:56.003', '00:00:00', '1', '2026-10-23 04:12:56.003', '00:00:00', '2', '3', NULL, NULL, '78', 9997, 'درخواست کالا', NULL, 3, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:56.005', '00:00:00', '1', '2026-10-23 04:12:56.005', '00:00:00', '2', '3', NULL, NULL, '79', 9996, 'رسید موقت', NULL, 3, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (1, '1', '2026-10-23 04:12:56.007', '00:00:00', '1', '2026-10-23 04:12:56.007', '00:00:00', '2', '3', NULL, NULL, '80', 9995, 'شمارش انبارگردانی', NULL, 3, false, NULL, 'انبار اصلی', NULL, NULL, '[1,2,3]', false, false, true);
INSERT INTO "Inv"."WarehouseDocumentTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseDocumentTypeID", "WarehouseDocumentTypeCode", "WarehouseDocumentTypeTitle", "WarehouseDocumentTypeTitle2", "WarehouseDocumentNature", "HasBaseDocument", "BaseDocumentTypeRefs", "WarehouseName", "DetailedName", "RelatedDetailedTypeRefs", "DisplayableItemNatures", "ShowPurchaseSalesParameters", "HasAccountingDocument", "IsActive") VALUES (2, '1', '2026-10-23 04:12:54.984', '00:00:00', '1', '2026-10-24 20:15:38.345', '20:15:38', '2', '2', NULL, NULL, '2', 2, 'رسید خرید', NULL, 1, true, '[{"id":0,"code":0,"title":"بدون مبنا","natureLabel":"-"},{"id":3,"code":3,"title":"رسید موقت","natureLabel":"افزاینده"},{"id":36,"code":9999,"title":"فاکتور خرید کالا","natureLabel":"خنثی"}]', 'انبار تحویل گیرنده', 'تامین کننده', '[{"id":6,"code":"6","title":"اشخاص حقیقی"},{"id":7,"code":"7","title":"اشخاص حقوقی"}]', '[1,2,3]', true, true, true);

-- Data for Inv.WarehouseVouchers (1 rows)
INSERT INTO "Inv"."WarehouseVouchers" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseReceiptID", "BaseType", "WarehouseDocumentTypeRef", "WarehouseRef", "WarehouseName", "TemporaryReceiptRef", "SupplyRequestRef", "PurchaseInvoiceRef", "SupplierRef", "SupplierName", "ReceiptNumber", "ReceiptDate", "BaseDocumentNumber", "Status", "CurrencyRef", "Description", "FiscalYearRef") VALUES (1, '1', '2026-10-25 05:34:38.113', '05:34:38', '1', '2026-10-25 05:34:38.113', '05:34:38', '2', '2', NULL, NULL, '1', 1, '2', '2', 'انبار مواد اولیه', NULL, NULL, NULL, '3', 'شرکت پارس داده', '1', '2026-10-25 05:34:38.111', NULL, 2, 1, NULL, '1');

-- Data for Inv.WarehouseVouchersDetails (1 rows)
INSERT INTO "Inv"."WarehouseVouchersDetails" ("WarehouseReceiptDetailID", "WarehouseReceiptRef", "RowNo", "ItemRef", "WarehouseRef", "BaseNumber", "UnitName", "UnitType", "Quantity", "UnitPrice", "Discount", "TotalPrice", "Description", "TrackingFactorValues") VALUES ('1', '1', 1, '6', '2', NULL, 'بسته', 2, '1.0000', '0.0000', '0.0000', '0.0000', NULL, NULL);

-- Data for Inv.WarehouseVouchersPricing (1 rows)
INSERT INTO "Inv"."WarehouseVouchersPricing" ("WarehouseVouchersPricingID", "PricingType", "WarehouseVoucherRef", "WarehouseVoucherDetailRef", "ItemRef", "UnitPrice", "Additions", "Deductions", "NetPrice", "Description", "businessStructureRef", "companyRef", "FiscalYearRef", "creator", "createTime", "lastModifier", "lastModificationTime") VALUES ('1', 1, '1', '1', '6', '0.0000', '0.0000', '0.0000', '0.0000', NULL, '2', '2', '1', '1', '05:34:38', '1', '05:34:38');

-- Data for Inv.Warehouses (6 rows)
INSERT INTO "Inv"."Warehouses" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseID", "WarehouseType", "WarehouseCode", "WarehouseTitle", "WarehouseTitle2", "WarehouseNature", "Phone", "DetailedAccountRef", "IsActive", "ParentRef", "AddressState", "AddressCity", "AddressTitle", "AddressTitle2", "PostalCode", "Longitude", "Latitude", "WarehouseKeeperRef") VALUES (1, '1', '2026-10-23 04:12:55.458', '00:00:00', '1', '2026-10-23 04:12:55.458', '00:00:00', '2', '2', NULL, NULL, '1', 1, '1', 'انبار', NULL, 1, NULL, NULL, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Inv"."Warehouses" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseID", "WarehouseType", "WarehouseCode", "WarehouseTitle", "WarehouseTitle2", "WarehouseNature", "Phone", "DetailedAccountRef", "IsActive", "ParentRef", "AddressState", "AddressCity", "AddressTitle", "AddressTitle2", "PostalCode", "Longitude", "Latitude", "WarehouseKeeperRef") VALUES (1, '1', '2026-10-23 04:12:55.459', '00:00:00', '1', '2026-10-23 04:12:55.459', '00:00:00', '2', '2', NULL, NULL, '2', 1, '2', 'انبار مواد اولیه', NULL, 1, NULL, NULL, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Inv"."Warehouses" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseID", "WarehouseType", "WarehouseCode", "WarehouseTitle", "WarehouseTitle2", "WarehouseNature", "Phone", "DetailedAccountRef", "IsActive", "ParentRef", "AddressState", "AddressCity", "AddressTitle", "AddressTitle2", "PostalCode", "Longitude", "Latitude", "WarehouseKeeperRef") VALUES (1, '1', '2026-10-23 04:12:55.834', '00:00:00', '1', '2026-10-23 04:12:55.834', '00:00:00', '2', '3', NULL, NULL, '4', 1, '1', 'انبار', NULL, 1, NULL, NULL, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Inv"."Warehouses" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseID", "WarehouseType", "WarehouseCode", "WarehouseTitle", "WarehouseTitle2", "WarehouseNature", "Phone", "DetailedAccountRef", "IsActive", "ParentRef", "AddressState", "AddressCity", "AddressTitle", "AddressTitle2", "PostalCode", "Longitude", "Latitude", "WarehouseKeeperRef") VALUES (1, '1', '2026-10-23 04:12:55.835', '00:00:00', '1', '2026-10-23 04:12:55.835', '00:00:00', '2', '3', NULL, NULL, '5', 1, '2', 'انبار مواد اولیه', NULL, 1, NULL, NULL, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Inv"."Warehouses" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseID", "WarehouseType", "WarehouseCode", "WarehouseTitle", "WarehouseTitle2", "WarehouseNature", "Phone", "DetailedAccountRef", "IsActive", "ParentRef", "AddressState", "AddressCity", "AddressTitle", "AddressTitle2", "PostalCode", "Longitude", "Latitude", "WarehouseKeeperRef") VALUES (1, '1', '2026-10-23 04:12:55.836', '00:00:00', '1', '2026-10-23 04:12:55.836', '00:00:00', '2', '3', NULL, NULL, '6', 1, '3', 'انبار نیمه ساخته', NULL, 2, NULL, NULL, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Inv"."Warehouses" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "WarehouseID", "WarehouseType", "WarehouseCode", "WarehouseTitle", "WarehouseTitle2", "WarehouseNature", "Phone", "DetailedAccountRef", "IsActive", "ParentRef", "AddressState", "AddressCity", "AddressTitle", "AddressTitle2", "PostalCode", "Longitude", "Latitude", "WarehouseKeeperRef") VALUES (2, '1', '2026-10-23 04:12:55.461', '00:00:00', '1', '2026-10-25 00:34:43.956', '00:34:43', '2', '2', NULL, NULL, '3', 1, '3', 'انبار نیمه ساخته', NULL, 1, NULL, NULL, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- Data for Rap.BankAccountTypes (10 rows)
INSERT INTO "Rap"."BankAccountTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankAccountTypeID", "Code", "Title", "LatinTitle", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.333', '00:00:00', '1', '2026-10-23 04:12:55.333', '00:00:00', '2', '2', NULL, NULL, '1', '1', 'جاری', 'Current', true);
INSERT INTO "Rap"."BankAccountTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankAccountTypeID", "Code", "Title", "LatinTitle", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.335', '00:00:00', '1', '2026-10-23 04:12:55.335', '00:00:00', '2', '2', NULL, NULL, '2', '2', 'پس انداز', 'Savings', true);
INSERT INTO "Rap"."BankAccountTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankAccountTypeID", "Code", "Title", "LatinTitle", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.336', '00:00:00', '1', '2026-10-23 04:12:55.336', '00:00:00', '2', '2', NULL, NULL, '3', '3', 'کوتاه مدت', 'Short Term', true);
INSERT INTO "Rap"."BankAccountTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankAccountTypeID", "Code", "Title", "LatinTitle", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.338', '00:00:00', '1', '2026-10-23 04:12:55.338', '00:00:00', '2', '2', NULL, NULL, '4', '4', 'بلند مدت', 'Long Term', true);
INSERT INTO "Rap"."BankAccountTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankAccountTypeID", "Code", "Title", "LatinTitle", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.339', '00:00:00', '1', '2026-10-23 04:12:55.339', '00:00:00', '2', '2', NULL, NULL, '5', '5', 'ارزی', 'Foreign Currency', true);
INSERT INTO "Rap"."BankAccountTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankAccountTypeID", "Code", "Title", "LatinTitle", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.734', '00:00:00', '1', '2026-10-23 04:12:55.734', '00:00:00', '2', '3', NULL, NULL, '6', '1', 'جاری', 'Current', true);
INSERT INTO "Rap"."BankAccountTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankAccountTypeID", "Code", "Title", "LatinTitle", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.735', '00:00:00', '1', '2026-10-23 04:12:55.735', '00:00:00', '2', '3', NULL, NULL, '7', '2', 'پس انداز', 'Savings', true);
INSERT INTO "Rap"."BankAccountTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankAccountTypeID", "Code", "Title", "LatinTitle", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.736', '00:00:00', '1', '2026-10-23 04:12:55.736', '00:00:00', '2', '3', NULL, NULL, '8', '3', 'کوتاه مدت', 'Short Term', true);
INSERT INTO "Rap"."BankAccountTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankAccountTypeID", "Code", "Title", "LatinTitle", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.737', '00:00:00', '1', '2026-10-23 04:12:55.737', '00:00:00', '2', '3', NULL, NULL, '9', '4', 'بلند مدت', 'Long Term', true);
INSERT INTO "Rap"."BankAccountTypes" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankAccountTypeID", "Code", "Title", "LatinTitle", "IsActive") VALUES (1, '1', '2026-10-23 04:12:55.738', '00:00:00', '1', '2026-10-23 04:12:55.738', '00:00:00', '2', '3', NULL, NULL, '10', '5', 'ارزی', 'Foreign Currency', true);

-- Data for Rap.Banks (48 rows)
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.299', '00:00:00', '1', '2026-10-23 04:12:55.299', '00:00:00', '2', '2', NULL, NULL, '1', '1', 'بانک ملی ایران', 'Bank Melli Iran', 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.301', '00:00:00', '1', '2026-10-23 04:12:55.301', '00:00:00', '2', '2', NULL, NULL, '2', '2', 'بانک سپه', 'Bank Sepah', 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.302', '00:00:00', '1', '2026-10-23 04:12:55.302', '00:00:00', '2', '2', NULL, NULL, '3', '3', 'بانک صنعت و معدن', 'Bank of Industry and Mine', 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.303', '00:00:00', '1', '2026-10-23 04:12:55.303', '00:00:00', '2', '2', NULL, NULL, '4', '4', 'بانک کشاورزی', 'Bank Keshavarzi', 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.304', '00:00:00', '1', '2026-10-23 04:12:55.304', '00:00:00', '2', '2', NULL, NULL, '5', '5', 'بانک مسکن', 'Bank Maskan', 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.305', '00:00:00', '1', '2026-10-23 04:12:55.305', '00:00:00', '2', '2', NULL, NULL, '6', '6', 'بانک توسعه صادرات', 'Export Development Bank', 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.306', '00:00:00', '1', '2026-10-23 04:12:55.306', '00:00:00', '2', '2', NULL, NULL, '7', '7', 'بانک اقتصاد نوین', 'Eghtesad Novin Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.307', '00:00:00', '1', '2026-10-23 04:12:55.307', '00:00:00', '2', '2', NULL, NULL, '8', '8', 'بانک پارسیان', 'Parsian Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.309', '00:00:00', '1', '2026-10-23 04:12:55.309', '00:00:00', '2', '2', NULL, NULL, '9', '9', 'بانک کارآفرین', 'Karafarin Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.310', '00:00:00', '1', '2026-10-23 04:12:55.310', '00:00:00', '2', '2', NULL, NULL, '10', '10', 'بانک سامان', 'Saman Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.313', '00:00:00', '1', '2026-10-23 04:12:55.313', '00:00:00', '2', '2', NULL, NULL, '11', '11', 'بانک پاسارگاد', 'Bank Pasargad', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.314', '00:00:00', '1', '2026-10-23 04:12:55.314', '00:00:00', '2', '2', NULL, NULL, '12', '12', 'بانک سرمایه', 'Sarmayeh Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.316', '00:00:00', '1', '2026-10-23 04:12:55.316', '00:00:00', '2', '2', NULL, NULL, '13', '13', 'بانک سینا', 'Sina Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.317', '00:00:00', '1', '2026-10-23 04:12:55.317', '00:00:00', '2', '2', NULL, NULL, '14', '14', 'بانک شهر', 'Shahr Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.319', '00:00:00', '1', '2026-10-23 04:12:55.319', '00:00:00', '2', '2', NULL, NULL, '15', '15', 'بانک دی', 'Day Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.320', '00:00:00', '1', '2026-10-23 04:12:55.320', '00:00:00', '2', '2', NULL, NULL, '16', '16', 'بانک صادرات', 'Bank Saderat', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.323', '00:00:00', '1', '2026-10-23 04:12:55.323', '00:00:00', '2', '2', NULL, NULL, '17', '17', 'بانک ملت', 'Bank Mellat', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.324', '00:00:00', '1', '2026-10-23 04:12:55.324', '00:00:00', '2', '2', NULL, NULL, '18', '18', 'بانک تجارت', 'Bank Tejarat', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.325', '00:00:00', '1', '2026-10-23 04:12:55.325', '00:00:00', '2', '2', NULL, NULL, '19', '19', 'بانک رفاه کارگران', 'Refah Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.327', '00:00:00', '1', '2026-10-23 04:12:55.327', '00:00:00', '2', '2', NULL, NULL, '20', '20', 'بانک آینده', 'Ayandeh Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.328', '00:00:00', '1', '2026-10-23 04:12:55.328', '00:00:00', '2', '2', NULL, NULL, '21', '21', 'بانک گردشگری', 'Tourism Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.329', '00:00:00', '1', '2026-10-23 04:12:55.329', '00:00:00', '2', '2', NULL, NULL, '22', '22', 'بانک خاورمیانه', 'Middle East Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.330', '00:00:00', '1', '2026-10-23 04:12:55.330', '00:00:00', '2', '2', NULL, NULL, '23', '23', 'بانک ایران زمین', 'Iran Zamin Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.331', '00:00:00', '1', '2026-10-23 04:12:55.331', '00:00:00', '2', '2', NULL, NULL, '24', '24', 'پست بانک ایران', 'Post Bank of Iran', 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.689', '00:00:00', '1', '2026-10-23 04:12:55.689', '00:00:00', '2', '3', NULL, NULL, '25', '1', 'بانک ملی ایران', 'Bank Melli Iran', 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.691', '00:00:00', '1', '2026-10-23 04:12:55.691', '00:00:00', '2', '3', NULL, NULL, '26', '2', 'بانک سپه', 'Bank Sepah', 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.693', '00:00:00', '1', '2026-10-23 04:12:55.693', '00:00:00', '2', '3', NULL, NULL, '27', '3', 'بانک صنعت و معدن', 'Bank of Industry and Mine', 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.694', '00:00:00', '1', '2026-10-23 04:12:55.694', '00:00:00', '2', '3', NULL, NULL, '28', '4', 'بانک کشاورزی', 'Bank Keshavarzi', 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.696', '00:00:00', '1', '2026-10-23 04:12:55.696', '00:00:00', '2', '3', NULL, NULL, '29', '5', 'بانک مسکن', 'Bank Maskan', 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.697', '00:00:00', '1', '2026-10-23 04:12:55.697', '00:00:00', '2', '3', NULL, NULL, '30', '6', 'بانک توسعه صادرات', 'Export Development Bank', 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.698', '00:00:00', '1', '2026-10-23 04:12:55.698', '00:00:00', '2', '3', NULL, NULL, '31', '7', 'بانک اقتصاد نوین', 'Eghtesad Novin Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.699', '00:00:00', '1', '2026-10-23 04:12:55.699', '00:00:00', '2', '3', NULL, NULL, '32', '8', 'بانک پارسیان', 'Parsian Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.700', '00:00:00', '1', '2026-10-23 04:12:55.700', '00:00:00', '2', '3', NULL, NULL, '33', '9', 'بانک کارآفرین', 'Karafarin Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.701', '00:00:00', '1', '2026-10-23 04:12:55.701', '00:00:00', '2', '3', NULL, NULL, '34', '10', 'بانک سامان', 'Saman Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.702', '00:00:00', '1', '2026-10-23 04:12:55.702', '00:00:00', '2', '3', NULL, NULL, '35', '11', 'بانک پاسارگاد', 'Bank Pasargad', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.703', '00:00:00', '1', '2026-10-23 04:12:55.703', '00:00:00', '2', '3', NULL, NULL, '36', '12', 'بانک سرمایه', 'Sarmayeh Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.705', '00:00:00', '1', '2026-10-23 04:12:55.705', '00:00:00', '2', '3', NULL, NULL, '37', '13', 'بانک سینا', 'Sina Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.706', '00:00:00', '1', '2026-10-23 04:12:55.706', '00:00:00', '2', '3', NULL, NULL, '38', '14', 'بانک شهر', 'Shahr Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.707', '00:00:00', '1', '2026-10-23 04:12:55.707', '00:00:00', '2', '3', NULL, NULL, '39', '15', 'بانک دی', 'Day Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.708', '00:00:00', '1', '2026-10-23 04:12:55.708', '00:00:00', '2', '3', NULL, NULL, '40', '16', 'بانک صادرات', 'Bank Saderat', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.710', '00:00:00', '1', '2026-10-23 04:12:55.710', '00:00:00', '2', '3', NULL, NULL, '41', '17', 'بانک ملت', 'Bank Mellat', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.717', '00:00:00', '1', '2026-10-23 04:12:55.717', '00:00:00', '2', '3', NULL, NULL, '42', '18', 'بانک تجارت', 'Bank Tejarat', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.722', '00:00:00', '1', '2026-10-23 04:12:55.722', '00:00:00', '2', '3', NULL, NULL, '43', '19', 'بانک رفاه کارگران', 'Refah Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.727', '00:00:00', '1', '2026-10-23 04:12:55.727', '00:00:00', '2', '3', NULL, NULL, '44', '20', 'بانک آینده', 'Ayandeh Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.728', '00:00:00', '1', '2026-10-23 04:12:55.728', '00:00:00', '2', '3', NULL, NULL, '45', '21', 'بانک گردشگری', 'Tourism Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.730', '00:00:00', '1', '2026-10-23 04:12:55.730', '00:00:00', '2', '3', NULL, NULL, '46', '22', 'بانک خاورمیانه', 'Middle East Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.731', '00:00:00', '1', '2026-10-23 04:12:55.731', '00:00:00', '2', '3', NULL, NULL, '47', '23', 'بانک ایران زمین', 'Iran Zamin Bank', 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "Rap"."Banks" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "BankID", "Code", "Title", "LatinTitle", "BankType", "SwiftCode", "NationalityRef", "Phone", "Website", "Description") VALUES (1, '1', '2026-10-23 04:12:55.732', '00:00:00', '1', '2026-10-23 04:12:55.732', '00:00:00', '2', '3', NULL, NULL, '48', '24', 'پست بانک ایران', 'Post Bank of Iran', 1, NULL, NULL, NULL, NULL, NULL);

-- Data for Rap.RecieptAndPaymentAccountingSetting (114 rows)
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.345', '00:00:00', '1', '2026-10-23 04:12:55.345', '00:00:00', '2', '2', NULL, NULL, '1', '1', 'دریافت چک تضمینی', NULL, NULL, 1, 10, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.347', '00:00:00', '1', '2026-10-23 04:12:55.347', '00:00:00', '2', '2', NULL, NULL, '2', '2', 'دریافت چک عادی تجاری', NULL, NULL, 1, 1, 1, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.348', '00:00:00', '1', '2026-10-23 04:12:55.348', '00:00:00', '2', '2', NULL, NULL, '3', '3', 'دریافت چک عادی غیر تجاری', NULL, NULL, 1, 1, 1, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.349', '00:00:00', '1', '2026-10-23 04:12:55.349', '00:00:00', '2', '2', NULL, NULL, '4', '4', 'دریافت سفته تضمینی', NULL, NULL, 2, 10, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.350', '00:00:00', '1', '2026-10-23 04:12:55.350', '00:00:00', '2', '2', NULL, NULL, '5', '5', 'دریافت سفته عادی تجاری', NULL, NULL, 2, 1, 1, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.351', '00:00:00', '1', '2026-10-23 04:12:55.351', '00:00:00', '2', '2', NULL, NULL, '6', '6', 'دریافت سفته عادی غیر تجاری', NULL, NULL, 2, 1, 1, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.353', '00:00:00', '1', '2026-10-23 04:12:55.353', '00:00:00', '2', '2', NULL, NULL, '7', '7', 'اعلامیه واریز ریالی', NULL, NULL, 5, 1, 3, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.354', '00:00:00', '1', '2026-10-23 04:12:55.354', '00:00:00', '2', '2', NULL, NULL, '8', '8', 'اعلامیه واریز ارزی', NULL, NULL, 5, 1, 3, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.357', '00:00:00', '1', '2026-10-23 04:12:55.357', '00:00:00', '2', '2', NULL, NULL, '9', '9', 'تبدیل چک دریافتی تضمینی به عادی', NULL, NULL, 1, 1, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.359', '00:00:00', '1', '2026-10-23 04:12:55.359', '00:00:00', '2', '2', NULL, NULL, '10', '10', 'تبدیل سفته دریافتی تضمینی به عادی', NULL, NULL, 2, 1, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.361', '00:00:00', '1', '2026-10-23 04:12:55.361', '00:00:00', '2', '2', NULL, NULL, '11', '11', 'پرداخت چک عادی روز ریالی', NULL, NULL, 1, 2, 1, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.362', '00:00:00', '1', '2026-10-23 04:12:55.362', '00:00:00', '2', '2', NULL, NULL, '12', '12', 'پرداخت چک تضمینی', NULL, NULL, 1, 2, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.363', '00:00:00', '1', '2026-10-23 04:12:55.363', '00:00:00', '2', '2', NULL, NULL, '13', '13', 'پرداخت چک عادی روز ارزی', NULL, NULL, 1, 2, 1, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.365', '00:00:00', '1', '2026-10-23 04:12:55.365', '00:00:00', '2', '2', NULL, NULL, '14', '14', 'پرداخت چک کوتاه مدت تجاری', NULL, NULL, 1, 2, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.383', '00:00:00', '1', '2026-10-23 04:12:55.383', '00:00:00', '2', '2', NULL, NULL, '15', '15', 'پرداخت چک کوتاه مدت غیر تجاری', NULL, NULL, 1, 2, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.385', '00:00:00', '1', '2026-10-23 04:12:55.385', '00:00:00', '2', '2', NULL, NULL, '16', '16', 'پرداخت چک بلند مدت تجاری', NULL, NULL, 1, 2, 1, 3, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.388', '00:00:00', '1', '2026-10-23 04:12:55.388', '00:00:00', '2', '2', NULL, NULL, '17', '17', 'پرداخت چک بلند مدت غیر تجاری', NULL, NULL, 1, 2, 1, 3, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.389', '00:00:00', '1', '2026-10-23 04:12:55.389', '00:00:00', '2', '2', NULL, NULL, '18', '18', 'پرداخت سفته کوتاه مدت تجاری', NULL, NULL, 2, 2, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.391', '00:00:00', '1', '2026-10-23 04:12:55.391', '00:00:00', '2', '2', NULL, NULL, '19', '19', 'پرداخت سفته تضمینی', NULL, NULL, 2, 2, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.393', '00:00:00', '1', '2026-10-23 04:12:55.393', '00:00:00', '2', '2', NULL, NULL, '20', '20', 'پرداخت سفته کوتاه مدت غیر تجاری', NULL, NULL, 2, 2, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.395', '00:00:00', '1', '2026-10-23 04:12:55.395', '00:00:00', '2', '2', NULL, NULL, '21', '21', 'پرداخت سفته بلند مدت تجاری', NULL, NULL, 2, 2, 1, 3, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.397', '00:00:00', '1', '2026-10-23 04:12:55.397', '00:00:00', '2', '2', NULL, NULL, '22', '22', 'پرداخت سفته بلند مدت غیر تجاری', NULL, NULL, 2, 2, 1, 3, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.399', '00:00:00', '1', '2026-10-23 04:12:55.399', '00:00:00', '2', '2', NULL, NULL, '23', '23', 'اعلامیه برداشت ریالی', NULL, NULL, 7, 2, 3, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.400', '00:00:00', '1', '2026-10-23 04:12:55.400', '00:00:00', '2', '2', NULL, NULL, '24', '24', 'اعلامیه برداشت ارزی', NULL, NULL, 7, 2, 3, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.403', '00:00:00', '1', '2026-10-23 04:12:55.403', '00:00:00', '2', '2', NULL, NULL, '25', '25', 'تبدیل چک پرداختی تضمینی به عادی', NULL, NULL, 1, 2, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.405', '00:00:00', '1', '2026-10-23 04:12:55.405', '00:00:00', '2', '2', NULL, NULL, '26', '26', 'تبدیل سفته پرداختی تضمینی به عادی', NULL, NULL, 2, 2, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.406', '00:00:00', '1', '2026-10-23 04:12:55.406', '00:00:00', '2', '2', NULL, NULL, '27', '27', 'واگذار چک به بانک', NULL, NULL, 1, 6, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.407', '00:00:00', '1', '2026-10-23 04:12:55.407', '00:00:00', '2', '2', NULL, NULL, '28', '28', 'واگذار سفته به بانک', NULL, NULL, 2, 6, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.408', '00:00:00', '1', '2026-10-23 04:12:55.408', '00:00:00', '2', '2', NULL, NULL, '29', '29', 'وصول چک ریالی', NULL, NULL, 1, 7, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.409', '00:00:00', '1', '2026-10-23 04:12:55.409', '00:00:00', '2', '2', NULL, NULL, '30', '30', 'وصول چک ارزی', NULL, NULL, 1, 7, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.410', '00:00:00', '1', '2026-10-23 04:12:55.410', '00:00:00', '2', '2', NULL, NULL, '31', '31', 'وصول سفته', NULL, NULL, 2, 7, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.413', '00:00:00', '1', '2026-10-23 04:12:55.413', '00:00:00', '2', '2', NULL, NULL, '32', '32', 'واخواست چک', NULL, NULL, 1, 8, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.415', '00:00:00', '1', '2026-10-23 04:12:55.415', '00:00:00', '2', '2', NULL, NULL, '33', '33', 'واخواست سفته', NULL, NULL, 2, 8, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.417', '00:00:00', '1', '2026-10-23 04:12:55.417', '00:00:00', '2', '2', NULL, NULL, '34', '34', 'تغییر مدت چک کوتاه مدت به روز', NULL, NULL, 1, 9, 1, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.420', '00:00:00', '1', '2026-10-23 04:12:55.420', '00:00:00', '2', '2', NULL, NULL, '35', '35', 'تغییر مدت چک بلند مدت تجاری به کوتاه مدت تجاری', NULL, NULL, 1, 9, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.424', '00:00:00', '1', '2026-10-23 04:12:55.424', '00:00:00', '2', '2', NULL, NULL, '36', '36', 'تغییر مدت چک بلند مدت غیر تجاری به کوتاه مدت غیر تجاری', NULL, NULL, 1, 9, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.426', '00:00:00', '1', '2026-10-23 04:12:55.426', '00:00:00', '2', '2', NULL, NULL, '37', '37', 'تغییر مدت چک کوتاه مدت تجاری به بلندمدت تجاری', NULL, NULL, 1, 9, 1, 3, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.427', '00:00:00', '1', '2026-10-23 04:12:55.427', '00:00:00', '2', '2', NULL, NULL, '38', '38', 'تغییر مدت چک کوتاه مدت غیر تجاری به بلندمدت غیر تجاری', NULL, NULL, 1, 9, 1, 3, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.428', '00:00:00', '1', '2026-10-23 04:12:55.428', '00:00:00', '2', '2', NULL, NULL, '39', '39', 'تغییر مدت چک روز به کوتاه مدت تجاری', NULL, NULL, 1, 9, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.429', '00:00:00', '1', '2026-10-23 04:12:55.429', '00:00:00', '2', '2', NULL, NULL, '40', '40', 'تغییر مدت چک روز به کوتاه مدت غیر تجاری', NULL, NULL, 1, 9, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.431', '00:00:00', '1', '2026-10-23 04:12:55.431', '00:00:00', '2', '2', NULL, NULL, '41', '41', 'تغییر مدت سفته کوتاه مدت به روز', NULL, NULL, 2, 9, 1, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.432', '00:00:00', '1', '2026-10-23 04:12:55.432', '00:00:00', '2', '2', NULL, NULL, '42', '42', 'تغییر مدت سفته بلند مدت تجاری به کوتاه مدت تجاری', NULL, NULL, 2, 9, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.434', '00:00:00', '1', '2026-10-23 04:12:55.434', '00:00:00', '2', '2', NULL, NULL, '43', '43', 'تغییر مدت سفته بلند مدت غیر تجاری به کوتاه مدت غیر تجاری', NULL, NULL, 2, 9, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.435', '00:00:00', '1', '2026-10-23 04:12:55.435', '00:00:00', '2', '2', NULL, NULL, '44', '44', 'تغییر مدت سفته کوتاه مدت تجاری به بلندمدت تجاری', NULL, NULL, 2, 9, 1, 3, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.437', '00:00:00', '1', '2026-10-23 04:12:55.437', '00:00:00', '2', '2', NULL, NULL, '45', '45', 'تغییر مدت سفته کوتاه مدت غیر تجاری به بلندمدت غیر تجاری', NULL, NULL, 2, 9, 1, 3, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.441', '00:00:00', '1', '2026-10-23 04:12:55.441', '00:00:00', '2', '2', NULL, NULL, '46', '46', 'تغییر مدت سفته روز به کوتاه مدت تجاری', NULL, NULL, 2, 9, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.442', '00:00:00', '1', '2026-10-23 04:12:55.442', '00:00:00', '2', '2', NULL, NULL, '47', '47', 'تغییر مدت سفته روز به کوتاه مدت غیر تجاری', NULL, NULL, 2, 9, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.443', '00:00:00', '1', '2026-10-23 04:12:55.443', '00:00:00', '2', '2', NULL, NULL, '48', '48', 'انتقالی بانک به بانک', NULL, NULL, 7, 2, 3, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.444', '00:00:00', '1', '2026-10-23 04:12:55.444', '00:00:00', '2', '2', NULL, NULL, '49', '49', 'انتقالی صندوق به بانک', NULL, NULL, 7, 2, 2, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.446', '00:00:00', '1', '2026-10-23 04:12:55.446', '00:00:00', '2', '2', NULL, NULL, '50', '50', 'تبدیل چک پرداختی تضمینی به عادی روز', NULL, NULL, 1, 9, 1, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.448', '00:00:00', '1', '2026-10-23 04:12:55.448', '00:00:00', '2', '2', NULL, NULL, '51', '51', 'تبدیل چک پرداختی تضمینی به عادی بلند مدت', NULL, NULL, 1, 9, 1, 3, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.449', '00:00:00', '1', '2026-10-23 04:12:55.449', '00:00:00', '2', '2', NULL, NULL, '52', '52', 'تبدیل چک پرداختی تضمینی به عادی کوتاه مدت', NULL, NULL, 1, 9, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.450', '00:00:00', '1', '2026-10-23 04:12:55.450', '00:00:00', '2', '2', NULL, NULL, '53', '53', 'انتقالی بانک به صندوق', NULL, NULL, 7, 2, 3, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.451', '00:00:00', '1', '2026-10-23 04:12:55.451', '00:00:00', '2', '2', NULL, NULL, '54', '54', 'دریافت نقدی کارتخوان', NULL, NULL, 6, 1, 4, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.452', '00:00:00', '1', '2026-10-23 04:12:55.452', '00:00:00', '2', '2', NULL, NULL, '55', '55', 'دریافت ضمانت‌نامه بانکی', NULL, NULL, 8, 1, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.453', '00:00:00', '1', '2026-10-23 04:12:55.453', '00:00:00', '2', '2', NULL, NULL, '56', '56', 'دریافت سفته تضمینی', NULL, NULL, 8, 1, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.455', '00:00:00', '1', '2026-10-23 04:12:55.455', '00:00:00', '2', '2', NULL, NULL, '57', '57', 'دریافت چک تضمینی', NULL, NULL, 8, 1, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.741', '00:00:00', '1', '2026-10-23 04:12:55.741', '00:00:00', '2', '3', NULL, NULL, '58', '1', 'دریافت چک تضمینی', NULL, NULL, 1, 10, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.742', '00:00:00', '1', '2026-10-23 04:12:55.742', '00:00:00', '2', '3', NULL, NULL, '59', '2', 'دریافت چک عادی تجاری', NULL, NULL, 1, 1, 1, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.745', '00:00:00', '1', '2026-10-23 04:12:55.745', '00:00:00', '2', '3', NULL, NULL, '60', '3', 'دریافت چک عادی غیر تجاری', NULL, NULL, 1, 1, 1, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.748', '00:00:00', '1', '2026-10-23 04:12:55.748', '00:00:00', '2', '3', NULL, NULL, '61', '4', 'دریافت سفته تضمینی', NULL, NULL, 2, 10, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.750', '00:00:00', '1', '2026-10-23 04:12:55.750', '00:00:00', '2', '3', NULL, NULL, '62', '5', 'دریافت سفته عادی تجاری', NULL, NULL, 2, 1, 1, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.751', '00:00:00', '1', '2026-10-23 04:12:55.751', '00:00:00', '2', '3', NULL, NULL, '63', '6', 'دریافت سفته عادی غیر تجاری', NULL, NULL, 2, 1, 1, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.754', '00:00:00', '1', '2026-10-23 04:12:55.754', '00:00:00', '2', '3', NULL, NULL, '64', '7', 'اعلامیه واریز ریالی', NULL, NULL, 5, 1, 3, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.755', '00:00:00', '1', '2026-10-23 04:12:55.755', '00:00:00', '2', '3', NULL, NULL, '65', '8', 'اعلامیه واریز ارزی', NULL, NULL, 5, 1, 3, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.756', '00:00:00', '1', '2026-10-23 04:12:55.756', '00:00:00', '2', '3', NULL, NULL, '66', '9', 'تبدیل چک دریافتی تضمینی به عادی', NULL, NULL, 1, 1, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.757', '00:00:00', '1', '2026-10-23 04:12:55.757', '00:00:00', '2', '3', NULL, NULL, '67', '10', 'تبدیل سفته دریافتی تضمینی به عادی', NULL, NULL, 2, 1, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.758', '00:00:00', '1', '2026-10-23 04:12:55.758', '00:00:00', '2', '3', NULL, NULL, '68', '11', 'پرداخت چک عادی روز ریالی', NULL, NULL, 1, 2, 1, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.759', '00:00:00', '1', '2026-10-23 04:12:55.759', '00:00:00', '2', '3', NULL, NULL, '69', '12', 'پرداخت چک تضمینی', NULL, NULL, 1, 2, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.760', '00:00:00', '1', '2026-10-23 04:12:55.760', '00:00:00', '2', '3', NULL, NULL, '70', '13', 'پرداخت چک عادی روز ارزی', NULL, NULL, 1, 2, 1, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.761', '00:00:00', '1', '2026-10-23 04:12:55.761', '00:00:00', '2', '3', NULL, NULL, '71', '14', 'پرداخت چک کوتاه مدت تجاری', NULL, NULL, 1, 2, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.762', '00:00:00', '1', '2026-10-23 04:12:55.762', '00:00:00', '2', '3', NULL, NULL, '72', '15', 'پرداخت چک کوتاه مدت غیر تجاری', NULL, NULL, 1, 2, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.764', '00:00:00', '1', '2026-10-23 04:12:55.764', '00:00:00', '2', '3', NULL, NULL, '73', '16', 'پرداخت چک بلند مدت تجاری', NULL, NULL, 1, 2, 1, 3, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.784', '00:00:00', '1', '2026-10-23 04:12:55.784', '00:00:00', '2', '3', NULL, NULL, '74', '17', 'پرداخت چک بلند مدت غیر تجاری', NULL, NULL, 1, 2, 1, 3, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.785', '00:00:00', '1', '2026-10-23 04:12:55.785', '00:00:00', '2', '3', NULL, NULL, '75', '18', 'پرداخت سفته کوتاه مدت تجاری', NULL, NULL, 2, 2, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.786', '00:00:00', '1', '2026-10-23 04:12:55.786', '00:00:00', '2', '3', NULL, NULL, '76', '19', 'پرداخت سفته تضمینی', NULL, NULL, 2, 2, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.788', '00:00:00', '1', '2026-10-23 04:12:55.788', '00:00:00', '2', '3', NULL, NULL, '77', '20', 'پرداخت سفته کوتاه مدت غیر تجاری', NULL, NULL, 2, 2, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.789', '00:00:00', '1', '2026-10-23 04:12:55.789', '00:00:00', '2', '3', NULL, NULL, '78', '21', 'پرداخت سفته بلند مدت تجاری', NULL, NULL, 2, 2, 1, 3, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.790', '00:00:00', '1', '2026-10-23 04:12:55.790', '00:00:00', '2', '3', NULL, NULL, '79', '22', 'پرداخت سفته بلند مدت غیر تجاری', NULL, NULL, 2, 2, 1, 3, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.791', '00:00:00', '1', '2026-10-23 04:12:55.791', '00:00:00', '2', '3', NULL, NULL, '80', '23', 'اعلامیه برداشت ریالی', NULL, NULL, 7, 2, 3, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.792', '00:00:00', '1', '2026-10-23 04:12:55.792', '00:00:00', '2', '3', NULL, NULL, '81', '24', 'اعلامیه برداشت ارزی', NULL, NULL, 7, 2, 3, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.793', '00:00:00', '1', '2026-10-23 04:12:55.793', '00:00:00', '2', '3', NULL, NULL, '82', '25', 'تبدیل چک پرداختی تضمینی به عادی', NULL, NULL, 1, 2, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.794', '00:00:00', '1', '2026-10-23 04:12:55.794', '00:00:00', '2', '3', NULL, NULL, '83', '26', 'تبدیل سفته پرداختی تضمینی به عادی', NULL, NULL, 2, 2, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.796', '00:00:00', '1', '2026-10-23 04:12:55.796', '00:00:00', '2', '3', NULL, NULL, '84', '27', 'واگذار چک به بانک', NULL, NULL, 1, 6, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.797', '00:00:00', '1', '2026-10-23 04:12:55.797', '00:00:00', '2', '3', NULL, NULL, '85', '28', 'واگذار سفته به بانک', NULL, NULL, 2, 6, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.798', '00:00:00', '1', '2026-10-23 04:12:55.798', '00:00:00', '2', '3', NULL, NULL, '86', '29', 'وصول چک ریالی', NULL, NULL, 1, 7, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.799', '00:00:00', '1', '2026-10-23 04:12:55.799', '00:00:00', '2', '3', NULL, NULL, '87', '30', 'وصول چک ارزی', NULL, NULL, 1, 7, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.800', '00:00:00', '1', '2026-10-23 04:12:55.800', '00:00:00', '2', '3', NULL, NULL, '88', '31', 'وصول سفته', NULL, NULL, 2, 7, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.801', '00:00:00', '1', '2026-10-23 04:12:55.801', '00:00:00', '2', '3', NULL, NULL, '89', '32', 'واخواست چک', NULL, NULL, 1, 8, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.802', '00:00:00', '1', '2026-10-23 04:12:55.802', '00:00:00', '2', '3', NULL, NULL, '90', '33', 'واخواست سفته', NULL, NULL, 2, 8, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.803', '00:00:00', '1', '2026-10-23 04:12:55.803', '00:00:00', '2', '3', NULL, NULL, '91', '34', 'تغییر مدت چک کوتاه مدت به روز', NULL, NULL, 1, 9, 1, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.804', '00:00:00', '1', '2026-10-23 04:12:55.804', '00:00:00', '2', '3', NULL, NULL, '92', '35', 'تغییر مدت چک بلند مدت تجاری به کوتاه مدت تجاری', NULL, NULL, 1, 9, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.805', '00:00:00', '1', '2026-10-23 04:12:55.805', '00:00:00', '2', '3', NULL, NULL, '93', '36', 'تغییر مدت چک بلند مدت غیر تجاری به کوتاه مدت غیر تجاری', NULL, NULL, 1, 9, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.806', '00:00:00', '1', '2026-10-23 04:12:55.806', '00:00:00', '2', '3', NULL, NULL, '94', '37', 'تغییر مدت چک کوتاه مدت تجاری به بلندمدت تجاری', NULL, NULL, 1, 9, 1, 3, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.807', '00:00:00', '1', '2026-10-23 04:12:55.807', '00:00:00', '2', '3', NULL, NULL, '95', '38', 'تغییر مدت چک کوتاه مدت غیر تجاری به بلندمدت غیر تجاری', NULL, NULL, 1, 9, 1, 3, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.808', '00:00:00', '1', '2026-10-23 04:12:55.808', '00:00:00', '2', '3', NULL, NULL, '96', '39', 'تغییر مدت چک روز به کوتاه مدت تجاری', NULL, NULL, 1, 9, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.811', '00:00:00', '1', '2026-10-23 04:12:55.811', '00:00:00', '2', '3', NULL, NULL, '97', '40', 'تغییر مدت چک روز به کوتاه مدت غیر تجاری', NULL, NULL, 1, 9, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.812', '00:00:00', '1', '2026-10-23 04:12:55.812', '00:00:00', '2', '3', NULL, NULL, '98', '41', 'تغییر مدت سفته کوتاه مدت به روز', NULL, NULL, 2, 9, 1, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.813', '00:00:00', '1', '2026-10-23 04:12:55.813', '00:00:00', '2', '3', NULL, NULL, '99', '42', 'تغییر مدت سفته بلند مدت تجاری به کوتاه مدت تجاری', NULL, NULL, 2, 9, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.814', '00:00:00', '1', '2026-10-23 04:12:55.814', '00:00:00', '2', '3', NULL, NULL, '100', '43', 'تغییر مدت سفته بلند مدت غیر تجاری به کوتاه مدت غیر تجاری', NULL, NULL, 2, 9, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.816', '00:00:00', '1', '2026-10-23 04:12:55.816', '00:00:00', '2', '3', NULL, NULL, '101', '44', 'تغییر مدت سفته کوتاه مدت تجاری به بلندمدت تجاری', NULL, NULL, 2, 9, 1, 3, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.817', '00:00:00', '1', '2026-10-23 04:12:55.817', '00:00:00', '2', '3', NULL, NULL, '102', '45', 'تغییر مدت سفته کوتاه مدت غیر تجاری به بلندمدت غیر تجاری', NULL, NULL, 2, 9, 1, 3, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.819', '00:00:00', '1', '2026-10-23 04:12:55.819', '00:00:00', '2', '3', NULL, NULL, '103', '46', 'تغییر مدت سفته روز به کوتاه مدت تجاری', NULL, NULL, 2, 9, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.820', '00:00:00', '1', '2026-10-23 04:12:55.820', '00:00:00', '2', '3', NULL, NULL, '104', '47', 'تغییر مدت سفته روز به کوتاه مدت غیر تجاری', NULL, NULL, 2, 9, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.822', '00:00:00', '1', '2026-10-23 04:12:55.822', '00:00:00', '2', '3', NULL, NULL, '105', '48', 'انتقالی بانک به بانک', NULL, NULL, 7, 2, 3, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.824', '00:00:00', '1', '2026-10-23 04:12:55.824', '00:00:00', '2', '3', NULL, NULL, '106', '49', 'انتقالی صندوق به بانک', NULL, NULL, 7, 2, 2, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.825', '00:00:00', '1', '2026-10-23 04:12:55.825', '00:00:00', '2', '3', NULL, NULL, '107', '50', 'تبدیل چک پرداختی تضمینی به عادی روز', NULL, NULL, 1, 9, 1, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.826', '00:00:00', '1', '2026-10-23 04:12:55.826', '00:00:00', '2', '3', NULL, NULL, '108', '51', 'تبدیل چک پرداختی تضمینی به عادی بلند مدت', NULL, NULL, 1, 9, 1, 3, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.827', '00:00:00', '1', '2026-10-23 04:12:55.827', '00:00:00', '2', '3', NULL, NULL, '109', '52', 'تبدیل چک پرداختی تضمینی به عادی کوتاه مدت', NULL, NULL, 1, 9, 1, 2, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.828', '00:00:00', '1', '2026-10-23 04:12:55.828', '00:00:00', '2', '3', NULL, NULL, '110', '53', 'انتقالی بانک به صندوق', NULL, NULL, 7, 2, 3, 1, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.829', '00:00:00', '1', '2026-10-23 04:12:55.829', '00:00:00', '2', '3', NULL, NULL, '111', '54', 'دریافت نقدی کارتخوان', NULL, NULL, 6, 1, 4, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.830', '00:00:00', '1', '2026-10-23 04:12:55.830', '00:00:00', '2', '3', NULL, NULL, '112', '55', 'دریافت ضمانت‌نامه بانکی', NULL, NULL, 8, 1, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.831', '00:00:00', '1', '2026-10-23 04:12:55.831', '00:00:00', '2', '3', NULL, NULL, '113', '56', 'دریافت سفته تضمینی', NULL, NULL, 8, 1, 1, 4, false, true);
INSERT INTO "Rap"."RecieptAndPaymentAccountingSetting" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "RecieptAndPaymentAccountingSettingID", "Code", "Title", "Title_En", "AccountRef", "usedEntryType", "operationType", "detailedType", "termType", "isDefault", "isActive") VALUES (1, '1', '2026-10-23 04:12:55.832', '00:00:00', '1', '2026-10-23 04:12:55.832', '00:00:00', '2', '3', NULL, NULL, '114', '57', 'دریافت چک تضمینی', NULL, NULL, 8, 1, 1, 4, false, true);

-- Data for Sle.CustomerGroups (4 rows)
INSERT INTO "Sle"."CustomerGroups" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "CustomerGroupID", "Code", "Title", "Title2", "DetailedAccountRef", "Description", "IsMandatory", "ParentRef") VALUES (1, '1', '2026-10-24 04:45:30.243', '04:45:30', '1', '2026-10-24 04:45:30.243', '04:45:30', '2', '2', NULL, NULL, '1', '0', 'گروه بندی مشتریان', '', NULL, '', false, NULL);
INSERT INTO "Sle"."CustomerGroups" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "CustomerGroupID", "Code", "Title", "Title2", "DetailedAccountRef", "Description", "IsMandatory", "ParentRef") VALUES (1, '1', '2026-10-24 05:35:28.851', '05:35:28', '1', '2026-10-24 05:35:28.851', '05:35:28', '2', '2', NULL, NULL, '5', '1', 'گروه فروش مستقیم', '', '7', '', false, '1');
INSERT INTO "Sle"."CustomerGroups" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "CustomerGroupID", "Code", "Title", "Title2", "DetailedAccountRef", "Description", "IsMandatory", "ParentRef") VALUES (1, '1', '2026-10-24 05:35:28.923', '05:35:28', '1', '2026-10-24 05:35:28.923', '05:35:28', '2', '2', NULL, NULL, '6', '1', 'فروش آنلاین', '', '8', '', false, '5');
INSERT INTO "Sle"."CustomerGroups" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "CustomerGroupID", "Code", "Title", "Title2", "DetailedAccountRef", "Description", "IsMandatory", "ParentRef") VALUES (1, '1', '2026-10-24 05:35:28.996', '05:35:28', '1', '2026-10-24 05:35:28.996', '05:35:28', '2', '2', NULL, NULL, '7', '2', 'فروش سیار', '', '9', '', false, '6');

-- Data for Sle.Customers (2 rows)
INSERT INTO "Sle"."Customers" ("CustomerID", "Code", "CustomerType", "PartyRef", "CustomerGroupRef", "SalesChannels", "SalesStatus", "SalesIntermediaryRef", "SalesTypes", "CurrencyRef", "IsActive", "BusinessStructureRef", "CompanyRef", "FiscalYearRef", "CreatorRef", "CreationDate", "LastModifierRef", "LastModificationDate") VALUES ('1', '1', 1, '1', '7', '["1"]', 1, NULL, '["2"]', '1', true, '2', '2', NULL, '1', '2026-10-24 02:56:48.489', '1', '2026-10-24 09:49:00.078');
INSERT INTO "Sle"."Customers" ("CustomerID", "Code", "CustomerType", "PartyRef", "CustomerGroupRef", "SalesChannels", "SalesStatus", "SalesIntermediaryRef", "SalesTypes", "CurrencyRef", "IsActive", "BusinessStructureRef", "CompanyRef", "FiscalYearRef", "CreatorRef", "CreationDate", "LastModifierRef", "LastModificationDate") VALUES ('2', '2', 1, '2', '7', '["1"]', 1, NULL, '["2"]', '1', true, '2', '2', NULL, '1', '2026-10-24 12:18:29.728', '1', '2026-10-24 12:18:29.728');

-- Data for Sle.DeliveryLocations (1 rows)
INSERT INTO "Sle"."DeliveryLocations" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "DeliveryLocationID", "Code", "Title", "Title2", "IsActive", "Description") VALUES (1, '1', '2026-10-24 12:34:25.609', '12:34:25', '1', '2026-10-24 12:34:25.609', '12:34:25', '2', '2', NULL, NULL, '2', '1', 'درب نمایندگی', 'درب نمایندگی', true, '');

-- Data for Sle.SalesCenters (1 rows)
INSERT INTO "Sle"."SalesCenters" ("SalesCenterID", "Code", "Type", "ReferenceRef", "Title", "Title2", "IsActive", "Description", "BusinessStructureRef", "CompanyRef", "FiscalYearRef", "CreatorRef", "CreationDate", "LastModifierRef", "LastModificationDate") VALUES ('1', 1, 4, NULL, 'فروش زاهدان', 'فروش زاهدان', true, '', '2', '2', NULL, '1', NULL, '1', NULL);

-- Data for Sle.SalesChannels (1 rows)
INSERT INTO "Sle"."SalesChannels" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "SalesChannelID", "Code", "Title", "Title2", "Type", "IsActive", "Description") VALUES (1, '1', '2026-10-24 03:08:37.240', '03:08:37', '1', '2026-10-24 03:08:37.240', '03:08:37', '2', '2', NULL, NULL, '1', 1, 'بازاریابی تلفنی', 'بازاریابی تلفنی', 1, true, '');

-- Data for Sle.SalesDocumentSettings (1 rows)
INSERT INTO "Sle"."SalesDocumentSettings" ("SalesDocumentSettingsID", "SalesDocumentType", "HasBaseDocument", "BaseDocumentTypes", "ShowWarehouse", "DefaultWarehouseRef", "ShowSalesCenter", "DefaultSalesCenterRef", "ShowSalesType", "DefaultSalesTypeRef", "ShowDeliveryLocations", "DefaultDeliveryLocationRef", "HasAccountingDocument", "ShowPurchaseSalesParameters", "IsActive", "BusinessStructureRef", "CompanyRef", "CreatorRef", "CreationDate", "LastModifierRef", "LastModificationDate", "ShowSettlementMethod", "DefaultSettlementMethodRef") VALUES ('1', 1, true, '0', false, NULL, true, '1', true, '2', true, '2', false, true, true, '2', '2', '1', '2026-10-23 04:32:27.925', '1', '2026-10-25 17:32:29.030', false, NULL);

-- Data for Sle.SalesItemGroups (3 rows)
INSERT INTO "Sle"."SalesItemGroups" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "SalesItemGroupID", "SalesItemGroupCode", "SalesItemGroupName", "SalesItemGroupName2", "Description", "IsMandatory", "ParentRef") VALUES (1, '1', '2026-10-23 19:41:00.425', '19:41:00', '1', '2026-10-23 19:41:00.425', '19:41:00', '2', '2', NULL, NULL, '1', '0', 'گروه بندی کالا فروش', '', '', false, NULL);
INSERT INTO "Sle"."SalesItemGroups" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "SalesItemGroupID", "SalesItemGroupCode", "SalesItemGroupName", "SalesItemGroupName2", "Description", "IsMandatory", "ParentRef") VALUES (1, '1', '2026-10-23 19:41:00.425', '19:41:00', '1', '2026-10-23 19:41:00.425', '19:41:00', '2', '2', NULL, NULL, '2', '10', 'کالا', 'Goods', '', false, '1');
INSERT INTO "Sle"."SalesItemGroups" ("Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "SalesItemGroupID", "SalesItemGroupCode", "SalesItemGroupName", "SalesItemGroupName2", "Description", "IsMandatory", "ParentRef") VALUES (1, '1', '2026-10-23 19:41:00.425', '19:41:00', '1', '2026-10-23 19:41:00.425', '19:41:00', '2', '2', NULL, NULL, '3', '20', 'خدمت', 'Services', '', false, '1');

-- Data for Sle.SalesOrderItems (3 rows)
INSERT INTO "Sle"."SalesOrderItems" ("SalesOrderItemID", "SalesOrderRef", "RowNo", "ItemRef", "ItemCode", "ItemName", "UnitName", "Quantity", "UnitPrice", "TotalPrice", "Description", "TrackingFactorValues") VALUES ('19', '11', 1, '6', '1', 'نشاسته', 'بسته', '1.0000', '899999999.00', '899999999.00', NULL, NULL);
INSERT INTO "Sle"."SalesOrderItems" ("SalesOrderItemID", "SalesOrderRef", "RowNo", "ItemRef", "ItemCode", "ItemName", "UnitName", "Quantity", "UnitPrice", "TotalPrice", "Description", "TrackingFactorValues") VALUES ('21', '8', 1, '6', '1', 'نشاسته', 'عدد', '1.0000', '45555555.00', '45555555.00', NULL, NULL);
INSERT INTO "Sle"."SalesOrderItems" ("SalesOrderItemID", "SalesOrderRef", "RowNo", "ItemRef", "ItemCode", "ItemName", "UnitName", "Quantity", "UnitPrice", "TotalPrice", "Description", "TrackingFactorValues") VALUES ('25', '14', 1, '6', '1', 'نشاسته', 'عدد', '1.0000', '354343.00', '354343.00', NULL, '[{"1":"87987897","_id":"1792944454484_0","Quantity":1}]');

-- Data for Sle.SalesOrders (3 rows)
INSERT INTO "Sle"."SalesOrders" ("SalesOrderID", "Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "OrderNumber", "OrderDate", "CustomerRef", "CustomerName", "Status", "Description", "FiscalYearRef", "DeliveryDate", "SalesTypeRef", "DeliveryLocationRef", "SettlementMethodRef") VALUES ('11', '4', '1', '2026-10-24 22:17:26.828', '22:17:26', '1', '2026-10-25 08:40:42.042', '08:40:42', '2', '2', NULL, NULL, 2, '2026/10/25', '2', 'علی جهانی', 2, 'باید سریع تحویل گردد', '1', '2026/12/20', '2', '2', '4');
INSERT INTO "Sle"."SalesOrders" ("SalesOrderID", "Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "OrderNumber", "OrderDate", "CustomerRef", "CustomerName", "Status", "Description", "FiscalYearRef", "DeliveryDate", "SalesTypeRef", "DeliveryLocationRef", "SettlementMethodRef") VALUES ('8', '3', '1', '2026-10-24 18:46:32.168', '18:46:32', '1', '2026-10-25 08:41:43.376', '08:41:43', '2', '2', NULL, NULL, 1, '2026/10/24', '2', 'علی جهانی', 5, '', '1', '2026/12/21', '2', '2', '4');
INSERT INTO "Sle"."SalesOrders" ("SalesOrderID", "Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "OrderNumber", "OrderDate", "CustomerRef", "CustomerName", "Status", "Description", "FiscalYearRef", "DeliveryDate", "SalesTypeRef", "DeliveryLocationRef", "SettlementMethodRef") VALUES ('14', '2', '1', '2026-10-25 16:08:07.608', '16:08:07', '1', '2026-10-25 16:08:48.263', '16:08:48', '2', '2', NULL, NULL, 3, '2026/10/25', '2', 'علی جهانی', 2, '', '1', NULL, '2', '2', '4');

-- Data for Sle.SalesTypes (1 rows)
INSERT INTO "Sle"."SalesTypes" ("SalesTypeID", "Code", "Title", "Title2", "IsActive", "Description", "BusinessStructureRef", "CompanyRef", "FiscalYearRef", "CreatorRef", "CreationDate", "LastModifierRef", "LastModificationDate") VALUES ('2', 1, 'لطلطی', 'لطلطی', true, '', '2', '2', NULL, '1', '2026-10-24 02:56:33.597', '1', '2026-10-24 02:56:33.597');

-- Data for Sle.SettlementMethods (1 rows)
INSERT INTO "Sle"."SettlementMethods" ("SettlementMethodID", "Version", "Creator", "CreationDate", "CreateTime", "LastModifier", "LastModificationDate", "LastModificationTime", "BusinessStructureRef", "CompanyRef", "BranchRef", "AgencyRef", "Code", "Title", "Title2", "IsActive", "Description") VALUES ('4', '1', '1', '2026-10-23 20:20:40.460', '20:20:40', '1', '2026-10-23 20:20:40.460', '20:20:40', '2', '2', NULL, NULL, 1, 'نقدی', 'k', true, '');

-- ==================== CONSTRAINTS ====================
ALTER TABLE "Acc"."Accounts" ADD CONSTRAINT "CHK_c1ad2f76e8aa75ec7535e496fb" CHECK ("AccountID" <> "ParentID");
ALTER TABLE "Acc"."Accounts" ADD CONSTRAINT "CHK_fbdf5ae8f5cbd633516003acbd" CHECK (length("Code"::text) > 0);
ALTER TABLE "Acc"."Accounts" ADD CONSTRAINT "FK_b8c52fc5e449fe386b50bed4df0" FOREIGN KEY ("ParentID") REFERENCES "Acc"."Accounts"("AccountID") ON DELETE RESTRICT;
ALTER TABLE "Acc"."AccountsNatureAdjusting" ADD CONSTRAINT "FK_70ca9e042eb065ce640685c64ce" FOREIGN KEY ("AccountID") REFERENCES "Acc"."Accounts"("AccountID") ON DELETE RESTRICT;
ALTER TABLE "Acc"."AccountsRelatedDeatailedAccounts" ADD CONSTRAINT "FK_8832c7d02c471e400020f45074a" FOREIGN KEY ("DetailedTypesID") REFERENCES "Acc"."DetailedTypes"("DetailedTypesID") ON DELETE RESTRICT;
ALTER TABLE "Acc"."AccountsRelatedDeatailedAccounts" ADD CONSTRAINT "FK_ef83db641b1b84c8bf08a32ba29" FOREIGN KEY ("AccountID") REFERENCES "Acc"."Accounts"("AccountID") ON DELETE RESTRICT;
ALTER TABLE "Acc"."AccountsVoucherDecriptions" ADD CONSTRAINT "FK_429fcf9cff7a3f1ba2b90b15ac4" FOREIGN KEY ("AccountID") REFERENCES "Acc"."Accounts"("AccountID") ON DELETE CASCADE;
ALTER TABLE "Acc"."ClosingTemporaryAccountItem" ADD CONSTRAINT "FK_4c75c74e0e9f438a494a0d3795f" FOREIGN KEY ("ClosingTemporaryAccountRef") REFERENCES "Acc"."ClosingTemporaryAccount"("ClosingTemporaryAccountID") ON DELETE CASCADE;
ALTER TABLE "Acc"."ClosingTemporaryAccountSelected" ADD CONSTRAINT "FK_b8bd7843f55c6db120e123d217d" FOREIGN KEY ("ClosingTemporaryAccountRef") REFERENCES "Acc"."ClosingTemporaryAccount"("ClosingTemporaryAccountID") ON DELETE CASCADE;
ALTER TABLE "Acc"."CostCenter" ADD CONSTRAINT "CHK_93ff020698ead0f3e48813f1f9" CHECK (length("Code"::text) > 0);
ALTER TABLE "Acc"."CostCenter" ADD CONSTRAINT "FK_5036d8b75893b7ce4554b6ee880" FOREIGN KEY ("DetailedAccountID") REFERENCES "Acc"."DetailedAccounts"("DetailedAccountID") ON DELETE RESTRICT;
ALTER TABLE "Acc"."DetailedAccounts" ADD CONSTRAINT "CHK_b809848a8ce35937bb9cb8a188" CHECK (length("Code"::text) > 0);
ALTER TABLE "Acc"."DetailedAccounts" ADD CONSTRAINT "FK_8678fbaff7671489d36943a980f" FOREIGN KEY ("DetailedTypesID") REFERENCES "Acc"."DetailedTypes"("DetailedTypesID") ON DELETE RESTRICT;
ALTER TABLE "Acc"."DetailedTypes" ADD CONSTRAINT "CHK_ac83f61605b076845f105e87bf" CHECK (length("Code"::text) > 0);
ALTER TABLE "Acc"."DetailedTypes" ADD CONSTRAINT "fk_accdetailedtypes_bsref" FOREIGN KEY ("BusinessStructureRef") REFERENCES "Gnr"."BusinessStructure"("BusinessStructureID") ON DELETE CASCADE;
ALTER TABLE "Acc"."VoucherItem" ADD CONSTRAINT "FK_3f3f739cbf39a033bb96bba56c6" FOREIGN KEY ("VoucherID") REFERENCES "Acc"."Voucher"("VoucherID") ON DELETE CASCADE;
ALTER TABLE "Acc"."VoucherType" ADD CONSTRAINT "CHK_e683f8910f51ccad34ffd33770" CHECK ("Code" >= 0);
ALTER TABLE "Acc"."VoucherType" ADD CONSTRAINT "fk_accvouchertype_bsref" FOREIGN KEY ("BusinessStructureRef") REFERENCES "Gnr"."BusinessStructure"("BusinessStructureID") ON DELETE CASCADE;
ALTER TABLE "Cnt"."Contracts" ADD CONSTRAINT "FK_42e3ca11839699734841d8f0c4b" FOREIGN KEY ("DetailedAccountID") REFERENCES "Acc"."DetailedAccounts"("DetailedAccountID") ON DELETE RESTRICT;
ALTER TABLE "Cnt"."Contracts" ADD CONSTRAINT "FK_a5a4824f754995c61f5f6cab474" FOREIGN KEY ("ProjectID") REFERENCES "Cnt"."Projects"("ProjectID") ON DELETE RESTRICT;
ALTER TABLE "Cnt"."Contracts" ADD CONSTRAINT "FK_f11f6455e276c94f612e9aa4e3a" FOREIGN KEY ("PartyID") REFERENCES "Gnr"."Parties"("PartyID") ON DELETE RESTRICT;
ALTER TABLE "Cnt"."Projects" ADD CONSTRAINT "FK_57ac41e39853f02c5bdb4b07791" FOREIGN KEY ("DetailedAccountID") REFERENCES "Acc"."DetailedAccounts"("DetailedAccountID") ON DELETE RESTRICT;
ALTER TABLE "Dfb"."DynamicForm" ADD CONSTRAINT "UQ_8ed6f31a305b5ca7b534c0517f4" UNIQUE ("FormCode");
ALTER TABLE "Dfb"."DynamicFormRecord" ADD CONSTRAINT "FK_1b74e15ae36ad8ec1d6f9027b59" FOREIGN KEY ("FormRef") REFERENCES "Dfb"."DynamicForm"("DynamicFormID") ON DELETE CASCADE;
ALTER TABLE "Gnr"."BaseSettings" ADD CONSTRAINT "fk_gnrbasesettings_bsref" FOREIGN KEY ("BusinessStructureRef") REFERENCES "Gnr"."BusinessStructure"("BusinessStructureID") ON DELETE CASCADE;
ALTER TABLE "Gnr"."Currency" ADD CONSTRAINT "CHK_d80ef50d0d9abd0c364af93b8e" CHECK ("PrecisionCount" >= 0);
ALTER TABLE "Gnr"."Currency" ADD CONSTRAINT "CHK_e2832153f783101aca36c5b9cf" CHECK ("ExchangeUnit" > 0);
ALTER TABLE "Gnr"."Currency" ADD CONSTRAINT "fk_gnrcurrency_bsref" FOREIGN KEY ("BusinessStructureRef") REFERENCES "Gnr"."BusinessStructure"("BusinessStructureID") ON DELETE CASCADE;
ALTER TABLE "Gnr"."Entities" ADD CONSTRAINT "FK_e9aaed02085e0410a81f6e6a730" FOREIGN KEY ("ParentRef") REFERENCES "Gnr"."Entities"("EntityID");
ALTER TABLE "Gnr"."FiscalYear" ADD CONSTRAINT "CHK_d7a47fe3fe8ce8ca2b215a8fde" CHECK ("EndDate" >= "StartDate");
ALTER TABLE "Gnr"."GeoLocations" ADD CONSTRAINT "fk_gnrgeolocations_bsref" FOREIGN KEY ("BusinessStructureRef") REFERENCES "Gnr"."BusinessStructure"("BusinessStructureID") ON DELETE CASCADE;
ALTER TABLE "Gnr"."IDGeneration" ADD CONSTRAINT "UQ_532df565c230324ddb1d03a4c00" UNIQUE ("TableName");
ALTER TABLE "Gnr"."LicenseActivations" ADD CONSTRAINT "UQ_46fb839e5a307eea6147a7fa4ce" UNIQUE ("licenseSignature");
ALTER TABLE "Gnr"."Parties" ADD CONSTRAINT "CHK_01574b6d6d74d5eb41ad09d390" CHECK ("Nature"::text = ANY (ARRAY['real_person'::character varying::text, 'legal_entity'::character varying::text]));
ALTER TABLE "Gnr"."Parties" ADD CONSTRAINT "FK_3420a5b8d7538db7ff80d2fda38" FOREIGN KEY ("DetailedAccountID") REFERENCES "Acc"."DetailedAccounts"("DetailedAccountID") ON DELETE RESTRICT;
ALTER TABLE "Gnr"."Parties" ADD CONSTRAINT "UQ_3420a5b8d7538db7ff80d2fda38" UNIQUE ("DetailedAccountID");
ALTER TABLE "Gnr"."PartiesAddresses" ADD CONSTRAINT "FK_e9a569f84886fe8e0c19cc5b3de" FOREIGN KEY ("PartyRef") REFERENCES "Gnr"."Parties"("PartyID") ON DELETE CASCADE;
ALTER TABLE "Gnr"."PartiesPhones" ADD CONSTRAINT "FK_8cb6c041eb6ae820726905f7908" FOREIGN KEY ("PartyRef") REFERENCES "Gnr"."Parties"("PartyID") ON DELETE CASCADE;
ALTER TABLE "Gnr"."PartiesRelated" ADD CONSTRAINT "FK_f8fa654947b93933483dc34895b" FOREIGN KEY ("PartyRef") REFERENCES "Gnr"."Parties"("PartyID") ON DELETE CASCADE;
ALTER TABLE "Iam"."BusinessStructureUsers" ADD CONSTRAINT "FK_37db501cbe500aeb2c0328fa3e6" FOREIGN KEY ("UserRef") REFERENCES "Iam"."User"("UserID");
ALTER TABLE "Iam"."Role" ADD CONSTRAINT "UQ_b852abd9e268a63287bc815aab6" UNIQUE (name);
ALTER TABLE "Iam"."RolePermission" ADD CONSTRAINT "FK_2865b1063eb46c1f6239afb1e1b" FOREIGN KEY ("RoleID") REFERENCES "Iam"."Role"("RoleID") ON DELETE CASCADE;
ALTER TABLE "Iam"."RolePermission" ADD CONSTRAINT "FK_a1ba6008f1492b8d9cde2404d05" FOREIGN KEY ("PermissionID") REFERENCES "Iam"."Permission"("PermissionID") ON DELETE CASCADE;
ALTER TABLE "Iam"."User" ADD CONSTRAINT "FK_0bde66784f6789a6c2691caa373" FOREIGN KEY ("BusinessStructureID") REFERENCES "Gnr"."BusinessStructure"("BusinessStructureID");
ALTER TABLE "Iam"."User" ADD CONSTRAINT "FK_50a45f55c32b8a6efd518439cbb" FOREIGN KEY ("UserGroupRef") REFERENCES "Iam"."UserGroups"("UserGroupID");
ALTER TABLE "Iam"."User" ADD CONSTRAINT "UQ_29a05908a0fa0728526d2833657" UNIQUE (username);
ALTER TABLE "Iam"."UserGroupPermissions" ADD CONSTRAINT "FK_8daa991c6b417e92f8d54dc34aa" FOREIGN KEY ("UserGroupRef") REFERENCES "Iam"."UserGroups"("UserGroupID") ON DELETE CASCADE;
ALTER TABLE "Iam"."UserRole" ADD CONSTRAINT "FK_041c761beadf1e2abf00c201f51" FOREIGN KEY ("RoleID") REFERENCES "Iam"."Role"("RoleID") ON DELETE CASCADE;
ALTER TABLE "Iam"."UserRole" ADD CONSTRAINT "FK_28a2fdb904ed0e1badb0fa0c92a" FOREIGN KEY ("UserID") REFERENCES "Iam"."User"("UserID") ON DELETE CASCADE;
ALTER TABLE "Inv"."ItemRequestDetails" ADD CONSTRAINT "FK_81246070ae7b0f7be2e753ebacd" FOREIGN KEY ("ItemRequestRef") REFERENCES "Inv"."ItemRequests"("ItemRequestID") ON DELETE CASCADE;
ALTER TABLE "Inv"."ItemRequestDetails" ADD CONSTRAINT "FK_9dd6fc0dbc32cf93ba3b4e4e4a7" FOREIGN KEY ("ItemRef") REFERENCES "Inv"."Items"("ItemID");
ALTER TABLE "Inv"."ItemRequestTrackingFactors" ADD CONSTRAINT "FK_fd8294c7508e8fa19e48a49573a" FOREIGN KEY ("ItemRequestDetailRef") REFERENCES "Inv"."ItemRequestDetails"("ItemRequestDetailID") ON DELETE CASCADE;
ALTER TABLE "Inv"."ItemServiceGroupFields" ADD CONSTRAINT "FK_2a69291b3bb95d9046eb373664d" FOREIGN KEY ("ItemServiceGroupRef") REFERENCES "Inv"."ItemServiceGroups"("ItemServiceGroupID") ON DELETE CASCADE;
ALTER TABLE "Inv"."ItemServiceGroupRelatedProducts" ADD CONSTRAINT "FK_e2fa55a171cfc9ae9e525aa17ef" FOREIGN KEY ("ItemServiceGroupRef") REFERENCES "Inv"."ItemServiceGroups"("ItemServiceGroupID") ON DELETE CASCADE;
ALTER TABLE "Inv"."ItemServiceGroups" ADD CONSTRAINT "FK_29be88e24848cbd911e6860032a" FOREIGN KEY ("ParentRef") REFERENCES "Inv"."ItemServiceGroups"("ItemServiceGroupID") ON DELETE CASCADE;
ALTER TABLE "Inv"."ItemSupplyRequestDetails" ADD CONSTRAINT "FK_d5827317bbd374e67f4a3c74ba5" FOREIGN KEY ("ItemSupplyRequestRef") REFERENCES "Inv"."ItemSupplyRequests"("ItemSupplyRequestID") ON DELETE CASCADE;
ALTER TABLE "Inv"."ItemSupplyRequestDetails" ADD CONSTRAINT "FK_ea141a9d1fd5e8c3803f630fe0d" FOREIGN KEY ("ItemRef") REFERENCES "Inv"."Items"("ItemID");
ALTER TABLE "Inv"."ItemSupplyRequestTrackingFactors" ADD CONSTRAINT "FK_e233013be9b28a3ed31672a8d1f" FOREIGN KEY ("ItemSupplyRequestDetailRef") REFERENCES "Inv"."ItemSupplyRequestDetails"("ItemSupplyRequestDetailID") ON DELETE CASCADE;
ALTER TABLE "Inv"."ItemSupplyRequests" ADD CONSTRAINT "FK_32e4b30f6cfc9cfcdb18774de60" FOREIGN KEY ("RequesterRef") REFERENCES "Acc"."DetailedAccounts"("DetailedAccountID");
ALTER TABLE "Inv"."PurchaseInvoiceDetails" ADD CONSTRAINT "FK_5c675ca27d59ef2d516a1cf4c95" FOREIGN KEY ("PurchaseInvoiceRef") REFERENCES "Inv"."PurchaseInvoices"("PurchaseInvoiceID") ON DELETE CASCADE;
ALTER TABLE "Inv"."PurchaseInvoiceDetails" ADD CONSTRAINT "FK_6a498f00990eff8726ddbf582dc" FOREIGN KEY ("ItemRef") REFERENCES "Inv"."Items"("ItemID");
ALTER TABLE "Inv"."PurchaseInvoiceFactors" ADD CONSTRAINT "FK_7d86ba89e054db481113c555bea" FOREIGN KEY ("PurchaseInvoiceRef") REFERENCES "Inv"."PurchaseInvoices"("PurchaseInvoiceID") ON DELETE CASCADE;
ALTER TABLE "Inv"."PurchaseInvoiceTrackingFactors" ADD CONSTRAINT "FK_6f59f882ba6837e73ee74cb76d8" FOREIGN KEY ("PurchaseInvoiceDetailRef") REFERENCES "Inv"."PurchaseInvoiceDetails"("PurchaseInvoiceDetailID") ON DELETE CASCADE;
ALTER TABLE "Inv"."ServicePurchaseInvoiceDetails" ADD CONSTRAINT "FK_6adbca1ba76b470d2e6ee477656" FOREIGN KEY ("ServicePurchaseInvoiceRef") REFERENCES "Inv"."ServicePurchaseInvoices"("ServicePurchaseInvoiceID") ON DELETE CASCADE;
ALTER TABLE "Inv"."ServicePurchaseInvoiceDetails" ADD CONSTRAINT "FK_b45e193f0108d0086fb23cf8811" FOREIGN KEY ("ItemRef") REFERENCES "Inv"."Items"("ItemID");
ALTER TABLE "Inv"."ServicePurchaseInvoiceFactors" ADD CONSTRAINT "FK_e16a9ede00f2611c0e3a6801db2" FOREIGN KEY ("ServicePurchaseInvoiceRef") REFERENCES "Inv"."ServicePurchaseInvoices"("ServicePurchaseInvoiceID") ON DELETE CASCADE;
ALTER TABLE "Inv"."ServiceRequestDetails" ADD CONSTRAINT "FK_8dabee1f7f8410b6d7b666d89ba" FOREIGN KEY ("ItemRef") REFERENCES "Inv"."Items"("ItemID");
ALTER TABLE "Inv"."ServiceRequestDetails" ADD CONSTRAINT "FK_d4a20aa47c3c763b7dcfdedd0c0" FOREIGN KEY ("ServiceRequestRef") REFERENCES "Inv"."ServiceRequests"("ServiceRequestID") ON DELETE CASCADE;
ALTER TABLE "Inv"."ServiceSupplyRequestDetails" ADD CONSTRAINT "FK_3119389b75020a7f60bcf585cd5" FOREIGN KEY ("ItemRef") REFERENCES "Inv"."Items"("ItemID");
ALTER TABLE "Inv"."ServiceSupplyRequestDetails" ADD CONSTRAINT "FK_991af690fff24a78d6a38ef4f04" FOREIGN KEY ("ServiceSupplyRequestRef") REFERENCES "Inv"."ServiceSupplyRequests"("ServiceSupplyRequestID") ON DELETE CASCADE;
ALTER TABLE "Inv"."ServiceSupplyRequests" ADD CONSTRAINT "FK_f7146733ed010809216c324bf82" FOREIGN KEY ("RequesterRef") REFERENCES "Acc"."DetailedAccounts"("DetailedAccountID");
ALTER TABLE "Inv"."StocktakingCountDetails" ADD CONSTRAINT "FK_0564d61c81b6ae524c8023f527a" FOREIGN KEY ("StocktakingCountRef") REFERENCES "Inv"."StocktakingCounts"("StocktakingCountID") ON DELETE CASCADE;
ALTER TABLE "Inv"."StocktakingCountTrackingFactors" ADD CONSTRAINT "FK_e0036ccf8f0e9d311638c844a0a" FOREIGN KEY ("StocktakingCountDetailRef") REFERENCES "Inv"."StocktakingCountDetails"("StocktakingCountDetailID") ON DELETE CASCADE;
ALTER TABLE "Inv"."StocktakingSettingWarehouses" ADD CONSTRAINT "FK_96945eb886dca6c288f5b5b930b" FOREIGN KEY ("StocktakingSettingRef") REFERENCES "Inv"."StocktakingSettings"("StocktakingSettingID") ON DELETE CASCADE;
ALTER TABLE "Inv"."StocktakingTagDetails" ADD CONSTRAINT "FK_f6e521a308dd7ef56d46def65bd" FOREIGN KEY ("StocktakingTagHeaderRef") REFERENCES "Inv"."StocktakingTagHeaders"("StocktakingTagHeaderID") ON DELETE CASCADE;
ALTER TABLE "Inv"."TemporaryItemReceiptDetails" ADD CONSTRAINT "FK_a862e050090e530bd8f8be4a88b" FOREIGN KEY ("TemporaryItemReceiptRef") REFERENCES "Inv"."TemporaryItemReceipts"("TemporaryItemReceiptID") ON DELETE CASCADE;
ALTER TABLE "Inv"."TemporaryItemReceiptFactors" ADD CONSTRAINT "FK_257641a75ca80e1a7486cbf339c" FOREIGN KEY ("TemporaryItemReceiptRef") REFERENCES "Inv"."TemporaryItemReceipts"("TemporaryItemReceiptID") ON DELETE CASCADE;
ALTER TABLE "Inv"."TemporaryItemReceiptTrackingFactors" ADD CONSTRAINT "FK_56ebe92747996459bc5c4097799" FOREIGN KEY ("TemporaryItemReceiptDetailRef") REFERENCES "Inv"."TemporaryItemReceiptDetails"("TemporaryItemReceiptDetailID") ON DELETE CASCADE;
ALTER TABLE "Inv"."TrackingFactorConstantValue" ADD CONSTRAINT "FK_5972c615ed25a0ef034eda1dd49" FOREIGN KEY ("TrackingFactorRef") REFERENCES "Inv"."TrackingFactors"("TrackingFactorID") ON DELETE CASCADE;
ALTER TABLE "Inv"."TrackingFactorItemRelated" ADD CONSTRAINT "FK_6825daf613e1ad314ba11fab4ca" FOREIGN KEY ("ItemRef") REFERENCES "Inv"."Items"("ItemID") ON DELETE CASCADE;
ALTER TABLE "Inv"."TrackingFactorItemRelated" ADD CONSTRAINT "FK_9a39ae0c555c94a099c93d3c210" FOREIGN KEY ("TrackingFactorRef") REFERENCES "Inv"."TrackingFactors"("TrackingFactorID") ON DELETE CASCADE;
ALTER TABLE "Inv"."WarehouseIssueTrackingFactors" ADD CONSTRAINT "FK_8fe4ccf0fc021ab4ffdb0cb853a" FOREIGN KEY ("WarehouseIssueDetailRef") REFERENCES "Inv"."WarehouseVouchersDetails"("WarehouseReceiptDetailID") ON DELETE CASCADE;
ALTER TABLE "Inv"."WarehouseReceiptTrackingFactors" ADD CONSTRAINT "FK_ad7f41a327a00e831360e6c4d24" FOREIGN KEY ("WarehouseReceiptDetailRef") REFERENCES "Inv"."WarehouseVouchersDetails"("WarehouseReceiptDetailID") ON DELETE CASCADE;
ALTER TABLE "Inv"."WarehouseVouchersDetails" ADD CONSTRAINT "FK_c9981c4300f71808cf0d74437ce" FOREIGN KEY ("WarehouseReceiptRef") REFERENCES "Inv"."WarehouseVouchers"("WarehouseReceiptID") ON DELETE CASCADE;
ALTER TABLE "Inv"."WarehouseVouchersFactors" ADD CONSTRAINT "FK_1f3271098ba67dbe82847fced32" FOREIGN KEY ("WarehouseReceiptRef") REFERENCES "Inv"."WarehouseVouchers"("WarehouseReceiptID") ON DELETE CASCADE;
ALTER TABLE "Rap"."BankAccountTypes" ADD CONSTRAINT "fk_rapbankaccounttypes_bsref" FOREIGN KEY ("BusinessStructureRef") REFERENCES "Gnr"."BusinessStructure"("BusinessStructureID") ON DELETE CASCADE;
ALTER TABLE "Rap"."BankAccounts" ADD CONSTRAINT "FK_20785a7e1269ff0c6d5ea4048f8" FOREIGN KEY ("BankBranchRef") REFERENCES "Rap"."BankBranchs"("BankBranchID") ON DELETE RESTRICT;
ALTER TABLE "Rap"."BankAccounts" ADD CONSTRAINT "FK_98e39e34a7d0d562b84542d8519" FOREIGN KEY ("CurrencyRef") REFERENCES "Gnr"."Currency"("CurrencyID") ON DELETE RESTRICT;
ALTER TABLE "Rap"."BankAccounts" ADD CONSTRAINT "FK_a71a0cead9162797d446ea87efe" FOREIGN KEY ("BankAccountTypeRef") REFERENCES "Rap"."BankAccountTypes"("BankAccountTypeID") ON DELETE RESTRICT;
ALTER TABLE "Rap"."BankAccounts" ADD CONSTRAINT "FK_af6deb0f44d3bfa4a6e52c39b80" FOREIGN KEY ("AccountRef") REFERENCES "Acc"."Accounts"("AccountID") ON DELETE RESTRICT;
ALTER TABLE "Rap"."BankBranchs" ADD CONSTRAINT "FK_c435d1aaf0e586e7dccf8486476" FOREIGN KEY ("CityRef") REFERENCES "Gnr"."GeoLocations"("GeolocationID") ON DELETE RESTRICT;
ALTER TABLE "Rap"."BankBranchs" ADD CONSTRAINT "FK_f813cfb6e463af319b76e23f6c4" FOREIGN KEY ("BankID") REFERENCES "Rap"."Banks"("BankID") ON DELETE RESTRICT;
ALTER TABLE "Rap"."BankReconciliation" ADD CONSTRAINT "FK_12b04fdc615c4b03aafbdbebd82" FOREIGN KEY ("BankAccountRef") REFERENCES "Rap"."BankAccounts"("BankAccountID") ON DELETE RESTRICT;
ALTER TABLE "Rap"."BankReconciliation" ADD CONSTRAINT "FK_d2036912108058a33c65996193a" FOREIGN KEY ("ReconcileBankStatementRef") REFERENCES "Rap"."ReconcileBankStatement"("ReconcileBankStatementID") ON DELETE RESTRICT;
ALTER TABLE "Rap"."BankReconciliationItem" ADD CONSTRAINT "FK_42a734889735d302ef1cf50b51c" FOREIGN KEY ("BankStatementItemRef") REFERENCES "Rap"."ReconcileBankStatementItem"("ReconcileBankStatementItemID") ON DELETE RESTRICT;
ALTER TABLE "Rap"."BankReconciliationItem" ADD CONSTRAINT "FK_da3a11a8c7ce95f2e6dd96caeae" FOREIGN KEY ("BankReconciliationRef") REFERENCES "Rap"."BankReconciliation"("BankReconciliationID") ON DELETE CASCADE;
ALTER TABLE "Rap"."Banks" ADD CONSTRAINT "fk_rapbanks_bsref" FOREIGN KEY ("BusinessStructureRef") REFERENCES "Gnr"."BusinessStructure"("BusinessStructureID") ON DELETE CASCADE;
ALTER TABLE "Rap"."Cashes" ADD CONSTRAINT "FK_2632cafecd8642783b44f1f0115" FOREIGN KEY ("DetailedAccountID") REFERENCES "Acc"."DetailedAccounts"("DetailedAccountID") ON DELETE RESTRICT;
ALTER TABLE "Rap"."Cashes" ADD CONSTRAINT "FK_e09e0ba7edadf938cd9a2f17dd5" FOREIGN KEY ("CurrencyID") REFERENCES "Gnr"."Currency"("CurrencyID");
ALTER TABLE "Rap"."Cashiers" ADD CONSTRAINT "FK_0d82b949fe43677005905c5d3e4" FOREIGN KEY ("CashID") REFERENCES "Rap"."Cashes"("CashID") ON DELETE RESTRICT;
ALTER TABLE "Rap"."Cashiers" ADD CONSTRAINT "FK_be3aee8b51ecd62b41b93b7e64a" FOREIGN KEY ("UserID") REFERENCES "Iam"."User"("UserID");
ALTER TABLE "Rap"."ChequebookItems" ADD CONSTRAINT "FK_4613fd9de8ac786a8097ebac945" FOREIGN KEY ("ChequebookRef") REFERENCES "Rap"."Chequebooks"("ChequebookID") ON DELETE CASCADE;
ALTER TABLE "Rap"."Chequebooks" ADD CONSTRAINT "FK_45395921bcb1fddbc7080cb58c2" FOREIGN KEY ("BankAccountRef") REFERENCES "Rap"."BankAccounts"("BankAccountID");
ALTER TABLE "Rap"."PaidDocumentClearing" ADD CONSTRAINT "FK_595244d2ecbe017923598abf104" FOREIGN KEY ("VoucherHeaderRef") REFERENCES "Acc"."Voucher"("VoucherID") ON DELETE SET NULL;
ALTER TABLE "Rap"."PaidDocumentClearing" ADD CONSTRAINT "FK_862865f3835d1c30a86d7648074" FOREIGN KEY ("BankAccountRef") REFERENCES "Rap"."BankAccounts"("BankAccountID");
ALTER TABLE "Rap"."PaidDocumentClearingItem" ADD CONSTRAINT "FK_cac5e1dc0970810ed28921fb14f" FOREIGN KEY ("PaidDocumentClearingRef") REFERENCES "Rap"."PaidDocumentClearing"("PaidDocumentClearingID") ON DELETE CASCADE;
ALTER TABLE "Rap"."PaymentAssignment" ADD CONSTRAINT "FK_47a01cfb7ab8d4bdfda7d07c95b" FOREIGN KEY ("PaymentNotificationRef") REFERENCES "Rap"."PaymentNotifications"("PaymentNotificationID") ON DELETE CASCADE;
ALTER TABLE "Rap"."PaymentAssignment" ADD CONSTRAINT "FK_4994b8c76acaf39cd4861534f62" FOREIGN KEY ("ReceiptChequeRef") REFERENCES "Rap"."ReceiptCheque"("ReceiptChequeID");
ALTER TABLE "Rap"."PaymentAssignment" ADD CONSTRAINT "FK_4e419b52118265d97d7803b5ea4" FOREIGN KEY ("ReasonRef") REFERENCES "Rap"."Reasons"("RapReasonID");
ALTER TABLE "Rap"."PaymentAssignment" ADD CONSTRAINT "FK_e5541dae9b14c0b94e0892f64eb" FOREIGN KEY ("AccountingSettingRef") REFERENCES "Rap"."RecieptAndPaymentAccountingSetting"("RecieptAndPaymentAccountingSettingID");
ALTER TABLE "Rap"."PaymentCash" ADD CONSTRAINT "FK_4bcc2e6bc31ca853476caae6ccd" FOREIGN KEY ("PaymentNotificationRef") REFERENCES "Rap"."PaymentNotifications"("PaymentNotificationID") ON DELETE CASCADE;
ALTER TABLE "Rap"."PaymentCash" ADD CONSTRAINT "FK_4d9f904fec47f370b6ccb7dd477" FOREIGN KEY ("ReasonRef") REFERENCES "Rap"."Reasons"("RapReasonID");
ALTER TABLE "Rap"."PaymentCash" ADD CONSTRAINT "FK_8124aca14230194158b9d7c5643" FOREIGN KEY ("AccountingSettingRef") REFERENCES "Rap"."RecieptAndPaymentAccountingSetting"("RecieptAndPaymentAccountingSettingID");
ALTER TABLE "Rap"."PaymentCash" ADD CONSTRAINT "FK_a5559082054a4bc4501280cb183" FOREIGN KEY ("CashRef") REFERENCES "Rap"."Cashes"("CashID");
ALTER TABLE "Rap"."PaymentCheque" ADD CONSTRAINT "FK_214bad59d53dd4b7debc6a2b92c" FOREIGN KEY ("PaymentNotificationRef") REFERENCES "Rap"."PaymentNotifications"("PaymentNotificationID") ON DELETE CASCADE;
ALTER TABLE "Rap"."PaymentCheque" ADD CONSTRAINT "FK_72f1671d4d1df4090e5bc71ea73" FOREIGN KEY ("ReasonRef") REFERENCES "Rap"."Reasons"("RapReasonID");
ALTER TABLE "Rap"."PaymentCheque" ADD CONSTRAINT "FK_b7c73ddeb9f275fffffdc6dc8aa" FOREIGN KEY ("BankAccountRef") REFERENCES "Rap"."BankAccounts"("BankAccountID");
ALTER TABLE "Rap"."PaymentCheque" ADD CONSTRAINT "FK_bf941a921d783320b49632c1333" FOREIGN KEY ("ChequebookRef") REFERENCES "Rap"."Chequebooks"("ChequebookID");
ALTER TABLE "Rap"."PaymentCheque" ADD CONSTRAINT "FK_ef2ebb024b830114e033db8bd5d" FOREIGN KEY ("AccountingSettingRef") REFERENCES "Rap"."RecieptAndPaymentAccountingSetting"("RecieptAndPaymentAccountingSettingID");
ALTER TABLE "Rap"."PaymentGatewayContacts" ADD CONSTRAINT "FK_a4c68c227ecdc81232953c605b6" FOREIGN KEY ("PaymentGatewayRef") REFERENCES "Rap"."PaymentGateways"("PaymentGatewayID") ON DELETE CASCADE;
ALTER TABLE "Rap"."PaymentGateways" ADD CONSTRAINT "FK_8f00ccbc7d666272d50bc2b4936" FOREIGN KEY ("DetailedAccountRef") REFERENCES "Acc"."DetailedAccounts"("DetailedAccountID") ON DELETE RESTRICT;
ALTER TABLE "Rap"."PaymentGateways" ADD CONSTRAINT "FK_9fb8ac1c12d58f104849626372b" FOREIGN KEY ("PartiesRef") REFERENCES "Gnr"."Parties"("PartyID") ON DELETE RESTRICT;
ALTER TABLE "Rap"."PaymentGateways" ADD CONSTRAINT "FK_b01ed140b6947159f6c27be5ade" FOREIGN KEY ("BankAccountRef") REFERENCES "Rap"."BankAccounts"("BankAccountID") ON DELETE RESTRICT;
ALTER TABLE "Rap"."PaymentGuarantee" ADD CONSTRAINT "FK_20a63e56de220feb5a229a3b50f" FOREIGN KEY ("CashRef") REFERENCES "Rap"."Cashes"("CashID");
ALTER TABLE "Rap"."PaymentGuarantee" ADD CONSTRAINT "FK_33aec882a6d0ff029d2649c00d4" FOREIGN KEY ("PaymentNotificationRef") REFERENCES "Rap"."PaymentNotifications"("PaymentNotificationID") ON DELETE CASCADE;
ALTER TABLE "Rap"."PaymentGuarantee" ADD CONSTRAINT "FK_45b9464141bd17f0c3ea151aa0b" FOREIGN KEY ("ReasonRef") REFERENCES "Rap"."Reasons"("RapReasonID");
ALTER TABLE "Rap"."PaymentGuarantee" ADD CONSTRAINT "FK_5d48bf360082d0f6321abe1d16a" FOREIGN KEY ("BankRef") REFERENCES "Rap"."Banks"("BankID");
ALTER TABLE "Rap"."PaymentGuarantee" ADD CONSTRAINT "FK_a81628e84a01d1c184af34eb82d" FOREIGN KEY ("BankAccountRef") REFERENCES "Rap"."BankAccounts"("BankAccountID");
ALTER TABLE "Rap"."PaymentGuarantee" ADD CONSTRAINT "FK_ac90118d1404d6b70f4c63e7dd3" FOREIGN KEY ("CurrencyRef") REFERENCES "Gnr"."Currency"("CurrencyID");
ALTER TABLE "Rap"."PaymentGuarantee" ADD CONSTRAINT "FK_f16c1a998772d6b1296d3a2c78c" FOREIGN KEY ("AccountingSettingRef") REFERENCES "Rap"."RecieptAndPaymentAccountingSetting"("RecieptAndPaymentAccountingSettingID");
ALTER TABLE "Rap"."PaymentNotifications" ADD CONSTRAINT "FK_7a33f6e60630928558198d2dd66" FOREIGN KEY ("VoucherHeaderRef") REFERENCES "Acc"."Voucher"("VoucherID") ON DELETE SET NULL;
ALTER TABLE "Rap"."PaymentNotifications" ADD CONSTRAINT "FK_7f205aaa5fb1f8b91ceeb435150" FOREIGN KEY ("PartyRef") REFERENCES "Gnr"."Parties"("PartyID");
ALTER TABLE "Rap"."PaymentNotifications" ADD CONSTRAINT "FK_cba7ac8c983d4f0f86b0cc3ee6c" FOREIGN KEY ("CurrencyRef") REFERENCES "Gnr"."Currency"("CurrencyID");
ALTER TABLE "Rap"."PaymentPromissoryNote" ADD CONSTRAINT "FK_2a08b23ec40a521c6ce89160935" FOREIGN KEY ("AccountingSettingRef") REFERENCES "Rap"."RecieptAndPaymentAccountingSetting"("RecieptAndPaymentAccountingSettingID");
ALTER TABLE "Rap"."PaymentPromissoryNote" ADD CONSTRAINT "FK_2f487631e55c5afbcb0fbac82af" FOREIGN KEY ("PromissoryNoteItemRef") REFERENCES "Rap"."PromissoryNoteItems"("PromissoryNoteItemID");
ALTER TABLE "Rap"."PaymentPromissoryNote" ADD CONSTRAINT "FK_64f090d220584e17fcb7fa7cb72" FOREIGN KEY ("ReasonRef") REFERENCES "Rap"."Reasons"("RapReasonID");
ALTER TABLE "Rap"."PaymentPromissoryNote" ADD CONSTRAINT "FK_9d1c241ef88a2a47d3ceaba52ca" FOREIGN KEY ("CurrencyRef") REFERENCES "Gnr"."Currency"("CurrencyID");
ALTER TABLE "Rap"."PaymentPromissoryNote" ADD CONSTRAINT "FK_b615222e887823664c1175e3a8a" FOREIGN KEY ("PaymentNotificationRef") REFERENCES "Rap"."PaymentNotifications"("PaymentNotificationID") ON DELETE CASCADE;
ALTER TABLE "Rap"."PaymentReturnedReceivedCheque" ADD CONSTRAINT "FK_5a9bd78e69fb1fa7c074746ddf1" FOREIGN KEY ("PaymentNotificationRef") REFERENCES "Rap"."PaymentNotifications"("PaymentNotificationID") ON DELETE CASCADE;
ALTER TABLE "Rap"."PaymentReturnedReceivedCheque" ADD CONSTRAINT "FK_699abe003f8009a02d0cd9308e1" FOREIGN KEY ("ReceiptChequeRef") REFERENCES "Rap"."ReceiptCheque"("ReceiptChequeID");
ALTER TABLE "Rap"."PaymentReturnedReceivedCheque" ADD CONSTRAINT "FK_6d19f5b441743d63f6de47af741" FOREIGN KEY ("CashRef") REFERENCES "Rap"."Cashes"("CashID");
ALTER TABLE "Rap"."PaymentReturnedReceivedCheque" ADD CONSTRAINT "FK_cd2679b553d678c3f03d3220bfb" FOREIGN KEY ("ReasonRef") REFERENCES "Rap"."Reasons"("RapReasonID");
ALTER TABLE "Rap"."PaymentReturnedReceivedCheque" ADD CONSTRAINT "FK_f30f49b7cd16a13df7c31cc24fb" FOREIGN KEY ("AccountingSettingRef") REFERENCES "Rap"."RecieptAndPaymentAccountingSetting"("RecieptAndPaymentAccountingSettingID");
ALTER TABLE "Rap"."PaymentReturnedReceivedPromissoryNote" ADD CONSTRAINT "FK_337d4c0de5dfd6843dc947ebe58" FOREIGN KEY ("PaymentNotificationRef") REFERENCES "Rap"."PaymentNotifications"("PaymentNotificationID") ON DELETE CASCADE;
ALTER TABLE "Rap"."PaymentReturnedReceivedPromissoryNote" ADD CONSTRAINT "FK_52ef7244b0c93807f573d2d5b2e" FOREIGN KEY ("AccountingSettingRef") REFERENCES "Rap"."RecieptAndPaymentAccountingSetting"("RecieptAndPaymentAccountingSettingID");
ALTER TABLE "Rap"."PaymentReturnedReceivedPromissoryNote" ADD CONSTRAINT "FK_8a07de22dd8bfb62d23596a3808" FOREIGN KEY ("ReceiptPromissoryNoteRef") REFERENCES "Rap"."ReceiptPromissoryNote"("ReceiptPromissoryNoteID");
ALTER TABLE "Rap"."PaymentReturnedReceivedPromissoryNote" ADD CONSTRAINT "FK_c126f9cf0fc3696df36b15c5156" FOREIGN KEY ("ReasonRef") REFERENCES "Rap"."Reasons"("RapReasonID");
ALTER TABLE "Rap"."PaymentWithdrawal" ADD CONSTRAINT "FK_28c1644443d30ead0c4197077fc" FOREIGN KEY ("ReasonRef") REFERENCES "Rap"."Reasons"("RapReasonID");
ALTER TABLE "Rap"."PaymentWithdrawal" ADD CONSTRAINT "FK_39beebd9699d2ab354ecc12616d" FOREIGN KEY ("BankAccountRef") REFERENCES "Rap"."BankAccounts"("BankAccountID");
ALTER TABLE "Rap"."PaymentWithdrawal" ADD CONSTRAINT "FK_a51d6fd5f2adfb203c8f85a1e19" FOREIGN KEY ("PaymentNotificationRef") REFERENCES "Rap"."PaymentNotifications"("PaymentNotificationID") ON DELETE CASCADE;
ALTER TABLE "Rap"."PaymentWithdrawal" ADD CONSTRAINT "FK_ab1547b266f20cc43bf9350722b" FOREIGN KEY ("AccountingSettingRef") REFERENCES "Rap"."RecieptAndPaymentAccountingSetting"("RecieptAndPaymentAccountingSettingID");
ALTER TABLE "Rap"."PettyCashRequests" ADD CONSTRAINT "FK_5b34fc42a799fba6233c4911d22" FOREIGN KEY ("PettyCashRef") REFERENCES "Rap"."PettyCashes"("PettyCashID");
ALTER TABLE "Rap"."PettyCashRequests" ADD CONSTRAINT "FK_8985b8720879d3be6fa8c76b27f" FOREIGN KEY ("PettyCashSummaryRef") REFERENCES "Rap"."PettyCashSummaries"("pettyCashSummaryId");
ALTER TABLE "Rap"."PettyCashSummaries" ADD CONSTRAINT "FK_288e6bf837e47928aa41c2fc69d" FOREIGN KEY ("VoucherHeaderRef") REFERENCES "Acc"."Voucher"("VoucherID") ON DELETE SET NULL;
ALTER TABLE "Rap"."PettyCashSummaries" ADD CONSTRAINT "FK_9c075859226cfbdc7c849851505" FOREIGN KEY ("PettyCashRef") REFERENCES "Rap"."PettyCashes"("PettyCashID");
ALTER TABLE "Rap"."PettyCashSummaryItems" ADD CONSTRAINT "FK_134aeb02ae8a12b893f69bb90e0" FOREIGN KEY ("ReasonRef") REFERENCES "Rap"."Reasons"("RapReasonID");
ALTER TABLE "Rap"."PettyCashSummaryItems" ADD CONSTRAINT "FK_271534484d6c6a451d54adc8d66" FOREIGN KEY ("PettyCashSummaryRef") REFERENCES "Rap"."PettyCashSummaries"("pettyCashSummaryId") ON DELETE CASCADE;
ALTER TABLE "Rap"."PettyCashes" ADD CONSTRAINT "FK_355ddba3f35ea584a6cda9e5b4a" FOREIGN KEY ("PartyRef") REFERENCES "Gnr"."Parties"("PartyID") ON DELETE RESTRICT;
ALTER TABLE "Rap"."PettyCashes" ADD CONSTRAINT "FK_ecb19029d55a831c5200efd4229" FOREIGN KEY ("CurrencyID") REFERENCES "Gnr"."Currency"("CurrencyID");
ALTER TABLE "Rap"."PettyCashes" ADD CONSTRAINT "FK_ed1f21b5c7d796e7c9b8eeb063f" FOREIGN KEY ("AccountRef") REFERENCES "Acc"."Accounts"("AccountID") ON DELETE RESTRICT;
ALTER TABLE "Rap"."PromissoryNoteItems" ADD CONSTRAINT "FK_86f5ba95d88a80b6e73ebd6bdfa" FOREIGN KEY ("PromissoryNoteRef") REFERENCES "Rap"."PromissoryNotes"("PromissoryNoteID");
ALTER TABLE "Rap"."PromissoryNotes" ADD CONSTRAINT "FK_f26f5638aa07ac172cba3fda627" FOREIGN KEY ("CashRef") REFERENCES "Rap"."Cashes"("CashID");
ALTER TABLE "Rap"."Reasons" ADD CONSTRAINT "FK_0e63ef46dbf15939ac43dd2258e" FOREIGN KEY ("CompanyRef") REFERENCES "Gnr"."BusinessStructure"("BusinessStructureID");
ALTER TABLE "Rap"."Reasons" ADD CONSTRAINT "FK_26b01402ebed168d37066d004e4" FOREIGN KEY ("BusinessStructureRef") REFERENCES "Gnr"."BusinessStructure"("BusinessStructureID");
ALTER TABLE "Rap"."Reasons" ADD CONSTRAINT "FK_411767e4c90ac86c869255a310c" FOREIGN KEY ("ParentRef") REFERENCES "Rap"."Reasons"("RapReasonID");
ALTER TABLE "Rap"."ReceiptCash" ADD CONSTRAINT "FK_186ab6e5be05bc380be941944dd" FOREIGN KEY ("AccountingSettingRef") REFERENCES "Rap"."RecieptAndPaymentAccountingSetting"("RecieptAndPaymentAccountingSettingID");
ALTER TABLE "Rap"."ReceiptCash" ADD CONSTRAINT "FK_86cdc73f437ae75b56a774b1423" FOREIGN KEY ("ReasonRef") REFERENCES "Rap"."Reasons"("RapReasonID");
ALTER TABLE "Rap"."ReceiptCash" ADD CONSTRAINT "FK_94102219ff1848df534a0128371" FOREIGN KEY ("CashRef") REFERENCES "Rap"."Cashes"("CashID");
ALTER TABLE "Rap"."ReceiptCash" ADD CONSTRAINT "FK_a81f281d3db31fd46509af18947" FOREIGN KEY ("ReceiptNotificationRef") REFERENCES "Rap"."ReceiptNotifications"("ReceiptNotificationID") ON DELETE CASCADE;
ALTER TABLE "Rap"."ReceiptCheque" ADD CONSTRAINT "FK_04e599abb73befdc9f1f0985ed6" FOREIGN KEY ("ReceiptNotificationRef") REFERENCES "Rap"."ReceiptNotifications"("ReceiptNotificationID") ON DELETE CASCADE;
ALTER TABLE "Rap"."ReceiptCheque" ADD CONSTRAINT "FK_774088fd1c4bfb109a1ee28095f" FOREIGN KEY ("ReasonRef") REFERENCES "Rap"."Reasons"("RapReasonID");
ALTER TABLE "Rap"."ReceiptCheque" ADD CONSTRAINT "FK_a32cedbebac591af9d37cb31c9d" FOREIGN KEY ("AccountingSettingRef") REFERENCES "Rap"."RecieptAndPaymentAccountingSetting"("RecieptAndPaymentAccountingSettingID");
ALTER TABLE "Rap"."ReceiptCheque" ADD CONSTRAINT "FK_b2f40c25380c4cf17fd47c9913b" FOREIGN KEY ("BankRef") REFERENCES "Rap"."Banks"("BankID");
ALTER TABLE "Rap"."ReceiptCheque" ADD CONSTRAINT "FK_f297d7c366aaa10753220d5333e" FOREIGN KEY ("CashRef") REFERENCES "Rap"."Cashes"("CashID");
ALTER TABLE "Rap"."ReceiptDeposit" ADD CONSTRAINT "FK_da0ba5cd0847a1ff3b577936fc6" FOREIGN KEY ("ReasonRef") REFERENCES "Rap"."Reasons"("RapReasonID");
ALTER TABLE "Rap"."ReceiptDeposit" ADD CONSTRAINT "FK_da785ff3af0b4df8e3717662aba" FOREIGN KEY ("ReceiptNotificationRef") REFERENCES "Rap"."ReceiptNotifications"("ReceiptNotificationID") ON DELETE CASCADE;
ALTER TABLE "Rap"."ReceiptDeposit" ADD CONSTRAINT "FK_dcdfe87e33c28c608a1f5bb0d9c" FOREIGN KEY ("AccountingSettingRef") REFERENCES "Rap"."RecieptAndPaymentAccountingSetting"("RecieptAndPaymentAccountingSettingID");
ALTER TABLE "Rap"."ReceiptDeposit" ADD CONSTRAINT "FK_ebbdd8db887da385f1c4fc07541" FOREIGN KEY ("BankAccountRef") REFERENCES "Rap"."BankAccounts"("BankAccountID");
ALTER TABLE "Rap"."ReceiptGuarantee" ADD CONSTRAINT "FK_5a9f827b28734dba3890c3618b2" FOREIGN KEY ("CashRef") REFERENCES "Rap"."Cashes"("CashID");
ALTER TABLE "Rap"."ReceiptGuarantee" ADD CONSTRAINT "FK_73f41ad52b6a79a19f62527d55a" FOREIGN KEY ("ReceiptNotificationRef") REFERENCES "Rap"."ReceiptNotifications"("ReceiptNotificationID") ON DELETE CASCADE;
ALTER TABLE "Rap"."ReceiptGuarantee" ADD CONSTRAINT "FK_7c0d0448fc291fed67305da17cc" FOREIGN KEY ("AccountingSettingRef") REFERENCES "Rap"."RecieptAndPaymentAccountingSetting"("RecieptAndPaymentAccountingSettingID");
ALTER TABLE "Rap"."ReceiptGuarantee" ADD CONSTRAINT "FK_ca10bb07f88920abd49d2b8d410" FOREIGN KEY ("ReasonRef") REFERENCES "Rap"."Reasons"("RapReasonID");
ALTER TABLE "Rap"."ReceiptGuarantee" ADD CONSTRAINT "FK_f76e800a9fa207908ec4d4824fb" FOREIGN KEY ("BankRef") REFERENCES "Rap"."Banks"("BankID");
ALTER TABLE "Rap"."ReceiptNotifications" ADD CONSTRAINT "FK_bf990500227dc3afd83e727bb10" FOREIGN KEY ("PartyRef") REFERENCES "Gnr"."Parties"("PartyID");
ALTER TABLE "Rap"."ReceiptNotifications" ADD CONSTRAINT "FK_c930ad8a8f4133c05236505492b" FOREIGN KEY ("VoucherHeaderRef") REFERENCES "Acc"."Voucher"("VoucherID") ON DELETE SET NULL;
ALTER TABLE "Rap"."ReceiptNotifications" ADD CONSTRAINT "FK_c980a24e5732f66d7b658155156" FOREIGN KEY ("ReasonRef") REFERENCES "Rap"."Reasons"("RapReasonID");
ALTER TABLE "Rap"."ReceiptNotifications" ADD CONSTRAINT "FK_e305fb86d0b8ced0ae6b7d31495" FOREIGN KEY ("CurrencyRef") REFERENCES "Gnr"."Currency"("CurrencyID");
ALTER TABLE "Rap"."ReceiptPromissoryNote" ADD CONSTRAINT "FK_2548e0b5065804672798b739f16" FOREIGN KEY ("CashRef") REFERENCES "Rap"."Cashes"("CashID");
ALTER TABLE "Rap"."ReceiptPromissoryNote" ADD CONSTRAINT "FK_6d49ee02fdd17f64d57a75e1375" FOREIGN KEY ("ReasonRef") REFERENCES "Rap"."Reasons"("RapReasonID");
ALTER TABLE "Rap"."ReceiptPromissoryNote" ADD CONSTRAINT "FK_bf3f7d9a32839b65c85879343b3" FOREIGN KEY ("AccountingSettingRef") REFERENCES "Rap"."RecieptAndPaymentAccountingSetting"("RecieptAndPaymentAccountingSettingID");
ALTER TABLE "Rap"."ReceiptPromissoryNote" ADD CONSTRAINT "FK_fdce47fc43173b03c2cdf369643" FOREIGN KEY ("ReceiptNotificationRef") REFERENCES "Rap"."ReceiptNotifications"("ReceiptNotificationID") ON DELETE CASCADE;
ALTER TABLE "Rap"."ReceiptReturnedPaidCheque" ADD CONSTRAINT "FK_19c47cf11461698ea406fc29214" FOREIGN KEY ("PaymentChequeRef") REFERENCES "Rap"."PaymentCheque"("PaymentChequeID");
ALTER TABLE "Rap"."ReceiptReturnedPaidCheque" ADD CONSTRAINT "FK_220e2623996539654d6b9726573" FOREIGN KEY ("AccountingSettingRef") REFERENCES "Rap"."RecieptAndPaymentAccountingSetting"("RecieptAndPaymentAccountingSettingID");
ALTER TABLE "Rap"."ReceiptReturnedPaidCheque" ADD CONSTRAINT "FK_486979220514b5a07f8b0264f2d" FOREIGN KEY ("ReasonRef") REFERENCES "Rap"."Reasons"("RapReasonID");
ALTER TABLE "Rap"."ReceiptReturnedPaidCheque" ADD CONSTRAINT "FK_551fc652713a6def4c9b48ed91c" FOREIGN KEY ("CashRef") REFERENCES "Rap"."Cashes"("CashID");
ALTER TABLE "Rap"."ReceiptReturnedPaidCheque" ADD CONSTRAINT "FK_ffc3dba6f12309d36c5e31a0053" FOREIGN KEY ("ReceiptNotificationRef") REFERENCES "Rap"."ReceiptNotifications"("ReceiptNotificationID") ON DELETE CASCADE;
ALTER TABLE "Rap"."ReceiptReturnedPaymentAssignment" ADD CONSTRAINT "FK_3bbf4cda87740494453e0bb7c81" FOREIGN KEY ("ReasonRef") REFERENCES "Rap"."Reasons"("RapReasonID");
ALTER TABLE "Rap"."ReceiptReturnedPaymentAssignment" ADD CONSTRAINT "FK_413ae9a9334298ee84fefa34f4d" FOREIGN KEY ("PaymentAssignmentRef") REFERENCES "Rap"."PaymentAssignment"("PaymentAssignmentID");
ALTER TABLE "Rap"."ReceiptReturnedPaymentAssignment" ADD CONSTRAINT "FK_dc876fe0c35675e2f39fcf5b44b" FOREIGN KEY ("CashRef") REFERENCES "Rap"."Cashes"("CashID");
ALTER TABLE "Rap"."ReceiptReturnedPaymentAssignment" ADD CONSTRAINT "FK_f3603ff122796f34bcb5d3413e5" FOREIGN KEY ("ReceiptNotificationRef") REFERENCES "Rap"."ReceiptNotifications"("ReceiptNotificationID") ON DELETE CASCADE;
ALTER TABLE "Rap"."ReceiptReturnedPaymentAssignment" ADD CONSTRAINT "FK_f4325d4803fb5c7d44e22fde208" FOREIGN KEY ("AccountingSettingRef") REFERENCES "Rap"."RecieptAndPaymentAccountingSetting"("RecieptAndPaymentAccountingSettingID");
ALTER TABLE "Rap"."ReceiptReturnedPaymentPromissoryNote" ADD CONSTRAINT "FK_1e120f4729d93b092f9a192ba89" FOREIGN KEY ("PaymentPromissoryNoteRef") REFERENCES "Rap"."PaymentPromissoryNote"("PaymentPromissoryNoteID");
ALTER TABLE "Rap"."ReceiptReturnedPaymentPromissoryNote" ADD CONSTRAINT "FK_717a1d7608a957efc0ddfe606b5" FOREIGN KEY ("AccountingSettingRef") REFERENCES "Rap"."RecieptAndPaymentAccountingSetting"("RecieptAndPaymentAccountingSettingID");
ALTER TABLE "Rap"."ReceiptReturnedPaymentPromissoryNote" ADD CONSTRAINT "FK_dbc4c83d16fa05dc007662e4fd3" FOREIGN KEY ("ReceiptNotificationRef") REFERENCES "Rap"."ReceiptNotifications"("ReceiptNotificationID") ON DELETE CASCADE;
ALTER TABLE "Rap"."ReceiptReturnedPaymentPromissoryNote" ADD CONSTRAINT "FK_ea06b3520ec7976450806cdef50" FOREIGN KEY ("ReasonRef") REFERENCES "Rap"."Reasons"("RapReasonID");
ALTER TABLE "Rap"."ReceivedChequeOperation" ADD CONSTRAINT "FK_6329c78124dee67ddbdf5bc69cf" FOREIGN KEY ("RealizerRef") REFERENCES "Acc"."DetailedAccounts"("DetailedAccountID");
ALTER TABLE "Rap"."ReceivedChequeOperation" ADD CONSTRAINT "FK_8d14adddb087f1ee1014d9cffdb" FOREIGN KEY ("VoucherHeaderRef") REFERENCES "Acc"."Voucher"("VoucherID") ON DELETE SET NULL;
ALTER TABLE "Rap"."ReceivedChequeOperation" ADD CONSTRAINT "FK_dcb0a656349e4e916af4f8bd49b" FOREIGN KEY ("BankAccountRef") REFERENCES "Rap"."BankAccounts"("BankAccountID");
ALTER TABLE "Rap"."ReceivedChequeOperationItem" ADD CONSTRAINT "FK_540cf33e453c0211f0f1068c54a" FOREIGN KEY ("OperationRef") REFERENCES "Rap"."ReceivedChequeOperation"("ReceivedChequeOperationID") ON DELETE CASCADE;
ALTER TABLE "Rap"."ReceivedChequeOperationItem" ADD CONSTRAINT "FK_759a7fe89b414374533723c2e5c" FOREIGN KEY ("CashRef") REFERENCES "Rap"."Cashes"("CashID");
ALTER TABLE "Rap"."ReceivedChequeOperationItem" ADD CONSTRAINT "FK_8cc77d18101ccde9f9af1ab051d" FOREIGN KEY ("ReceiptChequeRef") REFERENCES "Rap"."ReceiptCheque"("ReceiptChequeID");
ALTER TABLE "Rap"."RecieptAndPaymentAccountingSetting" ADD CONSTRAINT "FK_59d418c0b79333a288f3c5d0dea" FOREIGN KEY ("AccountRef") REFERENCES "Acc"."Accounts"("AccountID");
ALTER TABLE "Rap"."ReconcileBankStatement" ADD CONSTRAINT "FK_c1aac322e0275fa94bce420fc4e" FOREIGN KEY ("BankAccountRef") REFERENCES "Rap"."BankAccounts"("BankAccountID") ON DELETE RESTRICT;
ALTER TABLE "Rap"."ReconcileBankStatementItem" ADD CONSTRAINT "FK_a20da066febaa7a6eb161e36f15" FOREIGN KEY ("ReconcileBankStatementRef") REFERENCES "Rap"."ReconcileBankStatement"("ReconcileBankStatementID") ON DELETE CASCADE;
ALTER TABLE "Sle"."CustomerGroups" ADD CONSTRAINT "FK_5e4ffe40b47643bb62de8c8e50e" FOREIGN KEY ("ParentRef") REFERENCES "Sle"."CustomerGroups"("CustomerGroupID") ON DELETE CASCADE;
ALTER TABLE "Sle"."CustomerGroups" ADD CONSTRAINT "FK_b7616ce3a1d626e81b0028b922c" FOREIGN KEY ("DetailedAccountRef") REFERENCES "Acc"."DetailedAccounts"("DetailedAccountID") ON DELETE RESTRICT;
ALTER TABLE "Sle"."Customers" ADD CONSTRAINT "FK_31a2f70be5967186983e52f5270" FOREIGN KEY ("PartyRef") REFERENCES "Gnr"."Parties"("PartyID") ON DELETE RESTRICT;
ALTER TABLE "Sle"."Customers" ADD CONSTRAINT "FK_56a7d1ca5af61c6e9201aabc4b8" FOREIGN KEY ("SalesIntermediaryRef") REFERENCES "Gnr"."Parties"("PartyID") ON DELETE RESTRICT;
ALTER TABLE "Sle"."Customers" ADD CONSTRAINT "FK_5f9664aede3689afdd0cdd9bf26" FOREIGN KEY ("CustomerGroupRef") REFERENCES "Sle"."CustomerGroups"("CustomerGroupID") ON DELETE RESTRICT;
ALTER TABLE "Sle"."Customers" ADD CONSTRAINT "FK_678873b67dd8b37b4589035fc19" FOREIGN KEY ("CurrencyRef") REFERENCES "Gnr"."Currency"("CurrencyID") ON DELETE RESTRICT;
ALTER TABLE "Sle"."SalesItemGroupRelatedProducts" ADD CONSTRAINT "FK_1b745fc2c1cb02eeb3addfc6888" FOREIGN KEY ("SalesItemGroupRef") REFERENCES "Sle"."SalesItemGroups"("SalesItemGroupID") ON DELETE CASCADE;
ALTER TABLE "Sle"."SalesItemGroups" ADD CONSTRAINT "FK_26db2faad142ac403d854677381" FOREIGN KEY ("ParentRef") REFERENCES "Sle"."SalesItemGroups"("SalesItemGroupID") ON DELETE CASCADE;

-- ==================== INDEXES ====================
CREATE UNIQUE INDEX IF NOT EXISTS "Accounts_pkey" ON "Acc"."Accounts" USING btree ("AccountID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_553cbbbe0e5b16a2d233e97514f" ON "Acc"."Accounts" USING btree ("AccountID");
CREATE UNIQUE INDEX IF NOT EXISTS "AccountsNatureAdjusting_pkey" ON "Acc"."AccountsNatureAdjusting" USING btree ("AccountsNatureAdjustingID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_687b85f5d16aaee7116df8aa6e7" ON "Acc"."AccountsNatureAdjusting" USING btree ("AccountsNatureAdjustingID");
CREATE UNIQUE INDEX IF NOT EXISTS "AccountsRelatedDeatailedAccounts_pkey" ON "Acc"."AccountsRelatedDeatailedAccounts" USING btree ("AccountsRelatedDeatailedAccountsID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_b2ce156aa025b573cee6d13d12b" ON "Acc"."AccountsRelatedDeatailedAccounts" USING btree ("AccountsRelatedDeatailedAccountsID");
CREATE UNIQUE INDEX IF NOT EXISTS "AccountsVoucherDecriptions_pkey" ON "Acc"."AccountsVoucherDecriptions" USING btree ("AccountsVoucherDecriptionID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_1931bd88268080137ceef3b909e" ON "Acc"."AccountsVoucherDecriptions" USING btree ("AccountsVoucherDecriptionID");
CREATE UNIQUE INDEX IF NOT EXISTS "ClosingTemporaryAccount_pkey" ON "Acc"."ClosingTemporaryAccount" USING btree ("ClosingTemporaryAccountID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_29f5d8e2c654436894b734abbe4" ON "Acc"."ClosingTemporaryAccount" USING btree ("ClosingTemporaryAccountID");
CREATE UNIQUE INDEX IF NOT EXISTS "ClosingTemporaryAccountItem_pkey" ON "Acc"."ClosingTemporaryAccountItem" USING btree ("ClosingTemporaryAccountItemID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_421f6401695da90063b9019dea6" ON "Acc"."ClosingTemporaryAccountItem" USING btree ("ClosingTemporaryAccountItemID");
CREATE UNIQUE INDEX IF NOT EXISTS "ClosingTemporaryAccountSelected_pkey" ON "Acc"."ClosingTemporaryAccountSelected" USING btree ("ClosingTemporaryAccountSelectedID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_1e30c6910698f5b279c067976ab" ON "Acc"."ClosingTemporaryAccountSelected" USING btree ("ClosingTemporaryAccountSelectedID");
CREATE UNIQUE INDEX IF NOT EXISTS "CostCenter_pkey" ON "Acc"."CostCenter" USING btree ("CostCenterID");
CREATE INDEX IF NOT EXISTS "IDX_5036d8b75893b7ce4554b6ee88" ON "Acc"."CostCenter" USING btree ("DetailedAccountID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_810f3a0cb7aea6fd7abd9a93154" ON "Acc"."CostCenter" USING btree ("CostCenterID");
CREATE UNIQUE INDEX IF NOT EXISTS "DetailedAccounts_pkey" ON "Acc"."DetailedAccounts" USING btree ("DetailedAccountID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_eb6e40af04a609935b988b165d7" ON "Acc"."DetailedAccounts" USING btree ("DetailedAccountID");
CREATE UNIQUE INDEX IF NOT EXISTS "DetailedTypes_pkey" ON "Acc"."DetailedTypes" USING btree ("DetailedTypesID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_cd4c89ca75c76588d0930218195" ON "Acc"."DetailedTypes" USING btree ("DetailedTypesID");
CREATE UNIQUE INDEX IF NOT EXISTS "OtherDetails_pkey" ON "Acc"."OtherDetails" USING btree ("OtherDetailsID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_fb618898a3c11cd7efc59fe7dc2" ON "Acc"."OtherDetails" USING btree ("OtherDetailsID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_8b3ff6636ded00e827e4b4dd93a" ON "Acc"."Voucher" USING btree ("VoucherID");
CREATE UNIQUE INDEX IF NOT EXISTS "Voucher_pkey" ON "Acc"."Voucher" USING btree ("VoucherID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_d868a44571971c869dba5de4827" ON "Acc"."VoucherItem" USING btree ("VoucherItemID");
CREATE UNIQUE INDEX IF NOT EXISTS "VoucherItem_pkey" ON "Acc"."VoucherItem" USING btree ("VoucherItemID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_8de0a2f75ff8884758ebd6e6ee8" ON "Acc"."VoucherType" USING btree ("VoucherTypeID");
CREATE UNIQUE INDEX IF NOT EXISTS "VoucherType_pkey" ON "Acc"."VoucherType" USING btree ("VoucherTypeID");
CREATE UNIQUE INDEX IF NOT EXISTS "Contracts_pkey" ON "Cnt"."Contracts" USING btree ("ContractID");
CREATE INDEX IF NOT EXISTS "IDX_42e3ca11839699734841d8f0c4" ON "Cnt"."Contracts" USING btree ("DetailedAccountID");
CREATE INDEX IF NOT EXISTS "IDX_a5a4824f754995c61f5f6cab47" ON "Cnt"."Contracts" USING btree ("ProjectID");
CREATE INDEX IF NOT EXISTS "IDX_f11f6455e276c94f612e9aa4e3" ON "Cnt"."Contracts" USING btree ("PartyID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_4eac2aef290164b4c4972fc91f5" ON "Cnt"."Contracts" USING btree ("ContractID");
CREATE INDEX IF NOT EXISTS "IDX_57ac41e39853f02c5bdb4b0779" ON "Cnt"."Projects" USING btree ("DetailedAccountID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_e57ee85b56cd73d644322300d1b" ON "Cnt"."Projects" USING btree ("ProjectID");
CREATE UNIQUE INDEX IF NOT EXISTS "Projects_pkey" ON "Cnt"."Projects" USING btree ("ProjectID");
CREATE UNIQUE INDEX IF NOT EXISTS "DynamicForm_pkey" ON "Dfb"."DynamicForm" USING btree ("DynamicFormID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_950dab9b680564de33996ff8a05" ON "Dfb"."DynamicForm" USING btree ("DynamicFormID");
CREATE UNIQUE INDEX IF NOT EXISTS "DynamicFormRecord_pkey" ON "Dfb"."DynamicFormRecord" USING btree ("DynamicFormRecordID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_3dd984297ce0b126c9d94c2d402" ON "Dfb"."DynamicFormRecord" USING btree ("DynamicFormRecordID");
CREATE UNIQUE INDEX IF NOT EXISTS "DynamicMenu_pkey" ON "Dfb"."DynamicMenu" USING btree ("DynamicMenuID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_3eab9b9e907b3215407abb3d1e2" ON "Dfb"."DynamicMenu" USING btree ("DynamicMenuID");
CREATE UNIQUE INDEX IF NOT EXISTS "ActivityLog_pkey" ON "Gnr"."ActivityLog" USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS "PK_399093f65413d2893d656e75e6b" ON "Gnr"."ActivityLog" USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS "BaseSettings_pkey" ON "Gnr"."BaseSettings" USING btree ("BaseSettingsID");
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_40ffc210d05721462a9245888e" ON "Gnr"."BaseSettings" USING btree ("TabRef", "Key", "BusinessStructureRef", "CompanyRef");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_cf618a6afffb40b08386e754dc1" ON "Gnr"."BaseSettings" USING btree ("BaseSettingsID");
CREATE UNIQUE INDEX IF NOT EXISTS "BusinessStructure_pkey" ON "Gnr"."BusinessStructure" USING btree ("BusinessStructureID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_88873483b3cbfca16c941bb7af7" ON "Gnr"."BusinessStructure" USING btree ("BusinessStructureID");
CREATE UNIQUE INDEX IF NOT EXISTS "Currency_pkey" ON "Gnr"."Currency" USING btree ("CurrencyID");
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_60bac211249633b5cc5f3584c7" ON "Gnr"."Currency" USING btree ("Title_En", "BusinessStructureRef");
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_8ff143be637b5a9056f78b8847" ON "Gnr"."Currency" USING btree ("Code", "BusinessStructureRef");
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_e102f630e5c5dbf8149f7ecc8a" ON "Gnr"."Currency" USING btree ("Title", "BusinessStructureRef");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_aef23c4366238e533aa50ca2d00" ON "Gnr"."Currency" USING btree ("CurrencyID");
CREATE UNIQUE INDEX IF NOT EXISTS "CurrencyExchangeRate_pkey" ON "Gnr"."CurrencyExchangeRate" USING btree ("CurrencyExchangeRateID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_26abfd06f6d53f76948a65fc1c4" ON "Gnr"."CurrencyExchangeRate" USING btree ("CurrencyExchangeRateID");
CREATE UNIQUE INDEX IF NOT EXISTS "DetailedAccountsNumbering_pkey" ON "Gnr"."DetailedAccountsNumbering" USING btree ("DetailedAccountsNumberingID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_bc55138a64d85d7c018e6e08135" ON "Gnr"."DetailedAccountsNumbering" USING btree ("DetailedAccountsNumberingID");
CREATE UNIQUE INDEX IF NOT EXISTS "Entities_pkey" ON "Gnr"."Entities" USING btree ("EntityID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_7fe28296acec813939696c27e76" ON "Gnr"."Entities" USING btree ("EntityID");
CREATE UNIQUE INDEX IF NOT EXISTS "EntityNumbering_pkey" ON "Gnr"."EntityNumbering" USING btree ("EntityNumberingID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_3262f067d96e45ecc3dde89541f" ON "Gnr"."EntityNumbering" USING btree ("EntityNumberingID");
CREATE UNIQUE INDEX IF NOT EXISTS "FiscalYear_pkey" ON "Gnr"."FiscalYear" USING btree ("FiscalYearID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_7a5781c1d3b970934a1480c8501" ON "Gnr"."FiscalYear" USING btree ("FiscalYearID");
CREATE UNIQUE INDEX IF NOT EXISTS "GeoLocations_pkey" ON "Gnr"."GeoLocations" USING btree ("GeolocationID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_9c318b57d6e67b60b2b98524304" ON "Gnr"."GeoLocations" USING btree ("GeolocationID");
CREATE UNIQUE INDEX IF NOT EXISTS "IDGeneration_pkey" ON "Gnr"."IDGeneration" USING btree ("IDGenerationID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_1d5b6cd17d37fa555477a4c2a92" ON "Gnr"."IDGeneration" USING btree ("IDGenerationID");
CREATE UNIQUE INDEX IF NOT EXISTS "LicenseActivations_pkey" ON "Gnr"."LicenseActivations" USING btree ("LicenseActivationID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_bd8f5c518b403797584093463a0" ON "Gnr"."LicenseActivations" USING btree ("LicenseActivationID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_c467efc29155f1c41678930afb8" ON "Gnr"."Parties" USING btree ("PartyID");
CREATE UNIQUE INDEX IF NOT EXISTS "Parties_pkey" ON "Gnr"."Parties" USING btree ("PartyID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_15dfe5d4ba5d59f47c28c146a49" ON "Gnr"."PartiesAddresses" USING btree ("PartyAddressID");
CREATE UNIQUE INDEX IF NOT EXISTS "PartiesAddresses_pkey" ON "Gnr"."PartiesAddresses" USING btree ("PartyAddressID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_8205551a265a75826f6683f8b04" ON "Gnr"."PartiesPhones" USING btree ("PartyPhoneID");
CREATE UNIQUE INDEX IF NOT EXISTS "PartiesPhones_pkey" ON "Gnr"."PartiesPhones" USING btree ("PartyPhoneID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_49b05acff048bf5e481057e4ee9" ON "Gnr"."PartiesRelated" USING btree ("PartyRelatedID");
CREATE UNIQUE INDEX IF NOT EXISTS "PartiesRelated_pkey" ON "Gnr"."PartiesRelated" USING btree ("PartyRelatedID");
CREATE UNIQUE INDEX IF NOT EXISTS "BusinessStructureUsers_pkey" ON "Iam"."BusinessStructureUsers" USING btree ("businessStructureUsersId");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_988833b680e93258725f1a011c4" ON "Iam"."BusinessStructureUsers" USING btree ("businessStructureUsersId");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_076196df9b1781e1634de4f9a0a" ON "Iam"."Permission" USING btree ("PermissionID");
CREATE UNIQUE INDEX IF NOT EXISTS "Permission_pkey" ON "Iam"."Permission" USING btree ("PermissionID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_05fd556a94ca9f3af7f05ce130a" ON "Iam"."Role" USING btree ("RoleID");
CREATE UNIQUE INDEX IF NOT EXISTS "Role_pkey" ON "Iam"."Role" USING btree ("RoleID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_2f77396e911b46ab4b2384d7349" ON "Iam"."RolePermission" USING btree ("RolePermissionID");
CREATE UNIQUE INDEX IF NOT EXISTS "RolePermission_pkey" ON "Iam"."RolePermission" USING btree ("RolePermissionID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_56304f104769f6cca6eb0537bc7" ON "Iam"."User" USING btree ("UserID");
CREATE UNIQUE INDEX IF NOT EXISTS "User_pkey" ON "Iam"."User" USING btree ("UserID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_4bebf911a77bb8f9a577a52f760" ON "Iam"."UserGroupPermissions" USING btree ("UserGroupPermissionsID");
CREATE UNIQUE INDEX IF NOT EXISTS "UserGroupPermissions_pkey" ON "Iam"."UserGroupPermissions" USING btree ("UserGroupPermissionsID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_aec87524fbf55ac24d97eb22c40" ON "Iam"."UserGroups" USING btree ("UserGroupID");
CREATE UNIQUE INDEX IF NOT EXISTS "UserGroups_pkey" ON "Iam"."UserGroups" USING btree ("UserGroupID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_ba30a48216844b057858a8d25e5" ON "Iam"."UserRole" USING btree ("UserRoleID");
CREATE UNIQUE INDEX IF NOT EXISTS "UserRole_pkey" ON "Iam"."UserRole" USING btree ("UserRoleID");
CREATE UNIQUE INDEX IF NOT EXISTS "ItemAccountCategories_pkey" ON "Inv"."ItemAccountCategories" USING btree ("ItemAccountCategoryID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_7adc7276ca8b8f5711973858e90" ON "Inv"."ItemAccountCategories" USING btree ("ItemAccountCategoryID");
CREATE UNIQUE INDEX IF NOT EXISTS "ItemImages_pkey" ON "Inv"."ItemImages" USING btree ("ItemImageID");
CREATE UNIQUE INDEX IF NOT EXISTS "ItemInventoryControls_pkey" ON "Inv"."ItemInventoryControls" USING btree ("ItemInventoryControlID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_c54828b8ee53aa0e5a6a1aa38fb" ON "Inv"."ItemInventoryControls" USING btree ("ItemInventoryControlID");
CREATE UNIQUE INDEX IF NOT EXISTS "ItemPackageDetails_pkey" ON "Inv"."ItemPackageDetails" USING btree ("ItemPackageDetailID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_297bfc686d605d8dc237a5ce69c" ON "Inv"."ItemPackageDetails" USING btree ("ItemPackageDetailID");
CREATE UNIQUE INDEX IF NOT EXISTS "ItemPackages_pkey" ON "Inv"."ItemPackages" USING btree ("ItemPackageID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_45a8e3994c886676080f37cc9e8" ON "Inv"."ItemPackages" USING btree ("ItemPackageID");
CREATE UNIQUE INDEX IF NOT EXISTS "ItemPhysicalLocations_pkey" ON "Inv"."ItemPhysicalLocations" USING btree ("ItemPhysicalLocationID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_5000062e9a6742ce74897d650fa" ON "Inv"."ItemPhysicalLocations" USING btree ("ItemPhysicalLocationID");
CREATE UNIQUE INDEX IF NOT EXISTS "ItemRequestDetails_pkey" ON "Inv"."ItemRequestDetails" USING btree ("ItemRequestDetailID");
CREATE UNIQUE INDEX IF NOT EXISTS "ItemRequestTrackingFactors_pkey" ON "Inv"."ItemRequestTrackingFactors" USING btree ("ItemRequestTrackingFactorID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_b5e16802295520756781f3ab2c3" ON "Inv"."ItemRequestTrackingFactors" USING btree ("ItemRequestTrackingFactorID");
CREATE UNIQUE INDEX IF NOT EXISTS "ItemRequests_pkey" ON "Inv"."ItemRequests" USING btree ("ItemRequestID");
CREATE UNIQUE INDEX IF NOT EXISTS "ItemServiceGroupFields_pkey" ON "Inv"."ItemServiceGroupFields" USING btree ("ItemServiceGroupFieldID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_d08d63e3d91ec1f9d3a4f997ad4" ON "Inv"."ItemServiceGroupFields" USING btree ("ItemServiceGroupFieldID");
CREATE UNIQUE INDEX IF NOT EXISTS "ItemServiceGroupRelatedProducts_pkey" ON "Inv"."ItemServiceGroupRelatedProducts" USING btree ("ItemServiceGroupRelatedProductID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_b1505be1920e0550de36e7ca2f1" ON "Inv"."ItemServiceGroupRelatedProducts" USING btree ("ItemServiceGroupRelatedProductID");
CREATE UNIQUE INDEX IF NOT EXISTS "ItemServiceGroups_pkey" ON "Inv"."ItemServiceGroups" USING btree ("ItemServiceGroupID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_1b0ee3071417fb9283e06b1d001" ON "Inv"."ItemServiceGroups" USING btree ("ItemServiceGroupID");
CREATE UNIQUE INDEX IF NOT EXISTS "ItemSimilarItems_pkey" ON "Inv"."ItemSimilarItems" USING btree ("ItemSimilarItemID");
CREATE UNIQUE INDEX IF NOT EXISTS "ItemSubUnits_pkey" ON "Inv"."ItemSubUnits" USING btree ("ItemSubUnitID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_f4b6576b0b3bd27b305ef82ce32" ON "Inv"."ItemSubUnits" USING btree ("ItemSubUnitID");
CREATE UNIQUE INDEX IF NOT EXISTS "ItemSupplyRequestDetails_pkey" ON "Inv"."ItemSupplyRequestDetails" USING btree ("ItemSupplyRequestDetailID");
CREATE UNIQUE INDEX IF NOT EXISTS "ItemSupplyRequestTrackingFactors_pkey" ON "Inv"."ItemSupplyRequestTrackingFactors" USING btree ("ItemSupplyRequestTrackingFactorID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_22499de57ca75adbb128a9bd42e" ON "Inv"."ItemSupplyRequestTrackingFactors" USING btree ("ItemSupplyRequestTrackingFactorID");
CREATE UNIQUE INDEX IF NOT EXISTS "ItemSupplyRequests_pkey" ON "Inv"."ItemSupplyRequests" USING btree ("ItemSupplyRequestID");
CREATE UNIQUE INDEX IF NOT EXISTS "ItemVolumeCbms_pkey" ON "Inv"."ItemVolumeCbms" USING btree ("ItemVolumeCbmID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_8c3fff684f76b7231b88e001113" ON "Inv"."ItemVolumeCbms" USING btree ("ItemVolumeCbmID");
CREATE UNIQUE INDEX IF NOT EXISTS "Items_pkey" ON "Inv"."Items" USING btree ("ItemID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_3046d2596746c747c281f16a9f0" ON "Inv"."Items" USING btree ("ItemID");
CREATE UNIQUE INDEX IF NOT EXISTS "MeasurementUnits_pkey" ON "Inv"."MeasurementUnits" USING btree ("MeasurementUnitID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_af5614f199dbdea750087afd32c" ON "Inv"."MeasurementUnits" USING btree ("MeasurementUnitID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_83d31d42f94ef07b5f72d50b03d" ON "Inv"."PurchaseInvoiceDetails" USING btree ("PurchaseInvoiceDetailID");
CREATE UNIQUE INDEX IF NOT EXISTS "PurchaseInvoiceDetails_pkey" ON "Inv"."PurchaseInvoiceDetails" USING btree ("PurchaseInvoiceDetailID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_6d8f123341c2f608e0f2950976d" ON "Inv"."PurchaseInvoiceFactors" USING btree ("PurchaseInvoiceFactorID");
CREATE UNIQUE INDEX IF NOT EXISTS "PurchaseInvoiceFactors_pkey" ON "Inv"."PurchaseInvoiceFactors" USING btree ("PurchaseInvoiceFactorID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_c2d00467742f7172ab5e39dda30" ON "Inv"."PurchaseInvoiceTrackingFactors" USING btree ("PurchaseInvoiceTrackingFactorID");
CREATE UNIQUE INDEX IF NOT EXISTS "PurchaseInvoiceTrackingFactors_pkey" ON "Inv"."PurchaseInvoiceTrackingFactors" USING btree ("PurchaseInvoiceTrackingFactorID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_9d0b92ac361d739516b9a654a3a" ON "Inv"."PurchaseInvoices" USING btree ("PurchaseInvoiceID");
CREATE UNIQUE INDEX IF NOT EXISTS "PurchaseInvoices_pkey" ON "Inv"."PurchaseInvoices" USING btree ("PurchaseInvoiceID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_c9e29a5c944d81ff80e87788f57" ON "Inv"."PurchaseSalesParameterValues" USING btree ("PurchaseSalesParameterValueID");
CREATE UNIQUE INDEX IF NOT EXISTS "PurchaseSalesParameterValues_pkey" ON "Inv"."PurchaseSalesParameterValues" USING btree ("PurchaseSalesParameterValueID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_8693c5e4e4701c4db65344058bf" ON "Inv"."PurchaseSalesParameters" USING btree ("PurchaseSalesParameterID");
CREATE UNIQUE INDEX IF NOT EXISTS "PurchaseSalesParameters_pkey" ON "Inv"."PurchaseSalesParameters" USING btree ("PurchaseSalesParameterID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_3ce1a11699ed82834e371fbcbff" ON "Inv"."ServicePurchaseInvoiceDetails" USING btree ("ServicePurchaseInvoiceDetailID");
CREATE UNIQUE INDEX IF NOT EXISTS "ServicePurchaseInvoiceDetails_pkey" ON "Inv"."ServicePurchaseInvoiceDetails" USING btree ("ServicePurchaseInvoiceDetailID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_3c3c74874e3248d70f16f5aff02" ON "Inv"."ServicePurchaseInvoiceFactors" USING btree ("ServicePurchaseInvoiceFactorID");
CREATE UNIQUE INDEX IF NOT EXISTS "ServicePurchaseInvoiceFactors_pkey" ON "Inv"."ServicePurchaseInvoiceFactors" USING btree ("ServicePurchaseInvoiceFactorID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_fb7969dba88d41012544205fd96" ON "Inv"."ServicePurchaseInvoices" USING btree ("ServicePurchaseInvoiceID");
CREATE UNIQUE INDEX IF NOT EXISTS "ServicePurchaseInvoices_pkey" ON "Inv"."ServicePurchaseInvoices" USING btree ("ServicePurchaseInvoiceID");
CREATE UNIQUE INDEX IF NOT EXISTS "ServiceRequestDetails_pkey" ON "Inv"."ServiceRequestDetails" USING btree ("ServiceRequestDetailID");
CREATE UNIQUE INDEX IF NOT EXISTS "ServiceRequests_pkey" ON "Inv"."ServiceRequests" USING btree ("ServiceRequestID");
CREATE UNIQUE INDEX IF NOT EXISTS "ServiceSupplyRequestDetails_pkey" ON "Inv"."ServiceSupplyRequestDetails" USING btree ("ServiceSupplyRequestDetailID");
CREATE UNIQUE INDEX IF NOT EXISTS "ServiceSupplyRequests_pkey" ON "Inv"."ServiceSupplyRequests" USING btree ("ServiceSupplyRequestID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_2d82fbf9dcd71cd34446f6df74e" ON "Inv"."StandardItemRateDetails" USING btree ("StandardItemRateDetailID");
CREATE UNIQUE INDEX IF NOT EXISTS "StandardItemRateDetails_pkey" ON "Inv"."StandardItemRateDetails" USING btree ("StandardItemRateDetailID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_c13d9d1358d9dc999b23e5a1216" ON "Inv"."StandardItemRates" USING btree ("StandardItemRateID");
CREATE UNIQUE INDEX IF NOT EXISTS "StandardItemRates_pkey" ON "Inv"."StandardItemRates" USING btree ("StandardItemRateID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_4cb167dab11b6334456a0ac9f26" ON "Inv"."StocktakingCountDetails" USING btree ("StocktakingCountDetailID");
CREATE UNIQUE INDEX IF NOT EXISTS "StocktakingCountDetails_pkey" ON "Inv"."StocktakingCountDetails" USING btree ("StocktakingCountDetailID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_bfcf12547dbcb4be31ef4934bb8" ON "Inv"."StocktakingCountTrackingFactors" USING btree ("StocktakingCountTrackingFactorID");
CREATE UNIQUE INDEX IF NOT EXISTS "StocktakingCountTrackingFactors_pkey" ON "Inv"."StocktakingCountTrackingFactors" USING btree ("StocktakingCountTrackingFactorID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_6744e1b4e3dfe2fbe2b36916fd0" ON "Inv"."StocktakingCounts" USING btree ("StocktakingCountID");
CREATE UNIQUE INDEX IF NOT EXISTS "StocktakingCounts_pkey" ON "Inv"."StocktakingCounts" USING btree ("StocktakingCountID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_cedd2f5998ba79b9d6787bb0637" ON "Inv"."StocktakingSettingWarehouses" USING btree ("StocktakingSettingWarehouseID");
CREATE UNIQUE INDEX IF NOT EXISTS "StocktakingSettingWarehouses_pkey" ON "Inv"."StocktakingSettingWarehouses" USING btree ("StocktakingSettingWarehouseID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_e4a1ec162715ad3ca541b401953" ON "Inv"."StocktakingSettings" USING btree ("StocktakingSettingID");
CREATE UNIQUE INDEX IF NOT EXISTS "StocktakingSettings_pkey" ON "Inv"."StocktakingSettings" USING btree ("StocktakingSettingID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_872afad0b306396850ee8b03031" ON "Inv"."StocktakingTagDetails" USING btree ("StocktakingTagDetailID");
CREATE UNIQUE INDEX IF NOT EXISTS "StocktakingTagDetails_pkey" ON "Inv"."StocktakingTagDetails" USING btree ("StocktakingTagDetailID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_bbe47b244a1f2955427afdc5228" ON "Inv"."StocktakingTagHeaders" USING btree ("StocktakingTagHeaderID");
CREATE UNIQUE INDEX IF NOT EXISTS "StocktakingTagHeaders_pkey" ON "Inv"."StocktakingTagHeaders" USING btree ("StocktakingTagHeaderID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_72aefb7554577044ca729673a0b" ON "Inv"."StocktakingTags" USING btree ("StocktakingTagID");
CREATE UNIQUE INDEX IF NOT EXISTS "StocktakingTags_pkey" ON "Inv"."StocktakingTags" USING btree ("StocktakingTagID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_62e083aa612995ab26b2c70e315" ON "Inv"."TemporaryItemReceiptDetails" USING btree ("TemporaryItemReceiptDetailID");
CREATE UNIQUE INDEX IF NOT EXISTS "TemporaryItemReceiptDetails_pkey" ON "Inv"."TemporaryItemReceiptDetails" USING btree ("TemporaryItemReceiptDetailID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_0da76f13e4ebee3f0f03c312b67" ON "Inv"."TemporaryItemReceiptFactors" USING btree ("TemporaryItemReceiptFactorID");
CREATE UNIQUE INDEX IF NOT EXISTS "TemporaryItemReceiptFactors_pkey" ON "Inv"."TemporaryItemReceiptFactors" USING btree ("TemporaryItemReceiptFactorID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_41385248b4c744c10308ee6a708" ON "Inv"."TemporaryItemReceiptTrackingFactors" USING btree ("TemporaryItemReceiptTrackingFactorID");
CREATE UNIQUE INDEX IF NOT EXISTS "TemporaryItemReceiptTrackingFactors_pkey" ON "Inv"."TemporaryItemReceiptTrackingFactors" USING btree ("TemporaryItemReceiptTrackingFactorID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_79670bbd3611f89ef4e95701741" ON "Inv"."TemporaryItemReceipts" USING btree ("TemporaryItemReceiptID");
CREATE UNIQUE INDEX IF NOT EXISTS "TemporaryItemReceipts_pkey" ON "Inv"."TemporaryItemReceipts" USING btree ("TemporaryItemReceiptID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_0c2c3c379789a9e58f9d41c529c" ON "Inv"."TrackingFactorConstantValue" USING btree ("TrackingFactorConstantValueID");
CREATE UNIQUE INDEX IF NOT EXISTS "TrackingFactorConstantValue_pkey" ON "Inv"."TrackingFactorConstantValue" USING btree ("TrackingFactorConstantValueID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_fbec82f75d8f00367dd7c034a14" ON "Inv"."TrackingFactorItemRelated" USING btree ("TrackingFactorItemRelatedID");
CREATE UNIQUE INDEX IF NOT EXISTS "TrackingFactorItemRelated_pkey" ON "Inv"."TrackingFactorItemRelated" USING btree ("TrackingFactorItemRelatedID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_8b393db953c6ff0be6d6c576997" ON "Inv"."TrackingFactors" USING btree ("TrackingFactorID");
CREATE UNIQUE INDEX IF NOT EXISTS "TrackingFactors_pkey" ON "Inv"."TrackingFactors" USING btree ("TrackingFactorID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_d98d410d0f34d51ba3c0dede3c3" ON "Inv"."WarehouseAddresses" USING btree ("WarehouseAddressID");
CREATE UNIQUE INDEX IF NOT EXISTS "WarehouseAddresses_pkey" ON "Inv"."WarehouseAddresses" USING btree ("WarehouseAddressID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_a5f6d64f00d842d51bcfd11d933" ON "Inv"."WarehouseDocumentTypes" USING btree ("WarehouseDocumentTypeID");
CREATE UNIQUE INDEX IF NOT EXISTS "WarehouseDocumentTypes_pkey" ON "Inv"."WarehouseDocumentTypes" USING btree ("WarehouseDocumentTypeID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_b630cd5c3c8ef37bca095e1768b" ON "Inv"."WarehouseIssueTrackingFactors" USING btree ("WarehouseIssueTrackingFactorID");
CREATE UNIQUE INDEX IF NOT EXISTS "WarehouseIssueTrackingFactors_pkey" ON "Inv"."WarehouseIssueTrackingFactors" USING btree ("WarehouseIssueTrackingFactorID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_f9037ddcda7bb472713383545ec" ON "Inv"."WarehouseKeepers" USING btree ("WarehouseKeeperID");
CREATE UNIQUE INDEX IF NOT EXISTS "WarehouseKeepers_pkey" ON "Inv"."WarehouseKeepers" USING btree ("WarehouseKeeperID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_fe3186658f5cae9db4cbb71752a" ON "Inv"."WarehouseProducts" USING btree ("WarehouseProductID");
CREATE UNIQUE INDEX IF NOT EXISTS "WarehouseProducts_pkey" ON "Inv"."WarehouseProducts" USING btree ("WarehouseProductID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_c33e79eb528199b167c53e3f654" ON "Inv"."WarehouseReceiptTrackingFactors" USING btree ("WarehouseReceiptTrackingFactorID");
CREATE UNIQUE INDEX IF NOT EXISTS "WarehouseReceiptTrackingFactors_pkey" ON "Inv"."WarehouseReceiptTrackingFactors" USING btree ("WarehouseReceiptTrackingFactorID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_04d1dd856bc2e6812d895de7855" ON "Inv"."WarehouseUsers" USING btree ("WarehouseUserID");
CREATE UNIQUE INDEX IF NOT EXISTS "WarehouseUsers_pkey" ON "Inv"."WarehouseUsers" USING btree ("WarehouseUserID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_d4cd305f3c5ee6bc6e01d3b74f6" ON "Inv"."WarehouseVouchers" USING btree ("WarehouseReceiptID");
CREATE UNIQUE INDEX IF NOT EXISTS "WarehouseVouchers_pkey" ON "Inv"."WarehouseVouchers" USING btree ("WarehouseReceiptID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_e609f3c8516d68a3f5dd6115605" ON "Inv"."WarehouseVouchersDetails" USING btree ("WarehouseReceiptDetailID");
CREATE UNIQUE INDEX IF NOT EXISTS "WarehouseVouchersDetails_pkey" ON "Inv"."WarehouseVouchersDetails" USING btree ("WarehouseReceiptDetailID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_d30121daf731b41137a78db4936" ON "Inv"."WarehouseVouchersFactors" USING btree ("WarehouseReceiptFactorID");
CREATE UNIQUE INDEX IF NOT EXISTS "WarehouseVouchersFactors_pkey" ON "Inv"."WarehouseVouchersFactors" USING btree ("WarehouseReceiptFactorID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_ada12526bb90baee70657d5a893" ON "Inv"."WarehouseVouchersPricing" USING btree ("WarehouseVouchersPricingID");
CREATE UNIQUE INDEX IF NOT EXISTS "WarehouseVouchersPricing_pkey" ON "Inv"."WarehouseVouchersPricing" USING btree ("WarehouseVouchersPricingID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_10d9ad9139604450f563f8bb7e2" ON "Inv"."Warehouses" USING btree ("WarehouseID");
CREATE UNIQUE INDEX IF NOT EXISTS "Warehouses_pkey" ON "Inv"."Warehouses" USING btree ("WarehouseID");
CREATE UNIQUE INDEX IF NOT EXISTS "BankAccountTypes_pkey" ON "Rap"."BankAccountTypes" USING btree ("BankAccountTypeID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_57f91ce16035dc62831b75f68e6" ON "Rap"."BankAccountTypes" USING btree ("BankAccountTypeID");
CREATE UNIQUE INDEX IF NOT EXISTS "BankAccounts_pkey" ON "Rap"."BankAccounts" USING btree ("BankAccountID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_a0c04a297080ab244a15ff4c981" ON "Rap"."BankAccounts" USING btree ("BankAccountID");
CREATE UNIQUE INDEX IF NOT EXISTS "BankBranchs_pkey" ON "Rap"."BankBranchs" USING btree ("BankBranchID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_897b308436788f208b5b4a2ed25" ON "Rap"."BankBranchs" USING btree ("BankBranchID");
CREATE UNIQUE INDEX IF NOT EXISTS "BankReconciliation_pkey" ON "Rap"."BankReconciliation" USING btree ("BankReconciliationID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_ccb650bbc28334098323d4094a4" ON "Rap"."BankReconciliation" USING btree ("BankReconciliationID");
CREATE UNIQUE INDEX IF NOT EXISTS "BankReconciliationItem_pkey" ON "Rap"."BankReconciliationItem" USING btree ("BankReconciliationItemID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_158a3470ae435aee340d8840af8" ON "Rap"."BankReconciliationItem" USING btree ("BankReconciliationItemID");
CREATE UNIQUE INDEX IF NOT EXISTS "Banks_pkey" ON "Rap"."Banks" USING btree ("BankID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_ec9611d912cf76f3359db0f96c6" ON "Rap"."Banks" USING btree ("BankID");
CREATE UNIQUE INDEX IF NOT EXISTS "Cashes_pkey" ON "Rap"."Cashes" USING btree ("CashID");
CREATE INDEX IF NOT EXISTS "IDX_2632cafecd8642783b44f1f011" ON "Rap"."Cashes" USING btree ("DetailedAccountID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_f8acbadbfd825cd27ede507814d" ON "Rap"."Cashes" USING btree ("CashID");
CREATE UNIQUE INDEX IF NOT EXISTS "Cashiers_pkey" ON "Rap"."Cashiers" USING btree ("CashierID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_d638faa1f3532bc73db4ba1b01c" ON "Rap"."Cashiers" USING btree ("CashierID");
CREATE UNIQUE INDEX IF NOT EXISTS "ChequePrintTemplates_pkey" ON "Rap"."ChequePrintTemplates" USING btree ("ChequePrintTemplateID");
CREATE UNIQUE INDEX IF NOT EXISTS "ChequebookItems_pkey" ON "Rap"."ChequebookItems" USING btree ("ChequebookItemID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_85fb928519705e1f08aa6206890" ON "Rap"."ChequebookItems" USING btree ("ChequebookItemID");
CREATE UNIQUE INDEX IF NOT EXISTS "Chequebooks_pkey" ON "Rap"."Chequebooks" USING btree ("ChequebookID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_e304e292cab90981fe47e69836b" ON "Rap"."Chequebooks" USING btree ("ChequebookID");
CREATE UNIQUE INDEX IF NOT EXISTS "DocumentAccountingInfo_pkey" ON "Rap"."DocumentAccountingInfo" USING btree ("DocumentAccountingInfoID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_6a81b4df3d975bcacff3ac5975a" ON "Rap"."DocumentAccountingInfo" USING btree ("DocumentAccountingInfoID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_80c6887527740128238633cff6a" ON "Rap"."PaidDocumentClearing" USING btree ("PaidDocumentClearingID");
CREATE UNIQUE INDEX IF NOT EXISTS "PaidDocumentClearing_pkey" ON "Rap"."PaidDocumentClearing" USING btree ("PaidDocumentClearingID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_e20022e1990cef325df9abceba9" ON "Rap"."PaidDocumentClearingItem" USING btree ("PaidDocumentClearingItemID");
CREATE UNIQUE INDEX IF NOT EXISTS "PaidDocumentClearingItem_pkey" ON "Rap"."PaidDocumentClearingItem" USING btree ("PaidDocumentClearingItemID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_4c1959f9125e6ac38811be731dc" ON "Rap"."PaymentAssignment" USING btree ("PaymentAssignmentID");
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentAssignment_pkey" ON "Rap"."PaymentAssignment" USING btree ("PaymentAssignmentID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_7114ea6fbc77ba17a75b0b5721d" ON "Rap"."PaymentCash" USING btree ("PaymentCashID");
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentCash_pkey" ON "Rap"."PaymentCash" USING btree ("PaymentCashID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_ca45befd6c9bf7a49d7afcc59ae" ON "Rap"."PaymentCheque" USING btree ("PaymentChequeID");
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentCheque_pkey" ON "Rap"."PaymentCheque" USING btree ("PaymentChequeID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_b86d7e235271c3ea4ab6695b746" ON "Rap"."PaymentGatewayContacts" USING btree ("PaymentGatewayContactID");
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentGatewayContacts_pkey" ON "Rap"."PaymentGatewayContacts" USING btree ("PaymentGatewayContactID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_9c211996b06918077986e328281" ON "Rap"."PaymentGateways" USING btree ("PaymentGatewayID");
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentGateways_pkey" ON "Rap"."PaymentGateways" USING btree ("PaymentGatewayID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_801a3d63210b72a7114ff86093d" ON "Rap"."PaymentGuarantee" USING btree ("PaymentGuaranteeID");
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentGuarantee_pkey" ON "Rap"."PaymentGuarantee" USING btree ("PaymentGuaranteeID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_e2638e8fb3dc645d883bb57b9cb" ON "Rap"."PaymentNotifications" USING btree ("PaymentNotificationID");
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentNotifications_pkey" ON "Rap"."PaymentNotifications" USING btree ("PaymentNotificationID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_d314a02685d01303c9aaf5731f2" ON "Rap"."PaymentPromissoryNote" USING btree ("PaymentPromissoryNoteID");
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentPromissoryNote_pkey" ON "Rap"."PaymentPromissoryNote" USING btree ("PaymentPromissoryNoteID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_3aaf31af9895248d57194b95415" ON "Rap"."PaymentReturnedReceivedCheque" USING btree ("PaymentReturnedReceivedChequeID");
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentReturnedReceivedCheque_pkey" ON "Rap"."PaymentReturnedReceivedCheque" USING btree ("PaymentReturnedReceivedChequeID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_847c69b75487aab5b1f187d0d3d" ON "Rap"."PaymentReturnedReceivedPromissoryNote" USING btree ("PaymentReturnedReceivedPromissoryNoteID");
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentReturnedReceivedPromissoryNote_pkey" ON "Rap"."PaymentReturnedReceivedPromissoryNote" USING btree ("PaymentReturnedReceivedPromissoryNoteID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_1d4a133a1a0516f3c442758702e" ON "Rap"."PaymentWithdrawal" USING btree ("PaymentWithdrawalID");
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentWithdrawal_pkey" ON "Rap"."PaymentWithdrawal" USING btree ("PaymentWithdrawalID");
CREATE INDEX IF NOT EXISTS "IDX_5b34fc42a799fba6233c4911d2" ON "Rap"."PettyCashRequests" USING btree ("PettyCashRef");
CREATE INDEX IF NOT EXISTS "IDX_8985b8720879d3be6fa8c76b27" ON "Rap"."PettyCashRequests" USING btree ("PettyCashSummaryRef");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_d1972a9513797fcc9438ba249d9" ON "Rap"."PettyCashRequests" USING btree ("PettyCashRequestID");
CREATE UNIQUE INDEX IF NOT EXISTS "PettyCashRequests_pkey" ON "Rap"."PettyCashRequests" USING btree ("PettyCashRequestID");
CREATE INDEX IF NOT EXISTS "IDX_288e6bf837e47928aa41c2fc69" ON "Rap"."PettyCashSummaries" USING btree ("VoucherHeaderRef");
CREATE INDEX IF NOT EXISTS "IDX_9c075859226cfbdc7c84985150" ON "Rap"."PettyCashSummaries" USING btree ("PettyCashRef");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_6b8fa7bd18bfea0403cc931e9eb" ON "Rap"."PettyCashSummaries" USING btree ("pettyCashSummaryId");
CREATE UNIQUE INDEX IF NOT EXISTS "PettyCashSummaries_pkey" ON "Rap"."PettyCashSummaries" USING btree ("pettyCashSummaryId");
CREATE INDEX IF NOT EXISTS "IDX_271534484d6c6a451d54adc8d6" ON "Rap"."PettyCashSummaryItems" USING btree ("PettyCashSummaryRef");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_203f4a95c5d40fd2a2b002bbed3" ON "Rap"."PettyCashSummaryItems" USING btree ("pettyCashSummaryItemId");
CREATE UNIQUE INDEX IF NOT EXISTS "PettyCashSummaryItems_pkey" ON "Rap"."PettyCashSummaryItems" USING btree ("pettyCashSummaryItemId");
CREATE INDEX IF NOT EXISTS "IDX_355ddba3f35ea584a6cda9e5b4" ON "Rap"."PettyCashes" USING btree ("PartyRef");
CREATE INDEX IF NOT EXISTS "IDX_ed1f21b5c7d796e7c9b8eeb063" ON "Rap"."PettyCashes" USING btree ("AccountRef");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_18122115123b1e910576be156f3" ON "Rap"."PettyCashes" USING btree ("PettyCashID");
CREATE UNIQUE INDEX IF NOT EXISTS "PettyCashes_pkey" ON "Rap"."PettyCashes" USING btree ("PettyCashID");
CREATE INDEX IF NOT EXISTS "IDX_86f5ba95d88a80b6e73ebd6bdf" ON "Rap"."PromissoryNoteItems" USING btree ("PromissoryNoteRef");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_25af5087f65a8e8d0fdf229c983" ON "Rap"."PromissoryNoteItems" USING btree ("PromissoryNoteItemID");
CREATE UNIQUE INDEX IF NOT EXISTS "PromissoryNoteItems_pkey" ON "Rap"."PromissoryNoteItems" USING btree ("PromissoryNoteItemID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_6609d60ce804d1ff91790386007" ON "Rap"."PromissoryNotes" USING btree ("PromissoryNoteID");
CREATE UNIQUE INDEX IF NOT EXISTS "PromissoryNotes_pkey" ON "Rap"."PromissoryNotes" USING btree ("PromissoryNoteID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_771762ba16946afe8f13b8bbe24" ON "Rap"."Reasons" USING btree ("RapReasonID");
CREATE UNIQUE INDEX IF NOT EXISTS "Reasons_pkey" ON "Rap"."Reasons" USING btree ("RapReasonID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_e1e127e0d3da49d6092707ace7a" ON "Rap"."ReceiptCash" USING btree ("ReceiptCashID");
CREATE UNIQUE INDEX IF NOT EXISTS "ReceiptCash_pkey" ON "Rap"."ReceiptCash" USING btree ("ReceiptCashID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_2a237bacf58979d5e77f4472368" ON "Rap"."ReceiptCheque" USING btree ("ReceiptChequeID");
CREATE UNIQUE INDEX IF NOT EXISTS "ReceiptCheque_pkey" ON "Rap"."ReceiptCheque" USING btree ("ReceiptChequeID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_d49eb26ea32e46ede4c0e97f5fd" ON "Rap"."ReceiptDeposit" USING btree ("ReceiptDepositID");
CREATE UNIQUE INDEX IF NOT EXISTS "ReceiptDeposit_pkey" ON "Rap"."ReceiptDeposit" USING btree ("ReceiptDepositID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_c5829941ba214d070869012e19c" ON "Rap"."ReceiptGuarantee" USING btree ("ReceiptGuaranteeID");
CREATE UNIQUE INDEX IF NOT EXISTS "ReceiptGuarantee_pkey" ON "Rap"."ReceiptGuarantee" USING btree ("ReceiptGuaranteeID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_cc7edfed0025da7c70712466db6" ON "Rap"."ReceiptNotifications" USING btree ("ReceiptNotificationID");
CREATE UNIQUE INDEX IF NOT EXISTS "ReceiptNotifications_pkey" ON "Rap"."ReceiptNotifications" USING btree ("ReceiptNotificationID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_5a50de6ac04779d966fda1a556d" ON "Rap"."ReceiptPromissoryNote" USING btree ("ReceiptPromissoryNoteID");
CREATE UNIQUE INDEX IF NOT EXISTS "ReceiptPromissoryNote_pkey" ON "Rap"."ReceiptPromissoryNote" USING btree ("ReceiptPromissoryNoteID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_de6f06e724891d9fb3134c22e6e" ON "Rap"."ReceiptReturnedPaidCheque" USING btree ("ReceiptReturnedPaidChequeID");
CREATE UNIQUE INDEX IF NOT EXISTS "ReceiptReturnedPaidCheque_pkey" ON "Rap"."ReceiptReturnedPaidCheque" USING btree ("ReceiptReturnedPaidChequeID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_57156c057ee110a8a407557901e" ON "Rap"."ReceiptReturnedPaymentAssignment" USING btree ("ReceiptReturnedPaymentAssignmentID");
CREATE UNIQUE INDEX IF NOT EXISTS "ReceiptReturnedPaymentAssignment_pkey" ON "Rap"."ReceiptReturnedPaymentAssignment" USING btree ("ReceiptReturnedPaymentAssignmentID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_03e4191b4f358eafe2e9bee3de1" ON "Rap"."ReceiptReturnedPaymentPromissoryNote" USING btree ("ReceiptReturnedPaymentPromissoryNoteID");
CREATE UNIQUE INDEX IF NOT EXISTS "ReceiptReturnedPaymentPromissoryNote_pkey" ON "Rap"."ReceiptReturnedPaymentPromissoryNote" USING btree ("ReceiptReturnedPaymentPromissoryNoteID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_9a9b5240cceaa0fe9bca9bac86b" ON "Rap"."ReceivedChequeOperation" USING btree ("ReceivedChequeOperationID");
CREATE UNIQUE INDEX IF NOT EXISTS "ReceivedChequeOperation_pkey" ON "Rap"."ReceivedChequeOperation" USING btree ("ReceivedChequeOperationID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_746d729c789f8ec2a0ed4ba9085" ON "Rap"."ReceivedChequeOperationItem" USING btree ("ReceivedChequeOperationItemID");
CREATE UNIQUE INDEX IF NOT EXISTS "ReceivedChequeOperationItem_pkey" ON "Rap"."ReceivedChequeOperationItem" USING btree ("ReceivedChequeOperationItemID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_1299fc59219e82adb4e41f408f3" ON "Rap"."RecieptAndPaymentAccountingSetting" USING btree ("RecieptAndPaymentAccountingSettingID");
CREATE UNIQUE INDEX IF NOT EXISTS "RecieptAndPaymentAccountingSetting_pkey" ON "Rap"."RecieptAndPaymentAccountingSetting" USING btree ("RecieptAndPaymentAccountingSettingID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_e8a1c5c43ac5f957d498c8e05fa" ON "Rap"."ReconcileBankStatement" USING btree ("ReconcileBankStatementID");
CREATE UNIQUE INDEX IF NOT EXISTS "ReconcileBankStatement_pkey" ON "Rap"."ReconcileBankStatement" USING btree ("ReconcileBankStatementID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_14bdc430fd0483f183d42a8aa53" ON "Rap"."ReconcileBankStatementItem" USING btree ("ReconcileBankStatementItemID");
CREATE UNIQUE INDEX IF NOT EXISTS "ReconcileBankStatementItem_pkey" ON "Rap"."ReconcileBankStatementItem" USING btree ("ReconcileBankStatementItemID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_b8aaad2213497e67a56951a3d81" ON "Rpt"."Report" USING btree ("reportID");
CREATE UNIQUE INDEX IF NOT EXISTS "Report_pkey" ON "Rpt"."Report" USING btree ("reportID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_8468752ca4f53e25b380143ea3d" ON "Rpt"."ReportAggregate" USING btree ("reportAggregateID");
CREATE UNIQUE INDEX IF NOT EXISTS "ReportAggregate_pkey" ON "Rpt"."ReportAggregate" USING btree ("reportAggregateID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_a0fcde4399b4310728b27ef9b27" ON "Rpt"."ReportField" USING btree ("reportFieldID");
CREATE UNIQUE INDEX IF NOT EXISTS "ReportField_pkey" ON "Rpt"."ReportField" USING btree ("reportFieldID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_3ebf3586021ef387cf52b9ce0a2" ON "Rpt"."ReportFilter" USING btree ("reportFilterID");
CREATE UNIQUE INDEX IF NOT EXISTS "ReportFilter_pkey" ON "Rpt"."ReportFilter" USING btree ("reportFilterID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_6b958bc890bf3e71f45cc6453a2" ON "Rpt"."ReportFormula" USING btree ("reportFormulaID");
CREATE UNIQUE INDEX IF NOT EXISTS "ReportFormula_pkey" ON "Rpt"."ReportFormula" USING btree ("reportFormulaID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_d97364be4b03235c73a936f44cb" ON "Rpt"."ReportGroup" USING btree ("reportGroupID");
CREATE UNIQUE INDEX IF NOT EXISTS "ReportGroup_pkey" ON "Rpt"."ReportGroup" USING btree ("reportGroupID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_24a4ef2f8fef18cb1eca7185f0e" ON "Rpt"."ReportGrouping" USING btree ("reportGroupingID");
CREATE UNIQUE INDEX IF NOT EXISTS "ReportGrouping_pkey" ON "Rpt"."ReportGrouping" USING btree ("reportGroupingID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_8e14f84b1f8d4cf881f46b0af1f" ON "Rpt"."ReportPermission" USING btree ("reportPermissionID");
CREATE UNIQUE INDEX IF NOT EXISTS "ReportPermission_pkey" ON "Rpt"."ReportPermission" USING btree ("reportPermissionID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_01041b98772bfe36ee9e7b7614f" ON "Rpt"."ReportSorting" USING btree ("reportSortingID");
CREATE UNIQUE INDEX IF NOT EXISTS "ReportSorting_pkey" ON "Rpt"."ReportSorting" USING btree ("reportSortingID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_888d228a42423ff68515058004d" ON "Rpt"."ReportUserData" USING btree ("reportUserDataID");
CREATE UNIQUE INDEX IF NOT EXISTS "ReportUserData_pkey" ON "Rpt"."ReportUserData" USING btree ("reportUserDataID");
CREATE UNIQUE INDEX IF NOT EXISTS "CustomerGroups_pkey" ON "Sle"."CustomerGroups" USING btree ("CustomerGroupID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_663cea6a137a0551fee20e34b00" ON "Sle"."CustomerGroups" USING btree ("CustomerGroupID");
CREATE UNIQUE INDEX IF NOT EXISTS "Customers_pkey" ON "Sle"."Customers" USING btree ("CustomerID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_20d9e62f5dfe25e72bc90e46257" ON "Sle"."Customers" USING btree ("CustomerID");
CREATE UNIQUE INDEX IF NOT EXISTS "DeliveryLocations_pkey" ON "Sle"."DeliveryLocations" USING btree ("DeliveryLocationID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_367308906668b42b0c199993ded" ON "Sle"."DeliveryLocations" USING btree ("DeliveryLocationID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_b02c46b0230b5a2a7b8fe04ff95" ON "Sle"."SalesAccountCategories" USING btree ("SalesAccountCategoryID");
CREATE UNIQUE INDEX IF NOT EXISTS "SalesAccountCategories_pkey" ON "Sle"."SalesAccountCategories" USING btree ("SalesAccountCategoryID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_f8988db754f3b68153d528318d9" ON "Sle"."SalesCenters" USING btree ("SalesCenterID");
CREATE UNIQUE INDEX IF NOT EXISTS "SalesCenters_pkey" ON "Sle"."SalesCenters" USING btree ("SalesCenterID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_adf240987eaab3d6082686374e5" ON "Sle"."SalesChannels" USING btree ("SalesChannelID");
CREATE UNIQUE INDEX IF NOT EXISTS "SalesChannels_pkey" ON "Sle"."SalesChannels" USING btree ("SalesChannelID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_9b53aa3d992cb64b041b1fa754f" ON "Sle"."SalesDocumentSettings" USING btree ("SalesDocumentSettingsID");
CREATE UNIQUE INDEX IF NOT EXISTS "SalesDocumentSettings_pkey" ON "Sle"."SalesDocumentSettings" USING btree ("SalesDocumentSettingsID");
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_SalesDocumentSettings_Type_BS" ON "Sle"."SalesDocumentSettings" USING btree ("SalesDocumentType", "BusinessStructureRef");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_e53d4502f27bf653eb446fa597a" ON "Sle"."SalesItemGroupRelatedProducts" USING btree ("SalesItemGroupRelatedProductID");
CREATE UNIQUE INDEX IF NOT EXISTS "SalesItemGroupRelatedProducts_pkey" ON "Sle"."SalesItemGroupRelatedProducts" USING btree ("SalesItemGroupRelatedProductID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_24a21d360a73e5ce9f0b300b977" ON "Sle"."SalesItemGroups" USING btree ("SalesItemGroupID");
CREATE UNIQUE INDEX IF NOT EXISTS "SalesItemGroups_pkey" ON "Sle"."SalesItemGroups" USING btree ("SalesItemGroupID");
CREATE UNIQUE INDEX IF NOT EXISTS "SalesOrderItems_pkey" ON "Sle"."SalesOrderItems" USING btree ("SalesOrderItemID");
CREATE UNIQUE INDEX IF NOT EXISTS "SalesOrders_pkey" ON "Sle"."SalesOrders" USING btree ("SalesOrderID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_6ef327f5d8e4962e406d9871514" ON "Sle"."SalesTypes" USING btree ("SalesTypeID");
CREATE UNIQUE INDEX IF NOT EXISTS "SalesTypes_pkey" ON "Sle"."SalesTypes" USING btree ("SalesTypeID");
CREATE UNIQUE INDEX IF NOT EXISTS "SettlementMethods_pkey" ON "Sle"."SettlementMethods" USING btree ("SettlementMethodID");
CREATE UNIQUE INDEX IF NOT EXISTS "PK_cf97676d62086901e0da802b320" ON "Sle"."Wallets" USING btree ("WalletID");
CREATE UNIQUE INDEX IF NOT EXISTS "Wallets_pkey" ON "Sle"."Wallets" USING btree ("WalletID");

-- END OF BACKUP — 175 tables, 668 rows