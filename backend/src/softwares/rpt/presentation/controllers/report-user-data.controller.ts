import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ReportUserDataService } from '../../application/services/report-user-data.service';
import { UpsertReportUserDataDto } from '../../application/dtos/upsert-report-user-data.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';

@Controller('report-user-data')
@UseGuards(JwtAuthGuard)
export class ReportUserDataController {
  constructor(private readonly reportUserDataService: ReportUserDataService) {}

  @Post()
  async upsertData(@Body() dto: UpsertReportUserDataDto, @Req() req: any) {
    return await this.reportUserDataService.upsertData(dto, req.user);
  }

  @Get(':reportName')
  async getByReportName(@Param('reportName') reportName: string, @Req() req: any) {
    return await this.reportUserDataService.getByReportName(reportName, req.user);
  }
}
