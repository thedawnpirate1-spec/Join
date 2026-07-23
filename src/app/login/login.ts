import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth-service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';

  errorMessage = signal('');
  loginFailed = signal(false);
  isLoading = signal(false);

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

  clearLoginError(): void {
    this.errorMessage.set('');
    this.loginFailed.set(false);
  }

  goToSignup(): void {
    this.router.navigateByUrl('/signup');
  }
}
