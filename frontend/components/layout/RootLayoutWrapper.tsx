'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { useLocale } from '@/lib/i18n';
import { SidebarProvider, useSidebar } from '@/lib/sidebar-context';
import { ToastProvider } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

interface RootLayoutWrapperProps {
  children: ReactNode;
}

const RootLayoutContent = ({ children }: RootLayoutWrapperProps) => {
  const pathname = usePathname();

  // Check if on login page
  const isLoginPage = pathname?.includes('/login');

  // If on login page, render without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  const locale = useLocale();
  const isRtl = locale === 'ar';
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={cn(
        "min-h-screen transition-all duration-300",
        isRtl
          ? (isCollapsed ? 'lg:mr-16' : 'lg:mr-64')
          : (isCollapsed ? 'lg:ml-16' : 'lg:ml-64')
      )}>
        <main className="p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const RootLayoutWrapper = ({ children }: RootLayoutWrapperProps) => {
  return (
    <ToastProvider>
      <SidebarProvider>
        <RootLayoutContent>{children}</RootLayoutContent>
      </SidebarProvider>
    </ToastProvider>
  );
};

export default RootLayoutWrapper;