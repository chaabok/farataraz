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
exports.PermissionsTreeController = void 0;
const common_1 = require("@nestjs/common");
const sidebar_structure_data_1 = require("./sidebar-structure.data");
let PermissionsTreeController = class PermissionsTreeController {
    getTree(parentIdRaw, descendants) {
        const parentId = parentIdRaw || 'root';
        const getActions = (nodeId) => {
            if (nodeId === 'dashboard_main' || nodeId === 'root_permissions')
                return [];
            return [
                { id: `${nodeId}_action_new`, title: 'جدید', leaf: true },
                { id: `${nodeId}_action_save`, title: 'ذخیره', leaf: true },
                { id: `${nodeId}_action_save_new`, title: 'ذخیره و جدید', leaf: true },
                { id: `${nodeId}_action_save_close`, title: 'ذخیره و بستن', leaf: true },
                { id: `${nodeId}_action_delete`, title: 'حذف', leaf: true },
                { id: `${nodeId}_action_print`, title: 'چاپ', leaf: true },
            ];
        };
        const findSubItems = (structure, targetParentId) => {
            for (const item of structure) {
                const id = item.id || item.title;
                if (id === targetParentId) {
                    return item.items || item.subItems || getActions(id);
                }
                const children = item.items || item.subItems;
                if (children) {
                    const found = findSubItems(children, targetParentId);
                    if (found)
                        return found;
                }
            }
            return null;
        };
        const getDescendantIds = (items) => {
            let ids = [];
            for (const item of items) {
                const id = item.id || item.title;
                ids.push(id);
                const children = item.items || item.subItems;
                if (children) {
                    ids = ids.concat(getDescendantIds(children));
                }
                else {
                    ids = ids.concat(getActions(id).map(a => a.id));
                }
            }
            return ids;
        };
        if (descendants === 'true') {
            let allIds = [];
            if (parentId === 'root_permissions') {
                allIds = getDescendantIds(sidebar_structure_data_1.SIDEBAR_STRUCTURE);
            }
            else {
                const children = findSubItems(sidebar_structure_data_1.SIDEBAR_STRUCTURE, parentId);
                if (children)
                    allIds = getDescendantIds(children);
            }
            return { ids: allIds };
        }
        if (parentId === 'root_permissions') {
            return sidebar_structure_data_1.SIDEBAR_STRUCTURE.map(group => ({
                id: group.id || group.title,
                title: group.title,
                hasChildren: true,
            }));
        }
        const children = findSubItems(sidebar_structure_data_1.SIDEBAR_STRUCTURE, parentId);
        if (children) {
            return children.map(child => {
                const id = child.id || child.title;
                let hasChildren = true;
                if (child.leaf) {
                    hasChildren = false;
                }
                else if (id === 'dashboard_main') {
                    hasChildren = false;
                }
                return {
                    id,
                    title: child.title,
                    hasChildren,
                };
            });
        }
        return [];
    }
};
exports.PermissionsTreeController = PermissionsTreeController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('parentId')),
    __param(1, (0, common_1.Query)('descendants')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Object)
], PermissionsTreeController.prototype, "getTree", null);
exports.PermissionsTreeController = PermissionsTreeController = __decorate([
    (0, common_1.Controller)('permissions-tree')
], PermissionsTreeController);
//# sourceMappingURL=permissions-tree.controller.js.map