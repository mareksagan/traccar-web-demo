export default function SelectField(props) {
  return (
    <div class={props.class}>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {props.label}
      </label>
      <select
        value={props.value || ''}
        onChange={(e) => props.onChange?.(e.target.value)}
        disabled={props.disabled}
        class="input"
      >
        <For each={props.options}>
          {(option) => (
            <option value={option.value || option}>
              {option.label || option}
            </option>
          )}
        </For>
      </select>
    </div>
  );
}
