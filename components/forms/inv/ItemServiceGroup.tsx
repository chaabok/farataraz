"use client";

import React, { useState, useRef, useEffect } from 'react';
import { SimpleForm, FieldConfig } from '../SimpleForm';
import { TreeView, TreeNode, TreeViewRef, NumberInput, MultiSelect, MultiColumnDropdown, SingleSelectDropDown, TextInput, FormFieldWrapper, TextArea } from '../../inputs';
import { useTabs } from '../../TabsProvider';
import { useToast } from '../../ToastProvider';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { LoadingOverlay } from '../../ui/LoadingOverlay';
import { CheckBoxRightLabel } from '@/components/inputs/CheckBoxRightLabel';
import { FolderTree, Folder, File, Layers, Info } from 'lucide-react';
import { TabCellRow, TabCellConfig, TabCellColumn } from '../TabCellRow';
import { apiFetch, safeStringify } from '@/lib/utils';

export enum FieldTypeEnum {
  ShortText = 1,
  Integer = 2,
  Decimal = 3,
  Date = 4,
  Time = 5,
  LongText = 6,
  Boolean = 7,
  SingleSelect = 8,
  MultiSelect = 9,
  Color = 10,
}

export const FieldTypeOptions = [
  { id: FieldTypeEnum.ShortText, title: 'متن کوتاه' },
  { id: FieldTypeEnum.Integer, title: 'عدد صحیح' },
  { id: FieldTypeEnum.Decimal, title: 'عدد اعشاری' },
  { id: FieldTypeEnum.Date, title: 'تاریخ' },
  { id: FieldTypeEnum.Time, title: 'ساعت' },
  { id: FieldTypeEnum.LongText, title: 'متن بلند' },
  { id: FieldTypeEnum.Boolean, title: 'بولیین' },
  { id: FieldTypeEnum.SingleSelect, title: 'تک انتخابی' },
  { id: FieldTypeEnum.MultiSelect, title: 'چند انتخابی' },
  { id: FieldTypeEnum.Color, title: 'رنگ' },
];

export function normalizeFieldType(type: any): number {
  if (typeof type === 'number' && type >= 1 && type <= 10) return type;
  if (typeof type === 'string') {
    const parsed = parseInt(type, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 10) return parsed;
    if (type === 'text' || type === 'short_text') return FieldTypeEnum.ShortText;
    if (type === 'number' || type === 'integer' || type === 'int') return FieldTypeEnum.Integer;
    if (type === 'decimal' || type === 'float') return FieldTypeEnum.Decimal;
    if (type === 'date') return FieldTypeEnum.Date;
    if (type === 'time') return FieldTypeEnum.Time;
    if (type === 'textarea' || type === 'long_text') return FieldTypeEnum.LongText;
    if (type === 'checkbox' || type === 'boolean') return FieldTypeEnum.Boolean;
    if (type === 'select' || type === 'single_select') return FieldTypeEnum.SingleSelect;
    if (type === 'multi_select') return FieldTypeEnum.MultiSelect;
    if (type === 'color') return FieldTypeEnum.Color;
  }
  return FieldTypeEnum.ShortText;
}

const LOCAL_STORAGE_KEY = "inv_product_service_category_tree";

const initialTree: TreeNode = {
  id: 'root',
  name: 'گروه بندی کالا انبار',
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

export default function ItemServiceGroup() {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [selectedNodeLevel, setSelectedNodeLevel] = useState<number>(0);
  const selectedNodeIdRef = useRef<string | null>(null);
  const [nodeToDelete, setNodeToDelete] = useState<TreeNode | null>(null);
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
  const [activeDetailsTab, setActiveDetailsTab] = useState<'related' | 'extra'>('related');
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

  const isNonLeafNode = !!(selectedNode && ((selectedNode.children && selectedNode.children.length > 0) || selectedNode.isRoot));

  const fieldTypeDropdownColumns = [
    { key: 'title', label: 'نوع فیلد' }
  ];

  const additionalFieldsList = Array.isArray(formValues.additionalFields) ? formValues.additionalFields : [];
  const hasSelectTypeField = additionalFieldsList.some((row: any) => {
    const type = normalizeFieldType(row.field_type);
    return type === FieldTypeEnum.SingleSelect || type === FieldTypeEnum.MultiSelect;
  });

  const additionalFieldsColumns: TabCellColumn[] = [
    {
      key: 'RowNo',
      header: 'ردیف',
      width: '60px',
      type: 'custom',
      render: (_row: any, rowIndex: number) => (
        <div className="text-center font-mono text-[11px] py-1 select-none text-slate-600 dark:text-slate-300">
          {rowIndex + 1}
        </div>
      ),
    },
    {
      key: 'field_title',
      header: 'عنوان',
      type: 'text',
      required: true,
      width: '200px',
    },
    {
      key: 'field_title2',
      header: 'عنوان (2)',
      type: 'text',
      required: false,
      width: '200px',
    },
    {
      key: 'is_required',
      header: 'اجباری',
      type: 'custom',
      width: '90px',
      render: (row: any, _rowIndex: number, onChangeRow: (val: any) => void) => (
        <div className="flex items-center justify-center w-full h-full">
          <input
            type="checkbox"
            checked={!!row.is_required}
            disabled={isNonLeafNode || isRootSelected}
            onChange={(e) => onChangeRow(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
          />
        </div>
      ),
    },
    {
      key: 'field_type',
      header: 'نوع فیلد',
      type: 'custom',
      width: '170px',
      render: (row: any, _rowIndex: number, onChangeRow: (val: any) => void) => {
        const currentType = normalizeFieldType(row.field_type);
        const selectedOption = FieldTypeOptions.find(o => o.id === currentType) || FieldTypeOptions[0];

        return (
          <SingleSelectDropDown
            data={FieldTypeOptions}
            columns={fieldTypeDropdownColumns}
            value={selectedOption}
            displayKey="title"
            disabled={isNonLeafNode || isRootSelected}
            onChange={(selected) => {
              const newTypeId = selected ? Number(selected.id) : FieldTypeEnum.ShortText;
              onChangeRow(newTypeId);
            }}
          />
        );
      },
    },
  ];

  if (hasSelectTypeField) {
    additionalFieldsColumns.push({
      key: 'options',
      header: 'تعریف انتخاب‌ها (گزینه‌ها)',
      type: 'custom',
      width: '280px',
      render: (row: any, _rowIndex: number, onChangeRow: (val: any) => void) => {
        const currentType = normalizeFieldType(row.field_type);
        const isSelectType = currentType === FieldTypeEnum.SingleSelect || currentType === FieldTypeEnum.MultiSelect;

        if (!isSelectType) {
          return (
            <div className="w-full h-full flex items-center px-2 text-[11px] text-gray-400 bg-gray-50/50 dark:bg-gray-800/30 select-none">
              -
            </div>
          );
        }

        return (
          <TextInput
            value={row.options || ''}
            onChange={(val) => onChangeRow(val)}
            placeholder="گزینه‌ها را با کاما جدا کنید (مثال: قرمز, آبی, سبز)"
            disabled={isNonLeafNode || isRootSelected}
          />
        );
      },
    });
  }

  const additionalFieldsTabConfig: TabCellConfig[] = [
    {
      id: 'additionalFields',
      label: 'فیلدهای اضافی',
      columns: additionalFieldsColumns,
    },
  ];

  const saveTreeToStorage = async (updatedTree: TreeNode): Promise<TreeNode | null> => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTree));
      const response = await apiFetch('/api/inv/item-service-groups/tree/save', {
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
      } else {
        const errText = await response.text();
        console.error('API Error saving tree:', errText);
        throw new Error(errText);
      }
    } catch (err) {
      console.error('Error saving tree to backend API:', err);
      throw err;
    }
    return null;
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
      if (curr.id === targetId) {
        return path;
      }
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

    return ancestors
      .filter(a => !a.isRoot)
      .map(a => a.data?.code || '')
      .join('');
  };

  const getLevelSetting = (level: number, settings: typeof invSettings): { length: number; name: string } => {
    switch (level) {
      case 1:
        return { length: settings.mainBranchLength, name: 'شاخه اصلی' };
      case 2:
        return { length: settings.level1BranchLength, name: 'شاخه سطح اول' };
      case 3:
        return { length: settings.level2BranchLength, name: 'شاخه سطح دوم' };
      case 4:
        return { length: settings.level3BranchLength, name: 'شاخه سطح سوم' };
      case 5:
        return { length: settings.level4BranchLength, name: 'شاخه سطح چهارم' };
      case 6:
        return { length: settings.level5BranchLength, name: 'شاخه سطح پنجم' };
      default:
        return { length: 0, name: `سطح ${level}` };
    }
  };

  const validateCodeLength = (nodeId: string, codeValue: string): boolean => {
    if (!treeData) return true;
    const level = getNodeLevel(treeData, nodeId);
    if (level <= 0) return true; // Root level has no code length validation

    const levelInfo = getLevelSetting(level, invSettings);
    if (levelInfo.length === 0) {
      showToast(`بر اساس تنظیمات پایه، تعریف شاخه در ${levelInfo.name} غیرفعال است (طول کد صفر می‌باشد).`, 'error');
      return false;
    }

    const cleanCode = String(codeValue || '').trim();
    if (cleanCode.length !== levelInfo.length) {
      showToast(`طول کد برای ${levelInfo.name} باید دقیقا ${levelInfo.length} رقم باشد.`, 'error');
      return false;
    }

    return true;
  };

  const handleNodeSelect = (node: TreeNode, level: number = 0, preserveTab: boolean = false) => {
    setSelectedNode(node);
    setSelectedNodeLevel(level);
    const isSameNode = selectedNodeIdRef.current === node.id;
    selectedNodeIdRef.current = node.id;
    if (!preserveTab && !isSameNode) {
      setActiveDetailsTab('related'); // Reset to default "related" tab when a different node is opened
    }
    setFormValues({
      name: node.name,
      code: node.data?.code ?? '',
      name2: node.data?.name2 ?? '',
      detailedCode: node.data?.detailedCode ?? '',
      description: node.data?.description ?? '',
      isMandatory: node.data?.isMandatory ?? false,
      relatedProducts: node.data?.relatedProducts ?? [],
      additionalFields: (node.data?.additionalFields ?? []).map((f: any) => ({
        ...f,
        is_required: Boolean(f.is_required),
      })),
    });
  };

  // Fetch tree data from server or fallback to local storage
  const fetchTree = async (): Promise<TreeNode | null> => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/inv/item-service-groups/tree');
      if (response.ok) {
        const resData = await response.json();
        if (resData && resData.data && resData.data.name) {
          setTreeData(resData.data);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resData.data));
          return resData.data;
        }
      }

      // Fallback or Initial seed if backend database is empty
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      let treeToUse = initialTree;
      if (stored) {
        try {
          treeToUse = JSON.parse(stored);
        } catch (e) {
          treeToUse = initialTree;
        }
      }
      setTreeData(treeToUse);
      await saveTreeToStorage(treeToUse);
      return treeToUse;
    } catch (err) {
      console.error("Error loading tree data:", err);
      showToast("خطا در بارگذاری اطلاعات گروه بندی کالا انبار", "error");
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
      const url = q ? `/api/inv/item-service-groups/tree?search=${encodeURIComponent(q)}` : `/api/inv/item-service-groups/tree`;
      const res = await apiFetch(url);
      if (res.ok) {
        const resData = await res.json();
        if (resData && resData.data) {
          setTreeData(resData.data);
        }
      }
    } catch (err) {
      console.error('Error searching tree:', err);
      showToast('خطا در جستجوی اطلاعات درختواره', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  // Load tree data and dropdown items on mount
  useEffect(() => {
    const fetchServerItems = async () => {
      try {
        const res = await apiFetch('/api/inv/items/dropdown');
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) {
            setServerItems(list);
          }
        }
      } catch (err) {
        console.error('Error fetching server items for dropdown:', err);
      }
    };

    const fetchInvSettings = async () => {
      try {
        const res = await apiFetch('/api/common/base-settings/tab/3');
        if (res.ok) {
          const result = await res.json();
          const data = result.data || {};
          setInvSettings({
            mainBranchLength: parseInt(data.mainBranchLength ?? '2', 10) || 2,
            level1BranchLength: parseInt(data.level1BranchLength ?? '2', 10) || 2,
            level2BranchLength: parseInt(data.level2BranchLength ?? '2', 10) || 2,
            level3BranchLength: parseInt(data.level3BranchLength ?? '0', 10) || 0,
            level4BranchLength: parseInt(data.level4BranchLength ?? '0', 10) || 0,
            level5BranchLength: parseInt(data.level5BranchLength ?? '0', 10) || 0,
            totalProductServiceGroupLength: parseInt(data.totalProductServiceGroupLength ?? '6', 10) || 6,
          });
        }
      } catch (err) {
        console.error('Error loading inventory base settings:', err);
      }
    };

    fetchServerItems();
    fetchInvSettings();
    fetchTree().then((treeToUse) => {
      if (treeToUse) {
        if (treeToUse.children && treeToUse.children.length > 0) {
          handleNodeSelect(treeToUse.children[0], 1);
        } else {
          handleNodeSelect(treeToUse, 0);
        }
      }
    });
  }, []);

  const findParentNode = (root: TreeNode | null, childId: string): TreeNode | null => {
    if (!root) return null;
    if (root.children && root.children.some(c => c.id === childId)) return root;
    for (const child of root.children || []) {
      const found = findParentNode(child, childId);
      if (found) return found;
    }
    return null;
  };

  const canAddChild = (parent: TreeNode): boolean => {
    if (!treeData || !parent) return false;

    if (parent.data?.additionalFields && Array.isArray(parent.data.additionalFields) && parent.data.additionalFields.length > 0) {
      showToast("برای شاخه‌ای که دارای فیلدهای اضافی است امکان تعریف زیرگروه وجود ندارد.", "error");
      return false;
    }

    const parentLevel = getNodeLevel(treeData, parent.id);
    const childLevel = parentLevel + 1;
    const childInfo = getLevelSetting(childLevel, invSettings);

    if (childInfo.length === 0) {
      showToast(`بر اساس تنظیمات پایه، امکان تعریف زیرگروه وجود ندارد (طول کد صفر می‌باشد).`, "error");
      return false;
    }

    return true;
  };

  const handleAddNode = (newNode: TreeNode) => {
    if (!newNode) return;

    setTreeData(prevTree => {
      if (!prevTree) return prevTree;

      const parent = findParentNode(prevTree, newNode.id);
      if (!parent) return prevTree;

      const parentLevel = getNodeLevel(prevTree, parent.id);
      const childLevel = parentLevel + 1;
      const childInfo = getLevelSetting(childLevel, invSettings);

      if (childInfo.length === 0) {
        showToast(`بر اساس تنظیمات پایه، امکان تعریف زیرگروه وجود ندارد (طول کد صفر می‌باشد).`, "error");
        const removeNode = (n: TreeNode): TreeNode => {
          return {
            ...n,
            children: (n.children || []).filter(c => c.id !== newNode.id).map(removeNode)
          };
        };
        return removeNode(prevTree);
      }

      let maxCode = 0;
      const siblings = parent.children || [];
      siblings.forEach(sib => {
        if (sib.id !== newNode.id && sib.data?.code) {
          const parsedCode = parseInt(sib.data.code, 10);
          if (!isNaN(parsedCode) && parsedCode > maxCode) {
            maxCode = parsedCode;
          }
        }
      });

      const nextVal = maxCode === 0 ? 1 : maxCode + 1;
      const nextCode = nextVal.toString().padStart(childInfo.length, '0');

      const initialData = {
        code: nextCode,
        name2: '',
        detailedCode: '',
        description: '',
        isMandatory: false,
        level: childLevel,
        relatedProducts: [],
        additionalFields: []
      };

      const updatedNode: TreeNode = {
        ...newNode,
        name: 'گروه جدید',
        data: initialData
      };

      const updateNodeInTree = (n: TreeNode): TreeNode => {
        if (n.id === newNode.id) {
          return updatedNode;
        }
        return {
          ...n,
          children: (n.children || []).map(updateNodeInTree)
        };
      };

      const updatedTree = updateNodeInTree(prevTree);

      setTimeout(() => {
        handleNodeSelect(updatedNode, childLevel);
      }, 0);

      return updatedTree;
    });
  };

  const handleFormChange = (name: string, value: any) => {
    let finalValue = value;
    if (name === 'code' && selectedNode && treeData) {
      const level = getNodeLevel(treeData, selectedNode.id);
      const levelInfo = getLevelSetting(level, invSettings);
      if (levelInfo.length > 0 && typeof finalValue === 'string') {
        if (finalValue.length > levelInfo.length) {
          finalValue = finalValue.slice(0, levelInfo.length);
        }
      }
    }

    setFormValues(prev => ({ ...prev, [name]: finalValue }));
    
    if (selectedNode) {
      setTreeData(prevTree => {
        if (!prevTree) return prevTree;
        const updateNode = (n: TreeNode): TreeNode => {
          if (n.id === selectedNode.id) {
            const newData = { ...n.data, [name]: finalValue };
            return { ...n, name: name === 'name' ? finalValue : n.name, data: newData };
          }
          return { ...n, children: (n.children || []).map(updateNode) };
        };
        return updateNode(prevTree);
      });
      setSelectedNode(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          name: name === 'name' ? finalValue : prev.name,
          data: { ...prev.data, [name]: finalValue }
        };
      });
    }
  };

  const syncSelectedNodeWithTree = (savedTree: TreeNode | null, currentId: string, currentCode?: string, currentName?: string) => {
    if (!savedTree) return;
    const findNode = (n: TreeNode): TreeNode | null => {
      if (n.id === currentId) return n;
      if (currentCode && String(n.data?.code) === String(currentCode) && (!currentName || n.name === currentName)) return n;
      for (const child of n.children || []) {
        const found = findNode(child);
        if (found) return found;
      }
      return null;
    };
    const foundNode = findNode(savedTree);
    if (foundNode) {
      const level = getNodeLevel(savedTree, foundNode.id);
      handleNodeSelect(foundNode, level, true);
    }
  };

  const getUpdatedTreeWithCurrentForm = (tree: TreeNode): TreeNode => {
    if (!selectedNode) return tree;
    const updateNode = (n: TreeNode): TreeNode => {
      if (n.id === selectedNode.id) {
        return {
          ...n,
          name: formValues.name || n.name,
          data: {
            ...n.data,
            ...formValues,
          }
        };
      }
      return { ...n, children: (n.children || []).map(updateNode) };
    };
    return updateNode(tree);
  };

  const checkDuplicateLocal = (node: TreeNode, values: any): boolean => {
    if (!treeData) return true;

    const findParent = (curr: TreeNode, childId: string): TreeNode | null => {
      if ((curr.children || []).some(c => c.id === childId)) return curr;
      for (const c of curr.children || []) {
        const found = findParent(c, childId);
        if (found) return found;
      }
      return null;
    };

    const parentNode = findParent(treeData, node.id);
    if (!parentNode) return true;

    const siblings = (parentNode.children || []).filter(c => c.id !== node.id);

    const normCode = String(values.code || '').trim().toLowerCase();
    const normName = String(values.name || '').trim().toLowerCase();
    const normName2 = String(values.name2 || '').trim().toLowerCase();

    for (const sib of siblings) {
      const sibCode = String(sib.data?.code || sib.code || '').trim().toLowerCase();
      const sibName = String(sib.name || sib.data?.name || '').trim().toLowerCase();
      const sibName2 = String(sib.data?.name2 || '').trim().toLowerCase();

      if (normCode && sibCode === normCode) {
        showToast('کد گروه در این سرشاخه تکراری است.', 'error');
        return false;
      }
      if (normName && sibName === normName) {
        showToast('عنوان گروه در این سرشاخه تکراری است.', 'error');
        return false;
      }
      if (normName2 && sibName2 && sibName2 === normName2) {
        showToast('عنوان (2) گروه در این سرشاخه تکراری است.', 'error');
        return false;
      }
    }

    return true;
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

    if (!validateCodeLength(node.id, values.code)) {
      return false;
    }

    if (!checkDuplicateLocal(node, values)) {
      return false;
    }

    try {
      const existingId = values.ItemServiceGroupID || node.data?.ItemServiceGroupID || (/^\d+$/.test(node.id) ? parseInt(node.id, 10) : null);
      const isNew = !existingId;

      let parentRefId: number | null = null;
      if (treeData) {
        const findParent = (n: TreeNode, childId: string): TreeNode | null => {
          if ((n.children || []).some(c => c.id === childId)) return n;
          for (const c of n.children || []) {
            const found = findParent(c, childId);
            if (found) return found;
          }
          return null;
        };
        const parentNode = findParent(treeData, node.id);
        if (parentNode) {
          const pId = parseInt(parentNode.id, 10);
          if (!isNaN(pId) && pId > 0) {
            parentRefId = pId;
          }
        }
      }

      const payload = {
        name: values.name?.trim() || '',
        name2: values.name2?.trim() || '',
        code: String(values.code || '').trim(),
        description: values.description?.trim() || '',
        isMandatory: !!values.isMandatory,
        parentId: parentRefId,
        additionalFields: values.additionalFields || [],
        relatedProducts: values.relatedProducts || [],
      };

      const url = isNew ? '/api/inv/item-service-groups' : `/api/inv/item-service-groups/${existingId}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || `خطا در ذخیره اطلاعات (${res.status})`, 'error');
        return false;
      }

      const resData = await res.json().catch(() => null);
      const returnedData = resData?.data || resData;
      const createdId = returnedData?.ItemServiceGroupID || returnedData?.id || existingId;

      if (createdId) {
        selectedNodeIdRef.current = createdId.toString();
      }

      showToast('اطلاعات با موفقیت ذخیره گردید.', 'success');
      return true;
    } catch (err: any) {
      console.error('Save error:', err);
      showToast(err.message || 'خطا در ذخیره اطلاعات', 'error');
      return false;
    }
  };

  const selectSavedNodeInTree = (newTree: TreeNode | null) => {
    if (newTree && selectedNodeIdRef.current) {
      const findNode = (n: TreeNode, targetId: string): TreeNode | null => {
        if (n.id === targetId) return n;
        for (const c of n.children || []) {
          const found = findNode(c, targetId);
          if (found) return found;
        }
        return null;
      };
      const savedNode = findNode(newTree, selectedNodeIdRef.current);
      if (savedNode) {
        const level = getNodeLevel(newTree, savedNode.id);
        handleNodeSelect(savedNode, level >= 0 ? level : 1, true);
      }
    }
  };

  const handleSave = async () => {
    if (!selectedNode || selectedNode.isRoot || !treeData) return;
    setIsSubmitting(true);
    const success = await saveToServer(selectedNode, formValues);
    if (success) {
      const newTree = await fetchTree();
      selectSavedNodeInTree(newTree);
    }
    setIsSubmitting(false);
  };

  const handleSaveNew = async () => {
    if (!selectedNode || selectedNode.isRoot || !treeData) return;
    setIsSubmitting(true);
    const success = await saveToServer(selectedNode, formValues);
    if (success) {
      const newTree = await fetchTree();
      selectSavedNodeInTree(newTree);
      const findParent = (n: TreeNode, childId: string): TreeNode | null => {
        if ((n.children || []).some(c => c.id === childId)) return n;
        for (const c of (n.children || [])) {
          const found = findParent(c, childId);
          if (found) return found;
        }
        return null;
      };

      const parentNode = findParent(treeData, selectedNode.id);
      if (parentNode && treeRef.current) {
        treeRef.current.addChildToNode(parentNode.id);
      }
    }
    setIsSubmitting(false);
  };

  const handleSaveClose = async () => {
    if (!selectedNode || selectedNode.isRoot || !treeData) return;
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
        const res = await apiFetch(`/api/inv/item-service-groups/${parseInt(node.id, 10)}`, {
          method: 'DELETE'
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          showToast(errData.message || `خطا در حذف شاخه (${res.status})`, 'error');
          return;
        }
      }
      showToast('شاخه با موفقیت حذف شد', 'success');
      if (selectedNode && selectedNode.id === node.id) {
        setSelectedNode(null);
      }
      await fetchTree();
    } catch (err: any) {
      console.error("Delete error:", err);
      showToast('خطا در حذف شاخه', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRootSelected = selectedNode?.isRoot ?? false;

  const currentNodeLevel = selectedNode && treeData ? getNodeLevel(treeData, selectedNode.id) : 0;
  const currentLevelInfo = getLevelSetting(currentNodeLevel, invSettings);

  const parentCodePrefix = selectedNode && treeData ? getParentCodePrefix(treeData, selectedNode.id) : '';

  const fields: FieldConfig[] = [
    { 
      name: 'code', 
      label: currentLevelInfo.length > 0 ? `کد (${currentLevelInfo.name} - ${currentLevelInfo.length} رقم)` : 'کد', 
      type: 'custom', 
      customComponent: (
        <div className="flex items-center w-full rounded-md shadow-sm border border-slate-300 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500" dir="ltr">
          {parentCodePrefix ? (
            <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border-r border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono text-xs font-semibold select-none shrink-0 flex items-center justify-center" title="کد سرشاخه">
              {parentCodePrefix}
            </div>
          ) : null}
          <input
            type="text"
            value={formValues.code || ''}
            onChange={(e) => handleFormChange('code', e.target.value)}
            disabled={isRootSelected}
            maxLength={currentLevelInfo.length > 0 ? currentLevelInfo.length : undefined}
            className="w-full px-3 py-1.5 text-xs font-mono bg-transparent outline-none text-slate-800 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
            placeholder={currentLevelInfo.length > 0 ? `${currentLevelInfo.length} رقم` : 'کد'}
          />
        </div>
      ),
      required: true 
    },
    { name: 'name', label: 'عنوان', type: 'text', required: true, disabled: isRootSelected },
    { name: 'name2', label: 'عنوان (2)', type: 'text', required: false, disabled: isRootSelected },
    { 
      name: 'detailedCode', 
      label: 'کد تفصیلی', 
      type: 'custom', 
      customComponent: (
        <NumberInput 
          value={formValues.detailedCode || ''}
          onChange={(val) => handleFormChange('detailedCode', val)}
          disabled={isRootSelected}
        />
      ),
      required: false 
    },
    { name: 'description', label: 'توضیحات', type: 'textarea', required: false, disabled: isRootSelected },
    { 
      name: 'isMandatory', 
      label: ' ', 
      type: 'custom', 
      customComponent: (
        <CheckBoxRightLabel 
          label="فعال" 
          checked={!!formValues.isMandatory} 
          onChange={(checked) => handleFormChange('isMandatory', checked)} 
          disabled={isRootSelected} 
        />
      ),
      required: false 
    }
  ];

  const renderIcon = (node: TreeNode) => {
    if (node.isRoot) return <FolderTree className="w-4 h-4 text-indigo-500" />;
    return node.children && node.children.length > 0 ? (
      <Folder className="w-4 h-4 text-amber-500" />
    ) : (
      <File className="w-4 h-4 text-blue-400" />
    );
  };

  return (
    <div className="flex flex-row h-full w-full gap-4 overflow-hidden p-2 relative" id="ItemServiceGroupFormContainer">
      <LoadingOverlay visible={isSubmitting || (!treeData && loading)} message={!treeData && loading ? "در حال دریافت اطلاعات..." : "لطفا منتظر بمانید..."} />
      
      {/* Left side tree view */}
      <div className="w-1/3 flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm overflow-hidden p-2" id="ItemServiceGroupTree">
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
                const mergedValues = { ...(node.id === selectedNode?.id ? formValues : node.data), ...updatedFields, name: updatedFields.name ?? node.name };
                const success = await saveToServer(node, mergedValues);
                if (success) {
                  await fetchTree();
                }
                return success;
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
            label="ساختار گروه بندی کالا انبار"
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
                    <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[10px] bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 shrink-0">
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

      {/* Right side detail form */}
      <div className="w-2/3 flex flex-col h-full rounded-lg shadow-sm overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800" id="ItemServiceGroupDetails">
        {selectedNode ? (
          <div className="flex-1 overflow-y-auto flex flex-col relative w-full h-full min-h-0">
            <SimpleForm isReadonly={false}
              showLoadingOverlay={false}
              title={selectedNode.isRoot ? "گروه بندی کالا انبار" : `جزئیات گروه: ${selectedNode.name}`}
              icon={<Layers className="w-4 h-4 text-indigo-500" />}
              fields={[]}
              values={formValues}
              onChange={handleFormChange}
              onSave={handleSave}
              onSaveNew={handleSaveNew}
              subHeader={
                <div className="flex flex-col w-full bg-slate-50/70 dark:bg-slate-900/50 border-b border-gray-200 dark:border-gray-800">
                  {/* Header Fields Section */}
                  <div className="p-3.5 px-4 flex flex-col gap-2.5 border-b border-gray-200/80 dark:border-gray-800/80">
                    {/* Row 1: Code + Detailed Code */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Field 1: Code */}
                      <FormFieldWrapper 
                        label={currentLevelInfo.length > 0 ? `کد (${currentLevelInfo.name} - ${currentLevelInfo.length} رقم)` : 'کد'} 
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
                            maxLength={currentLevelInfo.length > 0 ? currentLevelInfo.length : undefined}
                            className="w-full px-3 py-1 text-xs font-mono bg-transparent outline-none text-slate-800 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
                            placeholder={currentLevelInfo.length > 0 ? `${currentLevelInfo.length} رقم` : 'کد'}
                          />
                        </div>
                      </FormFieldWrapper>

                      {/* Field 2: Detailed Code */}
                      <FormFieldWrapper label="کد تفصیلی" labelWidth="150px">
                        <div className="w-full">
                          <NumberInput 
                            value={formValues.detailedCode || ''}
                            onChange={(val) => handleFormChange('detailedCode', val)}
                            disabled={isRootSelected}
                          />
                        </div>
                      </FormFieldWrapper>
                    </div>

                    {/* Row 2: Title + Title (2) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Field 3: Name */}
                      <TextInput
                        label="عنوان"
                        required
                        labelWidth="150px"
                        className="w-full px-3 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:border-blue-500 outline-none text-slate-800 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800"
                        value={formValues.name || ''}
                        onChange={(val) => handleFormChange('name', val)}
                        disabled={isRootSelected}
                      />

                      {/* Field 4: Name 2 */}
                      <TextInput
                        label="عنوان (2)"
                        labelWidth="150px"
                        className="w-full px-3 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:border-blue-500 outline-none text-slate-800 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800"
                        value={formValues.name2 || ''}
                        onChange={(val) => handleFormChange('name2', val)}
                        disabled={isRootSelected}
                      />
                    </div>

                    {/* Row 3: Description + Active Checkbox */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                      {/* Field 5: Description */}
                      <TextInput
                        label="توضیحات"
                        labelWidth="150px"
                        className="w-full px-3 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:border-blue-500 outline-none text-slate-800 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800"
                        value={formValues.description || ''}
                        onChange={(val) => handleFormChange('description', val)}
                        disabled={isRootSelected}
                      />

                      {/* Field 6: Active Checkbox */}
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

                  {/* Tabs Row */}
                  <div className="flex flex-row bg-gray-50/50 dark:bg-gray-800/10 px-4 pt-1.5 gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveDetailsTab('related')}
                      className={`px-4 py-2 text-[12px] font-medium border-b-2 transition-all ${
                        activeDetailsTab === 'related'
                          ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500 font-semibold'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      کالاهای مرتبط
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDetailsTab('extra')}
                      className={`px-4 py-2 text-[12px] font-medium border-b-2 transition-all ${
                        activeDetailsTab === 'extra'
                          ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500 font-semibold'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      فیلدهای اضافی
                    </button>
                  </div>
                </div>
              }
              onNew={selectedNodeLevel >= 5 ? undefined : () => {
                if (!selectedNode || !treeData) return;
                if (!canAddChild(selectedNode)) return;
                if (treeRef.current) {
                  treeRef.current.addChildToNode(selectedNode.id);
                }
              }}
              onDelete={(!selectedNode || selectedNode.isRoot || selectedNode.deletable === false) ? undefined : () => handleDeleteRequest(selectedNode)}
              isSubmitting={isSubmitting || isRootSelected}
              showListButton={false}
              contentClassName="p-0 flex-1 h-full overflow-hidden min-h-0 gap-0"
            >
              {activeDetailsTab === 'related' && (
                <div className="flex-1 h-full min-h-0 overflow-hidden" id="RelatedProductsTabCellContainer">
                  <TabCellRow
                    tabs={relatedProductsTabConfig}
                    value={formValues.relatedProducts || []}
                    onChange={(val) => handleFormChange('relatedProducts', val)}
                    hideHeader={true}
                    isReadonly={isRootSelected}
                  />
                </div>
              )}
              {activeDetailsTab === 'extra' && (
                <div className="flex-1 h-full min-h-0 overflow-hidden flex flex-col p-2 gap-2" id="AdditionalFieldsTabCellContainer">
                  {isNonLeafNode && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-md text-amber-800 dark:text-amber-300 text-[12px] flex items-center gap-2 shrink-0">
                      <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <span>فیلدهای سفارشی (اضافی) فقط برای زیرگروه‌های سطح آخر (فاقد زیرشاخه) قابل تعریف می‌باشند.</span>
                    </div>
                  )}
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <TabCellRow
                      tabs={additionalFieldsTabConfig}
                      value={formValues.additionalFields || []}
                      onChange={(val) => handleFormChange('additionalFields', val)}
                      hideHeader={true}
                      isReadonly={isRootSelected || isNonLeafNode}
                      hideAddButton={isNonLeafNode}
                    />
                  </div>
                </div>
              )}
            </SimpleForm>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">لطفا یک گره از ساختار گروه بندی انتخاب کنید.</p>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!nodeToDelete}
        title="حذف گروه"
        message={`آیا از حذف گروه [${nodeToDelete?.name || ''}] اطمینان دارید؟`}
        confirmText="بلی"
        cancelText="خیر"
        onConfirm={executeDelete}
        onCancel={() => setNodeToDelete(null)}
      />
    </div>
  );
}
