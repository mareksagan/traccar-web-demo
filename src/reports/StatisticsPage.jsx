import { createSignal, createEffect, For, Show } from 'solid-js';
import { useTranslation } from '../common/components/LocalizationProvider';
import NavBar from '../common/components/NavBar';

export default function StatisticsPage() {
  const t = useTranslation();
  const [statistics, setStatistics] = createSignal(null);
  const [loading, setLoading] = createSignal(true);

  createEffect(async () => {
    try {
      const response = await fetch('/api/statistics');
      if (response.ok) {
        setStatistics(await response.json());
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  });

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div class="p-4 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {t('reportStatistics')}
      </h1>

      <Show when={loading()}>
        <div class="text-center py-8">{t('sharedLoading')}</div>
      </Show>

      <Show when={!loading() && statistics()}>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t('statisticsActiveDevices')}
            </h3>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {statistics()?.activeDevices || 0}
            </p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t('statisticsActiveUsers')}
            </h3>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {statistics()?.activeUsers || 0}
            </p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t('statisticsMessagesReceived')}
            </h3>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {statistics()?.messagesReceived?.toLocaleString() || 0}
            </p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t('statisticsMessagesStored')}
            </h3>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {statistics()?.messagesStored?.toLocaleString() || 0}
            </p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t('statisticsAttributes')}
            </h3>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatBytes(statistics()?.attributes || 0)}
            </p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t('statisticsPositions')}
            </h3>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {statistics()?.positions?.toLocaleString() || 0}
            </p>
          </div>
        </div>
      </Show>
    </div>
  );
}
