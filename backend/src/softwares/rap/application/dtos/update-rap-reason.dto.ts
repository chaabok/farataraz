import { PartialType } from '@nestjs/mapped-types';
import { CreateRapReasonDto } from './create-rap-reason.dto';

export class UpdateRapReasonDto extends PartialType(CreateRapReasonDto) {}
