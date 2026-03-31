import { createSignal, createEffect, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useTranslation } from '../common/components/LocalizationProvider';
import NavBar from '../common/components/NavBar';

export default function GeofencesListPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const [geofences, setGeofences] = createSignal([]);

  createEffect(async () => {
    try {
      const res = await fetch('/api/geofences');
      if (res.ok) setGeofences(await res.json());
    } catch (e) {}
  });

  return (
    <div class="h-full flex flex-col">
      <NavBar title={t('sharedGeofences')} onBack={() => navigate('/')} />
      <div class="flex-1 overflow-auto p-4">
        <Show when={geofences().length > 0} fallback={<div class="text-center text-gray-500 py-8">{t('sharedNoData')}</div>}>
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <For each={geofences()}>{(g) => (
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <h3 class="font-medium text-gray-900 dark:text-white">{g.name}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{g.area}</p>
              </div>
            )}</For>
          </div>
        </Show>
      </div>
    </div>
  );
}
