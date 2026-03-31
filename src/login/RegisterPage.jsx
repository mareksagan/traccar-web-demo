import { createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { sessionActions } from '../stores';
import { useTranslation } from '../common/components/LocalizationProvider';
import LoginLayout from './LoginLayout';

export default function RegisterPage() {
  const navigate = useNavigate();
  const t = useTranslation();
  
  const [name, setName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [server, setServer] = createSignal(null);

  createEffect(async () => {
    try {
      const response = await fetch('/api/server');
      if (response.ok) {
        const data = await response.json();
        setServer(data);
        if (!data.registration) {
          navigate('/login');
        }
      }
    } catch {
      // ignore
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name(),
          email: email(),
          password: password(),
        }),
      });
      
      if (response.ok) {
        navigate('/login');
      } else {
        setError(await response.text());
      }
    } catch {
      setError(t('sharedSomethingWentWrong'));
    }
  };

  return (
    <LoginLayout>
      <h2 class="text-2xl font-semibold text-center mb-6 text-gray-900 dark:text-white">
        {t('loginRegister')}
      </h2>
      
      <form onSubmit={handleSubmit} class="space-y-4">
        <input
          type="text"
          value={name()}
          onInput={(e) => setName(e.target.value)}
          placeholder={t('sharedName')}
          required
          class="input"
        />
        <input
          type="email"
          value={email()}
          onInput={(e) => setEmail(e.target.value)}
          placeholder={t('userEmail')}
          required
          class="input"
        />
        <input
          type="password"
          value={password()}
          onInput={(e) => setPassword(e.target.value)}
          placeholder={t('userPassword')}
          required
          class="input"
        />
        
        {error() && (
          <p class="text-red-500 text-sm">{error()}</p>
        )}
        
        <button
          type="submit"
          disabled={!name() || !email() || !password()}
          class="btn btn-secondary w-full"
        >
          {t('loginRegister')}
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
