import { HttpStatus } from '@nestjs/common';
import { PartyService } from '../../application/services/party.service';
import { CreatePartyDto } from '../../application/dtos/create-party.dto';
import { UpdatePartyDto } from '../../application/dtos/update-party.dto';
export declare class PartyController {
    private readonly partyService;
    constructor(partyService: PartyService);
    create(createDto: CreatePartyDto): Promise<{
        statusCode: HttpStatus;
        data: import("../../domain/entities/party.entity").Party;
        message: string;
    }>;
    update(id: number, updateDto: UpdatePartyDto): Promise<{
        statusCode: HttpStatus;
        data: import("../../domain/entities/party.entity").Party;
        message: string;
    }>;
    findAll(query: any): Promise<{
        statusCode: HttpStatus;
        data: {
            items: import("../../domain/entities/party.entity").Party[];
            total: number;
        };
    }>;
    checkDuplicate(field: string, value: string, excludeId?: string): Promise<{
        statusCode: HttpStatus;
        data: {
            isDuplicate: boolean;
        };
    }>;
    findOne(id: number): Promise<{
        statusCode: HttpStatus;
        data: any;
    }>;
    remove(id: number): Promise<{
        statusCode: HttpStatus;
        message: string;
    }>;
}
