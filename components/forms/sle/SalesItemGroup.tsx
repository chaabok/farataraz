"use client";

import React, { useState, useRef, useEffect } from 'react';
import { SimpleForm, FieldConfig } from '../SimpleForm';
import { TreeView, TreeNode, TreeViewRef, NumberInput, MultiColumnDropdown, SingleSelectDropDown, TextInput, FormFieldWrapper, TextArea } from '../../inputs';
import { useTabs } from '../../TabsProvider';
import { useToast } from '../../ToastProvider';
import { LoadingOverlay } from '../../ui/LoadingOverlay';
import { CheckBoxRightLabel } from '@/components/inputs/CheckBoxRightLabel';
import { FolderTree, Folder, File, Layers } from 'lucide-react';
import { TabCellRow, TabCellConfig } from '../TabCellRow';
import { apiFetch, safeStringify } from '@/lib/utils';

const LOCAL_STORAGE_KEY = "sle_sales_item_group_tree";

const initialTree: TreeNode = {
  id: 'root',
  name: 'گروه بندی کالا فروش',
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
      id: 'goods-default',
      name: 'کالا',
      children: [],
      data: {
        code: '10',
        name2: 'Goods',
        description: '',
        isMandatory: false,
        level: 1
      }
    },
    {
      id: 'services-default',
      name: 'خدمت',
      children: [],
      data: {
        code: '20',
        name2: 'Services',
        description: '',
        isMandatory: false,
        level: 1
      }
    }
  ]
};

export function SalesItemGroup({ id }: { id?: number }) {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [selectedNodeLevel, setSelectedNodeLevel] = useState<number>(0);
  const selectedNodeIdRef = useRef<string | null>(null);
  const treeRef = useRef<TreeViewRef>(null);
  const { removeTab, activeTabId } = useTabs();
  const { showToast } = useToast();

  const [invSettings, setInvSettings] = useState<{
    mainBranchLength: number;
    level1BranchLength: number;
    level2BranchLength: number;
    level3BranchLength: number;
    level4BranchLength: number;
    level5BranchLength: number;
    totalProductServiceGroupLength: number;
  }>({
    mainBranchLength: 2,
    level1BranchLength: 2,
    level2BranchLength: 2,
    level3BranchLength: 0,
    level4BranchLength: 0,
    level5BranchLength: 0,
    totalProductServiceGroupLength: 6,
  });

  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [serverItems, setServerItems] = useState<any[]>([]);

  const relatedProductsTabConfig: TabCellConfig[] = [
    {
      id: 'relatedProducts',
      label: 'کالاهای مرتبط',
      columns: [
        { 
          key: 'product_code', 
          header: 'کد کالا', 
          type: 'custom', 
          width: '200px',
          render: (row, rowIndex, onChange) => (
            <MultiColumnDropdown
              data={serverItems}
              columns={[
                { key: 'id', label: 'کد کالا', width: 80 },
                { key: 'name', label: 'نام کالا', width: 120 },
                { key: 'unit', label: 'واحد', width: 80 }
              ]}
              value={row.product_code ? { id: row.product_code, name: row.product_name, unit: row.unit } : null}
              onChange={(selected) => {
                if (Array.isArray(selected)) {
                  if (selected.length === 0) {
                    row.product_name = '';
                    row.unit = '';
                    onChange('');
                  } else {
                    const mappedRows = selected.map(item => ({
                      product_code: item.id || item.product_code || '',
                      product_name: item.name || item.product_name || '',
                      unit: item.unit || ''
                    }));
                    row.product_name = mappedRows[0].product_name;
                    row.unit = mappedRows[0].unit;
                    onChange(mappedRows);
                  }
                } else if (selected) {
                  row.product_name = selected.name || selected.product_name || '';
                  row.unit = selected.unit || '';
                  onChange(selected.id || selected.product_code || '');
                } else {
                  row.product_name = '';
                  row.unit = '';
                  onChange('');
                }
              }}
              displayKey="id"
              placeholder="انتخاب کد کالا..."
              enableMultiSelection={true}
            />
          )
        },
        { key: 'product_name', header: 'نام کالا', type: 'text', required: true, width: '250px' },
        { 
          key: 'unit', 
          header: 'واحد سنجش', 
          type: 'custom', 
          width: '120px',
          render: (row) => (
            <div className="w-full h-full flex items-center px-2 text-[11px] text-gray-500 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed">
              {row.unit || ''}
            </div>
          )
        },
      ]
    }
  ];

  const handleAddNode = (parentNode: TreeNode) => {
    const parentCode = parentNode.data?.code || '';
    const childLevel = getNodeLevel(treeData, parentNode.id) + 1;
    const levelSetting = getLevelSetting(childLevel, invSettings);
    const length = levelSetting.length || 2;
    
    const existingChildren = parentNode.children || [];
    let nextSeq = existingChildren.length + 1;
    let newCode = String(nextSeq).padStart(length, '0');
    
    return {
      name: 'گروه جدید',
      code: newCode,
      data: {
        code: newCode,
        name2: '',
        description: '',
        isMandatory: false,
        level: childLevel,
        relatedProducts: [],
      }
    };
  };

  const canAddChild = (node: TreeNode) => {
    const lvl = getNodeLevel(treeData, node.id);
    return lvl < 5;
  };

  const getNodeLevel = (tree: TreeNode | null, nodeId: string, currentLevel: number = 0): number => {
    if (!tree) return -1;
    if (tree.id === nodeId) return currentLevel;
    if (tree.children) {
      for (const child of tree.children) {
        const found = getNodeLevel(child, nodeId, currentLevel + 1);
        if (found !== -1) return found;
      }
    }
    return -1;
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

  const getLevelSetting = (level: number, settings: typeof invSettings): { length: number; name: string } => {
    switch (level) {
      case 1: return { length: settings.mainBranchLength, name: 'شاخه اصلی' };
      case 2: return { length: settings.level1BranchLength, name: 'شاخه سطح اول' };
      case 3: return { length: settings.level2BranchLength, name: 'شاخه سطح دوم' };
      case 4: return { length: settings.level3BranchLength, name: 'شاخه سطح سوم' };
      case 5: return { length: settings.level4BranchLength, name: 'شاخه سطح چهارم' };
      case 6: return { length: settings.level5BranchLength, name: 'شاخه سطح پنجم' };
      default: return { length: 0, name: `سطح ${level}` };
    }
  };

  const saveTreeToStorage = async (updatedTree: TreeNode): Promise<TreeNode | null> => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTree));
      const response = await apiFetch('/api/sle/sales-item-groups/tree/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ treeData: updatedTree }),
      });
      if (response.ok) {
        const resData = await response.json();
        if (resData && resData.data) {
          setTreeData(resData.data);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resData.data));
          return resData.data;
        }
      }
    } catch (err) {
      console.error('Error saving tree:', err);
    }
    return null;
  };

  const handleNodeSelect = (node: TreeNode, level: number = 0) => {
    setSelectedNode(node);
    setSelectedNodeLevel(level);
    selectedNodeIdRef.current = node.id;
    setFormValues({
      name: node.name,
      code: node.data?.code ?? '',
      name2: node.data?.name2 ?? '',
      description: node.data?.description ?? '',
      isMandatory: node.data?.isMandatory ?? false,
      relatedProducts: node.data?.relatedProducts ?? [],
    });
  };

  const fetchTree = async (): Promise<TreeNode | null> => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/sle/sales-item-groups/tree');
      if (response.ok) {
        const resData = await response.json();
        if (resData && resData.data && resData.data.name) {
          setTreeData(resData.data);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resData.data));
          return resData.data;
        }
      }
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      let treeToUse = stored ? JSON.parse(stored) : initialTree;
      setTreeData(treeToUse);
      await saveTreeToStorage(treeToUse);
      return treeToUse;
    } catch (err) {
      console.error("Error loading tree data:", err);
      showToast("خطا در بارگذاری اطلاعات گروه‌بندی کالا فروش", "error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const [isSearching, setIsSearching] = useState(false);

  const handleSearchChange = async (query: string) => {
    setIsSearching(true);
    try {
      const q = query.trim();
      const url = q ? `/api/sle/sales-item-groups/tree?search=${encodeURIComponent(q)}` : `/api/sle/sales-item-groups/tree`;
      const res = await apiFetch(url);
      if (res.ok) {
        const resData = await res.json();
        if (resData && resData.data) {
          setTreeData(resData.data);
        }
      }
    } catch (err) {
      console.error('Error searching tree:', err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchTree();
    apiFetch('/api/common/base-settings/tab/3')
      .then(res => res.json())
      .then(data => {
        const item = data.data || data;
        if (item) {
          setInvSettings({
            mainBranchLength: Number(item.MainBranchLength ?? item.mainBranchLength ?? 2),
            level1BranchLength: Number(item.Level1BranchLength ?? item.level1BranchLength ?? 2),
            level2BranchLength: Number(item.Level2BranchLength ?? item.level2BranchLength ?? 2),
            level3BranchLength: Number(item.Level3BranchLength ?? item.level3BranchLength ?? 0),
            level4BranchLength: Number(item.Level4BranchLength ?? item.level4BranchLength ?? 0),
            level5BranchLength: Number(item.Level5BranchLength ?? item.level5BranchLength ?? 0),
            totalProductServiceGroupLength: Number(item.TotalProductServiceGroupLength ?? item.totalProductServiceGroupLength ?? 6),
          });
        }
      })
      .catch(() => {});

    apiFetch('/api/inv/items/dropdown')
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.data || []);
        setServerItems(list.map((i: any) => ({
          id: String(i.product_code || i.ItemCode || i.id || ''),
          name: i.product_name || i.ItemName || i.name || '',
          unit: i.unit || i.MeasurementUnitName || ''
        })));
      })
      .catch(() => {});
  }, []);

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
          return { ...n, children: (n.children || []).map(updateNode) };
        };
        return updateNode(prevTree);
      });
      setSelectedNode((prev: any) => prev ? {
        ...prev,
        name: name === 'name' ? value : prev.name,
        data: { ...prev.data, [name]: value }
      } : prev);
    }
  };

  const saveToServer = async (node: TreeNode, values: any): Promise<boolean> => {
    if (!values.name || values.name.trim() === '') {
      showToast('لطفا عنوان را وارد کنید', 'error');
      return false;
    }
    if (!values.code || String(values.code).trim() === '') {
      showToast('لطفا کد را وارد کنید', 'error');
      return false;
    }

    try {
      const updatedTree = getUpdatedTreeWithCurrentForm(treeData!);
      if (!updatedTree) return false;
      const res = await apiFetch('/api/sle/sales-item-groups/tree/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ treeData: updatedTree }),
      });
      if (res.ok) {
        showToast('اطلاعات با موفقیت ذخیره گردید.', 'success');
        return true;
      }
      throw new Error('خطا در ذخیره اطلاعات');
    } catch (err: any) {
      showToast(err.message || 'خطا در ذخیره اطلاعات', 'error');
      return false;
    }
  };

  const getUpdatedTreeWithCurrentForm = (tree: TreeNode): TreeNode => {
    if (!selectedNode) return tree;
    const updateNode = (n: TreeNode): TreeNode => {
      if (n.id === selectedNode.id) {
        return {
          ...n,
          name: formValues.name || n.name,
          data: { ...n.data, ...formValues }
        };
      }
      return { ...n, children: (n.children || []).map(updateNode) };
    };
    return updateNode(tree);
  };

  const handleSave = async () => {
    if (!selectedNode || selectedNode.isRoot || !treeData) return;
    setIsSubmitting(true);
    await saveToServer(selectedNode, formValues);
    await fetchTree();
    setIsSubmitting(false);
  };

  const handleSaveNew = async () => {
    if (!selectedNode || selectedNode.isRoot || !treeData) return;
    setIsSubmitting(true);
    const success = await saveToServer(selectedNode, formValues);
    if (success && treeRef.current) {
      await fetchTree();
      treeRef.current.addChildToNode(selectedNode.id);
    }
    setIsSubmitting(false);
  };

  const isRootSelected = selectedNode?.isRoot ?? false;
  const currentNodeLevel = selectedNode && treeData ? getNodeLevel(treeData, selectedNode.id) : 0;
  const currentLevelInfo = getLevelSetting(currentNodeLevel, invSettings);
  const parentCodePrefix = selectedNode && treeData ? getParentCodePrefix(treeData, selectedNode.id) : '';

  return (
    <div className="flex flex-row h-full w-full gap-4 overflow-hidden p-2 relative" id="SalesItemGroupFormContainer">
      <LoadingOverlay visible={isSubmitting || (!treeData && loading)} message="لطفا منتظر بمانید..." />

      <div className="w-1/3 flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm overflow-hidden p-2">
        {treeData ? (
          <TreeView
            ref={treeRef}
            data={treeData}
            defaultExpandAll={true}
            iconProvider={(node) => node.isRoot ? <FolderTree className="w-4 h-4 text-indigo-500" /> : (node.children?.length ? <Folder className="w-4 h-4 text-amber-500" /> : <File className="w-4 h-4 text-blue-400" />)}
            selectedNodeId={selectedNode?.id}
            showSearch={true}
            onSearchChange={handleSearchChange}
            isSearching={isSearching}
            showSortOptions={true}
            defaultSortBy="code"
            onChange={(updated) => setTreeData(updated)}
            onSelect={handleNodeSelect}
            onAddNode={handleAddNode}
            canAddChild={canAddChild}
            onNodeUpdate={(nodeId, updatedFields) => {
              if (selectedNode && selectedNode.id === nodeId) {
                setFormValues(prev => ({ ...prev, ...updatedFields }));
                setSelectedNode((prev: any) => prev ? { ...prev, name: updatedFields.name ?? prev.name, data: { ...prev.data, ...updatedFields } } : prev);
              }
            }}
            nodeFields={[{ key: 'name', placeholder: 'عنوان', type: 'text' }, { key: 'code', placeholder: 'کد', type: 'text' }]}
            onNodeSave={async (nodeId, updatedFields) => {
              const success = await saveToServer(selectedNode, formValues);
              if (success) await fetchTree();
              return success;
            }}
            onDeleteNode={async (nodeId) => {
              setTreeData(prev => {
                const remove = (n: TreeNode): TreeNode => ({
                  ...n,
                  children: (n.children || []).filter(c => c.id !== nodeId).map(remove)
                });
                return prev ? remove(prev) : prev;
              });
              await saveTreeToStorage(treeData!);
              showToast('شاخه حذف شد', 'success');
            }}
            label="ساختار گروه‌بندی کالا فروش"
            getAddChildLabel={() => "افزودن زیرگروه"}
            renderLabel={(node) => {
              if (node.isRoot) return <span className="text-[11px] font-semibold">{node.name}</span>;
              const prefix = getParentCodePrefix(treeData, node.id);
              const selfCode = node.data?.code || '';
              return (
                <div className="flex items-center gap-1.5 text-[11px] font-medium">
                  <span className="text-indigo-600 dark:text-indigo-300 font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shrink-0">
                    {prefix + selfCode}
                  </span>
                  <span>{node.name}</span>
                </div>
              );
            }}
            maxLevels={6}
          />
        ) : (
          <div className="text-sm p-4 text-slate-500 text-center">بارگذاری...</div>
        )}
      </div>

      <div className="w-2/3 flex flex-col h-full rounded-lg shadow-sm overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        {selectedNode ? (
          <div className="flex-1 overflow-hidden flex flex-col relative w-full min-h-0">
            <SimpleForm
              isReadonly={false}
              showLoadingOverlay={false}
              contentClassName="p-0 overflow-hidden min-h-0"
              title={selectedNode.isRoot ? "گروه بندی کالا فروش" : `جزئیات گروه: ${selectedNode.name}`}
              icon={<Layers className="w-4 h-4 text-indigo-500" />}
              fields={[]}
              values={formValues}
              onChange={handleFormChange}
              onSave={handleSave}
              onSaveNew={handleSaveNew}
              subHeader={
                <div className="flex flex-col w-full bg-slate-50/70 dark:bg-slate-900/50 border-b border-gray-200 dark:border-gray-800">
                  <div className="p-3.5 px-4 flex flex-col gap-2.5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FormFieldWrapper label={currentLevelInfo.length > 0 ? `کد (${currentLevelInfo.name})` : 'کد'} required labelWidth="150px">
                        <div className="flex items-center w-full h-[25px] rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden bg-gray-50/50 dark:bg-slate-800/50" dir="ltr">
                          {parentCodePrefix && (
                            <div className="px-2 py-1 bg-slate-100 dark:bg-slate-900/80 border-r border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono text-[11px] select-none flex items-center">
                              {parentCodePrefix}
                            </div>
                          )}
                          <input
                            type="text"
                            value={formValues.code || ''}
                            onChange={(e) => handleFormChange('code', e.target.value)}
                            disabled={isRootSelected}
                            className="w-full px-3 h-full text-[11px] font-mono bg-transparent outline-none text-slate-800 dark:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                      </FormFieldWrapper>
                      <FormFieldWrapper label="عنوان" required labelWidth="150px">
                        <TextInput value={formValues.name || ''} onChange={(val) => handleFormChange('name', val)} disabled={isRootSelected} />
                      </FormFieldWrapper>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FormFieldWrapper label="عنوان (2)" labelWidth="150px">
                        <TextInput value={formValues.name2 || ''} onChange={(val) => handleFormChange('name2', val)} disabled={isRootSelected} />
                      </FormFieldWrapper>
                      <FormFieldWrapper label="فعال" labelWidth="150px">
                        <CheckBoxRightLabel label="فعال" checked={!!formValues.isMandatory} onChange={(checked) => handleFormChange('isMandatory', checked)} disabled={isRootSelected} />
                      </FormFieldWrapper>
                    </div>
                    <FormFieldWrapper label="توضیحات" labelWidth="150px">
                      <TextArea value={formValues.description || ''} onChange={(val) => handleFormChange('description', val)} disabled={isRootSelected} rows={2} />
                    </FormFieldWrapper>
                  </div>
                </div>
              }
            >
              <div className="p-0 flex-1 flex flex-col min-h-0">
                <TabCellRow
                  tabs={relatedProductsTabConfig}
                  value={formValues.relatedProducts || []}
                  onChange={(val) => handleFormChange('relatedProducts', val)}
                  isReadonly={isRootSelected}
                />
              </div>
            </SimpleForm>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            لطفاً یک شاخه از درختواره انتخاب کنید.
          </div>
        )}
      </div>
    </div>
  );
}

export default SalesItemGroup;
