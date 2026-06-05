import { useTranslation } from 'react-i18next';

import { className } from '../../shared/utils/class-name';

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'zh-CN', label: '中文' },
] as const;

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  return (
    <div className="flex items-center gap-1 rounded-full bg-white/80 p-1 shadow-sm">
      <span className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {t('nav.language')}
      </span>
      {languages.map((language) => {
        const isActive = i18n.language === language.code;

        return (
          <button
            key={language.code}
            type="button"
            onClick={() => void i18n.changeLanguage(language.code)}
            className={className(
              'rounded-full px-3 py-1 text-xs font-semibold transition',
              isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100',
            )}
          >
            {language.label}
          </button>
        );
      })}
    </div>
  );
};
