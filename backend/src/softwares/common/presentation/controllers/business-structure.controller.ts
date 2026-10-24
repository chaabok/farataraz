import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpStatus, HttpException, UseGuards, Headers, Request } from '@nestjs/common';
import { BusinessStructureService } from '../../application/services/business-structure.service';
import { IamService } from '../../../../core/iam/services/iam.service';
import { CreateBusinessStructureDto } from '../../application/dtos/create-business-structure.dto';
import { UpdateBusinessStructureDto } from '../../application/dtos/update-business-structure.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';
import { Permissions } from '../../../../auth/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('business-structure')
export class BusinessStructureController {
  constructor(
    private readonly service: BusinessStructureService,
    private readonly iamService: IamService,
  ) {}

  @Post()
  @Permissions('BusinessStructure:Create')
  async create(@Body() createDto: CreateBusinessStructureDto, @Headers('x-company-id') companyId?: string) {
    try {
      const compId = companyId ? parseInt(companyId, 10) : 1;
      const result = await this.service.create(createDto, compId);
      return { statusCode: HttpStatus.CREATED, data: result };
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  private mapStructureName(item: any) {
    if (item.businessStructureName) {
      return item; // Value saved from the form
    }
    // Fallback for older records
    let name = '';
    switch (Number(item.businessStructure)) {
      case 1: name = 'دفتر مرکزی'; break;
      case 2: name = 'شرکت'; break;
      case 3: name = 'شعبه'; break;
      case 4: name = 'نمایندگی'; break;
      default: name = 'نامشخص';
    }
    return { ...item, businessStructureName: name };
  }

  @Get()
  @Permissions('BusinessStructure:Read')
  async findAll(@Request() req: any) {
    try {
      const result = await this.service.findAll();
      const mappedResult: any[] = result.map(this.mapStructureName.bind(this));
      
      // Filter based on user authorizations
      const authData = await this.iamService.getMyBusinessStructures(req.user.userId);
      
      if (authData.isAdmin) {
        return { statusCode: HttpStatus.OK, data: mappedResult };
      }
      
      // helper to find all ancestors
      const getAncestors = (items: any[], allowedIds: number[]) => {
        const ancestors = new Set<number>();
        const itemMap = new Map(items.map(item => [item.businessStructureId, item]));
        
        allowedIds.forEach(id => {
          let current = itemMap.get(id);
          while (current && current.parentRef) {
            ancestors.add(current.parentRef);
            current = itemMap.get(current.parentRef);
          }
        });
        
        return Array.from(ancestors);
      };

      const ancestorIds = getAncestors(mappedResult, authData.allowedIds);
      
      const filtered = mappedResult.filter((c: any) => 
        c.code === '01' || // Keep root if code is 01
        authData.allowedIds.includes(c.businessStructureId) ||
        ancestorIds.includes(c.businessStructureId)
      );

      return { statusCode: HttpStatus.OK, data: filtered };
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @Permissions('BusinessStructure:Read')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await this.service.findById(id);
      if (!result) {
        throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
      }
      return { statusCode: HttpStatus.OK, data: this.mapStructureName(result) };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @Permissions('BusinessStructure:Update')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateBusinessStructureDto, @Headers('x-company-id') companyId?: string) {
    try {
      const compId = companyId ? parseInt(companyId, 10) : 1;
      const result = await this.service.update(id, updateDto, compId);
      return { statusCode: HttpStatus.OK, data: result };
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @Permissions('BusinessStructure:Delete')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.service.delete(id);
      return { statusCode: HttpStatus.OK, message: 'Item deleted successfully' };
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
