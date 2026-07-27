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

  /**
   * Submits user credentials to perform authentication and navigate to the summary page.
   */
  validateEmail(): void {
    if (!this.email.trim()) {
      this.emailError.set('This field is required');
    } else {
      this.emailError.set('');
    }
  }

  validatePassword(): void {
    if (!this.password.trim()) {
      this.passwordError.set('This field is required');
    } else {
      this.passwordError.set('');
    }
  }

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

    this.isLoading.set(true);

    try {
      await this.authService.login(this.email.trim(), this.password);

      sessionStorage.setItem('justLoggedIn', 'true');

      await this.router.navigateByUrl('/summary');
    } catch (error: any) {
      this.loginFailed.set(true);
      const isRateLimit =
        error?.status === 429 ||
        error?.message?.toLowerCase().includes('rate limit') ||
        error?.message?.includes('429');
      if (isRateLimit) {
        this.passwordError.set('Too many requests. Please try again later.');
      } else {
        this.passwordError.set('Check your email and password. Please try again.');
      }
    } finally {
      this.isLoading.set(false);
    }
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

    this.isLoading.set(true);

    try {
      await this.authService.login(this.email.trim(), this.password);

      sessionStorage.setItem('justLoggedIn', 'true');

      await this.router.navigateByUrl('/summary');
    } catch (error: any) {
      this.loginFailed.set(true);
      const isRateLimit =
        error?.status === 429 ||
        error?.message?.toLowerCase().includes('rate limit') ||
        error?.message?.includes('429');
      if (isRateLimit) {
        this.passwordError.set('Too many requests. Please try again later.');
      } else {
        this.passwordError.set('Guest login failed. Please try again.');
      }
    } finally {
      this.isLoading.set(false);
    }
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
