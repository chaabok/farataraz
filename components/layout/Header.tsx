'use client';
import React from 'react';
import { apiFetch } from '@/lib/utils';
import { useLanguage, useCompany, CompanyInfo, useAuth } from '@/components/Providers';
import { useTheme } from 'next-themes';
import { Moon, Sun, Bell, Settings, MessageSquare, ChevronDown, Palette, Key, Lock, LogOut, Unlock, ShieldCheck, Leaf, Flower, Snowflake, CloudSun, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { TwoFactorSetupModal } from '@/components/forms/iam/TwoFactorSetupModal';
import { ChangePasswordModal } from '@/components/forms/iam/ChangePasswordModal';
import { useTabs } from '@/components/TabsProvider';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import Image from 'next/image';
import { createPortal } from 'react-dom';

import { useRouter } from 'next/navigation';
import { FlagIcon } from '@/components/icons/Flags';

export function Header({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { currentCompany, setCurrentCompany, currentBranch, setCurrentBranch, currentRep, setCurrentRep } = useCompany();
  const { currentUser, setCurrentUser } = useAuth();
  const { tabs, dirtyTabs, removeAllTabs, setActiveTabId } = useTabs();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [allStructures, setAllStructures] = useState<CompanyInfo[]>([]);
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [branches, setBranches] = useState<CompanyInfo[]>([]);
  const [reps, setReps] = useState<CompanyInfo[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [isRepDropdownOpen, setIsRepDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<{ type: 'company' | 'branch' | 'rep' | 'logout', company: CompanyInfo | null, branch: CompanyInfo | null, rep: CompanyInfo | null, dirtyTabTitle?: string } | null>(null);
  
  // Compute branches belonging to currentCompany
  const companyBranches = React.useMemo(() => {
    if (!currentCompany || !allStructures.length) return [];
    return allStructures.filter(s => {
      if (Number(s.businessStructure) !== 3) return false;
      let curr: any = s;
      while (curr && curr.parentRef) {
        if (Number(curr.parentRef) === Number(currentCompany.businessStructureId)) return true;
        curr = allStructures.find(x => Number(x.businessStructureId) === Number(curr.parentRef));
      }
      return false;
    });
  }, [currentCompany, allStructures]);

  // Compute reps belonging to currentCompany
  const companyReps = React.useMemo(() => {
    if (!currentCompany || !allStructures.length) return [];
    return allStructures.filter(s => {
      if (Number(s.businessStructure) !== 4) return false;
      let curr: any = s;
      while (curr && curr.parentRef) {
        if (Number(curr.parentRef) === Number(currentCompany.businessStructureId)) return true;
        const parentNode = allStructures.find(x => Number(x.businessStructureId) === Number(curr.parentRef));
        if (parentNode && Number(parentNode.businessStructureId) === Number(currentCompany.businessStructureId)) return true;
        curr = parentNode;
      }
      return false;
    });
  }, [currentCompany, allStructures]);

  useEffect(() => {
    if (currentBranch && !companyBranches.some(b => b.businessStructureId === currentBranch.businessStructureId)) {
      setCurrentBranch(null);
    }
    if (currentRep && !companyReps.some(r => r.businessStructureId === currentRep.businessStructureId)) {
      setCurrentRep(null);
    }
  }, [currentCompany, companyBranches, companyReps]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const branchDropdownRef = useRef<HTMLDivElement>(null);
  const repDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  async function fetchAllStructures() {
    try {
      const [settingsRes, myAuthRes, structuresRes] = await Promise.all([
        apiFetch('/api/common/base-settings/tab/1'),
        apiFetch('/api/iam/me/business-structures'),
        apiFetch('/api/business-structure')
      ]);

      let activeTypes: number[] = [1, 2, 3, 4];
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        if (data && data.data) {
          if (data.data.activeBusinessStructures) {
            activeTypes = data.data.activeBusinessStructures.split(',').map((x: string) => parseInt(x.trim(), 10));
          }
          if (data.data.enable2StepLogin === 'true') {
            setIs2FAEnabled(true);
          } else {
            setIs2FAEnabled(false);
          }
        }
      }

      let allowedStructureIds: number[] = [];
      let isAdmin = false;
      if (myAuthRes.ok) {
        const data = await myAuthRes.json();
        allowedStructureIds = data.allowedIds || [];
        isAdmin = data.isAdmin || false;
      }

      if (structuresRes.ok) {
        const data = await structuresRes.json();
        let validData = data.data.filter((c: any) => c.isActive !== false);

        // Filter based on user authorizations
        if (!isAdmin) {
          validData = validData.filter((c: any) => 
            allowedStructureIds.includes(c.businessStructureId) ||
            c.code === '01' // Allow root for navigation
          );
        }

        setAllStructures(validData);

        // type 1: Holding, 2: Company
        const isCompanyActive = activeTypes.includes(1) || activeTypes.includes(2);
        const validCompanies = isCompanyActive ? validData.filter(
          (c: any) => (Number(c.businessStructure) === 1 || Number(c.businessStructure) === 2) && Number(c.parentRef) !== 0
        ) : [];
        setCompanies(validCompanies);

        // Branches
        const isBranchActive = activeTypes.includes(3);
        const validBranches = isBranchActive ? validData.filter((c: any) => Number(c.businessStructure) === 3) : [];
        setBranches(validBranches);

        // Representatives
        const isRepActive = activeTypes.includes(4);
        const validReps = isRepActive ? validData.filter((c: any) => Number(c.businessStructure) === 4) : [];
        setReps(validReps);
        
        setCurrentCompany(prev => {
          if (prev) {
            const stillExists = validCompanies.find((c: any) => c.businessStructureId === prev.businessStructureId);
            if (stillExists) return stillExists;
            if (validCompanies.length > 0) return validCompanies[0];
            return null;
          } else if (validCompanies.length > 0) {
            return validCompanies[0];
          }
          return null;
        });

        setCurrentBranch(prev => {
          if (prev) {
            const stillExists = validBranches.find((c: any) => c.businessStructureId === prev.businessStructureId);
            if (stillExists) return stillExists;
            return null;
          }
          return prev;
        });

        setCurrentRep(prev => {
          if (prev) {
            const stillExists = validReps.find((c: any) => c.businessStructureId === prev.businessStructureId);
            if (stillExists) return stillExists;
            return null;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    setMounted(true);
    fetchAllStructures();
    
    const handleUpdate = () => {
      fetchAllStructures();
    };
    window.addEventListener('company-list-updated', handleUpdate);
    return () => window.removeEventListener('company-list-updated', handleUpdate);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target as Node)) {
        setIsBranchDropdownOpen(false);
      }
      if (repDropdownRef.current && !repDropdownRef.current.contains(event.target as Node)) {
        setIsRepDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setIsThemeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCompanySelect = (comp: CompanyInfo) => {
    if (currentCompany?.businessStructureId === comp.businessStructureId) {
      setIsDropdownOpen(false);
      return;
    }
    
    const hasDirty = Object.keys(dirtyTabs).length > 0;
    if (hasDirty) {
      setPendingSelection({ type: 'company', company: comp, branch: null, rep: null });
      setShowConfirm(true);
      setIsDropdownOpen(false);
    } else {
      removeAllTabs();
      setCurrentCompany(comp);
      setIsDropdownOpen(false);
    }
  };

  const handleBranchSelect = (branch: CompanyInfo) => {
    if (currentBranch?.businessStructureId === branch.businessStructureId) {
      setIsBranchDropdownOpen(false);
      return;
    }
    
    const parentCompany = allStructures.find(s => s.businessStructureId === branch.parentRef);
    const updatedCompany = parentCompany || currentCompany;

    const hasDirty = Object.keys(dirtyTabs).length > 0;
    if (hasDirty) {
      setPendingSelection({ type: 'branch', company: updatedCompany, branch: branch, rep: null });
      setShowConfirm(true);
      setIsBranchDropdownOpen(false);
    } else {
      removeAllTabs();
      if (updatedCompany && updatedCompany.businessStructureId !== currentCompany?.businessStructureId) {
        setCurrentCompany(updatedCompany);
      }
      setCurrentBranch(branch);
      setCurrentRep(null);
      setIsBranchDropdownOpen(false);
    }
  };

  const handleRepSelect = (rep: CompanyInfo) => {
    if (currentRep?.businessStructureId === rep.businessStructureId) {
      setIsRepDropdownOpen(false);
      return;
    }
    
    let targetBranch: CompanyInfo | null = null;
    let targetCompany: CompanyInfo | null = null;
    
    const parent1 = allStructures.find(s => s.businessStructureId === rep.parentRef);
    if (parent1) {
      if (Number(parent1.businessStructure) === 3) {
        targetBranch = parent1;
        const parent2 = allStructures.find(s => s.businessStructureId === parent1.parentRef);
        if (parent2 && (Number(parent2.businessStructure) === 1 || Number(parent2.businessStructure) === 2)) {
          targetCompany = parent2;
        }
      } else if (Number(parent1.businessStructure) === 1 || Number(parent1.businessStructure) === 2) {
        targetCompany = parent1;
      }
    }
    const updatedCompany = targetCompany || currentCompany;
    
    const hasDirty = Object.keys(dirtyTabs).length > 0;
    if (hasDirty) {
      setPendingSelection({ type: 'rep', company: updatedCompany, branch: targetBranch, rep: rep });
      setShowConfirm(true);
      setIsRepDropdownOpen(false);
    } else {
      removeAllTabs();
      if (updatedCompany && updatedCompany.businessStructureId !== currentCompany?.businessStructureId) {
        setCurrentCompany(updatedCompany);
      }
      setCurrentBranch(targetBranch);
      setCurrentRep(rep);
      setIsRepDropdownOpen(false);
    }
  };

  const [isLocked, setIsLocked] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('app-locked') === 'true') {
      setIsLocked(true);
    }
  }, []);

  const handleLogoutClick = () => {
    setIsUserDropdownOpen(false);
    const dirtyTabId = Object.keys(dirtyTabs)[0];
    if (dirtyTabId) {
      const dirtyTab = tabs.find(t => t.id === dirtyTabId);
      setPendingSelection({ 
        type: 'logout', 
        company: null, 
        branch: null, 
        rep: null,
        dirtyTabTitle: dirtyTab?.title || "فرم"
      });
      setShowConfirm(true);
    } else {
      performLogout();
    }
  };

  const performLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error("Error during server logout:", error);
    }
    
    removeAllTabs();
    localStorage.removeItem('token');
    localStorage.removeItem('app-locked');
    router.push('/login');
  };

  const handleLockClick = () => {
    setIsUserDropdownOpen(false);
    setIsLocked(true);
    localStorage.setItem('app-locked', 'true');
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockPassword.trim()) {
      setUnlockError('لطفا رمز عبور را وارد کنید');
      return;
    }
    // Simulation logic
    setIsLocked(false);
    setUnlockPassword('');
    setUnlockError('');
    localStorage.removeItem('app-locked');
  };

  const handleConfirmSwitch = () => {
    if (pendingSelection?.type === 'logout') {
      removeAllTabs();
      performLogout();
      return;
    }
    
    removeAllTabs();
    if (pendingSelection) {
      if (pendingSelection.company && pendingSelection.company.businessStructureId !== currentCompany?.businessStructureId) {
         setCurrentCompany(pendingSelection.company);
      }
      
      if (pendingSelection.type === 'branch') {
         setCurrentBranch(pendingSelection.branch);
         setCurrentRep(null);
      } else if (pendingSelection.type === 'rep') {
         setCurrentBranch(pendingSelection.branch);
         setCurrentRep(pendingSelection.rep);
      }
    }
    setShowConfirm(false);
    setPendingSelection(null);
  };

  const handleCancelSwitch = () => {
    setShowConfirm(false);
    setPendingSelection(null);
    const dirtyTabId = Object.keys(dirtyTabs)[0];
    if (dirtyTabId) {
      setActiveTabId(dirtyTabId);
    }
  };

  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  return (
    <header className="relative z-[100] shrink-0 flex h-16 items-center justify-between bg-slate-50/95 px-4 md:px-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] backdrop-blur-md dark:bg-gray-950/95 dark:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.4)]">
      {/* Creative Gradient Bottom Border */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-70 dark:via-gray-700" />
      <div className="flex items-center gap-2 md:gap-4">
        {onMenuToggle && (
           <button 
             onClick={onMenuToggle}
             className="md:hidden flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
             aria-label="Toggle Menu"
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
           </button>
        )}
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm overflow-hidden">
              {currentCompany?.logoUrl ? (
                <img src={currentCompany.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold">شرکت</span>
              )}
            </div>
            <div className="hidden sm:block text-start">
              <h1 className="text-sm font-bold leading-tight line-clamp-1">{currentCompany?.title || "انتخاب شرکت"}</h1>
              <p className="text-xs text-gray-500 line-clamp-1">{currentCompany?.title_en || "Select Entity"}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500 mx-1" />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-12 start-0 w-64 bg-slate-50 dark:bg-gray-800 shadow-lg rounded-lg border border-gray-100 dark:border-gray-700 py-1 z-50 max-h-64 overflow-y-auto">
              {companies.length > 0 ? (
                companies.map(comp => (
                  <button
                    key={comp.businessStructureId}
                    onClick={() => handleCompanySelect(comp)}
                    className="w-full text-start flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex-shrink-0 h-8 w-8 rounded bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center overflow-hidden">
                      {comp.logoUrl ? (
                        <img src={comp.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold">لوگو</span>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{comp.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] text-gray-500 truncate">{comp.title_en || "No English Title"}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 whitespace-nowrap">
                          {(comp as any).businessStructureName || (comp.businessStructure === 1 ? 'دفتر مرکزی' : 'شرکت')}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">موردی یافت نشد.</div>
              )}
            </div>
          )}
        </div>

        {/* Branch Selector */}
        {companyBranches.length > 0 && (
          <div className="relative" ref={branchDropdownRef}>
            <button 
              onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
              className="flex items-center gap-2 rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-s border-gray-100 dark:border-gray-800 ps-2 ms-2 sm:ps-4 sm:ms-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm overflow-hidden flex-col">
                {currentBranch?.logoUrl ? (
                  <img src={currentBranch.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-[10px] my-auto text-center">شعبه</span>
                )}
              </div>
              <div className="hidden sm:block text-start">
                <h1 className="text-sm font-bold leading-tight line-clamp-1">{currentBranch?.title || "انتخاب شعبه"}</h1>
                <p className="text-xs text-gray-500 line-clamp-1">{currentBranch?.title_en || "Select Branch"}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500 mx-1" />
            </button>

            {isBranchDropdownOpen && (
              <div className="absolute top-12 start-0 w-64 bg-slate-50 dark:bg-gray-800 shadow-lg rounded-lg border border-gray-100 dark:border-gray-700 py-1 z-50 max-h-64 overflow-y-auto">
                {companyBranches.map(branch => (
                  <button
                    key={branch.businessStructureId}
                    onClick={() => handleBranchSelect(branch)}
                    className="w-full text-start flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex-shrink-0 h-8 w-8 rounded bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center overflow-hidden">
                      {branch.logoUrl ? (
                        <img src={branch.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold">لوگو</span>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{branch.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] text-gray-500 truncate">{branch.title_en || "No English Title"}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 whitespace-nowrap">
                          {(branch as any).businessStructureName || 'شعبه'}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Representative Selector */}
        {companyReps.length > 0 && (
          <div className="relative" ref={repDropdownRef}>
            <button 
              onClick={() => setIsRepDropdownOpen(!isRepDropdownOpen)}
              className="flex items-center gap-2 rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-s border-gray-100 dark:border-gray-800 ps-2 ms-2 sm:ps-4 sm:ms-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600 text-white shadow-sm overflow-hidden flex-col">
                {currentRep?.logoUrl ? (
                  <img src={currentRep.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-[10px] my-auto text-center">نمایندگی</span>
                )}
              </div>
              <div className="hidden sm:block text-start">
                <h1 className="text-sm font-bold leading-tight line-clamp-1">{currentRep?.title || "انتخاب نمایندگی"}</h1>
                <p className="text-xs text-gray-500 line-clamp-1">{currentRep?.title_en || "Select Rep"}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500 mx-1" />
            </button>

            {isRepDropdownOpen && (
              <div className="absolute top-12 start-0 w-64 bg-slate-50 dark:bg-gray-800 shadow-lg rounded-lg border border-gray-100 dark:border-gray-700 py-1 z-50 max-h-64 overflow-y-auto">
                {companyReps.map(rep => (
                  <button
                    key={rep.businessStructureId}
                    onClick={() => handleRepSelect(rep)}
                    className="w-full text-start flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex-shrink-0 h-8 w-8 rounded bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center overflow-hidden">
                      {rep.logoUrl ? (
                        <img src={rep.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold">لوگو</span>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{rep.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] text-gray-500 truncate">{rep.title_en || "No English Title"}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 whitespace-nowrap">
                          {(rep as any).businessStructureName || 'نمایندگی'}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-4">
        {/* Language Switcher */}
        <div className="relative" ref={languageDropdownRef}>
          <button
            onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
            className="flex h-10 px-3 items-center justify-center gap-2 rounded-full border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          >
            <FlagIcon lang={language} />
            <span className="text-xs font-medium uppercase">{language}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </button>
          
          {isLanguageDropdownOpen && (
            <div className="absolute top-full mt-2 w-48 rounded-2xl border border-gray-100 bg-slate-50 p-2 shadow-xl dark:border-gray-800 dark:bg-gray-950 z-50 ltr:right-0 rtl:left-0">
              <div className="flex flex-col gap-1">
                {[
                  { id: 'fa', name: 'فارسی', code: 'IR' },
                  { id: 'en', name: 'English', code: 'EN' },
                  { id: 'ar', name: 'العربية', code: 'AR' },
                  { id: 'zh', name: '中文', code: 'ZH' },
                  { id: 'ku', name: 'کوردی', code: 'KU' },
                  { id: 'de', name: 'Deutsch', code: 'DE' },
                  { id: 'fr', name: 'Français', code: 'FR' },
                  { id: 'hi', name: 'हिन्दी', code: 'HI' },
                  { id: 'ru', name: 'Русский', code: 'RU' },
                  { id: 'af', name: 'دری/پښتو', code: 'AF' }
                ].map((langItem) => (
                  <button
                    key={langItem.id}
                    onClick={() => { setLanguage(langItem.id as any); setIsLanguageDropdownOpen(false); }}
                    className={`flex items-center justify-between w-full rounded-xl px-3 py-2 text-sm transition-colors ${language === langItem.id ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 font-medium' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900'}`}
                  >
                    <div className="flex items-center gap-3">
                      <FlagIcon lang={langItem.id} />
                      <span>{langItem.name}</span>
                    </div>
                    {language === langItem.id && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <div className="relative" ref={themeDropdownRef}>
          <button
            onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
            className="flex h-10 px-3 items-center justify-center gap-2 rounded-full border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle Theme"
          >
            {mounted ? (
              currentTheme === 'dark' ? <Moon className="h-5 w-5 text-indigo-500" /> :
              currentTheme === 'spring' ? <Flower className="h-5 w-5 text-emerald-500" /> :
              currentTheme === 'summer' ? <CloudSun className="h-5 w-5 text-amber-500" /> :
              currentTheme === 'autumn' ? <Leaf className="h-5 w-5 text-orange-500" /> :
              currentTheme === 'winter' ? <Snowflake className="h-5 w-5 text-blue-500" /> :
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : <Sun className="h-5 w-5 text-yellow-500" />}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </button>
          
          {isThemeDropdownOpen && (
            <div className="absolute top-12 end-0 w-48 bg-slate-50 dark:bg-gray-800 shadow-xl rounded-xl border border-gray-100 dark:border-gray-700 py-1.5 z-[9999] overflow-hidden">
              <button 
                onClick={() => { setTheme('light'); setIsThemeDropdownOpen(false); }}
                className={`flex items-center justify-between w-full text-start px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${currentTheme === 'light' ? 'text-blue-600 font-medium' : 'text-gray-700 dark:text-gray-200'}`}
              >
                <div className="flex items-center gap-3"><Sun className="h-4 w-4" />حالت روز</div>
                {currentTheme === 'light' && <Check className="h-4 w-4" />}
              </button>
              <button 
                onClick={() => { setTheme('dark'); setIsThemeDropdownOpen(false); }}
                className={`flex items-center justify-between w-full text-start px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${currentTheme === 'dark' ? 'text-blue-600 font-medium' : 'text-gray-700 dark:text-gray-200'}`}
              >
                <div className="flex items-center gap-3"><Moon className="h-4 w-4" />حالت شب</div>
                {currentTheme === 'dark' && <Check className="h-4 w-4" />}
              </button>
              <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
              <button 
                onClick={() => { setTheme('spring'); setIsThemeDropdownOpen(false); }}
                className={`flex items-center justify-between w-full text-start px-4 py-2 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors ${currentTheme === 'spring' ? 'text-emerald-600 font-medium' : 'text-gray-700 dark:text-gray-200'}`}
              >
                <div className="flex items-center gap-3"><Flower className="h-4 w-4 text-emerald-500" />نمای بهار</div>
                {currentTheme === 'spring' && <Check className="h-4 w-4 text-emerald-600" />}
              </button>
              <button 
                onClick={() => { setTheme('summer'); setIsThemeDropdownOpen(false); }}
                className={`flex items-center justify-between w-full text-start px-4 py-2 text-sm hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors ${currentTheme === 'summer' ? 'text-amber-600 font-medium' : 'text-gray-700 dark:text-gray-200'}`}
              >
                <div className="flex items-center gap-3"><CloudSun className="h-4 w-4 text-amber-500" />نمای تابستان</div>
                {currentTheme === 'summer' && <Check className="h-4 w-4 text-amber-600" />}
              </button>
              <button 
                onClick={() => { setTheme('autumn'); setIsThemeDropdownOpen(false); }}
                className={`flex items-center justify-between w-full text-start px-4 py-2 text-sm hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors ${currentTheme === 'autumn' ? 'text-orange-600 font-medium' : 'text-gray-700 dark:text-gray-200'}`}
              >
                <div className="flex items-center gap-3"><Leaf className="h-4 w-4 text-orange-500" />نمای پاییز</div>
                {currentTheme === 'autumn' && <Check className="h-4 w-4 text-orange-600" />}
              </button>
              <button 
                onClick={() => { setTheme('winter'); setIsThemeDropdownOpen(false); }}
                className={`flex items-center justify-between w-full text-start px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${currentTheme === 'winter' ? 'text-blue-600 font-medium' : 'text-gray-700 dark:text-gray-200'}`}
              >
                <div className="flex items-center gap-3"><Snowflake className="h-4 w-4 text-blue-500" />نمای زمستان</div>
                {currentTheme === 'winter' && <Check className="h-4 w-4 text-blue-600" />}
              </button>
            </div>
          )}
        </div>
        
        {/* Action icons */}
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800">
           <Bell className="h-5 w-5" />
        </button>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800">
           <Settings className="h-5 w-5" />
        </button>
        
        {/* User Profile */}
        <div className="relative" ref={userDropdownRef}>
          <button 
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 py-1 pe-2 ps-1 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 overflow-hidden dark:bg-indigo-900/50 dark:text-indigo-400">
              <span className="text-xs font-bold">
                {currentUser 
                  ? (currentUser.firstName && currentUser.lastName
                      ? `${currentUser.firstName[0]}.${currentUser.lastName[0]}`
                      : currentUser.username?.[0]?.toUpperCase() || 'U')
                  : 'U'}
              </span>
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
              {currentUser 
                ? (currentUser.firstName || currentUser.lastName 
                    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() 
                    : currentUser.username)
                : t('user' as any) || 'کاربر'}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {isUserDropdownOpen && (
            <div className="absolute top-12 end-0 w-48 bg-slate-50 dark:bg-gray-800 shadow-lg rounded-xl border border-gray-100 dark:border-gray-700 py-1.5 z-50 overflow-hidden">
              <button className="flex items-center gap-2 w-full text-start px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Palette className="h-4 w-4 text-emerald-500" />
                تنظیمات ظاهری
              </button>
              <button 
                onClick={() => {
                  setIsUserDropdownOpen(false);
                  setIsChangePasswordModalOpen(true);
                }}
                className="flex items-center gap-2 w-full text-start px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Key className="h-4 w-4 text-blue-500" />
                تغییر رمز
              </button>
              <button 
                onClick={handleLockClick}
                className="flex items-center gap-2 w-full text-start px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Lock className="h-4 w-4 text-amber-500" />
                قفل نرم افزار
              </button>
              {is2FAEnabled && (
                <>
                  <div className="h-px bg-gray-100 dark:bg-gray-700 my-1.5" />
                  <button 
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      setIs2FAModalOpen(true);
                    }}
                    className="flex items-center gap-2 w-full text-start px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4 text-indigo-500" />
                    تنظیم ورود دو مرحله‌ای
                  </button>
                </>
              )}
              <div className="h-px bg-gray-100 dark:bg-gray-700 my-1.5" />
              <button 
                onClick={handleLogoutClick}
                className="flex items-center gap-2 w-full text-start px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/10 transition-colors"
              >
                <LogOut className="h-4 w-4 text-rose-500" />
                خروج
              </button>
            </div>
          )}
        </div>
      </div>

      {mounted && createPortal(
        <>
          <TwoFactorSetupModal 
            isOpen={is2FAModalOpen} 
            onClose={() => setIs2FAModalOpen(false)} 
          />

          <ChangePasswordModal 
            isOpen={isChangePasswordModalOpen} 
            onClose={() => setIsChangePasswordModalOpen(false)} 
          />

          <ConfirmDialog
            isOpen={showConfirm}
            title={pendingSelection?.type === 'logout' ? "اخطار خروج از سیستم" : "اخطار اطلاعات ذخیره نشده"}
            message={
              pendingSelection?.type === 'logout' 
                ? `اطلاعات فرم "${pendingSelection?.dirtyTabTitle}" ذخیره نشده است. آیا ادامه می دهید؟`
                : "اطلاعات ذخیره نشده وجود دارد. ادامه می دهید؟"
            }
            confirmText="بلی"
            cancelText="خیر"
            onConfirm={handleConfirmSwitch}
            onCancel={handleCancelSwitch}
          />
        </>,
        document.body
      )}

      {/* Lock Screen Overlay */}
      {isLocked && mounted && createPortal(
        <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 z-0"></div>
          
          {/* Logout Button on Lock Screen */}
          <div className="absolute top-8 end-8 z-10">
            <button 
              onClick={handleLogoutClick}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all border border-white/10 shadow-lg"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">خروج از سیستم</span>
            </button>
          </div>

          <div className="relative z-10 flex flex-col items-center max-w-sm w-full p-8 sm:p-10 bg-slate-50/90 dark:bg-gray-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50">
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/30">
              <Lock className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">نرم افزار قفل شده است</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 text-center px-4">
              برای ورود مجدد، کلمه عبور خود را وارد کنید
            </p>
            <form onSubmit={handleUnlock} className="w-full flex flex-col gap-5">
              <div>
                <input
                  type="password"
                  value={unlockPassword}
                  onChange={(e) => {
                    setUnlockPassword(e.target.value);
                    setUnlockError('');
                  }}
                  placeholder="کلمه عبور"
                  className="w-full px-5 py-3.5 rounded-2xl border-0 bg-gray-100/80 focus:bg-slate-50 dark:bg-gray-800/80 dark:focus:bg-gray-800 text-center text-lg tracking-widest outline-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-indigo-500 transition-all font-mono shadow-inner"
                  autoFocus
                />
                {unlockError && (
                  <p className="mt-2 text-sm text-rose-500 text-center font-medium animate-in fade-in slide-in-from-top-1">{unlockError}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-medium transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
              >
                <Unlock className="w-5 h-5" />
                ورود به سیستم
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
