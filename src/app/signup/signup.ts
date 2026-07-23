import { Component, inject, signal } from '@angular/core';
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

  isLoading = signal(false);

  nameError = signal('');
  emailError = signal('');
  passwordError = signal('');
  confirmPasswordError = signal('');
  privacyError = signal('');
  successMessage = signal('');
  showSuccessToast = signal(false);

  showPassword = signal(false);
  showConfirmPassword = signal(false);

  validateEmailField(): void {
    const trimmedEmail = this.email.trim();

    if (!trimmedEmail) {
      this.emailError.set('Please enter your email.');
      return;
    }

    if (!this.isValidEmail(trimmedEmail)) {
      this.emailError.set('Please enter a valid email address.');
      return;
    }

    this.emailError.set('');
  }

  onEmailChange(): void {
    if (!this.emailError()) {
      return;
    }

    this.validateEmailField();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  goBackToLogin(): void {
    this.router.navigateByUrl('/login');
  }

  async onSignup(): Promise<void> {
    this.clearErrors();

    if (!this.validateForm()) {
      return;
    }

    this.isLoading.set(true);

    try {
      await this.authService.signUp(this.email.trim(), this.password, this.name.trim());

      this.showSuccessToast.set(true);

      setTimeout(() => {
        this.router.navigateByUrl('/login');
      }, 1200);
    } catch (error) {
      this.emailError.set('Signup failed. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private validateForm(): boolean {
    let isValid = true;

    if (!this.name.trim()) {
      this.nameError.set('Please enter your name.');
      isValid = false;
    }

    if (!this.email.trim()) {
      this.emailError.set('Please enter your email.');
      isValid = false;
    } else if (!this.isValidEmail(this.email)) {
      this.emailError.set('Please enter a valid email address.');
      isValid = false;
    }

    if (!this.password.trim()) {
      this.passwordError.set('Please enter your password.');
      isValid = false;
    }

    if (!this.confirmPassword.trim()) {
      this.confirmPasswordError.set('Please confirm your password.');
      isValid = false;
    } else if (this.password !== this.confirmPassword) {
      this.confirmPasswordError.set("Your passwords don't match. Please try again.");
      isValid = false;
    }

    if (!this.acceptedPrivacy) {
      this.privacyError.set('Please accept the privacy policy.');
      isValid = false;
    }

    return isValid;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  clearErrors(): void {
    this.nameError.set('');
    this.emailError.set('');
    this.passwordError.set('');
    this.confirmPasswordError.set('');
    this.privacyError.set('');
    this.successMessage.set('');
  }

  clearNameError(): void {
    this.nameError.set('');
  }

  clearEmailError(): void {
    this.emailError.set('');
  }

  clearPasswordError(): void {
    this.passwordError.set('');

    if (!this.password) {
      this.showPassword.set(false);
    }
  }

  clearConfirmPasswordError(): void {
    this.confirmPasswordError.set('');

    if (!this.confirmPassword) {
      this.showConfirmPassword.set(false);
    }
  }

  clearPrivacyError(): void {
    this.privacyError.set('');
  }
}
