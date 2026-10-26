import { VoucherService } from '../../application/services/voucher.service';
import { CreateVoucherDto } from '../../application/dtos/create-voucher.dto';
import { UpdateVoucherDto } from '../../application/dtos/update-voucher.dto';
export declare class VoucherController {
    private readonly voucherService;
    constructor(voucherService: VoucherService);
    create(createVoucherDto: CreateVoucherDto): Promise<any>;
    getNextNumbers(date: string): Promise<{
        voucherNumber: string;
        isVoucherNumberAuto: boolean;
        referenceNumber: string;
        isReferenceNumberAuto: boolean;
        error: string;
    }>;
    getLastVoucherDate(fiscalYearId: string): Promise<{
        lastDate: string;
    }>;
    getFinalizeInitialValues(fiscalYearId: string): Promise<{
        fromDate: string;
        toDate: string;
        fromVoucherNumber: number;
        toVoucherNumber: number;
    }>;
    finalizeVouchers(body: {
        fromDate: string;
        toDate: string;
        fromVoucherNumber: number;
        toVoucherNumber: number;
        fiscalYearId?: string;
    }): Promise<{
        success: boolean;
        error: string;
        noteVoucherId?: undefined;
        noteVouchers?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        error: string;
        noteVoucherId: number;
        noteVouchers: {
            voucherId: number;
            voucherNumber: number;
            voucherDate: string;
        }[];
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
        noteVoucherId?: undefined;
        noteVouchers?: undefined;
    }>;
    getReverseFinalizeInitialValues(fiscalYearId: string): Promise<{
        fromDate: string;
        toDate: string;
        fromVoucherNumber: number;
        toVoucherNumber: number;
    }>;
    reverseFinalizeVouchers(body: {
        fromDate: string;
        toDate: string;
        fromVoucherNumber: number;
        toVoucherNumber: number;
        fiscalYearId?: string;
    }): Promise<{
        success: boolean;
        affected: number;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
    }>;
    getNumberRangeByDate(fromDate: string, toDate: string, fiscalYearId?: string): Promise<{
        fromVoucherNumber: number;
        toVoucherNumber: number;
    }>;
    findAll(): Promise<import("../../domain/entities/voucher.entity").Voucher[]>;
    findOne(id: string): Promise<import("../../domain/entities/voucher.entity").Voucher>;
    updatePut(id: string, updateVoucherDto: UpdateVoucherDto): Promise<any>;
    updatePatch(id: string, updateVoucherDto: UpdateVoucherDto): Promise<any>;
    remove(id: string): Promise<void>;
    renumber(body: {
        fromDate: string;
        toDate: string;
        renumberVoucher: boolean;
        renumberReference: boolean;
    }): Promise<{
        success: boolean;
        error: string;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
}
