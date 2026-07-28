import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ToastService } from './toast.service';

/**
 * Global error handler capturing uncaught exceptions and notifying users via Toast notifications.
 */
@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandler implements ErrorHandler {
  private toastService = inject(ToastService);

  handleError(error: unknown): void {
    console.error('Unhandled Application Error:', error);

    let message = 'An unexpected error occurred. Please try again.';
    if (error instanceof Error && error.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    // Show clean user-friendly notification
    this.toastService.showError(message);
  }
}
