import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IGeoLocationRepository } from '../../domain/repositories/geo-location.repository.interface';
import { CreateGeoLocationDto } from '../dtos/create-geo-location.dto';
import { UpdateGeoLocationDto } from '../dtos/update-geo-location.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { GeoLocation } from '../../domain/entities/geo-location.entity';
import { GeographicType } from '../../domain/entities/geographic-type.enum';

@Injectable()
export class GeoLocationService {
  constructor(
    @Inject(IGeoLocationRepository)
    private readonly repository: IGeoLocationRepository,
    private readonly idGenerationService: IdGenerationService,
  ) {}

  async findAll() {
    return this.repository.findAll();
  }

  async findAllCitiesFlattened() {
    const all = await this.repository.findAll();
    const map = new Map(all.map(item => [item.geolocationId, item]));

    const cities = all.filter(item => item.geographicType === GeographicType.City);
    
    return cities.map(city => {
      const province = map.get(city.parentRef);
      const country = province ? map.get(province.parentRef) : null;
      
      return {
        id: city.geolocationId,
        code: city.code,
        title: city.title,
        latinTitle: city.titleEn,
        province: province ? province.title : '',
        country: country ? country.title : ''
      };
    });
  }

  async findById(id: number) {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException('GeoLocation not found');
    return item;
  }

  async create(dto: CreateGeoLocationDto) {
    const existing = await this.repository.findByCode(dto.code);
    if (existing) {
      throw new BadRequestException('کد تکراری است');
    }

    const newId = await this.idGenerationService.generateNextId('GeoLocation');
    
    const entity = new GeoLocation();
    entity.geolocationId = newId;
    entity.parentRef = dto.parentRef || 0;
    entity.geographicType = dto.geographicType;
    entity.code = dto.code;
    entity.title = dto.title;
    entity.titleEn = dto.titleEn;
    entity.isActive = dto.isActive !== undefined ? dto.isActive : true;

    return this.repository.create(entity);
  }

  async update(id: number, dto: UpdateGeoLocationDto) {
    const item = await this.findById(id);
    if (dto.code && dto.code !== item.code) {
      const existing = await this.repository.findByCode(dto.code);
      if (existing && existing.geolocationId !== id) {
        throw new BadRequestException('کد تکراری است');
      }
    }

    return this.repository.update(id, dto);
  }

  async delete(id: number) {
    const item = await this.findById(id);
    const childrenCount = await this.repository.countChildren(id);
    if (childrenCount > 0) {
      throw new BadRequestException('ابتدا زیرشاخه‌ها را حذف کنید');
    }
    await this.repository.delete(id);
    return { success: true };
  }
}
