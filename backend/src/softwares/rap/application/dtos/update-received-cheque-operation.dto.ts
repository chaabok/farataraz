import { PartialType } from '@nestjs/mapped-types';
import { CreateReceivedChequeOperationDto } from './create-received-cheque-operation.dto';

export class UpdateReceivedChequeOperationDto extends PartialType(CreateReceivedChequeOperationDto) {}
