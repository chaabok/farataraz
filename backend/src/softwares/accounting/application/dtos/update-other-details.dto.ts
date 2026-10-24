import { PartialType } from '@nestjs/mapped-types';
import { CreateOtherDetailsDto } from './create-other-details.dto';

export class UpdateOtherDetailsDto extends PartialType(CreateOtherDetailsDto) {}
