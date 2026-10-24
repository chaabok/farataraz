import { Controller, Get, Post, Body, Param, ParseIntPipe, Delete, Put, Query, UseGuards, Headers, BadRequestException } from '@nestjs/common';
import { OtherDetailsService } from '../../application/services/other-details.service';
import { CreateOtherDetailsDto } from '../../application/dtos/create-other-details.dto';
import { UpdateOtherDetailsDto } from '../../application/dtos/update-other-details.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';
import { Permissions } from '../../../../auth/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('accounting/other-details')
export class OtherDetailsController {
  constructor(private readonly otherDetailsService: OtherDetailsService) {}

  @Get('check-duplicate')
  @Permissions('OtherDetails:Read')
  async checkDuplicate(
    @Query('field') field: string,
    @Query('value') value: string,
    @Query('excludeId') excludeId?: string,
  ) {
    const isDuplicate = await this.otherDetailsService.checkDuplicate(
      field, 
      value, 
      excludeId ? parseInt(excludeId, 10) : undefined
    );
    return { isDuplicate };
  }

  @Post()
  @Permissions('OtherDetails:Create')
  async create(
    @Body() createDto: CreateOtherDetailsDto,
    @Headers('x-company-id') companyId?: string,
    @Headers('x-branch-id') branchId?: string,
    @Headers('x-agency-id') agencyId?: string,
  ) {
    if (createDto.title) {
      const isDupTitle = await this.otherDetailsService.checkDuplicate('title', createDto.title);
      if (isDupTitle) throw new BadRequestException('حسابی با این عنوان از قبل وجود دارد');
    }
    const compId = companyId ? parseInt(companyId, 10) : 1;
    const brId = branchId ? parseInt(branchId, 10) : undefined;
    const agnId = agencyId ? parseInt(agencyId, 10) : undefined;
    return this.otherDetailsService.create(createDto, compId, brId, agnId);
  }

  @Put(':id')
  @Permissions('OtherDetails:Update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateOtherDetailsDto,
    @Headers('x-company-id') companyId?: string,
    @Headers('x-branch-id') branchId?: string,
    @Headers('x-agency-id') agencyId?: string,
  ) {
    if (updateDto.title) {
      const isDupTitle = await this.otherDetailsService.checkDuplicate('title', updateDto.title, id);
      if (isDupTitle) throw new BadRequestException('حسابی با این عنوان از قبل وجود دارد');
    }
    const compId = companyId ? parseInt(companyId, 10) : 1;
    const brId = branchId ? parseInt(branchId, 10) : undefined;
    const agnId = agencyId ? parseInt(agencyId, 10) : undefined;
    return this.otherDetailsService.update(id, updateDto, compId, brId, agnId);
  }

  @Get()
  @Permissions('OtherDetails:Read')
  async findAll(
    @Query('pageIndex') pageIndex?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sorting') sorting?: string,
    @Query('columnFilters') columnFilters?: string,
    @Query('globalFilter') globalFilter?: string,
    @Query('advancedFilters') advancedFilters?: string,
  ) {
    if (pageIndex !== undefined) {
      return this.otherDetailsService.findWithPagination({
        pageIndex: parseInt(pageIndex, 10),
        pageSize: parseInt(pageSize || '50', 10),
        sorting,
        columnFilters,
        globalFilter,
        advancedFilters,
      });
    }
    return this.otherDetailsService.findAll();
  }

  @Get(':id')
  @Permissions('OtherDetails:Read')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.otherDetailsService.findOne(id);
  }

  @Delete(':id')
  @Permissions('OtherDetails:Delete')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.otherDetailsService.remove(id);
  }
}
