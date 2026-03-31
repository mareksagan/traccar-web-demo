import { errors, errorsActions } from '../../stores';
import { createEffect } from 'solid-js';

export default function ErrorHandler() {
  createEffect(() => {
    const errorList = errors.items;
    if (errorList.length > 0) {
      // Could show toast notifications here
      console.error('Error:', errorList[errorList.length - 1]);
    }
  });

  return null;
}
