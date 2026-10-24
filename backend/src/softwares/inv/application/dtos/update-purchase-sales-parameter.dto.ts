import { PartialType } from '@nestjs/mapped-types';
import { CreatePurchaseSalesParameterDto } from './create-purchase-sales-parameter.dto';

export class UpdatePurchaseSalesParameterDto extends PartialType(CreatePurchaseSalesParameterDto) {}
