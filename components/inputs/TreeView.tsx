"use client";

import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { ChevronRight, ChevronDown, Folder, File, MoreVertical, Plus, Edit2, Trash2, X, Check, Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

export interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
  isRoot?: boolean;
  deletable?: boolean;
  data?: Record<string, any>;
}

interface TreeViewField {
  key: string;
  placeholder: string;
  width?: string;
  type?: string;
  options?: { value: string | number; label: string }[] | ((node: TreeNode) => { value: string | number; label: string }[]);
  maxLength?: number | ((level: number) => number);
}

export interface TreeViewRef {
  addChildToSelected: () => void;
  addSiblingToSelected: () => void;
  addChildToNode: (parentId: string) => void;
  findParentNode: (childId: string) => TreeNode | null;
}

export interface TreeViewProps {
  data: TreeNode;
  onChange?: (data: TreeNode) => void;
  onExpand?: (node: TreeNode, isExpanded: boolean) => void;
  onSelect?: (node: TreeNode, level?: number) => void;
  onNodeDoubleClick?: (node: TreeNode) => void;
  onNodeRename?: (nodeId: string, newName: string) => void;
  onNodeUpdate?: (nodeId: string, updatedData: Record<string, any>) => void;
  onNodeSave?: (nodeId: string, updatedData: Record<string, any>) => void | Promise<boolean>;
  onNodeCancel?: (nodeId: string, isNewNode: boolean) => void;
  onAddNode?: (node: TreeNode) => void;
  onDeleteNode?: (nodeId: string) => void;
  canAddChild?: (node: TreeNode) => boolean;
  nodeFields?: TreeViewField[];
  iconProvider?: (node: TreeNode) => React.ReactNode;
  renderLabel?: (node: TreeNode) => React.ReactNode;
  label?: string;
  getAddChildLabel?: (level: number) => string;
  selectedNodeId?: string | null;
  maxLevels?: number;
  hideContainer?: boolean;
  readOnly?: boolean;
  defaultExpandAll?: boolean;
  triggerSelectOnRowClick?: boolean;
  triggerExpandOnRowClick?: boolean;
  allowInlineEditing?: boolean;
  disableContextMenu?: boolean;
  showSearch?: boolean;
  onSearchChange?: (query: string) => void;
  isSearching?: boolean;
  showSortOptions?: boolean;
  sortBy?: 'code' | 'title';
  onSortChange?: (sortBy: 'code' | 'title') => void;
  defaultSortBy?: 'code' | 'title';
}

export const findAndModify = (node: TreeNode, id: string, action: (node: TreeNode) => void): TreeNode => {
  if (node.id === id) {
    action(node);
    return { ...node };
  }
  return {
    ...node,
    children: (node.children || []).map((child) => findAndModify(child, id, action)),
  };
};

const findNode = (node: TreeNode, id: string): TreeNode | null => {
  if (node.id === id) return node;
  for (const child of (node.children || [])) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
};

const findParentId = (node: TreeNode, childId: string): string | null => {
  if ((node.children || []).some(c => c.id === childId)) return node.id;
  for (const child of (node.children || [])) {
    const parent = findParentId(child, childId);
    if (parent) return parent;
  }
  return null;
};

export const TreeView = forwardRef<TreeViewRef, TreeViewProps>(({ data, onChange, onExpand, onSelect, onNodeDoubleClick, onNodeRename, onNodeUpdate, onNodeSave, onNodeCancel, onAddNode, onDeleteNode, canAddChild, nodeFields, iconProvider, renderLabel, label, getAddChildLabel, selectedNodeId: externalSelectedNodeId, maxLevels, hideContainer = false, readOnly = false, defaultExpandAll = false, triggerSelectOnRowClick = true, triggerExpandOnRowClick = true, allowInlineEditing = false, disableContextMenu = false, showSearch = false, onSearchChange, isSearching = false, showSortOptions = false, sortBy, onSortChange, defaultSortBy = 'code' }, ref) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string; level: number } | null>(null);
  const [editingNode, setEditingNode] = useState<{ id: string; fields: Record<string, any> } | null>(null);
  const [internalSelectedNodeId, setInternalSelectedNodeId] = useState<string | null>(null);
  const selectedNodeId = externalSelectedNodeId !== undefined ? externalSelectedNodeId : internalSelectedNodeId;
  const setSelectedNodeId = (id: string | null) => setInternalSelectedNodeId(id);

  const [activeSortBy, setActiveSortBy] = useState<'code' | 'title'>(sortBy || defaultSortBy || 'code');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (sortBy) {
      setActiveSortBy(sortBy);
    }
  }, [sortBy]);

  const handleSortChange = (newSort: 'code' | 'title') => {
    setActiveSortBy(newSort);
    if (onSortChange) {
      onSortChange(newSort);
    }
  };

  const handleSearchInput = (val: string) => {
    setSearchTerm(val);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(val);
      }
    }, 300);
  };

  const sortChildren = (children: TreeNode[]): TreeNode[] => {
    if (!children || children.length === 0) return [];
    return [...children].sort((a, b) => {
      if (activeSortBy === 'code') {
        const codeA = String(a.data?.code || (a as any).code || '');
        const codeB = String(b.data?.code || (b as any).code || '');
        const numA = Number(codeA);
        const numB = Number(codeB);
        if (!isNaN(numA) && !isNaN(numB) && codeA !== '' && codeB !== '') {
          return numA - numB;
        }
        return codeA.localeCompare(codeB, 'fa', { numeric: true });
      } else {
        const nameA = String(a.name || '');
        const nameB = String(b.name || '');
        return nameA.localeCompare(nameB, 'fa');
      }
    });
  };
  
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    if (defaultExpandAll) {
      const allIds = new Set<string>();
      const collectIds = (node: TreeNode) => {
        if (!node) return;
        allIds.add(node.id);
        if (node.children && Array.isArray(node.children)) {
          node.children.forEach(collectIds);
        }
      };
      collectIds(data);
      return allIds;
    }
    return new Set(data ? [data.id] : []);
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const newlyAddedNodeIdRef = useRef<string | null>(null);

  useEffect(() => {
    const getAncestorIds = (node: TreeNode, targetId: string, path: string[] = []): string[] => {
      if (!node) return [];
      if (node.id === targetId) return path;
      if (node.children) {
        for (const child of node.children) {
          const found = getAncestorIds(child, targetId, [...path, node.id]);
          if (found.length > 0) return found;
        }
      }
      return [];
    };

    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (data) next.add(data.id);

      if (defaultExpandAll && data) {
        const collectIds = (node: TreeNode) => {
          if (!node) return;
          next.add(node.id);
          if (node.children && Array.isArray(node.children)) {
            node.children.forEach(collectIds);
          }
        };
        collectIds(data);
      }

      if (selectedNodeId && data) {
        const ancestors = getAncestorIds(data, selectedNodeId);
        ancestors.forEach(id => next.add(id));
      }

      return next;
    });
  }, [selectedNodeId, data, defaultExpandAll]);

  useImperativeHandle(ref, () => ({
    addChildToSelected: () => {
      if (selectedNodeId) {
        handleAddChild(selectedNodeId);
      } else {
        // If nothing selected, maybe add to root
        handleAddChild(data.id);
      }
    },
    addSiblingToSelected: () => {
      if (selectedNodeId && selectedNodeId !== data.id) {
         const parentId = findParentId(data, selectedNodeId);
         if (parentId) {
            handleAddChild(parentId);
         }
      } else {
         handleAddChild(data.id);
      }
    },
    addChildToNode: (parentId: string) => {
      handleAddChild(parentId);
    },
    findParentNode: (childId: string) => {
      const findParent = (curr: TreeNode, targetId: string): TreeNode | null => {
        if (!curr || !curr.children) return null;
        if (curr.children.some(c => c.id === targetId)) return curr;
        for (const child of curr.children) {
          const found = findParent(child, targetId);
          if (found) return found;
        }
        return null;
      };
      return findParent(data, childId);
    }
  }));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync editing node fields with external data prop changes (e.g. from main form)
  useEffect(() => {
    if (editingNode) {
      const node = findNode(data, editingNode.id);
      if (node) {
        const currentFields: Record<string, any> = { name: node.name, ...(node.data || {}) };
        const hasChanged = Object.keys(currentFields).some(key => currentFields[key] !== editingNode.fields[key]) ||
                           Object.keys(editingNode.fields).some(key => currentFields[key] !== editingNode.fields[key]);
        
        if (hasChanged) {
          setEditingNode(prev => prev ? { ...prev, fields: currentFields } : null);
        }
      }
    }
  }, [data]);

  const toggleExpand = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    let isExpanded = false;
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
      isExpanded = true;
    }
    setExpandedNodes(newExpanded);
    if (onExpand) {
      const node = findNode(data, nodeId);
      if (node) onExpand(node, isExpanded);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, nodeId: string, level: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId, level });
  };

  const handleAddChild = (parentId: string) => {
    let newlyCreatedNode: TreeNode | null = null;
    let allowed = true;
    const parentNode = findNode(data, parentId);
    if (parentNode && canAddChild && !canAddChild(parentNode)) {
      allowed = false;
    }
    if (!allowed) return;

    const newData = findAndModify({ ...data }, parentId, (node) => {
      const newNodeId = Math.random().toString(36).substr(2, 9);
      const newNode: TreeNode = {
        id: newNodeId,
        name: "شاخه جدید",
        children: [],
        data: {}
      };
      if (!node.children) node.children = [];
      node.children.push(newNode);
      newlyCreatedNode = newNode;
      setExpandedNodes((prev) => new Set(prev).add(parentId));
      newlyAddedNodeIdRef.current = newNodeId;
      
      const initialFields: Record<string, any> = { name: newNode.name };
      if (nodeFields) {
        nodeFields.forEach(f => initialFields[f.key] = "");
      }
      if (allowInlineEditing) {
        setEditingNode({ id: newNode.id, fields: initialFields });
      }
      setSelectedNodeId(newNode.id);
    });
    onChange?.(newData);
    setContextMenu(null);
    if (newlyCreatedNode) {
      if (onSelect) onSelect(newlyCreatedNode);
      if (onAddNode) onAddNode(newlyCreatedNode);
    }
  };

  const handleCancelEditing = (nodeId: string) => {
    setEditingNode(null);
    const isNew = newlyAddedNodeIdRef.current === nodeId;
    if (isNew) {
      newlyAddedNodeIdRef.current = null;
      handleDelete(nodeId);
    }
    if (onNodeCancel) {
      onNodeCancel(nodeId, isNew);
    }
  };

  const handleUpdate = async (nodeId: string, updatedFields: Record<string, any>) => {
    if (onNodeSave) {
      const result = await onNodeSave(nodeId, updatedFields);
      if (result === false) {
        return; // maintain editing mode if save fails
      }
      
      // If we succeed and consumer resolves, assume consumer handled data update
      newlyAddedNodeIdRef.current = null;
      setEditingNode(null);
      return;
    }
    
    newlyAddedNodeIdRef.current = null;
    const newData = findAndModify({ ...data }, nodeId, (node) => {
      if (updatedFields.name !== undefined) node.name = updatedFields.name;
      node.data = { ...(node.data || {}), ...updatedFields };
    });
    onChange?.(newData);
    if (onNodeRename && updatedFields.name !== undefined) onNodeRename(nodeId, updatedFields.name);
    if (onNodeUpdate) onNodeUpdate(nodeId, updatedFields);
    setEditingNode(null);
  };

  const handleDelete = (nodeId: string) => {
    const nodeToDelete = findNode(data, nodeId);
    if (nodeToDelete && nodeToDelete.deletable === false) return;

    const removeNode = (node: TreeNode): TreeNode | null => {
      if (node.id === nodeId) return null;
      return {
        ...node,
        children: (node.children || []).map(removeNode).filter(Boolean) as TreeNode[],
      };
    };
    const newData = removeNode({ ...data });
    if (newData) onChange?.(newData);
    setContextMenu(null);
  };

  const isSelected = (nodeId: string) => selectedNodeId === nodeId;

  const renderNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isEditing = allowInlineEditing && editingNode?.id === node.id;
    const isSelected = selectedNodeId === node.id;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="select-none">
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1 rounded-md transition-colors cursor-pointer group relative",
            isEditing ? "bg-indigo-50 dark:bg-indigo-900/20" : "hover:bg-gray-100 dark:hover:bg-slate-800",
            isSelected && "bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800"
          )}
          onClick={() => {
            if (triggerExpandOnRowClick) toggleExpand(node.id);
            if (triggerSelectOnRowClick) {
              setSelectedNodeId(node.id);
              if (onSelect) (onSelect as any)(node, level);
            }
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (onNodeDoubleClick) {
              onNodeDoubleClick(node);
            }
            if (readOnly) return;
            if (allowInlineEditing) {
              const fields: Record<string, any> = { name: node.name, ...(node.data || {}) };
              setEditingNode({ id: node.id, fields });
              setSelectedNodeId(node.id);
              if (onSelect) (onSelect as any)(node, level);
              setContextMenu(null);
            }
          }}
          draggable={true}
          onDragStart={(e) => {
            if (node.data?.type === 'field') {
               e.dataTransfer.setData('text/plain', JSON.stringify({ id: node.id, name: node.name, type: 'field' }));
            }
          }}
          onContextMenu={(e) => {
            if (readOnly || disableContextMenu) return;
            handleContextMenu(e, node.id, level);
          }}
        >
          <div 
            style={{ paddingRight: `${level * 0.5}rem` }} 
            className="flex items-center gap-1 flex-1 min-w-0"
          >
            <div 
              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
            >
              {hasChildren ? (
                isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500 rotate-180" />
              ) : (
                <div className="w-4" />
              )}
            </div>
            
            <div 
              className="cursor-pointer flex items-center justify-center p-0.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNodeId(node.id);
                if (onSelect) (onSelect as any)(node, level);
              }}
            >
              {iconProvider ? iconProvider(node) : (
                hasChildren || node.isRoot ? (
                  <Folder className={cn("w-4 h-4", node.isRoot ? "text-indigo-500" : "text-amber-500")} />
                ) : (
                  <File className="w-4 h-4 text-blue-400" />
                )
              )}
            </div>

            {isEditing ? (
              <div className="flex items-start gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col gap-1.5 flex-1 py-0.5">
                  {nodeFields ? (
                    nodeFields.map(field => {
                      if (field.type === 'select') {
                        return (
                          <select
                            key={field.key}
                            autoFocus={field.key === 'name' || field.key === 'code'}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 text-[11px] outline-none transition-colors focus:border-indigo-300 w-full"
                            value={editingNode.fields[field.key] || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              const newFields = { ...editingNode.fields, [field.key]: val };
                              setEditingNode({ ...editingNode, fields: newFields });
                              if (field.key === 'name' && onNodeRename) onNodeRename(node.id, val);
                              if (onNodeUpdate) onNodeUpdate(node.id, newFields);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleUpdate(node.id, editingNode.fields);
                              if (e.key === "Escape") handleCancelEditing(node.id);
                            }}
                          >
                            <option value="" disabled>{field.placeholder}</option>
                            {(typeof field.options === 'function' ? field.options(node) : field.options)?.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        );
                      }
                      
                      return (
                        <input
                          key={field.key}
                          autoFocus={field.key === 'name' || field.key === 'code'}
                          type={field.type || "text"}
                          placeholder={field.placeholder}
                          maxLength={typeof field.maxLength === 'function' ? field.maxLength(level) : field.maxLength}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 text-[11px] outline-none transition-colors focus:border-indigo-300 w-full"
                          value={editingNode.fields[field.key] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newFields = { ...editingNode.fields, [field.key]: val };
                            setEditingNode({ ...editingNode, fields: newFields });
                            if (field.key === 'name' && onNodeRename) onNodeRename(node.id, val);
                            if (onNodeUpdate) onNodeUpdate(node.id, newFields);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdate(node.id, editingNode.fields);
                            if (e.key === "Escape") handleCancelEditing(node.id);
                          }}
                        />
                      );
                    })
                  ) : (
                    <input
                      autoFocus
                      placeholder="عنوان"
                      className="bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded px-1.5 py-0.5 text-[11px] outline-none w-full"
                      value={editingNode.fields.name || ""}
                      onChange={(e) => {
                        const newName = e.target.value;
                        const newFields = { ...editingNode.fields, name: newName };
                        setEditingNode({ ...editingNode, fields: newFields });
                        if (onNodeRename) onNodeRename(node.id, newName);
                        if (onNodeUpdate) onNodeUpdate(node.id, newFields);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdate(node.id, editingNode.fields);
                        if (e.key === "Escape") handleCancelEditing(node.id);
                      }}
                    />
                  )}
                </div>

                <div className="flex items-center flex-shrink-0 pt-0.5">
                  <button 
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleUpdate(node.id, editingNode.fields)} 
                    className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded text-green-600 transition-colors"
                    title="ذخیره"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleCancelEditing(node.id);
                    }}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 transition-colors"
                    title="لغو"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              renderLabel ? renderLabel(node) : <span className={cn(node.children && node.children.length > 0 ? "text-[11px] font-medium text-black dark:text-white" : "text-[11px] font-medium text-gray-800 dark:text-gray-100")}>{node.name}</span>
            )}
          </div>
          
          {!readOnly && !disableContextMenu && (
            <button 
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleContextMenu(e, node.id, level);
              }}
            >
              <MoreVertical className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mr-4 border-r border-gray-100 dark:border-slate-800 pr-2"
            >
              {sortChildren(node.children || []).map((child) => renderNode(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2 flex-1 h-full min-h-0 overflow-hidden">
      {(label || showSortOptions || showSearch) && (
        <div className="flex flex-col gap-1.5 pb-2 border-b border-gray-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center justify-between gap-2">
            {label ? (
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 select-none">
                {label}
              </label>
            ) : <div />}

            {showSortOptions && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-[10px]">
                <span className="text-slate-400 dark:text-slate-500 px-1 text-[10px] select-none">ترتیب:</span>
                <button
                  type="button"
                  onClick={() => handleSortChange('code')}
                  className={cn(
                    "px-2 py-0.5 rounded transition-all font-medium text-[10px] cursor-pointer",
                    activeSortBy === 'code'
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                  )}
                >
                  کد
                </button>
                <button
                  type="button"
                  onClick={() => handleSortChange('title')}
                  className={cn(
                    "px-2 py-0.5 rounded transition-all font-medium text-[10px] cursor-pointer",
                    activeSortBy === 'title'
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                  )}
                >
                  عنوان
                </button>
              </div>
            )}
          </div>

          {showSearch && (
            <div className="relative flex items-center w-full">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder="جستجو در درختواره..."
                className="w-full pl-7 pr-8 py-1 text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-100 placeholder:text-gray-400 transition-colors"
              />
              {isSearching ? (
                <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin absolute left-2" />
              ) : searchTerm ? (
                <button
                  type="button"
                  onClick={() => handleSearchInput('')}
                  className="absolute left-2 p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title="پاک کردن"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>
          )}
        </div>
      )}

      <div className={cn(
        "relative flex-1 overflow-auto custom-scrollbar",
        !hideContainer ? "border border-gray-200 dark:border-slate-800 rounded-lg p-2 bg-gray-50/50 dark:bg-slate-900/50 shadow-inner" : ""
      )}>
        <div className="min-w-max pb-2 pr-2">
          {renderNode(data)}
        </div>

        {contextMenu && (
          <div
            ref={menuRef}
            className="fixed z-50 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl py-1 min-w-[140px]"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            {(!maxLevels || contextMenu.level < maxLevels - 1) && (!canAddChild || canAddChild(findNode(data, contextMenu.nodeId)!)) && (
              <button
                className="w-full text-right px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200"
                onClick={() => handleAddChild(contextMenu.nodeId)}
              >
                <Plus className="w-3 h-3 text-green-500" />
                {getAddChildLabel ? getAddChildLabel(contextMenu.level) : "ایجاد زیرشاخه"}
              </button>
            )}
            {allowInlineEditing && (
              <button
                className="w-full text-right px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200"
                onClick={() => {
                  const node = findNode(data, contextMenu.nodeId);
                  if (node) {
                    const fields: Record<string, any> = { name: node.name, ...(node.data || {}) };
                    setEditingNode({ id: node.id, fields });
                    setSelectedNodeId(node.id);
                    if (onSelect) onSelect(node);
                    setContextMenu(null);
                  }
                }}
              >
                <Edit2 className="w-3 h-3 text-blue-500" />
                ویرایش نام
              </button>
            )}
            
            {(() => {
              const node = findNode(data, contextMenu.nodeId);
              const isRoot = node?.isRoot;
              const hasChildren = node?.children && node.children.length > 0;
              const isDeletable = node?.deletable !== false;
              
              // Standard tree might want to keep it.
              // I'll make it configurable or just allow it if it's not strictly "root"
              const canDelete = !hasChildren && isDeletable;

              return (
                <button
                  disabled={!canDelete}
                  className={cn(
                    "w-full text-right px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-slate-700",
                    canDelete ? "text-red-500" : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  )}
                  onClick={() => {
                    if (canDelete) {
                      if (onDeleteNode) {
                        onDeleteNode(contextMenu.nodeId);
                        setContextMenu(null);
                      } else {
                        handleDelete(contextMenu.nodeId);
                      }
                    }
                  }}
                  title={!isDeletable ? "این شاخه قابل حذف نیست" : hasChildren ? "شاخه دارای فرزند قابل حذف نیست" : ""}
                >
                  <Trash2 className="w-3 h-3" />
                  حذف شاخه
                </button>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
});

TreeView.displayName = "TreeView";
