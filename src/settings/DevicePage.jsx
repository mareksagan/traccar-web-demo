import { createSignal, createEffect } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { useTranslation } from '../common/components/LocalizationProvider';
import { deviceCategories } from '../common/util/deviceCategories';
import NavBar from '../common/components/NavBar';

export default function DevicePage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  
  const [device, setDevice] = createSignal({
    name: '',
    uniqueId: '',
    category: 'default',
    phone: '',
    model: '',
    contact: '',
    attributes: {},
  });
  const [loading, setLoading] = createSignal(false);

  createEffect(async () => {
    if (params.id) {
      try {
        const response = await fetch(`/api/devices/${params.id}`);
        if (response.ok) {
          setDevice(await response.json());
        }
      } catch (error) {
        console.error('Failed to load device:', error);
      }
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = params.id ? `/api/devices/${params.id}` : '/api/devices';
      const method = params.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(device()),
      });
      
      if (response.ok) {
        navigate('/settings/devices');
      }
    } catch (error) {
      console.error('Failed to save device:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setDevice((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div class="max-w-2xl mx-auto">
      <NavBar
        title={params.id ? t('sharedDevice') : t('sharedAddDevice')}
        onBack={() => navigate('/settings/devices')}
      />

      <form onSubmit={handleSubmit} class="mt-6 space-y-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('sharedName')} *
            </label>
            <input
              type="text"
              value={device().name}
              onInput={(e) => updateField('name', e.target.value)}
              required
              class="input"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('deviceIdentifier')} *
            </label>
            <input
              type="text"
              value={device().uniqueId}
              onInput={(e) => updateField('uniqueId', e.target.value)}
              required
              disabled={!!params.id}
              class="input"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('deviceCategory')}
            </label>
            <select
              value={device().category || 'default'}
              onChange={(e) => updateField('category', e.target.value)}
              class="input"
            >
              {deviceCategories.map((cat) => (
                <option value={cat}>
                  {t(`category${cat.charAt(0).toUpperCase() + cat.slice(1)}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('sharedPhone')}
            </label>
            <input
              type="tel"
              value={device().phone || ''}
              onInput={(e) => updateField('phone', e.target.value)}
              class="input"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('deviceModel')}
            </label>
            <input
              type="text"
              value={device().model || ''}
              onInput={(e) => updateField('model', e.target.value)}
              class="input"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('deviceContact')}
            </label>
            <input
              type="text"
              value={device().contact || ''}
              onInput={(e) => updateField('contact', e.target.value)}
              class="input"
            />
          </div>
        </div>

        <div class="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/settings/devices')}
            class="btn bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {t('sharedCancel')}
          </button>
          <button
            type="submit"
            disabled={!device().name || !device().uniqueId || loading()}
            class="btn btn-primary flex-1"
          >
            {loading() ? t('sharedLoading') : t('sharedSave')}
          </button>
        </div>
      </form>
    </div>
  );
}
