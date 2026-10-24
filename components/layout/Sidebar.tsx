'use client';
import React from 'react';

import { useLanguage, useAuth } from '@/components/Providers';
import { useTabs } from '@/components/TabsProvider';
import { useLayoutStore } from '@/lib/stores/layoutStore';
import { useMenuStore } from '@/lib/stores/menuStore';
import { useShallow } from 'zustand/react/shallow';
import {
  ChevronDown,
  Pin,
  PinOff,
  Search,
  FileText,
  Folder,
  FolderPlus,
  Settings,
  Database,
  Users,
  ShoppingCart,
  Factory,
  Briefcase,
  Box,
  BarChart,
  Truck,
  LayoutDashboard,
  Layers,
  Shield,
  Calculator,
  CreditCard,
  Wallet,
  Wrench,
  Building2,
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Folder,
  FolderPlus,
  Settings,
  Database,
  Users,
  ShoppingCart,
  Factory,
  Briefcase,
  Box,
  FileText,
  BarChart,
  Truck,
  LayoutDashboard,
  Layers,
  Shield,
  Calculator,
  CreditCard,
  Wallet,
  Wrench,
  Building2,
};
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useLicenseStore } from '@/lib/stores/licenseStore';
import { SIDEBAR_STRUCTURE, SidebarGroup, SidebarItem as SidebarItemType } from '@/lib/sidebar-metadata';
import { apiFetch } from '@/lib/utils';

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const { t } = useLanguage();
  const { tabs, addTab, setActiveTabId } = useTabs();
  const { currentUser } = useAuth();
  const hasModule = useLicenseStore(useShallow(state => state.hasModule));
  
  const rapRestrictedIds = [
    'RapReasons',
    'ChequebookForm', 'ChequebookList',
    'ChequeTemplateSettings', 'ChequePrintTemplateList',
    'PromissoryNoteForm', 'PromissoryNoteList',
    'AccountingSettingForm', 'AccountingSettingList',
    'PaymentNotification', 'PaymentNotificationList',
    'operations_rp',
    'operations_rp_lists'
  ];

  const {
    isPinned,
    setIsPinned,
    openMenu,
    setOpenMenu,
    searchQuery,
    setSearchQuery,
  } = useLayoutStore(useShallow(state => ({
    isPinned: state.isSidebarPinned,
    setIsPinned: state.setSidebarPinned,
    openMenu: state.openMenuId,
    setOpenMenu: state.setOpenMenuId,
    searchQuery: state.searchQuery,
    setSearchQuery: state.setSearchQuery,
  })));

  const [openMenuItemId, setOpenMenuItemId] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isTrackingFactorActive, setIsTrackingFactorActive] = useState<boolean>(false);
  
  const { 
    customMainMenus, 
    customSubMenus, 
    hiddenMenus, 
    dynamicForms, 
    loadFromStorage, 
    setDynamicForms 
  } = useMenuStore();

  const isExpanded = isPinned || isHovered;

  // Fetch dynamic forms & custom main menus & warehouse settings
  useEffect(() => {
    loadFromStorage();

    const fetchWarehouseSettings = async () => {
      try {
        const res = await apiFetch('/api/common/base-settings/tab/3');
        if (res.ok) {
          const json = await res.json();
          const data = json.data || {};
          const isActive = data.isTrackingFactorActiveInWarehouse === 'true' || data.isTrackingFactorActiveInWarehouse === true;
          setIsTrackingFactorActive(isActive);
        }
      } catch (err) {
        console.error('Error fetching warehouse settings for sidebar:', err);
      }
    };

    const fetchForms = async () => {
      try {
        const res = await apiFetch('/api/dfb/forms');
        if (res.ok) {
          const json = await res.json();
          setDynamicForms(json.data || []);
        }
      } catch (err) {
        console.error('Error fetching dynamic forms for sidebar:', err);
      }
    };

    fetchForms();
    fetchWarehouseSettings();

    const handleUpdateEvent = () => {
      loadFromStorage();
      fetchForms();
      fetchWarehouseSettings();
    };

    window.addEventListener('parsa_custom_menus_updated', handleUpdateEvent);
    window.addEventListener('parsa_base_settings_updated', handleUpdateEvent);
    window.addEventListener('storage', handleUpdateEvent);

    return () => {
      window.removeEventListener('parsa_custom_menus_updated', handleUpdateEvent);
      window.removeEventListener('parsa_base_settings_updated', handleUpdateEvent);
      window.removeEventListener('storage', handleUpdateEvent);
    };
  }, []);

  // Permission check helper

  const hasAccess = (id: string) => {
    if (id === 'TrackingFactorForm' && !isTrackingFactorActive) {
      return false;
    }
    return true; // Bypassed for development - Full Admin Access
    
    if (rapRestrictedIds.includes(id)) {
      if (!hasModule('rap')) return false;
    }

    if (!currentUser?.permissions) return false;
    if (currentUser.permissions.includes('*')) return true;
    return currentUser.permissions.some((p: string) => p === id || p.startsWith(id + ':'));
  };

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };
  
  const handleTabClick = (title: string, groupId: string, icon: React.ReactNode, componentName?: string, props?: any) => {
    addTab(title, groupId, icon, componentName, props);
    if (onClose) onClose();
  };

  const mapItem = (item: any, sizeClass: string): any => {
    let tKey = (item.id || item.title) as string;

    return {
      ...item,
      title: t(tKey as any, item.title),
      icon: item.icon ? <item.icon className={sizeClass} /> : null,
      subItems: item.subItems
        ?.filter((sub: any) => hasAccess(sub.id || sub.title))
        .map((sub: any) => mapItem(sub, "h-[14px] w-[14px]")),
    };
  };

  const baseMenuGroups = useMemo(() => {
    return SIDEBAR_STRUCTURE
      .filter(group => hasAccess(group.id))
      .map(group => ({
        ...group,
        title: t(group.id as any, group.title),
        icon: <group.icon className="h-5 w-5" />,
        items: group.items
          .filter(item => hasAccess(item.id || item.title))
          .map(item => mapItem(item, "h-[18px] w-[18px]"))
      }))
      .filter(group => group.items.length > 0);
  }, [currentUser, t, isTrackingFactorActive]);

  const menuGroups = useMemo(() => {
    const groupPriorityMap: Record<string, number> = {
      general_group: 1,
      accounting_group: 2,
      financial_group: 2,
      rap_group: 3,
      supply_chain_group: 4,
      warehouse_logistics_group: 5,
      inventory_group: 5,
      contract_group: 6,
      org_management_group: 7,
    };

    const clonedGroups: any[] = baseMenuGroups.map(g => ({
      ...g,
      priority: groupPriorityMap[g.id] || 10,
      items: g.items.map((it: any) => ({
        ...it,
        subItems: it.subItems ? it.subItems.map((sub: any) => ({
          ...sub,
          subItems: sub.subItems ? [...sub.subItems] : []
        })) : []
      }))
    }));

    // Inject Custom Main Menus as Top-Level Standalone Groups (سرشاخه‌های اصلی)
    customMainMenus.forEach(cm => {
      const IconComponent = (cm.icon && ICON_MAP[cm.icon]) ? ICON_MAP[cm.icon] : FileText;
      const colorHex = cm.color || '#3b82f6';

      let customGroup = clonedGroups.find(g => g.id === cm.id || g.title === cm.title);
      if (!customGroup) {
        customGroup = {
          id: cm.id,
          title: cm.title,
          icon: <IconComponent className="h-5 w-5" style={{ color: colorHex }} />,
          colorClass: 'bg-indigo-600',
          textColorClass: 'text-indigo-600',
          scrollbarClass: '[&::-webkit-scrollbar-thumb]:bg-indigo-600 dark:[&::-webkit-scrollbar-thumb]:bg-indigo-500',
          priority: typeof cm.priority === 'number' ? cm.priority : 99,
          customColor: colorHex,
          items: []
        };
        clonedGroups.push(customGroup);
      } else {
        customGroup.priority = typeof cm.priority === 'number' ? cm.priority : customGroup.priority;
        customGroup.customColor = colorHex;
        customGroup.icon = <IconComponent className="h-5 w-5" style={{ color: colorHex }} />;
      }
    });

    // Inject Dynamic Forms into their target top-level groups
    dynamicForms.forEach(form => {
      const fCode = form.formCode || form.code;
      if (!fCode) return;

      const mConfig = form.menuConfig || {};
      const targetGroupId = mConfig.groupId || 'general_group';
      const targetMenuTitle = mConfig.menuTitle || '';
      const targetSubMenuTitle = mConfig.subMenuTitle || '';

      let targetGroup = clonedGroups.find(g => 
        (targetMenuTitle && (g.title === targetMenuTitle || g.id === targetMenuTitle)) ||
        (targetGroupId && (g.id === targetGroupId || g.title === targetGroupId || g.id === `custom_group_${targetGroupId}`))
      );

      if (!targetGroup) {
        targetGroup = clonedGroups.find(g => g.id === 'general_group') || clonedGroups[0];
      }
      if (!targetGroup) return;

      const formMenuItem = {
        id: `dfb_runner_${fCode}`,
        title: form.title,
        icon: <FileText className="h-[14px] w-[14px]" />,
        componentName: 'DynamicFormRunner',
        props: { formCode: fCode },
        subItems: []
      };

      if (targetMenuTitle === targetGroup.title || !targetMenuTitle) {
        if (targetSubMenuTitle) {
          let targetSub = targetGroup.items.find((sub: any) => 
            sub.title === targetSubMenuTitle || 
            sub.id === targetSubMenuTitle ||
            sub.id === `dynamic_sub_${targetSubMenuTitle}`
          );

          if (!targetSub) {
            targetSub = {
              id: `dynamic_sub_${targetSubMenuTitle}`,
              title: targetSubMenuTitle,
              icon: <FileText className="h-[18px] w-[18px]" />,
              subItems: []
            };
            targetGroup.items.push(targetSub);
          }

          if (!targetSub.subItems) targetSub.subItems = [];
          if (!targetSub.subItems.some((s: any) => s.id === formMenuItem.id)) {
            targetSub.subItems.push(formMenuItem);
          }
        } else {
          if (!targetGroup.items.some((s: any) => s.id === formMenuItem.id)) {
            targetGroup.items.push(formMenuItem);
          }
        }
      } else {
        let targetItem = targetGroup.items.find((it: any) => 
          it.title === targetMenuTitle || 
          it.id === targetMenuTitle || 
          it.id === `custom_menu_${targetMenuTitle}` ||
          (targetMenuTitle === 'فرم ساز پویا (DFB)' && it.id === 'dynamic_form_builder')
        );

        if (!targetItem) {
          targetItem = {
            id: `dynamic_menu_${targetMenuTitle}`,
            title: targetMenuTitle,
            icon: <FileText className="h-[18px] w-[18px]" />,
            subItems: []
          };
          targetGroup.items.push(targetItem);
        }

        if (targetSubMenuTitle) {
          let targetSub = targetItem.subItems?.find((sub: any) => 
            sub.title === targetSubMenuTitle || 
            sub.id === targetSubMenuTitle ||
            (targetSubMenuTitle === 'فرم‌های ایجاد شده' && sub.id === 'dynamic_user_forms_menu')
          );

          if (!targetSub) {
            targetSub = {
              id: `dynamic_sub_${targetSubMenuTitle}`,
              title: targetSubMenuTitle,
              icon: <FileText className="h-[14px] w-[14px]" />,
              subItems: []
            };
            if (!targetItem.subItems) targetItem.subItems = [];
            targetItem.subItems.push(targetSub);
          }

          if (!targetSub.subItems) targetSub.subItems = [];
          if (!targetSub.subItems.some((s: any) => s.id === formMenuItem.id)) {
            targetSub.subItems.push(formMenuItem);
          }
        } else {
          if (!targetItem.subItems) targetItem.subItems = [];
          if (!targetItem.subItems.some((s: any) => s.id === formMenuItem.id)) {
            targetItem.subItems.push(formMenuItem);
          }
        }
      }
    });

    // Inject Custom SubMenus
    customSubMenus.forEach(cs => {
      let targetGroup = clonedGroups.find(g => 
        (cs.menuTitle && (g.title === cs.menuTitle || g.id === cs.menuTitle)) ||
        (cs.groupId && (g.id === cs.groupId || g.title === cs.groupId))
      );
      if (!targetGroup) targetGroup = clonedGroups.find(g => g.id === 'general_group');
      if (!targetGroup) return;

      const IconComponent = (cs.icon && ICON_MAP[cs.icon]) || Folder;

      if (cs.menuTitle === targetGroup.title || !cs.menuTitle || cs.menuTitle === targetGroup.id) {
        let targetSub = targetGroup.items.find((s: any) => s.id === cs.id || s.title === cs.title);
        if (!targetSub) {
          targetGroup.items.push({
            id: cs.id,
            title: cs.title,
            icon: <IconComponent className="h-[18px] w-[18px]" />,
            subItems: []
          });
        }
      } else {
        let targetItem = targetGroup.items.find((it: any) => 
          it.title === cs.menuTitle || 
          it.id === cs.menuTitle || 
          it.id === `dynamic_menu_${cs.menuTitle}`
        );

        if (!targetItem) {
          targetItem = {
            id: `dynamic_menu_${cs.menuTitle}`,
            title: cs.menuTitle,
            icon: <Folder className="h-[18px] w-[18px]" />,
            subItems: []
          };
          targetGroup.items.push(targetItem);
        }

        if (!targetItem.subItems) targetItem.subItems = [];
        if (!targetItem.subItems.some((s: any) => s.id === cs.id || s.title === cs.title)) {
          targetItem.subItems.push({
            id: cs.id,
            title: cs.title,
            icon: <IconComponent className="h-[14px] w-[14px]" />,
            subItems: []
          });
        }
      }
    });

    // Sort top-level groups by priority
    clonedGroups.sort((a, b) => {
      const pA = typeof a.priority === 'number' ? a.priority : 999;
      const pB = typeof b.priority === 'number' ? b.priority : 999;
      return pA - pB;
    });

    // Sort items inside each group by priority
    clonedGroups.forEach(g => {
      g.items.sort((a: any, b: any) => {
        const pA = typeof a.priority === 'number' ? a.priority : 999;
        const pB = typeof b.priority === 'number' ? b.priority : 999;
        return pA - pB;
      });
    });

    // Filter out items & groups in hiddenMenus
    const isHidden = (item: any) => {
      if (!hiddenMenus || hiddenMenus.length === 0) return false;
      return hiddenMenus.includes(item.id);
    };

    const filterHiddenItems = (items: any[]): any[] => {
      return items
        .filter(it => !isHidden(it))
        .map(it => ({
          ...it,
          subItems: it.subItems ? filterHiddenItems(it.subItems) : []
        }));
    };

    const finalGroups = clonedGroups
      .filter(g => !isHidden(g))
      .map(g => ({
        ...g,
        items: filterHiddenItems(g.items)
      }));

    return finalGroups;
  }, [baseMenuGroups, dynamicForms, customMainMenus, customSubMenus, hiddenMenus]);

  const filteredMenuGroups = useMemo(() => {
    let processedGroups = menuGroups;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      const searchItem = (item: any): any | null => {
        const matchTitle = item.title?.toLowerCase().includes(query) || (item.keywords && item.keywords.some((k: string) => k.toLowerCase().includes(query)));
        
        let filteredSubItems: any[] | null = null;
        if (item.subItems) {
          filteredSubItems = item.subItems.map(searchItem).filter(Boolean);
        }

        if (matchTitle || (filteredSubItems && filteredSubItems.length > 0)) {
          return {
            ...item,
            subItems: matchTitle ? item.subItems : filteredSubItems,
            forceOpen: !!(filteredSubItems && filteredSubItems.length > 0)
          };
        }
        return null;
      };

      processedGroups = menuGroups.map(group => {
        const matchGroupTitle = group.title?.toLowerCase().includes(query);
        const filteredItems = group.items.map(searchItem).filter(Boolean);

        if (matchGroupTitle || filteredItems.length > 0) {
          return {
            ...group,
            items: matchGroupTitle ? group.items : filteredItems,
            forceOpen: true
          };
        }
        return null;
      }).filter(Boolean) as any[];
    }

    return processedGroups;
  }, [menuGroups, searchQuery, openMenuItemId]);

  const DashboardIcon = SIDEBAR_STRUCTURE[0].icon;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity" 
          onClick={onClose}
        />
      )}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={clsx(
        "flex-shrink-0 border-s bg-gray-50/50 flex flex-col relative",
        "fixed md:static inset-y-0 right-0 z-50 transform border-none md:border-s transition-all duration-300 bg-slate-50 dark:bg-gray-950 shadow-2xl md:shadow-none whitespace-nowrap overflow-hidden",
        (isExpanded || isOpen) ? "w-64" : "w-[68px]",
        isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
      )}>
        <div className={clsx("flex-1 flex flex-col space-y-2 overflow-hidden pb-4", isExpanded ? "p-4" : "py-4 px-2")}>
          
          {/* Header Action / Pin & Search */}
          <div className={clsx("flex items-center text-gray-500 mb-2 gap-2", isExpanded ? "justify-between" : "justify-center hidden md:flex")}>
            {isExpanded && (
              <div className="relative flex-1">
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder={t('search_menus' as any) || "جستجو در منوها..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-md py-1.5 pr-8 pl-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-shadow"
                />
              </div>
            )}
            <button 
              onClick={() => {
                const newPinnedState = !isPinned;
                setIsPinned(newPinnedState);
                if (!newPinnedState) {
                  setOpenMenu(null);
                  setOpenMenuItemId(null);
                  setSearchQuery('');
                }
              }} 
              className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
            >
              {isPinned ? <Pin size={18} /> : <PinOff size={18} />}
            </button>
          </div>

          {/* Dashboard primary button */}
          <button 
            onClick={() => setActiveTabId(null)}
            className={clsx(
              "flex items-center justify-between rounded-lg bg-blue-100 py-2 text-sm font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 flex-shrink-0 transition-all",
              isExpanded ? "px-3 w-full" : "px-2 w-10 h-10 mx-auto justify-center"
            )}
          >
            {isExpanded && <span>{t('dashboard')}</span>}
            <DashboardIcon className="h-4 w-4 flex-shrink-0" />
          </button>

          {/* Menu Accordion */}
          <div className="flex-1 overflow-hidden flex flex-col space-y-1.5 pb-[10px] pe-1">
            {filteredMenuGroups.map((group) => {
              const isGroupOpen = (openMenu === group.id) || group.forceOpen;
              const customBg = group.customColor ? group.customColor : undefined;
              
              return (
                <div key={group.id} 
                  className={clsx(
                    "rounded-lg shadow-sm flex flex-col transition-colors border",
                    isGroupOpen 
                      ? "bg-white dark:bg-gray-900 flex-[0_1_auto] min-h-0" 
                      : (group.customColor ? "" : `${group.colorClass} flex-shrink-0`)
                  )}
                  style={{ 
                    backgroundColor: !isGroupOpen && group.customColor ? group.customColor : undefined,
                    borderColor: isGroupOpen 
                      ? (group.customColor ? `${group.customColor}44` : group.id === 'financial_group' ? '#05966944' : group.id === 'general_group' ? '#2563eb44' : group.id === 'supply_chain_group' ? '#f9731644' : group.id === 'org_management_group' ? '#f43f5e44' : 'rgba(0,0,0,0.1)')
                      : (group.customColor ? group.customColor : group.id === 'financial_group' ? '#059669' : group.id === 'general_group' ? '#2563eb' : group.id === 'supply_chain_group' ? '#f97316' : group.id === 'org_management_group' ? '#f43f5e' : 'transparent')
                  }}
                >
                  <button 
                    onClick={() => {
                      if (!isExpanded) setIsPinned(true);
                      toggleMenu(group.id);
                    }}
                    className={clsx(
                      "flex items-center justify-between min-h-[32px] text-sm font-medium transition-all flex-shrink-0 text-white",
                      isGroupOpen ? `${group.colorClass} shadow-sm rounded-t-md` : "rounded-lg",
                      isExpanded ? "px-3 py-1.5 w-full" : "p-[6px] w-[36px] mx-auto my-1 justify-center"
                    )}
                    style={{
                      backgroundColor: group.customColor ? group.customColor : undefined
                    }}
                  >
                    <div className={clsx("flex items-center gap-2", !isExpanded && "justify-center w-full")}>
                      <span className="flex items-center justify-center min-w-[20px]">{group.icon}</span>
                      {isExpanded && <span>{group.title}</span>}
                    </div>
                    {isExpanded && <ChevronDown className={clsx("h-4 w-4 transition-transform flex-shrink-0", !isGroupOpen && "rotate-180")} />}
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isGroupOpen && isExpanded && (
                      <motion.div 
                        key={`sidebar-group-items-${group.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ 
                          maxHeight: '100%',
                          borderColor: group.id === 'financial_group' ? '#05966933' : 
                                       group.id === 'general_group' ? '#2563eb33' : 
                                       group.id === 'supply_chain_group' ? '#f9731633' : 
                                       group.id === 'org_management_group' ? '#f43f5e33' : 'rgba(0,0,0,0.1)'
                        }}
                        className={clsx(
                          "overflow-hidden flex flex-col flex-[0_1_auto] min-h-0",
                          "border-r border-l border-b rounded-b-lg",
                        )}
                      >
                        {/* Scrollable sub-items area */}
                        <div 
                          className={clsx(
                            "py-1.5 space-y-0.5 relative overflow-y-auto w-full [scrollbar-gutter:stable]",
                            isExpanded ? "ps-3 pe-2" : "ps-1 pe-1",
                            "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full",
                            group.scrollbarClass
                          )}
                        >
                          {/* Tree Line Indicator */}
                          {isExpanded && <div className={clsx("absolute top-0 bottom-4 right-3 w-px", group.textColorClass)} style={{ opacity: 0.3 }} />}
                          
                          {group.items.map((item: any, index: number) => (
                            <SidebarItem 
                              key={item.id || index} 
                              item={item} 
                              groupId={group.id}
                              lineClass={group.textColorClass} 
                              onTabClick={handleTabClick}
                              openItemId={openMenuItemId}
                              onToggleItem={(id) => {
                                setOpenMenuItemId(id);
                              }}
                              isSidebarExpanded={isExpanded}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

       </div>
    </aside>
    </>
  );
}

function SidebarItem({ 
  item, 
  groupId, 
  lineClass, 
  onTabClick, 
  level = 0,
  openItemId,
  onToggleItem,
  isSidebarExpanded = true
}: { 
  item: any, 
  groupId: string, 
  lineClass: string, 
  onTabClick: (title: string, groupId: string, icon: React.ReactNode, componentName?: string, props?: any) => void, 
  level?: number,
  openItemId?: string | null,
  onToggleItem?: (id: string) => void,
  isSidebarExpanded?: boolean
}) {
  const { direction: dir } = useLanguage();
  const [localIsOpen, setLocalIsOpen] = useState(false);
  const [openChildId, setOpenChildId] = useState<string | null>(null);
  const hasSubItems = item.subItems && item.subItems.length > 0;
  
  const isOpen = item.forceOpen || (onToggleItem ? (openItemId === item.id) : localIsOpen);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasSubItems) {
      if (onToggleItem) {
        onToggleItem(isOpen ? '' : item.id);
      } else {
        setLocalIsOpen(!isOpen);
      }
    } else {
      if (level === 0 && onToggleItem && item.id) {
        onToggleItem(item.id);
      }
      onTabClick(item.title, groupId, item.icon, item.componentName, item.props);
    }
  };

  if (level === 0) {
    return (
      <div className={clsx("relative", hasSubItems ? "mt-1 mb-1" : "")}>
        <button 
          onClick={handleClick}
          title={!isSidebarExpanded ? item.title : undefined}
          className={clsx(
            "group flex items-center transition-all relative mx-auto overflow-hidden",
            isSidebarExpanded ? "w-full justify-between px-3 py-2 rounded-md" : "w-10 h-10 justify-center rounded-lg my-1 bg-white dark:bg-gray-800 border shadow-sm",
            level === 0 && hasSubItems && isSidebarExpanded
              ? clsx(
                  "text-[12px] font-bold",
                  isOpen 
                    ? "bg-white dark:bg-gray-800/80 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-gray-700/50" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
                )
              : hasSubItems 
                ? (isSidebarExpanded ? "text-[12px] font-bold text-gray-700 hover:bg-gray-100/80 dark:text-gray-300 dark:hover:bg-gray-800/60" : "text-gray-800 dark:text-gray-200")
                : (isSidebarExpanded ? "text-[12px] text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/80 dark:hover:text-gray-100" : "text-gray-600 dark:text-gray-400")
          )}
        >
          {level === 0 && isOpen && isSidebarExpanded && (
            <div className={clsx("absolute top-1 bottom-1 w-[3px] bg-current", dir === 'rtl' ? "right-0 rounded-l" : "left-0 rounded-r", lineClass)} />
          )}
          {isSidebarExpanded && <div className={clsx("absolute top-1/2 -mt-px w-2 h-px opacity-40", dir === 'rtl' ? "right-0" : "left-0", lineClass)} />}
          <div className={clsx("flex items-center gap-2", !isSidebarExpanded && "justify-center w-full")}>
            <div className={clsx("flex items-center justify-center flex-shrink-0", hasSubItems ? "opacity-100" : "opacity-70")}>
               {item.icon}
            </div>
            {isSidebarExpanded && <span className="truncate">{item.title}</span>}
          </div>
          {isSidebarExpanded && (
            !hasSubItems ? (
               <div className="h-4 w-4 flex-shrink-0" />
            ) : (
               <ChevronDown className={clsx("h-4 w-4 flex-shrink-0 transition-transform opacity-60", !isOpen && "-rotate-90")} />
            )
          )}
        </button>
        
        {hasSubItems && isSidebarExpanded && (
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div 
                key={`sidebar-item-level-0-${item.id}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={clsx(
                  "overflow-hidden space-y-1 relative pt-1 pb-1 mb-2",
                  dir === 'rtl' ? "pr-3" : "pl-3"
                )}
              >
                <div className={clsx("absolute top-0 bottom-2 w-[2px] opacity-50 bg-current", dir === 'rtl' ? "right-0 rounded-l" : "left-0 rounded-r", lineClass)} />
                {item.subItems.map((sub: any, idx: number) => (
                  <SidebarItem 
                    key={idx} 
                    item={sub} 
                    groupId={groupId} 
                    lineClass={lineClass} 
                    onTabClick={onTabClick} 
                    level={level + 1}
                    isSidebarExpanded={isSidebarExpanded}
                    openItemId={openChildId}
                    onToggleItem={setOpenChildId}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  }

  // Sub-levels
  return (
    <div className="relative">
      <button 
        onClick={handleClick}
        className={clsx(
          "group flex w-full items-center justify-between rounded-md px-3 transition-colors relative",
          hasSubItems
            ? "py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            : "py-1.5 text-xs font-normal text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        )}
      >
        <div className={clsx("absolute top-1/2 -mt-px w-3 h-px opacity-40", dir === 'rtl' ? "-right-3" : "-left-3", lineClass)} />
        <div className="flex items-center gap-2">
          <div className="opacity-60 flex-shrink-0">{item.icon}</div>
          <span className="truncate">{item.title}</span>
        </div>
        {hasSubItems && (
          <ChevronDown className={clsx("h-[14px] w-[14px] transition-transform opacity-50 flex-shrink-0", !isOpen && "-rotate-90")} />
        )}
      </button>
      
      {hasSubItems && (
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div 
              key={`sidebar-item-level-${level}-${item.id}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={clsx("overflow-hidden space-y-1 relative pt-1 pb-1 mb-2", dir === 'rtl' ? "pr-3" : "pl-3")}
            >
              <div className={clsx("absolute top-0 bottom-2 w-[2px] opacity-50 bg-current", dir === 'rtl' ? "right-0 rounded-l" : "left-0 rounded-r", lineClass)} />
              {item.subItems.map((sub: any, idx: number) => (
                <SidebarItem 
                  key={idx} 
                  item={sub} 
                  groupId={groupId} 
                  lineClass={lineClass} 
                  onTabClick={onTabClick} 
                  level={level + 1}
                  isSidebarExpanded={isSidebarExpanded}
                  openItemId={openChildId}
                  onToggleItem={setOpenChildId}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
