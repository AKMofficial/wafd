'use client';

import { useTranslations, useLocale } from '@/lib/i18n';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    const currentPath = pathname.replace(`/${locale}`, '');
    router.push(`/${newLocale}${currentPath}`);
  };

  return (
    <button
      onClick={switchLanguage}
      className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium">
        {t('common.switchLanguage')}
      </span>
    </button>
  );
};

export default LanguageSwitcher;