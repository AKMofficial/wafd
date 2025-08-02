import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import { notFound } from 'next/navigation'
import { I18nProvider } from '@/lib/i18n'
import RootLayoutWrapper from '@/components/layout/RootLayoutWrapper'
import '../globals.css'

const cairo = Cairo({ 
  subsets: ['latin', 'arabic'],
  display: 'swap',
  variable: '--font-cairo',
})

export const metadata: Metadata = {
  title: 'نظام إسكان الحجاج',
  description: 'نظام متكامل لإدارة إسكان الحجاج',
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  
  if (locale !== 'ar' && locale !== 'en') {
    notFound();
  }
  
  const isRtl = locale === 'ar';

  return (
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'} className={cairo.variable}>
      <body className="font-sans">
        <I18nProvider locale={locale}>
          <RootLayoutWrapper>
            {children}
          </RootLayoutWrapper>
        </I18nProvider>
      </body>
    </html>
  )
}