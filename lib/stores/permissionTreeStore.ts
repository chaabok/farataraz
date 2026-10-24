import { create } from 'zustand';
import { TreeNode } from '@/components/inputs/TreeView';

interface PermissionTreeState {
  treeData: TreeNode;
  setTreeData: (updater: TreeNode | ((prev: TreeNode) => TreeNode)) => void;
}

export const usePermissionTreeStore = create<PermissionTreeState>((set) => ({
  treeData: {
    id: "root_permissions",
    name: "دسترسی‌های کاربر",
    isRoot: true,
    children: [{ id: "root_permissions_loading", name: "در حال بارگذاری...", children: [] }],
    data: { loaded: false }
  },
  setTreeData: (updater) => set((state) => ({
    treeData: typeof updater === 'function' ? updater(state.treeData) : updater
  }))
}));
