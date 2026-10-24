"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useState } from "react";
import { SimpleForm, FieldConfig } from "../SimpleForm";
import { useToast } from "../../ToastProvider";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { cn, safeStringify, apiFetch } from "@/lib/utils";
import { useAuth, useLanguage } from "../../Providers";
import { eventBus, EVENTS } from '@/lib/events';
import { PermissionTree } from "./PermissionTree";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { SaveButton } from "../../buttons/SaveButton";
import { SaveNewButton } from "../../buttons/SaveNewButton";
import { SaveCloseButton } from "../../buttons/SaveCloseButton";
import { DeleteButton } from "../../buttons/DeleteButton";
import { ListButton } from "../../buttons/ListButton";
import { NewButton } from "../../buttons/NewButton";
import { FullscreenButton } from "../../buttons/FullscreenButton";
import { HelpButton } from "../../buttons/HelpButton";
import { CloseButton } from "../../buttons/CloseButton";
import { useTabs } from "../../TabsProvider";
import { useConfirm } from "../../ConfirmProvider";
import { LoadingOverlay } from "../../ui/LoadingOverlay";

// Make a small custom widget for the password area
function PasswordCustomInput({ 
  value, 
  onChange, 
  error, 
  generatePassword 
}: { 
  value: string; 
  onChange: (v: string) => void;
  error?: string;
  generatePassword: () => void;
}) {
  const [show, setShow] = useState(false);
  
  return (
    <div className="flex gap-2 w-full">
      <div className="relative flex-1">
        <input
          type={show ? "text" : "password"}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full px-4 h-6 text-[10px] bg-gray-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 transition-all outline-none text-slate-800 dark:text-slate-100",
            error ? "border-rose-500 ring-rose-500/20 ring-1" : ""
          )}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
      <button
        type="button"
        onClick={generatePassword}
        className="h-6 px-2 flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
        title="تولید کلمه عبور قوی"
      >
        <KeyRound className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function PasswordRepeatCustomInput({ 
  value, 
  onChange, 
  error
}: { 
  value: string; 
  onChange: (v: string) => void;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  
  return (
    <div className="flex gap-2 w-full">
      <div className="relative flex-1">
        <input
          type={show ? "text" : "password"}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full px-4 h-6 text-[10px] bg-gray-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 transition-all outline-none text-slate-800 dark:text-slate-100",
            error ? "border-rose-500 ring-rose-500/20 ring-1" : ""
          )}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
      {/* Empty space to align with generate button */}
      <div className="w-[30px]" />
    </div>
  );
}

export function UserForm({ id }: { id?: number }) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { t } = useLanguage();
  const { currentUser, setCurrentUser } = useAuth();
  const { addTab, removeTab, activeTabId } = useTabs();
  const [values, setValues] = useState<Record<string, any>>({
    isActive: true,
    repeatChangePassword: '0',
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    passwordRepeat: '',
    UserGroupRef: '',
    permissions: []
  });
  const [initialValues, setInitialValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [initialUsername, setInitialUsername] = useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  const { activeId, method, getUrl, handleResponse, setActiveId } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("UserForm", activeId);


  React.useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        const response = await apiFetch('/api/iam/user-groups', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUserGroups(data);
        }
      } catch (error) {
        console.error("Error fetching user groups:", error);
      }
    };
    fetchUserGroups();

    if (activeId) {
      const fetchUser = async () => {
        setIsLoading(true);
        try {
          const response = await apiFetch(`/api/iam/users/${activeId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            if (data) {
              setInitialUsername(data.username || null);
              const loadedValues = {
                username: data.username || '',
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                isActive: data.isActive !== undefined ? data.isActive : true,
                repeatChangePassword: data.repeatChangePassword ? data.repeatChangePassword.toString() : '0',
                UserGroupRef: data.userGroupRef ? data.userGroupRef.toString() : '',
                password: '', 
                passwordRepeat: '',
                permissions: data.permissions || []
              };
              setValues(loadedValues);
              setInitialValues(loadedValues);
            } else {
              showToast("کاربر یافت نشد", "error");
            }
          } else {
            showToast("خطا در دریافت اطلاعات کاربر", "error");
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          showToast("خطا در ارتباط با سرور", "error");
        } finally {
          setIsLoading(false);
        }
      };
      fetchUser();
    }
  }, [activeId, showToast]);

  React.useEffect(() => {
    if (values.UserGroupRef) {
      const fetchGroupPermissions = async () => {
        try {
          const response = await apiFetch(`/api/iam/user-groups/${values.UserGroupRef}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            if (data.permissions) {
              setValues(prev => ({ ...prev, permissions: data.permissions }));
            }
          }
        } catch (error) {
          console.error("Error fetching group permissions:", error);
        }
      };
      fetchGroupPermissions();
    }
  }, [values.UserGroupRef]);

  const isAdmin = initialUsername?.toLowerCase() === 'admin';

  const generateStrongPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let password = "";
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValues(prev => ({ ...prev, password, passwordRepeat: password }));
  };

  const handleChange = (name: string, value: any) => {
    if (isAdmin && (name === 'username' || name === 'isActive')) return;
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!values.username) newErrors.username = "نام کاربری الزامی است";
    if (!activeId && !values.password) newErrors.password = "کلمه عبور الزامی است";
    if (values.password && values.password !== values.passwordRepeat) {
      newErrors.passwordRepeat = "تکرار کلمه عبور با کلمه عبور مطابقت ندارد";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (closeAfterSave = false, emptyAfterSave = false) => {
    if (!validate()) {
      throw new Error("VALIDATION_FAILED");
    }

    setIsSubmitting(true);
    try {
      const url = getUrl('/api/iam/users');
      
      const payload: any = {};

      if (activeId) {
        // Partial Update: Only include changed fields
        if (values.firstName !== initialValues.firstName) payload.firstName = values.firstName;
        if (values.lastName !== initialValues.lastName) payload.lastName = values.lastName;
        if (values.repeatChangePassword !== initialValues.repeatChangePassword) {
          payload.repeatChangePassword = parseInt(values.repeatChangePassword, 10);
        }
        if (values.UserGroupRef !== initialValues.UserGroupRef) {
          payload.UserGroupRef = values.UserGroupRef || null;
        }
        
        // Only update password if it's provided (not empty)
        if (values.password && values.password.length > 0) {
          payload.password = values.password;
        }

        // Compare permissions arrays
        const initialPerms = initialValues.permissions || [];
        const currentPerms = values.permissions || [];
        if (safeStringify([...initialPerms].sort()) !== safeStringify([...currentPerms].sort())) {
          payload.permissions = currentPerms;
        }

        if (!isAdmin) {
          if (values.username !== initialValues.username) payload.username = values.username;
          if (values.isActive !== initialValues.isActive) payload.isActive = values.isActive;
        }

        // If no changes were made, just show success and return (or alert)
        if (Object.keys(payload).length === 0) {
          showToast("تغییری برای ذخیره یافت نشد", "info");
          setIsSubmitting(false);
          if (closeAfterSave) removeTab(activeTabId!);
          return;
        }
      } else {
        // New User: Include all fields
        payload.firstName = values.firstName;
        payload.lastName = values.lastName;
        payload.repeatChangePassword = values.repeatChangePassword ? parseInt(values.repeatChangePassword, 10) : 0;
        payload.password = values.password;
        payload.permissions = values.permissions;
        payload.username = values.username;
        payload.isActive = values.isActive;
        payload.UserGroupRef = values.UserGroupRef || null;
      }
      
      const res = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: safeStringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'خطا در ذخیره اطلاعات');
      }

      const resData = await res.json();
      handleResponse(resData, 'id');

      showToast("اطلاعات با موفقیت ذخیره شد", "success");
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'User' });
      
      // Update initial values after successful save
      if (activeId) {
        setInitialValues({
          ...values,
          password: '',
          passwordRepeat: ''
        });
        // Also clear password fields after saving
        setValues(prev => ({
          ...prev,
          password: '',
          passwordRepeat: ''
        }));
      }
      
      // Live update header if editing own profile
      if (activeId && currentUser && Number(activeId) === Number(currentUser.id)) {
        setCurrentUser({
          ...currentUser,
          username: values.username,
          firstName: values.firstName,
          lastName: values.lastName
        });
      }

      if (emptyAfterSave) {
        setValues({
          isActive: true,
          repeatChangePassword: '0',
          username: '',
          firstName: '',
          lastName: '',
          password: '',
          passwordRepeat: '',
          permissions: []
        });
        setActiveId(null);
      }

      if (closeAfterSave) {
        removeTab(activeTabId!);
      }
      
    } catch (e: any) {
      showToast(e.message || "خطا در ارتباط با سرور", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!activeId) return;
    if (isAdmin) {
      showToast("کاربر مدیر قابل حذف نیست", "error");
      return;
    }

    const isConfirmed = await confirm({
      message: t('confirm_delete_message_single' as any) || "آیا از حذف این کاربر اطمینان دارید؟"
    });
    if (!isConfirmed) return;

    setIsSubmitting(true);
    try {
      const response = await apiFetch(`/api/iam/users/${activeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        showToast("کاربر با موفقیت حذف شد", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'User' });
        removeTab(activeTabId!);
      } else {
        const error = await response.json();
        showToast(error.message || "خطا در حذف کاربر", "error");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast("خطا در ارتباط با سرور", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNew = () => {
    setValues({
      isActive: true,
      repeatChangePassword: '0',
      username: '',
      firstName: '',
      lastName: '',
      password: '',
      passwordRepeat: '',
      permissions: []
    });
    setInitialUsername(null);
    setActiveId(null);
  };

  const handleList = () => {
    // If we're in a tab system, we should probably switch to the list tab
    // For now, let's just close this tab as it usually means "return to list"
    removeTab(activeTabId!);
  };

  const fields: FieldConfig[] = [
    { name: 'username', label: t('username' as any) || 'نام کاربری', type: 'text', required: true, className: "w-full", disabled: isAdmin },
    { name: 'firstName', label: t('firstName' as any) || 'نام', type: 'text', className: "w-full" },
    { name: 'lastName', label: t('lastName' as any) || 'نام خانوادگی', type: 'text', className: "w-full" },
    { 
      name: 'UserGroupRef', 
      label: t('user_group' as any) || 'گروه کاربری', 
      type: 'select', 
      className: "w-full",
      options: [
        { label: '---', value: '' },
        ...userGroups.map(g => ({ label: g.title, value: g.id.toString() }))
      ]
    },
    { name: 'isActive', label: t('isActive' as any) || 'وضعیت فعالیت', type: 'checkbox', className: "w-full", disabled: isAdmin },
    { 
      name: 'repeatChangePassword', 
      label: t('repeatChangePassword' as any) || 'بازه تغییر کلمه عبور', 
      type: 'select', 
      className: "w-full",
      options: [
        { label: t('no_change' as any) || 'بدون تغییر', value: '0' },
        { label: t('every_3_months' as any) || 'هر 3 ماه کلمه عبور باید تغییر کند', value: '1' },
        { label: t('every_year' as any) || 'هر سال کلمه عبور باید تغییر کند', value: '2' },
      ]
    },
    { 
      name: 'password', 
      label: t('password' as any) || 'کلمه عبور', 
      type: 'custom', 
      className: "w-full",
      customComponent: <PasswordCustomInput value={values.password || ''} onChange={(v) => handleChange('password', v)} error={errors.password} generatePassword={generateStrongPassword} /> 
    },
    { 
      name: 'passwordRepeat', 
      label: t('passwordRepeat' as any) || 'تکرار کلمه عبور', 
      type: 'custom', 
      className: "w-full",
      customComponent: <PasswordRepeatCustomInput value={values.passwordRepeat || ''} onChange={(v) => handleChange('passwordRepeat', v)} error={errors.passwordRepeat} /> 
    },
  ];

  return (
    <div ref={containerRef} className="flex flex-col xl:flex-row gap-6 h-full overflow-hidden p-4 bg-slate-50/30 dark:bg-slate-900/10 rounded-2xl border border-slate-100 dark:border-slate-800 relative">
      <LoadingOverlay visible={isSubmitting || isLoading} message={isLoading ? (t('loading' as any) || 'در حال دریافت اطلاعات...') : (t('saving' as any) || 'در حال ذخیره سازی...')} />
      <div className="flex-1 min-w-0 min-h-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-0 shadow-sm overflow-hidden flex flex-col">
        <div className="flex flex-col flex-shrink-0 w-full m-0 border-b border-gray-200 dark:border-gray-800">
            <div className="w-full bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                    <h2 className="text-[13px] font-medium">
                        {activeId ? (t('edit_user' as any) || 'ویرایش کاربر') : (t('new_user' as any) || 'تعریف کاربر جدید')}
                    </h2>
                </div>
                <div className="flex items-center gap-1">
                    <HelpButton hideLabel variant="ghost" className="text-white hover:text-white/80 hover:bg-transparent dark:hover:bg-transparent p-1 shadow-none" />
                    <FullscreenButton targetRef={containerRef} hideLabel variant="ghost" className="text-white hover:text-white/80 hover:bg-transparent dark:hover:bg-transparent p-1 shadow-none" />
                    <CloseButton hideLabel variant="ghost" className="text-white hover:text-white/80 hover:bg-transparent dark:hover:bg-transparent p-1 shadow-none" />
                </div>
            </div>
            <div className="w-full bg-gray-50/50 dark:bg-gray-800/20 px-4 py-2 flex flex-nowrap items-center justify-start gap-1.5 overflow-x-auto no-scrollbar">
                <NewButton onClick={handleNew} hideLabel />
                <ListButton 
                  onClick={handleList} 
                  hideLabel 
                  listApiUrl="/api/iam/users"
                  displayKey="name"
                  columns={[
                    { key: "username", label: t('username' as any) || "نام کاربری" },
                    { key: "name", label: t('firstName' as any) || "نام" },
                    { key: "family", label: t('lastName' as any) || "نام خانوادگی" },
                    { key: "groupTitle", label: t('user_group' as any) || "گروه کاربری" },
                  ]}
                  onSelect={(item: any) => {
                    if (id !== item.id) {
                      addTab(
                        `${t('edit_user' as any) || 'ویرایش کاربر'} - ${item.username}`,
                        'admin',
                        undefined,
                        'UserForm',
                        { id: item.id }
                      );
                    }
                  }}
                />
                <SaveButton onClick={() => handleSave()} disabled={isSubmitting} hideLabel />
                <SaveNewButton onClick={() => handleSave(false, true)} disabled={isSubmitting} hideLabel />
                <SaveCloseButton onClick={() => handleSave(true)} disabled={isSubmitting} hideLabel />
                <DeleteButton onClick={handleDelete} disabled={isSubmitting || !activeId || isAdmin} hideLabel tooltip={isAdmin ? "کاربر مدیر قابل حذف نیست" : undefined} />
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
            <SimpleForm isReadonly={isUsed || false}
              title=""
              fields={fields}
              values={values}
              onChange={handleChange}
              errors={errors}
              onSave={() => handleSave()}
              onSaveNew={() => handleSave(false, true)}
              isSubmitting={isSubmitting}
              hideHeader={true}
              showLoadingOverlay={false}
            />
        </div>
      </div>
      
      <div className="w-full xl:w-[450px] flex flex-col gap-4 min-h-0">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[500px] xl:h-auto xl:flex-1 min-h-0">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col gap-1">
                <h3 className="text-base font-black text-slate-700 dark:text-slate-200">
                    {t('permissions' as any) || 'دسترسی‌های کاربر'}
                </h3>
                <p className="text-xs text-slate-500 font-medium opacity-80">
                    {t('permissions_subtitle' as any) || 'تعیین سطح دسترسی به منوها و فرم‌ها'}
                </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-3 bg-slate-50/30 dark:bg-slate-800/20">
                <PermissionTree 
                    selectedIds={values.permissions || []}
                    onChange={(ids) => handleChange('permissions', ids)}
                />
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
