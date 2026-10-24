import { PartialType } from '@nestjs/mapped-types';
import { CreatePaidDocumentClearingDto } from './create-paid-document-clearing.dto';

export class UpdatePaidDocumentClearingDto extends PartialType(CreatePaidDocumentClearingDto) {}
