'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from '@/lib/i18n';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountsManagement } from '@/components/settings/accounts-management';
import { GroupsManagement } from '@/components/settings/groups-management';
import { Users2, UserCog } from 'lucide-react';

export default function SettingsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState('groups');

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