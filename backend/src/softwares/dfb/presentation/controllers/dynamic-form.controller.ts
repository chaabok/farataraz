import { Body, Controller, Delete, Get, Headers, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { DynamicFormService } from '../../application/services/dynamic-form.service';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';
import { Permissions } from '../../../../auth/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('dfb/forms')
export class DynamicFormController {
  constructor(private readonly service: DynamicFormService) {}

  // ==========================================
  // Form definitions CRUD
  // ==========================================

  @Post()
  @Permissions('DynamicForm:Create')
  async create(
    @Body() dto: {
      formCode: string;
      title: string;
      description?: string;
      componentName?: string;
      bands?: any[];
      fields?: any[];
      styles?: any;
      menuConfig?: any;
      options?: any;
      showPrintList?: boolean;
      showVoucherActionbar?: boolean;
      isActive?: boolean;
    },
    @Headers('x-company-id') companyId?: string,
  ) {
    const compId = companyId ? parseInt(companyId, 10) : 2;
    const data = await this.service.create(dto, compId);
    return { data, message: 'فرم پویا با موفقیت ایجاد شد.' };
  }

  @Get()
  @Permissions('DynamicForm:Read')
  async findAll() {
    const data = await this.service.findAll();
    return { data };
  }

  @Get('code/:code')
  @Permissions('DynamicForm:Read')
  async findByCode(
    @Param('code') code: string,
    @Headers('x-company-id') companyId?: string,
  ) {
    const compId = companyId ? parseInt(companyId, 10) : 2;
    const data = await this.service.findByCode(code, compId);
    return { data };
  }

  @Get(':id')
  @Permissions('DynamicForm:Read')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.service.findOne(id);
    return { data };
  }

  @Put(':id')
  @Permissions('DynamicForm:Update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: {
      formCode?: string;
      title?: string;
      description?: string;
      componentName?: string;
      bands?: any[];
      fields?: any[];
      styles?: any;
      menuConfig?: any;
      options?: any;
      showPrintList?: boolean;
      showVoucherActionbar?: boolean;
      isActive?: boolean;
    },
    @Headers('x-company-id') companyId?: string,
  ) {
    const compId = companyId ? parseInt(companyId, 10) : 2;
    const data = await this.service.update(id, dto, compId);
    return { data, message: 'فرم پویا با موفقیت بروزرسانی شد.' };
  }

  @Delete(':id')
  @Permissions('DynamicForm:Delete')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { message: 'فرم پویا با موفقیت حذف شد.' };
  }

  // ==========================================
  // Form records CRUD
  // ==========================================

  @Post(':formId/records')
  @Permissions('DynamicForm:Create')
  async createRecord(
    @Param('formId', ParseIntPipe) formId: number,
    @Body() dataDto: Record<string, any>,
    @Headers('x-company-id') companyId?: string,
  ) {
    const compId = companyId ? parseInt(companyId, 10) : 2;
    const data = await this.service.createRecord(formId, dataDto, compId);
    return { data, message: 'رکورد جدید با موفقیت ثبت شد.' };
  }

  @Get(':formId/records')
  @Permissions('DynamicForm:Read')
  async findAllRecords(
    @Param('formId', ParseIntPipe) formId: number,
    @Headers('x-company-id') companyId?: string,
  ) {
    const compId = companyId ? parseInt(companyId, 10) : 2;
    const data = await this.service.findAllRecordsByForm(formId, compId);
    return { data };
  }

  @Get('records/:recordId')
  @Permissions('DynamicForm:Read')
  async findRecordOne(@Param('recordId', ParseIntPipe) recordId: number) {
    const data = await this.service.findRecordOne(recordId);
    return { data };
  }

  @Put('records/:recordId')
  @Permissions('DynamicForm:Update')
  async updateRecord(
    @Param('recordId', ParseIntPipe) recordId: number,
    @Body() dataDto: Record<string, any>,
    @Headers('x-company-id') companyId?: string,
  ) {
    const compId = companyId ? parseInt(companyId, 10) : 2;
    const data = await this.service.updateRecord(recordId, dataDto, compId);
    return { data, message: 'رکورد با موفقیت بروزرسانی شد.' };
  }

  @Delete('records/:recordId')
  @Permissions('DynamicForm:Delete')
  async removeRecord(@Param('recordId', ParseIntPipe) recordId: number) {
    await this.service.removeRecord(recordId);
    return { message: 'رکورد با موفقیت حذف شد.' };
  }
}
