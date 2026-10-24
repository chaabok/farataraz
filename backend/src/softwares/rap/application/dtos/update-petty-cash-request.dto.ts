import { PartialType } from '@nestjs/mapped-types';
import { CreatePettyCashRequestDto } from './create-petty-cash-request.dto';

export class UpdatePettyCashRequestDto extends PartialType(CreatePettyCashRequestDto) {}
