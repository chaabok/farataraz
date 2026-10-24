"use client";

"use client";
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import { apiFetch, safeStringify, cn } from "@/lib/utils";
import { eventBus, EVENTS } from "@/lib/events";

import React, { useState, useRef, useEffect } from "react";
import { SimpleForm, FieldConfig } from "../SimpleForm";
import { TreeView, TreeNode, TreeViewRef } from "../../inputs";
import { useTabs } from "../../TabsProvider";
import { useToast } from "../../ToastProvider";
import { ConfirmDialog } from "../../ui/ConfirmDialog";
import { LoadingOverlay } from "../../ui/LoadingOverlay";
import { Folder, FileText, Globe2, BookOpen } from "lucide-react";
import { SlAccountDropDown } from "@/components/ui/SlAccountDropDown";
import { useLanguage } from "../../Providers";

export const RAP_REASON_NATURE_ENUM = {
  SOURCE: 1,
  USE: 2,
  NEUTRAL: 3,
};

const NATURE_OPTIONS = [
  { value: String(RAP_REASON_NATURE_ENUM.SOURCE), label: "منابع" },
  { value: String(RAP_REASON_NATURE_ENUM.USE), label: "مصارف" },
  { value: String(RAP_REASON_NATURE_ENUM.NEUTRAL), label: "خنثی" },
];

export default function RapReasons() {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const { isUsed } = useFormUsageCheck("RapReason", selectedNode?.id || null);
  const selectedNodeIdRef = useRef<string | null>(null);
  const [nodeToDelete, setNodeToDelete] = useState<TreeNode | null>(null);
  const treeRef = useRef<TreeViewRef>(null);
  const { removeTab, activeTabId } = useTabs();
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleNodeSelect = (node: TreeNode) => {
    setSelectedNode(node);
    selectedNodeIdRef.current = node.id;
    setFormValues({
      name: node.name,
      ...node.data,
    });
  };

  const fetchTree = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/rap/reasons/tree");
      if (!res.ok) {
        throw new Error(`Failed to fetch data`);
      }
      const data = await res.json();

      const convertToTreeNode = (item: any): TreeNode => {
        return {
          id: item.RapReasonID.toString(),
          name: item.Title,
          isRoot: false,
          deletable: true,
          data: {
            Code: item.Code || "",
            Title: item.Title,
            Title_En: item.Title_En || "",
            AccountRef: item.AccountRef || null,
            AccountObj: item.AccountObj || null,
            Nature: item.Nature
              ? Number(item.Nature)
              : RAP_REASON_NATURE_ENUM.NEUTRAL,
            Description: item.Description || "",
            IsActive: item.IsActive !== false,
            ParentRef: item.ParentRef || null,
          },
          children: (item.children || []).map(convertToTreeNode),
        };
      };

      const virtualRoot: TreeNode = {
        id: "root",
        name: "بابت ها (منابع و مصارف)",
        isRoot: true,
        deletable: false,
        data: {
          Code: "",
          Title: "بابت ها",
          Title_En: "Reasons",
          AccountRef: null,
          AccountObj: null,
          Nature: RAP_REASON_NATURE_ENUM.NEUTRAL,
          Description: "",
          IsActive: true,
          ParentRef: null,
        },
        children: Array.isArray(data) ? data.map(convertToTreeNode) : [],
      };

      setTreeData(virtualRoot);

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
        const node = findUpdatedNode(virtualRoot, currentId);
        if (node) {
          handleNodeSelect(node);
        } else if (virtualRoot.children && virtualRoot.children.length > 0) {
          handleNodeSelect(virtualRoot.children[0]);
        }
      } else if (virtualRoot.children && virtualRoot.children.length > 0) {
        handleNodeSelect(virtualRoot.children[0]);
      }
    } catch (err: any) {
      console.error(err);
      showToast("خطا در دریافت اطلاعات", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();

    const unsubscribe = eventBus.on(EVENTS.DATA_CHANGED, (payload) => {
      if (payload?.entity === "RapReason") {
        fetchTree();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAddNode = (node: TreeNode) => {
    setTreeData((prevTree) => {
      if (!prevTree) return prevTree;

      const emptyValues = {
        Title: "",
        name: "",
        Title_En: "",
        Code: "",
        Nature: RAP_REASON_NATURE_ENUM.NEUTRAL,
        IsActive: true,
        Description: "",
        AccountRef: null,
        AccountObj: null,
      };

      setFormValues(emptyValues);
      setSelectedNode((prev) =>
        prev && prev.id === node.id
          ? { ...prev, name: "", data: { ...prev.data, ...emptyValues } }
          : prev,
      );

      const updateNode = (n: TreeNode): TreeNode => {
        if (n.id === node.id) {
          return { ...n, data: { ...n.data, ...emptyValues } };
        }
        return { ...n, children: n.children.map(updateNode) };
      };
      return updateNode(prevTree);
    });
  };

  const handleFormChange = (name: string, value: any) => {
    // If the field is "Title", also update "name" for the TreeView node
    const actualName = name === "Title" ? "name" : name;

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "Title" ? { name: value } : {}),
    }));

    if (selectedNode) {
      setTreeData((prevTree) => {
        if (!prevTree) return prevTree;
        const updateNode = (n: TreeNode): TreeNode => {
          if (n.id === selectedNode.id) {
            const newData = { ...n.data, [name]: value };
            return {
              ...n,
              name: name === "Title" ? value : n.name,
              data: newData,
            };
          }
          return { ...n, children: n.children.map(updateNode) };
        };
        return updateNode(prevTree);
      });
      setSelectedNode((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          name: name === "Title" ? value : prev.name,
          data: { ...prev.data, [name]: value },
        };
      });
    }
  };

  const handleBlur = (name: string, value: string) => {
    if (name === "Title_En" && !value && formValues.Title) {
      handleFormChange("Title_En", formValues.Title);
    }
  };

  const saveToServer = async (
    node: TreeNode,
    values: any,
  ): Promise<boolean> => {
    if (!values.Code || values.Code.trim() === "") {
      showToast("لطفا کد را وارد کنید", "error");
      return false;
    }
    if (!values.Title || values.Title.trim() === "") {
      showToast("لطفا عنوان را وارد کنید", "error");
      return false;
    }
    if (!values.Nature || !values.Nature) {
      showToast("لطفا ماهیت را انتخاب کنید", "error");
      return false;
    }

    const isLeaf = !node.children || node.children.length === 0;
    if (isLeaf && node.id !== "root" && !values.AccountRef) {
      showToast(
        "برای رکوردهای زیرشاخه که فرزند ندارند، انتخاب حساب معین اجباری است",
        "error",
      );
      return false;
    }

    try {
      const isNew = !/^\d+$/.test(node.id);

      let parentRefId = null;
      if (isNew && treeData) {
        const findParent = (n: TreeNode, childId: string): TreeNode | null => {
          if (n.children.some((c) => c.id === childId)) return n;
          for (const c of n.children) {
            const found = findParent(c, childId);
            if (found) return found;
          }
          return null;
        };
        const parentNode = findParent(treeData, node.id);
        if (parentNode && parentNode.id !== "root") {
          parentRefId = parseInt(parentNode.id, 10);
        }
      }

      const payload = {
        Title: values.Title?.trim() || "",
        Title_En: values.Title_En?.trim() || "",
        Code: values.Code?.trim() || "",
        AccountRef: values.AccountRef ? Number(values.AccountRef) : null,
        Nature: values.Nature
          ? Number(values.Nature)
          : RAP_REASON_NATURE_ENUM.NEUTRAL,
        Description: values.Description?.trim() || "",
        IsActive: values.IsActive !== undefined ? values.IsActive : true,
        ...(isNew && parentRefId ? { ParentRef: parentRefId } : {}),
      };

      const url = isNew
        ? "/api/rap/reasons"
        : `/api/rap/reasons/${parseInt(node.id, 10)}`;
      const method = isNew ? "POST" : "PUT";

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: safeStringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        showToast(
          errData.message || `Error saving node (${res.status})`,
          "error",
        );
        return false;
      }

      showToast("عملیات با موفقیت انجام شد", "success");
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: "RapReason" });
      return true;
    } catch (err: any) {
      console.error("Save error:", err.message);
      showToast(err.message || "خطا در ذخیره اطلاعات", "error");
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
      showToast("ابتدا زیرمجموعه ها را حذف کنید", "error");
      return;
    }
    if (node.isRoot || node.deletable === false) {
      showToast("این گره قابل حذف نیست", "error");
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
        const res = await apiFetch(
          `/api/rap/reasons/${parseInt(node.id, 10)}`,
          {
            method: "DELETE",
          },
        );
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          showToast(
            errData.message || `Error deleting node (${res.status})`,
            "error",
          );
          return;
        }
      }
      showToast("با موفقیت حذف شد", "success");
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: "RapReason" });
      if (selectedNode && selectedNode.id === node.id) {
        setSelectedNode(null);
      }
      await fetchTree();
    } catch (err: any) {
      console.error("Delete error:", err.message);
      showToast(err.message || "خطا در حذف", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRootSelected = selectedNode?.isRoot ?? false;

  const fields: FieldConfig[] = [
    {
      name: "Code",
      label: "کد",
      type: "text",
      required: true,
      colSpan: 1,
      disabled: isRootSelected,
    },
    {
      name: "Title",
      label: "عنوان",
      type: "text",
      required: true,
      colSpan: 1,
      disabled: isRootSelected,
    },
    {
      name: "Title_En",
      label: "عنوان (لاتین)",
      type: "text",
      colSpan: 1,
      disabled: isRootSelected,
      onBlur: handleBlur,
    },
    {
      name: "Nature",
      label: "ماهیت",
      type: "select",
      required: true,
      options: NATURE_OPTIONS,
      colSpan: 1,
      disabled: isRootSelected,
    },
    {
      name: "AccountRef",
      label: "معین",
      type: "custom",
      colSpan: 2,
      disabled: isRootSelected,
      customComponent: (
        <div className="flex w-full gap-2 items-center h-full">
          <div className="flex-shrink-0" style={{ width: "30%" }}>
            <SlAccountDropDown
              value={formValues.AccountObj || null}
              onChange={(val: any) => {
                handleFormChange("AccountRef", val ? Number(val.id) : null);
                handleFormChange("AccountObj", val || null);
              }}
              disabled={isRootSelected || isUsed}
              displayOnlyCode={true}
            />
          </div>
          <div className="flex-1">
            <input
              readOnly
              disabled
              value={formValues.AccountObj?.title || ""}
              placeholder="عنوان معین"
              className="w-full h-[25px] px-3 text-[13px] bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md border border-slate-200 dark:border-slate-700 cursor-not-allowed"
            />
          </div>
        </div>
      ),
    },
    {
      name: "Description",
      label: "توضیحات",
      type: "textarea",
      colSpan: 2,
      disabled: isRootSelected,
    },
    {
      name: "IsActive",
      label: "فعال",
      type: "checkbox",
      colSpan: 1,
      disabled: isRootSelected,
    },
  ];

  const renderIcon = (node: TreeNode) => {
    if (node.isRoot) return <Globe2 className="w-4 h-4 text-blue-500" />;

    if (node.children && node.children.length > 0) {
      return <Folder className="w-4 h-4 text-yellow-500" />;
    }

    return <FileText className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="flex flex-row h-full w-full gap-4 overflow-hidden p-2 relative">
      <LoadingOverlay
        visible={isSubmitting || (!treeData && loading)}
        message={
          !treeData && loading
            ? language === "fa"
              ? "در حال دریافت اطلاعات..."
              : t("loading_data" as any) || "Loading..."
            : language === "fa"
              ? "لطفا منتظر بمانید..."
              : t("please_wait" as any) || "Please wait..."
        }
      />
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
                setFormValues((prev) => {
                  const merged = { ...prev, ...updatedFields };
                  if (updatedFields.name !== undefined) {
                    merged.Title = updatedFields.name;
                  }
                  return merged;
                });
                setSelectedNode((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    name:
                      updatedFields.name !== undefined
                        ? updatedFields.name
                        : prev.name,
                    data: { ...prev.data, ...updatedFields },
                  };
                });
              }
            }}
            nodeFields={[
              { key: "name", placeholder: "عنوان", type: "text" },
              { key: "Code", placeholder: "کد", type: "text" },
            ]}
            onNodeSave={async (nodeId, updatedFields) => {
              if (!treeData) return false;
              const findNode = (
                node: TreeNode,
                id: string,
              ): TreeNode | null => {
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
                if (updatedFields.name !== undefined) {
                  mergedValues.Title = updatedFields.name;
                }
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
              const findNode = (
                node: TreeNode,
                id: string,
              ): TreeNode | null => {
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
            renderLabel={(node) => {
              const hasChildren = node.children && node.children.length > 0;
              return (
                <span
                  className={cn(
                    hasChildren
                      ? "text-[14px] font-extrabold text-black"
                      : "text-[11px] font-semibold text-gray-800 dark:text-gray-100",
                  )}
                >
                  {node.name}
                </span>
              );
            }}
            label="بابت ها (منابع و مصارف)"
            getAddChildLabel={() => "افزودن زیرشاخه"}
            canAddChild={(node) => {
              if (node.data && node.data.AccountRef) {
                showToast(
                  "برای گرهی که دارای حساب معین است نمی‌توان زیرشاخه تعریف کرد",
                  "error",
                );
                return false;
              }
              return true;
            }}
          />
        ) : (
          <div className="text-sm p-4 text-slate-500 text-center">
            {loading ? "در حال بارگذاری..." : "موردی یافت نشد."}
          </div>
        )}
      </div>
      <div className="w-2/3 flex flex-col h-full rounded-lg shadow-sm overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        {selectedNode ? (
          <div className="flex-1 overflow-y-auto flex flex-col relative w-full h-full min-h-0">
            <SimpleForm isReadonly={isUsed || false}
              title={
                selectedNode.isRoot ? "بابت ها" : `جزئیات: ${selectedNode.name}`
              }
              fields={fields}
              values={formValues}
              onChange={handleFormChange}
              onSave={handleSave}
              onSaveNew={handleSaveNew}
              
              onNew={() => {
                if (selectedNode && selectedNode.data?.AccountRef) {
                  showToast(
                    "برای شاخه‌ای که حساب معین دارد نمی‌توان زیرشاخه تعریف کرد",
                    "error",
                  );
                  return;
                }
                if (treeRef.current) {
                  treeRef.current.addChildToSelected();
                }
              }}
              onDelete={
                !selectedNode ||
                selectedNode.isRoot ||
                selectedNode.deletable === false
                  ? undefined
                  : () => handleDeleteRequest(selectedNode)
              }
              isSubmitting={isSubmitting || isRootSelected}
              showListButton={false}
              showLoadingOverlay={false}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">
              لطفا یک گره از درخت ساختار انتخاب کنید.
            </p>
          </div>
        )}
      </div>
      <ConfirmDialog
        isOpen={!!nodeToDelete}
        title="حذف شاخه"
        message={`آیا از حذف ${nodeToDelete?.name || ""} اطمینان دارید؟`}
        confirmText="بلی"
        cancelText="خیر"
        onConfirm={executeDelete}
        onCancel={() => setNodeToDelete(null)}
      />
    </div>
  );
}
