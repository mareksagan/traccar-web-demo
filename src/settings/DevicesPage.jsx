import { createSignal, createEffect, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { devices, devicesActions } from '../stores';
import { useTranslation } from '../common/components/LocalizationProvider';
import NavBar from '../common/components/NavBar';
import RemoveDialog from '../common/components/RemoveDialog';

export default function DevicesPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = createSignal('');
  const [deleteId, setDeleteId] = createSignal(null);

  createEffect(async () => {
    try {
      const response = await fetch('/api/devices');
      if (response.ok) {
        devicesActions.refresh(await response.json());
      }
    } catch (error) {
      console.error('Failed to load devices:', error);
    }
  });

  const filteredDevices = () => {
    const allDevices = Object.values(devices.items);
    if (!search()) return allDevices;
    const lowerSearch = search().toLowerCase();
    return allDevices.filter((d) =>
      d.name.toLowerCase().includes(lowerSearch) ||
      d.uniqueId.toLowerCase().includes(lowerSearch)
    );
  };

  const handleDelete = async () => {
    if (!deleteId()) return;
    try {
      const response = await fetch(`/api/devices/${deleteId()}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        devicesActions.remove(deleteId());
      }
    } catch (error) {
      console.error('Failed to delete device:', error);
    }
    setDeleteId(null);
  };

  return (
    <div class="max-w-4xl mx-auto">
      <NavBar
        title={t('deviceTitle')}
        onBack={() => navigate('/')}
        actions={
          <button
            onClick={() => navigate('/settings/device')}
            class="btn btn-primary"
          >
            <span class="material-icons mr-2">add</span>
            {t('sharedAdd')}
          </button>
        }
      />

      <div class="mt-6 space-y-4">
        <div class="relative">
          <input
            type="text"
            value={search()}
            onInput={(e) => setSearch(e.target.value)}
            placeholder={t('sharedSearch')}
            class="input w-full pr-10"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 material-icons text-gray-400">
            search
          </span>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <Show
            when={filteredDevices().length > 0}
            fallback={
              <div class="p-8 text-center text-gray-500 dark:text-gray-400">
                {t('sharedNoData')}
              </div>
            }
          >
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('sharedName')}
                  </th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('deviceIdentifier')}
                  </th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('sharedStatus')}
                  </th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('sharedActionType')}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <For each={filteredDevices()}>
                  {(device) => (
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-2">
                          <img
                            src={`/images/icon/${device.category || 'default'}.svg`}
                            alt=""
                            class="w-6 h-6"
                          />
                          <span class="font-medium text-gray-900 dark:text-white">
                            {device.name}
                          </span>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {device.uniqueId}
                      </td>
                      <td class="px-4 py-3">
                        <span class={`inline-flex px-2 py-1 text-xs rounded-full ${
                          device.status === 'online'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : device.status === 'offline'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {t(`deviceStatus${device.status.charAt(0).toUpperCase() + device.status.slice(1)}`)}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-right">
                        <button
                          onClick={() => navigate(`/settings/device/${device.id}`)}
                          class="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                        >
                          <span class="material-icons">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteId(device.id)}
                          class="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded ml-1"
                        >
                          <span class="material-icons">delete</span>
                        </button>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </Show>
        </div>
      </div>

      <RemoveDialog
        open={deleteId() !== null}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
