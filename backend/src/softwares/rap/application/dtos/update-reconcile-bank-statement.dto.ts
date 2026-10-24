import { PartialType } from '@nestjs/mapped-types';
import { CreateReconcileBankStatementDto, CreateReconcileBankStatementItemDto } from './create-reconcile-bank-statement.dto';
import { IsOptional, IsNumber } from 'class-validator';

export class UpdateReconcileBankStatementItemDto extends CreateReconcileBankStatementItemDto {
  @IsOptional() @IsNumber() ReconcileBankStatementItemID?: number;
}

export class UpdateReconcileBankStatementDto extends PartialType(CreateReconcileBankStatementDto) {
  @IsOptional() items?: UpdateReconcileBankStatementItemDto[];
}
