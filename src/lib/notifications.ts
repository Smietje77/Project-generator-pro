/**
 * Notification system for better error handling and user feedback
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  type: NotificationType;
  message: string;
  duration?: number; // Duration in milliseconds (0 = persistent)
  dismissible?: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
}

class NotificationManager {
  private container: HTMLElement | null = null;
  private notifications: Map<string, HTMLElement> = new Map();

  /**
   * Initialize the notification container
   */
  private ensureContainer(): HTMLElement {
    if (!this.container) {
      // Check if container already exists
      this.container = document.getElementById('notification-container');

      if (!this.container) {
        // Create container
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none';
        this.container.style.maxWidth = '400px';
        document.body.appendChild(this.container);
      }
    }
    return this.container;
  }

  /**
   * Show a notification
   */
  show(options: NotificationOptions): string {
    const container = this.ensureContainer();
    const id = `notification-${Date.now()}-${Math.random()}`;

    // Create notification element
    const notification = document.createElement('div');
    notification.id = id;
    notification.className = this.getNotificationClasses(options.type);
    notification.style.cssText = 'pointer-events: auto; animation: slideIn 0.3s ease-out;';

    // Build notification content
    const content = document.createElement('div');
    content.className = 'flex items-start gap-3';

    // Icon
    const icon = document.createElement('span');
    icon.className = 'flex-shrink-0 mt-0.5';
    icon.innerHTML = this.getIcon(options.type);
    content.appendChild(icon);

    // Message container
    const messageContainer = document.createElement('div');
    messageContainer.className = 'flex-1';

    // Message text
    const message = document.createElement('p');
    message.className = 'text-sm';
    message.textContent = options.message;
    messageContainer.appendChild(message);

    // Action button if provided
    if (options.action) {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'mt-2 text-xs underline hover:no-underline focus:outline-none';
      actionBtn.textContent = options.action.label;
      actionBtn.onclick = () => {
        options.action!.callback();
        this.dismiss(id);
      };
      messageContainer.appendChild(actionBtn);
    }

    content.appendChild(messageContainer);

    // Dismiss button if dismissible
    if (options.dismissible !== false) {
      const dismissBtn = document.createElement('button');
      dismissBtn.className = 'flex-shrink-0 ml-2 hover:opacity-75 focus:outline-none';
      dismissBtn.innerHTML = '&times;';
      dismissBtn.style.fontSize = '1.5rem';
      dismissBtn.onclick = () => this.dismiss(id);
      content.appendChild(dismissBtn);
    }

    notification.appendChild(content);
    container.appendChild(notification);
    this.notifications.set(id, notification);

    // Auto-dismiss after duration (default 5 seconds, unless 0)
    const duration = options.duration !== undefined ? options.duration : 5000;
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }

    return id;
  }

  /**
   * Dismiss a notification
   */
  dismiss(id: string): void {
    const notification = this.notifications.get(id);
    if (notification) {
      // Add fade out animation
      notification.style.animation = 'slideOut 0.3s ease-in';
      notification.style.animationFillMode = 'forwards';

      setTimeout(() => {
        notification.remove();
        this.notifications.delete(id);
      }, 300);
    }
  }

  /**
   * Dismiss all notifications
   */
  dismissAll(): void {
    this.notifications.forEach((_, id) => this.dismiss(id));
  }

  /**
   * Get notification classes based on type
   */
  private getNotificationClasses(type: NotificationType): string {
    const baseClasses = 'rounded-lg p-4 shadow-lg mb-2 transform transition-all duration-300';

    const typeClasses = {
      success: 'bg-green-50 text-green-900 border border-green-200',
      error: 'bg-red-50 text-red-900 border border-red-200',
      warning: 'bg-yellow-50 text-yellow-900 border border-yellow-200',
      info: 'bg-blue-50 text-blue-900 border border-blue-200'
    };

    return `${baseClasses} ${typeClasses[type]}`;
  }

  /**
   * Get icon HTML based on type
   */
  private getIcon(type: NotificationType): string {
    const icons = {
      success: '<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>',
      error: '<svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>',
      warning: '<svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>',
      info: '<svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>'
    };

    return icons[type];
  }
}

// Create singleton instance
const notificationManager = new NotificationManager();

/**
 * Show a success notification
 */
export function showSuccess(message: string, options?: Partial<NotificationOptions>): string {
  return notificationManager.show({
    type: 'success',
    message,
    ...options
  });
}

/**
 * Show an error notification
 */
export function showError(message: string, options?: Partial<NotificationOptions>): string {
  return notificationManager.show({
    type: 'error',
    message,
    duration: 0, // Errors persist by default
    ...options
  });
}

/**
 * Show a warning notification
 */
export function showWarning(message: string, options?: Partial<NotificationOptions>): string {
  return notificationManager.show({
    type: 'warning',
    message,
    ...options
  });
}

/**
 * Show an info notification
 */
export function showInfo(message: string, options?: Partial<NotificationOptions>): string {
  return notificationManager.show({
    type: 'info',
    message,
    ...options
  });
}

/**
 * Dismiss a notification by ID
 */
export function dismissNotification(id: string): void {
  notificationManager.dismiss(id);
}

/**
 * Dismiss all notifications
 */
export function dismissAllNotifications(): void {
  notificationManager.dismissAll();
}

/**
 * Add animation styles to document
 */
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// Export the notification manager for advanced usage
export { notificationManager };