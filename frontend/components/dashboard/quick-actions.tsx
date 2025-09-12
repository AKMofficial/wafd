'use client';

import { useRouter } from 'next/navigation';
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

  const actions = [
    {
      id: '1',
      title: locale === 'ar' ? 'إضافة حاج جديد' : 'Add New Pilgrim',
      icon: UserPlus,
      onClick: () => router.push(`/${locale}/pilgrims/new`)
    },
    {
      id: '2',
      title: locale === 'ar' ? 'تسجيل الوصول' : 'Mark Arrival',
      icon: UserCheck,
      onClick: () => router.push(`/${locale}/pilgrims?filter=expected`)
    },
    {
      id: '3',
      title: locale === 'ar' ? 'استيراد البيانات' : 'Import Data',
      icon: Upload,
      onClick: () => router.push(`/${locale}/pilgrims?action=import`)
    }
  ];

  return (
    <div className="flex gap-3">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
        >
          <action.icon className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">{action.title}</span>
        </button>
      ))}
    </div>
  );
}