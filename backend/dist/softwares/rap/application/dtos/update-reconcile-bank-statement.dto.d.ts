import { CreateReconcileBankStatementDto, CreateReconcileBankStatementItemDto } from './create-reconcile-bank-statement.dto';
export declare class UpdateReconcileBankStatementItemDto extends CreateReconcileBankStatementItemDto {
    ReconcileBankStatementItemID?: number;
}
declare const UpdateReconcileBankStatementDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateReconcileBankStatementDto>>;
export declare class UpdateReconcileBankStatementDto extends UpdateReconcileBankStatementDto_base {
    items?: UpdateReconcileBankStatementItemDto[];
}
export {};
