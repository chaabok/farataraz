import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CustomerService } from '../../application/services/customer.service';
import { CreateCustomerDto, UpdateCustomerDto } from '../../application/dtos/create-customer.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sle/customers')
export class CustomerController {
  constructor(private readonly service: CustomerService) {}

  @Get()
  async findAll() {
    const data = await this.service.findAll();
    return { success: true, data };
  }

  @Get('next-number')
  async getNextCode() {
    const data = await this.service.getNextCode();
    return { success: true, data: { documentNumber: data.code } };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = await this.service.findById(Number(id));
    return { success: true, data };
  }

  @Post('upsert')
  async upsert(@Body() dto: CreateCustomerDto & { CustomerID?: number }) {
    if (dto.CustomerID) {
      const data = await this.service.update(dto.CustomerID, dto);
      return { success: true, data };
    } else {
      const data = await this.service.create(dto);
      return { success: true, data };
    }
  }

  @Post()
  async create(@Body() dto: CreateCustomerDto) {
    const data = await this.service.create(dto);
    return { success: true, data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    const data = await this.service.update(Number(id), dto);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(Number(id));
    return { success: true, message: 'Deleted successfully' };
  }
}
