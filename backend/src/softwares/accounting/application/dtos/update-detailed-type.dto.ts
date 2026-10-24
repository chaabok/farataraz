import { PartialType } from '@nestjs/mapped-types';
import { CreateDetailedTypeDto } from './create-detailed-type.dto';

export class UpdateDetailedTypeDto extends PartialType(CreateDetailedTypeDto) {}
