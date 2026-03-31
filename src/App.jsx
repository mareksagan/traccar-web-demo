import { createSignal, createEffect, Show, onMount } from 'solid-js';
import { useNavigate, useLocation } from '@solidjs/router';
import { session, sessionActions, devicesActions } from './stores';
import { useLocalization } from './common/components/LocalizationProvider';
import SocketController from './SocketController';
import ErrorHandler from './common/components/ErrorHandler';
import BottomMenu from './common/components/BottomMenu';
import TermsDialog from './common/components/TermsDialog';
import Loader from './common/components/Loader';
import preloadImages from './map/core/preloadImages';
import fetchOrThrow from './common/util/fetchOrThrow';

// Preload images
preloadImages();

export default function App(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const localization = useLocalization();
  const [loading, setLoading] = createSignal(!session.user); // Don't load if already logged in
  
  const direction = () => localization.direction;

  onMount(async () => {
    // If already logged in, fetch server and skip session check
    if (session.user) {
      try {
        const response = await fetch('/api/server');
        if (response.ok) {
          const server = await response.json();
          sessionActions.updateServer(server);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // Check session
    try {
      const response = await fetch('/api/session');
      if (response.ok) {
        const user = await response.json();
        sessionActions.updateUser(user);
      } else {
        window.sessionStorage.setItem('postLogin', location.pathname + location.search);
        navigate('/login');
      }
    } catch (err) {
      console.error('Session check failed:', err);
      window.sessionStorage.setItem('postLogin', location.pathname + location.search);
      navigate('/login');
    }
    
    // Fetch server info (for both logged in and new sessions)
    try {
      const response = await fetch('/api/server');
      if (response.ok) {
        const server = await response.json();
        sessionActions.updateServer(server);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  });

  const acceptTerms = async () => {
    try {
      const response = await fetchOrThrow(`/api/users/${session.user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...session.user,
          attributes: { ...session.user.attributes, termsAccepted: true },
        }),
      });
      sessionActions.updateUser(await response.json());
    } catch (error) {
      console.error('Failed to accept terms:', error);
    }
  };

  const needsTermsAcceptance = () => {
    return session.server?.attributes?.termsUrl && 
           !session.user?.attributes?.termsAccepted;
  };

  return (
    <div class="h-full w-full" dir={direction()}>
      <Show when={!loading()} fallback={<Loader />}>
        <Show
          when={!needsTermsAcceptance()}
          fallback={
            <TermsDialog
              open
              onCancel={() => navigate('/login')}
              onAccept={acceptTerms}
            />
          }
        >
          <SocketController />
          <ErrorHandler />
          <main class="h-full w-full">
            {props.children}
          </main>
        </Show>
      </Show>
    </div>
  );
}
