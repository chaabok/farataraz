import { PartialType } from '@nestjs/mapped-types';
import { CreateGeoLocationDto } from './create-geo-location.dto';

export class UpdateGeoLocationDto extends PartialType(CreateGeoLocationDto) {}
