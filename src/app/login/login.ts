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
  errorMessage = signal('');
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
  async onLogin(): Promise<void> {
    this.errorMessage.set('');
    this.loginFailed.set(false);

    if (!this.email.trim() || !this.password.trim()) {
      this.loginFailed.set(true);
      this.errorMessage.set('Please enter email and password.');
      return;
    }

    this.isLoading.set(true);

    try {
      await this.authService.login(this.email.trim(), this.password);

      sessionStorage.setItem('justLoggedIn', 'true');

      await this.router.navigateByUrl('/summary');
    } catch (error) {
      this.loginFailed.set(true);
      this.errorMessage.set('Check your email and password. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Performs authentication using predefined guest credentials.
   */
  async onGuestLogin(): Promise<void> {
    this.errorMessage.set('');
    this.loginFailed.set(false);

    this.email = 'guest@guest.com';
    this.password = '123456';

    this.isLoading.set(true);

    try {
      await this.authService.login(this.email.trim(), this.password);

      sessionStorage.setItem('justLoggedIn', 'true');

      await this.router.navigateByUrl('/summary');
    } catch (error) {
      this.loginFailed.set(true);
      this.errorMessage.set('Guest login failed. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Clears any active error state for login form inputs.
   */
  clearLoginError(): void {
    this.errorMessage.set('');
    this.loginFailed.set(false);
  }

  /**
   * Navigates the user to the signup route.
   */
  goToSignup(): void {
    this.router.navigateByUrl('/signup');
  }
}
