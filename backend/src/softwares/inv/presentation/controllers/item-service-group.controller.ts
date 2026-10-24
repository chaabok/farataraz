import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ItemServiceGroupService } from '../../application/services/item-service-group.service';
import { SaveTreeDto, CreateItemServiceGroupDto, UpdateItemServiceGroupDto } from '../../application/dtos/item-service-group.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';

@Controller('inv/item-service-groups')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ItemServiceGroupController {
  constructor(private readonly service: ItemServiceGroupService) {}

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
  async create(@Body() dto: CreateItemServiceGroupDto) {
    const data = await this.service.create(dto);
    return { data, success: true, message: 'گروه کالا خدمت با موفقیت ایجاد شد' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateItemServiceGroupDto) {
    const data = await this.service.update(+id, dto);
    return { data, success: true, message: 'گروه کالا خدمت با موفقیت به‌روزرسانی شد' };
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(+id);
    return { success: true };
  }
}
