import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TrackingFactorService } from '../../application/services/tracking-factor.service';
import { CreateTrackingFactorDto, UpdateTrackingFactorDto } from '../../application/dtos/tracking-factor.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';

@Controller('inv/tracking-factors')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TrackingFactorController {
  constructor(private readonly service: TrackingFactorService) {}

  @Get('next-number')
  getNextNumber() {
    return this.service.getNextNumber();
  }

  @Get('next-priority')
  getNextPriority() {
    return this.service.getNextPriority();
  }

  @Get('available-items')
  getAvailableItems(@Query('trackingFactorId') trackingFactorId?: string) {
    const tfId = trackingFactorId ? parseInt(trackingFactorId, 10) : undefined;
    return this.service.getAvailableItems(tfId);
  }

  @Post('validate-range')
  validateRange(@Body() body: any) {
    return this.service.validateRange(body);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateTrackingFactorDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTrackingFactorDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
