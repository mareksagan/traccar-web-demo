import { createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useTranslation } from '../common/components/LocalizationProvider';
import { session, sessionActions } from '../stores';
import NavBar from '../common/components/NavBar';

export default function ServerPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const [server, setServer] = createSignal(null);
  const [loading, setLoading] = createSignal(false);

  createEffect(() => {
    if (session.server) {
      setServer({ ...session.server });
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/server', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(server()),
      });
      
      if (response.ok) {
        const updated = await response.json();
        sessionActions.updateServer(updated);
        navigate('/settings');
      }
    } catch (error) {
      console.error('Failed to save server:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setServer((prev) => ({ ...prev, [field]: value }));
  };

  const updateAttribute = (key, value) => {
    setServer((prev) => ({
      ...prev,
      attributes: { ...prev.attributes, [key]: value },
    }));
  };

  if (!server()) {
    return <div class="p-8 text-center">{t('sharedLoading')}</div>;
  }

  return (
    <div class="max-w-2xl mx-auto">
      <NavBar
        title={t('settingsServer')}
        onBack={() => navigate('/settings')}
      />

      <form onSubmit={handleSubmit} class="mt-6 space-y-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('serverRegistration')}
            </label>
            <select
              value={server().registration ? 'true' : 'false'}
              onChange={(e) => updateField('registration', e.target.value === 'true')}
              class="input"
            >
              <option value="false">{t('sharedNo')}</option>
              <option value="true">{t('sharedYes')}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('serverReadonly')}
            </label>
            <select
              value={server().readonly ? 'true' : 'false'}
              onChange={(e) => updateField('readonly', e.target.value === 'true')}
              class="input"
            >
              <option value="false">{t('sharedNo')}</option>
              <option value="true">{t('sharedYes')}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('mapDefaultLatitude')}
            </label>
            <input
              type="number"
              step="any"
              value={server().latitude || 0}
              onInput={(e) => updateField('latitude', parseFloat(e.target.value))}
              class="input"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('mapDefaultLongitude')}
            </label>
            <input
              type="number"
              step="any"
              value={server().longitude || 0}
              onInput={(e) => updateField('longitude', parseFloat(e.target.value))}
              class="input"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('mapDefaultZoom')}
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={server().zoom || 0}
              onInput={(e) => updateField('zoom', parseInt(e.target.value))}
              class="input"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('serverAnnouncement')}
            </label>
            <textarea
              value={server().announcement || ''}
              onInput={(e) => updateField('announcement', e.target.value)}
              rows="3"
              class="input"
            />
          </div>
        </div>

        <div class="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/settings')}
            class="btn bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {t('sharedCancel')}
          </button>
          <button
            type="submit"
            disabled={loading()}
            class="btn btn-primary flex-1"
          >
            {loading() ? t('sharedLoading') : t('sharedSave')}
          </button>
        </div>
      </form>
    </div>
  );
}
