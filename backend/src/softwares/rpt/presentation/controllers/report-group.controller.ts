import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ReportGroupService } from '../../application/services/report-group.service';
import { UpsertReportGroupDto } from '../../application/dtos/upsert-report-group.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { BaseSettingsService } from '../../../common/application/services/base-settings.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Controller('rpt/report-groups')
@UseGuards(JwtAuthGuard)
export class ReportGroupController {
  constructor(
    private readonly reportGroupService: ReportGroupService,
    private readonly baseSettingsService: BaseSettingsService,
    private readonly requestContext: RequestContextService,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

  @Get()
  async findAll() {
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
       items = await this.reportGroupService.findAll(undefined, refToUse);
    } else {
       items = await this.reportGroupService.findAll(refToUse, undefined);
    }
    return items;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reportGroupService.findById(id);
  }

  @Post()
  async create(@Body() dto: UpsertReportGroupDto) {
    const bsId = this.requestContext.getBusinessStructureId()?.toString() || '1';
    const compId = this.requestContext.getCompanyId()?.toString() || '1';
    return this.reportGroupService.upsert(dto, compId, bsId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpsertReportGroupDto) {
    dto.reportGroupID = id;
    const bsId = this.requestContext.getBusinessStructureId()?.toString() || '1';
    const compId = this.requestContext.getCompanyId()?.toString() || '1';
    return this.reportGroupService.upsert(dto, compId, bsId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.reportGroupService.delete(id);
  }
}
