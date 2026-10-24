'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTabs } from '@/components/TabsProvider';
import { useToast } from '@/components/ToastProvider';
import { useLanguage, useAuth } from '@/components/Providers';
import { apiFetch, safeStringify } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { eventBus, EVENTS } from '@/lib/events';

// UI Components
import { NumberInput } from '@/components/inputs/NumberInput';
import { TextInput } from '@/components/inputs/TextInput';
import { Select } from '@/components/inputs/Select';
import { MultiSelect } from '@/components/inputs/MultiSelect';
import { Checkbox } from '@/components/inputs/Checkbox';
import { GroupField } from '@/components/inputs/GroupField';
import { TreeView, TreeNode, TreeViewRef } from '@/components/inputs/TreeView';
import { MainDataGrid } from '@/components/ui/MainDataGrid';
import { ActionButton } from '@/components/buttons/ActionButton';
import { MultiColumnDropdown } from '@/components/inputs/MultiColumnDropdown';
import { TabCellRow } from '@/components/forms/TabCellRow';
import { SlAccountDropDown } from '@/components/ui/SlAccountDropDown';

// Buttons
import { NewButton } from '@/components/buttons/NewButton';
import { CancelButton } from '@/components/buttons/CancelButton';
import { SaveButton } from '@/components/buttons/SaveButton';
import { SaveNewButton } from '@/components/buttons/SaveNewButton';
import { SaveCloseButton } from '@/components/buttons/SaveCloseButton';
import { DeleteButton } from '@/components/buttons/DeleteButton';
import { CloseButton } from '@/components/buttons/CloseButton';
import { FullscreenButton } from '@/components/buttons/FullscreenButton';
import { HelpButton } from '@/components/buttons/HelpButton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

import { ExcelExportButton } from '@/components/MainDataGridButtons/ExcelExportButton';
import { PdfExportButton } from '@/components/MainDataGridButtons/PdfExportButton';
import { WordExportButton } from '@/components/MainDataGridButtons/WordExportButton';
import { PrintButton } from '@/components/MainDataGridButtons/PrintButton';

// Icons
import { FolderTree, Search, Info, Tag, Paperclip, ChevronLeft, ChevronRight, Hash, Folder, Box, Plus, X, Calendar, Layers, FileText, Coins, ArrowRightLeft, Factory, ShoppingBag, Briefcase, HardHat, Landmark } from 'lucide-react';

interface AccountsFormProps {
  onSaved?: () => void;
  initialData?: any;
}

const getAuthorizedUsersFromStorage = (nodeId: string, nodeCode: string): any[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`auth-users-${nodeId}`) || localStorage.getItem(`auth-users-code-${nodeCode}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
};

const saveAuthorizedUsersToStorage = (nodeId: string, nodeCode: string, users: any[]) => {
  if (typeof window === 'undefined') return;
  const dataStr = JSON.stringify(users || []);
  if (nodeId && /^\d+$/.test(nodeId)) {
    localStorage.setItem(`auth-users-${nodeId}`, dataStr);
  }
  if (nodeCode) {
    localStorage.setItem(`auth-users-code-${nodeCode}`, dataStr);
  }
};

const getFrequentDescriptionsFromStorage = (nodeId: string, nodeCode: string): any[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`freq-desc-${nodeId}`) || localStorage.getItem(`freq-desc-code-${nodeCode}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
};

const saveFrequentDescriptionsToStorage = (nodeId: string, nodeCode: string, descriptions: any[]) => {
  if (typeof window === 'undefined') return;
  const dataStr = JSON.stringify(descriptions || []);
  if (nodeId && /^\d+$/.test(nodeId)) {
    localStorage.setItem(`freq-desc-${nodeId}`, dataStr);
  }
  if (nodeCode) {
    localStorage.setItem(`freq-desc-code-${nodeCode}`, dataStr);
  }
};

const getNatureAdjustmentsFromStorage = (nodeId: string, nodeCode: string): any[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`nature-adj-${nodeId}`) || localStorage.getItem(`nature-adj-code-${nodeCode}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
};

const saveNatureAdjustmentsToStorage = (nodeId: string, nodeCode: string, adjustments: any[]) => {
  if (typeof window === 'undefined') return;
  const dataStr = JSON.stringify(adjustments || []);
  if (nodeId && /^\d+$/.test(nodeId)) {
    localStorage.setItem(`nature-adj-${nodeId}`, dataStr);
  }
  if (nodeCode) {
    localStorage.setItem(`nature-adj-code-${nodeCode}`, dataStr);
  }
};

import { useAccountsStore } from '@/lib/stores/accountsStore';

export default function AccountsForm({ onSaved, initialData }: AccountsFormProps) {
  const { addTab, removeTab, activeTabId } = useTabs();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const treeRef = useRef<TreeViewRef>(null);

  const { currentUser } = useAuth();

  const {
    loading, setLoading,
    isSubmitting, setIsSubmitting,
    flatAccounts, setFlatAccounts,
    treeData, setTreeData,
    selectedNode, setSelectedNode,
    nodeToDelete, setNodeToDelete,
    detailedTypes, setDetailedTypes,
    selectingDetailedLevel, setSelectingDetailedLevel,
    usersList, setUsersList,
    values, setValues,
    errors, setErrors,
    searchQuery, setSearchQuery,
    activeSubTab, setActiveSubTab,
    activeDetailedLevel, setActiveDetailedLevel,
    accountingSettings, setAccountingSettings,
    exportModalVisible, setExportModalVisible,
    exportAction, setExportAction,
    exportLevels, setExportLevels,
    reset
  } = useAccountsStore();

  const subTabsContainerRef = useRef<HTMLDivElement>(null);
  const [showSubLeftArrow, setShowSubLeftArrow] = useState(false);
  const [showSubRightArrow, setShowSubRightArrow] = useState(false);

  const checkSubTabsScroll = () => {
    if (subTabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = subTabsContainerRef.current;
      if (scrollWidth <= clientWidth) {
        setShowSubLeftArrow(false);
        setShowSubRightArrow(false);
        return;
      }
      
      const isRtl = window.getComputedStyle(subTabsContainerRef.current).direction === 'rtl';
      
      if (isRtl) {
        const absScrollLeft = Math.abs(Math.round(scrollLeft));
        if (scrollLeft > 0) {
           setShowSubRightArrow(absScrollLeft < scrollWidth - clientWidth - 1);
           setShowSubLeftArrow(absScrollLeft > 0);
        } else {
           setShowSubRightArrow(absScrollLeft > 0);
           setShowSubLeftArrow(absScrollLeft < scrollWidth - clientWidth - 1);
        }
      } else {
        setShowSubLeftArrow(Math.round(scrollLeft) > 0);
        setShowSubRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(checkSubTabsScroll, 100);
    window.addEventListener('resize', checkSubTabsScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkSubTabsScroll);
    };
  }, [selectedNode, accountingSettings, activeSubTab, treeData]);

  const scrollSubTabs = (direction: 'left' | 'right') => {
    if (subTabsContainerRef.current) {
      const scrollAmount = 150;
      subTabsContainerRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  const selectedNodeIdRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      reset(); // Reset on unmount
    };
  }, [reset]);

  const fetchSettings = async () => {
    try {
      const res = await apiFetch('/api/common/base-settings/tab/2');
      if (res.ok) {
         const data = await res.json();
         setAccountingSettings(data.data || {});
      }
    } catch(err) {}
  };

  const fetchDetailedTypes = async () => {
    try {
      const res = await apiFetch('/api/accounting/detailed-types');
      if (res.ok) {
         const data = await res.json();
         setDetailedTypes(Array.isArray(data) ? data : (data.data || []));
      }
    } catch(err) {}
  };

  const getLevel = (nodeId: string, root: TreeNode | null): number => {

    if (!root) return 0;
    if (root.id === nodeId) return 0;
    for (const child of (root.children || [])) {
      if (child.id === nodeId) return 1;
      for (const grand of (child.children || [])) {
         if (grand.id === nodeId) return 2;
         for (const great of (grand.children || [])) {
           if (great.id === nodeId) return 3;
         }
      }
    }
    return 0; // Default or deeper
  };
  
  const getParentInfo = (nodeId: string, root: TreeNode | null): { level: number; parentCode: string; nodeCode: string; } => {
    if (!root) return { level: 0, parentCode: '', nodeCode: '' };
    if (root.id === nodeId) return { level: 0, parentCode: '', nodeCode: root.data?.code || '' };
    for (const child of (root.children || [])) {
      if (child.id === nodeId) return { level: 1, parentCode: root.data?.code || '', nodeCode: child.data?.code || '' };
      for (const grand of (child.children || [])) {
         if (grand.id === nodeId) return { level: 2, parentCode: child.data?.code || '', nodeCode: grand.data?.code || '' };
         for (const great of (grand.children || [])) {
           if (great.id === nodeId) return { level: 3, parentCode: grand.data?.code || '', nodeCode: great.data?.code || '' };
         }
      }
    }
    return { level: 0, parentCode: '', nodeCode: '' };
  };

  const handleNodeSelect = (node: TreeNode) => {
    setSelectedNode(node);
    selectedNodeIdRef.current = node.id;
    setValues({
      code: node.data?.code || '',
      title: node.data?.title || node.name || '',
      title_en: node.data?.title_en || '',
      accountType: node.data?.accountType ? String(node.data.accountType) : '',
      accountNature: node.data?.accountNature ? String(node.data.accountNature) : '',
      natureControl: node.data?.natureControl ? String(node.data.natureControl) : '',
      isActive: node.data?.isActive !== undefined ? node.data.isActive : true,
      trackingFeature: !!node.data?.trackingFeature,
      currencyFeature: !!node.data?.currencyFeature,
      exchangeableFeature: !!node.data?.exchangeableFeature,
      trackingQuantity: !!node.data?.trackingQuantity,
      trackingNumber: !!node.data?.trackingNumber,
      trackingDate: !!node.data?.trackingDate,
      relatedDetailedAccounts: Array.isArray(node.data?.relatedDetailedAccounts) ? node.data.relatedDetailedAccounts : [],
      authorizedUsers: getAuthorizedUsersFromStorage(node.id, node.data?.code || ''),
      frequentDescriptions: /^\d+$/.test(node.id) 
        ? (node.data?.frequentDescriptions || [])
        : ((Array.isArray(node.data?.frequentDescriptions) && node.data.frequentDescriptions.length > 0)
            ? node.data.frequentDescriptions
            : getFrequentDescriptionsFromStorage(node.id, node.data?.code || '')),
      natureAdjustments: /^\d+$/.test(node.id) 
        ? (node.data?.natureAdjustments || [])
        : ((Array.isArray(node.data?.natureAdjustments) && node.data.natureAdjustments.length > 0)
            ? node.data.natureAdjustments
            : getNatureAdjustmentsFromStorage(node.id, node.data?.code || '')),
    });
    setErrors({});
  };

  const fetchTree = async (query?: string) => {
    setLoading(true);
    try {
      const url = query ? `/api/accounting/accounts?search=${encodeURIComponent(query)}` : '/api/accounting/accounts';
      const res = await apiFetch(url);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Failed to fetch data: ${res.status} ${res.statusText} ${text}`);
      }
      const resJson = await res.json();
      const flatList = resJson.data || [];
      setFlatAccounts(flatList);

      const defaultRoot: TreeNode = {
        id: '0',
        name: 'ساختار کدینگ حساب‌ها',
        isRoot: true,
        deletable: false,
        data: {
          code: '0',
          title: 'ساختار کدینگ حساب‌ها',
          isActive: true,
        },
        children: []
      };

      if (!flatList || flatList.length === 0) {
        setTreeData(defaultRoot);
        handleNodeSelect(defaultRoot);
        return;
      }

      const buildNode = (item: any, currentLevel: number): TreeNode => {
        const children = flatList
          .filter((x: any) => (x.parentId || 0).toString() === item.id.toString())
          .map((child: any) => buildNode(child, currentLevel + 1))
          .sort((a: TreeNode, b: TreeNode) => {
            return (a.data?.code || '').localeCompare(b.data?.code || '');
          });
        
        return {
          id: item.id.toString(),
          name: item.title,
          isRoot: item.code === '0',
          deletable: item.code !== '0',
          data: {
            code: item.code,
            title: item.title,
            title_en: item.title_en || '',
            accountType: item.accountType || undefined,
            accountNature: item.accountNature || undefined,
            natureControl: item.natureControl || undefined,
            isActive: item.isActive !== undefined ? item.isActive : true,
            trackingFeature: !!item.trackingFeature,
            currencyFeature: !!item.currencyFeature,
            exchangeableFeature: !!item.exchangeableFeature,
            trackingQuantity: !!item.trackingQuantity,
            trackingNumber: !!item.trackingNumber,
            trackingDate: !!item.trackingDate,
            level: currentLevel,
            relatedDetailedAccounts: item.relatedDetailedAccounts || [],
            frequentDescriptions: item.frequentDescriptions || [],
            natureAdjustments: item.natureAdjustments || [],
          },
          children
        };
      };

      const rootItem = flatList.find((x: any) => x.code === '0');
      if (rootItem) {
        const rootNode = buildNode(rootItem, 0);
        setTreeData(rootNode);

        const findUpdatedNode = (node: TreeNode, id: string): TreeNode | null => {
          if (node.id === id) return node;
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
            handleNodeSelect(result);
          } else if (rootNode.children && rootNode.children.length > 0) {
            handleNodeSelect(rootNode.children[0]);
          }
        } else if (rootNode.children && rootNode.children.length > 0) {
          handleNodeSelect(rootNode.children[0]);
        } else {
          handleNodeSelect(rootNode);
        }
      } else {
        setTreeData(defaultRoot);
        handleNodeSelect(defaultRoot);
      }
    } catch (err: any) {
      console.error(err);
      showToast('خطا در دریافت اطلاعات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = eventBus.on(EVENTS.DATA_CHANGED, (payload) => {
      if (payload?.entity === 'Account') {
        fetchTree(searchQuery);
      }
    });
    return () => unsubscribe();
  }, [searchQuery]);

  const fetchUsers = async () => {
    try {
      const res = await apiFetch('/api/iam/users');
      if (res.ok) {
        const data = await res.json();
        setUsersList(Array.isArray(data) ? data : (data.items || data.data || []));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchDetailedTypes();
    fetchTree();
    fetchUsers();
  }, []);

  const handleAddNode = (node: TreeNode) => {
    setTreeData((prevTree: any) => {
      if (!prevTree) return prevTree;

      let parentNode: TreeNode | null = null;
      let level = 0;
      let parentCode = '';
      
      const findParent = (current: TreeNode, childId: string, currentLevel: number): TreeNode | null => {
        if (!current.children) return null;
        for (const child of current.children) {
          if (child.id === childId) {
            level = currentLevel + 1;
            parentCode = current.data?.code === '0' ? '' : (current.data?.code || '');
            return current;
          }
          const found = findParent(child, childId, currentLevel + 1);
          if (found) return found;
        }
        return null;
      };
      
      parentNode = findParent(prevTree, node.id, 0);

      const grpLen = parseInt(accountingSettings?.groupAccountLength || '2', 10);
      const totLen = parseInt(accountingSettings?.totalAccountLength || '2', 10);
      const specLen = parseInt(accountingSettings?.specificAccountLength || '2', 10);

      let nextCode = '';

      if (parentNode) {
        let maxCodeVal = -1;
        for (const sibling of parentNode.children) {
          if (sibling.id !== node.id && sibling.data?.code) {
             const c = sibling.data.code.substring(parentCode.length);
             const parsed = parseInt(c, 10);
             if (!isNaN(parsed) && parsed > maxCodeVal) {
               maxCodeVal = parsed;
             }
          }
        }
        
        let targetLength = grpLen;
        if (level === 1) targetLength = grpLen;
        else if (level === 2) targetLength = totLen;
        else if (level === 3) targetLength = specLen;

        let nextNum = maxCodeVal === -1 ? 1 : maxCodeVal + 1;
        nextCode = parentCode + nextNum.toString().padStart(targetLength, '0');
      }

      const emptyValues = { 
        code: nextCode, 
        title: '', 
        title_en: '', 
        accountType: '', 
        accountNature: '', 
        natureControl: '', 
        isActive: true, 
        trackingFeature: false, 
        currencyFeature: false, 
        exchangeableFeature: false, 
        trackingQuantity: false, 
        trackingNumber: false, 
        trackingDate: false, 
        relatedDetailedAccounts: [], 
        authorizedUsers: [], 
        frequentDescriptions: [], 
        natureAdjustments: [] 
      };
      setValues(emptyValues);
      setErrors({});

      setSelectedNode((prev: any) => prev && prev.id === node.id 
        ? { ...prev, name: '', data: { ...prev.data, ...emptyValues } } 
        : prev
      );

      const updateNode = (n: TreeNode): TreeNode => {
        if (n.id === node.id) {
          return { ...n, name: '', data: { ...n.data, ...emptyValues } };
        }
        return { ...n, children: n.children ? n.children.map(updateNode) : [] };
      };
      return updateNode(prevTree);
    });
  };

  const handleChange = (name: string, value: any) => {
    setValues((prev: any) => ({ ...prev, [name]: value }));
    
    if (selectedNode) {
      setTreeData((prevTree: any) => {
        if (!prevTree) return prevTree;
        const updateNode = (n: TreeNode): TreeNode => {
          if (n.id === selectedNode.id) {
            const newData = { ...n.data, [name]: value };
            return { ...n, name: name === 'title' ? value : n.name, data: newData };
          }
          return { ...n, children: n.children.map(updateNode) };
        };
        return updateNode(prevTree);
      });
      setSelectedNode((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          name: name === 'title' ? value : prev.name,
          data: { ...prev.data, [name]: value }
        };
      });
    }

    if (errors[name]) {
      setErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = async (name: string, value: string) => {
    if (name === 'title_en' && !value && values.title) {
      handleChange('title_en', values.title);
      return;
    }
    if (!value || isRootSelected) return;
    const isNew = selectedNode ? !/^\d+$/.test(selectedNode.id) : true;
    const excludeId = (!isNew && selectedNode) ? parseInt(selectedNode.id, 10) : undefined;
    
    try {
      const url = `/api/accounting/accounts/check-duplicate?field=${name}&value=${encodeURIComponent(value)}${excludeId ? `&excludeId=${excludeId}` : ''}`;
      const res = await apiFetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.isDuplicate) {
          setErrors((prev: any) => ({
            ...prev,
            [name]: name === 'code' ? 'کد حساب تکراری است' : 'حسابی با این عنوان از قبل وجود دارد'
          }));
        }
      }
    } catch(e) {}
  };

  const saveToServer = async (node: TreeNode, formVals: any): Promise<boolean> => {
    if (formVals.code === '0') {
      showToast('عملیات روی سرشاخه (کد 0) مجاز نیست', 'error');
      return false;
    }

    const newErrors: Record<string, string> = {};
    if (!formVals.code) newErrors.code = 'کد اجباری است';
    if (!formVals.title) newErrors.title = 'عنوان اجباری است';
    if (!formVals.accountNature) newErrors.accountNature = 'ماهیت حساب اجباری است';
    
    // Constraint Checks
    const pInfo = getParentInfo(node.id, treeData);
    const grpLen = parseInt(accountingSettings?.groupAccountLength || '2', 10);
    const totLen = parseInt(accountingSettings?.totalAccountLength || '2', 10);
    const specLen = parseInt(accountingSettings?.specificAccountLength || '2', 10);

    if (pInfo.level === 1) {
       if (!formVals.accountType) newErrors.accountType = 'نوع حساب اجباری است';
       if (formVals.code.length !== grpLen) {
          newErrors.code = `طول کد گروه حساب باید دقیقاً ${grpLen} کاراکتر باشد.`;
       }
    } else if (pInfo.level === 2) {
       if (formVals.code.length !== grpLen + totLen) {
          newErrors.code = `طول کد حساب کل باید دقیقاً ${grpLen + totLen} کاراکتر باشد.`;
       }
       if (!formVals.code.startsWith(pInfo.parentCode)) {
          newErrors.code = `کد حساب کل باید با کد گروه (${pInfo.parentCode}) شروع شود.`;
       }
    } else if (pInfo.level === 3) {
       if (formVals.frequentDescriptions && formVals.frequentDescriptions.length > 0) {
          const hasEmptyDesc = formVals.frequentDescriptions.some((row: any) => !row.description || !row.description.trim());
          if (hasEmptyDesc) {
             newErrors.frequentDescriptions = 'در ردیف‌های شرح پر تکرار، فیلد شرح الزامی است.';
          }
       }
       if (formVals.code.length !== grpLen + totLen + specLen) {
          newErrors.code = `طول کد حساب معین باید دقیقاً ${grpLen + totLen + specLen} کاراکتر باشد.`;
       }
       if (!formVals.code.startsWith(pInfo.parentCode)) {
          newErrors.code = `کد حساب معین باید با کد حساب کل (${pInfo.parentCode}) شروع شود.`;
       }
    }

    if (formVals.natureAdjustments && formVals.natureAdjustments.length > 0) {
      const getNormalizedLevels = (list: any[]) => {
        if (!list || !Array.isArray(list)) return [];
        return list
          .map(item => {
            const l = item.detailedLevel ? parseInt(item.detailedLevel, 10) : null;
            const tId = item.detailedTypeId || item.detailedType?.id || item.detailedType?.detailedTypesId;
            const finalTId = tId ? parseInt(tId.toString(), 10) : null;
            return { level: l, typeId: finalTId };
          })
          .filter(x => x.level !== null && x.typeId !== null && !isNaN(x.level) && !isNaN(x.typeId));
      };

      const mainNorm = getNormalizedLevels(formVals.relatedDetailedAccounts);
      for (const adj of formVals.natureAdjustments) {
        if (!adj.moinCode) continue;
        const adjAccount = flatAccounts.find(a => a.code === adj.moinCode);
        if (adjAccount) {
          const adjNorm = getNormalizedLevels(adjAccount.relatedDetailedAccounts);
          
          for (const mn of mainNorm) {
            const hasLevel = adjNorm.some(t => t.level === mn.level);
            if (hasLevel) {
              const matching = adjNorm.find(t => t.level === mn.level && t.typeId === mn.typeId);
              if (!matching) {
                 newErrors.natureAdjustments = `خطا: سطح تفصیلی ${mn.level} در معین ${adj.moinTitle} متناقض است. هر دو معین باید در سطح مشترک، به ساختار تفصیلی همسانی متصل باشند.`;
              }
            }
          }
          
          for (const an of adjNorm) {
            const hasLevel = mainNorm.some(t => t.level === an.level);
            if (hasLevel) {
              const matching = mainNorm.find(t => t.level === an.level && t.typeId === an.typeId);
              if (!matching) {
                 newErrors.natureAdjustments = `خطا: سطح تفصیلی ${an.level} در معین ${adj.moinTitle} متناقض است. هر دو معین باید در سطح مشترک، به ساختار تفصیلی همسانی متصل باشند.`;
              }
            }
          }
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      showToast(firstError, 'error');
      return false;
    }

    try {
      const isNew = !/^\d+$/.test(node.id);
      
      let parentId = null;
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
          parentId = parseInt(parentNode.id, 10);
        }
      }

      const payload = {
        code: formVals.code.trim(),
        title: formVals.title.trim(),
        title_en: formVals.title_en?.trim() || formVals.title?.trim() || '',
        accountType: formVals.accountType ? parseInt(formVals.accountType, 10) : undefined,
        accountNature: formVals.accountNature ? parseInt(formVals.accountNature, 10) : undefined,
        natureControl: formVals.natureControl ? parseInt(formVals.natureControl, 10) : undefined,
        isActive: formVals.isActive !== undefined ? formVals.isActive : true,
        trackingFeature: !!formVals.trackingFeature,
        currencyFeature: !!formVals.currencyFeature,
        exchangeableFeature: !!formVals.exchangeableFeature,
        trackingQuantity: !!formVals.trackingQuantity,
        trackingNumber: !!formVals.trackingNumber,
        trackingDate: !!formVals.trackingDate,
        relatedDetailedAccounts: formVals.relatedDetailedAccounts ? formVals.relatedDetailedAccounts
          .filter((r: any) => r.detailedTypeId || r.detailedType?.id || r.detailedType?.detailedTypesId)
          .map((r: any) => {
            const mapped: any = {
              detailedLevel: parseInt(r.detailedLevel, 10),
              detailedTypeId: parseInt(r.detailedTypeId || r.detailedType?.id || r.detailedType?.detailedTypesId, 10)
            };
            if (r.id) {
              mapped.id = parseInt(r.id, 10);
            }
            return mapped;
          }) : [],
        natureAdjustments: formVals.natureAdjustments ? formVals.natureAdjustments
          .filter((adj: any) => adj.moinCode)
          .map((adj: any) => {
            const mapped: any = {
              moinCode: adj.moinCode,
              moinTitle: adj.moinTitle,
              nature: adj.nature,
              description: adj.description || '',
              description2: adj.description2 || ''
            };
            if (adj.id) {
              mapped.id = parseInt(adj.id, 10);
            }
            return mapped;
          }) : [],
        frequentDescriptions: formVals.frequentDescriptions ? formVals.frequentDescriptions
          .filter((fd: any) => fd.description && fd.description.trim())
          .map((fd: any) => {
            const mapped: any = {
              description: fd.description,
              description2: fd.description2 || ''
            };
            if (fd.id) {
              mapped.id = parseInt(fd.id, 10);
            }
            return mapped;
          }) : [],
        ...(isNew && parentId ? { parentId: parentId } : {})
      };

      const url = isNew ? '/api/accounting/accounts' : `/api/accounting/accounts/${parseInt(node.id, 10)}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || `خظا در ذخیره سازی (${res.status})`, 'error');
        return false;
      }

      saveAuthorizedUsersToStorage(node.id, formVals.code, formVals.authorizedUsers);
      saveFrequentDescriptionsToStorage(node.id, formVals.code, formVals.frequentDescriptions);
      saveNatureAdjustmentsToStorage(node.id, formVals.code, formVals.natureAdjustments);

      showToast('اطلاعات با موفقیت ذخیره شد', 'success');
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'Account' });
      if (onSaved) onSaved();
      return true;
    } catch (err: any) {
      console.error("Save error:", err.message);
      showToast(err.message || 'خطا در ارتباط با سرور', 'error');
      return false;
    }
  };

  const handleSave = async () => {
    if (!selectedNode) return;
    setIsSubmitting(true);
    const success = await saveToServer(selectedNode, values);
    if (success) {
      await fetchTree();
    }
    setIsSubmitting(false);
  };

  const handleSaveNew = async () => {
    if (!selectedNode || !treeData) return;
    setIsSubmitting(true);
    
    let parentId = treeData.id;
    const findParent = (n: TreeNode, childId: string): TreeNode | null => {
      if (n.children && n.children.some(c => c.id === childId)) return n;
      if (n.children) {
        for (const c of n.children) {
          const found = findParent(c, childId);
          if (found) return found;
        }
      }
      return null;
    };
    const pNode = findParent(treeData, selectedNode.id);
    if (pNode) parentId = pNode.id;

    const success = await saveToServer(selectedNode, values);
    if (success) {
      await fetchTree();
      if (treeRef.current && treeRef.current.addChildToNode) {
        treeRef.current.addChildToNode(parentId);
      }
    }
    setIsSubmitting(false);
  };

  const handleSaveClose = async () => {
    if (!selectedNode || !treeData) return;
    setIsSubmitting(true);
    const success = await saveToServer(selectedNode, values);
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
    const hasDetailedLevels = node.data?.relatedDetailedAccounts && node.data.relatedDetailedAccounts.length > 0;
    if (hasDetailedLevels) {
      showToast("امکان حذف گروه دارای سطوح تفصیلی وجود ندارد. ابتدا سطوح تفصیلی را حذف کنید", "error");
      return;
    }
    if (node.isRoot || node.deletable === false || node.data?.code === '0') {
      showToast("این شاخه قابل حذف نیست", "error");
      return;
    }
    setNodeToDelete(node);
  };

  const handleSeedDefault = async (typeId: number = 1) => {
    try {
      setIsSubmitting(true);
      const res = await apiFetch('/api/accounting/accounts/seed-default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: typeId,
          group: parseInt(accountingSettings?.groupAccountLength || '1', 10),
          total: parseInt(accountingSettings?.totalAccountLength || '2', 10),
          specific: parseInt(accountingSettings?.specificAccountLength || '2', 10)
        })
      });
      if (res.ok) {
        showToast('کدینگ پیش‌فرض با موفقیت ایجاد شد', 'success');
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'Account' });
        await fetchTree();
      } else {
        const err = await res.json().catch(()=>({}));
        showToast(err.message || 'خطا در ایجاد کدینگ پیش‌فرض', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'خطا در برقراری ارتباط', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDelete = async () => {
    if (!nodeToDelete) return;
    const node = nodeToDelete;
    setNodeToDelete(null);

    try {
      setIsSubmitting(true);
      const isNew = !/^\d+$/.test(node.id);
      if (!isNew) {
        const res = await apiFetch(`/api/accounting/accounts/${parseInt(node.id, 10)}`, {
          method: 'DELETE'
        });
        if (!res.ok) {
           const errData = await res.json().catch(() => ({}));
           showToast(errData.message || `خطا در حذف شاخه (${res.status})`, 'error');
           return;
        }
      }
      showToast('شاخه با موفقیت حذف شد', 'success');
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'Account' });
      if (selectedNode && selectedNode.id === node.id) {
        setSelectedNode(null);
      }
      await fetchTree();
    } catch (error: any) {
       console.error("Delete error:", error.message);
       showToast(error.message || 'خطا در حذف شاخه', 'error');
    } finally {
       setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    fetchTree();
  };

  const handleNewGroup = () => {
     if (treeRef.current && selectedNode && treeData) {
       const parentInfo = getParentInfo(selectedNode.id, treeData);
       if (parentInfo.level >= 3) {
         treeRef.current.addSiblingToSelected();
       } else {
         treeRef.current.addChildToSelected();
       }
     } else if (treeRef.current && treeData) {
       // fallback if nothing selected, try to add to root
       selectedNodeIdRef.current = treeData.id;
       setSelectedNode(treeData);
       setTimeout(() => {
          treeRef.current?.addChildToSelected();
       }, 100);
     }
  };

  const handleExportClick = (action: "excel" | "pdf" | "word" | "print") => {
    setExportAction(action);
    setExportModalVisible(true);
  };

  const handleExportData = async () => {
    if (!exportAction || !treeData) return;
    setIsSubmitting(true);
    try {
      const getAccountTypeName = (type?: number) => {
        if (type === 1) return 'ترازنامه ای';
        if (type === 2) return 'سود و زیانی';
        if (type === 3) return 'انتظامی';
        return '';
      };
      const getAccountNatureName = (nature?: number) => {
        if (nature === 1) return 'بدهکار';
        if (nature === 2) return 'بستانکار';
        return '';
      };

      const exportRows: any[] = [];
      const traverse = (node: TreeNode, level: number) => {
        if (
          (level === 1 && exportLevels.group) ||
          (level === 2 && exportLevels.total) ||
          (level === 3 && exportLevels.specific) ||
          (level >= 4 && exportLevels.detailed)
        ) {
          exportRows.push({
            'کد حساب': node.data?.code || '',
            'عنوان حساب': node.name || '',
            'عنوان لاتین': node.data?.title_en || '',
            'نوع حساب': getAccountTypeName(node.data?.accountType),
            'ماهیت حساب': getAccountNatureName(node.data?.accountNature),
            'وضعیت': node.data?.isActive === false ? 'غیرفعال' : 'فعال',
            'ویژگی پیگیری': node.data?.trackingFeature ? 'دارد' : 'ندارد',
            'تعدادی': node.data?.trackingQuantity ? 'دارد' : 'ندارد',
            'شماره': node.data?.trackingNumber ? 'دارد' : 'ندارد',
            'تاریخ': node.data?.trackingDate ? 'دارد' : 'ندارد',
            'ویژگی ارزی': node.data?.currencyFeature ? 'دارد' : 'ندارد',
            'تسعیرپذیر': node.data?.exchangeableFeature ? 'دارد' : 'ندارد',
            'سطح': level === 1 ? 'گروه' : level === 2 ? 'کل' : level === 3 ? 'معین' : 'تفصیلی'
          });
        }
        node.children?.forEach((child: any) => traverse(child, level + 1));
      };

      // Skip the root dummy node "0"
      treeData.children?.forEach((child: any) => traverse(child, 1));

      if (exportRows.length === 0) {
        showToast('هیچ اطلاعاتی برای ارسال یافت نشد', 'error');
        setIsSubmitting(false);
        setExportModalVisible(false);
        return;
      }

      if (exportAction === 'excel') {
        const XLSX = await import('xlsx');
        const worksheet = XLSX.utils.json_to_sheet(exportRows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Accounts");
        XLSX.writeFile(workbook, "accounts_export.xlsx");
        showToast('ارسال به اکسل با موفقیت انجام شد', 'success');
      } else if (exportAction === 'print' || exportAction === 'pdf' || exportAction === 'word') {
        const tableHtml = `
          <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse; font-family: Tahoma, sans-serif; direction: rtl; text-align: right;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                ${Object.keys(exportRows[0]).map(k => `<th>${k}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${exportRows.map(row => `
                <tr>
                  ${Object.values(row).map(v => `<td>${v}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;

        if (exportAction === 'print') {
          const printWindow = window.open('', '', 'width=800,height=600');
          if (printWindow) {
            printWindow.document.write(`
              <htm`+`l dir="rtl">
                <head>
                  <title>چاپ ساختار کدینگ حساب‌ها</title>
                  <style>
                    body { font-family: Tahoma, Arial, sans-serif; padding: 20px; }
                    table { page-break-inside: auto; }
                    th { font-size: 14px; }
                    td { font-size: 12px; }
                  </style>
                </head>
                <body>
                  <h2 style="text-align: center; margin-bottom: 20px;">ساختار کدینگ حساب‌ها</h2>
                  ${tableHtml}
                  <script>
                    window.onload = function() { window.print(); window.close(); }
                  </script>
                </body>
              </htm`+`l>
            `);
            printWindow.document.close();
          }
        } else if (exportAction === 'word') {
          const htmlContent = `
            <htm`+`l xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
              <meta charset='utf-8'>
              <title>Export</title>
            </head>
            <body dir="rtl" style="font-family: Tahoma, sans-serif;">
              <h2 style="text-align: center;">ساختار کدینگ حساب‌ها</h2>
              ${tableHtml}
            </body>
            </htm`+`l>
          `;
          const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'accounts_export.doc';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          showToast('ارسال به ورد با موفقیت انجام شد', 'success');
        } else if (exportAction === 'pdf') {
          showToast('در حال آماده سازی فایل پی دی اف...', 'info');
          const html2pdf = (await import('html2pdf.js')).default;
          const element = document.createElement('div');
          element.innerHTML = `
            <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 20px;">
              <h2 style="text-align: center; margin-bottom: 20px;">ساختار کدینگ حساب‌ها</h2>
              ${tableHtml}
            </div>
          `;
          html2pdf().set({
            margin: 10,
            filename: 'accounts_export.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
          }).from(element).save().then(() => {
            showToast('ارسال به پی دی اف با موفقیت انجام شد', 'success');
          });
        }
      }
    } catch (err) {
      console.error(err);
      showToast('خطا در دریافت فایل استخراج', 'error');
    } finally {
      setIsSubmitting(false);
      setExportModalVisible(false);
    }
  };

  const handleCancelEdit = () => {
    if (!selectedNode || !treeData) return;
    const isNew = !/^\d+$/.test(selectedNode.id);
    if (isNew) {
      setTreeData((prev: any) => {
        if (!prev) return prev;
        const removeNodeInfo = (node: TreeNode, idToRemove: string): TreeNode | null => {
          if (node.id === idToRemove) return null;
          return {
            ...node,
            children: node.children.map(c => removeNodeInfo(c, idToRemove)).filter(Boolean) as TreeNode[]
          };
        };
        return removeNodeInfo(prev, selectedNode.id);
      });
      setSelectedNode(null);
      selectedNodeIdRef.current = null;
      fetchTree();
    } else {
      setValues({
        code: selectedNode.data?.code || '',
        title: selectedNode.data?.title || selectedNode.name || '',
        title_en: selectedNode.data?.title_en || '',
        accountType: selectedNode.data?.accountType ? String(selectedNode.data.accountType) : '',
        accountNature: selectedNode.data?.accountNature ? String(selectedNode.data.accountNature) : '',
        natureControl: selectedNode.data?.natureControl ? String(selectedNode.data.natureControl) : '',
        isActive: selectedNode.data?.isActive !== undefined ? selectedNode.data.isActive : true,
        trackingFeature: !!selectedNode.data?.trackingFeature,
        currencyFeature: !!selectedNode.data?.currencyFeature,
        exchangeableFeature: !!selectedNode.data?.exchangeableFeature,
        trackingQuantity: !!selectedNode.data?.trackingQuantity,
        trackingNumber: !!selectedNode.data?.trackingNumber,
        trackingDate: !!selectedNode.data?.trackingDate,
        relatedDetailedAccounts: Array.isArray(selectedNode.data?.relatedDetailedAccounts) ? selectedNode.data.relatedDetailedAccounts : [],
        authorizedUsers: getAuthorizedUsersFromStorage(selectedNode.id, selectedNode.data?.code || ''),
        frequentDescriptions: (Array.isArray(selectedNode.data?.frequentDescriptions) && selectedNode.data.frequentDescriptions.length > 0)
          ? selectedNode.data.frequentDescriptions
          : getFrequentDescriptionsFromStorage(selectedNode.id, selectedNode.data?.code || ''),
        natureAdjustments: (Array.isArray(selectedNode.data?.natureAdjustments) && selectedNode.data.natureAdjustments.length > 0)
          ? selectedNode.data.natureAdjustments
          : getNatureAdjustmentsFromStorage(selectedNode.id, selectedNode.data?.code || ''),
      });
      setErrors({});
    }
  };

  const isAccountValidForAdjustment = (x: any) => {
    // Note: getAccountLevel is already done since we only fetch level 3 (Moins) from backend API
    if (x.isActive === false) return false;

    // 7th Filter: Cannot be in the same group account
    const grpLen = parseInt(accountingSettings?.groupAccountLength || '2', 10);
    const mainGroup = values.code ? values.code.substring(0, grpLen) : '';
    const targetGroup = x.code ? x.code.substring(0, grpLen) : '';
    if (mainGroup && targetGroup && mainGroup === targetGroup) {
      return false;
    }

    const mainNature = values.accountNature ? String(values.accountNature) : '';
    const isMainDebtor = mainNature === '3' || mainNature === '5';
    const isMainCreditor = mainNature === '4' || mainNature === '6';
    
    const targetNature = x.accountNature ? String(x.accountNature) : '';
    
    if (isMainDebtor) {
      if (targetNature !== '4' && targetNature !== '6') return false;
    } else if (isMainCreditor) {
      if (targetNature !== '3' && targetNature !== '5') return false;
    } else {
      return false;
    }

    const getNormalizedLevels = (list: any[]) => {
      if (!list || !Array.isArray(list)) return [];
      return list
        .map(item => {
          const l = item.detailedLevel ? parseInt(item.detailedLevel, 10) : null;
          const tId = item.detailedTypeId || item.detailedType?.id || item.detailedType?.detailedTypesId;
          const finalTId = tId ? parseInt(tId.toString(), 10) : null;
          return { level: l, typeId: finalTId };
        })
        .filter(i => i.level !== null && i.typeId !== null && !isNaN(i.level) && !isNaN(i.typeId));
    };

    const mainNorm = getNormalizedLevels(values.relatedDetailedAccounts);
    const targetNorm = getNormalizedLevels(x.relatedDetailedAccounts);

    // Check common active levels
    for (const mn of mainNorm) {
      const hasLevel = targetNorm.some(t => t.level === mn.level);
      if (hasLevel) {
        const matchingTn = targetNorm.find(t => t.level === mn.level && t.typeId === mn.typeId);
        if (!matchingTn) return false;
      }
    }

    // REMOVED: Second loop that wrongly rejected target accounts with more permissive detailed types.

    return true;
  };

  const renderIcon = (node: TreeNode) => {
    if (node.isRoot) return <FolderTree className="w-4 h-4 text-indigo-500" />;
    if (node.children && node.children.length > 0) return <Folder className="w-4 h-4 text-blue-500" />;
    return <Box className="w-4 h-4 text-slate-400" />;
  };

  const isRootSelected = selectedNode?.isRoot || selectedNode?.data?.code === '0';

  return (
    <div className="relative flex h-full gap-4 p-4 rtl bg-slate-50 dark:bg-slate-950/50 overflow-hidden">
      <LoadingOverlay visible={isSubmitting || (!treeData && loading)} message={!treeData && loading ? "در حال دریافت اطلاعات..." : "لطفا منتظر بمانید..."} />
      {/* Right side: Coding Structure Box */}
      <div className="w-1/3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm overflow-hidden min-w-[300px]">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-sm bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-indigo-500" />
            <span>ساختار کدینگ حساب‌ها</span>
          </div>
        </div>
        
        <div className="p-2 border-b border-slate-100 dark:border-slate-800">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              fetchTree(searchQuery);
            }} 
            className="relative"
          >
            <input 
              type="text" 
              placeholder="جستجو..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs py-2 pr-8 pl-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
          </form>
        </div>

        <div className="flex-1 overflow-auto p-2 relative">
           {(!treeData || (treeData.children || []).length === 0) && (
             <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center space-y-3 bg-white/95 dark:bg-slate-900/95 z-10 overflow-y-auto">
                <FolderTree className="w-10 h-10 text-indigo-500 mb-0.5 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
                    انتخاب ساختار کدینگ پیش‌فرض
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                    ساختار حساب‌ها خالی است. لطفاً یکی از کدینگ‌های پیش‌فرض زیر را انتخاب نمایید:
                  </p>
                </div>

                <div className="flex flex-col gap-2 w-full max-w-sm text-right mt-1">
                  <button
                    type="button"
                    onClick={() => handleSeedDefault(1)}
                    disabled={isSubmitting}
                    className="flex items-center gap-3 p-2.5 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800/80 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-xl transition-all shadow-sm group text-right"
                  >
                    <div className="p-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                      <Factory className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        ۱- کدینگ تولیدی
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        ویژه شرکت‌های تولیدی و صنعتی
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSeedDefault(2)}
                    disabled={isSubmitting}
                    className="flex items-center gap-3 p-2.5 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800/80 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 rounded-xl transition-all shadow-sm group text-right"
                  >
                    <div className="p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        ۲- کدینگ بازرگانی
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        ویژه شرکت‌های بازرگانی و تجاری
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSeedDefault(3)}
                    disabled={isSubmitting}
                    className="flex items-center gap-3 p-2.5 bg-slate-50 hover:bg-amber-50 dark:bg-slate-800/80 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 rounded-xl transition-all shadow-sm group text-right"
                  >
                    <div className="p-2 bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                        ۳- کدینگ خدماتی
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        ویژه شرکت‌های خدماتی و مشاوره‌ای
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSeedDefault(4)}
                    disabled={isSubmitting}
                    className="flex items-center gap-3 p-2.5 bg-slate-50 hover:bg-blue-50 dark:bg-slate-800/80 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl transition-all shadow-sm group text-right"
                  >
                    <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                      <HardHat className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        ۴- کدینگ پیمانکاری
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        ویژه شرکت‌های پیمانکاری و پروژه‌ای
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSeedDefault(5)}
                    disabled={isSubmitting}
                    className="flex items-center gap-3 p-2.5 bg-slate-50 hover:bg-purple-50 dark:bg-slate-800/80 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 rounded-xl transition-all shadow-sm group text-right"
                  >
                    <div className="p-2 bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                        ۵- کدینگ مبتنی بر صورتهای مالی بعد از ۱۳۹۸
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        بر اساس استانداردهای حسابداری تجدیدنظر شده
                      </div>
                    </div>
                  </button>
                </div>
             </div>
           )}
           {treeData ? (
             <TreeView
               ref={treeRef}
               data={treeData}
               iconProvider={renderIcon}
               renderLabel={(node) => (
                 <div className="flex items-center gap-4 whitespace-nowrap">
                   <span className="text-[11px] font-bold text-slate-500 font-mono shrink-0 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{node.data?.code}</span>
                   <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{node.name}</span>
                 </div>
               )}
               selectedNodeId={selectedNode?.id}
               onChange={setTreeData}
               onSelect={handleNodeSelect}
               onAddNode={handleAddNode}
               onNodeUpdate={(nodeId, updatedFields) => {
                  if (selectedNode && selectedNode.id === nodeId) {
                     setValues((prev: any) => {
                       const merged = { ...prev, ...updatedFields };
                       if (updatedFields.title_en === '' && merged.title) {
                          // we could populate it but it might jump while typing.
                       }
                       return merged;
                     });
                     setSelectedNode((prev: any) => {
                       if (!prev) return prev;
                       return {
                         ...prev,
                         name: updatedFields.title !== undefined ? updatedFields.title : prev.name,
                         data: { ...prev.data, ...updatedFields }
                       };
                     });
                  }
               }}
               onNodeSave={async (nodeId, updatedFields) => {
                  if (!treeData) return false;
                  const findNode = (root: TreeNode): TreeNode | null => {
                     if (root.id === nodeId) return root;
                     for (const c of (root.children || [])) {
                        const res = findNode(c);
                        if (res) return res;
                     }
                     return null;
                  };
                  const node = findNode(treeData);
                  if (!node) return false;
                  
                  const valsToSave = { ...(node.data || {}), ...updatedFields };
                  setIsSubmitting(true);
                  const success = await saveToServer(node, valsToSave);
                  if (success) {
                    await fetchTree();
                  }
                  setIsSubmitting(false);
                  return success;
               }}
               onNodeCancel={(nodeId, isNewNode) => {
                  if (selectedNode && selectedNode.id === nodeId) {
                     handleCancelEdit();
                  }
               }}
               onDeleteNode={(nodeId) => {
                  const node = [treeData].map(n => {
                    const find = (root: TreeNode): TreeNode | null => {
                       if (root.id === nodeId) return root;
                       for (const c of (root.children || [])) {
                          const res = find(c);
                          if (res) return res;
                       }
                       return null;
                    };
                    return find(n);
                  })[0];
                  if (node) handleDeleteRequest(node);
               }}
               maxLevels={4}
               getAddChildLabel={(level) => {
                 if (level === 0) return "افزودن گروه حساب";
                 if (level === 1) return "افزودن حساب کل";
                 if (level === 2) return "افزودن حساب معین";
                 return "افزودن شاخه";
               }}
               nodeFields={[
                 { 
                   key: 'code', 
                   placeholder: 'کد', 
                   type: 'text',
                   maxLength: (level: number) => {
                     const g = parseInt(accountingSettings?.groupAccountLength || '2', 10);
                     const t = parseInt(accountingSettings?.totalAccountLength || '2', 10);
                     const s = parseInt(accountingSettings?.specificAccountLength || '2', 10);
                     if (level === 1) return g;
                     if (level === 2) return g + t;
                     if (level === 3) return g + t + s;
                     return g;
                   }
                 },
                 { key: 'title', placeholder: 'عنوان', type: 'text' },
                 { key: 'title_en', placeholder: 'عنوان انگلیسی', type: 'text' }
               ]}
               triggerExpandOnRowClick={false}
               triggerSelectOnRowClick={true}
             />
           ) : (
             <div className="text-sm p-4 text-slate-500 text-center">
               {loading ? 'در حال بارگذاری لیست حساب‌ها...' : 'درختی برای کدینگ حسابها یافت نشد.'}
             </div>
           )}
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/20 text-[10px] text-slate-400 text-center border-t border-slate-100 dark:border-slate-800">
           راست کلیک روی گروه‌ها برای افزودن امکانات بیشتر
        </div>
      </div>

        {/* Left side */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-[0_8px_30px_-4px_rgba(59,130,246,0.15)] dark:shadow-[0_8px_30px_-4px_rgba(59,130,246,0.05)] flex-1 flex flex-col overflow-hidden">
            {/* Action Bar Header */}
            <div className="relative flex flex-col flex-shrink-0 w-full m-0 border-b border-x-0 border-b-slate-200 dark:border-b-slate-800 rounded-none z-10">
              <div className="w-full bg-gradient-to-r rtl:bg-gradient-to-l from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 px-4 py-2 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <h3 className="text-[13px] font-medium">جزئیات{selectedNode ? `: ${selectedNode.name}` : ''}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <HelpButton hideLabel variant="ghost" className="text-white hover:text-white/80 hover:bg-transparent dark:hover:bg-transparent p-1 shadow-none" />
                  <FullscreenButton hideLabel variant="ghost" className="text-white hover:text-white/80 hover:bg-transparent dark:hover:bg-transparent p-1 shadow-none" />
                  <CloseButton hideLabel variant="ghost" onClick={() => removeTab(activeTabId || '')} className="text-white hover:text-white/80 hover:bg-transparent dark:hover:bg-transparent p-1 shadow-none" />
                </div>
              </div>
              <div className="Actionbar w-full bg-slate-50/50 dark:bg-slate-800/20 px-4 py-2 flex flex-nowrap items-center justify-between gap-4 overflow-x-auto no-scrollbar">
                <div className="flex flex-nowrap items-center gap-1.5 shrink-0 flex-1">
                  <NewButton onClick={handleNewGroup} disabled={isSubmitting || !treeData} hideLabel />
                  <SaveButton onClick={handleSave} disabled={!selectedNode || isSubmitting || values.code === '0'} hideLabel />
                  <SaveNewButton onClick={handleSaveNew} disabled={!selectedNode || isSubmitting || values.code === '0'} hideLabel />
                  <SaveCloseButton onClick={handleSaveClose} disabled={!selectedNode || isSubmitting || values.code === '0'} hideLabel />
                  <DeleteButton onClick={() => selectedNode && handleDeleteRequest(selectedNode)} disabled={!selectedNode || isSubmitting || isRootSelected} hideLabel />
                  <CancelButton onClick={handleCancel} disabled={isSubmitting} hideLabel />
                  <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                  <ExcelExportButton onClick={() => handleExportClick('excel')} disabled={isSubmitting || !treeData} hideLabel />
                  <WordExportButton onClick={() => handleExportClick('word')} disabled={isSubmitting || !treeData} hideLabel />
                  <PdfExportButton onClick={() => handleExportClick('pdf')} disabled={isSubmitting || !treeData} hideLabel />
                  <PrintButton onClick={() => handleExportClick('print')} disabled={isSubmitting || !treeData} hideLabel />
                </div>
              </div>
            </div>

            {selectedNode ? (
              <div className="flex-1 flex flex-col overflow-y-auto px-6 pt-4 pb-6 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
                <NumberInput 
                  label={(() => {
                    const l = getParentInfo(selectedNode.id, treeData).level;
                    if (l === 2) return "کد حساب کل";
                    if (l === 3) return "کد حساب معین";
                    return "کد گروه حساب";
                  })()}
                  value={values.code} 
                  onChange={(v) => handleChange('code', v)} 
                  error={errors.code}
                  required 
                  labelWidth="120px"
                  disabled={isRootSelected}
                  maxLength={(() => {
                    const l = getParentInfo(selectedNode.id, treeData).level;
                    const g = parseInt(accountingSettings?.groupAccountLength || '2', 10);
                    const t = parseInt(accountingSettings?.totalAccountLength || '2', 10);
                    const s = parseInt(accountingSettings?.specificAccountLength || '2', 10);
                    if (l === 2) return g + t;
                    if (l === 3) return g + t + s;
                    return g;
                  })()}
                />
                <TextInput 
                  label={(() => {
                    const l = getParentInfo(selectedNode.id, treeData).level;
                    if (l === 2) return "عنوان حساب کل";
                    if (l === 3) return "عنوان حساب معین";
                    return "عنوان گروه";
                  })()}
                  value={values.title} 
                  onChange={(v) => handleChange('title', v)} 
                  onBlur={() => handleBlur('title', values.title)}
                  error={errors.title}
                  required
                  labelWidth="120px"
                  disabled={isRootSelected}
                />
                <TextInput 
                  label="عنوان لاتین" 
                  value={values.title_en} 
                  onChange={(v) => handleChange('title_en', v)} 
                  onBlur={() => handleBlur('title_en', values.title_en)}
                  labelWidth="120px"
                  disabled={isRootSelected}
                />
                {getParentInfo(selectedNode.id, treeData).level === 1 && (
                  <Select
                    label="نوع حساب"
                    value={values.accountType}
                    onChange={(v) => handleChange('accountType', v)}
                    options={[
                      { label: 'ترازنامه‌ای', value: '1' },
                      { label: 'سود و زیانی', value: '2' },
                      { label: 'انتظامی', value: '3' },
                    ]}
                    placeholder="انتخاب کنید..."
                    error={errors.accountType}
                    required
                    labelWidth="120px"
                    disabled={isRootSelected}
                  />
                )}
                {(() => {
                  const l = getParentInfo(selectedNode.id, treeData).level;
                  if (l >= 1 && l <= 3) {
                    let options: any[] = [];
                    if (l === 1 || l === 2) {
                      options = [
                        { label: 'بدهکار', value: '1' },
                        { label: 'بستانکار', value: '2' },
                        { label: 'مهم نیست', value: '7' },
                      ];
                    } else if (l === 3) {
                      options = [
                        { label: 'بدهکار طی دوره', value: '3' },
                        { label: 'بستانکار طی دوره', value: '4' },
                        { label: 'بدهکار پایان دوره', value: '5' },
                        { label: 'بستانکار پایان دوره', value: '6' },
                        { label: 'مهم نیست', value: '7' },
                      ];
                    }

                    return (
                      <>
                        <Select
                          label="ماهیت حساب"
                          value={values.accountNature}
                          onChange={(v) => handleChange('accountNature', v)}
                          options={options}
                          placeholder="انتخاب کنید..."
                          error={errors.accountNature}
                          required
                          labelWidth="120px"
                          disabled={isRootSelected}
                        />
                        {l === 3 && (values.accountNature === '3' || values.accountNature === '4') && (
                          <Select
                            label="کنترل ماهیت"
                            value={values.natureControl}
                            onChange={(v) => handleChange('natureControl', v)}
                            options={[
                              { label: 'بدون کنترل', value: '1' },
                              { label: 'هشدار و ادامه عملیات', value: '2' },
                              { label: 'هشدار و توقف عملیات', value: '3' },
                            ]}
                            placeholder="انتخاب کنید..."
                            labelWidth="120px"
                            disabled={isRootSelected}
                          />
                        )}
                      </>
                    );
                  }
                  return null;
                })()}
                {getParentInfo(selectedNode.id, treeData).level !== 3 && (
                  <Checkbox
                    text="فعال"
                    checked={values.isActive}
                    onChange={(v) => handleChange('isActive', v)}
                    disabled={isRootSelected}
                  />
                )}
              </div>

              {getParentInfo(selectedNode.id, treeData).level === 3 && (
                <div className="flex flex-row flex-wrap items-center gap-8 mt-2 mb-2 w-full">
                  <div className="w-auto">
                    <GroupField label="ویژگی‌های حساب">
                      <div className="flex flex-wrap items-center gap-3 py-1">
                          <button
                            type="button"
                            onClick={() => !isRootSelected && handleChange('trackingQuantity', !values.trackingQuantity)}
                            disabled={isRootSelected}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-300 border cursor-pointer select-none",
                              values.trackingQuantity 
                                ? "bg-indigo-50 border-indigo-400 text-indigo-700 shadow-sm dark:bg-indigo-500/10 dark:border-indigo-500 dark:text-indigo-300 transform scale-[1.02]" 
                                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 dark:bg-[#1e293b] dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 hover:scale-[1.02]",
                              isRootSelected && "opacity-50 !cursor-not-allowed transform-none"
                            )}
                          >
                            <Layers className={cn("w-4 h-4 transition-colors", values.trackingQuantity ? "text-indigo-500" : "text-slate-400")} />
                            <span className={cn("font-medium", values.trackingQuantity ? "text-indigo-700 dark:text-indigo-300" : "text-slate-600 dark:text-slate-300")}>ویژگی تعدادی</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => !isRootSelected && handleChange('trackingNumber', !values.trackingNumber)}
                            disabled={isRootSelected}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-300 border cursor-pointer select-none",
                              values.trackingNumber 
                                ? "bg-rose-50 border-rose-400 text-rose-700 shadow-sm dark:bg-rose-500/10 dark:border-rose-500 dark:text-rose-300 transform scale-[1.02]" 
                                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 dark:bg-[#1e293b] dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 hover:scale-[1.02]",
                              isRootSelected && "opacity-50 !cursor-not-allowed transform-none"
                            )}
                          >
                            <Hash className={cn("w-4 h-4 transition-colors", values.trackingNumber ? "text-rose-500" : "text-slate-400")} />
                            <span className={cn("font-medium", values.trackingNumber ? "text-rose-700 dark:text-rose-300" : "text-slate-600 dark:text-slate-300")}>شماره پیگیری</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => !isRootSelected && handleChange('trackingDate', !values.trackingDate)}
                            disabled={isRootSelected}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-300 border cursor-pointer select-none",
                              values.trackingDate 
                                ? "bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm dark:bg-emerald-500/10 dark:border-emerald-500 dark:text-emerald-300 transform scale-[1.02]" 
                                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 dark:bg-[#1e293b] dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 hover:scale-[1.02]",
                              isRootSelected && "opacity-50 !cursor-not-allowed transform-none"
                            )}
                          >
                            <Calendar className={cn("w-4 h-4 transition-colors", values.trackingDate ? "text-emerald-500" : "text-slate-400")} />
                            <span className={cn("font-medium", values.trackingDate ? "text-emerald-700 dark:text-emerald-300" : "text-slate-600 dark:text-slate-300")}>تاریخ پیگیری</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => !isRootSelected && handleChange('currencyFeature', !values.currencyFeature)}
                            disabled={isRootSelected}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-300 border cursor-pointer select-none",
                              values.currencyFeature 
                                ? "bg-amber-50 border-amber-400 text-amber-700 shadow-sm dark:bg-amber-500/10 dark:border-amber-500 dark:text-amber-300 transform scale-[1.02]" 
                                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 dark:bg-[#1e293b] dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 hover:scale-[1.02]",
                              isRootSelected && "opacity-50 !cursor-not-allowed transform-none"
                            )}
                          >
                            <Coins className={cn("w-4 h-4 transition-colors", values.currencyFeature ? "text-amber-500" : "text-slate-400")} />
                            <span className={cn("font-medium", values.currencyFeature ? "text-amber-700 dark:text-amber-300" : "text-slate-600 dark:text-slate-300")}>ویژگی ارزی</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => !isRootSelected && handleChange('exchangeableFeature', !values.exchangeableFeature)}
                            disabled={isRootSelected}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-300 border cursor-pointer select-none",
                              values.exchangeableFeature 
                                ? "bg-cyan-50 border-cyan-400 text-cyan-700 shadow-sm dark:bg-cyan-500/10 dark:border-cyan-500 dark:text-cyan-300 transform scale-[1.02]" 
                                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 dark:bg-[#1e293b] dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 hover:scale-[1.02]",
                              isRootSelected && "opacity-50 !cursor-not-allowed transform-none"
                            )}
                          >
                            <ArrowRightLeft className={cn("w-4 h-4 transition-colors", values.exchangeableFeature ? "text-cyan-500" : "text-slate-400")} />
                            <span className={cn("font-medium", values.exchangeableFeature ? "text-cyan-700 dark:text-cyan-300" : "text-slate-600 dark:text-slate-300")}>تسعیرپذیر</span>
                          </button>
                      </div>
                    </GroupField>
                  </div>
                  <div className="flex-shrink-0 mr-[26px]">
                    <Checkbox
                      text="فعال"
                      checked={values.isActive}
                      onChange={(v) => handleChange('isActive', v)}
                      disabled={isRootSelected}
                    />
                  </div>
                </div>
              )}

              {getParentInfo(selectedNode.id, treeData).level >= 3 && (
                <div className="mt-4 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col flex-1 min-h-[250px]">
                  <div className="relative flex items-center border-b border-slate-100 dark:border-slate-800 mb-0 w-full group">
                    {showSubRightArrow && (
                      <button 
                        type="button"
                        className="absolute right-0 z-20 h-full px-1 bg-gradient-to-l from-white dark:from-gray-900 via-white dark:via-gray-900 to-transparent flex items-center justify-center hover:text-indigo-500 opacity-85 hover:opacity-100 transition-opacity"
                        onClick={() => scrollSubTabs('right')}
                      >
                        <ChevronRight className="w-5 h-5 text-slate-500 hover:text-indigo-500" />
                      </button>
                    )}
                    
                    <div 
                      ref={subTabsContainerRef}
                      className="flex flex-row overflow-x-auto overflow-y-hidden gap-6 flex-1 no-scrollbar scroll-smooth w-full"
                      onScroll={checkSubTabsScroll}
                    >
                      {(() => {
                        const currentLevel = getParentInfo(selectedNode.id, treeData).level;
                        const tabs = [
                          { id: 'detailedLevels', label: 'سطوح تفصیلی', icon: FolderTree },
                        ];
                        if (accountingSettings?.enableLedgerAccessControl === 'true') {
                          tabs.push({ id: 'info', label: 'کاربران مجاز', icon: Info });
                        }
                        if (currentLevel >= 3) {
                          tabs.push({ id: 'natureAdjustments', label: 'معین تعدیل ماهیت', icon: Layers });
                          tabs.push({ id: 'frequentDescriptions', label: 'شرح های پرتکرار', icon: FileText });
                        }
                        tabs.push({ id: 'attachments', label: 'ضمایم و پیوست‌ها', icon: Paperclip });
                        return tabs;
                      })().map(tab => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveSubTab(tab.id)}
                          className={cn("flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap", 
                            activeSubTab === tab.id 
                            ? 'border-indigo-500 text-indigo-600' 
                            : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'
                          )}
                        >
                          <tab.icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {showSubLeftArrow && (
                      <button 
                        type="button"
                        className="absolute left-0 z-20 h-full px-1 bg-gradient-to-r from-white dark:from-gray-900 via-white dark:via-gray-900 to-transparent flex items-center justify-center hover:text-indigo-500 opacity-85 hover:opacity-100 transition-opacity"
                        onClick={() => scrollSubTabs('left')}
                      >
                        <ChevronLeft className="w-5 h-5 text-slate-500 hover:text-indigo-500" />
                      </button>
                    )}
                  </div>
                  
                  <div className={cn("flex-1 rounded-2xl mt-[2px]", (activeSubTab !== 'detailedLevels' && activeSubTab !== 'info' && activeSubTab !== 'frequentDescriptions' && activeSubTab !== 'natureAdjustments') ? "flex items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/30" : "")}>
                    {activeSubTab === 'detailedLevels' ? (() => {
                        const levelsCount = parseInt(accountingSettings?.detailedLevelsCount || '10', 10);
                        const selectedTypesForLevel = values.relatedDetailedAccounts
                                 .filter((r: any) => parseInt(r.detailedLevel, 10) === activeDetailedLevel)
                                 .map((r: any) => String(r.detailedTypeId || r.detailedType?.id || r.detailedType?.detailedTypesId))
                                 .filter(Boolean);
                        const typesCount = new Set(selectedTypesForLevel).size;
                        const reduceHeight = levelsCount > 4 || typesCount > 5;
                        
                        return (
                          <div className={`flex gap-4 w-full px-[5px] transition-all duration-300 ${reduceHeight ? "h-[180px]" : "h-[300px]"}`}>
                             {/* Right Panel: Levels List */}
                             <div className="w-[30%] min-w-[250px] border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col bg-slate-50/50 dark:bg-slate-900 overflow-hidden shrink-0 shadow-sm">
                               <div className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
                                 <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">سطوح تفصیلی</span>
                                 <span className="text-xs text-slate-500 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600 shadow-sm">{levelsCount} سطح مجاز</span>
                               </div>
                               <div className="flex-1 overflow-y-auto custom-scrollbar">
                                 <table className="w-full text-sm text-right">
                                   <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 sticky top-0 backdrop-blur-sm z-10">
                                     <tr>
                                       <th className="px-4 py-1 font-medium border-b border-slate-200 dark:border-slate-700">عنوان</th>
                                       <th className="px-4 py-1 w-12 text-center border-b border-slate-200 dark:border-slate-700">فعال</th>
                                     </tr>
                                   </thead>
                                   <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                                     {Array.from({ length: levelsCount }, (_, i) => i + 1).map((level) => {
                                       const ordinalPersian = ["اول", "دوم", "سوم", "چهارم", "پنجم", "ششم", "هفتم", "هشتم", "نهم", "دهم"];
                                       const levelTitle = `سطح ${ordinalPersian[level - 1] || level}`;
                                       const isActive = activeDetailedLevel === level;
                                       const hasTypes = values.relatedDetailedAccounts.some((r: any) => parseInt(r.detailedLevel, 10) === level && (r.detailedTypeId || r.detailedType?.id || r.detailedType?.detailedTypesId));
                                       
                                       return (
                                         <tr 
                                           key={level} 
                                           onClick={() => setActiveDetailedLevel(level)}
                                           className={cn(
                                             "cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50",
                                             isActive ? "bg-indigo-50/60 dark:bg-indigo-500/10" : ""
                                           )}
                                         >
                                           <td className="px-4 py-1.5 text-slate-700 dark:text-slate-300">
                                              <div className="flex items-center justify-between">
                                                <span className={cn(isActive && "font-semibold text-indigo-600 dark:text-indigo-400")}>{levelTitle}</span>
                                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400"></div>}
                                              </div>
                                           </td>
                                           <td className="px-4 py-1.5 text-center" onClick={(e) => e.stopPropagation()}>
                                             <input 
                                               type="checkbox" 
                                               className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                               checked={hasTypes}
                                               readOnly
                                             />
                                           </td>
                                         </tr>
                                       );
                                     })}
                                   </tbody>
                                 </table>
                               </div>
                             </div>
    
                             {/* Left Panel: Types for selected level */}
                             <div className="flex-1 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                               <div className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                   <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">انواع تفصیلی</span>
                                   <span className="text-xs text-slate-500 bg-white/60 dark:bg-slate-700 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-600/50 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">سطح {["اول", "دوم", "سوم", "چهارم", "پنجم", "ششم", "هفتم", "هشتم", "نهم", "دهم"][activeDetailedLevel - 1] || activeDetailedLevel}</span>
                                 </div>
                                 <button
                                   type="button"
                                   onClick={() => setSelectingDetailedLevel(activeDetailedLevel)}
                                   className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm active:scale-95"
                                 >
                                   <Plus className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                                   افزودن
                                 </button>
                               </div>
                               
                               <div className="flex-1 overflow-y-auto custom-scrollbar">
                                 {selectedTypesForLevel.length > 0 ? (
                                     <table className="w-full text-sm text-right border-collapse">
                                       <thead className="bg-slate-50/80 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400 sticky top-0 backdrop-blur-sm z-10">
                                         <tr>
                                           <th className="px-4 py-1 font-medium border-b border-slate-200 dark:border-slate-700">عنوان</th>
                                           <th className="px-4 py-1 w-12 text-center border-b border-slate-200 dark:border-slate-700"></th>
                                         </tr>
                                       </thead>
                                       <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                         {Array.from(new Set(selectedTypesForLevel)).map((tId: any, idx: number) => {
                                           const dt = detailedTypes.find((d: any) => String(d.detailedTypesId || d.id) === String(tId));
                                           return (
                                             <tr key={`${tId}-${idx}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                                <td className="px-4 py-1.5 text-slate-700 dark:text-slate-200 font-medium">
                                                  {dt?.title || 'نامشخص'}
                                                </td>
                                                <td className="px-4 py-1.5 text-center">
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      let newArr = values.relatedDetailedAccounts.filter((r: any) => !(parseInt(r.detailedLevel, 10) === activeDetailedLevel && String(r.detailedTypeId || r.detailedType?.id || r.detailedType?.detailedTypesId) === tId));
                                                      if (newArr.filter((r: any) => parseInt(r.detailedLevel, 10) === activeDetailedLevel).length === 0) {
                                                         newArr.push({ detailedLevel: activeDetailedLevel, detailedTypeId: '' });
                                                      }
                                                      handleChange('relatedDetailedAccounts', newArr);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                                                    title="حذف این نوع تفصیلی"
                                                  >
                                                    <X className="w-4 h-4" />
                                                  </button>
                                                </td>
                                             </tr>
                                           );
                                         })}
                                       </tbody>
                                     </table>
                                   ) : (
                                     <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm gap-3 p-8">
                                       <FolderTree className="w-12 h-12 text-slate-200 dark:text-slate-700" />
                                       <p>نوع تفصیلی برای این سطح وجود ندارد</p>
                                       <button
                                         type="button"
                                     onClick={() => setSelectingDetailedLevel(activeDetailedLevel)}
                                     className="text-xs text-indigo-500 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 font-medium px-4 py-2 rounded-lg shadow-sm transition-all active:scale-95 mt-2"
                                   >
                                     <Plus className="w-3.5 h-3.5 inline-block mr-1 align-sub" />
                                     افزودن تفصیلی
                                   </button>
                                 </div>
                               )}
                           </div>
                         </div>
                      </div>
                    );
                  })() : activeSubTab === 'info' ? (
                    <div className="w-full h-[220px] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                      <TabCellRow
                        hideHeader
                        className="border-none shadow-none h-full rounded-none w-full"
                        tabs={[
                          {
                            id: 'info',
                            label: 'کاربران مجاز',
                            columns: [
                              { 
                                key: 'username', 
                                header: 'نام کاربری', 
                                type: 'custom', 
                                width: '200px',
                                render: (row, rIndex) => {
                                  const selectedUser = usersList.find(u => u.username === row.username);
                                  return (
                                    <MultiColumnDropdown
                                      data={usersList}
                                      columns={[
                                        { key: 'username', label: 'نام کاربری', width: 120 },
                                        { key: 'firstName', label: 'نام', width: 120 },
                                        { key: 'lastName', label: 'نام خانوادگی', width: 120 },
                                      ]}
                                      displayKey="username"
                                      value={selectedUser}
                                      placeholder="انتخاب کاربر..."
                                      enableMultiSelection={true}
                                      onChange={(userOrUsers: any) => {
                                        const currentUsers = [...(values.authorizedUsers || [])];
                                        const itemsArr = Array.isArray(userOrUsers) ? userOrUsers : (userOrUsers ? [userOrUsers] : []);
                                        if (itemsArr.length > 0 && currentUsers[rIndex]) {
                                          currentUsers[rIndex] = {
                                            ...currentUsers[rIndex],
                                            username: itemsArr[0].username,
                                            firstName: itemsArr[0].firstName,
                                            lastName: itemsArr[0].lastName,
                                          };
                                          let insertIdx = rIndex + 1;
                                          for (let i = 1; i < itemsArr.length; i++) {
                                            const u = itemsArr[i];
                                            currentUsers.splice(insertIdx, 0, {
                                              id: Date.now() + i,
                                              username: u.username,
                                              firstName: u.firstName,
                                              lastName: u.lastName,
                                            });
                                            insertIdx++;
                                          }
                                          handleChange('authorizedUsers', currentUsers);
                                        }
                                      }}
                                    />
                                  );
                                }
                              },
                              { key: 'firstName', header: 'نام', type: 'text', width: '130px' },
                              { key: 'lastName', header: 'نام خانوادگی', type: 'text', width: '150px' },
                              { key: 'createDoc', header: 'ایجاد سند', type: 'checkbox', width: '85px' },
                              { key: 'viewDoc', header: 'مشاهده سند', type: 'checkbox', width: '85px' },
                              { key: 'editDoc', header: 'ویرایش سند', type: 'checkbox', width: '85px' },
                              { key: 'deleteDoc', header: 'حذف سند', type: 'checkbox', width: '85px' },
                              { key: 'report', header: 'گزارش', type: 'checkbox', width: '85px' },
                              { key: 'sendData', header: 'ارسال اطلاعات', type: 'checkbox', width: '95px' },
                            ]
                          }
                        ]}
                        value={values.authorizedUsers}
                        onChange={(newUsers) => handleChange('authorizedUsers', newUsers)}
                      />
                    </div>
                  ) : activeSubTab === 'natureAdjustments' ? (
                    <div className="w-full h-[220px] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                      <TabCellRow
                        hideHeader
                        className="border-none shadow-none h-full rounded-none w-full"
                        tabs={[
                          {
                            id: 'natureAdjustments',
                            label: 'معین تعدیل ماهیت',
                            columns: [
                              { 
                                key: 'moinCode', 
                                header: 'کد معین', 
                                type: 'custom', 
                                width: '25%', 
                                required: true,
                                render: (row, rIndex) => {
                                  const selectedVal = row.moinCode ? { code: row.moinCode, title: row.moinTitle } : null;
                                  return (
                                    <div className="p-1 w-full min-w-0 overflow-hidden">
                                      <SlAccountDropDown
                                        id={`moinCode-dropdown-${rIndex}`}
                                        value={selectedVal}
                                        dropdownPlacement="bottom"
                                        displayOnlyCode={true}
                                        excludeCode={values.code}
                                        customFilter={isAccountValidForAdjustment}
                                        apiParams={{
                                          filterByAdjustingNature: values.accountNature
                                        }}
                                        onChange={(acc: any) => {
                                          const nextAdjs = [...(values.natureAdjustments || [])];
                                          if (nextAdjs[rIndex]) {
                                            const getNatureLabel = (natureNum: any) => {
                                              const n = String(natureNum);
                                              if (n === '3') return 'بدهکار طی دوره';
                                              if (n === '4') return 'بستانکار طی دوره';
                                              if (n === '5') return 'بدهکار پایان دوره';
                                              if (n === '6') return 'بستانکار پایان دوره';
                                              if (n === '7') return 'مهم نیست';
                                              return '';
                                            };
                                            nextAdjs[rIndex] = {
                                              ...nextAdjs[rIndex],
                                              moinCode: acc ? acc.code : '',
                                              moinTitle: acc ? acc.title : '',
                                              nature: acc ? getNatureLabel(acc.accountNature) : '',
                                            };
                                            handleChange('natureAdjustments', nextAdjs);
                                          }
                                        }}
                                      />
                                    </div>
                                  );
                                }
                              },
                              { 
                                key: 'moinTitle', 
                                header: 'عنوان معین', 
                                type: 'custom', 
                                width: '25%', 
                                render: (row) => (
                                  <div className="p-1.5 px-2 text-xs text-slate-700 dark:text-slate-300 select-none truncate">
                                    {row.moinTitle || ''}
                                  </div>
                                )
                              },
                              { 
                                key: 'nature', 
                                header: 'ماهیت', 
                                type: 'custom', 
                                width: '20%', 
                                render: (row) => (
                                  <div className="p-1.5 px-2 text-xs text-slate-700 dark:text-slate-300 select-none truncate">
                                    {row.nature || ''}
                                  </div>
                                )
                              },
                              { 
                                key: 'description', 
                                header: 'شرح', 
                                type: 'text', 
                                width: '15%' 
                              },
                              { 
                                key: 'description2', 
                                header: 'شرح(2)', 
                                type: 'text', 
                                width: '15%' 
                              },
                            ]
                          }
                        ]}
                        value={values.natureAdjustments || []}
                        onChange={(newAdjs) => handleChange('natureAdjustments', newAdjs)}
                      />
                      {errors.natureAdjustments && (
                         <div className="text-xs text-red-500 mt-2 px-2 pb-2 font-bold bg-white dark:bg-slate-900">{errors.natureAdjustments}</div>
                      )}
                    </div>
                  ) : activeSubTab === 'frequentDescriptions' ? (
                    <div className="w-full h-[220px] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                      <TabCellRow
                        hideHeader
                        className="border-none shadow-none h-full rounded-none w-full"
                        tabs={[
                          {
                            id: 'frequentDescriptions',
                            label: 'شرح های پرتکرار',
                            columns: [
                              { key: 'description', header: 'شرح', type: 'textarea', width: '50%', required: true },
                              { key: 'description2', header: 'شرح(2)', type: 'textarea', width: '50%' },
                            ]
                          }
                        ]}
                        value={values.frequentDescriptions || []}
                        onChange={(newDescs) => handleChange('frequentDescriptions', newDescs)}
                      />
                    </div>
                  ) : (
                      <div className="text-center p-12 max-w-sm mx-auto">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                           <Info className="w-6 h-6 text-slate-300" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-400 mb-2">در انتظار پیکربندی</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                           فیلد‌های مربوط به بخش <span className="text-indigo-400 font-bold">"مدیریت فایل"</span> در فازهای بعدی پیاده‌سازی خواهد شد.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center flex flex-col items-center gap-3">
                  <Info className="w-8 h-8 opacity-50" />
                  <p>گروه حسابی از درختواره سمت راست انتخاب کنید.</p>
                </div>
              </div>
            )}
          </div>
        </div>

      {selectingDetailedLevel !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm rtl p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                انتخاب نوع تفصیلی (برای تفصیلی سطح {selectingDetailedLevel})
              </h3>
              <button 
                type="button" 
                onClick={() => setSelectingDetailedLevel(null)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-hidden relative" dir="rtl">
              <MainDataGrid
        entityName="Account"
                title="انواع تفصیلی"
                data={detailedTypes.filter((dt: any) => {
                   const usedTypes = values.relatedDetailedAccounts
                     .filter((r: any) => !!(r.detailedTypeId || r.detailedType?.id || r.detailedType?.detailedTypesId))
                     .map((r: any) => String(r.detailedTypeId || r.detailedType?.id || r.detailedType?.detailedTypesId));
                   return !usedTypes.includes(String(dt.detailedTypesId || dt.id));
                })}
                columns={[
                  { key: 'code', header: 'کد نوع تفصیلی' },
                  { key: 'title', header: 'عنوان نوع تفصیلی' },
                ]}
                enableMultiSelection={false}
                hideExcelExport
                hidePdfExport
                hideWordExport
                onRowDoubleClick={(item: any) => {
                   const itemId = String(item.detailedTypesId || item.id);
                   let newArr = [...values.relatedDetailedAccounts];
                   
                   // filter out any empty template for this level
                   newArr = newArr.filter((r: any) => !(parseInt(r.detailedLevel, 10) === selectingDetailedLevel && !r.detailedTypeId));
                   
                   newArr.push({ detailedLevel: selectingDetailedLevel, detailedTypeId: itemId });
                   handleChange('relatedDetailedAccounts', newArr);
                   setSelectingDetailedLevel(null);
                }}
              />
              <div className="text-xs text-slate-400 mt-2 text-center">
                جهت انتخاب، روی سطر مورد نظر دوبار کلیک کنید.
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!nodeToDelete}
        title="حذف گروه حساب"
        message={`آیا از حذف اکانت ${nodeToDelete?.name || ''} اطمینان دارید؟`}
        confirmText="حذف"
        cancelText="انصراف"
        onConfirm={executeDelete}
        onCancel={() => setNodeToDelete(null)}
      />

      {exportModalVisible && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm rtl p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                {exportAction === "excel" ? "ارسال به اکسل" : exportAction === "pdf" ? "ارسال به پی‌دی‌اف" : exportAction === "word" ? "ارسال به ورد" : "چاپ ساختار کدینگ"}
              </h3>
              <button 
                type="button" 
                onClick={() => setExportModalVisible(false)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                لطفا مشخص کنید اطلاعات کدام یک از سطوح ساختار حساب‌ها {(exportAction === "print") ? "چاپ" : "ارسال"} شود:
              </p>
              <div className="flex flex-col gap-3 mr-2">
                <Checkbox 
                  text="گروه حساب" 
                  checked={exportLevels.group} 
                  onChange={(v) => setExportLevels((prev: any) => ({...prev, group: v}))} 
                  className="!w-auto justify-start"
                />
                <Checkbox 
                  text="حساب کل" 
                  checked={exportLevels.total} 
                  onChange={(v) => setExportLevels((prev: any) => ({...prev, total: v}))} 
                  className="!w-auto justify-start"
                />
                <Checkbox 
                  text="حساب معین" 
                  checked={exportLevels.specific} 
                  onChange={(v) => setExportLevels((prev: any) => ({...prev, specific: v}))} 
                  className="!w-auto justify-start"
                />
                <Checkbox 
                  text="سطوح تفصیلی" 
                  checked={exportLevels.detailed} 
                  onChange={(v) => setExportLevels((prev: any) => ({...prev, detailed: v}))} 
                  className="!w-auto justify-start"
                />
              </div>
              
              <div className="mt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <button 
                    className="px-5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm transition-colors"
                    onClick={() => setExportModalVisible(false)}
                    disabled={isSubmitting}
                  >
                    انصراف
                  </button>
                  <button 
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center gap-2"
                    onClick={handleExportData}
                    disabled={isSubmitting || Object.values(exportLevels).every(v => !v)}
                  >
                    {isSubmitting && <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>}
                    {exportAction === "print" ? "تایید و چاپ" : "تایید و ارسال"}
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

