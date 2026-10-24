import { PartialType } from '@nestjs/mapped-types';
import { CreateSalesItemGroupDto } from './create-sales-item-group.dto';

export class UpdateSalesItemGroupDto extends PartialType(CreateSalesItemGroupDto) {}
