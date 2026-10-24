"use client";

import React, { useState, useRef, useEffect } from 'react';
import { SimpleForm, FieldConfig } from '../SimpleForm';
import { TreeView, TreeNode, TreeViewRef, MultiColumnDropdown, TextInput, FormFieldWrapper } from '../../inputs';
import { useTabs } from '../../TabsProvider';
import { useToast } from '../../ToastProvider';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { LoadingOverlay } from '../../ui/LoadingOverlay';
import { CheckBoxRightLabel } from '@/components/inputs/CheckBoxRightLabel';
import { Layers, Info, Search, Plus, Trash2, Save, X, FolderTree, Folder, File } from 'lucide-react';
import { TabCellRow, TabCellConfig, TabCellColumn } from '../TabCellRow';
import { apiFetch, safeStringify, cn } from '@/lib/utils';
import { eventBus, EVENTS } from '@/lib/events';
import { useLanguage } from '@/components/Providers';

const initialTree: TreeNode = {
  id: 'root',
  name: 'گروه بندی مشتریان',
  isRoot: true,
  deletable: false,
  data: {
    code: '0',
    name2: '',
    description: '',
    isMandatory: false,
    level: 0
  },
  children: [
    {
      id: 'cust-default-1',
      name: 'مشتریان داخلی',
      children: [],
      data: {
        code: '10',
        name2: 'Domestic Customers',
        description: '',
        isMandatory: false,
        level: 1
      }
    },
    {
      id: 'cust-default-2',
      name: 'مشتریان خارجی',
      children: [],
      data: {
        code: '20',
        name2: 'Foreign Customers',
        description: '',
        isMandatory: false,
        level: 1
      }
    }
  ]
};

export default function CustomerGroup({ tabId }: { tabId?: string }) {
  const { direction } = useLanguage();
  const isRtl = direction === 'rtl';

  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [selectedNodeLevel, setSelectedNodeLevel] = useState<number>(0);
  const selectedNodeIdRef = useRef<string | null>(null);
  const [nodeToDelete, setNodeToDelete] = useState<TreeNode | null>(null);
  const treeRef = useRef<TreeViewRef>(null);
  const { removeTab } = useTabs();
  const { showToast } = useToast();

  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [duplicateErrors, setDuplicateErrors] = useState<Record<string, string>>({});
  const duplicateCheckTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailedAccounts, setDetailedAccounts] = useState<any[]>([]);
  const [serverParties, setServerParties] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const checkFieldDuplicate = (fieldKey: string, apiField: string, val: string) => {
    if (duplicateCheckTimeouts.current[fieldKey]) {
      clearTimeout(duplicateCheckTimeouts.current[fieldKey]);
    }
    if (!val || String(val).trim() === '') {
      if (fieldKey === 'code') {
        setDuplicateErrors(prev => ({ ...prev, [fieldKey]: 'فیلد کد الزامی است و نمی‌تواند خالی باشد.' }));
      } else {
        setDuplicateErrors(prev => {
          const next = { ...prev };
          delete next[fieldKey];
          return next;
        });
      }
      return;
    }

    duplicateCheckTimeouts.current[fieldKey] = setTimeout(async () => {
      try {
        const excludeId = selectedNode?.data?.recordId || '';
        let parentRefQuery = '';
        if (apiField === 'Code') {
          const parentNode = treeRef.current?.findParentNode ? treeRef.current.findParentNode(selectedNode?.id) : null;
          const parentRecordId = parentNode?.data?.recordId || '';
          if (parentRecordId) {
            parentRefQuery = `&parentRef=${parentRecordId}`;
          }
        }
        const url = `/api/sle/customer-groups/check-duplicate?field=${apiField}&value=${encodeURIComponent(val)}&excludeId=${excludeId}${parentRefQuery}`;
        const res = await apiFetch(url);
        if (res.ok) {
          const resData = await res.json();
          if (resData && resData.success && resData.data?.isDuplicate) {
            const errMessage = apiField === 'detailedAccountCode' 
              ? 'کد تفصیلی گروه مشتری تکراری است.' 
              : 'این کد با احتساب کد سرشاخه تکراری است و قبلاً ثبت شده است.';
            setDuplicateErrors(prev => ({ ...prev, [fieldKey]: errMessage }));
          } else {
            setDuplicateErrors(prev => {
              const next = { ...prev };
              delete next[fieldKey];
              return next;
            });
          }
        }
      } catch (err) {
        console.error('Error checking duplicate:', err);
      }
    }, 300);
  };

  const handleFormChange = (key: string, val: any) => {
    setFormValues(prev => ({ ...prev, [key]: val }));
    if (key === 'code') checkFieldDuplicate('code', 'Code', val);
    if (key === 'name') checkFieldDuplicate('name', 'Title', val);
    if (key === 'name2') checkFieldDuplicate('name2', 'Title2', val);
    if (key === 'detailedAccountCode') checkFieldDuplicate('detailedAccountCode', 'detailedAccountCode', val);
  };

  const handleNodeSelect = (node: TreeNode, level: number = 0, preserveTab: boolean = false) => {
    setSelectedNode(node);
    setSelectedNodeLevel(level);
    selectedNodeIdRef.current = node.id;

    let codeVal = node.data?.code || '';
    if (!codeVal && node.id !== 'root') {
      const parentNode = treeRef.current?.findParentNode ? treeRef.current.findParentNode(node.id) : null;
      const siblings = parentNode ? (parentNode.children || []) : (treeData?.children || []);
      const maxSiblingCode = siblings.reduce((max, sib) => {
        if (sib.id === node.id) return max;
        const c = parseInt(sib.data?.code || '0', 10);
        return !isNaN(c) && c > max ? c : max;
      }, 0);
      codeVal = String(maxSiblingCode + 1);
    }

    if (node.data) {
      setFormValues({
        code: codeVal,
        name: node.name || '',
        name2: node.data.name2 || '',
        detailedAccountRef: node.data.detailedAccountRef || null,
        detailedAccountCode: node.data.detailedAccountCode || '',
        description: node.data.description || '',
        isMandatory: node.data.isMandatory || false,
        relatedParties: node.data.relatedParties || [],
      });
    } else {
      setFormValues({
        code: codeVal,
        name: node.name || '',
        name2: '',
        detailedAccountRef: null,
        detailedAccountCode: '',
        description: '',
        isMandatory: false,
        relatedParties: [],
      });
    }
  };

  const isRootSelected = selectedNode?.isRoot || selectedNode?.id === 'root';
  const isNonLeafNode = !!(selectedNode && ((selectedNode.children && selectedNode.children.length > 0) || selectedNode.isRoot));

  const relatedPartiesTabConfig: TabCellConfig[] = [
    {
      id: 'relatedParties',
      label: 'مشتریان مرتبط',
      columns: [
        { 
          key: 'party_code', 
          header: 'کد طرف حساب', 
          type: 'custom', 
          width: '200px',
          render: (row, rowIndex, onChange) => (
            <MultiColumnDropdown
              data={serverParties}
              columns={[
                { key: 'partyId', label: 'کد', width: 80 },
                { key: 'title', label: 'عنوان', width: 150 },
                { key: 'nationalCode', label: 'شناسه ملی', width: 100 }
              ]}
              value={row.party_code ? { partyId: row.party_code, title: row.party_name } : null}
              onChange={(selected) => {
                if (Array.isArray(selected)) {
                  if (selected.length === 0) {
                    row.party_name = '';
                    onChange('');
                  } else {
                    const mappedRows = selected.map(item => ({
                      party_code: item.partyId || item.id || '',
                      party_name: item.title || item.name || ''
                    }));
                    row.party_name = mappedRows[0].party_name;
                    onChange(mappedRows);
                  }
                } else if (selected) {
                  row.party_name = selected.title || selected.name || '';
                  onChange(selected.partyId || selected.id || '');
                } else {
                  row.party_name = '';
                  onChange('');
                }
              }}
              displayKey="title"
              placeholder="انتخاب طرف حساب..."
              enableMultiSelection={true}
            />
          )
        },
        { key: 'party_name', header: 'نام طرف حساب / مشتری', type: 'text', required: true, width: '300px' },
      ]
    }
  ];

  const loadTree = async (): Promise<TreeNode | null> => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/sle/customer-groups/tree');
      const data = await res.json();
      if (data && data.success && data.data) {
        setTreeData(data.data);
        return data.data;
      }
      setTreeData(initialTree);
      return initialTree;
    } catch (err) {
      console.error('Failed to load customer group tree:', err);
      showToast('خطا در دریافت درخت گروه بندی مشتریان', 'error');
      setTreeData(initialTree);
      return initialTree;
    } finally {
      setLoading(false);
    }
  };

  const loadDetailedAccounts = async () => {
    try {
      const res = await apiFetch('/api/accounting/detailed-accounts');
      const data = await res.json();
      if (Array.isArray(data)) {
        setDetailedAccounts(data);
      } else if (data && Array.isArray(data.items)) {
        setDetailedAccounts(data.items);
      } else if (data && data.data && Array.isArray(data.data)) {
        setDetailedAccounts(data.data);
      }
    } catch (err) {
      console.error('Failed to load detailed accounts:', err);
    }
  };

  const loadServerParties = async () => {
    try {
      const res = await apiFetch('/api/common/parties');
      const data = await res.json();
      if (Array.isArray(data)) {
        setServerParties(data);
      } else if (data && Array.isArray(data.items)) {
        setServerParties(data.items);
      } else if (data && data.data && Array.isArray(data.data)) {
        setServerParties(data.data);
      }
    } catch (err) {
      console.error('Failed to load parties:', err);
    }
  };

  useEffect(() => {
    loadDetailedAccounts();
    loadServerParties();
    loadTree().then(tree => {
      if (tree && tree.children && tree.children.length > 0) {
        handleNodeSelect(tree.children[0], 1);
      } else if (tree) {
        handleNodeSelect(tree, 0);
      }
    });
  }, []);

  const handleSearchChange = async (q: string) => {
    setIsSearching(true);
    try {
      const query = q.trim();
      const url = query ? `/api/sle/customer-groups/tree?search=${encodeURIComponent(query)}` : `/api/sle/customer-groups/tree`;
      const res = await apiFetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.data) {
          setTreeData(data.data);
        }
      }
    } catch (err) {
      console.error('Error searching customer group tree:', err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (selectedNode && !selectedNode.data?.recordId) {
      apiFetch('/api/common/detailed-accounts-numbering/next-code/13')
        .then(res => res.json())
        .then(data => {
          if (data && data.data) {
            handleFormChange('detailedAccountCode', data.data);
          }
        })
        .catch(console.error);

      const parentNode = treeRef.current?.findParentNode ? treeRef.current.findParentNode(selectedNode.id) : null;
      const parentRecordId = parentNode?.data?.recordId || '';
      const query = parentRecordId ? `?parentRef=${parentRecordId}` : '';
      apiFetch(`/api/sle/customer-groups/next-code${query}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.data) {
            handleFormChange('code', data.data);
          }
        })
        .catch(console.error);
    }
  }, [selectedNode]);

  const canAddChild = (parent: TreeNode): boolean => {
    if (!treeData || !parent) return false;
    return true;
  };

  const handleAddNode = (newNode: TreeNode) => {
    if (!newNode) return;
    setTreeData(prevTree => {
      if (!prevTree) return prevTree;
      return { ...prevTree };
    });
  };

  const handleDeleteRequest = (node: TreeNode) => {
    if (node.isRoot || node.id === 'root') {
      showToast('امکان حذف گره ریشه وجود ندارد.', 'error');
      return;
    }
    if (node.children && node.children.length > 0) {
      showToast('این گروه دارای زیرمجموعه است و قابل حذف نیست.', 'error');
      return;
    }
    setIsSubmitting(true);
    setNodeToDelete(node);
  };

  const executeDelete = async () => {
    if (!nodeToDelete) return;
    setIsSubmitting(true);
    try {
      const recordId = nodeToDelete.data?.recordId;
      if (recordId) {
        await apiFetch(`/api/sle/customer-groups/${recordId}`, { method: 'DELETE' });
      }
      showToast('گروه مشتری با موفقیت حذف شد.', 'success');
      setNodeToDelete(null);
      await loadTree();
    } catch (err: any) {
      showToast(err.message || 'خطا در حذف گروه مشتری', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveToServer = async (node: TreeNode, values: any): Promise<boolean> => {
    if (!values.code || String(values.code).trim() === '') {
      showToast('فیلد کد الزامی است و نمی‌تواند خالی باشد.', 'error');
      return false;
    }
    if (!values.name) {
      showToast('عنوان گروه مشتری الزامی است.', 'error');
      return false;
    }

    try {
      const recordId = node.data?.recordId;
      const parentNode = treeRef.current?.findParentNode ? treeRef.current.findParentNode(node.id) : null;
      const parentRecordId = parentNode?.data?.recordId || null;

      const payload = {
        Code: values.code,
        detailedAccountCode: values.detailedAccountCode,
        Title: values.name,
        Title2: values.name2,
        DetailedAccountRef: values.detailedAccountRef ? Number(values.detailedAccountRef) : null,
        Description: values.description,
        IsMandatory: Boolean(values.isMandatory),
        ParentRef: parentRecordId ? Number(parentRecordId) : null,
        RelatedParties: values.relatedParties || [],
      };

      const res = await apiFetch('/api/sle/customer-groups/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          CustomerGroupID: recordId ? Number(recordId) : undefined,
          ...payload,
        }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast('اطلاعات گروه مشتری با موفقیت ذخیره شد.', 'success');
        // اطلاع به فرم‌های باز (مثلاً فرم مشتری) برای تازه‌سازی لیست گروه‌ها
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'CustomerGroups' });
        if (resData.data && resData.data.CustomerGroupID) {
          node.data.recordId = resData.data.CustomerGroupID;
        }
        return true;
      } else {
        throw new Error(resData.message || 'خطا در ذخیره‌سازی اطلاعات');
      }
    } catch (err: any) {
      showToast(err.message || 'خطا در ذخیره‌سازی اطلاعات', 'error');
      return false;
    }
  };

  const handleSave = async () => {
    if (!selectedNode) return;
    setIsSubmitting(true);
    try {
      if (Object.keys(duplicateErrors).length > 0) {
        showToast('لطفاً خطاهای تکراری بودن اطلاعات را برطرف کنید.', 'error');
        setIsSubmitting(false);
        return;
      }
      const success = await saveToServer(selectedNode, formValues);
      if (success) {
        await loadTree();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNew = async () => {
    if (!selectedNode) return;
    setIsSubmitting(true);
    try {
      if (Object.keys(duplicateErrors).length > 0) {
        showToast('لطفاً خطاهای تکراری بودن اطلاعات را برطرف کنید.', 'error');
        setIsSubmitting(false);
        return;
      }
      const success = await saveToServer(selectedNode, formValues);
      if (success) {
        await loadTree();
        if (treeRef.current) {
          const parentNode = treeRef.current.findParentNode ? treeRef.current.findParentNode(selectedNode.id) : null;
          const targetParentId = parentNode ? parentNode.id : selectedNode.id;
          treeRef.current.addChildToNode(targetParentId);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getParentCodePrefix = (tree: TreeNode | null, nodeId: string): string => {
    if (!tree || !nodeId) return '';
    const findAncestors = (curr: TreeNode, targetId: string, path: TreeNode[]): TreeNode[] | null => {
      if (curr.id === targetId) return path;
      if (curr.children) {
        for (const child of curr.children) {
          const found = findAncestors(child, targetId, [...path, curr]);
          if (found) return found;
        }
      }
      return null;
    };
    const ancestors = findAncestors(tree, nodeId, []);
    if (!ancestors || ancestors.length === 0) return '';
    return ancestors.filter(a => !a.isRoot).map(a => a.data?.code || '').join('');
  };

  const parentCodePrefix = getParentCodePrefix(treeData, selectedNode?.id);

  const renderIcon = (node: TreeNode) => {
    if (node.isRoot) return <FolderTree className="w-4 h-4 text-blue-500" />;
    return node.children && node.children.length > 0 ? (
      <Folder className="w-4 h-4 text-amber-500" />
    ) : (
      <File className="w-4 h-4 text-blue-400" />
    );
  };

  // Tree View Panel component
  const treePanelContent = (
    <div className="w-1/3 flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm overflow-hidden p-2" id="CustomerGroupTree">
      {treeData ? (
        <TreeView
          ref={treeRef}
          data={treeData}
          defaultExpandAll={true}
          iconProvider={renderIcon}
          selectedNodeId={selectedNode?.id}
          showSearch={true}
          onSearchChange={handleSearchChange}
          isSearching={isSearching}
          showSortOptions={true}
          defaultSortBy="code"
          onChange={(updated) => {
            setTreeData(updated);
          }}
          onSelect={handleNodeSelect}
          onAddNode={handleAddNode}
          canAddChild={canAddChild}
          onNodeUpdate={(nodeId, updatedFields) => {
            if (selectedNode && selectedNode.id === nodeId) {
              setFormValues(prev => ({ ...prev, ...updatedFields }));
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
            { key: 'code', placeholder: 'کد', type: 'text' }
          ]}
          onNodeSave={async (nodeId, updatedFields) => {
            if (!treeData) return false;
            const findNode = (node: TreeNode, id: string): TreeNode | null => {
              if (node.id === id) return node;
              for (const child of node.children || []) {
                const found = findNode(child, id);
                if (found) return found;
              }
              return null;
            };
            const node = findNode(treeData, nodeId);
            if (node) {
              setIsSubmitting(true);
              try {
                const mergedValues = { ...(node.id === selectedNode?.id ? formValues : node.data), ...updatedFields, name: updatedFields.name ?? node.name };
                const success = await saveToServer(node, mergedValues);
                if (success) {
                  await loadTree();
                }
                return success;
              } finally {
                setIsSubmitting(false);
              }
            }
            return false;
          }}
          onDeleteNode={(nodeId) => {
            if (!treeData) return;
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
          label="ساختار گروه بندی مشتریان"
          getAddChildLabel={() => "افزودن زیرگروه"}
          renderLabel={(node) => {
            if (node.isRoot) {
              return <span className="text-[11px] font-semibold text-black dark:text-white">{node.name}</span>;
            }
            const prefix = getParentCodePrefix(treeData, node.id);
            const selfCode = node.data?.code || '';
            const fullCode = prefix + selfCode;
            return (
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-800 dark:text-gray-100">
                {fullCode && (
                  <span className="text-blue-600 dark:text-blue-400 font-mono text-[10px] bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800 shrink-0">
                    {fullCode}
                  </span>
                )}
                <span>{node.name}</span>
              </div>
            );
          }}
          maxLevels={6}
        />
      ) : (
        <div className="text-sm p-4 text-slate-500 text-center">
          {loading ? 'در حال بارگذاری ساختار...' : 'موردی یافت نشد.'}
        </div>
      )}
    </div>
  );

  // Details Form Panel component
  const detailsPanelContent = (
    <div className="flex-1 flex flex-col h-full rounded-lg shadow-sm overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 min-w-0" id="CustomerGroupDetails">
      {selectedNode ? (
        <div className="flex-1 overflow-y-auto flex flex-col relative w-full h-full min-h-0">
          <SimpleForm
            isReadonly={false}
            showLoadingOverlay={true}
            title={selectedNode.isRoot ? "گروه بندی مشتریان" : `جزئیات گروه: ${selectedNode.name}`}
            icon={<Layers className="w-4 h-4 text-blue-500" />}
            fields={[]}
            values={formValues}
            onChange={handleFormChange}
            onSave={handleSave}
            onSaveNew={handleSaveNew}
            subHeader={
              <div className="flex flex-col w-full bg-slate-50/70 dark:bg-slate-900/50 border-b border-gray-200 dark:border-gray-800">
                {/* Header Fields Section */}
                <div className="p-3.5 px-4 flex flex-col gap-2.5 border-b border-gray-200/80 dark:border-gray-800/80">
                  {/* Row 1: Code + Detailed Account */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Field 1: Code */}
                    <FormFieldWrapper 
                      label="کد (شاخه اصلی)" 
                      required 
                      labelWidth="150px"
                    >
                      <div className="flex items-center w-full rounded-md shadow-sm border border-slate-300 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500" dir="ltr">
                        {parentCodePrefix ? (
                          <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 border-r border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono text-xs font-semibold select-none shrink-0 flex items-center justify-center" title="کد سرشاخه">
                            {parentCodePrefix}
                          </div>
                        ) : null}
                        <input
                          type="text"
                          value={formValues.code || ''}
                          onChange={(e) => handleFormChange('code', e.target.value)}
                          disabled={isRootSelected}
                          className="w-full px-3 py-1 text-xs font-mono bg-transparent outline-none text-slate-800 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
                          placeholder="کد"
                        />
                      </div>
                      {duplicateErrors.code && <span className="text-[10px] text-red-500 mt-0.5 block">{duplicateErrors.code}</span>}
                    </FormFieldWrapper>

                    {/* Field 2: Detailed Account Code */}
                    <FormFieldWrapper label="کد تفصیلی" labelWidth="150px">
                      <TextInput
                        label=""
                        className="w-full px-3 py-1 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:border-blue-500 outline-none text-slate-800 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800"
                        value={formValues.detailedAccountCode || ''}
                        onChange={(val) => handleFormChange('detailedAccountCode', val)}
                        disabled={isRootSelected}
                      />
                      {duplicateErrors.detailedAccountCode && <span className="text-[10px] text-red-500 mt-0.5 block">{duplicateErrors.detailedAccountCode}</span>}
                    </FormFieldWrapper>
                  </div>

                  {/* Row 2: Title + Title (2) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <TextInput
                        label="عنوان"
                        required
                        labelWidth="150px"
                        className="w-full px-3 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:border-blue-500 outline-none text-slate-800 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800"
                        value={formValues.name || ''}
                        onChange={(val) => handleFormChange('name', val)}
                        disabled={isRootSelected}
                      />
                      {duplicateErrors.name && <span className="text-[10px] text-red-500 mt-0.5 block">{duplicateErrors.name}</span>}
                    </div>

                    <div>
                      <TextInput
                        label="عنوان (2)"
                        labelWidth="150px"
                        className="w-full px-3 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:border-blue-500 outline-none text-slate-800 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800"
                        value={formValues.name2 || ''}
                        onChange={(val) => handleFormChange('name2', val)}
                        disabled={isRootSelected}
                      />
                      {duplicateErrors.name2 && <span className="text-[10px] text-red-500 mt-0.5 block">{duplicateErrors.name2}</span>}
                    </div>
                  </div>

                  {/* Row 3: Description + Active Checkbox */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                    <TextInput
                      label="توضیحات"
                      labelWidth="150px"
                      className="w-full px-3 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:border-blue-500 outline-none text-slate-800 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800"
                      value={formValues.description || ''}
                      onChange={(val) => handleFormChange('description', val)}
                      disabled={isRootSelected}
                    />

                    <div className="flex items-center px-1">
                      <CheckBoxRightLabel 
                        label="فعال" 
                        checked={!!formValues.isMandatory} 
                        onChange={(checked) => handleFormChange('isMandatory', checked)} 
                        disabled={isRootSelected} 
                      />
                    </div>
                  </div>
                </div>

                {/* Tab Header for Related Parties */}
                <div className="flex flex-row bg-gray-50/50 dark:bg-gray-800/10 px-4 pt-1.5 gap-2">
                  <div className="px-4 py-2 text-[12px] font-semibold border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500">
                    مشتریان مرتبط
                  </div>
                </div>
              </div>
            }
            onNew={selectedNodeLevel >= 5 ? undefined : () => {
              if (!selectedNode || !treeData) return;
              if (treeRef.current) {
                treeRef.current.addChildToNode(selectedNode.id);
              }
            }}
            onDelete={(!selectedNode || selectedNode.isRoot || selectedNode.deletable === false) ? undefined : () => handleDeleteRequest(selectedNode)}
            isSubmitting={isSubmitting}
            showListButton={false}
            contentClassName="p-0 flex-1 h-full overflow-hidden min-h-0 gap-0"
          >
            <div className="flex-1 h-full min-h-0 overflow-hidden" id="RelatedPartiesTabCellContainer">
              <TabCellRow
                tabs={relatedPartiesTabConfig}
                value={formValues.relatedParties || []}
                onChange={(val) => handleFormChange('relatedParties', val)}
                hideHeader={true}
                isReadonly={isRootSelected}
              />
            </div>
          </SimpleForm>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">لطفا یک گره از ساختار گروه بندی انتخاب کنید.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-row h-full w-full gap-4 overflow-hidden p-2 relative" id="CustomerGroupFormContainer">
      {loading && <LoadingOverlay message="در حال بارگذاری..." />}

      {treePanelContent}
      {detailsPanelContent}

      <ConfirmDialog
        isOpen={!!nodeToDelete}
        title="حذف گروه"
        message={`آیا از حذف گروه [${nodeToDelete?.name || ''}] اطمینان دارید؟`}
        confirmText="بلی"
        cancelText="خیر"
        onConfirm={executeDelete}
        onCancel={() => { setNodeToDelete(null); setIsSubmitting(false); }}
      />
    </div>
  );
}

export function CustomerGroupForm(props: any) {
  return <CustomerGroup {...props} />;
}
