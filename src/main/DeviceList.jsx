import { For, Show, createSignal, createEffect } from 'solid-js';
import { devices } from '../stores';
import { useTranslation } from '../common/components/LocalizationProvider';
import DeviceRow from './DeviceRow';

export default function DeviceList(props) {
  const t = useTranslation();
  
  return (
    <div class="flex flex-col h-full bg-white dark:bg-gray-800 overflow-hidden">
      <div class="flex-1 overflow-y-auto">
        <Show
          when={props.devices?.length > 0}
          fallback={
            <div class="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
              {t('sharedNoData')}
            </div>
          }
        >
          <For each={props.devices}>
            {(device) => <DeviceRow device={device} />}
          </For>
        </Show>
      </div>
    </div>
  );
}
