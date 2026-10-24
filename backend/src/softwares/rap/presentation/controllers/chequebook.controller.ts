import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChequebookService } from '../../application/services/chequebook.service';
import { CreateChequebookDto } from '../../application/dtos/create-chequebook.dto';
import { UpdateChequebookDto } from '../../application/dtos/update-chequebook.dto';
import { Permissions } from '../../../../auth/permissions.decorator';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';

@Controller('rap/chequebooks')
@UseGuards(JwtAuthGuard)
export class ChequebookController {
  constructor(private readonly chequebookService: ChequebookService) {}

  @Post()
  @Permissions('rap.chequebooks.create')
  async create(@Body() createDto: CreateChequebookDto) {
    return await this.chequebookService.create(createDto);
  }

  @Get()
  @Permissions('rap.chequebooks.read')
  async findAll(@Query() query: any) {
    return await this.chequebookService.findAll(query);
  }

  @Get(':id')
  @Permissions('rap.chequebooks.read')
  async findOne(@Param('id') id: string) {
    return await this.chequebookService.findById(+id);
  }

  @Put(':id')
  @Permissions('rap.chequebooks.update')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateChequebookDto,
  ) {
    return await this.chequebookService.update(+id, updateDto);
  }

  @Delete(':id')
  @Permissions('rap.chequebooks.delete')
  async remove(@Param('id') id: string) {
    await this.chequebookService.delete(+id);
    return { success: true, id };
  }
}
