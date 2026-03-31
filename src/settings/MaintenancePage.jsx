import { createSignal, createEffect } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { useTranslation } from '../common/components/LocalizationProvider';
import NavBar from '../common/components/NavBar';

export default function MaintenancePage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const [item, setItem] = createSignal({ name: '', type: 'odometer', start: 0, period: 0 });

  createEffect(async () => {
    if (params.id) {
      const res = await fetch(`/api/maintenance/${params.id}`);
      if (res.ok) setItem(await res.json());
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = params.id ? `/api/maintenance/${params.id}` : '/api/maintenance';
    const method = params.id ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item()) });
    navigate('/settings/maintenances');
  };

  return (
    <div class="max-w-2xl mx-auto">
      <NavBar title={params.id ? t('sharedMaintenance') : t('maintenanceAdd')} onBack={() => navigate('/settings/maintenances')} />
      <form onSubmit={handleSubmit} class="mt-6 space-y-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm space-y-4">
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('sharedName')} *</label><input type="text" value={item().name} onInput={(e) => setItem(p => ({ ...p, name: e.target.value }))} required class="input" /></div>
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('maintenanceType')}</label><select value={item().type} onChange={(e) => setItem(p => ({ ...p, type: e.target.value }))} class="input"><option value="odometer">{t('maintenanceOdometer')}</option><option value="hours">{t('maintenanceHours')}</option></select></div>
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('maintenanceStart')}</label><input type="number" value={item().start} onInput={(e) => setItem(p => ({ ...p, start: parseFloat(e.target.value) }))} class="input" /></div>
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('maintenancePeriod')}</label><input type="number" value={item().period} onInput={(e) => setItem(p => ({ ...p, period: parseFloat(e.target.value) }))} class="input" /></div>
        </div>
        <div class="flex gap-3"><button type="button" onClick={() => navigate('/settings/maintenances')} class="btn bg-gray-200 dark:bg-gray-700">{t('sharedCancel')}</button><button type="submit" class="btn btn-primary flex-1">{t('sharedSave')}</button></div>
      </form>
    </div>
  );
}
