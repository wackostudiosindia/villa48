import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from '../data/lang/en';
import { layoutChanged } from './skyStore';

/*
  English ships with the page; Hinglish and Gujarati load on demand when chosen.
  A visitor's choice is remembered in their browser.
*/
const LangContext = createContext(null);
export const LOCALES = { en: 'en-IN', hi: 'en-IN', gu: 'gu-IN' };
const LOADERS = { hi: () => import('../data/lang/hi'), gu: () => import('../data/lang/gu') };
const STORAGE_KEY = 'v48-lang';

function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || LOADERS[saved]) return saved;
  } catch {}
  return 'en';
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);
  const [packs, setPacks] = useState({ en });

  // Fetch a language pack the first time it's needed.
  useEffect(() => {
    if (packs[lang] || !LOADERS[lang]) return;
    let alive = true;
    LOADERS[lang]().then((m) => alive && setPacks((p) => ({ ...p, [lang]: m.default })));
    return () => { alive = false; };
  }, [lang, packs]);

  const ready = packs[lang] ? lang : 'en';

  useEffect(() => {
    document.documentElement.setAttribute('lang', ready === 'hi' ? 'hi-Latn' : ready);
    const id = setTimeout(layoutChanged, 60);
    return () => clearTimeout(id);
  }, [ready]);

  const setLang = useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
  }, []);

  const t = useCallback(
    (key) => {
      const v = packs[ready].strings[key];
      return v != null ? v : en.strings[key] ?? '';
    },
    [packs, ready],
  );

  const fmt = useCallback(
    (d, opts) => {
      try { return d.toLocaleDateString(LOCALES[ready], opts); } catch { return d.toDateString(); }
    },
    [ready],
  );

  const ruleTitles = packs[ready].ruleTitles;
  const value = useMemo(() => ({ lang, setLang, t, fmt, ruleTitles }), [lang, setLang, t, fmt, ruleTitles]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
