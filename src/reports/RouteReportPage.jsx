import { createSignal, createEffect, For, Show } from 'solid-js';
import { useTranslation } from '../common/components/LocalizationProvider';
import { devices, session } from '../stores';
import { formatTime, formatSpeed, formatCoordinate } from '../common/util/formatter';
import MapView from '../map/core/MapView';
import MapRoute from '../map/MapRoute';
import dayjs from 'dayjs';

// Get today's date range for default values
const getTodayRange = () => {
  const now = dayjs();
  const startOfDay = now.startOf('day').format('YYYY-MM-DDTHH:mm');
  const endOfDay = now.endOf('day').format('YYYY-MM-DDTHH:mm');
  return { start: startOfDay, end: endOfDay };
};

export default function RouteReportPage() {
  const t = useTranslation();
  const todayRange = getTodayRange();
  const [deviceId, setDeviceId] = createSignal('');
  const [from, setFrom] = createSignal(todayRange.start);
  const [to, setTo] = createSignal(todayRange.end);
  const [positions, setPositions] = createSignal([]);
  const [loading, setLoading] = createSignal(false);
  const [map, setMap] = createSignal(null);

  const handleLoad = async () => {
    if (!deviceId() || !from() || !to()) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `/api/positions?deviceId=${deviceId()}&from=${encodeURIComponent(from())}&to=${encodeURIComponent(to())}`
      );
      if (response.ok) {
        setPositions(await response.json());
      }
    } catch (error) {
      console.error('Failed to load route:', error);
    } finally {
      setLoading(false);
    }
  };

  const deviceList = () => Object.values(devices.items);

  return (
    <div class="h-full flex flex-col">
      <div class="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 space-y-3">
        <div class="flex flex-wrap gap-3">
          <select
            value={deviceId()}
            onChange={(e) => setDeviceId(e.target.value)}
            class="input w-48"
          >
            <option value="">{t('sharedDevice')}</option>
            <For each={deviceList()}>
              {(device) => <option value={device.id}>{device.name}</option>}
            </For>
          </select>

          <input
            type="datetime-local"
            value={from()}
            onInput={(e) => setFrom(e.target.value)}
            class="input"
          />

          <input
            type="datetime-local"
            value={to()}
            onInput={(e) => setTo(e.target.value)}
            class="input"
          />

          <button
            onClick={handleLoad}
            disabled={!deviceId() || !from() || !to() || loading()}
            class="btn btn-primary"
          >
            {loading() ? t('sharedLoading') : t('sharedShow')}
          </button>
        </div>
      </div>

      <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div class="flex-1 relative">
          <Show when={positions().length > 0}>
            <MapView
              center={[positions()[0]?.longitude, positions()[0]?.latitude]}
              zoom={14}
              onLoad={setMap}
            />
            <MapRoute map={map} positions={positions()} />
          </Show>
        </div>

        <div class="h-64 md:h-auto md:w-96 bg-white dark:bg-gray-800 overflow-y-auto border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700">
          <Show
            when={positions().length > 0}
            fallback={
              <div class="p-8 text-center text-gray-500 dark:text-gray-400">
                {t('sharedNoData')}
              </div>
            }
          >
            <table class="w-full text-sm">
              <thead class="bg-gray-50 dark:bg-gray-700 sticky top-0">
                <tr>
                  <th class="px-3 py-2 text-left">{t('positionFixTime')}</th>
                  <th class="px-3 py-2 text-left">{t('positionSpeed')}</th>
                  <th class="px-3 py-2 text-left">{t('positionAddress')}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <For each={positions()}>
                  {(position) => (
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td class="px-3 py-2 text-gray-900 dark:text-white">
                        {formatTime(position.fixTime, 'HH:mm:ss')}
                      </td>
                      <td class="px-3 py-2 text-gray-600 dark:text-gray-400">
                        {formatSpeed(position.speed, 'kmh')}
                      </td>
                      <td class="px-3 py-2 text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
                        {position.address || '-'}
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </Show>
        </div>
      </div>
    </div>
  );
}
