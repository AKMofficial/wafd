'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/i18n';
import {
  UserPlus,
  Upload,
  UserCheck
} from 'lucide-react';

interface QuickActionsProps {
  locale: string;
}

export function QuickActions({ locale }: QuickActionsProps) {
  const router = useRouter();
  const t = useTranslations();

  const actions = [
    {
      id: '1',
      title: t('dashboard.quickActions.addNewPilgrim'),
      icon: UserPlus,
      onClick: () => router.push(`/${locale}/pilgrims/new`)
    },
    {
      id: '2',
      title: t('dashboard.quickActions.markArrival'),
      icon: UserCheck,
      onClick: () => router.push(`/${locale}/pilgrims?filter=expected`)
    },
    {
      id: '3',
      title: t('dashboard.quickActions.importData'),
      icon: Upload,
      onClick: () => router.push(`/${locale}/pilgrims?action=import`)
    }
  ];

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
        >
          <action.icon className="h-4 w-4 text-gray-600 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">{action.title}</span>
        </button>
      ))}
    </div>
  );
}