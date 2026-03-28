import React, { createContext, useState, useContext, PropsWithChildren } from 'react';

export type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LanguageProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const value = { language, setLanguage };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageProvider;