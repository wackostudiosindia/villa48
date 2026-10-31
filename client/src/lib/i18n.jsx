import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { STRINGS } from '../data/strings';
import { layoutChanged } from './skyStore';

const LangContext = createContext(null);
export const LOCALES = { en: 'en-IN', hi: 'en-IN', gu: 'gu-IN' };

function initialLang() {
  try {
    const saved = localStorage.getItem('v48lang');
    if (saved && STRINGS[saved]) return saved;
  } catch {}
  return 'hi';
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang === 'hi' ? 'hi-Latn' : lang);
    const id = setTimeout(layoutChanged, 60);
    return () => clearTimeout(id);
  }, [lang]);

  const setLang = useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem('v48lang', l); } catch {}
  }, []);

  const t = useCallback(
    (key) => {
      const v = STRINGS[lang]?.[key];
      return v != null ? v : STRINGS.en[key] ?? '';
    },
    [lang],
  );

  const fmt = useCallback(
    (d, opts) => {
      try { return d.toLocaleDateString(LOCALES[lang], opts); } catch { return d.toDateString(); }
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t, fmt }), [lang, setLang, t, fmt]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
