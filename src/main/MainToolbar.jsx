import { createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useTranslation } from '../common/components/LocalizationProvider';

export default function MainToolbar(props) {
  const navigate = useNavigate();
  const t = useTranslation();
  const [showFilter, setShowFilter] = createSignal(false);

  return (
    <div class="p-3 bg-white dark:bg-gray-800 shadow-sm">
      <div class="flex items-center gap-2">
        <button
          onClick={() => props.setDevicesOpen(!props.devicesOpen)}
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
        >
          <span class="material-icons">menu</span>
        </button>
        
        <div class="flex-1 relative">
          <input
            type="text"
            value={props.keyword}
            onInput={(e) => props.setKeyword(e.target.value)}
            placeholder={t('sharedSearch')}
            class="input w-full pr-10"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 material-icons text-gray-400">
            search
          </span>
        </div>
        
        <button
          onClick={() => setShowFilter(!showFilter())}
          class={`p-2 rounded-lg transition-colors ${
            showFilter() ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <span class="material-icons">filter_list</span>
        </button>
        
        <button
          onClick={() => navigate('/settings')}
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hidden sm:block"
        >
          <span class="material-icons">settings</span>
        </button>
      </div>
      
      <Show when={showFilter()}>
        <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 block mb-1">
              {t('sharedStatus')}
            </label>
            <div class="flex gap-2">
              {['online', 'offline', 'unknown'].map((status) => (
                <button
                  onClick={() => {
                    const statuses = props.filter.statuses.includes(status)
                      ? props.filter.statuses.filter((s) => s !== status)
                      : [...props.filter.statuses, status];
                    props.setFilter({ ...props.filter, statuses });
                  }}
                  class={`px-3 py-1 rounded-full text-sm transition-colors ${
                    props.filter.statuses.includes(status)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t(`deviceStatus${status.charAt(0).toUpperCase() + status.slice(1)}`)}
                </button>
              ))}
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {props.filteredDevices?.length || 0} {t('deviceTitle')}
            </span>
            <button
              onClick={() => props.setFilter({ statuses: [], groups: [] })}
              class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t('sharedReset')}
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
}
