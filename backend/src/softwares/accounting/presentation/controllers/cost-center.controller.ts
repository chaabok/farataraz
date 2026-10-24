import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { CostCenterService } from '../../application/services/cost-center.service';
import { CreateCostCenterDto } from '../../application/dtos/create-cost-center.dto';
import { UpdateCostCenterDto } from '../../application/dtos/update-cost-center.dto';
import { Permissions } from '../../../../auth/permissions.decorator';
import { DetailedAccountsNumberingService } from '../../../common/application/services/detailed-accounts-numbering.service';

@Controller('accounting/cost-center')
export class CostCenterController {
  constructor(
    private readonly costCenterService: CostCenterService,
    private readonly detailedAccountsNumberingService: DetailedAccountsNumberingService
  ) {}

  @Post()
  @Permissions('ACC_COST_CENTER_CREATE')
  create(@Body() createDto: CreateCostCenterDto) {
    return this.costCenterService.create(createDto);
  }

  @Put(':id')
  @Permissions('ACC_COST_CENTER_UPDATE')
  update(@Param('id') id: string, @Body() updateDto: UpdateCostCenterDto) {
    return this.costCenterService.update(+id, updateDto);
  }

  @Delete(':id')
  @Permissions('ACC_COST_CENTER_DELETE')
  remove(@Param('id') id: string) {
    return this.costCenterService.remove(+id);
  }

  @Post('bulk-delete')
  @Permissions('ACC_COST_CENTER_DELETE')
  bulkRemove(@Body('ids') ids: number[]) {
    return this.costCenterService.bulkRemove(ids);
  }

  @Get()
  @Permissions('ACC_COST_CENTER_VIEW')
  findAll() {
    return this.costCenterService.findAll();
  }

  @Get('advanced')
  @Permissions('ACC_COST_CENTER_VIEW')
  findAdvanced(@Query() query: any) {
    return this.costCenterService.findWithPagination({
      pageIndex: parseInt(query.pageIndex || '0', 10),
      pageSize: parseInt(query.pageSize || '10', 10),
      sorting: query.sorting,
      columnFilters: query.columnFilters,
      globalFilter: query.globalFilter,
      advancedFilters: query.advancedFilters,
    });
  }

  @Get('init')
  @Permissions('ACC_COST_CENTER_VIEW')
  async getInitData() {
    const nextCode = await this.costCenterService.getNextCode();
    
    let detailedNumber = '';
    const { detailedTypeService } = this.detailedAccountsNumberingService as any;
    if (detailedTypeService) {
      const types = await detailedTypeService.findAll();
      const typeCostCenter = types.find((t: any) => t.code === '15');
      if (typeCostCenter) {
         detailedNumber = await this.detailedAccountsNumberingService.getNextCode(typeCostCenter.detailedTypesId);
      }
    }
    return {
      nextCode: String(nextCode),
      detailedNumber: detailedNumber
    };
  }

  @Get(':id')
  @Permissions('ACC_COST_CENTER_VIEW')
  findOne(@Param('id') id: string) {
    return this.costCenterService.findOne(+id);
  }
}
