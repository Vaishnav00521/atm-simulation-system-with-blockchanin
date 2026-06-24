import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'es', label: 'ES', flag: '🇪🇸' },
  { code: 'zh', label: 'ZH', flag: '🇨🇳' },
  { code: 'hi', label: 'HI', flag: '🇮🇳' },
];

/**
 * LanguageSelector — A pill-shaped multi-language toggle for the sidebar footer.
 * Persists choice to localStorage and switches the i18next language instantly.
 */
const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const current = i18n.language?.substring(0, 2) || 'en';

  const switchLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('preferred_language', code);
  };

  return (
    <div className="px-4 pb-3">
      <p className="text-[9px] text-zinc-700 uppercase tracking-widest font-bold mb-2">Language</p>
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
        {LANGUAGES.map((lang) => (
          <motion.button
            key={lang.code}
            onClick={() => switchLanguage(lang.code)}
            whileTap={{ scale: 0.9 }}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${
              current === lang.code
                ? 'bg-emerald-600 text-white shadow-inner'
                : 'text-zinc-600 hover:text-zinc-300'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
