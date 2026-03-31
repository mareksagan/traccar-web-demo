import { createSignal, createEffect } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { useTranslation } from '../common/components/LocalizationProvider';
import NavBar from '../common/components/NavBar';

export default function GeofencePage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  
  const [geofence, setGeofence] = createSignal({
    name: '',
    area: '',
    attributes: {},
  });
  const [loading, setLoading] = createSignal(false);

  createEffect(async () => {
    if (params.id) {
      try {
        const response = await fetch(`/api/geofences/${params.id}`);
        if (response.ok) {
          setGeofence(await response.json());
        }
      } catch (error) {
        console.error('Failed to load geofence:', error);
      }
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = params.id ? `/api/geofences/${params.id}` : '/api/geofences';
      const method = params.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geofence()),
      });
      
      if (response.ok) {
        navigate('/settings/geofences');
      }
    } catch (error) {
      console.error('Failed to save geofence:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="max-w-2xl mx-auto">
      <NavBar
        title={params.id ? t('sharedGeofence') : t('sharedAddGeofence')}
        onBack={() => navigate('/settings/geofences')}
      />

      <form onSubmit={handleSubmit} class="mt-6 space-y-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('sharedName')} *
            </label>
            <input
              type="text"
              value={geofence().name}
              onInput={(e) => setGeofence((prev) => ({ ...prev, name: e.target.value }))}
              required
              class="input"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('geofenceArea')} *
            </label>
            <textarea
              value={geofence().area}
              onInput={(e) => setGeofence((prev) => ({ ...prev, area: e.target.value }))}
              placeholder="CIRCLE(lat,lon,radius) or POLYGON((lat1 lon1, lat2 lon2, ...))"
              required
              rows="3"
              class="input font-mono text-sm"
            />
          </div>
        </div>

        <div class="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/settings/geofences')}
            class="btn bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {t('sharedCancel')}
          </button>
          <button
            type="submit"
            disabled={!geofence().name || !geofence().area || loading()}
            class="btn btn-primary flex-1"
          >
            {loading() ? t('sharedLoading') : t('sharedSave')}
          </button>
        </div>
      </form>
    </div>
  );
}
