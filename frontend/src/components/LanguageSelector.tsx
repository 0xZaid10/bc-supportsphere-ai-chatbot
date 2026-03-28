import React, { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { Language } from '../types';

const LanguageSelector: React.FC = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('LanguageSelector must be used within a LanguageProvider');
  }

  const { language, setLanguage } = context;

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <div className="flex items-center space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-full">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-4 py-1 text-sm font-medium rounded-full transition-colors duration-300 ease-in-out focus:outline-none ${
          language === 'en'
            ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/50 dark:hover:bg-gray-600/50'
        }`}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
      <button
        onClick={() => handleLanguageChange('es')}
        className={`px-4 py-1 text-sm font-medium rounded-full transition-colors duration-300 ease-in-out focus:outline-none ${
          language === 'es'
            ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/50 dark:hover:bg-gray-600/50'
        }`}
        aria-pressed={language === 'es'}
      >
        ES
      </button>
    </div>
  );
};

export default LanguageSelector;