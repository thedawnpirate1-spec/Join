import { Component, inject } from '@angular/core';
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
  errorMessage = '';
  isLoading = false;

  async onLogin(): Promise<void> {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter email and password.';
      return;
    }

    try {
      this.isLoading = true;

      await this.authService.login(this.email.trim(), this.password);
      sessionStorage.setItem('justLoggedIn', 'true');

      await this.router.navigateByUrl('/summary');
    } catch (error) {
      console.error('Login error:', error);
      this.errorMessage = 'Login failed. Please check your email and password.';
    } finally {
      this.isLoading = false;
    }
  }

  async onGuestLogin(): Promise<void> {
    this.errorMessage = '';

    this.email = 'guest@guest.com';
    this.password = '123456';
    try {
      this.isLoading = true;

      await this.authService.login(this.email.trim(), this.password);
      sessionStorage.setItem('justLoggedIn', 'true');

      await this.router.navigateByUrl('/summary');
    } catch (error) {
      console.error('Login error:', error);
      this.errorMessage = 'Login failed. Please check your email and password.';
    } finally {
      this.isLoading = false;
    }
  }

  goToSignup(): void {
    console.log('signup');
    this.router.navigateByUrl('/signup');
  }
}
