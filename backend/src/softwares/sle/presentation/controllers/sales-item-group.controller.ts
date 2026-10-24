import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { SalesItemGroupService } from '../../application/services/sales-item-group.service';
import { CreateSalesItemGroupDto, UpdateSalesItemGroupDto, SaveTreeDto } from '../../application/dtos/sales-item-group.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';

@Controller('sle/sales-item-groups')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SalesItemGroupController {
  constructor(private readonly service: SalesItemGroupService) {}

  @Get('tree')
  async getTree(@Query('search') search?: string) {
    const tree = await this.service.getTree(search);
    return { data: tree, success: true };
  }

  @Post('tree/save')
  async saveTree(@Body() body: SaveTreeDto) {
    const result = await this.service.saveTree(body.treeData);
    return { data: result, success: true };
  }

  @Post()
  async create(@Body() createDto: CreateSalesItemGroupDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateSalesItemGroupDto) {
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
