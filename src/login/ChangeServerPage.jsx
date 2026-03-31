import { createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useTranslation } from '../common/components/LocalizationProvider';
import LoginLayout from './LoginLayout';

export default function ChangeServerPage() {
  const navigate = useNavigate();
  const t = useTranslation();
  
  const [server, setServer] = createSignal('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (server()) {
      window.location.href = `http://${server()}`;
    }
  };

  return (
    <LoginLayout>
      <h2 class="text-2xl font-semibold text-center mb-6 text-gray-900 dark:text-white">
        {t('settingsServer')}
      </h2>
      
      <form onSubmit={handleSubmit} class="space-y-4">
        <input
          type="text"
          value={server()}
          onInput={(e) => setServer(e.target.value)}
          placeholder={t('serverAddress')}
          required
          class="input"
        />
        
        <button
          type="submit"
          disabled={!server()}
          class="btn btn-secondary w-full"
        >
          {t('sharedSave')}
        </button>
        
        <button
          type="button"
          onClick={() => navigate('/login')}
          class="w-full text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          {t('sharedCancel')}
        </button>
      </form>
    </LoginLayout>
  );
}
