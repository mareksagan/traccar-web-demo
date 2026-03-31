import { useNavigate, useLocation } from '@solidjs/router';
import { useTranslation } from '../common/components/LocalizationProvider';
import BottomMenu from '../common/components/BottomMenu';

export default function ReportsLayout(props) {
  const t = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const reportTypes = [
    { path: '/reports/route', icon: 'route', label: t('reportRoute') },
    { path: '/reports/trips', icon: 'directions_car', label: t('reportTrips') },
    { path: '/reports/stops', icon: 'local_parking', label: t('reportStops') },
    { path: '/reports/summary', icon: 'summarize', label: t('reportSummary') },
    { path: '/reports/events', icon: 'event', label: t('reportEvents') },
    { path: '/reports/chart', icon: 'show_chart', label: t('reportChart') },
    { path: '/reports/statistics', icon: 'bar_chart', label: t('reportStatistics') },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div class="h-full flex flex-col">
      <div class="hidden md:flex bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div class="flex px-4">
          {reportTypes.map((type) => (
            <button
              onClick={() => navigate(type.path)}
              class={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive(type.path)
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span class="material-icons text-lg">{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div class="flex-1 overflow-hidden">
        {props.children}
      </div>

      <div class="md:hidden">
        <BottomMenu />
      </div>
    </div>
  );
}
