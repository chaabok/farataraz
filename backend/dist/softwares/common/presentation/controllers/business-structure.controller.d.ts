import { HttpStatus } from '@nestjs/common';
import { BusinessStructureService } from '../../application/services/business-structure.service';
import { IamService } from '../../../../core/iam/services/iam.service';
import { CreateBusinessStructureDto } from '../../application/dtos/create-business-structure.dto';
import { UpdateBusinessStructureDto } from '../../application/dtos/update-business-structure.dto';
export declare class BusinessStructureController {
    private readonly service;
    private readonly iamService;
    constructor(service: BusinessStructureService, iamService: IamService);
    create(createDto: CreateBusinessStructureDto, companyId?: string): Promise<{
        statusCode: HttpStatus;
        data: import("../../domain/entities/business-structure.entity").BusinessStructure;
    }>;
    private mapStructureName;
    findAll(req: any): Promise<{
        statusCode: HttpStatus;
        data: any[];
    }>;
    findOne(id: number): Promise<{
        statusCode: HttpStatus;
        data: any;
    }>;
    update(id: number, updateDto: UpdateBusinessStructureDto, companyId?: string): Promise<{
        statusCode: HttpStatus;
        data: import("../../domain/entities/business-structure.entity").BusinessStructure;
    }>;
    remove(id: number): Promise<{
        statusCode: HttpStatus;
        message: string;
    }>;
}
