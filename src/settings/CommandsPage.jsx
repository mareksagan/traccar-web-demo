import { createSignal, createEffect, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useTranslation } from '../common/components/LocalizationProvider';
import NavBar from '../common/components/NavBar';

export default function CommandsPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = createSignal([]);

  createEffect(async () => {
    try { const res = await fetch('/api/commands'); if (res.ok) setItems(await res.json()); } catch (e) {}
  });

  return (
    <div class="max-w-4xl mx-auto">
      <NavBar title={t('sharedCommands')} onBack={() => navigate('/')} 
        actions={<button onClick={() => navigate('/settings/command')} class="btn btn-primary"><span class="material-icons mr-2">add</span>{t('sharedAdd')}</button>} />
      <div class="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <Show when={items().length > 0} fallback={<div class="p-8 text-center text-gray-500">{t('sharedNoData')}</div>}>
          <table class="w-full"><thead class="bg-gray-50 dark:bg-gray-700"><tr><th class="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('sharedDescription')}</th><th class="px-4 py-3 text-left">{t('commandType')}</th><th class="px-4 py-3 text-right">{t('sharedActionType')}</th></tr></thead>
          <tbody class="divide-y"><For each={items()}>{(item) => <tr class="hover:bg-gray-50 dark:hover:bg-gray-800"><td class="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.description || item.type}</td><td class="px-4 py-3 text-gray-600 dark:text-gray-400">{item.type}</td><td class="px-4 py-3 text-right"><button onClick={() => navigate(`/settings/command/${item.id}`)} class="p-1 text-blue-600 hover:bg-blue-50 rounded"><span class="material-icons">edit</span></button></td></tr>}</For></tbody></table>
        </Show>
      </div>
    </div>
  );
}
