import { Controller, Get, Post, Body, Param, ParseIntPipe, Delete, Put, Query, UseGuards, Headers, BadRequestException } from '@nestjs/common';
import { DetailedTypeService } from '../../application/services/detailed-type.service';
import { CreateDetailedTypeDto } from '../../application/dtos/create-detailed-type.dto';
import { UpdateDetailedTypeDto } from '../../application/dtos/update-detailed-type.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';
import { Permissions } from '../../../../auth/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('accounting/detailed-types')
export class DetailedTypeController {
  constructor(private readonly detailedTypeService: DetailedTypeService) {}

  @Get('check-duplicate')
  @Permissions('DetailedType:Read')
  async checkDuplicate(
    @Query('field') field: string,
    @Query('value') value: string,
    @Query('excludeId') excludeId?: string,
  ) {
    const isDuplicate = await this.detailedTypeService.checkDuplicate(
      field, 
      value, 
      excludeId ? parseInt(excludeId, 10) : undefined
    );
    return { isDuplicate };
  }

  @Post()
  @Permissions('DetailedType:Create')
  async create(
    @Body() createDto: CreateDetailedTypeDto,
    @Headers('x-company-id') companyId?: string,
    @Headers('x-branch-id') branchId?: string,
    @Headers('x-agency-id') agencyId?: string,
  ) {
    if (createDto.code) {
      const isDupCode = await this.detailedTypeService.checkDuplicate('code', createDto.code);
      if (isDupCode) throw new BadRequestException('کد وارد شده تکراری است');
    }
    if (createDto.title) {
      const isDupTitle = await this.detailedTypeService.checkDuplicate('title', createDto.title);
      if (isDupTitle) throw new BadRequestException('حسابی با این عنوان از قبل وجود دارد');
    }
    const compId = companyId ? parseInt(companyId, 10) : 1;
    const brId = branchId ? parseInt(branchId, 10) : undefined;
    const agnId = agencyId ? parseInt(agencyId, 10) : undefined;
    return this.detailedTypeService.create(createDto, compId, brId, agnId);
  }

  @Put(':id')
  @Permissions('DetailedType:Update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDetailedTypeDto,
    @Headers('x-company-id') companyId?: string,
    @Headers('x-branch-id') branchId?: string,
    @Headers('x-agency-id') agencyId?: string,
  ) {
    if (updateDto.code) {
      const isDupCode = await this.detailedTypeService.checkDuplicate('code', updateDto.code, id);
      if (isDupCode) throw new BadRequestException('کد وارد شده تکراری است');
    }
    if (updateDto.title) {
      const isDupTitle = await this.detailedTypeService.checkDuplicate('title', updateDto.title, id);
      if (isDupTitle) throw new BadRequestException('حسابی با این عنوان از قبل وجود دارد');
    }
    const compId = companyId ? parseInt(companyId, 10) : 1;
    const brId = branchId ? parseInt(branchId, 10) : undefined;
    const agnId = agencyId ? parseInt(agencyId, 10) : undefined;
    return this.detailedTypeService.update(id, updateDto, compId, brId, agnId);
  }

  @Get()
  @Permissions('DetailedType:Read')
  async findAll(
    @Query('pageIndex') pageIndex?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sorting') sorting?: string,
    @Query('columnFilters') columnFilters?: string,
    @Query('globalFilter') globalFilter?: string,
    @Query('advancedFilters') advancedFilters?: string,
  ) {
    if (pageIndex !== undefined) {
      return this.detailedTypeService.findWithPagination({
        pageIndex: parseInt(pageIndex, 10),
        pageSize: parseInt(pageSize || '50', 10),
        sorting,
        columnFilters,
        globalFilter,
        advancedFilters,
      });
    }
    return this.detailedTypeService.findAll();
  }

  @Get(':id')
  @Permissions('DetailedType:Read')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.detailedTypeService.findOne(id);
  }

  @Delete(':id')
  @Permissions('DetailedType:Delete')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.detailedTypeService.remove(id);
  }
}
