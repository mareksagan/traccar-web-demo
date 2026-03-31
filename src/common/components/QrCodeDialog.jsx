import { createSignal, createEffect, Show } from 'solid-js';
import QRCode from 'qrcode';
import { useTranslation } from './LocalizationProvider';

export default function QrCodeDialog(props) {
  const t = useTranslation();
  const [qrDataUrl, setQrDataUrl] = createSignal('');

  createEffect(async () => {
    if (props.open) {
      try {
        const url = await QRCode.toDataURL(window.location.origin, { width: 192 });
        setQrDataUrl(url);
      } catch (e) {
        console.error('Failed to generate QR code:', e);
      }
    }
  });

  if (!props.open) return null;

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {t('loginScanQrCode')}
          </h2>
          <button
            onClick={props.onClose}
            class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="flex justify-center p-4 bg-white rounded">
          <Show when={qrDataUrl()} fallback={<div class="w-48 h-48 bg-gray-200 animate-pulse" />}>
            <img src={qrDataUrl()} alt="QR Code" width="192" height="192" />
          </Show>
        </div>
        <p class="text-center text-gray-600 dark:text-gray-400 mt-4">
          {window.location.origin}
        </p>
      </div>
    </div>
  );
}
