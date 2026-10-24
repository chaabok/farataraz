import { Controller, Get, UseGuards } from '@nestjs/common';
import { GnrEntityService } from '../../application/services/gnr-entity.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GnrEntity } from '../../domain/entities/gnr-entity.entity';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';
import { Permissions } from '../../../../auth/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('gnr-entities')
export class GnrEntityController {
  constructor(
    @InjectRepository(GnrEntity)
    private readonly gnrEntityRepository: Repository<GnrEntity>,
  ) {}

  @Get()
  @Permissions('StructuralSettings:Read')
  async findAll() {
    const data = await this.gnrEntityRepository.find({
      relations: ['parent'],
      order: { entityID: 'ASC' }
    });
    return { data };
  }
}
