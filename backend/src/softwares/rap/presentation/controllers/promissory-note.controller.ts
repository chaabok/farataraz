import { Controller, Get, Post, Body, Req, Param, Put, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { PromissoryNoteService } from '../../application/services/promissory-note.service';
import { CreatePromissoryNoteDto } from '../../application/dtos/create-promissory-note.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';

@Controller('rap/promissory-notes')
@UseGuards(JwtAuthGuard)
export class PromissoryNoteController {
  constructor(private readonly promissoryNoteService: PromissoryNoteService) {}

  @Get()
  async findAll(
    @Query('pageIndex') pageIndex?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sorting') sorting?: string,
    @Query('columnFilters') columnFilters?: string,
    @Query('globalFilter') globalFilter?: string,
    @Query('advancedFilters') advancedFilters?: string,
  ) {
    if (pageIndex !== undefined && pageSize !== undefined) {
      return this.promissoryNoteService.findWithPagination({
        pageIndex: parseInt(pageIndex, 10),
        pageSize: parseInt(pageSize, 10),
        sorting,
        columnFilters,
        globalFilter,
        advancedFilters,
      });
    }
    return this.promissoryNoteService.findAll();
  }

  @Get('unused')
  async getUnusedItems() {
    const data = await this.promissoryNoteService.findUnusedItems();
    return { data };
  }
  
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.promissoryNoteService.findOne(id);
  }

  @Post()
  create(@Req() req: Request, @Body() createDto: CreatePromissoryNoteDto) {
    console.log("DEBUG: Raw request body:", JSON.stringify(req.body));
    console.log("DEBUG: DTO after validation:", JSON.stringify(createDto));
    return this.promissoryNoteService.create(createDto);
  }
  
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: any) {
    return this.promissoryNoteService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.promissoryNoteService.remove(id);
    return { success: true, id };
  }
}
