import { createSignal, For, Show } from 'solid-js';
import { useTranslation } from '../common/components/LocalizationProvider';
import { devices } from '../stores';
import { formatTime, formatDuration } from '../common/util/formatter';
import dayjs from 'dayjs';

// Get today's date range for default values
const getTodayRange = () => {
  const now = dayjs();
  const startOfDay = now.startOf('day').format('YYYY-MM-DDTHH:mm');
  const endOfDay = now.endOf('day').format('YYYY-MM-DDTHH:mm');
  return { start: startOfDay, end: endOfDay };
};

export default function StopReportPage() {
  const t = useTranslation();
  const todayRange = getTodayRange();
  const [deviceId, setDeviceId] = createSignal('');
  const [from, setFrom] = createSignal(todayRange.start);
  const [to, setTo] = createSignal(todayRange.end);
  const [stops, setStops] = createSignal([]);
  const [loading, setLoading] = createSignal(false);

  const handleLoad = async () => {
    if (!deviceId() || !from() || !to()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/stops?deviceId=${deviceId()}&from=${encodeURIComponent(from())}&to=${encodeURIComponent(to())}`);
      if (res.ok) setStops(await res.json());
    } catch (e) {}
    setLoading(false);
  };

  return (
    <div class="h-full flex flex-col p-4">
      <div class="flex flex-wrap gap-3 mb-4">
        <select value={deviceId()} onChange={(e) => setDeviceId(e.target.value)} class="input w-48">
          <option value="">{t('sharedDevice')}</option>
          <For each={Object.values(devices.items)}>{(d) => <option value={d.id}>{d.name}</option>}</For>
        </select>
        <input type="datetime-local" value={from()} onInput={(e) => setFrom(e.target.value)} class="input" />
        <input type="datetime-local" value={to()} onInput={(e) => setTo(e.target.value)} class="input" />
        <button onClick={handleLoad} disabled={!deviceId() || !from() || !to() || loading()} class="btn btn-primary">{loading() ? t('sharedLoading') : t('sharedShow')}</button>
      </div>
      <div class="flex-1 overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <Show when={stops().length > 0} fallback={<div class="p-8 text-center text-gray-500">{t('sharedNoData')}</div>}>
          <table class="w-full text-sm"><thead class="bg-gray-50 dark:bg-gray-700 sticky top-0"><tr><th class="px-4 py-3 text-left">{t('reportStartTime')}</th><th class="px-4 py-3 text-left">{t('reportEndTime')}</th><th class="px-4 py-3 text-left">{t('reportDuration')}</th><th class="px-4 py-3 text-left">{t('reportSpentFuel')}</th></tr></thead>
          <tbody class="divide-y"><For each={stops()}>{(stop) => <tr class="hover:bg-gray-50 dark:hover:bg-gray-800"><td class="px-4 py-3">{formatTime(stop.startTime)}</td><td class="px-4 py-3">{formatTime(stop.endTime)}</td><td class="px-4 py-3">{formatDuration(stop.duration)}</td><td class="px-4 py-3">{stop.spentFuel || '-'}</td></tr>}</For></tbody></table>
        </Show>
      </div>
    </div>
  );
}
