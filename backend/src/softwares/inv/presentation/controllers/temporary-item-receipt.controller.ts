import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, NotFoundException, Req } from '@nestjs/common';
import { TemporaryItemReceiptService } from '../../application/services/temporary-item-receipt.service';
import { CreateTemporaryItemReceiptDto, UpdateTemporaryItemReceiptDto } from '../../application/dtos/temporary-item-receipt.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';

@Controller(['inv/temporary-item-receipts', 'inv/return-temporary-item-receipts'])
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TemporaryItemReceiptController {
  constructor(private readonly service: TemporaryItemReceiptService) {}

  @Post()
  create(@Req() req: any, @Body() createDto: CreateTemporaryItemReceiptDto) {
    const isReturn = req?.originalUrl?.includes('return-temporary-item-receipts');
    if (!createDto.Type) {
      createDto.Type = isReturn ? 2 : 1;
    }
    return this.service.create(createDto);
  }

  @Get()
  findAll(@Req() req: any, @Query() query: any) {
    const isReturn = req?.originalUrl?.includes('return-temporary-item-receipts');
    if (!query?.type && !query?.Type) {
      query = { ...query, type: isReturn ? 2 : 1 };
    }
    return this.service.findAll(query);
  }

  @Get('next-number')
  async getNextNumber(@Req() req: any, @Query('type') type?: string) {
    const isReturn = req?.originalUrl?.includes('return-temporary-item-receipts');
    const docType = type ? Number(type) : (isReturn ? 2 : 1);
    return this.service.getNextNumber(docType);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const numId = Number(id);
    if (isNaN(numId)) {
      throw new NotFoundException(`شناسه ${id} نامعتبر است`);
    }
    return this.service.findOne(numId);
  }

  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() updateDto: UpdateTemporaryItemReceiptDto) {
    const isReturn = req?.originalUrl?.includes('return-temporary-item-receipts');
    if (!updateDto.Type) {
      updateDto.Type = isReturn ? 2 : 1;
    }
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
