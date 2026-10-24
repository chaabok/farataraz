import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { StandardItemRateService } from '../../application/services/standard-item-rate.service';
import { CreateStandardItemRateDto } from '../../application/dtos/create-standard-item-rate.dto';
import { UpdateStandardItemRateDto } from '../../application/dtos/update-standard-item-rate.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';

@Controller('inv/standard-item-rates')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StandardItemRateController {
  constructor(private readonly service: StandardItemRateService) {}

  @Post()
  create(@Body() createDto: CreateStandardItemRateDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('items-by-category/:categoryId')
  getItemsByCategory(@Param('categoryId') categoryId: string, @Query('rateId') rateId?: string) {
    return this.service.getItemsByCategory(+categoryId, rateId ? +rateId : undefined);
  }

  @Get('validate-effective-date')
  validateEffectiveDate(
    @Query('categoryId') categoryId: string,
    @Query('effectiveDate') effectiveDate: string,
    @Query('excludeId') excludeId?: string,
  ) {
    return this.service.validateEffectiveDate(+categoryId, effectiveDate, excludeId ? +excludeId : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateStandardItemRateDto) {
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
