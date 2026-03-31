import { createSignal, createEffect } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { useTranslation } from '../common/components/LocalizationProvider';
import NavBar from '../common/components/NavBar';

export default function UserPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  
  const [user, setUser] = createSignal({
    name: '',
    email: '',
    administrator: false,
    password: '',
    attributes: {},
  });
  const [loading, setLoading] = createSignal(false);

  createEffect(async () => {
    if (params.id) {
      try {
        const response = await fetch(`/api/users/${params.id}`);
        if (response.ok) {
          setUser(await response.json());
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = params.id ? `/api/users/${params.id}` : '/api/users';
      const method = params.id ? 'PUT' : 'POST';
      
      const body = { ...user() };
      if (!body.password) delete body.password;
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      if (response.ok) {
        navigate('/settings/users');
      }
    } catch (error) {
      console.error('Failed to save user:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div class="max-w-2xl mx-auto">
      <NavBar
        title={params.id ? t('settingsUser') : t('userAdd')}
        onBack={() => navigate('/settings/users')}
      />

      <form onSubmit={handleSubmit} class="mt-6 space-y-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('sharedName')} *
            </label>
            <input
              type="text"
              value={user().name}
              onInput={(e) => updateField('name', e.target.value)}
              required
              class="input"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('userEmail')} *
            </label>
            <input
              type="email"
              value={user().email}
              onInput={(e) => updateField('email', e.target.value)}
              required
              class="input"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('userPassword')} {!params.id && '*'}
            </label>
            <input
              type="password"
              value={user().password || ''}
              onInput={(e) => updateField('password', e.target.value)}
              required={!params.id}
              class="input"
            />
          </div>

          <div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={user().administrator}
                onChange={(e) => updateField('administrator', e.target.checked)}
                class="w-4 h-4"
              />
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('userAdmin')}
              </span>
            </label>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/settings/users')}
            class="btn bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {t('sharedCancel')}
          </button>
          <button
            type="submit"
            disabled={!user().name || !user().email || loading()}
            class="btn btn-primary flex-1"
          >
            {loading() ? t('sharedLoading') : t('sharedSave')}
          </button>
        </div>
      </form>
    </div>
  );
}
