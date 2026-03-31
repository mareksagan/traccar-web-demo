import { createSignal, Show, For } from 'solid-js';
import { devices, session } from '../../stores';
import { useTranslation } from './LocalizationProvider';
import { formatTime, formatSpeed, formatCoordinate } from '../util/formatter';

export default function StatusCard(props) {
  const t = useTranslation();
  const [expanded, setExpanded] = createSignal(false);

  const device = () => devices.items[props.deviceId];
  const position = () => props.position;

  const attributes = () => {
    const pos = position();
    return pos ? Object.entries(pos.attributes || {}) : [];
  };

  const getAttributeLabel = (key) => {
    // Map attribute keys to translation keys
    const keyMap = {
      batteryLevel: 'positionBatteryLevel',
      battery: 'positionBattery',
      ignition: 'positionIgnition',
      motion: 'positionMotion',
      distance: 'positionDistance',
      totalDistance: 'positionTotalDistance',
      hours: 'positionHours',
      speed: 'positionSpeed',
      altitude: 'positionAltitude',
      course: 'positionCourse',
      accuracy: 'positionAccuracy',
      address: 'positionAddress',
      fixTime: 'positionFixTime',
      deviceTime: 'positionDeviceTime',
      serverTime: 'positionServerTime',
      protocol: 'positionProtocol',
      fuel: 'positionFuel',
      fuelConsumption: 'positionFuelConsumption',
      power: 'positionPower',
      blocked: 'positionBlocked',
      driverUniqueId: 'positionDriverUniqueId',
      rpm: 'positionRpm',
      coolantTemperature: 'positionCoolantTemperature',
      engineTemp: 'positionEngineTemp',
    };
    return t(keyMap[key]) || key;
  };

  return (
    <div 
      class="fixed right-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-40 overflow-hidden transition-all duration-300"
      style={{
        bottom: '80px',
        'max-width': '320px',
        width: 'calc(100% - 32px)',
      }}
    >
      <Show when={device()}>
        <div class="p-4">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <img 
                src={`/images/icon/${device().category || 'default'}.svg`}
                alt=""
                class="w-10 h-10"
              />
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">
                  {device().name}
                </h3>
                <span class={`text-sm ${
                  device().status === 'online' ? 'text-green-500' : 
                  device().status === 'offline' ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {t(`deviceStatus${device().status.charAt(0).toUpperCase() + device().status.slice(1)}`)}
                </span>
              </div>
            </div>
            <button
              onClick={props.onClose}
              class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span class="material-icons text-gray-500">close</span>
            </button>
          </div>

          <Show when={position()}>
            <div class="mt-4 space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">{t('positionFixTime')}:</span>
                <span class="text-gray-900 dark:text-white">
                  {formatTime(position().fixTime)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">{t('positionSpeed')}:</span>
                <span class="text-gray-900 dark:text-white">
                  {formatSpeed(position().speed, 'kmh')}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">{t('positionLatitude')}:</span>
                <span class="text-gray-900 dark:text-white">
                  {formatCoordinate(position().latitude, true)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">{t('positionLongitude')}:</span>
                <span class="text-gray-900 dark:text-white">
                  {formatCoordinate(position().longitude, false)}
                </span>
              </div>
              <Show when={position().address}>
                <div class="flex justify-between">
                  <span class="text-gray-500">{t('positionAddress')}:</span>
                  <span class="text-gray-900 dark:text-white text-right max-w-[200px]">
                    {position().address}
                  </span>
                </div>
              </Show>
            </div>

            <button
              onClick={() => setExpanded(!expanded())}
              class="mt-3 flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm hover:underline"
            >
              <span>{t('sharedAttributes')}</span>
              <span class="material-icons text-sm">
                {expanded() ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            <Show when={expanded()}>
              <div class="mt-2 space-y-1 max-h-40 overflow-y-auto">
                <For each={attributes()}>
                  {([key, value]) => (
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-500">{getAttributeLabel(key)}:</span>
                      <span class="text-gray-900 dark:text-white">{String(value)}</span>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </Show>
        </div>
      </Show>
    </div>
  );
}
