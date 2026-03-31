import { createSignal, createEffect } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { useTranslation } from '../common/components/LocalizationProvider';
import NavBar from '../common/components/NavBar';

export default function CommandPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const [item, setItem] = createSignal({ description: '', type: 'custom', attributes: {} });

  createEffect(async () => {
    if (params.id) {
      const res = await fetch(`/api/commands/${params.id}`);
      if (res.ok) setItem(await res.json());
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = params.id ? `/api/commands/${params.id}` : '/api/commands';
    const method = params.id ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item()) });
    navigate('/settings/commands');
  };

  return (
    <div class="max-w-2xl mx-auto">
      <NavBar title={params.id ? t('sharedCommand') : t('commandAdd')} onBack={() => navigate('/settings/commands')} />
      <form onSubmit={handleSubmit} class="mt-6 space-y-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm space-y-4">
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('sharedDescription')}</label><input type="text" value={item().description || ''} onInput={(e) => setItem(p => ({ ...p, description: e.target.value }))} class="input" /></div>
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('commandType')} *</label><select value={item().type} onChange={(e) => setItem(p => ({ ...p, type: e.target.value }))} class="input"><option value="custom">{t('commandCustom')}</option><option value="positionPeriodic">{t('commandPositionPeriodic')}</option><option value="setTimezone">{t('commandSetTimezone')}</option><option value="rebootDevice">{t('commandRebootDevice')}</option></select></div>
        </div>
        <div class="flex gap-3"><button type="button" onClick={() => navigate('/settings/commands')} class="btn bg-gray-200 dark:bg-gray-700">{t('sharedCancel')}</button><button type="submit" class="btn btn-primary flex-1">{t('sharedSave')}</button></div>
      </form>
    </div>
  );
}
