import { createSignal, createEffect } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { useTranslation } from '../common/components/LocalizationProvider';
import NavBar from '../common/components/NavBar';

export default function GroupPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  
  const [group, setGroup] = createSignal({
    name: '',
    attributes: {},
  });
  const [loading, setLoading] = createSignal(false);

  createEffect(async () => {
    if (params.id) {
      try {
        const response = await fetch(`/api/groups/${params.id}`);
        if (response.ok) {
          setGroup(await response.json());
        }
      } catch (error) {
        console.error('Failed to load group:', error);
      }
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = params.id ? `/api/groups/${params.id}` : '/api/groups';
      const method = params.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(group()),
      });
      
      if (response.ok) {
        navigate('/settings/groups');
      }
    } catch (error) {
      console.error('Failed to save group:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="max-w-2xl mx-auto">
      <NavBar
        title={params.id ? t('sharedGroup') : t('groupAdd')}
        onBack={() => navigate('/settings/groups')}
      />

      <form onSubmit={handleSubmit} class="mt-6 space-y-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('sharedName')} *
            </label>
            <input
              type="text"
              value={group().name}
              onInput={(e) => setGroup((prev) => ({ ...prev, name: e.target.value }))}
              required
              class="input"
            />
          </div>
        </div>

        <div class="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/settings/groups')}
            class="btn bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {t('sharedCancel')}
          </button>
          <button
            type="submit"
            disabled={!group().name || loading()}
            class="btn btn-primary flex-1"
          >
            {loading() ? t('sharedLoading') : t('sharedSave')}
          </button>
        </div>
      </form>
    </div>
  );
}
