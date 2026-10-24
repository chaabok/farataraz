import { Controller, Get, Post, Body, Put, Patch, Param, Delete, UseGuards, Query, Headers } from '@nestjs/common';
import { FiscalYearService } from '../../application/services/fiscal-year.service';
import { CreateFiscalYearDto } from '../../application/dtos/create-fiscal-year.dto';
import { UpdateFiscalYearDto } from '../../application/dtos/update-fiscal-year.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';
import { Permissions } from '../../../../auth/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('common/fiscalyear')
export class FiscalYearController {
  constructor(private readonly service: FiscalYearService) {}

  @Post()
  @Permissions('FiscalYear:Create')
  create(
    @Body() createDto: CreateFiscalYearDto,
    @Headers('x-company-id') companyId?: string,
    @Headers('x-branch-id') branchId?: string,
    @Headers('x-agency-id') agencyId?: string,
  ) {
    const compId = companyId ? parseInt(companyId, 10) : 1;
    const brId = branchId ? parseInt(branchId, 10) : undefined;
    const agnId = agencyId ? parseInt(agencyId, 10) : undefined;
    return this.service.create(createDto, compId, brId, agnId);
  }

  @Get('check-title')
  @Permissions('FiscalYear:Read')
  checkTitle(@Query('title') title: string, @Query('id') id?: string) {
    return this.service.checkDuplicateTitle(title, id ? +id : undefined);
  }

  @Get()
  @Permissions('FiscalYear:Read')
  findAll(
    @Query('pageIndex') pageIndex?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sorting') sorting?: string,
    @Query('columnFilters') columnFilters?: string,
    @Query('globalFilter') globalFilter?: string,
    @Query('advancedFilters') advancedFilters?: string,
  ) {
    if (pageIndex !== undefined && pageSize !== undefined) {
      return this.service.findWithPagination({
        pageIndex: parseInt(pageIndex, 10),
        pageSize: parseInt(pageSize, 10),
        sorting,
        columnFilters,
        globalFilter,
        advancedFilters,
      });
    }
    return this.service.findAll();
  }

  @Get(':id')
  @Permissions('FiscalYear:Read')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  @Patch(':id')
  @Permissions('FiscalYear:Update')
  update(
    @Param('id') id: string, 
    @Body() updateDto: UpdateFiscalYearDto,
    @Headers('x-company-id') companyId?: string,
    @Headers('x-branch-id') branchId?: string,
    @Headers('x-agency-id') agencyId?: string,
  ) {
    const compId = companyId ? parseInt(companyId, 10) : 1;
    const brId = branchId ? parseInt(branchId, 10) : undefined;
    const agnId = agencyId ? parseInt(agencyId, 10) : undefined;
    return this.service.update(+id, updateDto, compId, brId, agnId);
  }

  @Delete(':id')
  @Permissions('FiscalYear:Delete')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
