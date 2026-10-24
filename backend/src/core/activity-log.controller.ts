import { Controller, Post, Body, Req, UseGuards, Get } from '@nestjs/common';
import { Request } from 'express';
import { ActivityLogService } from './services/activity-log.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';

@Controller('activity-log')
@UseGuards(JwtAuthGuard)
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Post()
  async logClientAction(@Req() req: Request, @Body() body: any) {
    this.activityLogService.logActionAsync({
      action: body.action || 'OTHER',
      entityName: body.entityName,
      entityId: body.entityId,
      description: body.description,
      // Since it's from the client, we might rely on the context middleware for user / IP
      url: body.url || req.headers.referer || req.url,
      userAgent: req.headers['user-agent'],
    });

    return { success: true };
  }

  @Get()
  async findAll() {
    const data = await this.activityLogService.findAll();
    return { data };
  }
}
