'use client';
import React from 'react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { TabBar } from './TabBar';
import { useTabs } from '@/components/TabsProvider';
// Task 5-c: the componentName → component mapping (and all lazyTab code-split
// imports) now lives in the typed registry. To add a new tab see the header
// comment in components/tab-registry.tsx.
import { TAB_COMPONENTS } from '../tab-registry';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export function PageContainer({ children }: { children: React.ReactNode }) {
  const { tabs, activeTabId } = useTabs();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Find the active tab to display its title (for demonstration)
  const activeTab = tabs.find(t => t.id === activeTabId);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Header onMenuToggle={() => setIsMobileSidebarOpen(true)} />
      <div className="flex-shrink-0 z-40 relative">
        <TabBar />
      </div>
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-[5px] bg-slate-100/50 dark:bg-gray-950/50 relative flex flex-col">
          {/* Dashboard (Home) content */}
          <div className={clsx("flex-1 flex flex-col min-h-0", activeTabId !== null && "hidden")}>
            {children}
          </div>

          {/* Render all tabs, but hide inactive ones */}
          {tabs.map((tab) => {
            const entry = TAB_COMPONENTS[tab.componentName ?? ''];
            const content = entry ? (
              <entry.component
                {...(entry.getProps ? entry.getProps(tab) : tab.props || {})}
              />
            ) : (
              <div className="flex items-center justify-center p-8 text-gray-500">
                Component not found: {tab.componentName}
              </div>
            );
            return (
              <div
                key={tab.id}
                className={clsx(
                  "animate-in fade-in zoom-in-95 duration-300 flex-1 flex flex-col min-h-0",
                  activeTabId !== tab.id && "hidden"
                )}
              >
                {content}
              </div>
            );
          })}
        </main>
      </div>
      <div className="flex-shrink-0 mt-auto shadow-[0_-4px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_10px_rgba(0,0,0,0.2)] z-30 relative">
        <Footer />
      </div>
    </div>
  );
}
