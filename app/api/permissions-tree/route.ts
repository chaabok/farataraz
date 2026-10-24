import { NextResponse } from "next/server";
import { SIDEBAR_STRUCTURE } from "@/lib/sidebar-metadata";
import { verifyRequestAuth, unauthorizedResponse } from "@/lib/server-auth";

export async function GET(req: Request) {
  const user = verifyRequestAuth(req);
  if (!user) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(req.url);
  const parentId = searchParams.get("parentId") || "root";

  // Actions for any form
  const getActions = (nodeId: string) => {
    if (nodeId === "dashboard_main" || nodeId === "root_permissions") return [];
    return [
      { id: `${nodeId}_action_new`, title: "جدید", leaf: true },
      { id: `${nodeId}_action_save`, title: "ذخیره", leaf: true },
      { id: `${nodeId}_action_save_new`, title: "ذخیره و جدید", leaf: true },
      { id: `${nodeId}_action_save_close`, title: "ذخیره و بستن", leaf: true },
      { id: `${nodeId}_action_delete`, title: "حذف", leaf: true },
      { id: `${nodeId}_action_print`, title: "چاپ", leaf: true },
    ];
  };

  const findSubItems = (structure: any[], parentId: string): any[] | null => {
    for (const item of structure) {
      const id = item.id || item.title;
      if (id === parentId) {
        return item.items || item.subItems || getActions(id);
      }
      const children = item.items || item.subItems;
      if (children) {
        const found = findSubItems(children, parentId);
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

  const descendants = searchParams.get("descendants");
  if (descendants === "true") {
    let allIds: string[] = [];
    if (parentId === "root_permissions") {
      allIds = getDescendantIds(SIDEBAR_STRUCTURE);
    } else {
      const children = findSubItems(SIDEBAR_STRUCTURE, parentId);
      if (children) allIds = getDescendantIds(children);
    }
    return NextResponse.json({ ids: allIds });
  }

  if (parentId === "root_permissions") {
    // Return groups
    return NextResponse.json(
      SIDEBAR_STRUCTURE.map((group) => ({
        id: group.id,
        title: group.title,
        hasChildren: true,
      }))
    );
  }

  const children = findSubItems(SIDEBAR_STRUCTURE, parentId);
  if (children) {
    return NextResponse.json(
      children.map((child: any) => {
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
      })
    );
  }

  // Not found or no children
  return NextResponse.json([]);
}
