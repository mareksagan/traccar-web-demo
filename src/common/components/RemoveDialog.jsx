import { useTranslation } from './LocalizationProvider';

export default function RemoveDialog(props) {
  const t = useTranslation();

  if (!props.open) return null;

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('sharedRemoveConfirm')}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {t('sharedRemoveConfirmMessage')}
        </p>
        <div class="flex justify-end gap-3">
          <button
            onClick={props.onCancel}
            class="btn bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {t('sharedCancel')}
          </button>
          <button
            onClick={props.onConfirm}
            class="btn bg-red-600 text-white hover:bg-red-700"
          >
            {t('sharedRemove')}
          </button>
        </div>
      </div>
    </div>
  );
}
