"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IamService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("../entities/role.entity");
const permission_entity_1 = require("../entities/permission.entity");
const role_permission_entity_1 = require("../entities/role-permission.entity");
const user_entity_1 = require("../entities/user.entity");
const user_group_entity_1 = require("../entities/user-group.entity");
const user_group_permission_entity_1 = require("../entities/user-group-permission.entity");
const business_structure_user_entity_1 = require("../entities/business-structure-user.entity");
const bcrypt = __importStar(require("bcryptjs"));
let IamService = class IamService {
    constructor(roleRepository, permissionRepository, rolePermissionRepository, userRepository, userGroupRepository, userGroupPermissionRepository, businessStructureUsersRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.userRepository = userRepository;
        this.userGroupRepository = userGroupRepository;
        this.userGroupPermissionRepository = userGroupPermissionRepository;
        this.businessStructureUsersRepository = businessStructureUsersRepository;
    }
    async onModuleInit() {
        const adminUser = await this.userRepository.findOne({ where: { username: 'admin' } });
        if (process.env.SYNC_DB === 'true' || !adminUser) {
            await this.seedInit();
        }
    }
    async seedInit() {
        console.log('IamService: Checking for default admin user...');
        try {
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
            }
            else {
                console.log('IamService: Admin user already exists.');
            }
        }
        catch (error) {
            console.error('IamService: Error during seeding:', error);
        }
    }
    async syncPermissions(resources) {
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
    async createRole(data) {
        const maxRoleIdResult = await this.roleRepository.query('SELECT MAX("RoleID") as max_id FROM "Iam"."Role"');
        const nextId = (maxRoleIdResult[0]?.max_id ? parseInt(maxRoleIdResult[0].max_id, 10) : 0) + 1;
        const role = this.roleRepository.create({
            ...data,
            id: nextId
        });
        return this.roleRepository.save(role);
    }
    async updateRolePermissions(roleIdStr, permissionIdsStr, conditions = {}) {
        const roleId = Number(roleIdStr);
        const permissionIds = permissionIdsStr.map(Number);
        const role = await this.roleRepository.findOne({ where: { id: roleId }, relations: ['permissions'] });
        if (!role)
            throw new common_1.BadRequestException('Role not found');
        await this.rolePermissionRepository.delete({ roleId });
        const maxRolePermIdResult = await this.rolePermissionRepository.query('SELECT MAX("RolePermissionID") as max_id FROM "Iam"."RolePermission"');
        let nextId = (maxRolePermIdResult[0]?.max_id ? parseInt(maxRolePermIdResult[0].max_id, 10) : 0) + 1;
        const newRolePermissions = permissionIds.map(permissionId => this.rolePermissionRepository.create({
            id: nextId++,
            roleId,
            permissionId,
            conditions,
        }));
        await this.rolePermissionRepository.save(newRolePermissions);
        return this.roleRepository.findOne({ where: { id: roleId }, relations: ['permissions', 'permissions.permission'] });
    }
    sanitizeUser(user) {
        if (!user)
            return user;
        const { passwordHash, refreshToken, twoFactorSecret, ...safe } = user;
        return safe;
    }
    async getUsers(params) {
        if (params) {
            const { applyDataGridParams } = await Promise.resolve().then(() => __importStar(require('../../utils/typeorm-query-builder')));
            const queryBuilder = this.userRepository.createQueryBuilder('user');
            applyDataGridParams(queryBuilder, params, 'user');
            const [items, total] = await queryBuilder.getManyAndCount();
            return { items: items.map(u => this.sanitizeUser(u)), total };
        }
        const users = await this.userRepository.find();
        return users.map(u => this.sanitizeUser(u));
    }
    async getUserById(id) {
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
            const permissions = new Set();
            user.roles?.forEach(ur => {
                ur.role?.permissions?.forEach(rp => {
                    if (rp.permission?.resource) {
                        permissions.add(rp.permission.resource);
                    }
                });
            });
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
    async createUser(data) {
        console.log('createUser payload:', data);
        const maxIdResult = await this.userRepository.query('SELECT MAX("UserID") as max_id FROM "Iam"."User"');
        const nextId = (maxIdResult[0]?.max_id ? parseInt(maxIdResult[0].max_id, 10) : 0) + 1;
        let passwordHash = '';
        if (data.password) {
            const salt = await bcrypt.genSalt(12);
            passwordHash = await bcrypt.hash(data.password, salt);
        }
        else {
            throw new common_1.BadRequestException("کلمه عبور الزامی است");
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
    async updateUser(id, data) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        if (data.username !== undefined)
            user.username = data.username;
        if (data.firstName !== undefined)
            user.firstName = data.firstName;
        if (data.lastName !== undefined)
            user.lastName = data.lastName;
        if (data.isActive !== undefined)
            user.isActive = data.isActive;
        if (data.repeatChangePassword !== undefined)
            user.repeatChangePassword = parseInt(data.repeatChangePassword, 10);
        if (data.UserGroupRef !== undefined)
            user.userGroupRef = data.UserGroupRef ? Number(data.UserGroupRef) : null;
        if (data.userGroupRef !== undefined)
            user.userGroupRef = data.userGroupRef ? Number(data.userGroupRef) : null;
        if (data.companyRef !== undefined)
            user.companyRef = Number(data.companyRef) > 1 ? Number(data.companyRef) : 2;
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
    async syncUserPermissions(userId, permissions) {
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
        const userRoleRepo = this.userRepository.manager.getRepository('UserRole');
        const existingLink = await userRoleRepo.findOne({ where: { userId, roleId: role.id } });
        if (!existingLink) {
            const maxUserRoleIdResult = await userRoleRepo.query('SELECT MAX("UserRoleID") as max_id FROM "Iam"."UserRole"');
            const nextId = (maxUserRoleIdResult[0]?.max_id ? parseInt(maxUserRoleIdResult[0].max_id, 10) : 0) + 1;
            await userRoleRepo.save({ id: nextId, userId, roleId: role.id });
        }
        const allMatchingPerms = await this.permissionRepository.find({
            where: permissions.map(p => ({ resource: p, action: 'access' }))
        });
        await this.updateRolePermissions(role.id, allMatchingPerms.map(p => p.id));
    }
    async deleteUser(id) {
        console.log(`Deleting user with ID: ${id}`);
        const result = await this.userRepository.delete({ id });
        console.log(`Delete result:`, result);
        return result;
    }
    async isTwoFactorInUse() {
        const userWith2FA = await this.userRepository.findOne({ where: { isTwoFactorEnabled: true } });
        return !!userWith2FA;
    }
    async getUserGroups(params) {
        if (params) {
            const { applyDataGridParams } = await Promise.resolve().then(() => __importStar(require('../../utils/typeorm-query-builder')));
            const queryBuilder = this.userGroupRepository.createQueryBuilder('userGroup');
            applyDataGridParams(queryBuilder, params, 'userGroup');
            const [items, total] = await queryBuilder.getManyAndCount();
            return { items, total };
        }
        return this.userGroupRepository.find();
    }
    async getUserGroupById(id) {
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
    async createUserGroup(data) {
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
    async updateUserGroup(id, data) {
        const group = await this.userGroupRepository.findOne({ where: { id } });
        if (!group)
            throw new common_1.BadRequestException('User Group not found');
        if (data.code !== undefined)
            group.code = data.code;
        if (data.title !== undefined)
            group.title = data.title;
        if (data.Title_En !== undefined)
            group.titleEn = data.Title_En;
        if (data.titleEn !== undefined)
            group.titleEn = data.titleEn;
        if (data.isActive !== undefined)
            group.isActive = data.isActive;
        if (data.companyRef !== undefined)
            group.companyRef = Number(data.companyRef) > 1 ? Number(data.companyRef) : 2;
        const savedGroup = await this.userGroupRepository.save(group);
        if (data.permissions && Array.isArray(data.permissions)) {
            await this.syncGroupPermissions(savedGroup.id, data.permissions);
        }
        return savedGroup;
    }
    async deleteUserGroup(id) {
        return this.userGroupRepository.delete({ id });
    }
    async syncGroupPermissions(groupId, permissions) {
        await this.userGroupPermissionRepository.delete({ userGroupRef: groupId });
        const maxIdResult = await this.userGroupPermissionRepository.query('SELECT MAX("UserGroupPermissionsID") as max_id FROM "Iam"."UserGroupPermissions"');
        let nextId = (maxIdResult[0]?.max_id ? parseInt(maxIdResult[0].max_id, 10) : 0) + 1;
        const newPerms = permissions.map(key => this.userGroupPermissionRepository.create({
            id: nextId++,
            userGroupRef: groupId,
            permissionKey: key,
            value: true
        }));
        await this.userGroupPermissionRepository.save(newPerms);
    }
    async getMyBusinessStructures(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const isAdmin = user?.username.toLowerCase() === 'admin';
        if (isAdmin) {
            return {
                isAdmin: true,
                allowedIds: []
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
    async getBusinessStructureUsers(businessStructureRef) {
        if (!businessStructureRef)
            return [];
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
    async addBusinessStructureUser(data) {
        const existing = await this.businessStructureUsersRepository.findOne({
            where: {
                businessStructureRef: data.businessStructureRef,
                userRef: data.userRef
            }
        });
        if (existing) {
            throw new common_1.BadRequestException('این کاربر قبلاً به این ساختار اضافه شده است');
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
    async deleteBusinessStructureUser(id) {
        return this.businessStructureUsersRepository.delete({ businessStructureUsersId: id });
    }
};
exports.IamService = IamService;
exports.IamService = IamService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(1, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __param(2, (0, typeorm_1.InjectRepository)(role_permission_entity_1.RolePermission)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(4, (0, typeorm_1.InjectRepository)(user_group_entity_1.UserGroup)),
    __param(5, (0, typeorm_1.InjectRepository)(user_group_permission_entity_1.UserGroupPermission)),
    __param(6, (0, typeorm_1.InjectRepository)(business_structure_user_entity_1.BusinessStructureUsers)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], IamService);
//# sourceMappingURL=iam.service.js.map