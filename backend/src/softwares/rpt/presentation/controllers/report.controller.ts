import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ReportService } from '../../application/services/report.service';
import { UpsertReportDto } from '../../application/dtos/upsert-report.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { BaseSettingsService } from '../../../common/application/services/base-settings.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Controller('rpt/reports')
// @UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly baseSettingsService: BaseSettingsService,
    private readonly requestContext: RequestContextService,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

  @Get()
  async findAll(@Query('targetForm') targetForm?: string) {
    const bsId = this.requestContext.getBusinessStructureId()?.toString() || '1';
    const compId = this.requestContext.getCompanyId()?.toString() || '1';

    let isShared = true;
    try {
      const rows = await this.dataSource.query(`SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`, [Number(bsId)]);
      if (rows && rows.length > 0) {
        if (rows.some((r: any) => {
          const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
          return val === false || val === 0 || val === 'false' || val === null;
        })) {
          isShared = false;
        }
      } else {
        isShared = false;
      }
    } catch(err) {
      isShared = false;
    }

    const refToUse = isShared ? bsId : compId;
    let items;
    if (isShared) {
       items = await this.reportService.findAll(undefined, refToUse, targetForm);
    } else {
       items = await this.reportService.findAll(refToUse, undefined, targetForm);
    }
    return items;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reportService.findById(id);
  }

  @Post()
  async create(@Body() dto: UpsertReportDto) {
    const bsId = this.requestContext.getBusinessStructureId()?.toString() || '1';
    const compId = this.requestContext.getCompanyId()?.toString() || '1';
    return this.reportService.upsert(dto, compId, bsId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpsertReportDto) {
    dto.reportID = id;
    const bsId = this.requestContext.getBusinessStructureId()?.toString() || '1';
    const compId = this.requestContext.getCompanyId()?.toString() || '1';
    return this.reportService.upsert(dto, compId, bsId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.reportService.delete(id);
  }
}
