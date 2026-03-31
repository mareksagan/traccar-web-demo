import { createSignal, createEffect } from 'solid-js';
import { session } from '../../stores';
import { useTranslation } from './LocalizationProvider';

export default function TermsDialog(props) {
  const t = useTranslation();
  const [terms, setTerms] = createSignal('');

  createEffect(async () => {
    if (props.open && session.server?.attributes?.termsUrl) {
      try {
        const response = await fetch(session.server.attributes.termsUrl);
        const text = await response.text();
        setTerms(text);
      } catch {
        setTerms('');
      }
    }
  });

  if (!props.open) return null;

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {t('loginTerms')}
          </h2>
        </div>
        
        <div class="flex-1 overflow-auto p-4">
          <div 
            class="prose dark:prose-invert max-w-none"
            innerHTML={terms()}
          />
        </div>
        
        <div class="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={props.onCancel}
            class="btn bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {t('sharedCancel')}
          </button>
          <button
            onClick={props.onAccept}
            class="btn btn-primary"
          >
            {t('sharedAccept')}
          </button>
        </div>
      </div>
    </div>
  );
}
