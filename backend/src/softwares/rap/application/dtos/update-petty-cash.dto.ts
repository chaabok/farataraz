import { PartialType } from '@nestjs/mapped-types';
import { CreatePettyCashDto } from './create-petty-cash.dto';

export class UpdatePettyCashDto extends PartialType(CreatePettyCashDto) {}
