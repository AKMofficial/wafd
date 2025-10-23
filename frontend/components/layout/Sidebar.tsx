'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from '@/lib/i18n';
import { useSidebar } from '@/lib/sidebar-context';
import { cn } from '@/lib/utils';
import {
  PilgrimIcon,
  HallIcon,
} from '@/components/icons';
import { 
  ChevronLeft,
  ChevronRight,
  Menu,
  Globe,
  Settings,
  LayoutDashboard,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Sidebar = () => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const t = useTranslations();
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const router = useRouter();

  const navItems = [
    { icon: LayoutDashboard, label: t('nav.dashboard'), href: `/${locale}` },
    { icon: PilgrimIcon, label: t('nav.pilgrims'), href: `/${locale}/pilgrims` },
    { icon: HallIcon, label: t('nav.halls'), href: `/${locale}/halls` },
    { icon: Settings, label: t('nav.settings'), href: `/${locale}/settings` },
  ];

  const isActiveRoute = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const switchLanguage = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    const currentPath = pathname.replace(`/${locale}`, '');
    router.push(`/${newLocale}${currentPath}`);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className={cn(
          "lg:hidden fixed top-4 z-50 p-2 bg-background rounded-lg shadow-md hover:shadow-lg transition-all",
          isRtl ? 'right-4' : 'left-4',
          isMobileOpen && "opacity-0 pointer-events-none"
        )}
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      <div className={cn(
        "fixed inset-y-0 z-40 flex flex-col bg-card shadow-xl transition-all duration-300",
        isRtl ? 'right-0' : 'left-0',
        isCollapsed ? 'w-16' : 'w-64',
        isMobileOpen ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full',
        "lg:translate-x-0"
      )}>
        <div className={cn(
          "flex items-center p-4 border-b border-border",
          isCollapsed ? 'justify-center' : 'justify-between'
        )}>
          {!isCollapsed && (
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {t('app.logoLetter')}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {t('app.name')}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {t('app.subtitle')}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-1.5 rounded-md hover:bg-muted transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? 
              (isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />) :
              (isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />)
            }
          </button>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                      isCollapsed ? 'justify-center' : '',
                      isActive 
                        ? 'bg-primary-500 text-white shadow-sm' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon 
                      className={cn(
                        "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
                        !isCollapsed && (isRtl ? 'ml-3' : 'mr-3')
                      )} 
                    />
                    {!isCollapsed && (
                      <span className="font-medium flex-1">{item.label}</span>
                    )}
                    {isCollapsed && (
                      <div className={cn(
                        "absolute top-1/2 -translate-y-1/2 px-2 py-1 bg-foreground text-background text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap",
                        isRtl ? 'right-full mr-2' : 'left-full ml-2'
                      )}>
                        {item.label}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-border mt-auto space-y-2">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={cn(
                "w-full flex items-center rounded-lg transition-all duration-200",
                "bg-muted hover:bg-muted/80 text-foreground",
                isCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2.5'
              )}
            >
              <div className={cn(
                "flex items-center",
                isCollapsed ? '' : 'gap-2'
              )}>
                <div className={cn(
                  "rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0",
                  isCollapsed ? "w-7 h-7" : "w-8 h-8"
                )}>
                  <User size={16} className="text-primary-600" />
                </div>
                {!isCollapsed && (
                  <div className="text-right rtl:text-left">
                    <p className="text-sm font-medium">
                      {t('settings.accounts.roles.admin')}
                    </p>
                    <p className="text-xs text-muted-foreground">admin@wafd.sa</p>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <ChevronDown size={16} className={cn(
                  "transition-transform flex-shrink-0",
                  showUserMenu && "rotate-180"
                )} />
              )}
            </button>
            
            {showUserMenu && (
              <div className={cn(
                "absolute bottom-full mb-2 w-full bg-card rounded-lg shadow-lg border border-border py-1 z-50 animate-in slide-in-from-bottom-2",
                isCollapsed && (isRtl ? "right-0 w-48" : "left-0 w-48")
              )}>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                  }}
                  className="w-full text-right rtl:text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2 text-error-600"
                >
                  <LogOut size={16} />
                  <span>{t('common.logout')}</span>
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={switchLanguage}
            className={cn(
              "w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200",
              "bg-muted hover:bg-muted/80 text-foreground",
              isCollapsed ? 'justify-center' : ''
            )}
            aria-label="Switch language"
          >
            <Globe className={cn(
              "w-5 h-5 flex-shrink-0",
              !isCollapsed && (isRtl ? 'ml-2' : 'mr-2')
            )} />
            {!isCollapsed && (
              <span className="font-medium">
                {t('common.switchLanguage')}
              </span>
            )}
          </button>
        </div>
      </div>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden animate-in fade-in"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;