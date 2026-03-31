import { createSignal, createEffect, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { session, sessionActions, createPersistedState } from '../stores';
import { useLocalization, useTranslation } from '../common/components/LocalizationProvider';
import { 
  generateLoginToken, 
  handleLoginTokenListeners, 
  nativeEnvironment,
  nativePostMessage 
} from '../common/components/NativeInterface';
import LoginLayout from './LoginLayout';
import QrCodeDialog from '../common/components/QrCodeDialog';
import fetchOrThrow from '../common/util/fetchOrThrow';

export default function LoginPage() {
  const navigate = useNavigate();
  const t = useTranslation();
  const { languages, language, setLocalLanguage } = useLocalization();

  const [email, setEmail] = createPersistedState('loginEmail', '');
  const [password, setPassword] = createSignal('');
  const [code, setCode] = createSignal('');
  const [failed, setFailed] = createSignal(false);
  const [codeEnabled, setCodeEnabled] = createSignal(false);
  const [showPassword, setShowPassword] = createSignal(false);
  const [showQr, setShowQr] = createSignal(false);
  const [server, setServer] = createSignal(null);

  const languageList = () => Object.entries(languages).map(([code, data]) => ({
    code,
    country: data.country,
    name: data.name,
  }));

  onMount(async () => {
    nativePostMessage('authentication');
    
    try {
      const response = await fetch('/api/server');
      if (response.ok) {
        const data = await response.json();
        setServer(data);
        sessionActions.updateServer(data);
      }
    } catch {
      // ignore
    }
  });

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setFailed(false);
    
    try {
      const query = `email=${encodeURIComponent(email())}&password=${encodeURIComponent(password())}`;
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: codeEnabled() ? `${query}&code=${code()}` : query,
      });
      
      if (response.ok) {
        const user = await response.json();
        generateLoginToken();
        sessionActions.updateUser(user);
        const target = window.sessionStorage.getItem('postLogin') || '/';
        window.sessionStorage.removeItem('postLogin');
        navigate(target);
      } else if (response.status === 401 && response.headers.get('WWW-Authenticate') === 'TOTP') {
        setCodeEnabled(true);
      } else {
        throw new Error(await response.text());
      }
    } catch {
      setFailed(true);
      setPassword('');
    }
  };

  const handleTokenLogin = async (token) => {
    try {
      const response = await fetchOrThrow(`/api/session?token=${encodeURIComponent(token)}`);
      const user = await response.json();
      sessionActions.updateUser(user);
      navigate('/');
    } catch (error) {
      console.error('Token login failed:', error);
    }
  };

  const handleOpenIdLogin = () => {
    window.location = '/api/session/openid/auth';
  };

  onMount(() => {
    const listener = (token) => handleTokenLogin(token);
    handleLoginTokenListeners.add(listener);
    return () => handleLoginTokenListeners.delete(listener);
  });

  const registrationEnabled = () => server()?.registration;
  const languageEnabled = () => !server()?.attributes?.language && !server()?.attributes?.['ui.disableLoginLanguage'];
  const emailEnabled = () => server()?.emailEnabled;
  const openIdEnabled = () => server()?.openIdEnabled;
  const openIdForced = () => server()?.openIdEnabled && server()?.openIdForce;

  return (
    <LoginLayout>
      <div class="space-y-4">
        <div class="flex justify-end gap-2 mb-4">
          {!nativeEnvironment && (
            <button
              onClick={() => setShowQr(true)}
              class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span class="material-icons">qr_code_2</span>
            </button>
          )}
          {languageEnabled() && (
            <select
              value={language}
              onChange={(e) => setLocalLanguage(e.target.value)}
              class="input py-1 px-2 text-sm w-auto"
            >
              {languageList().map((lang) => (
                <option value={lang.code}>{lang.name}</option>
              ))}
            </select>
          )}
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg text-sm">
          <strong class="block mb-2">{t('loginDemo')}</strong>
          {t('userEmail')}: admin@admin.com<br />
          {t('userPassword')}: admin
        </div>

        {!openIdForced() && (
          <form onSubmit={handlePasswordLogin} class="space-y-4">
            <div>
              <input
                type="email"
                value={email()}
                onInput={(e) => setEmail(e.target.value)}
                placeholder={t('userEmail')}
                required
                autofocus={!email()}
                class={`input ${failed() ? 'border-red-500' : ''}`}
              />
            </div>
            <div class="relative">
              <input
                type={showPassword() ? 'text' : 'password'}
                value={password()}
                onInput={(e) => setPassword(e.target.value)}
                placeholder={t('userPassword')}
                required
                autofocus={!!email()}
                class={`input pr-10 ${failed() ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword())}
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                <span class="material-icons text-lg">
                  {showPassword() ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {failed() && (
              <p class="text-red-500 text-sm">{t('loginFailed')}</p>
            )}
            
            {codeEnabled() && (
              <input
                type="text"
                value={code()}
                onInput={(e) => setCode(e.target.value)}
                placeholder={t('loginTotpCode')}
                required
                class="input"
              />
            )}
            
            <button
              type="submit"
              disabled={!email() || !password() || (codeEnabled() && !code())}
              class="btn btn-secondary w-full"
            >
              {t('loginLogin')}
            </button>
          </form>
        )}

        {openIdEnabled() && (
          <button
            onClick={handleOpenIdLogin}
            class="btn btn-primary w-full"
          >
            {t('loginOpenId')}
          </button>
        )}

        {!openIdForced() && (
          <div class="flex justify-center gap-6 pt-4 text-sm">
            {registrationEnabled() && (
              <button
                onClick={() => navigate('/register')}
                class="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t('loginRegister')}
              </button>
            )}
            {emailEnabled() && (
              <button
                onClick={() => navigate('/reset-password')}
                class="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t('loginReset')}
              </button>
            )}
          </div>
        )}
      </div>

      <QrCodeDialog open={showQr()} onClose={() => setShowQr(false)} />
    </LoginLayout>
  );
}
