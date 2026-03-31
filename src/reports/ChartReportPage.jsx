import { createSignal, For, Show } from 'solid-js';
import { useTranslation } from '../common/components/LocalizationProvider';
import { devices } from '../stores';
import { formatTime } from '../common/util/formatter';
import SimpleChart from '../common/components/SimpleChart';
import dayjs from 'dayjs';

// Get today's date range for default values
const getTodayRange = () => {
  const now = dayjs();
  const startOfDay = now.startOf('day').format('YYYY-MM-DDTHH:mm');
  const endOfDay = now.endOf('day').format('YYYY-MM-DDTHH:mm');
  return { start: startOfDay, end: endOfDay };
};

export default function ChartReportPage() {
  const t = useTranslation();
  const todayRange = getTodayRange();
  const [deviceId, setDeviceId] = createSignal('');
  const [from, setFrom] = createSignal(todayRange.start);
  const [to, setTo] = createSignal(todayRange.end);
  const [type, setType] = createSignal('speed');
  const [loading, setLoading] = createSignal(false);
  const [data, setData] = createSignal([]);

  const handleLoad = async () => {
    if (!deviceId() || !from() || !to()) return;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/positions?deviceId=${deviceId()}&from=${encodeURIComponent(from())}&to=${encodeURIComponent(to())}`
      );
      if (response.ok) {
        const positions = await response.json();
        const chartData = positions.map((p) => ({
          time: formatTime(p.fixTime, 'HH:mm:ss'),
          speed: parseFloat((p.speed * 1.852).toFixed(1)), // Convert to km/h
          altitude: p.altitude || 0,
        }));
        setData(chartData);
      }
    } catch (error) {
      console.error('Failed to load chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getYAxisLabel = () => {
    return type() === 'speed' ? t('positionSpeed') + ' (km/h)' : t('positionAltitude') + ' (m)';
  };

  return (
    <div class="h-full flex flex-col p-4">
      <div class="flex flex-wrap gap-3 mb-4">
        <select
          value={deviceId()}
          onChange={(e) => setDeviceId(e.target.value)}
          class="input w-48"
        >
          <option value="">{t('sharedDevice')}</option>
          <For each={Object.values(devices.items)}>
            {(d) => <option value={d.id}>{d.name}</option>}
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
        <select
          value={type()}
          onChange={(e) => setType(e.target.value)}
          class="input w-32"
        >
          <option value="speed">{t('positionSpeed')}</option>
          <option value="altitude">{t('positionAltitude')}</option>
        </select>
        <button
          onClick={handleLoad}
          disabled={!deviceId() || !from() || !to() || loading()}
          class="btn btn-primary"
        >
          {loading() ? t('sharedLoading') : t('sharedShow')}
        </button>
      </div>
      <div class="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 min-h-0">
        <Show
          when={data().length > 0}
          fallback={
            <div class="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              {t('sharedNoData')}
            </div>
          }
        >
          <div class="w-full h-full">
            <SimpleChart
              data={data()}
              dataKey={type()}
              yAxisLabel={getYAxisLabel()}
            />
          </div>
        </Show>
      </div>
    </div>
  );
}
