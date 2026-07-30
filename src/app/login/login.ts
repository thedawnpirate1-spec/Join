import { Component, inject, signal, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth-service';

/**
 * Component handling user authentication login and guest access.
 */
@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  showPassword = signal(false);
  emailError = signal('');
  passwordError = signal('');
  loginFailed = signal(false);
  isLoading = signal(false);
  playIntroAnimation = false;
  private introTimeoutId?: number;

  /** Plays the login intro animation once per browser session. */
  constructor() {
    const introPlayed = sessionStorage.getItem('loginIntroPlayed');

    if (!introPlayed) {
      this.playIntroAnimation = true;

      this.introTimeoutId = window.setTimeout(() => {
        sessionStorage.setItem('loginIntroPlayed', 'true');
      }, 1000);
    }
  }

  /**
   * Cleans up intro animation timeouts when destroying the component.
   */
  ngOnDestroy(): void {
    if (this.introTimeoutId) {
      clearTimeout(this.introTimeoutId);
    }
  }

  /**
   * Toggles the visibility state of the password input field.
   */
  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  /** Validates the email field, setting `emailError` if it is blank. */
  validateEmail(): void {
    if (!this.email.trim()) {
      this.emailError.set('This field is required');
    } else {
      this.emailError.set('');
    }
  }

  /** Validates the password field, setting `passwordError` if it is blank. */
  validatePassword(): void {
    if (!this.password.trim()) {
      this.passwordError.set('This field is required');
    } else {
      this.passwordError.set('');
    }
  }

  /**
   * Submits user credentials to perform authentication and navigate to the summary page.
   */
  async onLogin(): Promise<void> {
    this.emailError.set('');
    this.passwordError.set('');
    this.loginFailed.set(false);

    this.validateEmail();
    this.validatePassword();

    if (this.emailError() || this.passwordError()) {
      this.loginFailed.set(true);
      return;
    }

    await this.performLogin('Check your email and password. Please try again.');
  }

  /**
   * Performs authentication using predefined guest credentials.
   */
  async onGuestLogin(): Promise<void> {
    this.emailError.set('');
    this.passwordError.set('');
    this.loginFailed.set(false);

    this.email = 'guest@guest.com';
    this.password = '123456';

    await this.performLogin('Guest login failed. Please try again.');
  }

  /**
   * Authenticates with the current email/password and navigates to the summary page,
   * showing `failureMessage` (or a rate-limit message) if authentication fails.
   */
  private async performLogin(failureMessage: string): Promise<void> {
    this.isLoading.set(true);

    try {
      await this.authService.login(this.email.trim(), this.password);
      sessionStorage.setItem('justLoggedIn', 'true');
      await this.router.navigateByUrl('/summary');
    } catch (error: any) {
      this.loginFailed.set(true);
      this.passwordError.set(
        this.isRateLimitError(error)
          ? 'Too many requests. Please try again later.'
          : failureMessage,
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  /** Whether an auth error represents a rate-limit response. */
  private isRateLimitError(error: any): boolean {
    return (
      error?.status === 429 ||
      error?.message?.toLowerCase().includes('rate limit') ||
      error?.message?.includes('429')
    );
  }

  /**
   * Clears any active error state for login form inputs.
   */
  clearLoginError(): void {
    this.emailError.set('');
    this.passwordError.set('');
    this.loginFailed.set(false);
  }

  /**
   * Navigates the user to the signup route.
   */
  goToSignup(): void {
    this.router.navigateByUrl('/signup');
  }
}
