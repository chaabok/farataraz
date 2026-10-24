import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { CustomerGroupService } from '../../application/services/customer-group.service';
import { CreateCustomerGroupDto, UpdateCustomerGroupDto } from '../../application/dtos/customer-group.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';

@Controller('sle/customer-groups')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CustomerGroupController {
  constructor(private readonly service: CustomerGroupService) {}

  @Get()
  async findAll(@Query('leavesOnly') leavesOnly?: string) {
    const data = await this.service.findAll(leavesOnly === 'true' || leavesOnly === '1');
    return { data, success: true };
  }

  @Get('check-duplicate')
  async checkDuplicate(
    @Query('field') field: string,
    @Query('value') value: string,
    @Query('excludeId') excludeId?: string,
    @Query('parentRef') parentRef?: string,
  ) {
    const isDuplicate = await this.service.checkDuplicate(
      field, 
      value, 
      excludeId ? Number(excludeId) : undefined,
      parentRef ? Number(parentRef) : undefined
    );
    return { data: { isDuplicate }, success: true };
  }

  @Get('next-code')
  async getNextCode(@Query('parentRef') parentRef?: string) {
    const nextCode = await this.service.getNextCode(parentRef ? Number(parentRef) : undefined);
    return { data: nextCode, success: true };
  }

  @Get('tree')
  async getTree() {
    const data = await this.service.getTree();
    return { data, success: true };
  }

  @Post()
  async create(@Body() dto: CreateCustomerGroupDto) {
    const data = await this.service.create(dto);
    return { data, success: true, message: 'گروه مشتریان با موفقیت ایجاد شد' };
  }

  @Post('upsert')
  async upsert(@Body() dto: CreateCustomerGroupDto) {
    const data = await this.service.upsert(dto);
    return { data, success: true, message: 'عملیات ذخیره (Upsert) گروه مشتریان با موفقیت انجام شد' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerGroupDto) {
    const data = await this.service.update(+id, dto);
    return { data, success: true, message: 'گروه مشتریان با موفقیت به‌روزرسانی شد' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findById(+id);
    return { data, success: true };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(+id);
    return { success: true };
  }
}
