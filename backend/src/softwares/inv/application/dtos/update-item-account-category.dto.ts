import { PartialType } from '@nestjs/mapped-types';
import { CreateItemAccountCategoryDto } from './create-item-account-category.dto';

export class UpdateItemAccountCategoryDto extends PartialType(CreateItemAccountCategoryDto) {}
