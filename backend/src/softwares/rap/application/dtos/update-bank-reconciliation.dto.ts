import { PartialType } from '@nestjs/mapped-types';
import { CreateBankReconciliationDto } from './create-bank-reconciliation.dto';

export class UpdateBankReconciliationDto extends PartialType(CreateBankReconciliationDto) {}
