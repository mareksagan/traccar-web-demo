import { createSignal, For, Show } from 'solid-js';
import { useTranslation } from '../common/components/LocalizationProvider';
import { devices } from '../stores';
import { formatDistance, formatDuration, formatSpeed } from '../common/util/formatter';

export default function SummaryReportPage() {
  const t = useTranslation();
  const [deviceId, setDeviceId] = createSignal('');
  const [from, setFrom] = createSignal('');
  const [to, setTo] = createSignal('');
  const [summary, setSummary] = createSignal([]);
  const [loading, setLoading] = createSignal(false);

  const handleLoad = async () => {
    if (!deviceId() || !from() || !to()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/summary?deviceId=${deviceId()}&from=${encodeURIComponent(from())}&to=${encodeURIComponent(to())}`);
      if (res.ok) setSummary(await res.json());
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
        <Show when={summary().length > 0} fallback={<div class="p-8 text-center text-gray-500">{t('sharedNoData')}</div>}>
          <table class="w-full text-sm"><thead class="bg-gray-50 dark:bg-gray-700 sticky top-0"><tr><th class="px-4 py-3 text-left">{t('reportStartTime')}</th><th class="px-4 py-3 text-left">{t('reportDistance')}</th><th class="px-4 py-3 text-left">{t('reportAverageSpeed')}</th><th class="px-4 py-3 text-left">{t('reportMaximumSpeed')}</th><th class="px-4 py-3 text-left">{t('reportDuration')}</th></tr></thead>
          <tbody class="divide-y"><For each={summary()}>{(item) => <tr class="hover:bg-gray-50 dark:hover:bg-gray-800"><td class="px-4 py-3">{item.startTime?.slice(0, 10)}</td><td class="px-4 py-3">{formatDistance(item.distance, 'km')}</td><td class="px-4 py-3">{formatSpeed(item.averageSpeed, 'kmh')}</td><td class="px-4 py-3">{formatSpeed(item.maxSpeed, 'kmh')}</td><td class="px-4 py-3">{formatDuration(item.duration)}</td></tr>}</For></tbody></table>
        </Show>
      </div>
    </div>
  );
}
