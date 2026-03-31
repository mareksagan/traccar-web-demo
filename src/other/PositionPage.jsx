import { createSignal, createEffect } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { useTranslation } from '../common/components/LocalizationProvider';
import { formatTime, formatSpeed, formatCoordinate, formatAltitude } from '../common/util/formatter';
import MapView from '../map/core/MapView';
import NavBar from '../common/components/NavBar';

export default function PositionPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const [position, setPosition] = createSignal(null);

  createEffect(async () => {
    if (params.id) {
      try {
        const res = await fetch(`/api/positions?id=${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setPosition(data[0]);
        }
      } catch (e) {}
    }
  });

  return (
    <div class="h-full flex flex-col">
      <NavBar title={t('positionPosition')} onBack={() => navigate('/')} />
      <Show when={position()} fallback={<div class="flex-1 flex items-center justify-center">{t('sharedLoading')}</div>}>
        <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
          <div class="flex-1 relative"><MapView center={[position().longitude, position().latitude]} zoom={16} /></div>
          <div class="h-auto md:h-auto md:w-80 bg-white dark:bg-gray-800 overflow-y-auto border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 p-4">
            <div class="space-y-3 text-sm">
              <div class="flex justify-between"><span class="text-gray-500">{t('positionFixTime')}</span><span class="text-gray-900 dark:text-white">{formatTime(position().fixTime)}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">{t('positionLatitude')}</span><span class="text-gray-900 dark:text-white">{formatCoordinate(position().latitude, true)}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">{t('positionLongitude')}</span><span class="text-gray-900 dark:text-white">{formatCoordinate(position().longitude, false)}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">{t('positionSpeed')}</span><span class="text-gray-900 dark:text-white">{formatSpeed(position().speed, 'kmh')}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">{t('positionCourse')}</span><span class="text-gray-900 dark:text-white">{position().course}°</span></div>
              <div class="flex justify-between"><span class="text-gray-500">{t('positionAltitude')}</span><span class="text-gray-900 dark:text-white">{position().altitude} m</span></div>
              <div class="flex justify-between"><span class="text-gray-500">{t('positionAddress')}</span><span class="text-gray-900 dark:text-white text-right max-w-[150px]">{position().address || '-'}</span></div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
