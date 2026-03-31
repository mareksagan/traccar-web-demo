import { createSignal, createEffect } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { useTranslation } from '../common/components/LocalizationProvider';
import NavBar from '../common/components/NavBar';

export default function DriverPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  
  const [driver, setDriver] = createSignal({
    name: '',
    uniqueId: '',
    attributes: {},
  });
  const [loading, setLoading] = createSignal(false);

  createEffect(async () => {
    if (params.id) {
      try {
        const response = await fetch(`/api/drivers/${params.id}`);
        if (response.ok) {
          setDriver(await response.json());
        }
      } catch (error) {
        console.error('Failed to load driver:', error);
      }
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = params.id ? `/api/drivers/${params.id}` : '/api/drivers';
      const method = params.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driver()),
      });
      
      if (response.ok) {
        navigate('/settings/drivers');
      }
    } catch (error) {
      console.error('Failed to save driver:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="max-w-2xl mx-auto">
      <NavBar
        title={params.id ? t('sharedDriver') : t('driverAdd')}
        onBack={() => navigate('/settings/drivers')}
      />

      <form onSubmit={handleSubmit} class="mt-6 space-y-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('sharedName')} *
            </label>
            <input
              type="text"
              value={driver().name}
              onInput={(e) => setDriver((prev) => ({ ...prev, name: e.target.value }))}
              required
              class="input"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('driverUniqueId')} *
            </label>
            <input
              type="text"
              value={driver().uniqueId}
              onInput={(e) => setDriver((prev) => ({ ...prev, uniqueId: e.target.value }))}
              required
              class="input"
            />
          </div>
        </div>

        <div class="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/settings/drivers')}
            class="btn bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {t('sharedCancel')}
          </button>
          <button
            type="submit"
            disabled={!driver().name || !driver().uniqueId || loading()}
            class="btn btn-primary flex-1"
          >
            {loading() ? t('sharedLoading') : t('sharedSave')}
          </button>
        </div>
      </form>
    </div>
  );
}
