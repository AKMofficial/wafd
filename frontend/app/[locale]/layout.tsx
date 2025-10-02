import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import { notFound } from 'next/navigation'
import { I18nProvider } from '@/lib/i18n'
import RootLayoutWrapper from '@/components/layout/RootLayoutWrapper'
import arMessages from '@/messages/ar.json'
import enMessages from '@/messages/en.json'
import '../globals.css'

const cairo = Cairo({
  subsets: ['latin', 'arabic'],
  display: 'swap',
  variable: '--font-cairo',
})

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = locale === 'ar' ? arMessages : enMessages;

  return {
    title: messages.app.title,
    description: messages.app.description,
  };
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
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'} className={cairo.variable} suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        <I18nProvider locale={locale}>
          <RootLayoutWrapper>
            {children}
          </RootLayoutWrapper>
        </I18nProvider>
      </body>
    </html>
  )
}