import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeoLocation } from '../../domain/entities/geo-location.entity';
import { IGeoLocationRepository } from '../../domain/repositories/geo-location.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class GeoLocationRepository implements IGeoLocationRepository {
  constructor(
    @InjectRepository(GeoLocation)
    private readonly repository: Repository<GeoLocation>,
    private readonly requestContextService: RequestContextService,
  ) {}

  private async getScope() {
    let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
    let compId = this.requestContextService.getCompanyId() ?? 2;
    if (bsId <= 1) bsId = 2;
    if (compId <= 1) compId = 2;
    let isShared = true;

    try {
      const rows = await this.repository.manager.connection.query(
        `SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`,
        [bsId]
      );
      if (rows && rows.length > 0) {
        if (rows.some((r: any) => {
          const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
          return val === false || val === 0 || val === 'false' || val === null;
        })) {
          isShared = false;
        }
      } else {
        isShared = false;
      }
    } catch (err) {
      isShared = false;
    }

    return { bsId, compId, isShared };
  }

  async findAll(): Promise<GeoLocation[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
    
    return this.repository.find({ 
      where,
      order: { geolocationId: 'ASC' } 
    });
  }

  async findById(id: number): Promise<GeoLocation | null> {
    return this.repository.findOne({ where: { geolocationId: id } });
  }

  async findByCode(code: string): Promise<GeoLocation | null> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = { code };
    if (isShared) {
      where.businessStructureRef = bsId;
    } else {
      where.companyRef = compId;
    }
    return this.repository.findOne({ where });
  }

  async create(geoLocation: GeoLocation): Promise<GeoLocation> {
    const { bsId, compId } = await this.getScope();
    if (!geoLocation.businessStructureRef || geoLocation.businessStructureRef <= 1) geoLocation.businessStructureRef = bsId;
    if (!geoLocation.companyRef || geoLocation.companyRef <= 1) geoLocation.companyRef = compId;
    
    return this.repository.save(geoLocation);
  }

  async update(id: number, updateData: Partial<GeoLocation>): Promise<GeoLocation> {
    await this.repository.update(id, updateData);
    const updated = await this.findById(id);
    if (!updated) throw new NotFoundException('GeoLocation not found');
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async countChildren(parentId: number): Promise<number> {
    return this.repository.count({ where: { parentRef: parentId } });
  }
}
