"use client";
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import { apiFetch, safeStringify, cn } from '@/lib/utils';
import { eventBus, EVENTS } from '@/lib/events';

import React, { useState, useRef, useEffect } from 'react';
import { SimpleForm, FieldConfig } from './SimpleForm';
import { TreeView, TreeNode, TreeViewRef } from '../inputs';
import { MultiColumnDropdown } from '../inputs/MultiColumnDropdown';
import { useTabs } from '../TabsProvider';
import { useToast } from '../ToastProvider';
import { SaveButton } from '../buttons/SaveButton';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { LoadingOverlay } from '../ui/LoadingOverlay';
import { DatabaseSeedModal } from './DatabaseSeedModal';
import { DatabaseUnseedModal } from './DatabaseUnseedModal';
import { Building2, Building, Store, Users, Folder, Trash2, Plus } from 'lucide-react';
import { BUSINESS_STRUCTURE_TYPES } from '@/lib/constants';

export function BusinessStructure(props: any) {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const { isUsed } = useFormUsageCheck("BusinessStructure", selectedNode?.id && /^\d+$/.test(selectedNode.id) ? selectedNode.id : undefined);

  const [selectedNodeLevel, setSelectedNodeLevel] = useState<number>(0);
  const selectedNodeIdRef = useRef<string | null>(null);
  const [nodeToDelete, setNodeToDelete] = useState<TreeNode | null>(null);
  const treeRef = useRef<TreeViewRef>(null);
  const { removeTab, activeTabId } = useTabs();
  const { showToast } = useToast();

  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeStructureTypes, setActiveStructureTypes] = useState<string[]>(['1', '2', '3', '4']);
  const [shareHeadquarter, setShareHeadquarter] = useState(true);
  const [isAddingUserRow, setIsAddingUserRow] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [seedModal, setSeedModal] = useState<{ isOpen: boolean; businessStructureId: number }>({ isOpen: false, businessStructureId: 0 });
  const [unseedModal, setUnseedModal] = useState<{ isOpen: boolean; businessStructureId: number }>({ isOpen: false, businessStructureId: 0 });

  const fetchActiveTypes = async () => {
    try {
      const res = await apiFetch('/api/common/base-settings/tab/1');
      if (res.ok) {
        const body = await res.json();
        const settings = body.data || {};
        if (settings.activeBusinessStructures) {
          setActiveStructureTypes(settings.activeBusinessStructures.split(','));
        }
        if (settings.shareHeadquarterData !== undefined) {
          setShareHeadquarter(settings.shareHeadquarterData === 'true');
        }
      }
    } catch (error) {
      console.error('Error fetching settings', error);
    }
  };

  const handleNodeSelect = (node: TreeNode, level: number = 0) => {
    setSelectedNode(node);
    setSelectedNodeLevel(level);
    selectedNodeIdRef.current = node.id;
    setFormValues({
      name: node.name,
      ...node.data
    });
  };

  const fetchTree = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/business-structure');
      if (!res.ok) {
        const text = await res.text().catch(() => "Unknown error");
        throw new Error(`Failed to fetch data: ${res.statusText} (${res.status}) ${text}`);
      }
      const data = await res.json();
      const flatList = data.data;

      if (!flatList || flatList.length === 0) {
        setTreeData(null);
        return;
      }

      const buildNode = (item: any, parentType: any = null, isParentRoot: boolean = false, level: number = 0): TreeNode => {
        const itemBusinessStructure = item.businessStructure;
        const children = flatList
          .filter((x: any) => (x.parentRef || 0).toString() === item.businessStructureId.toString())
          .map((child: any) => buildNode(child, itemBusinessStructure, !item.parentRef || (item.parentRef || 0).toString() === '0', level + 1));
        
        return {
          id: item.businessStructureId.toString(),
          name: item.title,
          isRoot: !item.parentRef || (item.parentRef || 0).toString() === '0',
          deletable: !item.isSystem,
          data: {
            code: item.code,
            title_en: item.title_en || '',
            businessStructure: item.businessStructure || '',
            manager: item.manager || '',
            logoUrl: item.logoUrl || null,
            isActive: item.isActive !== undefined ? item.isActive : true,
            isSystem: item.isSystem,
            parentType,
            isParentRoot,
            level,
            shareHeadquarterData: item.isBasicInfoShared ?? false,
            activeBusinessStructures: item.activeStructureTypes ? item.activeStructureTypes.split(',') : undefined,
          },
          children
        };
      };

      const rootItem = flatList.find((x: any) => !x.parentRef || (x.parentRef || 0).toString() === '0');
      if (rootItem) {
        const rootNode = buildNode(rootItem);
        setTreeData(rootNode);

        const findUpdatedNode = (node: TreeNode, id: string): { node: TreeNode, level: number } | null => {
          if (node.id === id) return { node, level: node.data?.level || 0 };
          for (const child of node.children) {
            const found = findUpdatedNode(child, id);
            if (found) return found;
          }
          return null;
        };

        const currentId = selectedNodeIdRef.current;
        if (currentId) {
          const result = findUpdatedNode(rootNode, currentId);
          if (result) {
            handleNodeSelect(result.node, result.level);
          } else if (rootNode.children && rootNode.children.length > 0) {
            handleNodeSelect(rootNode.children[0], 1);
          }
        } else if (rootNode.children && rootNode.children.length > 0) {
          handleNodeSelect(rootNode.children[0], 1);
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast('خطا در دریافت اطلاعات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveTypes();
    fetchTree();

    const unsubscribe = eventBus.on(EVENTS.DATA_CHANGED, (payload) => {
      if (payload?.entity === 'BusinessStructure') {
        fetchTree();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAddNode = (node: TreeNode) => {
    // When a newly created placeholder node is passed here (e.g. from TreeView "plus" button)
    // We update local state to reflect that it needs filling out.
    // The actual form save will handle pushing it to the backend.
    setTreeData(prevTree => {
      if (!prevTree) return prevTree;

      const findParent = (n: TreeNode, childId: string): TreeNode | null => {
        if (n.children.some(c => c.id === childId)) return n;
        for (const c of n.children) {
          const found = findParent(c, childId);
          if (found) return found;
        }
        return null;
      };

      const parentNode = findParent(prevTree, node.id);
      const parentType = parentNode?.data?.businessStructure || null;
      const isParentRoot = parentNode?.isRoot || false;

      let max = 0;
      const traverse = (n: TreeNode) => {
        if (n.data?.code) {
          const parsed = parseInt(n.data.code, 10);
          if (!isNaN(parsed) && parsed > max) {
            max = parsed;
          }
        }
        n.children.forEach(traverse);
      };
      traverse(prevTree);
      
      const nextCode = max === 0 ? "1" : (max + 1).toString();
      const emptyValues = { code: nextCode, name: '', title_en: '', businessStructure: '', manager: '', isActive: true };

      setFormValues(emptyValues);
      setSelectedNode(prev => prev && prev.id === node.id 
        ? { ...prev, name: '', data: { ...prev.data, ...emptyValues, parentType, isParentRoot } } 
        : prev
      );

      const updateNode = (n: TreeNode): TreeNode => {
        if (n.id === node.id) {
          return { ...n, data: { ...n.data, code: nextCode, businessStructure: '', parentType, isParentRoot } };
        }
        return { ...n, children: n.children.map(updateNode) };
      };
      return updateNode(prevTree);
    });
  };

  const handleFormChange = (name: string, value: any) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
    
    if (selectedNode) {
      setTreeData(prevTree => {
        if (!prevTree) return prevTree;
        const updateNode = (n: TreeNode): TreeNode => {
          if (n.id === selectedNode.id) {
            const newData = { ...n.data, [name]: value };
            return { ...n, name: name === 'name' ? value : n.name, data: newData };
          }
          return { ...n, children: n.children.map(updateNode) };
        };
        return updateNode(prevTree);
      });
      setSelectedNode(prev => {
        if (!prev) return prev;
        return {
          ...prev,
           name: name === 'name' ? value : prev.name,
           data: { ...prev.data, [name]: value }
        };
      });
    }
  };

  const handleBlur = (name: string, value: string) => {
    if (name === 'title_en' && !value && formValues.name) {
       handleFormChange('title_en', formValues.name);
    }
  };

  const saveToServer = async (node: TreeNode, values: any): Promise<boolean> => {
    if (!values.name || values.name.trim() === '') {
      showToast('لطفا عنوان را وارد کنید', 'error');
      return false;
    }
    const parsedStructure = parseInt(values.businessStructure) || 0;
    if (!node.isRoot && parsedStructure === 0) {
      showToast('لطفا نوع ساختار را انتخاب کنید', 'error');
      return false;
    }

    try {
      const isNew = !/^\d+$/.test(node.id); // Check if the ID consists only of digits
      
      // Find parent ID.
      let parentRefId = 0;
      if (isNew && treeData) {
        const findParent = (n: TreeNode, childId: string): TreeNode | null => {
          if (n.children.some(c => c.id === childId)) return n;
          for (const c of n.children) {
            const found = findParent(c, childId);
            if (found) return found;
          }
          return null;
        };
        const parentNode = findParent(treeData, node.id);
        if (parentNode) {
          parentRefId = parseInt(parentNode.id, 10);
        }
      }

      let finalLogoUrl = values.logoUrl;
      if (values.logoUrl instanceof File) {
        const formData = new FormData();
        formData.append('file', values.logoUrl);
        const uploadRes = await apiFetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalLogoUrl = uploadData.url;
        } else {
          showToast('خطا در بارگذاری تصویر', 'error');
          return false;
        }
      }

      const bsId = parseInt(values.businessStructure) || null;
      const bsName = bsId ? BUSINESS_STRUCTURE_TYPES.find(opt => Number(opt.value) === bsId)?.label : null;

      const payload: any = {
        title: values.name?.trim() || '',
        title_en: values.title_en?.trim() || values.name?.trim() || '',
        code: values.code?.trim() ? values.code.trim() : null,
        businessStructure: bsId,
        businessStructureName: bsName,
        manager: values.manager?.trim() ? values.manager.trim() : null,
        isActive: values.isActive !== undefined ? values.isActive : true,
        logoUrl: typeof finalLogoUrl === 'string' && finalLogoUrl.trim() ? finalLogoUrl : null,
        ...(isNew ? { parentRef: parentRefId || null } : {})
      };
      
      if (node.isRoot) {
        payload.isBasicInfoShared = values.shareHeadquarterData !== undefined ? values.shareHeadquarterData : shareHeadquarter;
        const finalActiveStructures = values.activeBusinessStructures || activeStructureTypes;
        payload.activeStructureTypes = Array.isArray(finalActiveStructures) ? finalActiveStructures.join(',') : finalActiveStructures;
      }

      const url = isNew ? '/api/business-structure' : `/api/business-structure/${parseInt(node.id, 10)}`;
      const method = isNew ? 'POST' : 'PUT';

      if (node.isRoot && !isNew) {
        let definedStructures: string[] = [];
        if (treeData) {
          const extract = (n: TreeNode) => {
             if (n.data?.businessStructure && !definedStructures.includes(n.data.businessStructure.toString())) {
                 definedStructures.push(n.data.businessStructure.toString());
             }
             n.children.forEach(extract);
          };
          extract(treeData);
        }
        let finalActiveStructures = values.activeBusinessStructures || activeStructureTypes;
        if (definedStructures.length > 0) {
           finalActiveStructures = Array.from(new Set([...finalActiveStructures, ...definedStructures]));
        }

        const shareVal = values.shareHeadquarterData !== undefined ? values.shareHeadquarterData : shareHeadquarter;

        const baseSettingsPayload = {
          settings: [
            { key: 'shareHeadquarterData', value: shareVal ? 'true' : 'false' },
            { key: 'activeBusinessStructures', value: finalActiveStructures.join(',') }
          ]
        };
        await apiFetch('/api/common/base-settings/tab/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: safeStringify(baseSettingsPayload)
        });
        
        // Also update local state
        if (finalActiveStructures) setActiveStructureTypes(finalActiveStructures);
        if (shareVal !== undefined) setShareHeadquarter(shareVal);
      }

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify(payload)
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || `Error saving node (${res.status})`, 'error');
        return false;
      }

      showToast('عملیات با موفقیت انجام شد', 'success');
      window.dispatchEvent(new CustomEvent('company-list-updated'));
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'BusinessStructure' });
      
      const createdData = await res.json().catch(() => ({}));
      const newEntity = createdData.data || createdData;
      
      if (isNew && newEntity && newEntity.businessStructureId) {
        selectedNodeIdRef.current = newEntity.businessStructureId.toString();
      }
      
      const rootShareValue = node.isRoot 
        ? (values.shareHeadquarterData !== undefined ? values.shareHeadquarterData : shareHeadquarter)
        : (treeData?.data?.shareHeadquarterData ?? shareHeadquarter);

      if (isNew && !rootShareValue && (newEntity.businessStructure === 1 || newEntity.businessStructure === 2)) {
         setSeedModal({ isOpen: true, businessStructureId: newEntity.businessStructureId });
      }

      return true;
    } catch (err: any) {
      console.error("Save error:", err.message);
      showToast(err.message || 'خطا در ذخیره اطلاعات', 'error');
      return false;
    }
  };

  const handleSave = async () => {
    if (!selectedNode || !treeData) return;
    setIsSubmitting(true);
    const success = await saveToServer(selectedNode, formValues);
    if (success) {
      await fetchTree(); // Re-fetch to get correct backend IDs and refresh structure
      // Wait to re-select
    }
    setIsSubmitting(false);
  };

  const handleSaveNew = async () => {
    if (!selectedNode || !treeData) return;
    setIsSubmitting(true);
    const success = await saveToServer(selectedNode, formValues);
    if (success) {
      await fetchTree();
      if (treeRef.current) {
        // Will add child to whatever the root or structure provides. Currently no easy way to re-select 
        treeRef.current.addChildToSelected(); 
      }
    }
    setIsSubmitting(false);
  };

  const handleSaveClose = async () => {
    if (!selectedNode || !treeData) return;
    setIsSubmitting(true);
    const success = await saveToServer(selectedNode, formValues);
    setIsSubmitting(false);
    if (success && activeTabId) {
      removeTab(activeTabId);
    }
  };

  const handleDeleteRequest = (node: TreeNode) => {
    if (node.children && node.children.length > 0) {
      showToast("شاخه دارای فرزند قابل حذف نیست", "error");
      return;
    }
    if (node.isRoot || node.deletable === false) {
      showToast("این شاخه قابل حذف نیست", "error");
      return;
    }
    setNodeToDelete(node);
  };

  const executeDelete = async () => {
    if (!nodeToDelete) return;
    const node = nodeToDelete;
    setNodeToDelete(null);

    const isNew = !/^\d+$/.test(node.id);
    const bsType = node.data?.businessStructure;

    if (!isNew && (bsType === 1 || bsType === 2 || bsType === '1' || bsType === '2')) {
       // Open the unseed modal to handle the unseeding and then the structural deletion
       setUnseedModal({ isOpen: true, businessStructureId: parseInt(node.id, 10) });
       return;
    }

    try {
      setIsSubmitting(true);
      if (!isNew) {
        const res = await apiFetch(`/api/business-structure/${parseInt(node.id, 10)}`, {
          method: 'DELETE'
        });
        if (!res.ok) {
           const errData = await res.json().catch(() => ({}));
           showToast(errData.message || `Error deleting node (${res.status})`, 'error');
           return;
        }
      }
      showToast('شاخه با موفقیت حذف شد', 'success');
      window.dispatchEvent(new CustomEvent('company-list-updated'));
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'BusinessStructure' });
      if (selectedNode && selectedNode.id === node.id) {
        setSelectedNode(null);
      }
      await fetchTree();
    } catch (err: any) {
      console.error("Delete error:", err.message);
      showToast(err.message || 'خطا در حذف شاخه', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRootSelected = selectedNode?.isRoot ?? false;

  const parentType = selectedNode?.data?.parentType;
  const isParentRoot = selectedNode?.data?.isParentRoot;

  let finalFormValues = { ...formValues };
  if (isRootSelected) {
    let definedStructures: string[] = [];
    if (treeData) {
      const extract = (n: TreeNode) => {
         if (n.data?.businessStructure && !definedStructures.includes(n.data.businessStructure.toString())) {
             definedStructures.push(n.data.businessStructure.toString());
         }
         n.children.forEach(extract);
      };
      extract(treeData);
    }
    
    if (finalFormValues.activeBusinessStructures === undefined) {
      finalFormValues.activeBusinessStructures = definedStructures.length > 0 ? definedStructures : activeStructureTypes;
    } else if (definedStructures.length > 0) {
      const merged = Array.from(new Set([...finalFormValues.activeBusinessStructures, ...definedStructures]));
      finalFormValues.activeBusinessStructures = merged;
    }
    
    if (finalFormValues.shareHeadquarterData === undefined) {
      finalFormValues.shareHeadquarterData = shareHeadquarter;
    }
  }

  // users management
  const [activePanelTab, setActivePanelTab] = useState<'main' | 'users'>('main');
  const [assignedUsers, setAssignedUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isAllUsersLoading, setIsAllUsersLoading] = useState(false);

  useEffect(() => {
    const fetchAllUsers = async () => {
      setIsAllUsersLoading(true);
      try {
        const res = await apiFetch('/api/iam/users');
        if (res.ok) {
          const body = await res.json();
          setAllUsers(Array.isArray(body) ? body : body.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsAllUsersLoading(false);
      }
    };
    fetchAllUsers();
  }, []);

  const fetchAssignedUsers = async (structureId: string) => {
    if (/^\d+$/.test(structureId)) {
      setIsUsersLoading(true);
      try {
        const res = await apiFetch(`/api/iam/business-structure/${structureId}/users`);
        if (res.ok) {
          const body = await res.json();
          setAssignedUsers(Array.isArray(body) ? body : body.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsUsersLoading(false);
      }
    }
  };

  useEffect(() => {
    if (selectedNode && !isRootSelected) {
      fetchAssignedUsers(selectedNode.id);
    } else {
      setAssignedUsers([]);
    }
  }, [selectedNode, isRootSelected]);

  const handleAddUser = async (userValue: any) => {
    if (!selectedNode || !userValue || !userValue.id) return;
    try {
      const res = await apiFetch(`/api/iam/business-structure/${selectedNode.id}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRef: parseInt(userValue.id.toString(), 10) })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error assigning user');
      }
      showToast('کاربر با موفقیت اضافه شد', 'success');
      fetchAssignedUsers(selectedNode.id);
    } catch (err: any) {
      showToast(err.message || 'خطا در افزودن کاربر', 'error');
    }
  };

  const handleRemoveUser = async (bsuserId: number) => {
    try {
      const res = await apiFetch(`/api/iam/business-structure-users/${bsuserId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        throw new Error('Error deleting assigned user');
      }
      showToast('کاربر حذف شد', 'success');
      if (selectedNode) fetchAssignedUsers(selectedNode.id);
    } catch (err: any) {
      showToast(err.message || 'خطا در حذف کاربر', 'error');
    }
  };

  const availableUsers = allUsers.filter(u => !assignedUsers.find(au => au.userRef?.toString() === u.id?.toString()));

  const getBusinessStructureOptions = () => {
    const allOptions = BUSINESS_STRUCTURE_TYPES.filter(opt => activeStructureTypes.includes(opt.value));

    if (isParentRoot) {
      // Rule 1: Only Holding under Root
      return allOptions.filter(opt => opt.value === '1');
    }

    if (parentType === '1' || parentType === 1) {
      // Rule 2 & 3: If parent is Holding, only Company, Branch, Agency are allowed
      return allOptions.filter(opt => opt.value !== '1');
    }

    if (parentType === '2' || parentType === 2) {
      // Rule: Holding cannot be under Company
      return allOptions.filter(opt => opt.value !== '1');
    }

    if (parentType === '3' || parentType === 3) {
      // Rule: Only Agency under Branch
      return allOptions.filter(opt => opt.value === '4');
    }

    if (parentType === '4' || parentType === 4) {
      // Rule: Branch cannot be under Agency. Only Agency under Agency.
      return allOptions.filter(opt => opt.value === '4');
    }

    return allOptions;
  };

  const fields: FieldConfig[] = [
    { name: 'code', label: 'کد ساختار', type: 'text', colSpan: 1, disabled: isRootSelected },
    { name: 'name', label: 'عنوان', type: 'text', required: true, colSpan: 1, disabled: isRootSelected },
    { 
      name: 'title_en', 
      label: 'عنوان (لاتین)', 
      type: 'text', 
      required: true, 
      colSpan: 1, 
      disabled: isRootSelected,
      onBlur: handleBlur
    },
    ...(!isRootSelected ? [
      { 
        name: 'businessStructure', 
        label: 'نوع ساختار', 
        type: 'select', 
        required: true,
        placeholder: 'انتخاب کنید',
        options: getBusinessStructureOptions(),
        colSpan: 1
      },
      { name: 'manager', label: 'مدیر مسئول', type: 'text', colSpan: 1 },
      { name: 'logoUrl', label: 'لوگوی کسب و کار', type: 'file', accept: 'image/*', colSpan: 1 },
      { name: 'isActive', label: 'وضعیت فعالیت', type: 'checkbox', colSpan: 1 }
    ] : [])
  ];

  if (isRootSelected) {
     const hasChildren = treeData && treeData.children && treeData.children.length > 0;
      fields.push({
        name: 'shareHeadquarterData',
        text: 'اطلاعات پایه در سطح نوع ساختار "دفتر مرکزی و شرکت" مشترک باشد',
        label: '',
        type: 'checkbox',
        colSpan: 2
     });
     fields.push({
        name: 'activeBusinessStructures',
        label: 'نوع ساختار فعال',
        type: 'multi-checkbox',
        options: BUSINESS_STRUCTURE_TYPES.map(opt => ({ label: String(opt.label), value: String(opt.value) })),
        colSpan: 2
     });
     
     if (treeData && treeData.children && treeData.children.length > 0) {
       fields.push({
          name: 'activeBusinessStructures_warning',
          label: ' ',
          type: 'custom',
          colSpan: 2,
          customComponent: (
            <div className="text-[11px] text-orange-500 mt-[-10px] w-full">
              انواع ساختارهایی که از قبل در سیستم ثبت شده‌اند، غیرقابل غیرفعال‌سازی هستند.
            </div>
          )
       });
     }
  }

  const renderIcon = (node: TreeNode) => {
    const structType = node.data?.businessStructure?.toString();
    switch(structType) {
      case '1': return <Building2 className="w-4 h-4 text-purple-600" />;
      case '2': return <Building className="w-4 h-4 text-amber-500" />;
      case '3': return <Store className="w-4 h-4 text-emerald-500" />;
      case '4': return <Users className="w-4 h-4 text-blue-500" />;
      default: return <Folder className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex flex-row h-full w-full gap-4 overflow-hidden p-2 relative">
      <LoadingOverlay visible={isSubmitting || (!treeData && loading)} message={!treeData && loading ? "در حال دریافت اطلاعات..." : "لطفا منتظر بمانید..."} />
      <div className="w-1/3 flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm overflow-hidden p-2">
        {treeData ? (
          <TreeView
            ref={treeRef}
            data={treeData}
            iconProvider={renderIcon}
            selectedNodeId={selectedNode?.id}
            allowInlineEditing={false}
            onChange={setTreeData}
            onSelect={handleNodeSelect}
            onAddNode={handleAddNode}
            onNodeUpdate={(nodeId, updatedFields) => {
              if (selectedNode && selectedNode.id === nodeId) {
                 setFormValues(prev => {
                   const merged = { ...prev, ...updatedFields };
                   return merged;
                 });
                 setSelectedNode(prev => {
                   if (!prev) return prev;
                   return {
                     ...prev,
                     name: updatedFields.name !== undefined ? updatedFields.name : prev.name,
                     data: { ...prev.data, ...updatedFields }
                   };
                 });
              }
            }}
            nodeFields={[
              { key: 'name', placeholder: 'عنوان', type: 'text' },
              { key: 'title_en', placeholder: 'عنوان (لاتین)', type: 'text' },
              { 
                key: 'businessStructure', 
                placeholder: 'نوع ساختار', 
                type: 'select',
                options: (node) => {
                  const nodeParentType = node.data?.parentType;
                  const nodeIsParentRoot = node.data?.isParentRoot;
                  
                  const allOptions = BUSINESS_STRUCTURE_TYPES.filter(opt => activeStructureTypes.includes(opt.value));

                  if (nodeIsParentRoot) {
                    return allOptions.filter(opt => opt.value === '1');
                  }

                  if (nodeParentType === '1' || nodeParentType === 1) {
                    return allOptions.filter(opt => opt.value !== '1');
                  }

                  if (nodeParentType === '2' || nodeParentType === 2) {
                    return allOptions.filter(opt => opt.value !== '1');
                  }

                  if (nodeParentType === '3' || nodeParentType === 3) {
                    return allOptions.filter(opt => opt.value === '4');
                  }

                  if (nodeParentType === '4' || nodeParentType === 4) {
                    return allOptions.filter(opt => opt.value === '4');
                  }

                  return allOptions;
                }
              }
            ]}
            onNodeSave={async (nodeId, updatedFields) => {
              const findNode = (node: TreeNode, id: string): TreeNode | null => {
                if (node.id === id) return node;
                for (const child of node.children) {
                  const found = findNode(child, id);
                  if (found) return found;
                }
                return null;
              };
              const node = findNode(treeData, nodeId);
              if (node) {
                const mergedValues = { ...formValues, ...updatedFields };
                setIsSubmitting(true);
                const success = await saveToServer(node, mergedValues);
                setIsSubmitting(false);
                if (success) {
                  await fetchTree();
                }
                return success;
              }
              return false;
            }}
            onDeleteNode={(nodeId) => {
              const findNode = (node: TreeNode, id: string): TreeNode | null => {
                if (node.id === id) return node;
                for (const child of node.children) {
                  const found = findNode(child, id);
                  if (found) return found;
                }
                return null;
              };
              const node = findNode(treeData, nodeId);
              if (node) handleDeleteRequest(node);
            }}
            label="ساختار کسب و کار"
            getAddChildLabel={(level) => "افزودن زیرشاخه"}
            maxLevels={4}
          />
        ) : (
          <div className="text-sm p-4 text-slate-500 text-center">
            {loading ? 'در حال بارگذاری ساختار کسب و کار...' : 'موردی یافت نشد.'}
          </div>
        )}
      </div>
      <div className="w-2/3 flex flex-col h-full rounded-lg shadow-sm overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        {selectedNode ? (
          <>
            <div className="flex-1 overflow-y-auto flex flex-col relative w-full h-full min-h-0">
              {activePanelTab === 'main' ? (
                <SimpleForm isReadonly={isUsed || false}
                  showLoadingOverlay={false}
                  title={`جزئیات: ${selectedNode.name}`}
                  fields={fields}
                  values={finalFormValues}
                  onChange={handleFormChange}
                  onSave={handleSave}
                  onSaveNew={handleSaveNew}
                  
                  onNew={selectedNodeLevel >= 3 ? undefined : () => {
                    if (selectedNodeLevel < 3 && treeRef.current) {
                      treeRef.current.addChildToSelected();
                    }
                  }}
                  onDelete={(!selectedNode || selectedNode.isRoot || selectedNode.deletable === false) ? undefined : () => handleDeleteRequest(selectedNode)}
                  isSubmitting={isSubmitting}
                  showListButton={false}
                  subHeader={
                    <div className="flex flex-row bg-slate-50 dark:bg-gray-800/50 p-2 gap-2 shrink-0">
                      <button 
                        onClick={() => setActivePanelTab('main')} 
                        className={cn("px-4 py-2 text-sm font-semibold rounded-md transition-colors", activePanelTab === 'main' ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm" : "hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-600 dark:text-slate-300")}
                      >
                        تب اصلی
                      </button>
                      <button 
                        onClick={() => setActivePanelTab('users')} 
                        className={cn("px-4 py-2 text-sm font-semibold rounded-md transition-colors", activePanelTab === 'users' ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm" : "hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-600 dark:text-slate-300")}
                      >
                        کاربران مجاز
                      </button>
                    </div>
                  }
                />
              ) : (
                <SimpleForm isReadonly={isUsed || false}
                  title={`کاربران مجاز: ${selectedNode.name}`}
                  fields={[]}
                  values={{}}
                  onChange={() => {}}
                  showActions={false}
                  actionbar={
                    <SaveButton 
                      onClick={() => handleSave()} 
                      disabled={isSubmitting} 
                      hideLabel 
                    />
                  }
                  isSubmitting={isSubmitting}
                  showListButton={false}
                  className="!border-none !shadow-none !rounded-none"
                  hideHeader={false}
                  subHeader={
                    <div className="flex flex-row bg-slate-50 dark:bg-gray-800/50 p-2 gap-2 shrink-0">
                      <button 
                        onClick={() => setActivePanelTab('main')} 
                        className={cn("px-4 py-2 text-sm font-semibold rounded-md transition-colors", activePanelTab === 'main' ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm" : "hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-600 dark:text-slate-300")}
                      >
                        تب اصلی
                      </button>
                      <button 
                        onClick={() => setActivePanelTab('users')} 
                        className={cn("px-4 py-2 text-sm font-semibold rounded-md transition-colors", activePanelTab === 'users' ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm" : "hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-600 dark:text-slate-300")}
                      >
                        کاربران مجاز
                      </button>
                    </div>
                  }
                >
                  <div className="flex flex-col h-full rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
                      <table className="w-full text-sm text-right">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3 font-semibold border-b border-gray-200 dark:border-gray-700 w-16 text-center">ردیف</th>
                            <th className="px-4 py-3 font-semibold border-b border-gray-200 dark:border-gray-700 text-right">نام و نام خانوادگی</th>
                            <th className="px-4 py-3 font-semibold border-b border-gray-200 dark:border-gray-700 text-right">نام کاربری</th>
                            <th className="px-4 py-3 font-semibold border-b border-gray-200 dark:border-gray-700 w-24 text-center">عملیات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {isUsersLoading ? (
                            <tr>
                              <td colSpan={4} className="px-4 py-8 text-center text-gray-500">در حال بارگذاری...</td>
                            </tr>
                          ) : assignedUsers.length === 0 && !isAddingUserRow ? (
                            <tr>
                              <td colSpan={4} className="px-4 py-8 text-center text-gray-500">کاربری یافت نشد</td>
                            </tr>
                          ) : (
                            assignedUsers.map((user, index) => {
                              const isSelected = selectedUserIds.includes(user.businessStructureUsersId);
                              return (
                                <tr 
                                  key={user.businessStructureUsersId} 
                                  className={cn(
                                    "border-b border-gray-100 dark:border-gray-800 transition-colors cursor-pointer",
                                    isSelected ? "bg-blue-50/50 dark:bg-blue-900/20" : "hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                                  )}
                                  onClick={() => {
                                    setSelectedUserIds(prev => 
                                      prev.includes(user.businessStructureUsersId) 
                                        ? prev.filter(id => id !== user.businessStructureUsersId) 
                                        : [...prev, user.businessStructureUsersId]
                                    );
                                  }}
                                >
                                  <td className="px-4 py-3 text-center text-gray-500">{index + 1}</td>
                                  <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-200 text-right">
                                    {user.firstName || ''} {user.lastName || ''}
                                  </td>
                                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-right">{user.username}</td>
                                  <td className="px-4 py-3 text-center"></td>
                                </tr>
                              );
                            })
                          )}
                          {!isUsersLoading && isAddingUserRow && (
                            <tr className="bg-slate-50/50 dark:bg-gray-800/50">
                              <td className="px-4 py-2 text-center text-gray-400">
                                <span className="w-4 h-4 mx-auto inline-block text-lg font-bold">+</span>
                              </td>
                              <td className="px-4 py-2 relative">
                                <MultiColumnDropdown
                                  data={availableUsers}
                                  columns={[
                                    { key: 'firstName', header: 'نام' },
                                    { key: 'lastName', header: 'نام خانوادگی' },
                                    { key: 'username', header: 'نام کاربری' }
                                  ]}
                                  displayKey="firstName"
                                  onChange={(userToAdd) => {
                                    handleAddUser(userToAdd);
                                    setIsAddingUserRow(false);
                                  }}
                                  placeholder="انتخاب کاربر..."
                                  trigger={(toggle, isOpenState) => (
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); toggle(); }} 
                                      onKeyDown={(e) => {
                                        if (e.altKey && e.key === 'ArrowDown') {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          if (!isOpenState) toggle();
                                        }
                                      }}
                                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-right text-gray-600 dark:text-gray-300 font-medium py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors shadow-sm min-h-[36px] flex items-center"
                                    >
                                      انتخاب کاربر...
                                    </button>
                                  )}
                                />
                              </td>
                              <td className="px-4 py-2"></td>
                              <td className="px-4 py-2"></td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center justify-start p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 shrink-0 gap-2">
                      <button 
                        onClick={() => {
                          if (selectedUserIds.length > 0) {
                            selectedUserIds.forEach(id => handleRemoveUser(typeof id === 'string' ? parseInt(id, 10) : id as number));
                            setSelectedUserIds([]);
                          } else if (isAddingUserRow) {
                            setIsAddingUserRow(false);
                          }
                        }}
                        disabled={selectedUserIds.length === 0 && !isAddingUserRow}
                        className="flex items-center justify-center p-2 border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-900"
                        title="حذف ردیف‌های انتخاب شده"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setIsAddingUserRow(true)}
                        className="flex items-center justify-center p-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors shadow-sm"
                        title="ایجاد ردیف جدید"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </SimpleForm>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">لطفا یک گره از درخت ساختار انتخاب کنید.</p>
          </div>
        )}
      </div>
      <ConfirmDialog
        isOpen={!!nodeToDelete}
        title="حذف شاخه"
        message={`آیا از حذف شاخه ${nodeToDelete?.name || ''} اطمینان دارید؟`}
        confirmText="بلی"
        cancelText="خیر"
        onConfirm={executeDelete}
        onCancel={() => setNodeToDelete(null)}
      />
      <DatabaseSeedModal 
        isOpen={seedModal.isOpen} 
        onClose={() => setSeedModal({ isOpen: false, businessStructureId: 0 })} 
        businessStructureId={seedModal.businessStructureId} 
      />
      <DatabaseUnseedModal 
        isOpen={unseedModal.isOpen} 
        onClose={(success) => {
          setUnseedModal({ isOpen: false, businessStructureId: 0 });
          if (success) {
            window.dispatchEvent(new CustomEvent('company-list-updated'));
            eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'BusinessStructure' });
            if (selectedNode && selectedNode.id === unseedModal.businessStructureId.toString()) {
              setSelectedNode(null);
            }
             fetchTree();
          }
        }} 
        businessStructureId={unseedModal.businessStructureId} 
      />
    </div>
  );
}

