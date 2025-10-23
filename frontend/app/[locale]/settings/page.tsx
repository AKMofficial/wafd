'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountsManagement } from '@/components/settings/accounts-management';
import { GroupsManagement } from '@/components/settings/groups-management';
import { Users2, UserCog } from 'lucide-react';

export default function SettingsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('groups');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.replace(`/${locale}/login`);
        return;
      }
    }
    // Redirect non-admins to pilgrims page
    if (user && user.role !== 'Admin') {
      router.replace(`/${locale}/pilgrims`);
    }
  }, [user, router, locale]);

  // Don't render anything for non-admins
  if (user && user.role !== 'Admin') {
    return null;
  }

  return (
    <main className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            {t('nav.settings')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {t('settings.subtitle')}
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users2 className="h-4 w-4" />
              {t('settings.tabs.groups')}
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              {t('settings.tabs.accounts')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="groups" className="mt-0">
            <div className="bg-white rounded-lg shadow p-6">
              <GroupsManagement />
            </div>
          </TabsContent>

          <TabsContent value="accounts" className="mt-0">
            <div className="bg-white rounded-lg shadow p-6">
              <AccountsManagement />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}