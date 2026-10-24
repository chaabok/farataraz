import { PartialType } from '@nestjs/mapped-types';
import { CreateWarehouseDocumentTypeDto } from './create-warehouse-document-type.dto';

export class UpdateWarehouseDocumentTypeDto extends PartialType(CreateWarehouseDocumentTypeDto) {}
