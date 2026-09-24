import { createContext, ReactNode, useContext, useState } from 'react';
import { TranslationKey, translations } from '../i18n/translations';
import { darkColors, colors as lightColors } from '../theme/colors';

type Language = 'en' | 'ar';

interface AppSettingsContextValue {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  language: Language;
  toggleLanguage: () => void;
  isRTL: boolean;
  colors: typeof lightColors;
  t: (key: TranslationKey) => string;
}

const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
  const toggleLanguage = () => setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));

  const activeColors = isDarkMode ? darkColors : lightColors;
  const isRTL = language === 'ar';

  const t = (key: TranslationKey) => translations[language][key] ?? translations.en[key];

  return (
    <AppSettingsContext.Provider
      value={{ isDarkMode, toggleDarkMode, language, toggleLanguage, isRTL, colors: activeColors, t }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) {
    throw new Error('useAppSettings must be used inside AppSettingsProvider');
  }
  return ctx;
}