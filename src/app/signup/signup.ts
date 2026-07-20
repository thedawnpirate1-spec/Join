import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth-service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  private authService = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  acceptedPrivacy = false;

  errorMessage = '';
  successMessage = '';
  isLoading = false;

  isSignupDisabled(): boolean {
    return (
      this.isLoading ||
      !this.name.trim() ||
      !this.email.trim() ||
      !this.password.trim() ||
      !this.confirmPassword.trim() ||
      !this.acceptedPrivacy
    );
  }

  async onSignup(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.name.trim()) {
      this.errorMessage = 'Please enter your name.';
      return;
    }

    if (!this.email.trim()) {
      this.errorMessage = 'Please enter your email.';
      return;
    }

    if (!this.password.trim()) {
      this.errorMessage = 'Please enter your password.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (!this.acceptedPrivacy) {
      this.errorMessage = 'Please accept the privacy policy.';
      return;
    }

    try {
      this.isLoading = true;

      await this.authService.signUp(this.email.trim(), this.password, this.name.trim());

      this.successMessage = 'You Signed Up successfully';

      setTimeout(() => {
        this.router.navigateByUrl('/login');
      }, 1200);
    } catch (error) {
      console.error('Signup error:', error);
      this.errorMessage = 'Signup failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
