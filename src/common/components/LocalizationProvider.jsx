import { createContext, useContext, createSignal, createEffect, onMount } from 'solid-js';
import dayjs from 'dayjs';
import { createPersistedState } from '../../stores';

// Import all language files
import af from '../../resources/af.json';
import 'dayjs/locale/af';
import ar from '../../resources/ar.json';
import 'dayjs/locale/ar';
import az from '../../resources/az.json';
import 'dayjs/locale/az';
import bg from '../../resources/bg.json';
import 'dayjs/locale/bg';
import bn from '../../resources/bn.json';
import 'dayjs/locale/bn';
import ca from '../../resources/ca.json';
import 'dayjs/locale/ca';
import cs from '../../resources/cs.json';
import 'dayjs/locale/cs';
import da from '../../resources/da.json';
import 'dayjs/locale/da';
import de from '../../resources/de.json';
import 'dayjs/locale/de';
import el from '../../resources/el.json';
import 'dayjs/locale/el';
import en from '../../resources/en.json';
import 'dayjs/locale/en';
import es from '../../resources/es.json';
import 'dayjs/locale/es';
import fa from '../../resources/fa.json';
import 'dayjs/locale/fa';
import fi from '../../resources/fi.json';
import 'dayjs/locale/fi';
import fr from '../../resources/fr.json';
import 'dayjs/locale/fr';
import gl from '../../resources/gl.json';
import 'dayjs/locale/gl';
import he from '../../resources/he.json';
import 'dayjs/locale/he';
import hi from '../../resources/hi.json';
import 'dayjs/locale/hi';
import hr from '../../resources/hr.json';
import 'dayjs/locale/hr';
import hu from '../../resources/hu.json';
import 'dayjs/locale/hu';
import id from '../../resources/id.json';
import 'dayjs/locale/id';
import it from '../../resources/it.json';
import 'dayjs/locale/it';
import ja from '../../resources/ja.json';
import 'dayjs/locale/ja';
import ka from '../../resources/ka.json';
import 'dayjs/locale/ka';
import kk from '../../resources/kk.json';
import 'dayjs/locale/kk';
import km from '../../resources/km.json';
import 'dayjs/locale/km';
import ko from '../../resources/ko.json';
import 'dayjs/locale/ko';
import lo from '../../resources/lo.json';
import 'dayjs/locale/lo';
import lt from '../../resources/lt.json';
import 'dayjs/locale/lt';
import lv from '../../resources/lv.json';
import 'dayjs/locale/lv';
import mk from '../../resources/mk.json';
import 'dayjs/locale/mk';
import ml from '../../resources/ml.json';
import 'dayjs/locale/ml';
import mn from '../../resources/mn.json';
import 'dayjs/locale/mn';
import ms from '../../resources/ms.json';
import 'dayjs/locale/ms';
import nb from '../../resources/nb.json';
import 'dayjs/locale/nb';
import ne from '../../resources/ne.json';
import 'dayjs/locale/ne';
import nl from '../../resources/nl.json';
import 'dayjs/locale/nl';
import nn from '../../resources/nn.json';
import 'dayjs/locale/nn';
import pl from '../../resources/pl.json';
import 'dayjs/locale/pl';
import pt from '../../resources/pt.json';
import 'dayjs/locale/pt';
import pt_BR from '../../resources/pt_BR.json';
import 'dayjs/locale/pt-br';
import ro from '../../resources/ro.json';
import 'dayjs/locale/ro';
import ru from '../../resources/ru.json';
import 'dayjs/locale/ru';
import si from '../../resources/si.json';
import 'dayjs/locale/si';
import sk from '../../resources/sk.json';
import 'dayjs/locale/sk';
import sl from '../../resources/sl.json';
import 'dayjs/locale/sl';
import sq from '../../resources/sq.json';
import 'dayjs/locale/sq';
import sr from '../../resources/sr.json';
import 'dayjs/locale/sr';
import sv from '../../resources/sv.json';
import 'dayjs/locale/sv';
import ta from '../../resources/ta.json';
import 'dayjs/locale/ta';
import th from '../../resources/th.json';
import 'dayjs/locale/th';
import tr from '../../resources/tr.json';
import 'dayjs/locale/tr';
import uk from '../../resources/uk.json';
import 'dayjs/locale/uk';
import uz from '../../resources/uz.json';
import 'dayjs/locale/uz';
import vi from '../../resources/vi.json';
import 'dayjs/locale/vi';
import zh from '../../resources/zh.json';
import 'dayjs/locale/zh';
import zh_TW from '../../resources/zh_TW.json';
import 'dayjs/locale/zh-tw';

const languages = {
  af: { data: af, country: 'ZA', name: 'Afrikaans' },
  ar: { data: ar, country: 'AE', name: 'العربية' },
  az: { data: az, country: 'AZ', name: 'Azərbaycanca' },
  bg: { data: bg, country: 'BG', name: 'Български' },
  bn: { data: bn, country: 'IN', name: 'বাংলা' },
  ca: { data: ca, country: 'ES', name: 'Català' },
  cs: { data: cs, country: 'CZ', name: 'Čeština' },
  de: { data: de, country: 'DE', name: 'Deutsch' },
  da: { data: da, country: 'DK', name: 'Dansk' },
  el: { data: el, country: 'GR', name: 'Ελληνικά' },
  en: { data: en, country: 'US', name: 'English' },
  es: { data: es, country: 'ES', name: 'Español' },
  fa: { data: fa, country: 'IR', name: 'فارسی' },
  fi: { data: fi, country: 'FI', name: 'Suomi' },
  fr: { data: fr, country: 'FR', name: 'Français' },
  gl: { data: gl, country: 'ES', name: 'Galego' },
  he: { data: he, country: 'IL', name: 'עברית' },
  hi: { data: hi, country: 'IN', name: 'हिन्दी' },
  hr: { data: hr, country: 'HR', name: 'Hrvatski' },
  hu: { data: hu, country: 'HU', name: 'Magyar' },
  id: { data: id, country: 'ID', name: 'Bahasa Indonesia' },
  it: { data: it, country: 'IT', name: 'Italiano' },
  ja: { data: ja, country: 'JP', name: '日本語' },
  ka: { data: ka, country: 'GE', name: 'ქართული' },
  kk: { data: kk, country: 'KZ', name: 'Қазақша' },
  ko: { data: ko, country: 'KR', name: '한국어' },
  km: { data: km, country: 'KH', name: 'ភាសាខ្មែរ' },
  lo: { data: lo, country: 'LA', name: 'ລາວ' },
  lt: { data: lt, country: 'LT', name: 'Lietuvių' },
  lv: { data: lv, country: 'LV', name: 'Latviešu' },
  mk: { data: mk, country: 'MK', name: 'Македонски' },
  ml: { data: ml, country: 'IN', name: 'മലയാളം' },
  mn: { data: mn, country: 'MN', name: 'Монгол хэл' },
  ms: { data: ms, country: 'MY', name: 'Bahasa Melayu' },
  nb: { data: nb, country: 'NO', name: 'Norsk bokmål' },
  ne: { data: ne, country: 'NP', name: 'नेपाली' },
  nl: { data: nl, country: 'NL', name: 'Nederlands' },
  nn: { data: nn, country: 'NO', name: 'Norsk nynorsk' },
  pl: { data: pl, country: 'PL', name: 'Polski' },
  pt: { data: pt, country: 'PT', name: 'Português' },
  pt_BR: { data: pt_BR, country: 'BR', name: 'Português (Brasil)' },
  ro: { data: ro, country: 'RO', name: 'Română' },
  ru: { data: ru, country: 'RU', name: 'Русский' },
  si: { data: si, country: 'LK', name: 'සිංහල' },
  sk: { data: sk, country: 'SK', name: 'Slovenčina' },
  sl: { data: sl, country: 'SI', name: 'Slovenščina' },
  sq: { data: sq, country: 'AL', name: 'Shqipëria' },
  sr: { data: sr, country: 'RS', name: 'Srpski' },
  sv: { data: sv, country: 'SE', name: 'Svenska' },
  ta: { data: ta, country: 'IN', name: 'தமிழ்' },
  th: { data: th, country: 'TH', name: 'ไทย' },
  tr: { data: tr, country: 'TR', name: 'Türkçe' },
  uk: { data: uk, country: 'UA', name: 'Українська' },
  uz: { data: uz, country: 'UZ', name: 'Oʻzbekcha' },
  vi: { data: vi, country: 'VN', name: 'Tiếng Việt' },
  zh: { data: zh, country: 'CN', name: '中文' },
  zh_TW: { data: zh_TW, country: 'TW', name: '中文 (Taiwan)' },
};

const getDefaultLanguage = () => {
  const browserLanguages = window.navigator.languages ? [...window.navigator.languages] : [];
  const browserLanguage = window.navigator.userLanguage || window.navigator.language;
  browserLanguages.push(browserLanguage);
  browserLanguages.push(browserLanguage.substring(0, 2));

  for (let i = 0; i < browserLanguages.length; i += 1) {
    let language = browserLanguages[i].replace('-', '_');
    if (language in languages) {
      return language;
    }
    if (language.length > 2) {
      language = language.substring(0, 2);
      if (language in languages) {
        return language;
      }
    }
  }
  return 'en';
};

const LocalizationContext = createContext({
  languages,
  language: 'en',
  setLocalLanguage: () => {},
  direction: 'ltr',
});

export function LocalizationProvider(props) {
  const [localLanguage, setLocalLanguage] = createPersistedState('language', getDefaultLanguage());
  const [direction, setDirection] = createSignal('ltr');

  const language = () => localLanguage();

  createEffect(() => {
    const lang = language();
    const isRTL = /^(ar|he|fa)$/.test(lang);
    setDirection(isRTL ? 'rtl' : 'ltr');
    
    let selected;
    if (lang.length > 2) {
      selected = `${lang.slice(0, 2)}-${lang.slice(-2).toLowerCase()}`;
    } else {
      selected = lang;
    }
    dayjs.locale(selected);
    document.dir = isRTL ? 'rtl' : 'ltr';
  });

  const value = {
    languages,
    get language() { return language(); },
    setLocalLanguage,
    get direction() { return direction(); },
  };

  return (
    <LocalizationContext.Provider value={value}>
      {props.children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  return useContext(LocalizationContext);
}

export function useTranslation() {
  const context = useContext(LocalizationContext);
  return (key) => {
    try {
      return context.languages[context.language]?.data?.[key] || key;
    } catch {
      return key;
    }
  };
}

export function useTranslationKeys(predicate) {
  const context = useContext(LocalizationContext);
  const data = context.languages[context.language].data;
  return Object.keys(data).filter(predicate);
}
