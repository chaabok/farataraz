import { ItemPackageService } from '../../application/services/item-package.service';
import { CreateItemPackageDto, UpdateItemPackageDto } from '../../application/dtos/item-package.dto';
export declare class ItemPackageController {
    private readonly service;
    constructor(service: ItemPackageService);
    create(createDto: CreateItemPackageDto): Promise<import("../../domain/entities/item-package.entity").ItemPackage>;
    findAll(query: any): Promise<import("../../domain/entities/item-package.entity").ItemPackage[]>;
    getNextNumber(): Promise<{
        packageCode: string;
    }>;
    findOne(id: string): Promise<import("../../domain/entities/item-package.entity").ItemPackage>;
    update(id: string, updateDto: UpdateItemPackageDto): Promise<import("../../domain/entities/item-package.entity").ItemPackage>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
