import { RecieptAndPaymentAccountingSettingService } from '../../application/services/reciept-and-payment-accounting-setting.service';
import { CreateRecieptAndPaymentAccountingSettingDto } from '../../application/dtos/create-reciept-and-payment-accounting-setting.dto';
import { UpdateRecieptAndPaymentAccountingSettingDto } from '../../application/dtos/update-reciept-and-payment-accounting-setting.dto';
export declare class RecieptAndPaymentAccountingSettingController {
    private readonly service;
    constructor(service: RecieptAndPaymentAccountingSettingService);
    create(createDto: CreateRecieptAndPaymentAccountingSettingDto): Promise<{
        data: import("../../domain/entities/reciept-and-payment-accounting-setting.entity").RecieptAndPaymentAccountingSetting;
        message: string;
    }>;
    findAll(query: any): Promise<{
        data: import("../../domain/entities/reciept-and-payment-accounting-setting.entity").RecieptAndPaymentAccountingSetting[];
        total: number;
    }>;
    getNextNumber(): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error?: string;
    }>;
    findOne(id: string): Promise<{
        data: import("../../domain/entities/reciept-and-payment-accounting-setting.entity").RecieptAndPaymentAccountingSetting;
    }>;
    update(id: string, updateDto: UpdateRecieptAndPaymentAccountingSettingDto): Promise<{
        data: import("../../domain/entities/reciept-and-payment-accounting-setting.entity").RecieptAndPaymentAccountingSetting;
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
