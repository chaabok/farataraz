import { CreatePettyCashSummaryDto } from './create-petty-cash-summary.dto';
declare const UpdatePettyCashSummaryDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreatePettyCashSummaryDto>>;
export declare class UpdatePettyCashSummaryDto extends UpdatePettyCashSummaryDto_base {
    pettyCashSummaryId?: number;
}
export {};
