import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { Not, In } from 'typeorm';
import { PartyService } from '../../application/services/party.service';
import { CreatePartyDto } from '../../application/dtos/create-party.dto';
import { UpdatePartyDto } from '../../application/dtos/update-party.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';
import { Permissions } from '../../../../auth/permissions.decorator';

@Controller('common/parties')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PartyController {
  constructor(private readonly partyService: PartyService) {}

  @Post()
  @Permissions('Party.Create')
  async create(@Body() createDto: CreatePartyDto) {
    try {
      const data = await this.partyService.create(createDto);
      return { statusCode: HttpStatus.CREATED, data, message: 'Party created successfully' };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @Permissions('Party.Update')
  async update(@Param('id') id: number, @Body() updateDto: UpdatePartyDto) {
    try {
      const data = await this.partyService.update(id, updateDto);
      return { statusCode: HttpStatus.OK, data, message: 'Party updated successfully' };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @Permissions('Party.View')
  async findAll(@Query() query: any) {
    try {
      if (query.pageIndex !== undefined) {
        let filters = query.columnFilters ? JSON.parse(query.columnFilters) : [];
        
        // Specifically handle 'nature', 'isActive', 'isSupplier', and 'isCustomer' query params for dropdown filtering
        if (query.nature) {
          filters.push({ id: 'nature', value: { op: 'equals', value: query.nature } });
        }
        if (query.isActive !== undefined && query.isActive !== '') {
          const isAct = query.isActive === 'true' || query.isActive === true;
          filters.push({ id: 'isActive', value: { op: 'equals', value: isAct } });
        }
        if (query.isSupplier !== undefined && query.isSupplier !== '') {
          const isSupp = query.isSupplier === 'true' || query.isSupplier === true;
          filters.push({ id: 'isSupplier', value: { op: 'equals', value: isSupp } });
        }
        if (query.isCustomer !== undefined && query.isCustomer !== '') {
          const isCust = query.isCustomer === 'true' || query.isCustomer === true;
          filters.push({ id: 'isCustomer', value: { op: 'equals', value: isCust } });
        }


        const data = await this.partyService.findWithPagination({
          pageIndex: parseInt(query.pageIndex, 10),
          pageSize: parseInt(query.pageSize, 10),
          sorting: query.sorting ? JSON.parse(query.sorting) : [],
          columnFilters: filters,
          globalFilter: query.globalFilter,
          excludeAssignedCustomers: query.excludeAssignedCustomers === 'true' || query.excludeAssignedCustomers === true,
          excludeCustomerId: query.excludeCustomerId,
        });
        return { statusCode: HttpStatus.OK, data: { items: data.items, total: data.total } };
      }
      
      // If no pagination, still apply filters
      let options: any = { where: {} };
      if (query.nature) {
        options.where.nature = query.nature;
      }
      if (query.isActive !== undefined && query.isActive !== '') {
        options.where.isActive = query.isActive === 'true' || query.isActive === true;
      }
      if (query.isSupplier !== undefined && query.isSupplier !== '') {
        options.where.isSupplier = query.isSupplier === 'true' || query.isSupplier === true;
      }
      if (query.isCustomer !== undefined && query.isCustomer !== '') {
        options.where.isCustomer = query.isCustomer === 'true' || query.isCustomer === true;
      }
      options.excludeAssignedCustomers = query.excludeAssignedCustomers === 'true' || query.excludeAssignedCustomers === true;
      options.excludeCustomerId = query.excludeCustomerId;

      const data = await this.partyService.findAll(options);
      return { statusCode: HttpStatus.OK, data: { items: data, total: data.length } };
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('check-duplicate')
  @Permissions('Party.View')
  async checkDuplicate(
    @Query('field') field: string,
    @Query('value') value: string,
    @Query('excludeId') excludeId?: string,
  ) {
    try {
      if (!field || !value) {
        return { statusCode: HttpStatus.OK, data: { isDuplicate: false } };
      }
      const isDuplicate = await this.partyService.checkDuplicate(
        field as any, 
        value, 
        excludeId ? parseInt(excludeId, 10) : undefined
      );
      return { statusCode: HttpStatus.OK, data: { isDuplicate } };
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @Permissions('Party.View')
  async findOne(@Param('id') id: number) {
    try {
      const data = await this.partyService.findOne(id);
      return { statusCode: HttpStatus.OK, data };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @Permissions('Party.Delete')
  async remove(@Param('id') id: number) {
    try {
      await this.partyService.remove(id);
      return { statusCode: HttpStatus.OK, message: 'Party deleted successfully' };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
