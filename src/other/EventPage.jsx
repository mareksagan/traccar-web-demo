import { createSignal, createEffect } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { useTranslation } from '../common/components/LocalizationProvider';
import { formatTime } from '../common/util/formatter';
import { devices } from '../stores';
import NavBar from '../common/components/NavBar';

export default function EventPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const [event, setEvent] = createSignal(null);

  createEffect(async () => {
    if (params.id) {
      try {
        const res = await fetch(`/api/events/${params.id}`);
        if (res.ok) setEvent(await res.json());
      } catch (e) {}
    }
  });

  const getEventTitle = () => {
    const e = event();
    if (!e) return '';
    if (e.type === 'alarm') return `${t('alarmGeneral')}: ${e.attributes?.alarm || ''}`;
    return t(`event${e.type.charAt(0).toUpperCase() + e.type.slice(1)}`) || e.type;
  };

  return (
    <div class="h-full flex flex-col">
      <NavBar title={t('reportEvent')} onBack={() => navigate('/')} />
      <Show when={event()} fallback={<div class="flex-1 flex items-center justify-center">{t('sharedLoading')}</div>}>
        <div class="flex-1 p-4">
          <div class="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">{getEventTitle()}</h2>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2"><span class="text-gray-500">{t('positionFixTime')}</span><span class="text-gray-900 dark:text-white">{formatTime(event().eventTime)}</span></div>
              <div class="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2"><span class="text-gray-500">{t('sharedDevice')}</span><span class="text-gray-900 dark:text-white">{devices.items[event().deviceId]?.name || event().deviceId}</span></div>
              <div class="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2"><span class="text-gray-500">{t('sharedType')}</span><span class="text-gray-900 dark:text-white">{event().type}</span></div>
              <Show when={event().geofenceId}><div class="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2"><span class="text-gray-500">{t('sharedGeofence')}</span><span class="text-gray-900 dark:text-white">{event().geofenceId}</span></div></Show>
              <Show when={event().maintenanceId}><div class="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2"><span class="text-gray-500">{t('maintenanceMaintenance')}</span><span class="text-gray-900 dark:text-white">{event().maintenanceId}</span></div></Show>
              <Show when={event().attributes?.message}><div class="pt-2"><span class="text-gray-500">{t('commandMessage')}</span><p class="mt-1 text-gray-900 dark:text-white">{event().attributes.message}</p></div></Show>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
