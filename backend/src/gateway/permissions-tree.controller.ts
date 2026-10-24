import { Controller, Get, Query } from '@nestjs/common';
import { SIDEBAR_STRUCTURE, SidebarStructureNode } from './sidebar-structure.data';

interface PermissionNode {
  id: string;
  title: string;
  hasChildren: boolean;
}

interface PermissionAction {
  id: string;
  title: string;
  leaf: boolean;
}

/**
 * Ported from the former Next.js route `app/api/permissions-tree/route.ts`
 * (Task 5-a). Auth is enforced by the global JwtAuthGuard. The permission
 * hierarchy mirrors lib/sidebar-metadata.ts via gateway/sidebar-structure.data.
 */
@Controller('permissions-tree')
export class PermissionsTreeController {
  @Get()
  getTree(
    @Query('parentId') parentIdRaw?: string,
    @Query('descendants') descendants?: string,
  ): PermissionNode[] | PermissionAction[] | { ids: string[] } {
    const parentId = parentIdRaw || 'root';

    // Actions for any form
    const getActions = (nodeId: string): PermissionAction[] => {
      if (nodeId === 'dashboard_main' || nodeId === 'root_permissions') return [];
      return [
        { id: `${nodeId}_action_new`, title: 'جدید', leaf: true },
        { id: `${nodeId}_action_save`, title: 'ذخیره', leaf: true },
        { id: `${nodeId}_action_save_new`, title: 'ذخیره و جدید', leaf: true },
        { id: `${nodeId}_action_save_close`, title: 'ذخیره و بستن', leaf: true },
        { id: `${nodeId}_action_delete`, title: 'حذف', leaf: true },
        { id: `${nodeId}_action_print`, title: 'چاپ', leaf: true },
      ];
    };

    const findSubItems = (structure: SidebarStructureNode[], targetParentId: string): any[] | null => {
      for (const item of structure) {
        const id = item.id || item.title;
        if (id === targetParentId) {
          return item.items || item.subItems || getActions(id);
        }
        const children = item.items || item.subItems;
        if (children) {
          const found = findSubItems(children, targetParentId);
          if (found) return found;
        }
      }
      return null;
    };

    const getDescendantIds = (items: any[]): string[] => {
      let ids: string[] = [];
      for (const item of items) {
        const id = item.id || item.title;
        ids.push(id);
        const children = item.items || item.subItems;
        if (children) {
          ids = ids.concat(getDescendantIds(children));
        } else {
          ids = ids.concat(getActions(id).map(a => a.id));
        }
      }
      return ids;
    };

    if (descendants === 'true') {
      let allIds: string[] = [];
      if (parentId === 'root_permissions') {
        allIds = getDescendantIds(SIDEBAR_STRUCTURE);
      } else {
        const children = findSubItems(SIDEBAR_STRUCTURE, parentId);
        if (children) allIds = getDescendantIds(children);
      }
      return { ids: allIds };
    }

    if (parentId === 'root_permissions') {
      // Return groups
      return SIDEBAR_STRUCTURE.map(group => ({
        id: group.id || group.title,
        title: group.title,
        hasChildren: true,
      }));
    }

    const children = findSubItems(SIDEBAR_STRUCTURE, parentId);
    if (children) {
      return children.map(child => {
        const id = child.id || child.title;
        let hasChildren = true;

        if (child.leaf) {
          hasChildren = false; // it's an action
        } else if (id === 'dashboard_main') {
          hasChildren = false;
        }

        return {
          id,
          title: child.title,
          hasChildren,
        };
      });
    }

    // Not found or no children
    return [];
  }
}
