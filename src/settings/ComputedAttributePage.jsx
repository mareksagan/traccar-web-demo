import { createSignal, createEffect } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { useTranslation } from '../common/components/LocalizationProvider';
import NavBar from '../common/components/NavBar';

export default function ComputedAttributePage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const [item, setItem] = createSignal({ description: '', attribute: '', expression: '', type: 'number' });

  createEffect(async () => {
    if (params.id) {
      const res = await fetch(`/api/attributes/computed/${params.id}`);
      if (res.ok) setItem(await res.json());
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = params.id ? `/api/attributes/computed/${params.id}` : '/api/attributes/computed';
    const method = params.id ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item()) });
    navigate('/settings/attributes');
  };

  return (
    <div class="max-w-2xl mx-auto">
      <NavBar title={params.id ? t('sharedComputedAttribute') : t('computedAttributeAdd')} onBack={() => navigate('/settings/attributes')} />
      <form onSubmit={handleSubmit} class="mt-6 space-y-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm space-y-4">
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('sharedDescription')}</label><input type="text" value={item().description} onInput={(e) => setItem(p => ({ ...p, description: e.target.value }))} class="input" /></div>
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('sharedAttribute')} *</label><input type="text" value={item().attribute} onInput={(e) => setItem(p => ({ ...p, attribute: e.target.value }))} required class="input" /></div>
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('sharedExpression')} *</label><textarea value={item().expression} onInput={(e) => setItem(p => ({ ...p, expression: e.target.value }))} required rows="3" class="input font-mono text-sm" /></div>
        </div>
        <div class="flex gap-3"><button type="button" onClick={() => navigate('/settings/attributes')} class="btn bg-gray-200 dark:bg-gray-700">{t('sharedCancel')}</button><button type="submit" class="btn btn-primary flex-1">{t('sharedSave')}</button></div>
      </form>
    </div>
  );
}
