import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ProjectService } from '../services/project.service';
import { Project } from '../../domain/entities/project.entity';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';

@Controller('cnt/projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  findAll() {
    return this.projectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(+id);
  }

  @Post()
  create(@Body() data: Partial<Project>) {
    return this.projectService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Project>) {
    return this.projectService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(+id);
  }
}
