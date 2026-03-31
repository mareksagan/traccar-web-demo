import { createSignal, createEffect } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { useTranslation } from '../common/components/LocalizationProvider';
import NavBar from '../common/components/NavBar';

export default function CalendarPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const [item, setItem] = createSignal({ name: '', data: '' });
  const [loading, setLoading] = createSignal(false);

  createEffect(async () => {
    if (params.id) {
      const res = await fetch(`/api/calendars/${params.id}`);
      if (res.ok) setItem(await res.json());
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const url = params.id ? `/api/calendars/${params.id}` : '/api/calendars';
    const method = params.id ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item()) });
    navigate('/settings/calendars');
  };

  return (
    <div class="max-w-2xl mx-auto">
      <NavBar title={params.id ? t('sharedCalendar') : t('calendarAdd')} onBack={() => navigate('/settings/calendars')} />
      <form onSubmit={handleSubmit} class="mt-6 space-y-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm space-y-4">
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('sharedName')} *</label><input type="text" value={item().name} onInput={(e) => setItem(p => ({ ...p, name: e.target.value }))} required class="input" /></div>
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('calendarData')}</label><textarea value={item().data || ''} onInput={(e) => setItem(p => ({ ...p, data: e.target.value }))} rows="10" class="input font-mono text-sm" /></div>
        </div>
        <div class="flex gap-3"><button type="button" onClick={() => navigate('/settings/calendars')} class="btn bg-gray-200 dark:bg-gray-700">{t('sharedCancel')}</button><button type="submit" disabled={!item().name || loading()} class="btn btn-primary flex-1">{t('sharedSave')}</button></div>
      </form>
    </div>
  );
}
