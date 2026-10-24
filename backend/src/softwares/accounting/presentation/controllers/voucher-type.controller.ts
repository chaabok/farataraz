import { Controller, Get, Post, Body, Param, ParseIntPipe, Delete, Put, Query, UseGuards, Headers, BadRequestException } from '@nestjs/common';
import { VoucherTypeService } from '../../application/services/voucher-type.service';
import { CreateVoucherTypeDto } from '../../application/dtos/create-voucher-type.dto';
import { UpdateVoucherTypeDto } from '../../application/dtos/update-voucher-type.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';
import { Permissions } from '../../../../auth/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('accounting/voucher-types')
export class VoucherTypeController {
  constructor(private readonly voucherTypeService: VoucherTypeService) {}

  @Get('check-duplicate')
  @Permissions('VoucherType:Read')
  async checkDuplicate(
    @Query('field') field: string,
    @Query('value') value: string,
    @Query('excludeId') excludeId?: string,
  ) {
    const isDuplicate = await this.voucherTypeService.checkDuplicate(
      field, 
      value, 
      excludeId ? parseInt(excludeId, 10) : undefined
    );
    return { isDuplicate };
  }

  @Post()
  @Permissions('VoucherType:Create')
  async create(
    @Body() createDto: CreateVoucherTypeDto,
    @Headers('x-company-id') companyId?: string,
    @Headers('x-branch-id') branchId?: string,
    @Headers('x-agency-id') agencyId?: string,
  ) {
    if (createDto.code) {
      const isDupCode = await this.voucherTypeService.checkDuplicate('code', createDto.code);
      if (isDupCode) throw new BadRequestException('کد وارد شده تکراری است');
    }
    if (createDto.title) {
      const isDupTitle = await this.voucherTypeService.checkDuplicate('title', createDto.title);
      if (isDupTitle) throw new BadRequestException('حسابی با این عنوان از قبل وجود دارد');
    }
    const compId = companyId ? parseInt(companyId, 10) : 1;
    const brId = branchId ? parseInt(branchId, 10) : undefined;
    const agnId = agencyId ? parseInt(agencyId, 10) : undefined;
    return this.voucherTypeService.create(createDto, compId, brId, agnId);
  }

  @Put(':id')
  @Permissions('VoucherType:Update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateVoucherTypeDto,
    @Headers('x-company-id') companyId?: string,
    @Headers('x-branch-id') branchId?: string,
    @Headers('x-agency-id') agencyId?: string,
  ) {
    if (updateDto.code) {
      const isDupCode = await this.voucherTypeService.checkDuplicate('code', updateDto.code, id);
      if (isDupCode) throw new BadRequestException('کد وارد شده تکراری است');
    }
    if (updateDto.title) {
      const isDupTitle = await this.voucherTypeService.checkDuplicate('title', updateDto.title, id);
      if (isDupTitle) throw new BadRequestException('حسابی با این عنوان از قبل وجود دارد');
    }
    const compId = companyId ? parseInt(companyId, 10) : 1;
    const brId = branchId ? parseInt(branchId, 10) : undefined;
    const agnId = agencyId ? parseInt(agencyId, 10) : undefined;
    return this.voucherTypeService.update(id, updateDto, compId, brId, agnId);
  }

  @Get()
  @Permissions('VoucherType:Read')
  async findAll(
    @Query('pageIndex') pageIndex?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sorting') sorting?: string,
    @Query('columnFilters') columnFilters?: string,
    @Query('globalFilter') globalFilter?: string,
    @Query('advancedFilters') advancedFilters?: string,
  ) {
    if (pageIndex !== undefined) {
      return this.voucherTypeService.findWithPagination({
        pageIndex: parseInt(pageIndex, 10),
        pageSize: parseInt(pageSize || '50', 10),
        sorting,
        columnFilters,
        globalFilter,
        advancedFilters,
      });
    }
    return this.voucherTypeService.findAll();
  }

  @Get(':id')
  @Permissions('VoucherType:Read')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.voucherTypeService.findOne(id);
  }

  @Delete(':id')
  @Permissions('VoucherType:Delete')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.voucherTypeService.remove(id);
  }
}
