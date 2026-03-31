import { useNavigate, useLocation } from '@solidjs/router';
import { useTranslation } from './LocalizationProvider';
import { session, devices, devicesActions } from '../../stores';

export default function BottomMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useTranslation();

  const isActive = (path) => location.pathname.startsWith(path);

  const menuItems = [
    { path: '/', icon: 'map', label: t('mapTitle') },
    { path: '/reports', icon: 'assessment', label: t('reportTitle') },
    { path: '/settings', icon: 'settings', label: t('settingsTitle') },
    { path: '/geofences', icon: 'fence', label: t('sharedGeofences') },
  ];

  return (
    <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 z-50">
      <div class="flex justify-around items-center h-14">
        {menuItems.map((item) => (
          <button
            onClick={() => navigate(item.path)}
            class={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive(item.path)
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span class="material-icons text-xl">{item.icon}</span>
            <span class="text-xs mt-0.5">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
