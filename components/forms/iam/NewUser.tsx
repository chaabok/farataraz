"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useState, useEffect } from "react";
import { SimpleForm, FieldConfig } from "../SimpleForm";
import { useTabs } from "../../TabsProvider";
import { useToast } from "../../ToastProvider";
import { UserPlus } from "lucide-react";
import { PasswordInput } from "../../inputs/PasswordInput";
import { safeStringify, apiFetch } from "@/lib/utils";

interface NewUserProps {
  userId?: number;
  onSaved?: () => void;
}

export function NewUser({ userId, onSaved }: NewUserProps) {
  const [values, setValues] = useState<Record<string, any>>({
    isActive: true,
    repeatChangePassword: "0",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { removeTab, addTab } = useTabs();
  const { showToast } = useToast();

  const isEdit = !!userId;

  const { isUsed } = useFormUsageCheck("User", userId);

  const loadUser = async () => {
    try {
      const res = await apiFetch(`/api/iam/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const users = await res.json();
        const user = users.find((u: any) => u.id === userId);
        if (user) {
          setValues({
            ...user,
            repeatChangePassword: String(user.repeatChangePassword || 0),
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isEdit) {
      loadUser();
    }
  }, [isEdit, userId]);

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined } as any));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!values.username) newErrors.username = "نام کاربری را وارد کنید";
    if (!values.firstName) newErrors.firstName = "نام را وارد کنید";
    if (!values.lastName) newErrors.lastName = "نام خانوادگی را وارد کنید";
    if (!isEdit && !values.password) newErrors.password = "کلمه عبور را وارد کنید";
    if (values.password && values.password !== values.confirmPassword) {
      newErrors.confirmPassword = "کلمه عبور و تکرار آن مطابقت ندارند";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveData = async () => {
    if (!validate()) return false;
    
    setIsSubmitting(true);
    try {
      const url = isEdit ? `/api/iam/users/${userId}` : '/api/iam/users';
      const method = isEdit ? 'PUT' : 'POST';
      
      const payload = { ...values };
      delete payload.confirmPassword;
      
      const response = await apiFetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: safeStringify(payload),
      });
      
      if (response.ok) {
        showToast(isEdit ? "کاربر با موفقیت بروزرسانی شد" : "کاربر با موفقیت ایجاد شد", 'success');
        if (onSaved) onSaved();
        return true;
      } else {
        const errorData = await response.json().catch(() => null);
        showToast("خطا در ذخیره اطلاعات", 'error');
        return false;
      }
    } catch (error) {
      showToast("خطای شبکه", 'error');
      console.error(error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    await saveData();
  };

  const handleSaveClose = async () => {
    const success = await saveData();
    if (success) {
      removeTab(`edit-user-${userId}`);
      removeTab('new-user');
    }
  };

  const handleSaveNew = async () => {
    const success = await saveData();
    if (success) {
      if (isEdit) {
        removeTab(`edit-user-${userId}`);
      }
      setValues({ isActive: true, repeatChangePassword: "0" });
      if (!isEdit && !document.getElementById('new-user')) {
        addTab(
          'تعریف کاربر جدید',
          'admin',
          undefined,
          'UserForm'
        );
      }
    }
  };

  const handleList = () => {
    if (isEdit) removeTab(`edit-user-${userId}`);
    else removeTab('new-user');
  };

  const fields: FieldConfig[] = [
    { name: "username", label: "نام کاربری", type: "text", required: true },
    { name: "firstName", label: "نام", type: "text", required: true },
    { name: "lastName", label: "نام خانوادگی", type: "text", required: true },
    {
        name: "password",
        label: "کلمه عبور",
        type: "custom",
        customComponent: (
            <PasswordInput
                value={values.password || ''}
                onChange={(val) => handleChange("password", val)}
                showGenerateButton={true}
                error={errors.password}
                placeholder={isEdit ? "برای تغییر ندادن خالی بگذارید" : ""}
            />
        )
    },
    {
        name: "confirmPassword",
        label: "تکرار کلمه عبور",
        type: "custom",
        customComponent: (
            <PasswordInput
                value={values.confirmPassword || ''}
                onChange={(val) => handleChange("confirmPassword", val)}
                showGenerateButton={true}
                error={errors.confirmPassword}
            />
        )
    },
    { 
        name: "repeatChangePassword", 
        label: "بازه زمانی تغییر کلمه عبور", 
        type: "select", 
        options: [
            { label: "بدون تغییر", value: "0" },
            { label: "هر 3 ماه", value: "1" },
            { label: "هر سال", value: "2" },
        ]
    },
    { name: "isActive", label: "فعال", type: "checkbox" },
  ];

  return (
    <SimpleForm isReadonly={isUsed || false}
      title={isEdit ? "ویرایش کاربر" : "تعریف کاربر جدید"}
      icon={<UserPlus size={16} />}
      fields={fields}
      values={values}
      onChange={handleChange}
      errors={errors}
      onSave={handleSave}
      
      onSaveNew={handleSaveNew}
      onList={handleList}
      listApiUrl="/api/iam/users"
      listDisplayKey="name"
      listColumns={[
        { key: "username", header: "نام کاربری" },
        { key: "name", header: "نام" },
        { key: "family", header: "نام خانوادگی" },
        { key: "groupTitle", header: "گروه کاربری" },
      ]}
      onListSelect={(item) => {
        if (userId !== item.id) {
          addTab(
            `ویرایش کاربر - ${item.username}`,
            'admin',
            undefined,
            'NewUser',
            { userId: item.id }
          );
        }
      }}
      isSubmitting={isSubmitting}
      className="max-w-2xl mx-auto mt-4"
    />
  );
}