import { PartialType } from '@nestjs/mapped-types';
import { CreateDetailedAccountDto } from './create-detailed-account.dto';

export class UpdateDetailedAccountDto extends PartialType(CreateDetailedAccountDto) {}
