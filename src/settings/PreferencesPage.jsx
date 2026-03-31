import { createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useTranslation } from '../common/components/LocalizationProvider';
import { session, createPersistedState } from '../stores';
import NavBar from '../common/components/NavBar';

export default function PreferencesPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  
  const [language, setLanguage] = createPersistedState('language', 'en');
  const [timezone, setTimezone] = createPersistedState('timezone', 'local');
  const [mapStyle, setMapStyle] = createPersistedState('mapStyle', 'osm');
  const [soundEvents, setSoundEvents] = createPersistedState('soundEvents', '');
  const [soundAlarms, setSoundAlarms] = createPersistedState('soundAlarms', 'sos');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ar', name: 'العربية' },
  ];

  const mapStyles = [
    { value: 'osm', label: t('mapOsm') },
    { value: 'satellite', label: t('mapSatellite') },
  ];

  return (
    <div class="max-w-2xl mx-auto">
      <NavBar 
        title={t('sharedPreferences')} 
        onBack={() => navigate('/')}
      />
      
      <div class="space-y-6 mt-6">
        <section class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('sharedGeneral')}
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('sharedLanguage')}
              </label>
              <select
                value={language()}
                onChange={(e) => setLanguage(e.target.value)}
                class="input"
              >
                {languages.map((lang) => (
                  <option value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('positionTimezone')}
              </label>
              <select
                value={timezone()}
                onChange={(e) => setTimezone(e.target.value)}
                class="input"
              >
                <option value="local">{t('timezoneLocal')}</option>
                <option value="device">{t('timezoneDevice')}</option>
                <option value="utc">{t('timezoneUtc')}</option>
              </select>
            </div>
          </div>
        </section>

        <section class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('mapTitle')}
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('mapStyle')}
              </label>
              <select
                value={mapStyle()}
                onChange={(e) => setMapStyle(e.target.value)}
                class="input"
              >
                {mapStyles.map((style) => (
                  <option value={style.value}>{style.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('sharedNotifications')}
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('eventsSoundEvents')}
              </label>
              <input
                type="text"
                value={soundEvents()}
                onInput={(e) => setSoundEvents(e.target.value)}
                placeholder="geofenceEnter,geofenceExit,..."
                class="input"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('eventsSoundAlarms')}
              </label>
              <input
                type="text"
                value={soundAlarms()}
                onInput={(e) => setSoundAlarms(e.target.value)}
                placeholder="sos,powerCut,..."
                class="input"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
