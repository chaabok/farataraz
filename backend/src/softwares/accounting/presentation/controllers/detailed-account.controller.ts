import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { DetailedAccountService } from '../../application/services/detailed-account.service';
import { CreateDetailedAccountDto } from '../../application/dtos/create-detailed-account.dto';
import { UpdateDetailedAccountDto } from '../../application/dtos/update-detailed-account.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';
import { Permissions } from '../../../../auth/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('accounting/detailed-accounts')
export class DetailedAccountController {
  constructor(private readonly detailedAccountService: DetailedAccountService) {}

  @Post()
  @Permissions('DetailedAccount:Create')
  async create(@Body() createDetailedAccountDto: CreateDetailedAccountDto) {
    const isDuplicate = await this.detailedAccountService.checkDuplicate('code', createDetailedAccountDto.code);
    if (isDuplicate) {
      throw new BadRequestException('کد وارد شده تکراری است');
    }
    if (createDetailedAccountDto.title) {
      const isDuplicateTitle = await this.detailedAccountService.checkDuplicate('title', createDetailedAccountDto.title);
      if (isDuplicateTitle) {
        throw new BadRequestException('حسابی با این عنوان از قبل وجود دارد');
      }
    }
    const result = await this.detailedAccountService.create(createDetailedAccountDto);
    return { message: 'با موفقیت ثبت شد', data: result };
  }

  @Get()
  @Permissions('DetailedAccount:Read')
  async findAll(
    @Query('pageIndex') pageIndex?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sorting') sorting?: string,
    @Query('columnFilters') columnFilters?: string,
    @Query('globalFilter') globalFilter?: string,
    @Query('advancedFilters') advancedFilters?: string,
  ) {
    if (pageIndex !== undefined) {
      return await this.detailedAccountService.findWithPagination({
        pageIndex: parseInt(pageIndex, 10),
        pageSize: parseInt(pageSize || '50', 10),
        sorting,
        columnFilters,
        globalFilter,
        advancedFilters,
      });
    }
    const items = await this.detailedAccountService.findAll();
    return { items, total: items.length };
  }

  @Get(':id')
  @Permissions('DetailedAccount:Read')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.detailedAccountService.findOne(id);
  }

  @Put(':id')
  @Permissions('DetailedAccount:Update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDetailedAccountDto: UpdateDetailedAccountDto,
  ) {
    if (updateDetailedAccountDto.code) {
      const isDuplicate = await this.detailedAccountService.checkDuplicate('code', updateDetailedAccountDto.code, id);
      if (isDuplicate) {
        throw new BadRequestException('کد وارد شده تکراری است');
      }
    }
    if (updateDetailedAccountDto.title) {
      const isDuplicateTitle = await this.detailedAccountService.checkDuplicate('title', updateDetailedAccountDto.title, id);
      if (isDuplicateTitle) {
        throw new BadRequestException('حسابی با این عنوان از قبل وجود دارد');
      }
    }
    const result = await this.detailedAccountService.update(id, updateDetailedAccountDto);
    return { message: 'با موفقیت ویرایش شد', data: result };
  }

  @Delete(':id')
  @Permissions('DetailedAccount:Delete')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.detailedAccountService.remove(id);
    return { message: 'با موفقیت حذف شد' };
  }

  @Post('bulk-delete')
  @Permissions('DetailedAccount:Delete')
  async bulkDelete(@Body() body: { ids: number[] }) {
    if (!body.ids || !Array.isArray(body.ids)) {
      throw new BadRequestException('لیست شناسه‌ها نامعتبر است');
    }
    await this.detailedAccountService.removeMany(body.ids);
    return { message: 'موارد انتخاب شده با موفقیت حذف شدند' };
  }
}
