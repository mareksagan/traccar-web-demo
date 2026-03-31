import { useNavigate, useLocation } from '@solidjs/router';
import { useTranslation } from './LocalizationProvider';
import { session } from '../../stores';

export default function SideNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useTranslation();

  const isActive = (path) => location.pathname.startsWith(path);

  const menuGroups = [
    {
      title: t('settingsUser'),
      items: [
        { path: '/settings/preferences', icon: 'tune', label: t('sharedPreferences') },
        ...(session.user?.administrator ? [
          { path: '/settings/server', icon: 'dns', label: t('settingsServer') },
          { path: '/settings/users', icon: 'people', label: t('settingsUsers') },
        ] : []),
      ],
    },
    {
      title: t('deviceTitle'),
      items: [
        { path: '/settings/devices', icon: 'devices', label: t('deviceTitle') },
        { path: '/settings/groups', icon: 'folder', label: t('settingsGroups') },
        { path: '/settings/drivers', icon: 'person', label: t('sharedDrivers') },
        { path: '/settings/calendars', icon: 'calendar_today', label: t('sharedCalendars') },
        { path: '/settings/maintenances', icon: 'build', label: t('sharedMaintenance') },
      ],
    },
    {
      title: t('sharedSettings'),
      items: [
        { path: '/settings/geofences', icon: 'fence', label: t('sharedGeofences') },
        { path: '/settings/notifications', icon: 'notifications', label: t('sharedNotifications') },
        { path: '/settings/commands', icon: 'send', label: t('sharedCommands') },
        { path: '/settings/attributes', icon: 'functions', label: t('sharedComputedAttributes') },
      ],
    },
  ];

  return (
    <div class="w-64 bg-white dark:bg-gray-800 h-full overflow-y-auto border-r border-gray-200 dark:border-gray-700">
      <div class="p-4">
        <div class="flex items-center gap-3 mb-6">
          <img src="/images/logo.svg" alt="Traccar" class="h-8" />
          <span class="font-semibold text-lg text-gray-900 dark:text-white">Traccar</span>
        </div>
        
        {menuGroups.map((group) => (
          <div class="mb-6">
            <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">
              {group.title}
            </h3>
            <nav class="space-y-1">
              {group.items.map((item) => (
                <button
                  onClick={() => navigate(item.path)}
                  class={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span class="material-icons text-lg">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        ))}
      </div>
    </div>
  );
}
