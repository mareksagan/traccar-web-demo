import { For, Show, createSignal, createEffect } from 'solid-js';
import { events, eventsActions, devices, session } from '../stores';
import { useTranslation } from '../common/components/LocalizationProvider';
import { formatTime } from '../common/util/formatter';

export default function EventsDrawer(props) {
  const t = useTranslation();

  const getDeviceName = (deviceId) => {
    return devices.items[deviceId]?.name || t('sharedDevice');
  };

  const getEventTitle = (event) => {
    const type = event.type;
    if (type === 'alarm') {
      return `${t('alarmGeneral')}: ${event.attributes?.alarm || ''}`;
    }
    return t(`event${type.charAt(0).toUpperCase() + type.slice(1)}`) || type;
  };

  if (!props.open) return null;

  return (
    <div class="fixed inset-0 z-50 flex">
      <div 
        class="flex-1 bg-black/30"
        onClick={props.onClose}
      />
      <div class="w-80 max-w-full bg-white dark:bg-gray-800 shadow-xl flex flex-col animate-slide-up">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {t('reportEvents')}
          </h2>
          <button
            onClick={props.onClose}
            class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span class="material-icons text-gray-500">close</span>
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto">
          <Show
            when={events.items.length > 0}
            fallback={
              <div class="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                {t('sharedNoData')}
              </div>
            }
          >
            <For each={events.items.slice(0, 100)}>
              {(event) => (
                <div class="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div class="flex items-start justify-between">
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white text-sm">
                        {getDeviceName(event.deviceId)}
                      </p>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        {getEventTitle(event)}
                      </p>
                    </div>
                    <span class="text-xs text-gray-500">
                      {formatTime(event.eventTime, 'HH:mm:ss')}
                    </span>
                  </div>
                  {event.attributes?.message && (
                    <p class="text-xs text-gray-500 mt-1">
                      {event.attributes.message}
                    </p>
                  )}
                </div>
              )}
            </For>
          </Show>
        </div>
        
        <div class="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => eventsActions.clear()}
            class="btn btn-secondary w-full"
          >
            {t('sharedClear')}
          </button>
        </div>
      </div>
    </div>
  );
}
