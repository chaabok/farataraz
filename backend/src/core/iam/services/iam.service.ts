import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { User } from '../entities/user.entity';
import { UserGroup } from '../entities/user-group.entity';
import { UserGroupPermission } from '../entities/user-group-permission.entity';
import { BusinessStructureUsers } from '../entities/business-structure-user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class IamService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
    @InjectRepository(UserGroupPermission)
    private readonly userGroupPermissionRepository: Repository<UserGroupPermission>,
    @InjectRepository(BusinessStructureUsers)
    private readonly businessStructureUsersRepository: Repository<BusinessStructureUsers>,
  ) {}

  async onModuleInit() {
    const adminUser = await this.userRepository.findOne({ where: { username: 'admin' } });
    if (process.env.SYNC_DB === 'true' || !adminUser) {
      await this.seedInit();
    }
  }

  async seedInit() {
    console.log('IamService: Checking for default admin user...');
    try {
      // 1. Ensure admin user exists
      const adminUser = await this.userRepository.findOne({ where: { username: 'admin' } });
      if (!adminUser) {
        console.log('IamService: Admin user not found. Creating default admin...');
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash('1234', salt);
        
        const newAdmin = this.userRepository.create({
          id: 1,
          username: 'admin',
          passwordHash: passwordHash,
          firstName: 'مدیر',
          lastName: 'سیستم',
          isActive: true,
          companyRef: 2,
        });
        await this.userRepository.save(newAdmin);
        console.log('IamService: Default admin user created successfully.');
      } else {
        console.log('IamService: Admin user already exists.');
      }
    } catch (error) {
      console.error('IamService: Error during seeding:', error);
    }
  }

  async syncPermissions(resources: { resource: string; actions: string[] }[]) {
    // A simplified sync logic to add new permissions from the frontend registry
    for (const res of resources) {
      for (const action of res.actions) {
        const existing = await this.permissionRepository.findOne({
          where: { resource: res.resource, action: action },
        });
        if (!existing) {
          const maxPermIdResult = await this.permissionRepository.query('SELECT MAX("PermissionID") as max_id FROM "Iam"."Permission"');
          const nextId = (maxPermIdResult[0]?.max_id ? parseInt(maxPermIdResult[0].max_id, 10) : 0) + 1;
          const perm = this.permissionRepository.create({
            id: nextId,
            resource: res.resource,
            action: action,
            isAutoDiscovered: true,
          });
          await this.permissionRepository.save(perm);
        }
      }
    }
  }

  async getAllPermissions() {
    return this.permissionRepository.find();
  }

  async getAllRoles() {
    return this.roleRepository.find({ relations: ['permissions', 'permissions.permission'] });
  }

  async createRole(data: Partial<Role>) {
    const maxRoleIdResult = await this.roleRepository.query('SELECT MAX("RoleID") as max_id FROM "Iam"."Role"');
    const nextId = (maxRoleIdResult[0]?.max_id ? parseInt(maxRoleIdResult[0].max_id, 10) : 0) + 1;
    const role = this.roleRepository.create({
      ...data,
      id: nextId
    });
    return this.roleRepository.save(role);
  }

  async updateRolePermissions(roleIdStr: string | number, permissionIdsStr: (string | number)[], conditions: Record<string, any> = {}) {
    const roleId = Number(roleIdStr);
    const permissionIds = permissionIdsStr.map(Number);
    const role = await this.roleRepository.findOne({ where: { id: roleId }, relations: ['permissions'] });
    if (!role) throw new BadRequestException('Role not found');

    // Remove existing
    await this.rolePermissionRepository.delete({ roleId });

    // Add new ones
    const maxRolePermIdResult = await this.rolePermissionRepository.query('SELECT MAX("RolePermissionID") as max_id FROM "Iam"."RolePermission"');
    let nextId = (maxRolePermIdResult[0]?.max_id ? parseInt(maxRolePermIdResult[0].max_id, 10) : 0) + 1;

    const newRolePermissions = permissionIds.map(permissionId => 
      this.rolePermissionRepository.create({
        id: nextId++,
        roleId,
        permissionId,
        conditions,
      })
    );

    await this.rolePermissionRepository.save(newRolePermissions);
    
    return this.roleRepository.findOne({ where: { id: roleId }, relations: ['permissions', 'permissions.permission'] });
  }

  /**
   * Strips security-sensitive fields (password hash, refresh token, 2FA secret)
   * before a user entity is returned by any API response.
   */
  private sanitizeUser<T extends Record<string, any>>(user: T): any {
    if (!user) return user;
    const { passwordHash, refreshToken, twoFactorSecret, ...safe } = user;
    return safe;
  }

  async getUsers(params?: any) {
    if (params) {
      const { applyDataGridParams } = await import('../../utils/typeorm-query-builder');
      const queryBuilder = this.userRepository.createQueryBuilder('user');
      applyDataGridParams(queryBuilder, params, 'user');
      const [items, total] = await queryBuilder.getManyAndCount();
      return { items: items.map(u => this.sanitizeUser(u)), total };
    }
    const users = await this.userRepository.find();
    return users.map(u => this.sanitizeUser(u));
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: [
        'roles', 
        'roles.role', 
        'roles.role.permissions', 
        'roles.role.permissions.permission',
        'userGroup',
        'userGroup.permissions'
      ],
    });

    if (user) {
      const permissions = new Set<string>();
      
      // Collect user-specific permissions
      user.roles?.forEach(ur => {
        ur.role?.permissions?.forEach(rp => {
          if (rp.permission?.resource) {
            permissions.add(rp.permission.resource);
          }
        });
      });

      // Collect group permissions if assigned
      if (user.userGroup && user.userGroup.permissions) {
        user.userGroup.permissions.forEach(ugp => {
          if (ugp.value) {
            permissions.add(ugp.permissionKey);
          }
        });
      }

      return this.sanitizeUser({
        ...user,
        permissions: Array.from(permissions)
      });
    }
    return null;
  }

  async createUser(data: any) {
    console.log('createUser payload:', data);
    const maxIdResult = await this.userRepository.query('SELECT MAX("UserID") as max_id FROM "Iam"."User"');
    const nextId = (maxIdResult[0]?.max_id ? parseInt(maxIdResult[0].max_id, 10) : 0) + 1;
    
    let passwordHash = '';
    if (data.password) {
      const salt = await bcrypt.genSalt(12);
      passwordHash = await bcrypt.hash(data.password, salt);
    } else {
      throw new BadRequestException("کلمه عبور الزامی است");
    }
    
    const user = this.userRepository.create({
      id: nextId,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      isActive: data.isActive !== undefined ? data.isActive : true,
      repeatChangePassword: data.repeatChangePassword ? parseInt(data.repeatChangePassword, 10) : 0,
      passwordHash: passwordHash,
      userGroupRef: data.UserGroupRef ? Number(data.UserGroupRef) : (data.userGroupRef ? Number(data.userGroupRef) : null),
      companyRef: (data.companyRef && Number(data.companyRef) > 1) ? Number(data.companyRef) : 2,
    });
    
    const savedUser = await this.userRepository.save(user);

    if (data.permissions && Array.isArray(data.permissions)) {
      await this.syncUserPermissions(savedUser.id, data.permissions);
    }

    return savedUser;
  }

  async updateUser(id: number, data: any) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new BadRequestException('User not found');

    if (data.username !== undefined) user.username = data.username;
    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.isActive !== undefined) user.isActive = data.isActive;
    if (data.repeatChangePassword !== undefined) user.repeatChangePassword = parseInt(data.repeatChangePassword, 10);
    if (data.UserGroupRef !== undefined) user.userGroupRef = data.UserGroupRef ? Number(data.UserGroupRef) : null;
    if (data.userGroupRef !== undefined) user.userGroupRef = data.userGroupRef ? Number(data.userGroupRef) : null;
    if (data.companyRef !== undefined) user.companyRef = Number(data.companyRef) > 1 ? Number(data.companyRef) : 2;
    
    if (data.password) {
      const salt = await bcrypt.genSalt(12);
      user.passwordHash = await bcrypt.hash(data.password, salt);
    }

    const savedUser = await this.userRepository.save(user);

    if (data.permissions && Array.isArray(data.permissions)) {
      await this.syncUserPermissions(savedUser.id, data.permissions);
    }

    return savedUser;
  }

  private async syncUserPermissions(userId: number, permissions: string[]) {
    // 1. Ensure permissions exist in Permission table
    for (const p of permissions) {
      const existingPerm = await this.permissionRepository.findOne({ where: { resource: p, action: 'access' } });
      if (!existingPerm) {
        const maxPermIdResult = await this.permissionRepository.query('SELECT MAX("PermissionID") as max_id FROM "Iam"."Permission"');
        const nextId = (maxPermIdResult[0]?.max_id ? parseInt(maxPermIdResult[0].max_id, 10) : 0) + 1;
        await this.permissionRepository.save(this.permissionRepository.create({
          id: nextId,
          resource: p,
          action: 'access',
          isAutoDiscovered: true
        }));
      }
    }

    // 2. Find or create User-Specific Role
    const roleName = `USER_ROLE_${userId}`;
    let role = await this.roleRepository.findOne({ where: { name: roleName } });
    if (!role) {
      const maxRoleIdResult = await this.roleRepository.query('SELECT MAX("RoleID") as max_id FROM "Iam"."Role"');
      const nextId = (maxRoleIdResult[0]?.max_id ? parseInt(maxRoleIdResult[0].max_id, 10) : 0) + 1;
      role = await this.roleRepository.save(this.roleRepository.create({
        id: nextId,
        name: roleName,
        description: `Dedicated role for user ${userId}`
      }));
    }

    // 3. Link user to role if not linked
    const userRoleRepo = this.userRepository.manager.getRepository('UserRole');
    const existingLink = await userRoleRepo.findOne({ where: { userId, roleId: role.id } });
    if (!existingLink) {
      const maxUserRoleIdResult = await userRoleRepo.query('SELECT MAX("UserRoleID") as max_id FROM "Iam"."UserRole"');
      const nextId = (maxUserRoleIdResult[0]?.max_id ? parseInt(maxUserRoleIdResult[0].max_id, 10) : 0) + 1;
      await userRoleRepo.save({ id: nextId, userId, roleId: role.id });
    }

    // 4. Update Role Permissions
    const allMatchingPerms = await this.permissionRepository.find({
      where: permissions.map(p => ({ resource: p, action: 'access' }))
    });
    
    await this.updateRolePermissions(role.id, allMatchingPerms.map(p => p.id));
  }

  async deleteUser(id: number) {
    console.log(`Deleting user with ID: ${id}`);
    const result = await this.userRepository.delete({ id });
    console.log(`Delete result:`, result);
    return result;
  }

  async isTwoFactorInUse(): Promise<boolean> {
    const userWith2FA = await this.userRepository.findOne({ where: { isTwoFactorEnabled: true } });
    return !!userWith2FA;
  }

  // User Group Methods
  async getUserGroups(params?: any) {
    if (params) {
      const { applyDataGridParams } = await import('../../utils/typeorm-query-builder');
      const queryBuilder = this.userGroupRepository.createQueryBuilder('userGroup');
      applyDataGridParams(queryBuilder, params, 'userGroup');
      const [items, total] = await queryBuilder.getManyAndCount();
      return { items, total };
    }
    return this.userGroupRepository.find();
  }

  async getUserGroupById(id: number) {
    const group = await this.userGroupRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (group) {
      return {
        ...group,
        permissions: group.permissions.filter(p => p.value).map(p => p.permissionKey)
      };
    }
    return null;
  }

  async createUserGroup(data: any) {
    const maxIdResult = await this.userGroupRepository.query('SELECT MAX("UserGroupID") as max_id FROM "Iam"."UserGroups"');
    const nextId = (maxIdResult[0]?.max_id ? parseInt(maxIdResult[0].max_id, 10) : 0) + 1;

    const group = this.userGroupRepository.create({
      id: nextId,
      code: data.code,
      title: data.title,
      titleEn: data.Title_En || data.titleEn,
      isActive: data.isActive !== undefined ? data.isActive : true,
      companyRef: (data.companyRef && Number(data.companyRef) > 1) ? Number(data.companyRef) : 2,
    });

    const savedGroup = await this.userGroupRepository.save(group);

    if (data.permissions && Array.isArray(data.permissions)) {
      await this.syncGroupPermissions(savedGroup.id, data.permissions);
    }

    return savedGroup;
  }

  async updateUserGroup(id: number, data: any) {
    const group = await this.userGroupRepository.findOne({ where: { id } });
    if (!group) throw new BadRequestException('User Group not found');

    if (data.code !== undefined) group.code = data.code;
    if (data.title !== undefined) group.title = data.title;
    if (data.Title_En !== undefined) group.titleEn = data.Title_En;
    if (data.titleEn !== undefined) group.titleEn = data.titleEn;
    if (data.isActive !== undefined) group.isActive = data.isActive;
    if (data.companyRef !== undefined) group.companyRef = Number(data.companyRef) > 1 ? Number(data.companyRef) : 2;

    const savedGroup = await this.userGroupRepository.save(group);

    if (data.permissions && Array.isArray(data.permissions)) {
      await this.syncGroupPermissions(savedGroup.id, data.permissions);
    }

    return savedGroup;
  }

  async deleteUserGroup(id: number) {
    return this.userGroupRepository.delete({ id });
  }

  private async syncGroupPermissions(groupId: number, permissions: string[]) {
    // Remove existing
    await this.userGroupPermissionRepository.delete({ userGroupRef: groupId });

    // Add new ones
    const maxIdResult = await this.userGroupPermissionRepository.query('SELECT MAX("UserGroupPermissionsID") as max_id FROM "Iam"."UserGroupPermissions"');
    let nextId = (maxIdResult[0]?.max_id ? parseInt(maxIdResult[0].max_id, 10) : 0) + 1;

    const newPerms = permissions.map(key => 
      this.userGroupPermissionRepository.create({
        id: nextId++,
        userGroupRef: groupId,
        permissionKey: key,
        value: true
      })
    );

    await this.userGroupPermissionRepository.save(newPerms);
  }

  // Business Structure Users Methods
  async getMyBusinessStructures(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const isAdmin = user?.username.toLowerCase() === 'admin';
    
    if (isAdmin) {
      return {
        isAdmin: true,
        allowedIds: [] // Admin sees everything regardless
      };
    }

    const mappings = await this.businessStructureUsersRepository.find({
      where: { userRef: userId }
    });
    
    return {
      isAdmin: false,
      allowedIds: mappings.map(m => m.businessStructureRef)
    };
  }

  async getBusinessStructureUsers(businessStructureRef: number) {
    if (!businessStructureRef) return [];
    
    const users = await this.businessStructureUsersRepository.find({
      where: { businessStructureRef },
      relations: ['user']
    });
    
    return users.map(u => ({
      businessStructureUsersId: u.businessStructureUsersId,
      businessStructureRef: u.businessStructureRef,
      userRef: u.userRef,
      username: u.user?.username,
      firstName: u.user?.firstName,
      lastName: u.user?.lastName
    }));
  }

  async addBusinessStructureUser(data: { businessStructureRef: number, userRef: number }) {
    const existing = await this.businessStructureUsersRepository.findOne({
      where: { 
        businessStructureRef: data.businessStructureRef,
        userRef: data.userRef
      }
    });
    
    if (existing) {
      throw new BadRequestException('این کاربر قبلاً به این ساختار اضافه شده است');
    }
    
    const maxIdResult = await this.businessStructureUsersRepository.query('SELECT MAX("businessStructureUsersId") as max_id FROM "Iam"."BusinessStructureUsers"');
    const nextId = (maxIdResult[0]?.max_id ? parseInt(maxIdResult[0].max_id, 10) : 0) + 1;

    const bsu = this.businessStructureUsersRepository.create({
      businessStructureUsersId: nextId,
      businessStructureRef: data.businessStructureRef,
      userRef: data.userRef,
      creator: 1,
      lastModifier: 1
    });
    
    return this.businessStructureUsersRepository.save(bsu);
  }

  async deleteBusinessStructureUser(id: number) {
    return this.businessStructureUsersRepository.delete({ businessStructureUsersId: id });
  }
}
