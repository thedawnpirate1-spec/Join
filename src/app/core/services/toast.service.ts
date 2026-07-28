import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

/**
 * Service to manage global toast feedback notifications across the application.
 */
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  readonly toasts = signal<ToastMessage[]>([]);

  /**
   * Displays a new toast message.
   * @param message Text content of the notification
   * @param type Notification type ('success' | 'error' | 'info')
   * @param durationMs Visibility duration in milliseconds
   */
  show(message: string, type: ToastType = 'info', durationMs = 3000): void {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, message, type };

    this.toasts.update((current) => [...current, newToast]);

    setTimeout(() => {
      this.remove(id);
    }, durationMs);
  }

  showSuccess(message: string, durationMs = 3000): void {
    this.show(message, 'success', durationMs);
  }

  showError(message: string, durationMs = 4000): void {
    this.show(message, 'error', durationMs);
  }

  remove(id: string): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
