import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Headers, Request, Query } from '@nestjs/common';
import { IamService } from '../services/iam.service';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../auth/permissions.guard';
import { Permissions } from '../../../auth/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('iam')
export class IamController {
  constructor(private readonly iamService: IamService) {}

  @Post('permissions/sync')
  @Permissions('UserManagement:Admin')
  async syncPermissions(@Body() body: { resources: { resource: string; actions: string[] }[] }) {
    await this.iamService.syncPermissions(body.resources);
    return { success: true };
  }

  @Get('permissions')
  @Permissions('UserManagement:Read')
  async getPermissions() {
    return this.iamService.getAllPermissions();
  }

  @Get('roles')
  @Permissions('UserManagement:Read')
  async getRoles() {
    return this.iamService.getAllRoles();
  }

  @Post('roles')
  @Permissions('UserManagement:Create')
  async createRole(@Body() body: any, @Headers('x-company-id') companyId?: string) {
    if (companyId && parseInt(companyId, 10) > 1) body.companyRef = parseInt(companyId, 10);
    return this.iamService.createRole(body);
  }

  @Put('roles/:id/permissions')
  @Permissions('UserManagement:Update')
  async updateRolePermissions(
    @Param('id') id: string,
    @Body() body: { permissionIds: string[], conditions?: any }
  ) {
    return this.iamService.updateRolePermissions(id, body.permissionIds, body.conditions);
  }

  // User endpoints
  @Get('users')
  @Permissions('UserManagement:Read')
  async getUsers(
    @Query('pageIndex') pageIndex?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sorting') sorting?: string,
    @Query('columnFilters') columnFilters?: string,
    @Query('globalFilter') globalFilter?: string,
    @Query('advancedFilters') advancedFilters?: string,
  ) {
    if (pageIndex !== undefined) {
      return this.iamService.getUsers({
        pageIndex: parseInt(pageIndex, 10),
        pageSize: parseInt(pageSize || '50', 10),
        sorting,
        columnFilters,
        globalFilter,
        advancedFilters,
      });
    }
    return this.iamService.getUsers();
  }

  @Get('2fa-in-use')
  async checkTwoFactorInUse() {
    return this.iamService.isTwoFactorInUse();
  }

  @Get('users/:id')
  @Permissions('UserManagement:Read')
  async getUser(@Param('id') id: string) {
    return this.iamService.getUserById(Number(id));
  }

  @Post('users')
  @Permissions('UserManagement:Create')
  async createUser(@Body() body: any, @Headers('x-company-id') companyId?: string) {
    body.companyRef = (companyId && parseInt(companyId, 10) > 1) ? parseInt(companyId, 10) : 2;
    return this.iamService.createUser(body);
  }

  @Put('users/:id')
  @Permissions('UserManagement:Update')
  async updateUser(@Param('id') id: string, @Body() body: any, @Headers('x-company-id') companyId?: string) {
    body.companyRef = (companyId && parseInt(companyId, 10) > 1) ? parseInt(companyId, 10) : 2;
    return this.iamService.updateUser(Number(id), body);
  }

  @Delete('users/:id')
  @Permissions('UserManagement:Delete')
  async deleteUser(@Param('id') id: string) {
    const result = await this.iamService.deleteUser(Number(id));
    if (result.affected === 0) {
      throw new Error('کاربر یافت نشد یا قبلاً حذف شده است');
    }
    return { success: true };
  }

  // User Group endpoints
  @Get('user-groups')
  @Permissions('UserManagement:Read')
  async getUserGroups(
    @Query('pageIndex') pageIndex?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sorting') sorting?: string,
    @Query('columnFilters') columnFilters?: string,
    @Query('globalFilter') globalFilter?: string,
    @Query('advancedFilters') advancedFilters?: string,
  ) {
    if (pageIndex !== undefined) {
      return this.iamService.getUserGroups({
        pageIndex: parseInt(pageIndex, 10),
        pageSize: parseInt(pageSize || '50', 10),
        sorting,
        columnFilters,
        globalFilter,
        advancedFilters,
      });
    }
    return this.iamService.getUserGroups();
  }

  @Get('user-groups/:id')
  @Permissions('UserManagement:Read')
  async getUserGroup(@Param('id') id: string) {
    return this.iamService.getUserGroupById(Number(id));
  }

  @Post('user-groups')
  @Permissions('UserManagement:Create')
  async createUserGroup(@Body() body: any, @Headers('x-company-id') companyId?: string) {
    if (companyId && parseInt(companyId, 10) > 1) body.companyRef = parseInt(companyId, 10);
    return this.iamService.createUserGroup(body);
  }

  @Put('user-groups/:id')
  @Permissions('UserManagement:Update')
  async updateUserGroup(@Param('id') id: string, @Body() body: any, @Headers('x-company-id') companyId?: string) {
    if (companyId && parseInt(companyId, 10) > 1) body.companyRef = parseInt(companyId, 10);
    return this.iamService.updateUserGroup(Number(id), body);
  }

  @Delete('user-groups/:id')
  @Permissions('UserManagement:Delete')
  async deleteUserGroup(@Param('id') id: string) {
    const result = await this.iamService.deleteUserGroup(Number(id));
    if (result.affected === 0) {
      throw new Error('گروه کاربری یافت نشد');
    }
    return { success: true };
  }

  @Get('me/business-structures')
  async getMyBusinessStructures(@Request() req: any) {
    return this.iamService.getMyBusinessStructures(req.user.userId);
  }

  // Business Structure Users endpoints
  @Get('business-structure/:id/users')
  @Permissions('UserManagement:Read')
  async getBusinessStructureUsers(@Param('id') id: string) {
    return this.iamService.getBusinessStructureUsers(Number(id));
  }

  @Post('business-structure/:id/users')
  @Permissions('UserManagement:Create')
  async addBusinessStructureUser(@Param('id') id: string, @Body() body: { userRef: number }) {
    return this.iamService.addBusinessStructureUser({
      businessStructureRef: Number(id),
      userRef: body.userRef
    });
  }

  @Delete('business-structure-users/:id')
  @Permissions('UserManagement:Delete')
  async deleteBusinessStructureUser(@Param('id') id: string) {
    return this.iamService.deleteBusinessStructureUser(Number(id));
  }
}
