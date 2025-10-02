'use client';

import { useTranslations } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  const t = useTranslations();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-2">{t('common.notFoundTitle')}</h2>
        <p className="text-gray-600 mb-6">{t('common.notFoundMessage')}</p>
        <Link href="/">
          <Button>{t('common.backToHome')}</Button>
        </Link>
      </div>
    </div>
  );
}
