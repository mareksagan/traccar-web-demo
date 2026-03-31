import { createSignal, createEffect, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useTranslation } from '../common/components/LocalizationProvider';
import NavBar from '../common/components/NavBar';

export default function GroupsPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const [groups, setGroups] = createSignal([]);

  createEffect(async () => {
    try {
      const response = await fetch('/api/groups');
      if (response.ok) {
        setGroups(await response.json());
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  });

  return (
    <div class="max-w-4xl mx-auto">
      <NavBar
        title={t('settingsGroups')}
        onBack={() => navigate('/')}
        actions={
          <button
            onClick={() => navigate('/settings/group')}
            class="btn btn-primary"
          >
            <span class="material-icons mr-2">add</span>
            {t('sharedAdd')}
          </button>
        }
      />

      <div class="mt-6 space-y-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <Show
            when={groups().length > 0}
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
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('sharedActionType')}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <For each={groups()}>
                  {(group) => (
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {group.name}
                      </td>
                      <td class="px-4 py-3 text-right">
                        <button
                          onClick={() => navigate(`/settings/group/${group.id}`)}
                          class="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                        >
                          <span class="material-icons">edit</span>
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
    </div>
  );
}
