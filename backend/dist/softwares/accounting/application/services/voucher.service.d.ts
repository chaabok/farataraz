import { CreateVoucherDto } from '../dtos/create-voucher.dto';
import { UpdateVoucherDto } from '../dtos/update-voucher.dto';
import { IVoucherRepository } from '../../domain/repositories/voucher.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { VoucherItem } from '../../domain/entities/voucher-item.entity';
import { Voucher } from '../../domain/entities/voucher.entity';
import { Repository } from 'typeorm';
export declare class VoucherService {
    private readonly voucherRepository;
    private readonly voucherItemRepository;
    private readonly requestContextService;
    private readonly idGenerationService;
    constructor(voucherRepository: IVoucherRepository, voucherItemRepository: Repository<VoucherItem>, requestContextService: RequestContextService, idGenerationService: IdGenerationService);
    calculateNextNumberInternal(manager: any, entityRef: string, jalaliDateStr: string, companyId: number, businessStructureId: number): Promise<{
        numberingMethod: string;
        nextValue: string;
        error?: string;
    }>;
    getNextNumbers(jalaliDateStr: string): Promise<{
        voucherNumber: string;
        isVoucherNumberAuto: boolean;
        referenceNumber: string;
        isReferenceNumberAuto: boolean;
        error: string;
    }>;
    create(createVoucherDto: CreateVoucherDto): Promise<any>;
    findOneInternal(id: number, manager: any): Promise<any>;
    getLastVoucherDate(fiscalYearId?: string): Promise<{
        lastDate: string;
    }>;
    getNumberRangeByDate(fromDate: string, toDate: string, fiscalYearId?: string): Promise<{
        fromVoucherNumber: number;
        toVoucherNumber: number;
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
    findAll(): Promise<Voucher[]>;
    findOne(id: number): Promise<Voucher>;
    update(id: number, updateVoucherDto: UpdateVoucherDto): Promise<any>;
    remove(id: number): Promise<void>;
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
