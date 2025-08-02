'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from '@/lib/i18n';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const locale = useLocale();
  const t = useTranslations();
  const pathname = usePathname();
  const isRtl = locale === 'ar';
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getPageTitle = () => {
    if (pathname.includes('/pilgrims')) return t('nav.pilgrims');
    if (pathname.includes('/halls')) return t('nav.halls');
    if (pathname.includes('/reports')) return t('nav.reports');
    if (pathname.includes('/settings')) return t('nav.settings');
    return t('nav.dashboard');
  };

  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border">
      <div className="px-4 md:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">
              {getPageTitle()}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            
            <div className="relative">
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <User size={16} className="text-primary-600" />
                </div>
                <span className="hidden md:inline text-sm font-medium">
                  {locale === 'ar' ? 'المسؤول' : 'Admin'}
                </span>
                <ChevronDown size={16} className={cn(
                  "transition-transform",
                  showUserMenu && "rotate-180"
                )} />
              </Button>
              
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className={cn(
                    "absolute top-full mt-2 w-48 bg-card rounded-lg shadow-lg border border-border py-1 z-50 animate-in slide-in-from-top-2",
                    isRtl ? "left-0" : "right-0"
                  )}>
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium">
                        {locale === 'ar' ? 'حساب المسؤول' : 'Admin Account'}
                      </p>
                      <p className="text-xs text-muted-foreground">admin@mawa.sa</p>
                    </div>
                    <button className="w-full text-right rtl:text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2">
                      <User size={16} />
                      <span>{locale === 'ar' ? 'الملف الشخصي' : 'Profile'}</span>
                    </button>
                    <button className="w-full text-right rtl:text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2 text-error-600">
                      <LogOut size={16} />
                      <span>{locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;