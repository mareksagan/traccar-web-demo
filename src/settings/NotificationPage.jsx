import { createSignal, createEffect } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { useTranslation } from '../common/components/LocalizationProvider';
import NavBar from '../common/components/NavBar';

export default function NotificationPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const [item, setItem] = createSignal({ type: 'alarm', always: false, attributes: {} });

  createEffect(async () => {
    if (params.id) {
      const res = await fetch(`/api/notifications/${params.id}`);
      if (res.ok) setItem(await res.json());
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = params.id ? `/api/notifications/${params.id}` : '/api/notifications';
    const method = params.id ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item()) });
    navigate('/settings/notifications');
  };

  return (
    <div class="max-w-2xl mx-auto">
      <NavBar title={params.id ? t('sharedNotification') : t('notificationAdd')} onBack={() => navigate('/settings/notifications')} />
      <form onSubmit={handleSubmit} class="mt-6 space-y-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm space-y-4">
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('sharedType')}</label><select value={item().type} onChange={(e) => setItem(p => ({ ...p, type: e.target.value }))} class="input"><option value="alarm">{t('alarmGeneral')}</option><option value="geofenceEnter">{t('eventGeofenceEnter')}</option><option value="geofenceExit">{t('eventGeofenceExit')}</option><option value="deviceOnline">{t('eventDeviceOnline')}</option><option value="deviceOffline">{t('eventDeviceOffline')}</option></select></div>
          <div><label class="flex items-center gap-2"><input type="checkbox" checked={item().always} onChange={(e) => setItem(p => ({ ...p, always: e.target.checked }))} /><span class="text-sm">{t('notificationAlways')}</span></label></div>
        </div>
        <div class="flex gap-3"><button type="button" onClick={() => navigate('/settings/notifications')} class="btn bg-gray-200 dark:bg-gray-700">{t('sharedCancel')}</button><button type="submit" class="btn btn-primary flex-1">{t('sharedSave')}</button></div>
      </form>
    </div>
  );
}
