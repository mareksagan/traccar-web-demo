import { createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useTranslation } from '../common/components/LocalizationProvider';
import LoginLayout from './LoginLayout';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const t = useTranslation();
  
  const [email, setEmail] = createSignal('');
  const [submitted, setSubmitted] = createSignal(false);
  const [error, setError] = createSignal('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('/api/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email() }),
      });
      
      if (response.ok) {
        setSubmitted(true);
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
        {t('loginReset')}
      </h2>
      
      {submitted() ? (
        <div class="text-center">
          <p class="text-green-600 dark:text-green-400 mb-4">
            {t('loginResetSuccess')}
          </p>
          <button
            onClick={() => navigate('/login')}
            class="btn btn-primary"
          >
            {t('loginLogin')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} class="space-y-4">
          <input
            type="email"
            value={email()}
            onInput={(e) => setEmail(e.target.value)}
            placeholder={t('userEmail')}
            required
            class="input"
          />
          
          {error() && (
            <p class="text-red-500 text-sm">{error()}</p>
          )}
          
          <button
            type="submit"
            disabled={!email()}
            class="btn btn-secondary w-full"
          >
            {t('loginReset')}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/login')}
            class="w-full text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            {t('sharedCancel')}
          </button>
        </form>
      )}
    </LoginLayout>
  );
}
