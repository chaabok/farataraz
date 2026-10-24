"use client";

import React, { useState, useRef, useEffect } from 'react';
import { SimpleForm, FieldConfig } from '../SimpleForm';
import { TreeView, TreeNode, TreeViewRef, NumberInput, MultiSelect, MultiColumnDropdown, TextInput, Select, FormFieldWrapper } from '../../inputs';
import { useTabs } from '../../TabsProvider';
import { useToast } from '../../ToastProvider';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { LoadingOverlay } from '../../ui/LoadingOverlay';
import { FolderTree, Folder, File, Layers, Package, User } from 'lucide-react';
import { TabCellRow, TabCellConfig } from '../TabCellRow';
import { apiFetch } from '@/lib/utils';
import { CheckBoxRightLabel } from '@/components/inputs/CheckBoxRightLabel';
import { GeoLocationDropDown } from '@/components/inputs/GeoLocationDropDown';

const initialTree: TreeNode = {
  id: 'root',
  name: 'انبار و محل فیزیکی کالا',
  isRoot: true,
  deletable: false,
  children: []
};

export default function Warehouse() {
  const { openTab, closeTab, addTab } = useTabs();
  const { showToast } = useToast();
  const treeRef = useRef<TreeViewRef>(null);

  const deletedUnsavedIdsRef = useRef<Set<string>>(new Set());
  const savedUnsavedIdsRef = useRef<Set<string>>(new Set());

  const isUnsavedId = (id: string | number | undefined | null): boolean => {
    if (!id || id === 'root') return false;
    const strId = id.toString();
    return isNaN(Number(strId)) || strId.startsWith('new-');
  };

  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [formValues, setFormValues] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDocumentNoAuto, setIsDocumentNoAuto] = useState<boolean>(false);
  const [activeDetailsTab, setActiveDetailsTab] = useState<'products' | 'address' | 'keeper' | 'users'>('products');
  const [nodeToDelete, setNodeToDelete] = useState<TreeNode | null>(null);
  
  const handleNodeSelect = async (node: TreeNode | null) => {
    setSelectedNode(node);
    if (!node || node.isRoot) {
      setFormValues({});
      setIsDocumentNoAuto(false);
      return;
    }
    
    // Fetch full details if it's an existing node
    const isExisting = !isUnsavedId(node.id);
    if (isExisting) {
      try {
        setLoading(true);
        setIsDocumentNoAuto(false);
        const detailRes = await apiFetch(`/api/inv/warehouses/${node.id}`);
        if (detailRes.ok) {
          const detail = await detailRes.json();
          if (detail) {
            setFormValues({
              ...detail,
              name: detail.WarehouseTitle,
              code: detail.WarehouseCode,
              WarehouseAddresses: (detail.WarehouseAddresses && detail.WarehouseAddresses.length > 0) ? detail.WarehouseAddresses : [
                {
                  AddressCity: detail.AddressCity || '',
                  AddressState: detail.AddressState || '',
                  AddressTitle: detail.AddressTitle || '',
                  AddressTitle2: detail.AddressTitle2 || '',
                  PostalCode: detail.PostalCode || '',
                  Longitude: detail.Longitude || '',
                  Latitude: detail.Latitude || '',
                  AddressCityObj: detail.AddressCity ? { title: detail.AddressCity, province: detail.AddressState } : null
                }
              ]
            });
          }
        }
      } catch(err) {
        showToast('خطا در دریافت اطلاعات', 'error');
      } finally {
        setLoading(false);
      }
    } else {
      let codeToUse = node.code || node.data?.WarehouseCode || '';
      let isAuto = false;

      try {
        const nextFetch = await apiFetch('/api/inv/warehouses/next-number');
        if (nextFetch.ok) {
          const nextRes = await nextFetch.json();
          isAuto = !!nextRes.isDocumentNumberAuto;
          setIsDocumentNoAuto(isAuto);
          if (nextRes.error) {
            showToast(nextRes.error, "error");
          }
          if (nextRes.documentNumber) {
            codeToUse = nextRes.documentNumber;
          }
        }
      } catch (e) {
        console.error('Failed to fetch next warehouse code:', e);
      }

      const { WarehouseCode: _prevCode, ...restNodeData } = node.data || {};
      setFormValues({
        name: node.name || 'انبار جدید',
        code: codeToUse,
        WarehouseType: 1,
        IsActive: true,
        WarehouseAddresses: [
          {
            AddressCity: node.data?.AddressCity || '',
            AddressState: node.data?.AddressState || '',
            AddressTitle: node.data?.AddressTitle || '',
            AddressTitle2: node.data?.AddressTitle2 || '',
            PostalCode: node.data?.PostalCode || '',
            Longitude: node.data?.Longitude || '',
            Latitude: node.data?.Latitude || '',
            AddressCityObj: node.data?.AddressCityObj || (node.data?.AddressCity ? { title: node.data.AddressCity, province: node.data.AddressState } : null)
          }
        ],
        ...restNodeData,
        WarehouseCode: codeToUse
      });

      if (codeToUse && node.code !== codeToUse) {
        setSelectedNode(prev => prev ? {
          ...prev,
          code: codeToUse,
          data: { ...(prev.data || {}), WarehouseCode: codeToUse }
        } : prev);

        if (treeData) {
          const updateCodeInTree = (n: TreeNode): TreeNode => {
            if (n.id === node.id) {
              return { ...n, code: codeToUse, data: { ...(n.data || {}), WarehouseCode: codeToUse } };
            }
            return { ...n, children: (n.children || []).map(updateCodeInTree) };
          };
          setTreeData(updateCodeInTree(treeData));
        }
      }
    }
  };

  const fetchTree = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const resResponse = await apiFetch('/api/inv/warehouses');
      let dbWarehouses: any[] = [];
      if (resResponse.ok) {
        const res = await resResponse.json();
        if (Array.isArray(res)) {
          dbWarehouses = res;
        }
      }

      // Build tree from DB records
      const buildDbTree = (parentId: number | null): TreeNode[] => {
        return dbWarehouses
          .filter((item: any) => (parentId === null ? !item.ParentRef : item.ParentRef === parentId))
          .map((item: any) => ({
            id: item.WarehouseID.toString(),
            name: item.WarehouseTitle || 'بدون عنوان',
            code: item.WarehouseCode || '',
            data: item,
            isRoot: false,
            deletable: true,
            children: buildDbTree(item.WarehouseID),
          }));
      };

      const topLevelDbNodes = buildDbTree(null);

      // Extract unsaved nodes from current treeData (or initialTree if treeData is null)
      const baseTreeToExtract = treeData || initialTree;
      const unsavedItems: { parentId: string | null; node: TreeNode }[] = [];

      const extractUnsaved = (currNode: TreeNode, currentParentId: string | null) => {
        if (!currNode) return;
        if (currNode.id !== 'root' && isUnsavedId(currNode.id) && !deletedUnsavedIdsRef.current.has(currNode.id) && !savedUnsavedIdsRef.current.has(currNode.id)) {
          const cleanUnsavedNode = (n: TreeNode): TreeNode => {
            return {
              ...n,
              children: (n.children || [])
                .filter(c => isUnsavedId(c.id) && !deletedUnsavedIdsRef.current.has(c.id) && !savedUnsavedIdsRef.current.has(c.id))
                .map(cleanUnsavedNode)
            };
          };

          unsavedItems.push({
            parentId: currentParentId,
            node: cleanUnsavedNode(currNode)
          });
          return;
        }

        if (currNode.children && Array.isArray(currNode.children)) {
          for (const child of currNode.children) {
            extractUnsaved(child, currNode.id);
          }
        }
      };

      extractUnsaved(baseTreeToExtract, 'root');

      // Attach unsaved items to DB tree
      const rootChildren = [...topLevelDbNodes];

      const attachUnsavedNode = (targetNodes: TreeNode[], parentId: string, nodeToAttach: TreeNode): boolean => {
        if (parentId === 'root') {
          if (!targetNodes.some(n => n.id === nodeToAttach.id)) {
            targetNodes.push(nodeToAttach);
          }
          return true;
        }
        for (const target of targetNodes) {
          if (target.id === parentId) {
            if (!target.children) target.children = [];
            if (!target.children.some(n => n.id === nodeToAttach.id)) {
              target.children.push(nodeToAttach);
            }
            return true;
          }
          if (target.children && target.children.length > 0) {
            const attached = attachUnsavedNode(target.children, parentId, nodeToAttach);
            if (attached) return true;
          }
        }
        return false;
      };

      for (const item of unsavedItems) {
        const parentId = item.parentId || 'root';
        const attached = attachUnsavedNode(rootChildren, parentId, item.node);
        if (!attached && parentId !== 'root') {
          if (!rootChildren.some(n => n.id === item.node.id)) {
            rootChildren.push(item.node);
          }
        }
      }

      const treeResult: TreeNode = {
        ...initialTree,
        children: rootChildren
      };

      setTreeData(treeResult);
      if (selectedNode && !selectedNode.isRoot) {
        const findNodeInTree = (n: TreeNode, id: string): TreeNode | null => {
          if (n.id === id) return n;
          for (const child of (n.children || [])) {
            const found = findNodeInTree(child, id);
            if (found) return found;
          }
          return null;
        };
        const matched = findNodeInTree(treeResult, selectedNode.id);
        if (matched) {
          setSelectedNode(matched);
        } else {
          const defaultNode = (treeResult.children && treeResult.children.length > 0) ? treeResult.children[0] : treeResult;
          handleNodeSelect(defaultNode);
        }
      } else {
        const defaultNode = (treeResult.children && treeResult.children.length > 0) ? treeResult.children[0] : treeResult;
        handleNodeSelect(defaultNode);
      }
    } catch (err) {
      console.error(err);
      showToast('خطا در دریافت اطلاعات انبارها', 'error');
      if (!treeData) {
        setTreeData(initialTree);
        if (!selectedNode) {
          const defaultNode = (initialTree.children && initialTree.children.length > 0) ? initialTree.children[0] : initialTree;
          handleNodeSelect(defaultNode);
        }
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  const handleAddNode = (parentId: string | null) => {
    return {
      name: 'انبار جدید',
      code: '',
      data: {
        WarehouseType: 1,
        IsActive: true
      }
    };
  };

  const handleFormChange = (key: string, value: any) => {
    setFormValues((prev: any) => ({ ...prev, [key]: value }));
    if (selectedNode) {
      setSelectedNode(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          name: key === 'WarehouseTitle' ? value : prev.name,
          code: key === 'WarehouseCode' ? value : prev.code,
          data: { ...prev.data, [key]: value }
        };
      });
      // also update treeData locally
      if (treeData) {
        const updateNodeInTree = (node: TreeNode): TreeNode => {
          if (node.id === selectedNode.id) {
            return {
              ...node,
              name: key === 'WarehouseTitle' ? value : node.name,
              code: key === 'WarehouseCode' ? value : node.code,
              data: { ...node.data, [key]: value }
            };
          }
          return { ...node, children: node.children.map(updateNodeInTree) };
        };
        setTreeData(updateNodeInTree(treeData));
      }
    }
  };

  const handleSave = async () => {
    if (!selectedNode || selectedNode.isRoot) return;

    // Validation for Header mandatory fields: Type, Code, Title, Nature
    const warehouseType = formValues.WarehouseType;
    if (warehouseType === undefined || warehouseType === null || warehouseType === '') {
      showToast('لطفا فیلد «نوع (انبار/محل فیزیکی)» را انتخاب نمایید.', 'error');
      return;
    }

    const warehouseCode = (formValues.WarehouseCode !== undefined && formValues.WarehouseCode !== null && formValues.WarehouseCode !== '')
      ? formValues.WarehouseCode
      : formValues.code;
    if (warehouseCode === undefined || warehouseCode === null || warehouseCode.toString().trim() === '') {
      showToast('لطفا فیلد «کد» را وارد نمایید.', 'error');
      return;
    }

    const warehouseTitle = (formValues.WarehouseTitle !== undefined && formValues.WarehouseTitle !== null && formValues.WarehouseTitle !== '')
      ? formValues.WarehouseTitle
      : formValues.name;
    if (!warehouseTitle || warehouseTitle.toString().trim() === '') {
      showToast('لطفا فیلد «عنوان» را وارد نمایید.', 'error');
      return;
    }

    const warehouseNature = formValues.WarehouseNature;
    if (warehouseNature === undefined || warehouseNature === null || warehouseNature === '') {
      showToast('لطفا فیلد «ماهیت انبار» را انتخاب نمایید.', 'error');
      return;
    }

    // Validation for Related Products tab: ProductCode is mandatory for every row
    const products = formValues.WarehouseProducts;
    if (Array.isArray(products) && products.length > 0) {
      for (let i = 0; i < products.length; i++) {
        const prod = products[i];
        if (!prod.ProductCode || prod.ProductCode.toString().trim() === '') {
          showToast(`لطفا کد کالا را در ردیف ${i + 1} تب کالاهای مرتبط انتخاب نمایید.`, 'error');
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formValues,
        WarehouseType: warehouseType,
        WarehouseCode: warehouseCode,
        WarehouseTitle: warehouseTitle,
        WarehouseNature: warehouseNature,
      };

      if (Array.isArray(payload.WarehouseAddresses)) {
        payload.WarehouseAddresses = payload.WarehouseAddresses.map((addr: any) => ({
          ...addr,
          WarehouseAddressID: (addr.WarehouseAddressID !== undefined && addr.WarehouseAddressID !== null && addr.WarehouseAddressID !== '' && !isNaN(Number(addr.WarehouseAddressID))) ? Number(addr.WarehouseAddressID) : undefined
        }));
      }
      if (Array.isArray(payload.WarehouseProducts)) {
        payload.WarehouseProducts = payload.WarehouseProducts.map((p: any) => ({
          ...p,
          WarehouseProductID: (p.WarehouseProductID !== undefined && p.WarehouseProductID !== null && p.WarehouseProductID !== '' && !isNaN(Number(p.WarehouseProductID))) ? Number(p.WarehouseProductID) : undefined,
          MeasurementUnitRef: (p.MeasurementUnitRef !== undefined && p.MeasurementUnitRef !== null && p.MeasurementUnitRef !== '' && !isNaN(Number(p.MeasurementUnitRef))) ? Number(p.MeasurementUnitRef) : undefined
        }));
      }
      if (Array.isArray(payload.WarehouseUsers)) {
        payload.WarehouseUsers = payload.WarehouseUsers.map((u: any) => ({
          ...u,
          WarehouseUserID: (u.WarehouseUserID !== undefined && u.WarehouseUserID !== null && u.WarehouseUserID !== '' && !isNaN(Number(u.WarehouseUserID))) ? Number(u.WarehouseUserID) : undefined,
          UserRef: (u.UserRef !== undefined && u.UserRef !== null && u.UserRef !== '' && !isNaN(Number(u.UserRef))) ? Number(u.UserRef) : undefined
        }));
      }
      if (Array.isArray(payload.WarehouseKeepers)) {
        payload.WarehouseKeepers = payload.WarehouseKeepers.map((k: any) => {
          const ref = typeof k === 'object' ? (k.WarehouseKeeperRef || k.WarehouseKeeper?.partyId || k.WarehouseKeeper?.PartyID || k.partyId) : k;
          return {
            ...k,
            WarehouseKeeperID: (k.WarehouseKeeperID !== undefined && k.WarehouseKeeperID !== null && k.WarehouseKeeperID !== '' && !isNaN(Number(k.WarehouseKeeperID))) ? Number(k.WarehouseKeeperID) : undefined,
            WarehouseKeeperRef: (ref !== undefined && ref !== null && ref !== '' && !isNaN(Number(ref))) ? Number(ref) : undefined
          };
        });
      }

      // Set ParentRef
      if (treeData) {
        const findParent = (node: TreeNode, childId: string, parentId: string | null = null): string | null => {
          if (node.id === childId) return parentId;
          for (const child of node.children) {
            const found = findParent(child, childId, node.id);
            if (found) return found;
          }
          return null;
        };
        const parentId = findParent(treeData, selectedNode.id);
        if (parentId && parentId !== 'root' && !isUnsavedId(parentId)) {
          payload.ParentRef = parseInt(parentId);
        } else {
          payload.ParentRef = null;
        }
      }

      const existingId = formValues.WarehouseID || selectedNode.data?.WarehouseID || (!isUnsavedId(selectedNode.id) ? selectedNode.id : null);
      const isNewNode = !existingId;

      let response: Response;
      if (isNewNode) {
        response = await apiFetch('/api/inv/warehouses', { method: 'POST', body: JSON.stringify(payload) });
      } else {
        response = await apiFetch(`/api/inv/warehouses/${existingId}`, { method: 'PUT', body: JSON.stringify(payload) });
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'خطا در ذخیره‌سازی انبار');
      }

      const resultData = await response.json().catch(() => null);

      if (isNewNode) {
        savedUnsavedIdsRef.current.add(selectedNode.id);
        if (resultData && resultData.WarehouseID) {
          const newId = resultData.WarehouseID.toString();
          const oldId = selectedNode.id;

          setFormValues(prev => ({
            ...prev,
            ...resultData,
            WarehouseID: resultData.WarehouseID,
            WarehouseCode: resultData.WarehouseCode || prev.WarehouseCode,
            WarehouseTitle: resultData.WarehouseTitle || prev.WarehouseTitle,
            code: resultData.WarehouseCode || prev.code,
            name: resultData.WarehouseTitle || prev.name
          }));

          const updateNodeIdInTree = (node: TreeNode): TreeNode => {
            if (node.id === oldId) {
              return {
                ...node,
                id: newId,
                name: resultData.WarehouseTitle || node.name,
                code: resultData.WarehouseCode || node.code,
                data: { ...(node.data || {}), ...resultData, WarehouseID: resultData.WarehouseID }
              };
            }
            return { ...node, children: (node.children || []).map(updateNodeIdInTree) };
          };

          if (treeData) {
            setTreeData(updateNodeIdInTree(treeData));
          }

          setSelectedNode(prev => prev ? {
            ...prev,
            id: newId,
            name: resultData.WarehouseTitle || prev.name,
            code: resultData.WarehouseCode || prev.code,
            data: { ...(prev.data || {}), ...resultData, WarehouseID: resultData.WarehouseID }
          } : prev);
        }
      } else {
        if (resultData) {
          setFormValues(prev => ({ ...prev, ...resultData }));
          setSelectedNode(prev => prev ? {
            ...prev,
            name: resultData.WarehouseTitle || prev.name,
            code: resultData.WarehouseCode || prev.code,
            data: { ...(prev.data || {}), ...resultData }
          } : prev);
        }
      }

      await fetchTree(false);
      showToast(isNewNode ? 'انبار با موفقیت ثبت شد' : 'انبار با موفقیت بروزرسانی شد', 'success');
    } catch (err: any) {
      showToast(err.message || 'خطا در ذخیره سازی', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNew = async () => {
    await handleSave();
    if (treeRef.current) {
      treeRef.current.addChildToSelected();
    }
  };

  const handleDeleteRequest = (node: TreeNode) => {
    setNodeToDelete(node);
  };

  const executeDelete = async () => {
    if (!nodeToDelete) return;
    
    if (isUnsavedId(nodeToDelete.id)) {
      deletedUnsavedIdsRef.current.add(nodeToDelete.id);
      if (treeData) {
        const removeNode = (node: TreeNode): TreeNode => {
          return {
            ...node,
            children: (node.children || []).filter(c => c.id !== nodeToDelete.id).map(removeNode)
          };
        };
        setTreeData(removeNode(treeData));
      }
      setNodeToDelete(null);
      setSelectedNode(null);
      return;
    }

    try {
      setIsSubmitting(true);
      const delRes = await apiFetch(`/api/inv/warehouses/${nodeToDelete.id}`, { method: 'DELETE' });
      if (!delRes.ok) {
        const err = await delRes.json().catch(() => ({}));
        throw new Error(err.message || 'خطا در حذف انبار');
      }
      setNodeToDelete(null);
      setSelectedNode(null);
      await fetchTree(false);
      showToast('انبار با موفقیت حذف شد', 'success');
    } catch (err: any) {
      showToast(err.message || 'خطا در حذف', 'error');
      setNodeToDelete(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderIcon = (node: TreeNode) => {
    if (node.isRoot) return <FolderTree className="w-4 h-4 text-slate-500" />;
    return node.children.length > 0 ? <Folder className="w-4 h-4 text-blue-500" /> : <Layers className="w-4 h-4 text-gray-500" />;
  };

  const isRootSelected = selectedNode?.isRoot === true;

  const fields: FieldConfig[] = [
    {
      name: 'WarehouseType',
      label: 'نوع (انبار/محل فیزیکی)',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'انبار', value: 1 },
        { label: 'محل فیزیکی', value: 2 },
      ]
    },
    { name: 'WarehouseCode', label: 'کد', type: 'text', required: true, colSpan: 1 },
    { name: 'WarehouseTitle', label: 'عنوان', type: 'text', required: true, colSpan: 1 },
    { name: 'WarehouseTitle2', label: 'عنوان (۲)', type: 'text', colSpan: 1 },
    {
      name: 'WarehouseNature',
      label: 'ماهیت انبار',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'مواد اولیه', value: 1 },
        { label: 'نیمه ساخته', value: 2 },
        { label: 'کالای ساخته شده', value: 3 },
        { label: 'اموال', value: 4 },
        { label: 'ضایعات', value: 5 },
        { label: 'سایر', value: 6 },
      ]
    },
    { name: 'Phone', label: 'تلفن', type: 'text', colSpan: 1 },
    { name: 'DetailedAccountRef', label: 'کد تفصیل', type: 'number', colSpan: 1 },
    {
      name: 'IsActive',
      label: 'فعال',
      type: 'checkbox-right-label',
      colSpan: 1
    }
  ];

  const addressTabConfig: TabCellConfig[] = [
    {
      id: 'address',
      label: 'آدرس',
      columns: [
        {
          key: 'AddressCity',
          header: 'شهر',
          type: 'custom',
          width: '180px',
          render: (row, rowIndex, onChange) => (
            <div className="w-full h-full relative" onClick={(e) => e.stopPropagation()}>
              <GeoLocationDropDown
                noWrapper={true}
                value={row?.AddressCityObj || (row?.AddressCity ? { title: row.AddressCity, province: row.AddressState } : null)}
                onChange={(item) => {
                  row.AddressCityObj = item;
                  row.AddressCity = item?.title || '';
                  row.AddressState = item?.province || '';
                  onChange(item?.title || '');
                }}
                disabled={!selectedNode || isRootSelected}
                placeholder="انتخاب شهر..."
              />
            </div>
          )
        },
        { key: 'AddressState', header: 'استان', type: 'text', width: '150px' },
        { key: 'AddressTitle', header: 'آدرس', type: 'text', width: '200px' },
        { key: 'AddressTitle2', header: 'آدرس (۲)', type: 'text', width: '200px' },
        { key: 'PostalCode', header: 'کدپستی', type: 'text', width: '120px' },
        { key: 'Longitude', header: 'طول جغرافیایی', type: 'text', width: '120px' },
        { key: 'Latitude', header: 'عرض جغرافیایی', type: 'text', width: '120px' }
      ]
    }
  ];

  const keeperTabConfig: TabCellConfig[] = [
    {
      id: 'keeper',
      label: 'انباردار',
      columns: [
        {
          key: 'WarehouseKeeperRef',
          header: 'انباردار',
          type: 'custom',
          width: '220px',
          render: (row, rowIndex, onChange) => (
            <MultiColumnDropdown
              listApiUrl="/api/common/parties?nature=real_person&isActive=true"
              columns={[
                { key: 'detailedAccount.code', label: 'کد تفصیلی', width: 100 },
                { key: 'firstName', label: 'نام', width: 110 },
                { key: 'lastName', label: 'نام خانوادگی', width: 130 },
                { 
                  key: 'nature', 
                  label: 'نوع شخص', 
                  width: 100, 
                  renderItem: (item: any) => (item?.nature === 'real_person' || !item?.nature) ? 'شخص حقیقی' : 'شخص حقوقی' 
                }
              ]}
              value={row?.WarehouseKeeper || row?.WarehouseKeeperRef}
              onChange={(selected) => {
                const items = Array.isArray(selected) ? selected : (selected ? [selected] : []);
                if (items.length === 0) {
                  onChange('');
                } else {
                  const mappedRows = items.map((item: any) => {
                    if (typeof item === 'object' && item !== null) {
                      const id = item.partyId ?? item.PartyID ?? item.id ?? item.WarehouseKeeperRef;
                      const address = item.address || item.partyAddresses?.[0]?.address || item.PartyAddresses?.[0]?.address || row?.Address || '';
                      const mobile = item.mobilePhone || item.mobile || item.partyPhones?.find((p: any) => p.phoneType === 'تلفن همراه')?.phoneNumber || item.PartyPhones?.find((p: any) => p.phoneType === 'تلفن همراه')?.phoneNumber || row?.MobilePhone || '';
                      const phone = item.phone || item.landlinePhone || item.partyPhones?.find((p: any) => p.phoneType !== 'تلفن همراه')?.phoneNumber || item.PartyPhones?.find((p: any) => p.phoneType !== 'تلفن همراه')?.phoneNumber || row?.Phone || '';
                      return {
                        WarehouseKeeperRef: id,
                        WarehouseKeeper: item,
                        Address: address,
                        MobilePhone: mobile,
                        Phone: phone
                      };
                    } else {
                      return {
                        WarehouseKeeperRef: item,
                        WarehouseKeeper: null,
                        Address: row?.Address || '',
                        MobilePhone: row?.MobilePhone || '',
                        Phone: row?.Phone || ''
                      };
                    }
                  });
                  onChange(mappedRows);
                }
              }}
              placeholder="انتخاب شخص انباردار..."
              valueKey="partyId"
              displayKey="lastName"
              renderSelection={(item: any) => {
                if (typeof item === 'object' && item !== null) {
                  const fullName = `${item.firstName || ''} ${item.lastName || ''}`.trim();
                  return fullName || item.lastName || item.title || item.name || String(item.partyId || item.id || '');
                }
                return String(item || '');
              }}
              portal={true}
              onAdd={() => addTab('طرف حساب جدید', 'common', <User className="w-4 h-4" />, 'Party')}
            />
          )
        },
        { key: 'Address', header: 'آدرس', type: 'text', width: '250px' },
        { key: 'MobilePhone', header: 'شماره همراه', type: 'text', width: '150px' },
        { key: 'Phone', header: 'تلفن ثابت', type: 'text', width: '150px' }
      ]
    }
  ];

  const productsTabConfig: TabCellConfig[] = [
    {
      id: 'products',
      label: 'کالاهای مرتبط',
      columns: [
        {
          key: 'ProductCode',
          header: 'کد کالا',
          required: true,
          type: 'custom',
          width: '180px',
          render: (row, rowIndex, onChange) => (
            <MultiColumnDropdown
              data={[
                { id: 'P001', ProductCode: 'P001', ProductTitle: 'ورق روغنی ۱.۵ میل', MeasurementUnit: 'کیلوگرم' },
                { id: 'P002', ProductCode: 'P002', ProductTitle: 'پروفیل ۲۰*۲۰', MeasurementUnit: 'شاخه' },
                { id: 'P003', ProductCode: 'P003', ProductTitle: 'گرانول پی وی سی', MeasurementUnit: 'کیلوگرم' },
                { id: 'P004', ProductCode: 'P004', ProductTitle: 'ورق گالوانیزه', MeasurementUnit: 'کیلوگرم' },
                { id: 'P005', ProductCode: 'P005', ProductTitle: 'لوله صنعتی 2 اینچ', MeasurementUnit: 'متر' }
              ]}
              columns={[
                { key: 'ProductCode', label: 'کد کالا', width: 90 },
                { key: 'ProductTitle', label: 'عنوان کالا', width: 180 },
                { key: 'MeasurementUnit', label: 'واحد سنجش', width: 100 }
              ]}
              value={row?.ProductCode ? { id: row.ProductCode, ProductCode: row.ProductCode, ProductTitle: row.ProductTitle, MeasurementUnit: row.MeasurementUnit || row.MeasurementUnitTitle || '' } : null}
              onChange={(selected) => {
                if (Array.isArray(selected)) {
                  if (selected.length === 0) {
                    row.ProductTitle = '';
                    row.MeasurementUnit = '';
                    row.MeasurementUnitTitle = '';
                    onChange('');
                  } else {
                    const mappedRows = selected.map(item => ({
                      ProductCode: item.ProductCode || item.id || '',
                      ProductTitle: item.ProductTitle || item.name || '',
                      MeasurementUnit: item.MeasurementUnit || item.unit || item.MeasurementUnitTitle || '',
                      MeasurementUnitTitle: item.MeasurementUnit || item.unit || item.MeasurementUnitTitle || ''
                    }));
                    row.ProductTitle = mappedRows[0].ProductTitle;
                    row.MeasurementUnit = mappedRows[0].MeasurementUnit;
                    row.MeasurementUnitTitle = mappedRows[0].MeasurementUnitTitle;
                    onChange(mappedRows);
                  }
                } else if (selected) {
                  row.ProductTitle = selected.ProductTitle || selected.name || '';
                  row.MeasurementUnit = selected.MeasurementUnit || selected.unit || '';
                  row.MeasurementUnitTitle = selected.MeasurementUnit || selected.unit || '';
                  onChange(selected.ProductCode || selected.id || '');
                } else {
                  row.ProductTitle = '';
                  row.MeasurementUnit = '';
                  row.MeasurementUnitTitle = '';
                  onChange('');
                }
              }}
              placeholder="انتخاب کد کالا..."
              valueKey="ProductCode"
              displayKey="ProductCode"
              enableMultiSelection={true}
              portal={true}
              onAdd={() => addTab('کالا و خدمات جدید', 'inv', <Package className="w-4 h-4" />, 'ItemServiceGroupForm')}
            />
          )
        },
        { 
          key: 'ProductTitle', 
          header: 'عنوان کالا', 
          type: 'custom', 
          width: '300px',
          render: (row) => (
            <TextInput
              value={row?.ProductTitle || ''}
              disabled={true}
              placeholder="عنوان کالا"
              className="w-full px-2 h-[25px] text-[11px] bg-gray-100/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded outline-none text-slate-800 dark:text-slate-100 cursor-not-allowed"
            />
          )
        },
        { 
          key: 'MeasurementUnitRef', 
          header: 'واحد سنجش', 
          type: 'custom', 
          width: '180px',
          render: (row) => (
            <TextInput
              value={row?.MeasurementUnit || row?.MeasurementUnitTitle || row?.MeasurementUnitName || ''}
              disabled={true}
              placeholder="واحد سنجش"
              className="w-full px-2 h-[25px] text-[11px] bg-gray-100/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded outline-none text-slate-800 dark:text-slate-100 cursor-not-allowed"
            />
          )
        }
      ]
    }
  ];

  const usersTabConfig: TabCellConfig[] = [
    {
      id: 'users',
      label: 'کاربران مجاز',
      columns: [
        {
          key: 'UserRef',
          header: 'کاربر مجاز',
          type: 'custom',
          width: '50%',
          render: (row, rowIndex, onChange) => (
            <MultiColumnDropdown
              apiEndpoint="/api/iam/users"
              columns={[
                { header: 'نام کاربری', key: 'username' },
                { header: 'نام و نام خانوادگی', key: 'name' },
                { header: 'شماره تلفن', key: 'phone' },
                { header: 'شماره موبایل', key: 'mobile' }
              ]}
              value={row?.User || row?.UserRef}
              onChange={(selected) => {
                const items = Array.isArray(selected) ? selected : (selected ? [selected] : []);
                if (items.length === 0) {
                  onChange('');
                } else {
                  const mappedRows = items.map((item: any) => {
                    if (typeof item === 'object' && item !== null) {
                      return {
                        UserRef: item.id ?? item.userID ?? item.UserID ?? item.UserRef,
                        User: item
                      };
                    } else {
                      return {
                        UserRef: item,
                        User: null
                      };
                    }
                  });
                  onChange(mappedRows);
                }
              }}
              placeholder="انتخاب کاربر"
              valueKey="id"
              displayKey="username"
              renderSelection={(item: any) => {
                if (typeof item === 'object' && item !== null) {
                  return item.name || item.fullName || item.username || String(item.id || '');
                }
                return String(item || '');
              }}
              portal={true}
              onAdd={() => addTab('کاربر جدید', 'iam', <User className="w-4 h-4" />, 'UserForm')}
            />
          )
        }
      ]
    }
  ];

  return (
    <div className="flex flex-row h-[calc(100vh-100px)] w-full gap-4 p-4 bg-gray-50 dark:bg-gray-900">
      {loading && <LoadingOverlay />}
      {/* Left side tree */}
      <div className="w-1/3 flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm overflow-hidden p-2" id="WarehouseTree">
        {treeData ? (
          <TreeView
            ref={treeRef}
            data={treeData}
            iconProvider={renderIcon}
            selectedNodeId={selectedNode?.id}
            onChange={(updated) => setTreeData(updated)}
            onSelect={handleNodeSelect}
            onAddNode={handleAddNode}
            onNodeUpdate={(nodeId, updatedFields) => {
              if (selectedNode && selectedNode.id === nodeId) {
                setFormValues((prev: any) => ({ ...prev, ...updatedFields }));
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
              return true;
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
            label="ساختار انبارها"
            getAddChildLabel={() => "افزودن زیرشاخه"}
          />
        ) : (
          <div className="text-sm p-4 text-slate-500 text-center">در حال بارگذاری ساختار...</div>
        )}
      </div>

      {/* Right side detail form */}
      <div className="w-2/3 flex flex-col h-full rounded-lg shadow-sm overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800" id="WarehouseDetails">
        <div className="flex-1 overflow-y-auto flex flex-col relative w-full h-full min-h-0">
          <SimpleForm isReadonly={!selectedNode || isRootSelected}
            title={selectedNode ? (selectedNode.isRoot ? "انبار و محل فیزیکی کالا" : `جزئیات انبار: ${selectedNode.name}`) : "انبار و محل فیزیکی کالا"}
            icon={<Layers className="w-4 h-4 text-indigo-500" />}
            fields={[]}
            values={formValues}
            onChange={handleFormChange}
            onSave={handleSave}
            onSaveNew={handleSaveNew}
            subHeader={
              <div className="flex flex-col w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                {/* Header Fields Section */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3 bg-gray-50/40 dark:bg-gray-800/20 border-b border-gray-200 dark:border-gray-800">
                  <Select
                    label="نوع :"
                    required={true}
                    value={formValues.WarehouseType !== undefined && formValues.WarehouseType !== null ? String(formValues.WarehouseType) : '1'}
                    onChange={(val) => handleFormChange('WarehouseType', Number(val))}
                    options={[
                      { label: 'انبار', value: '1' },
                      { label: 'محل فیزیکی', value: '2' },
                    ]}
                    disabled={!selectedNode || isRootSelected}
                    labelWidth="85px"
                  />
                  <TextInput
                    label="کد :"
                    required={true}
                    value={formValues.WarehouseCode !== undefined && formValues.WarehouseCode !== null ? formValues.WarehouseCode : (formValues.code || '')}
                    onChange={(val) => handleFormChange('WarehouseCode', val)}
                    disabled={!selectedNode || isRootSelected || isDocumentNoAuto}
                    labelWidth="85px"
                  />
                  <TextInput
                    label="عنوان :"
                    required={true}
                    value={formValues.WarehouseTitle !== undefined && formValues.WarehouseTitle !== null ? formValues.WarehouseTitle : (formValues.name || '')}
                    onChange={(val) => handleFormChange('WarehouseTitle', val)}
                    disabled={!selectedNode || isRootSelected}
                    labelWidth="85px"
                  />
                  <TextInput
                    label="عنوان (۲) :"
                    value={formValues.WarehouseTitle2 || ''}
                    onChange={(val) => handleFormChange('WarehouseTitle2', val)}
                    disabled={!selectedNode || isRootSelected}
                    labelWidth="85px"
                  />
                  <Select
                    label="ماهیت انبار :"
                    required={true}
                    value={formValues.WarehouseNature !== undefined && formValues.WarehouseNature !== null ? String(formValues.WarehouseNature) : '1'}
                    onChange={(val) => handleFormChange('WarehouseNature', Number(val))}
                    options={[
                      { label: 'مواد اولیه', value: '1' },
                      { label: 'نیمه ساخته', value: '2' },
                      { label: 'کالای ساخته شده', value: '3' },
                      { label: 'اموال', value: '4' },
                      { label: 'ضایعات', value: '5' },
                      { label: 'سایر', value: '6' },
                    ]}
                    disabled={!selectedNode || isRootSelected}
                    labelWidth="85px"
                  />
                  {(formValues.WarehouseType === undefined || formValues.WarehouseType === null || Number(formValues.WarehouseType) === 1) && (
                    <TextInput
                      label="تلفن :"
                      value={formValues.Phone || ''}
                      onChange={(val) => handleFormChange('Phone', val)}
                      disabled={!selectedNode || isRootSelected}
                      labelWidth="85px"
                    />
                  )}
                  <NumberInput
                    label="کد تفصیل :"
                    value={formValues.DetailedAccountRef !== undefined && formValues.DetailedAccountRef !== null ? String(formValues.DetailedAccountRef) : ''}
                    onChange={(val) => handleFormChange('DetailedAccountRef', val ? Number(val) : null)}
                    disabled={!selectedNode || isRootSelected}
                    labelWidth="85px"
                  />
                  <div className="flex items-center pt-1">
                    <CheckBoxRightLabel
                      label="فعال :"
                      checked={formValues.IsActive !== false}
                      onChange={(val) => handleFormChange('IsActive', val)}
                      disabled={!selectedNode || isRootSelected}
                    />
                  </div>
                </div>

                {/* SubHeader Tab Navigation */}
                <div className="flex flex-row overflow-x-auto bg-gray-50/50 dark:bg-gray-800/10 px-4 pt-1.5 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveDetailsTab('products')}
                    className={`px-4 py-2 whitespace-nowrap text-[12px] font-medium border-b-2 transition-all ${
                      activeDetailsTab === 'products' ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    کالاهای مرتبط
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDetailsTab('address')}
                    className={`px-4 py-2 whitespace-nowrap text-[12px] font-medium border-b-2 transition-all ${
                      activeDetailsTab === 'address' ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    آدرس
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDetailsTab('keeper')}
                    className={`px-4 py-2 whitespace-nowrap text-[12px] font-medium border-b-2 transition-all ${
                      activeDetailsTab === 'keeper' ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    انباردار
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDetailsTab('users')}
                    className={`px-4 py-2 whitespace-nowrap text-[12px] font-medium border-b-2 transition-all ${
                      activeDetailsTab === 'users' ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    کاربران مجاز
                  </button>
                </div>
              </div>
            }
            onNew={() => {
              if (treeRef.current) {
                treeRef.current.addChildToSelected();
              }
            }}
            onDelete={(!selectedNode || selectedNode.isRoot || selectedNode.deletable === false) ? undefined : () => handleDeleteRequest(selectedNode)}
            isSubmitting={isSubmitting}
            showListButton={false}
            contentClassName="p-0 flex-1 h-full overflow-hidden min-h-0 gap-0"
          >
            {activeDetailsTab === 'address' && (
              <div className="flex-1 h-full min-h-0 overflow-hidden" id="WarehouseAddressTabCellContainer">
                <TabCellRow
                  tabs={addressTabConfig}
                  value={formValues.WarehouseAddresses || [
                    {
                      AddressCity: formValues.AddressCity || '',
                      AddressState: formValues.AddressState || '',
                      AddressTitle: formValues.AddressTitle || '',
                      AddressTitle2: formValues.AddressTitle2 || '',
                      PostalCode: formValues.PostalCode || '',
                      Longitude: formValues.Longitude || '',
                      Latitude: formValues.Latitude || '',
                      AddressCityObj: formValues.AddressCityObj || (formValues.AddressCity ? { title: formValues.AddressCity, province: formValues.AddressState } : null)
                    }
                  ]}
                  onChange={(val) => {
                    const rows = Array.isArray(val) ? val : [];
                    handleFormChange('WarehouseAddresses', rows);
                    if (rows.length > 0) {
                      const first = rows[0];
                      handleFormChange('AddressCity', first.AddressCity || '');
                      handleFormChange('AddressState', first.AddressState || '');
                      handleFormChange('AddressTitle', first.AddressTitle || '');
                      handleFormChange('AddressTitle2', first.AddressTitle2 || '');
                      handleFormChange('PostalCode', first.PostalCode || '');
                      handleFormChange('Longitude', first.Longitude || '');
                      handleFormChange('Latitude', first.Latitude || '');
                      handleFormChange('AddressCityObj', first.AddressCityObj || null);
                    } else {
                      handleFormChange('AddressCity', '');
                      handleFormChange('AddressState', '');
                      handleFormChange('AddressTitle', '');
                      handleFormChange('AddressTitle2', '');
                      handleFormChange('PostalCode', '');
                      handleFormChange('Longitude', '');
                      handleFormChange('Latitude', '');
                      handleFormChange('AddressCityObj', null);
                    }
                  }}
                  hideHeader={true}
                  isReadonly={!selectedNode || isRootSelected}
                />
              </div>
            )}
            {activeDetailsTab === 'products' && (
              <div className="flex-1 h-full min-h-0 overflow-hidden" id="WarehouseProductsTabCellContainer">
                <TabCellRow
                  tabs={productsTabConfig}
                  value={formValues.WarehouseProducts || []}
                  onChange={(val) => handleFormChange('WarehouseProducts', val)}
                  hideHeader={true}
                  isReadonly={!selectedNode || isRootSelected}
                />
              </div>
            )}
            {activeDetailsTab === 'keeper' && (
              <div className="flex-1 h-full min-h-0 overflow-hidden" id="WarehouseKeeperTabCellContainer">
                <TabCellRow
                  tabs={keeperTabConfig}
                  value={formValues.WarehouseKeepers || (formValues.WarehouseKeeperRef ? [{ WarehouseKeeperRef: formValues.WarehouseKeeperRef }] : [])}
                  onChange={(val) => {
                    const rows = Array.isArray(val) ? val : [];
                    handleFormChange('WarehouseKeepers', rows);
                    if (rows.length > 0) {
                      const first = rows[0];
                      handleFormChange('WarehouseKeeperRef', typeof first === 'object' ? (first.WarehouseKeeperRef || first) : first);
                    } else {
                      handleFormChange('WarehouseKeeperRef', null);
                    }
                  }}
                  hideHeader={true}
                  isReadonly={!selectedNode || isRootSelected}
                />
              </div>
            )}
            {activeDetailsTab === 'users' && (
              <div className="flex-1 h-full min-h-0 overflow-hidden" id="WarehouseUsersTabCellContainer">
                <TabCellRow
                  tabs={usersTabConfig}
                  value={formValues.WarehouseUsers || []}
                  onChange={(val) => handleFormChange('WarehouseUsers', val)}
                  hideHeader={true}
                  isReadonly={!selectedNode || isRootSelected}
                />
              </div>
            )}
            {(!selectedNode) && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400 font-medium">لطفا یک انبار از ساختار سمت چپ انتخاب کنید و یا دکمه جدید را بزنید.</p>
                </div>
              </div>
            )}
          </SimpleForm>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!nodeToDelete}
        title="حذف انبار"
        message={`آیا از حذف انبار [${nodeToDelete?.name || ''}] اطمینان دارید؟`}
        confirmText="بلی"
        cancelText="خیر"
        onConfirm={executeDelete}
        onCancel={() => setNodeToDelete(null)}
      />
    </div>
  );
}
