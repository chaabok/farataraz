import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PaymentGatewayService } from '../../application/services/payment-gateway.service';
import { CreatePaymentGatewayDto } from '../../application/dtos/create-payment-gateway.dto';
import { UpdatePaymentGatewayDto } from '../../application/dtos/update-payment-gateway.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Controller('rap/payment-gateways')
@UseGuards(JwtAuthGuard)
export class PaymentGatewayController {
  constructor(
    private readonly paymentGatewayService: PaymentGatewayService,
    private readonly requestContextService: RequestContextService
  ) {}

  @Get()
  async findAll(@Query('isActive') isActive?: string) {
    const companyId = this.requestContextService.getCompanyId();
    const businessStructureId = this.requestContextService.getBusinessStructureId();
    let parsedActive: boolean | undefined;
    if (isActive === 'true') parsedActive = true;
    if (isActive === 'false') parsedActive = false;

    return this.paymentGatewayService.findAll(companyId, businessStructureId, parsedActive);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.paymentGatewayService.findOne(+id);
  }

  @Post()
  async create(@Body() createDto: CreatePaymentGatewayDto) {
    const companyId = this.requestContextService.getCompanyId();
    const businessStructureId = this.requestContextService.getBusinessStructureId();
    if (!createDto.businessStructureRef && businessStructureId) createDto.businessStructureRef = businessStructureId;
    if (!createDto.companyRef && companyId) createDto.companyRef = companyId;

    return this.paymentGatewayService.create(createDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdatePaymentGatewayDto) {
    return this.paymentGatewayService.update(+id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.paymentGatewayService.remove(+id);
  }
}
