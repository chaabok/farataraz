import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { PettyCashService } from '../../application/services/petty-cash.service';
import { CreatePettyCashDto } from '../../application/dtos/create-petty-cash.dto';
import { UpdatePettyCashDto } from '../../application/dtos/update-petty-cash.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';
import { Permissions } from '../../../../auth/permissions.decorator';

@Controller('rap/petty-cashes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PettyCashController {
  constructor(private readonly service: PettyCashService) {}

  @Post()
  @Permissions('rap.pettyCashes.create')
  create(@Body() createDto: CreatePettyCashDto) {
    return this.service.create(createDto);
  }

  @Get()
  @Permissions('rap.pettyCashes.view')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id/is-used')
  @Permissions('rap.pettyCashes.view')
  isUsed(@Param('id') id: string) {
    return this.service.isUsed(+id);
  }

  @Get(':id')
  @Permissions('rap.pettyCashes.view')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  @Permissions('rap.pettyCashes.edit')
  update(@Param('id') id: string, @Body() updateDto: UpdatePettyCashDto) {
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  @Permissions('rap.pettyCashes.delete')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
