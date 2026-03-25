"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
      <button 
        type="button"
        onClick={() => handleLocaleChange('vi')}
        className={`hover:text-text transition-colors ${locale === 'vi' ? 'text-accent' : ''}`}
        aria-label="Tiếng Việt"
      >
        VI
      </button>
      <span className="opacity-40">|</span>
      <button 
        type="button"
        onClick={() => handleLocaleChange('en')}
        className={`hover:text-text transition-colors ${locale === 'en' ? 'text-accent' : ''}`}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
