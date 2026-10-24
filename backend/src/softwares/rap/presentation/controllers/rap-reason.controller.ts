import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RapReasonService } from '../../application/services/rap-reason.service';
import { CreateRapReasonDto } from '../../application/dtos/create-rap-reason.dto';
import { UpdateRapReasonDto } from '../../application/dtos/update-rap-reason.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Controller('rap/reasons')
@UseGuards(JwtAuthGuard)
export class RapReasonController {
  constructor(
    private readonly rapReasonService: RapReasonService,
    private readonly requestContextService: RequestContextService
  ) {}

  @Post()
  create(@Body() createDto: CreateRapReasonDto) {
    const authContext = {
      businessStructureId: this.requestContextService.getBusinessStructureId() || 2,
      companyId: this.requestContextService.getCompanyId() || 2
    };
    return this.rapReasonService.create(createDto, authContext);
  }

  @Get()
  findAll() {
    const authContext = {
      businessStructureId: this.requestContextService.getBusinessStructureId() || 2,
      companyId: this.requestContextService.getCompanyId() || 2
    };
    return this.rapReasonService.findAll(authContext);
  }

  @Get('tree')
  findTree() {
    const authContext = {
      businessStructureId: this.requestContextService.getBusinessStructureId() || 2,
      companyId: this.requestContextService.getCompanyId() || 2
    };
    return this.rapReasonService.findAllTree(authContext);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    const authContext = {
      businessStructureId: this.requestContextService.getBusinessStructureId() || 2,
      companyId: this.requestContextService.getCompanyId() || 2
    };
    return this.rapReasonService.findOne(id, authContext);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateRapReasonDto) {
    const authContext = {
      businessStructureId: this.requestContextService.getBusinessStructureId() || 2,
      companyId: this.requestContextService.getCompanyId() || 2
    };
    return this.rapReasonService.update(id, updateDto, authContext);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    const authContext = {
      businessStructureId: this.requestContextService.getBusinessStructureId() || 2,
      companyId: this.requestContextService.getCompanyId() || 2
    };
    return this.rapReasonService.remove(id, authContext);
  }
}
