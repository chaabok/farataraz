"use client";

import React, { useEffect, useCallback } from "react";
import { TreeView, TreeNode } from "../../inputs/TreeView";
import { CheckSquare, Square } from "lucide-react";
import { useLanguage } from "@/components/Providers";
import { apiFetch } from "@/lib/utils";
import { usePermissionTreeStore } from "@/lib/stores/permissionTreeStore";

interface PermissionTreeProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
}

const setChildrenForNode = (tree: TreeNode, targetId: string, children: TreeNode[]): TreeNode => {
  if (tree.id === targetId) {
    return { ...tree, children, data: { ...tree.data, loaded: true } };
  }
  return {
    ...tree,
    children: tree.children.map(child => setChildrenForNode(child, targetId, children))
  };
};

const getChildIdsFromLocalTree = (n: TreeNode): string[] => {
  let ids = [n.id];
  n.children?.forEach(c => {
    // Ignore loading placeholder
    if (!c.id.endsWith('_loading')) {
      ids = [...ids, ...getChildIdsFromLocalTree(c)];
    }
  });
  return ids;
};

export function PermissionTree({ selectedIds, onChange, label }: PermissionTreeProps) {
  const { t } = useLanguage();
  
  const { treeData, setTreeData } = usePermissionTreeStore();

  // Update root translation if needed
  useEffect(() => {
    setTreeData(prev => ({
      ...prev,
      name: t("permissions" as any) || "دسترسی‌های کاربر"
    }));
  }, [t]);

  const loadChildren = useCallback(async (nodeId: string) => {
    try {
      const res = await apiFetch(`/api/permissions-tree?parentId=${encodeURIComponent(nodeId)}`);
      const items = await res.json();
      
      const children = items.map((item: any) => ({
        id: item.id,
        name: t(item.id as any, item.title) || item.title,
        children: item.hasChildren ? [{ id: `${item.id}_loading`, name: "در حال بارگذاری...", children: [] }] : [],
        data: { loaded: !item.hasChildren }
      }));
      
      setTreeData(prev => setChildrenForNode(prev, nodeId, children));
    } catch (err) {
      console.error("Failed to fetch children", err);
    }
  }, [t]);

  // Load root groups on mount
  useEffect(() => {
    loadChildren("root_permissions");
  }, [loadChildren]);

  const handleExpand = (node: TreeNode, isExpanded: boolean) => {
    if (isExpanded && !node.data?.loaded) {
      loadChildren(node.id);
    }
  };

  const togglePermission = async (node: TreeNode, parentIds: string[] = []) => {
    const isSelected = selectedIds.includes(node.id);
    let newSelection = [...selectedIds];

    let targetIds = getChildIdsFromLocalTree(node);
    
    // If the node allows children but hasn't fully loaded them, we must fetch descendants from server
    if (!node.data?.loaded && (node.children.length === 0 || node.children[0]?.id.endsWith('_loading'))) {
      try {
        const res = await apiFetch(`/api/permissions-tree?parentId=${encodeURIComponent(node.id)}&descendants=true`);
        const data = await res.json();
        targetIds = [node.id, ...(data.ids || [])];
      } catch (err) {
        console.error("Failed to fetch descendants", err);
      }
    }

    if (isSelected) {
      // Remove self and all children
      newSelection = newSelection.filter(id => !targetIds.includes(id));
    } else {
      // Add self and all children
      targetIds.forEach(id => {
        if (!newSelection.includes(id)) newSelection.push(id);
      });
      // Add all parents to ensure visibility
      parentIds.forEach(id => {
        if (id !== 'root_permissions' && !newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      if (!newSelection.includes('root_permissions')) newSelection.push('root_permissions');
    }

    onChange(newSelection);
  };
  
  const iconProvider = (node: TreeNode) => {
    if (node.id.endsWith('_loading')) return <span className="w-4 h-4" />;
    const isSelected = selectedIds.includes(node.id);
    return isSelected ? (
      <CheckSquare className="w-4 h-4 text-blue-600" />
    ) : (
      <Square className="w-4 h-4 text-gray-400" />
    );
  };

  const handleSelectWithParents = (node: TreeNode, root: TreeNode, parents: string[] = []): boolean => {
    if (node.id.endsWith('_loading')) return false;
    if (root.id === node.id) {
      togglePermission(node, parents);
      return true;
    }
    if (root.children) {
      for (const child of root.children) {
        if (handleSelectWithParents(node, child, [...parents, root.id])) return true;
      }
    }
    return false;
  };

  return (
    <div className="flex flex-col gap-0 h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto px-1 py-1 custom-scrollbar">
        <TreeView 
          data={treeData}
          onChange={() => {}} 
          onSelect={(node) => handleSelectWithParents(node, treeData)}
          onExpand={handleExpand}
          iconProvider={iconProvider}
          selectedNodeId={null}
          hideContainer={true}
          readOnly={true}
          defaultExpandAll={false}
          triggerSelectOnRowClick={false}
          triggerExpandOnRowClick={true}
        />
      </div>
    </div>
  );
}
