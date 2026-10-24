import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, Query, BadRequestException } from '@nestjs/common';
import { AccountService } from '../../application/services/account.service';
import { Permissions } from '../../../../auth/permissions.decorator';

@Controller('accounting/accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}


  @Permissions('Account:Create')
  @Post('seed-default')
  async seedDefaultAccounts(@Body() body: { type?: number, group?: number, total?: number, specific?: number }) {
    await this.accountService.seedDefaultTree(
      body.type || 1,
      {
        group: body.group || 1,
        total: body.total || 2,
        specific: body.specific || 2
      }
    );
    return { success: true, message: 'کدینگ پیش فرض با موفقیت ایجاد شد' };
  }

  @Permissions('Account:Create')
  @Post()
  async create(@Body() createDto: any) {
    if (createDto.title) {
      const isDuplicateTitle = await this.accountService.checkDuplicate('title', createDto.title);
      if (isDuplicateTitle) {
        throw new BadRequestException('حسابی با این عنوان از قبل وجود دارد');
      }
    }
    const result = await this.accountService.create(createDto);
    return { success: true, data: result };
  }

  @Permissions('Account:Read')
  @Get('check-duplicate')
  async checkDuplicate(
    @Query('field') field: string,
    @Query('value') value: string,
    @Query('excludeId') excludeId?: string,
  ) {
    const isDuplicate = await this.accountService.checkDuplicate(
      field,
      value,
      excludeId ? parseInt(excludeId, 10) : undefined,
    );
    return { isDuplicate };
  }

  @Permissions('Account:Read')
  @Get()
  async findAll(@Query() query: any) {
    const search = query.search;
    const levelNum = query.level ? parseInt(query.level, 10) : undefined;
    const items = await this.accountService.findAll(search, levelNum, query);
    return { success: true, data: items };
  }

  @Permissions('Account:Read')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.accountService.findOne(id);
    return { success: true, data: result };
  }

  @Permissions('Account:Update')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: any,
  ) {
    if (updateDto.title) {
      const isDuplicateTitle = await this.accountService.checkDuplicate('title', updateDto.title, id);
      if (isDuplicateTitle) {
        throw new BadRequestException('حسابی با این عنوان از قبل وجود دارد');
      }
    }
    const result = await this.accountService.update(id, updateDto);
    return { success: true, message: 'Account updated successfully', data: result };
  }

  @Permissions('Account:Delete')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.accountService.remove(id);
    return { success: true, message: 'Account deleted successfully' };
  }
}
