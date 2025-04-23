import type React from "react";

interface LangSelectorProps {
	currentLang: string;
	onLangChange: (langCode: string) => void;
}

const languages = [
	{ code: "en", label: "English", flag: "🇬🇧" },
	{ code: "es", label: "Spanish", flag: "🇪🇸" },
	{ code: "fr", label: "French", flag: "🇫🇷" },
	{ code: "de", label: "German", flag: "🇩🇪" },
	{ code: "it", label: "Italian", flag: "🇮🇹" },
	{ code: "pt", label: "Portuguese", flag: "🇵🇹" },
];

export const DEFAULT_LANG = "en";

const LangSelector: React.FC<LangSelectorProps> = ({
	currentLang,
	onLangChange,
}) => {

	const actualLang = languages.find((lang) => lang.code === currentLang);

	return (
		<div className="inline-block relative">
			<div className="dropdown dropdown-end">
				<div tabIndex={0} role="button" className="btn m-1 btn-ghost">{actualLang?.flag ?? 'EN'}</div>
				<ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 p-2 shadow-sm">
					{languages.map((lang) => (
						<li key={lang.code} value={lang.code}>
							<a onClick={() => onLangChange(lang.code)}>{lang.flag}</a>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default LangSelector;
