import React from 'react';

interface LangSelectorProps {
  currentLang: string;
  onLangChange: (langCode: string) => void;
}

// Updated languages array to include a separate 'flag' property
const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'de', label: 'German', flag: '🇩🇪' },
  { code: 'it', label: 'Italian', flag: '🇮🇹' },
  { code: 'pt', label: 'Portuguese', flag: '🇵🇹' },
];

const LangSelector: React.FC<LangSelectorProps> = ({ currentLang, onLangChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onLangChange(event.target.value);
  };

  return (
    <div className="inline-block relative w-64">
      <select
        value={currentLang}
        onChange={handleChange}
        className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
      >
        {languages.map((lang) => (
          // Use lang.flag for the option text content
          <option key={lang.code} value={lang.code}>
            {lang.flag}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  );
};

export default LangSelector;
