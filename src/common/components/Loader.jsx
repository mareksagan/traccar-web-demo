import { createSignal, onMount } from 'solid-js';

export default function Loader() {
  const [show, setShow] = createSignal(false);

  onMount(() => {
    const timer = setTimeout(() => setShow(true), 500);
    return () => clearTimeout(timer);
  });

  return (
    <div class="flex items-center justify-center h-full w-full">
      {show() && (
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      )}
    </div>
  );
}
