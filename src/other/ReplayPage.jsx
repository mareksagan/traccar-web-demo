import { createSignal, createEffect, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useTranslation } from '../common/components/LocalizationProvider';
import { devices } from '../stores';
import { formatTime } from '../common/util/formatter';
import MapView from '../map/core/MapView';
import NavBar from '../common/components/NavBar';

export default function ReplayPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const [deviceId, setDeviceId] = createSignal('');
  const [from, setFrom] = createSignal('');
  const [to, setTo] = createSignal('');
  const [positions, setPositions] = createSignal([]);
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [playing, setPlaying] = createSignal(false);

  const handleLoad = async () => {
    if (!deviceId() || !from() || !to()) return;
    try {
      const res = await fetch(`/api/positions?deviceId=${deviceId()}&from=${encodeURIComponent(from())}&to=${encodeURIComponent(to())}`);
      if (res.ok) {
        const data = await res.json();
        setPositions(data);
        setCurrentIndex(0);
      }
    } catch (e) {}
  };

  createEffect(() => {
    if (playing() && currentIndex() < positions().length - 1) {
      const timer = setTimeout(() => setCurrentIndex(currentIndex() + 1), 100);
      return () => clearTimeout(timer);
    }
  });

  const currentPosition = () => positions()[currentIndex()];

  return (
    <div class="h-full flex flex-col">
      <NavBar title={t('reportReplay')} onBack={() => navigate('/')} />
      <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div class="flex-1 relative">
          <Show when={currentPosition()}>
            <MapView center={[currentPosition().longitude, currentPosition().latitude]} zoom={15} />
          </Show>
        </div>
        <div class="h-64 md:h-auto md:w-80 bg-white dark:bg-gray-800 overflow-y-auto border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700">
          <div class="p-4 space-y-3">
            <select value={deviceId()} onChange={(e) => setDeviceId(e.target.value)} class="input w-full"><option value="">{t('sharedDevice')}</option><For each={Object.values(devices.items)}>{(d) => <option value={d.id}>{d.name}</option>}</For></select>
            <input type="datetime-local" value={from()} onInput={(e) => setFrom(e.target.value)} class="input w-full" />
            <input type="datetime-local" value={to()} onInput={(e) => setTo(e.target.value)} class="input w-full" />
            <button onClick={handleLoad} class="btn btn-primary w-full">{t('sharedLoad')}</button>
            <Show when={positions().length > 0}>
              <div class="flex items-center gap-2">
                <button onClick={() => setPlaying(!playing())} class="btn btn-secondary flex-1"><span class="material-icons">{playing() ? 'pause' : 'play_arrow'}</span></button>
                <input type="range" min="0" max={positions().length - 1} value={currentIndex()} onInput={(e) => setCurrentIndex(parseInt(e.target.value))} class="flex-1" />
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">{currentIndex() + 1} / {positions().length}</p>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
}
