import { devices, devicesActions, session } from '../stores';
import { useTranslation } from '../common/components/LocalizationProvider';
import { formatTime, formatSpeed } from '../common/util/formatter';
import { getStatusColor } from '../common/util/colors';

export default function DeviceRow(props) {
  const t = useTranslation();
  const device = () => props.device;
  const position = () => session.positions[device().id];
  const selected = () => devices.selectedId === device().id;

  const handleClick = () => {
    devicesActions.selectId(device().id);
  };

  return (
    <div
      onClick={handleClick}
      class={`p-3 cursor-pointer transition-colors border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${
        selected() ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
      }`}
    >
      <div class="flex items-center gap-3">
        <div class="relative">
          <img
            src={`/images/icon/${device().category || 'default'}.svg`}
            alt=""
            class="w-10 h-10"
          />
          <div
            class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800"
            style={{ 'background-color': getStatusColor(device().status) }}
          />
        </div>
        
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <h4 class="font-medium text-gray-900 dark:text-white truncate">
              {device().name}
            </h4>
            {position() && (
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {formatSpeed(position().speed, 'kmh')}
              </span>
            )}
          </div>
          
          <div class="flex items-center justify-between mt-1">
            <span class={`text-xs ${
              device().status === 'online' ? 'text-green-600 dark:text-green-400' :
              device().status === 'offline' ? 'text-red-600 dark:text-red-400' :
              'text-gray-500 dark:text-gray-400'
            }`}>
              {t(`deviceStatus${device().status.charAt(0).toUpperCase() + device().status.slice(1)}`)}
            </span>
            {device().lastUpdate && (
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(device().lastUpdate, 'HH:mm:ss')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
