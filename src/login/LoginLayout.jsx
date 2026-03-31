import { createSignal, createEffect } from 'solid-js';
import { session } from '../stores';
import { useTranslation } from '../common/components/LocalizationProvider';

export default function LoginLayout(props) {
  const t = useTranslation();
  const [announcement, setAnnouncement] = createSignal('');

  createEffect(async () => {
    try {
      const response = await fetch('/api/server');
      if (response.ok) {
        const server = await response.json();
        setAnnouncement(server.announcement || '');
      }
    } catch {
      // ignore
    }
  });

  return (
    <div 
      class="min-h-screen w-full flex items-center justify-center p-4"
      style={{
        'background-image': 'url(/images/background.svg)',
        'background-size': 'cover',
        'background-position': 'center',
      }}
    >
      <div class="w-full max-w-md">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
          <div class="flex justify-center mb-8">
            <img src="/images/logo.svg" alt="Traccar" class="h-16" />
          </div>
          
          {announcement() && (
            <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg">
              {announcement()}
            </div>
          )}
          
          {props.children}
        </div>
      </div>
    </div>
  );
}
