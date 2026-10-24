'use client';

import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/inputs/Checkbox';
import { AppResourceRegistry } from '@/lib/iam-registry';
import { safeStringify, apiFetch } from '@/lib/utils';

// Sample API calls - these would be moved to an API client in a real app
const syncPermissionsRegistry = async () => 
  apiFetch('/api/iam/permissions/sync', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: safeStringify({ resources: AppResourceRegistry })
  }).then(res => res.json());

const fetchRoles = async () => apiFetch('/api/iam/roles', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
}).then(res => res.json());

const fetchPermissions = async () => apiFetch('/api/iam/permissions', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
}).then(res => res.json());

const updateRolePermissions = async (roleId: string, permissionIds: number[], conditions: any) => 
  apiFetch(`/api/iam/roles/${roleId}/permissions`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: safeStringify({ permissionIds, conditions })
  }).then(res => res.json());

export default function RoleAccessManager() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [rolePerms, setRolePerms] = useState<Set<number>>(new Set());

  // Grouped permissions by resource
  const [groupedPerms, setGroupedPerms] = useState<Record<string, any[]>>({});
  const [restrictScope, setRestrictScope] = useState<boolean>(true);

  const handleRoleSelect = (role: any) => {
    setSelectedRole(role);
    const permIds = new Set<number>();
    let isRestricted = false;
    if (role.permissions) {
      role.permissions.forEach((rp: any) => {
        permIds.add(rp.permissionId);
        if (rp.conditions?.restrictScope) {
          isRestricted = true;
        }
      });
    }
    setRolePerms(permIds);
    setRestrictScope(isRestricted);
  };

  const loadData = async () => {
    try {
      await syncPermissionsRegistry().catch(e => console.error("Sync failed", e));
      const rolesData = await fetchRoles();
      const permsData = await fetchPermissions();
      setRoles(rolesData || []);
      setPermissions(permsData || []);
      
      const grouped = (permsData || []).reduce((acc: any, p: any) => {
        if (!acc[p.resource]) acc[p.resource] = [];
        acc[p.resource].push(p);
        return acc;
      }, {});
      setGroupedPerms(grouped);
      
      if (rolesData?.length > 0) {
        handleRoleSelect(rolesData[0]);
      }
    } catch (e) {
      console.error('Failed to load IAM data', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePerm = (permId: number) => {
    const newSet = new Set(rolePerms);
    if (newSet.has(permId)) {
      newSet.delete(permId);
    } else {
      newSet.add(permId);
    }
    setRolePerms(newSet);
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    try {
      await updateRolePermissions(selectedRole.id, Array.from(rolePerms), restrictScope ? { restrictScope: 'self_org' } : {});
      window.alert('Permissions saved successfully');
      loadData(); // reload
    } catch (e) {
      window.alert('Failed to save permissions');
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 h-full" dir="rtl">
      {/* Roles List */}
      <div className="w-full md:w-1/3 flex flex-col h-[calc(100vh-120px)] border border-gray-200 shadow-sm rounded-lg bg-white overflow-hidden">
        <div className="pb-3 border-b border-gray-100 p-4 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-800">نقش ها (Roles)</h2>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role)}
              className={`w-full text-right px-4 py-3 rounded-lg border transition-colors ${
                selectedRole?.id === role.id 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-white border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{role.name}</div>
              <div className="text-xs text-gray-500 mt-1">{role.description || 'بدون توضیحات'}</div>
            </button>
          ))}
          {roles.length === 0 && (
            <div className="text-gray-500 text-sm p-4 text-center">هیچ نقشی یافت نشد.</div>
          )}
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="w-full md:w-2/3 flex flex-col h-[calc(100vh-120px)] border border-gray-200 shadow-sm rounded-lg bg-white overflow-hidden">
        <div className="pb-3 border-b border-gray-100 p-4 flex flex-row items-center justify-between bg-gray-50">
          <h2 className="text-lg font-medium text-gray-800">
            دسترسی های نقش: {selectedRole?.name || 'انتخاب نشده'}
          </h2>
          <div className="flex items-center space-x-4 space-x-reverse">
            <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
              <Checkbox 
                checked={restrictScope}
                onChange={() => setRestrictScope(!restrictScope)}
              />
              <span className="text-sm font-medium text-gray-700">محدودیت دسترسی به شعبه/نمایندگی کاربر</span>
            </label>
            <button onClick={handleSave} disabled={!selectedRole} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              ذخیره دسترسی ها
            </button>
          </div>
        </div>
        <div className="p-0 flex-1 overflow-y-auto">
          {selectedRole ? (
            <div className="divide-y divide-gray-100">
              {Object.entries(groupedPerms).map(([resource, perms]) => (
                <div key={resource} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="font-semibold text-gray-800 mb-3 text-lg">{resource}</div>
                  <div className="flex flex-wrap gap-6">
                    {perms.map(p => (
                      <label key={p.id} className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                        <Checkbox 
                          checked={rolePerms.has(p.id)}
                          onChange={() => handleTogglePerm(p.id)}
                        />
                        <span className="text-sm font-medium text-gray-700">{p.action}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              لطفا یک نقش را انتخاب کنید
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
