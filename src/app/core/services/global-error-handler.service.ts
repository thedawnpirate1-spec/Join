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

  /**
   * Logs an uncaught error and shows a user-friendly toast notification for it.
   *
   * @param error The uncaught error, of unknown shape.
   */
  handleError(error: unknown): void {
    console.error('Unhandled Application Error:', error);
    this.toastService.showError(this.extractMessage(error));
  }

  /**
   * Extracts a displayable message from an unknown error value.
   *
   * @param error The uncaught error.
   * @returns An Error message, a string error, or a generic fallback.
   */
  private extractMessage(error: unknown): string {
    if (error instanceof Error && error.message) return error.message;
    if (typeof error === 'string') return error;
    return 'An unexpected error occurred. Please try again.';
  }
}
