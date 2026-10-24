"use client";
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import { apiFetch, safeStringify, cn } from '@/lib/utils';
import { eventBus, EVENTS } from '@/lib/events';

import React, { useState, useRef, useEffect } from 'react';
import { SimpleForm, FieldConfig } from '../SimpleForm';
import { TreeView, TreeNode, TreeViewRef } from '../../inputs';
import { useTabs } from '../../TabsProvider';
import { useToast } from '../../ToastProvider';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { LoadingOverlay } from '../../ui/LoadingOverlay';
import { Globe2, Map, MapPin, Building, Folder } from 'lucide-react';

const GEOGRAPHIC_TYPES = [
  { value: 1, label: 'کشور' },
  { value: 2, label: 'استان' },
  { value: 3, label: 'شهر' },
  { value: 4, label: 'روستا' },
];

export function GeoLocation() {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  const { isUsed } = useFormUsageCheck("GeoLocation", selectedNode && selectedNode.id !== 'root' && /^\d+$/.test(selectedNode.id) ? parseInt(selectedNode.id) : null);

  const [selectedNodeLevel, setSelectedNodeLevel] = useState<number>(0);
  const selectedNodeIdRef = useRef<string | null>(null);
  const [nodeToDelete, setNodeToDelete] = useState<TreeNode | null>(null);
  const treeRef = useRef<TreeViewRef>(null);
  const { removeTab, activeTabId } = useTabs();
  const { showToast } = useToast();

  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

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
      const res = await apiFetch('/api/geo-locations');
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Failed to fetch data: ${res.status} ${res.statusText} ${text}`);
      }
      const data = await res.json();
      const flatList = data.data;

      const buildNode = (item: any, parentType: any = null, isParentRoot: boolean = false, level: number = 1): TreeNode => {
        const itemType = item.geographicType;
        const children = flatList
          .filter((x: any) => (x.parentRef || 0).toString() === item.geolocationId.toString())
          .map((child: any) => buildNode(child, itemType, false, level + 1));
        
        return {
          id: item.geolocationId.toString(),
          name: item.title,
          isRoot: false,
          deletable: true,
          data: {
            code: item.code,
            title_en: item.titleEn || '',
            geographicType: item.geographicType || '',
            isActive: item.isActive !== undefined ? item.isActive : true,
            parentType,
            isParentRoot,
            level
          },
          children
        };
      };

      const rootItems = flatList.filter((x: any) => !x.parentRef || (x.parentRef || 0).toString() === '0');
      
      const virtualRoot: TreeNode = {
        id: 'root',
        name: 'محل های جغرافیایی',
        isRoot: true,
        deletable: false,
        data: {
          code: '',
          title_en: 'Geographic Locations',
          geographicType: '',
          isActive: true,
          parentType: null,
          isParentRoot: false,
          level: 0
        },
        children: rootItems.map((item: any) => buildNode(item, null, true, 1))
      };

      setTreeData(virtualRoot);

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
        const result = findUpdatedNode(virtualRoot, currentId);
        if (result) {
          handleNodeSelect(result.node, result.level);
        } else {
          handleNodeSelect(virtualRoot, 0);
        }
      } else {
        handleNodeSelect(virtualRoot, 0);
      }
    } catch (err: any) {
      console.error(err);
      showToast('خطا در دریافت اطلاعات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();

    const unsubscribe = eventBus.on(EVENTS.DATA_CHANGED, (payload) => {
      if (payload?.entity === 'GeoLocation') {
        fetchTree();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAddNode = (node: TreeNode) => {
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
      const parentType = parentNode?.data?.geographicType || null;
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
      const emptyValues = { code: nextCode, name: '', title_en: '', geographicType: '', isActive: true };

      setFormValues(emptyValues);
      setSelectedNode(prev => prev && prev.id === node.id 
        ? { ...prev, name: '', data: { ...prev.data, ...emptyValues, parentType, isParentRoot } } 
        : prev
      );

      const updateNode = (n: TreeNode): TreeNode => {
        if (n.id === node.id) {
          return { ...n, data: { ...n.data, code: nextCode, geographicType: '', parentType, isParentRoot } };
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
    const parsedStructure = parseInt(values.geographicType) || 0;
    if (parsedStructure === 0) {
      showToast('لطفا نوع را انتخاب کنید', 'error');
      return false;
    }
    if (!values.code || values.code.trim() === '') {
      showToast('لطفا کد را وارد کنید', 'error');
      return false;
    }

    try {
      const existingId = values.geolocationId || formValues.geolocationId || node.data?.geolocationId || (/^\d+$/.test(node.id) ? parseInt(node.id, 10) : null);
      const isNew = !existingId;
      
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
        if (parentNode && parentNode.id !== 'root') {
          parentRefId = parseInt(parentNode.id, 10) || (parentNode.data?.geolocationId ? parseInt(parentNode.data.geolocationId, 10) : 0);
        }
      }

      const getTypeId = parseInt(values.geographicType) || null;

      const payload = {
        title: values.name?.trim() || '',
        titleEn: values.title_en?.trim() || values.name?.trim() || '',
        code: values.code?.trim() || '',
        geographicType: getTypeId,
        isActive: values.isActive !== undefined ? values.isActive : true,
        ...(isNew ? { parentRef: parentRefId || 0 } : {})
      };

      const targetId = existingId;
      const url = isNew ? '/api/geo-locations' : `/api/geo-locations/${targetId}`;
      const method = isNew ? 'POST' : 'PUT';

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

      const resData = await res.json().catch(() => null);
      const returnedData = resData?.data || resData;
      const createdId = returnedData?.geolocationId || returnedData?.id || existingId;

      if (createdId) {
        const strId = createdId.toString();
        selectedNodeIdRef.current = strId;
        setFormValues(prev => ({ ...prev, ...returnedData, geolocationId: createdId }));
        
        const updatedNodeObj = {
          ...node,
          id: strId,
          name: values.name?.trim() || node.name,
          data: {
            ...(node.data || {}),
            ...values,
            ...returnedData,
            geolocationId: createdId,
            code: values.code?.trim() || '',
            title_en: values.title_en?.trim() || '',
            geographicType: getTypeId
          }
        };
        setSelectedNode(updatedNodeObj);

        if (treeData) {
          const updateTreeWithNewId = (n: TreeNode): TreeNode => {
            if (n.id === node.id || n.id === strId) {
              return updatedNodeObj;
            }
            return { ...n, children: (n.children || []).map(updateTreeWithNewId) };
          };
          setTreeData(updateTreeWithNewId(treeData));
        }
      }

      showToast('عملیات با موفقیت انجام شد', 'success');
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'GeoLocation' });
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
      await fetchTree();
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

    try {
      setIsSubmitting(true);
      const isNew = !/^\d+$/.test(node.id);
      if (!isNew) {
        const res = await apiFetch(`/api/geo-locations/${parseInt(node.id, 10)}`, {
          method: 'DELETE'
        });
        if (!res.ok) {
           const errData = await res.json().catch(() => ({}));
           showToast(errData.message || `Error deleting node (${res.status})`, 'error');
           return;
        }
      }
      showToast('شاخه با موفقیت حذف شد', 'success');
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'GeoLocation' });
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

  const getGeographicTypeOptions = () => {
    if (isParentRoot || isRootSelected) {
      // Under root, only Country
      return GEOGRAPHIC_TYPES.filter(opt => opt.value === 1);
    }

    if (parentType === 1 || parentType === '1') {
      // Under Country, allow Province
      return GEOGRAPHIC_TYPES.filter(opt => opt.value === 2);
    }

    if (parentType === 2 || parentType === '2') {
      // Under Province, allow City
      return GEOGRAPHIC_TYPES.filter(opt => opt.value === 3);
    }
    
    if (parentType === 3 || parentType === '3') {
      // Under City, allow Village
      return GEOGRAPHIC_TYPES.filter(opt => opt.value === 4);
    }

    return GEOGRAPHIC_TYPES;
  };

  const fields: FieldConfig[] = [
    { name: 'geographicType', label: 'نوع', type: 'select', required: true, options: getGeographicTypeOptions(), placeholder: 'انتخاب کنید', colSpan: 1, disabled: isRootSelected },
    { name: 'code', label: 'کد', type: 'text', colSpan: 1, required: true, disabled: isRootSelected },
    { name: 'name', label: 'عنوان', type: 'text', required: true, colSpan: 1, disabled: isRootSelected },
    { name: 'title_en', label: 'عنوان (لاتین)', type: 'text', required: true, colSpan: 1, disabled: isRootSelected, onBlur: handleBlur },
    { name: 'isActive', label: 'فعال', type: 'checkbox', colSpan: 1, disabled: isRootSelected }
  ];

  const renderIcon = (node: TreeNode) => {
    if (node.isRoot) return <Globe2 className="w-4 h-4 text-blue-500" />;
    
    const structType = node.data?.geographicType?.toString();
    switch(structType) {
      case '1': return <Map className="w-4 h-4 text-purple-600" />; // Country
      case '2': return <MapPin className="w-4 h-4 text-amber-500" />; // Province
      case '3': return <Building className="w-4 h-4 text-emerald-500" />; // City
      case '4': return <Folder className="w-4 h-4 text-gray-500" />; // Village/Other
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
                key: 'geographicType', 
                placeholder: 'نوع', 
                type: 'select',
                options: (node) => {
                  const nodeParentType = node.data?.parentType;
                  const nodeIsParentRoot = node.data?.isParentRoot;
                  
                  if (nodeIsParentRoot || node.isRoot) {
                    return GEOGRAPHIC_TYPES.filter(opt => opt.value === 1);
                  }
                  if (nodeParentType === 1 || nodeParentType === '1') {
                    return GEOGRAPHIC_TYPES.filter(opt => opt.value === 2);
                  }
                  if (nodeParentType === 2 || nodeParentType === '2') {
                    return GEOGRAPHIC_TYPES.filter(opt => opt.value === 3);
                  }
                  if (nodeParentType === 3 || nodeParentType === '3') {
                    return GEOGRAPHIC_TYPES.filter(opt => opt.value === 4);
                  }

                  return GEOGRAPHIC_TYPES;
                }
              }
            ]}
            onNodeSave={async (nodeId, updatedFields) => {
              if (!treeData) return false;
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
            label="محل های جغرافیایی"
            getAddChildLabel={(level) => "افزودن زیرشاخه"}
            maxLevels={4}
          />
        ) : (
          <div className="text-sm p-4 text-slate-500 text-center">
            {loading ? 'در حال بارگذاری محل‌های جغرافیایی...' : 'موردی یافت نشد.'}
          </div>
        )}
      </div>
      <div className="w-2/3 flex flex-col h-full rounded-lg shadow-sm overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        {selectedNode ? (
          <div className="flex-1 overflow-y-auto flex flex-col relative w-full h-full min-h-0">
            <SimpleForm isReadonly={isUsed || false}
              title={selectedNode.isRoot ? "محل های جغرافیایی" : `جزئیات: ${selectedNode.name}`}
              fields={fields}
              values={formValues}
              onChange={handleFormChange}
              onSave={handleSave}
              onSaveNew={handleSaveNew}
              
              onNew={selectedNodeLevel >= 4 ? undefined : () => {
                if (selectedNodeLevel < 4 && treeRef.current) {
                  treeRef.current.addChildToSelected();
                }
              }}
              onDelete={(!selectedNode || selectedNode.isRoot || selectedNode.deletable === false) ? undefined : () => handleDeleteRequest(selectedNode)}
              isSubmitting={isSubmitting}
              showLoadingOverlay={false}
              showListButton={false}
            />
          </div>
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
    </div>
  );
}
