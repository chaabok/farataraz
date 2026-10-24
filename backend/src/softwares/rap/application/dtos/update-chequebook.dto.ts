import { PartialType } from '@nestjs/mapped-types';
import { CreateChequebookDto, ChequebookItemDto } from './create-chequebook.dto';

export class UpdateChequebookDto extends PartialType(CreateChequebookDto) {}
export { ChequebookItemDto };
