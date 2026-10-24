import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CurrencyExchangeRateService } from '../../application/services/currency-exchange-rate.service';
import { CreateCurrencyExchangeRateDto } from '../../application/dtos/create-currency-exchange-rate.dto';
import { UpdateCurrencyExchangeRateDto } from '../../application/dtos/update-currency-exchange-rate.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Controller('common/currency-exchange-rates')
@UseGuards(JwtAuthGuard)
export class CurrencyExchangeRateController {
  constructor(
    private readonly service: CurrencyExchangeRateService,
    private readonly requestContext: RequestContextService
  ) {}

  @Get()
  async findAll() {
    const businessStructureId = this.requestContext.getBusinessStructureId()!;
    const companyId = this.requestContext.getCompanyId()!;
    return this.service.findAll(businessStructureId, companyId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const businessStructureId = this.requestContext.getBusinessStructureId()!;
    const companyId = this.requestContext.getCompanyId()!;
    return this.service.findById(id, businessStructureId, companyId);
  }

  @Post()
  async create(@Body() dto: CreateCurrencyExchangeRateDto) {
    const businessStructureId = this.requestContext.getBusinessStructureId()!;
    const companyId = this.requestContext.getCompanyId()!;
    const userId = this.requestContext.getUserId()!;
    return this.service.create(dto, businessStructureId, companyId, userId);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCurrencyExchangeRateDto) {
    const businessStructureId = this.requestContext.getBusinessStructureId()!;
    const companyId = this.requestContext.getCompanyId()!;
    const userId = this.requestContext.getUserId()!;
    return this.service.update(id, dto, businessStructureId, companyId, userId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const businessStructureId = this.requestContext.getBusinessStructureId()!;
    const companyId = this.requestContext.getCompanyId()!;
    await this.service.delete(id, businessStructureId, companyId);
    return { success: true };
  }
}
