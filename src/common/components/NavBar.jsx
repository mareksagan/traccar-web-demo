import { useNavigate } from '@solidjs/router';
import { useTranslation } from './LocalizationProvider';

export default function NavBar(props) {
  const navigate = useNavigate();
  const t = useTranslation();

  return (
    <div class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md">
      <div class="flex items-center gap-4">
        {props.onBack && (
          <button
            onClick={props.onBack}
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span class="material-icons">arrow_back</span>
          </button>
        )}
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          {props.title}
        </h1>
      </div>
      <div class="flex items-center gap-2">
        {props.actions}
      </div>
    </div>
  );
}
