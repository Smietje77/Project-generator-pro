/**
 * Button state management utility for consistent loading states
 */

export interface ButtonStateManager {
  setLoading: (text?: string) => void;
  setSuccess: (text?: string, duration?: number) => void;
  setError: (text?: string, duration?: number) => void;
  reset: () => void;
  isLoading: () => boolean;
}

/**
 * Create a button state manager for a button element
 */
export function createButtonState(button: HTMLButtonElement | HTMLElement | null, originalText?: string): ButtonStateManager {
  if (!button) {
    // Return no-op manager if button doesn't exist
    return {
      setLoading: () => {},
      setSuccess: () => {},
      setError: () => {},
      reset: () => {},
      isLoading: () => false
    };
  }

  const defaultText = originalText || button.textContent || 'Submit';
  let loading = false;

  return {
    setLoading(text: string = 'Loading...') {
      loading = true;
      button.setAttribute('disabled', 'true');
      button.innerHTML = `
        <span class="inline-flex items-center gap-2">
          <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>${text}</span>
        </span>
      `;
    },

    setSuccess(text: string = 'Success!', duration: number = 2000) {
      loading = false;
      button.removeAttribute('disabled');
      button.innerHTML = `
        <span class="inline-flex items-center gap-2">
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          <span>${text}</span>
        </span>
      `;

      if (duration > 0) {
        setTimeout(() => {
          button.textContent = defaultText;
        }, duration);
      }
    },

    setError(text: string = 'Error', duration: number = 3000) {
      loading = false;
      button.removeAttribute('disabled');
      button.innerHTML = `
        <span class="inline-flex items-center gap-2">
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          <span>${text}</span>
        </span>
      `;

      if (duration > 0) {
        setTimeout(() => {
          button.textContent = defaultText;
        }, duration);
      }
    },

    reset() {
      loading = false;
      button.removeAttribute('disabled');
      button.textContent = defaultText;
    },

    isLoading() {
      return loading;
    }
  };
}

/**
 * Set multiple buttons to disabled state
 */
export function disableButtons(...buttons: (HTMLButtonElement | HTMLElement | null)[]) {
  buttons.forEach(button => {
    if (button) {
      button.setAttribute('disabled', 'true');
    }
  });
}

/**
 * Enable multiple buttons
 */
export function enableButtons(...buttons: (HTMLButtonElement | HTMLElement | null)[]) {
  buttons.forEach(button => {
    if (button) {
      button.removeAttribute('disabled');
    }
  });
}

/**
 * Create a loading spinner SVG element
 */
export function createSpinner(size: 'sm' | 'md' | 'lg' = 'md'): string {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return `
    <svg class="animate-spin ${sizeMap[size]}" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  `;
}
