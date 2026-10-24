"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicFormService = void 0;
const common_1 = require("@nestjs/common");
const dynamic_form_repository_interface_1 = require("../../domain/repositories/dynamic-form.repository.interface");
const dynamic_form_record_repository_interface_1 = require("../../domain/repositories/dynamic-form-record.repository.interface");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let DynamicFormService = class DynamicFormService {
    constructor(repo, recordRepo, idGen, requestContext) {
        this.repo = repo;
        this.recordRepo = recordRepo;
        this.idGen = idGen;
        this.requestContext = requestContext;
        this.menuTableEnsured = false;
    }
    async create(dto, companyId) {
        const bsId = this.requestContext.getBusinessStructureId() || 2;
        const userId = this.requestContext.getUserId() || 1;
        const nextId = await this.idGen.generateNextId('DynamicForm');
        const entity = await this.repo.create({
            dynamicFormId: nextId,
            formCode: dto.formCode,
            title: dto.title,
            description: dto.description || '',
            componentName: dto.componentName || 'SimpleForm',
            bands: dto.bands || [],
            fields: dto.fields || [],
            styles: dto.styles || {},
            menuConfig: dto.menuConfig || {},
            options: dto.options || {},
            showPrintList: dto.showPrintList !== undefined ? dto.showPrintList : false,
            showVoucherActionbar: dto.showVoucherActionbar !== undefined ? dto.showVoucherActionbar : false,
            isActive: dto.isActive !== undefined ? dto.isActive : true,
            companyRef: companyId,
            businessStructureRef: bsId,
            creator: userId,
            creationDate: new Date(),
        });
        const savedForm = await this.repo.save(entity);
        await this.ensureDatabaseTableCreated(dto.formCode, dto.fields || []);
        return savedForm;
    }
    async ensureDatabaseTableCreated(formCode, fields = []) {
        const cleanCode = formCode.replace(/[^a-zA-Z0-9_]/g, '');
        const tableName = cleanCode;
        const pkColumnName = `${tableName}ID`;
        try {
            await this.idGen.generateNextId(tableName);
            if (this.repo.repo?.manager) {
                const mgr = this.repo.repo.manager;
                await mgr.query(`CREATE SCHEMA IF NOT EXISTS "dfb"`);
                await mgr.query(`
          CREATE TABLE IF NOT EXISTS "dfb"."${tableName}" (
            "${pkColumnName}" bigint PRIMARY KEY,
            "CompanyRef" bigint,
            "BusinessStructureRef" bigint,
            "Data" jsonb,
            "Creator" bigint,
            "CreationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
            "LastModifier" bigint,
            "LastModificationDate" timestamp
          )
        `);
                if (Array.isArray(fields) && fields.length > 0) {
                    for (let i = 0; i < fields.length; i++) {
                        const f = fields[i];
                        const rawName = f.name || f.code || f.label || `field_${i + 1}`;
                        const colName = rawName.replace(/[^a-zA-Z0-9_]/g, '');
                        if (!colName)
                            continue;
                        let colType = 'varchar(500)';
                        const fType = (f.type || 'text').toLowerCase();
                        if (fType === 'number') {
                            colType = 'numeric(18,4)';
                        }
                        else if (fType === 'amount') {
                            colType = 'numeric(18,2)';
                        }
                        else if (fType === 'checkbox') {
                            colType = 'boolean';
                        }
                        else if (fType === 'date') {
                            colType = 'timestamp';
                        }
                        else if (fType === 'textarea') {
                            colType = 'text';
                        }
                        try {
                            await mgr.query(`
                ALTER TABLE "dfb"."${tableName}" 
                ADD COLUMN IF NOT EXISTS "${colName}" ${colType}
              `);
                        }
                        catch (err) {
                            console.warn(`[DFB Column Generator] Could not add column ${colName} to dfb.${tableName}:`, err);
                        }
                    }
                }
            }
        }
        catch (e) {
            console.warn(`[DFB Table Generator] Warning creating table dfb.${tableName}:`, e);
        }
        return `dfb.${tableName}`;
    }
    async findAll() {
        return this.repo.findAll();
    }
    async findOne(id) {
        const item = await this.repo.findOne(id);
        if (!item) {
            throw new common_1.NotFoundException(`فرم پویایی با شناسه ${id} یافت نشد.`);
        }
        return item;
    }
    async findByCode(code, companyId) {
        const item = await this.repo.findByCode(code, companyId);
        if (!item) {
            throw new common_1.NotFoundException(`فرم پویایی با کد ${code} یافت نشد.`);
        }
        return item;
    }
    async update(id, dto, companyId) {
        const item = await this.findOne(id);
        if (dto.formCode !== undefined)
            item.formCode = dto.formCode;
        if (dto.title !== undefined)
            item.title = dto.title;
        if (dto.description !== undefined)
            item.description = dto.description;
        if (dto.componentName !== undefined)
            item.componentName = dto.componentName;
        if (dto.bands !== undefined)
            item.bands = dto.bands;
        if (dto.fields !== undefined)
            item.fields = dto.fields;
        if (dto.styles !== undefined)
            item.styles = dto.styles;
        if (dto.menuConfig !== undefined)
            item.menuConfig = dto.menuConfig;
        if (dto.options !== undefined)
            item.options = dto.options;
        if (dto.showPrintList !== undefined)
            item.showPrintList = dto.showPrintList;
        if (dto.showVoucherActionbar !== undefined)
            item.showVoucherActionbar = dto.showVoucherActionbar;
        if (dto.isActive !== undefined)
            item.isActive = dto.isActive;
        const userId = this.requestContext.getUserId() || 1;
        item.lastModifier = userId;
        item.lastModificationDate = new Date();
        const savedForm = await this.repo.save(item);
        await this.ensureDatabaseTableCreated(savedForm.formCode, savedForm.fields || []);
        return savedForm;
    }
    async remove(id) {
        let form = null;
        try {
            form = await this.findOne(id);
        }
        catch {
        }
        if (!form && this.repo.repo) {
            try {
                form = await this.repo.repo.findOneBy({ dynamicFormId: id });
            }
            catch (e) {
                console.warn(`[DFB] Error finding form ${id} directly:`, e);
            }
        }
        if (form && form.formCode) {
            const cleanCode = form.formCode.replace(/[^a-zA-Z0-9_]/g, '');
            if (cleanCode && this.repo.repo?.manager) {
                const mgr = this.repo.repo.manager;
                try {
                    await mgr.query(`DROP TABLE IF EXISTS "dfb"."${cleanCode}" CASCADE`);
                    console.log(`[DFB] Physical database table dfb."${cleanCode}" dropped successfully upon form deletion.`);
                }
                catch (e) {
                    console.warn(`[DFB] Error dropping physical table dfb."${cleanCode}":`, e);
                }
                try {
                    await mgr.query(`DELETE FROM "Dfb"."DynamicMenu" WHERE "MenuKey" = $1 OR "MenuKey" = $2`, [form.formCode, `form_${id}`]);
                }
                catch (e) {
                    console.warn(`[DFB] Error removing menu for form ${form.formCode}:`, e);
                }
                try {
                    await mgr.query(`DELETE FROM "DynamicFormRecord" WHERE "FormRef" = $1 OR "formRef" = $1`, [id]);
                }
                catch (e) {
                    console.warn(`[DFB] Error deleting records for form ${id}:`, e);
                }
            }
        }
        await this.repo.remove(id);
    }
    async createRecord(formId, data, companyId) {
        const bsId = this.requestContext.getBusinessStructureId() || 2;
        const userId = this.requestContext.getUserId() || 1;
        const nextId = await this.idGen.generateNextId('DynamicFormRecord');
        const entity = await this.recordRepo.create({
            dynamicFormRecordId: nextId,
            formRef: formId,
            data: data || {},
            companyRef: companyId,
            businessStructureRef: bsId,
            creator: userId,
            creationDate: new Date(),
        });
        const savedRecord = await this.recordRepo.save(entity);
        try {
            const form = await this.repo.findOne(formId);
            if (form && form.formCode) {
                const cleanCode = form.formCode.replace(/[^a-zA-Z0-9_]/g, '');
                const pkCol = `${cleanCode}ID`;
                await this.ensureDatabaseTableCreated(form.formCode, form.fields || []);
                const columns = [`"${pkCol}"`, `"CompanyRef"`, `"BusinessStructureRef"`, `"Data"`, `"Creator"`];
                const placeholders = ['$1', '$2', '$3', '$4', '$5'];
                const values = [nextId, companyId, bsId, JSON.stringify(data), userId];
                let paramIdx = 6;
                const updateSets = ['"Data" = EXCLUDED."Data"', '"LastModifier" = $5', '"LastModificationDate" = now()'];
                if (data && typeof data === 'object') {
                    for (const [key, val] of Object.entries(data)) {
                        const colName = key.replace(/[^a-zA-Z0-9_]/g, '');
                        if (colName && !['CompanyRef', 'BusinessStructureRef', 'Data', 'Creator', 'CreationDate', 'LastModifier', 'LastModificationDate', pkCol].includes(colName)) {
                            columns.push(`"${colName}"`);
                            placeholders.push(`$${paramIdx}`);
                            values.push(val === undefined || val === null ? null : (typeof val === 'object' ? JSON.stringify(val) : val));
                            updateSets.push(`"${colName}" = EXCLUDED."${colName}"`);
                            paramIdx++;
                        }
                    }
                }
                const syncSql = `
          INSERT INTO "dfb"."${cleanCode}" (${columns.join(', ')})
          VALUES (${placeholders.join(', ')})
          ON CONFLICT ("${pkCol}") DO UPDATE
          SET ${updateSets.join(', ')};
        `;
                if (this.repo.repo?.manager) {
                    await this.repo.repo.manager.query(syncSql, values);
                }
            }
        }
        catch (e) {
            console.warn(`[DFB Sync Record] Warning syncing record to physical table dfb:`, e);
        }
        return savedRecord;
    }
    async findRecordOne(id) {
        const item = await this.recordRepo.findOne(id);
        if (!item) {
            throw new common_1.NotFoundException(`رکوردی با شناسه ${id} یافت نشد.`);
        }
        return item;
    }
    async findAllRecordsByForm(formId, companyId) {
        return this.recordRepo.findAllByForm(formId, companyId);
    }
    async updateRecord(id, data, companyId) {
        const item = await this.findRecordOne(id);
        item.data = data || {};
        const userId = this.requestContext.getUserId() || 1;
        item.lastModifier = userId;
        item.lastModificationDate = new Date();
        const savedRecord = await this.recordRepo.save(item);
        try {
            const form = await this.repo.findOne(item.formRef);
            if (form && form.formCode) {
                const cleanCode = form.formCode.replace(/[^a-zA-Z0-9_]/g, '');
                const pkCol = `${cleanCode}ID`;
                await this.ensureDatabaseTableCreated(form.formCode, form.fields || []);
                const updateSets = ['"Data" = $1', '"LastModifier" = $2', '"LastModificationDate" = now()'];
                const values = [JSON.stringify(data), userId];
                let paramIdx = 3;
                if (data && typeof data === 'object') {
                    for (const [key, val] of Object.entries(data)) {
                        const colName = key.replace(/[^a-zA-Z0-9_]/g, '');
                        if (colName && !['CompanyRef', 'BusinessStructureRef', 'Data', 'Creator', 'CreationDate', 'LastModifier', 'LastModificationDate', pkCol].includes(colName)) {
                            updateSets.push(`"${colName}" = $${paramIdx}`);
                            values.push(val === undefined || val === null ? null : (typeof val === 'object' ? JSON.stringify(val) : val));
                            paramIdx++;
                        }
                    }
                }
                values.push(id);
                const syncSql = `
          UPDATE "dfb"."${cleanCode}"
          SET ${updateSets.join(', ')}
          WHERE "${pkCol}" = $${paramIdx};
        `;
                if (this.repo.repo?.manager) {
                    await this.repo.repo.manager.query(syncSql, values);
                }
            }
        }
        catch (e) {
            console.warn(`[DFB Update Record Sync] Warning updating record in dfb table:`, e);
        }
        return savedRecord;
    }
    async removeRecord(id) {
        await this.recordRepo.remove(id);
    }
    async ensureDynamicMenuTableCreated() {
        if (this.menuTableEnsured)
            return;
        try {
            if (this.repo.repo?.manager) {
                const mgr = this.repo.repo.manager;
                try {
                    await mgr.query(`CREATE SCHEMA IF NOT EXISTS "Dfb"`);
                }
                catch (_) { }
                try {
                    await mgr.query(`
            CREATE TABLE IF NOT EXISTS "Dfb"."DynamicMenu" (
              "DynamicMenuID" bigint PRIMARY KEY,
              "Version" bigint DEFAULT 1,
              "Creator" bigint DEFAULT 1,
              "CreationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
              "CreateTime" varchar(8) DEFAULT '00:00:00',
              "LastModifier" bigint DEFAULT 1,
              "LastModificationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
              "LastModificationTime" varchar(8) DEFAULT '00:00:00',
              "BusinessStructureRef" bigint DEFAULT 2,
              "CompanyRef" bigint,
              "BranchRef" bigint,
              "AgencyRef" bigint,
              "MenuType" varchar(50) NOT NULL,
              "MenuKey" varchar(150) NOT NULL,
              "GroupId" varchar(100),
              "MenuTitle" varchar(255),
              "Title" varchar(255),
              "TitleEn" varchar(255),
              "Icon" varchar(100),
              "Color" varchar(50),
              "Priority" integer DEFAULT 0,
              "Config" jsonb,
              "IsActive" boolean DEFAULT true
            )
          `);
                }
                catch (_) { }
                this.menuTableEnsured = true;
            }
        }
        catch (e) {
        }
    }
    async getMenus(companyId) {
        await this.ensureDynamicMenuTableCreated();
        const bsId = this.requestContext.getBusinessStructureId() || 2;
        let rows = [];
        if (this.repo.repo?.manager) {
            try {
                rows = await this.repo.repo.manager.query(`SELECT * FROM "Dfb"."DynamicMenu" WHERE "IsActive" = true AND ("BusinessStructureRef" = $1 OR "BusinessStructureRef" IS NULL) ORDER BY "Priority" ASC, "DynamicMenuID" ASC`, [bsId]);
            }
            catch (e) {
                console.warn('[DFB Get Menus Error]:', e);
            }
        }
        const customMainMenus = rows
            .filter((r) => r.MenuType === 'main')
            .map((r) => ({
            id: r.MenuKey,
            title: r.Title,
            titleEn: r.TitleEn || '',
            groupId: r.GroupId || 'general_group',
            priority: typeof r.Priority === 'number' ? r.Priority : parseInt(r.Priority || '0', 10),
            icon: r.Icon || 'Folder',
            color: r.Color || '#3b82f6',
        }));
        const customSubMenus = rows
            .filter((r) => r.MenuType === 'sub')
            .map((r) => ({
            id: r.MenuKey,
            groupId: r.GroupId || 'general_group',
            menuTitle: r.MenuTitle || '',
            title: r.Title,
            titleEn: r.TitleEn || '',
            icon: r.Icon || 'Folder',
            priority: typeof r.Priority === 'number' ? r.Priority : parseInt(r.Priority || '0', 10),
        }));
        const hiddenMenus = rows
            .filter((r) => r.MenuType === 'hidden')
            .map((r) => r.MenuKey);
        return { customMainMenus, customSubMenus, hiddenMenus };
    }
    async syncMenus(body, companyId) {
        await this.ensureDynamicMenuTableCreated();
        const bsId = this.requestContext.getBusinessStructureId() || 2;
        const userId = this.requestContext.getUserId() || 1;
        const manager = this.repo.repo?.manager;
        if (!manager)
            return { success: true };
        const { customMainMenus = [], customSubMenus = [], hiddenMenus = [] } = body;
        for (const m of customMainMenus) {
            const key = m.id || `custom_menu_${Date.now()}`;
            const existing = await manager.query(`SELECT "DynamicMenuID" FROM "Dfb"."DynamicMenu" WHERE "MenuKey" = $1 AND "MenuType" = 'main'`, [key]);
            if (existing && existing.length > 0) {
                await manager.query(`UPDATE "Dfb"."DynamicMenu" 
           SET "Title" = $1, "TitleEn" = $2, "GroupId" = $3, "Priority" = $4, "Icon" = $5, "Color" = $6, "IsActive" = true, "LastModifier" = $7, "LastModificationDate" = now()
           WHERE "MenuKey" = $8 AND "MenuType" = 'main'`, [m.title, m.titleEn || '', m.groupId || 'general_group', m.priority || 0, m.icon || 'Folder', m.color || '#3b82f6', userId, key]);
            }
            else {
                const nextId = await this.idGen.generateNextId('DynamicMenu');
                await manager.query(`INSERT INTO "Dfb"."DynamicMenu"
           ("DynamicMenuID", "MenuType", "MenuKey", "GroupId", "Title", "TitleEn", "Priority", "Icon", "Color", "CompanyRef", "BusinessStructureRef", "Creator", "IsActive")
           VALUES ($1, 'main', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)`, [nextId, key, m.groupId || 'general_group', m.title, m.titleEn || '', m.priority || 0, m.icon || 'Folder', m.color || '#3b82f6', companyId, bsId, userId]);
            }
        }
        for (const s of customSubMenus) {
            const key = s.id || `custom_sub_${Date.now()}`;
            const existing = await manager.query(`SELECT "DynamicMenuID" FROM "Dfb"."DynamicMenu" WHERE "MenuKey" = $1 AND "MenuType" = 'sub'`, [key]);
            if (existing && existing.length > 0) {
                await manager.query(`UPDATE "Dfb"."DynamicMenu" 
           SET "Title" = $1, "TitleEn" = $2, "GroupId" = $3, "MenuTitle" = $4, "Icon" = $5, "Priority" = $6, "IsActive" = true, "LastModifier" = $7, "LastModificationDate" = now()
           WHERE "MenuKey" = $8 AND "MenuType" = 'sub'`, [s.title, s.titleEn || '', s.groupId || 'general_group', s.menuTitle || '', s.icon || 'Folder', s.priority || 0, userId, key]);
            }
            else {
                const nextId = await this.idGen.generateNextId('DynamicMenu');
                await manager.query(`INSERT INTO "Dfb"."DynamicMenu"
           ("DynamicMenuID", "MenuType", "MenuKey", "GroupId", "MenuTitle", "Title", "TitleEn", "Icon", "Priority", "CompanyRef", "BusinessStructureRef", "Creator", "IsActive")
           VALUES ($1, 'sub', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)`, [nextId, key, s.groupId || 'general_group', s.menuTitle || '', s.title, s.titleEn || '', s.icon || 'Folder', s.priority || 0, companyId, bsId, userId]);
            }
        }
        for (const hKey of hiddenMenus) {
            if (!hKey)
                continue;
            const existing = await manager.query(`SELECT "DynamicMenuID" FROM "Dfb"."DynamicMenu" WHERE "MenuKey" = $1 AND "MenuType" = 'hidden'`, [hKey]);
            if (!existing || existing.length === 0) {
                const nextId = await this.idGen.generateNextId('DynamicMenu');
                await manager.query(`INSERT INTO "Dfb"."DynamicMenu"
           ("DynamicMenuID", "MenuType", "MenuKey", "CompanyRef", "BusinessStructureRef", "Creator", "IsActive")
           VALUES ($1, 'hidden', $2, $3, $4, $5, true)`, [nextId, hKey, companyId, bsId, userId]);
            }
        }
        return { message: 'منوها با موفقیت در پایگاه داده همگام‌سازی شدند.' };
    }
    async deleteMenuByKey(menuKey) {
        const manager = this.repo.repo?.manager;
        if (manager && menuKey) {
            await manager.query(`DELETE FROM "Dfb"."DynamicMenu" WHERE "MenuKey" = $1 OR "Title" = $1 OR "MenuTitle" = $1`, [menuKey]);
        }
        return { message: 'منو با موفقیت از دیتابیس حذف گردید.' };
    }
};
exports.DynamicFormService = DynamicFormService;
exports.DynamicFormService = DynamicFormService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(dynamic_form_repository_interface_1.IDynamicFormRepositoryToken)),
    __param(1, (0, common_1.Inject)(dynamic_form_record_repository_interface_1.IDynamicFormRecordRepositoryToken)),
    __metadata("design:paramtypes", [Object, Object, id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], DynamicFormService);
//# sourceMappingURL=dynamic-form.service.js.map