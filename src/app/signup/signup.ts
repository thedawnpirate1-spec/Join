import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth-service';

/**
 * Component handling user registration, input validation, and privacy policy acceptance.
 */
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
  isCheckboxHovered = false;

  get checkboxIconSrc(): string {
    if (this.acceptedPrivacy) {
      return this.isCheckboxHovered
        ? 'Assets/icons/checkbox-checked-hover.svg'
        : 'Assets/icons/checkbox-checked.svg';
    }
    return this.isCheckboxHovered
      ? 'Assets/icons/checkbox-default-hover.svg'
      : 'Assets/icons/checkbox-default.svg';
  }

  validateEmailField(): void {
    const trimmedEmail = this.email.trim();

    if (!trimmedEmail) {
      this.emailError.set('This field is required');
      return;
    }

    if (!this.isValidEmail(trimmedEmail)) {
      this.emailError.set('Please enter a valid email address.');
      return;
    }

    this.emailError.set('');
  }

  validateNameField(): void {
    if (!this.name.trim()) {
      this.nameError.set('This field is required');
    } else {
      this.nameError.set('');
    }
  }

  validatePasswordField(): void {
    const trimmedPassword = this.password.trim();
    if (!trimmedPassword) {
      this.passwordError.set('This field is required');
    } else if (trimmedPassword.length < 6) {
      this.passwordError.set('Password must be at least 6 characters long.');
    } else {
      this.passwordError.set('');
    }
  }

  validateConfirmPasswordField(): void {
    if (!this.confirmPassword.trim()) {
      this.confirmPasswordError.set('This field is required');
    } else if (this.password !== this.confirmPassword) {
      this.confirmPasswordError.set("Your passwords don't match. Please try again.");
    } else {
      this.confirmPasswordError.set('');
    }
  }

  onEmailChange(): void {
    if (!this.emailError()) {
      return;
    }

    this.validateEmailField();
  }

  onPasswordChange(): void {
    if (this.password.length > 0 || this.passwordError()) {
      this.validatePasswordField();
    } else {
      this.passwordError.set('');
    }
  }

  /**
   * Toggles visibility of the primary password input field.
   */
  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  /**
   * Toggles visibility of the confirm password input field.
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  /**
   * Navigates the user back to the login view.
   */
  goBackToLogin(): void {
    this.router.navigateByUrl('/login');
  }

  /**
   * Submits the signup form to register a new user account upon successful validation.
   */
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
    } catch (error: any) {
      const isDuplicate =
        error?.message === 'EMAIL_EXISTS' ||
        error?.message?.toLowerCase().includes('already registered') ||
        error?.message?.toLowerCase().includes('already in use') ||
        error?.message?.toLowerCase().includes('user already exists');

      const isRateLimit =
        error?.status === 429 ||
        error?.message?.toLowerCase().includes('rate limit') ||
        error?.message?.includes('429');

      if (isDuplicate) {
        this.emailError.set('This email address is already registered.');
      } else if (isRateLimit) {
        this.emailError.set('Too many requests. Please try again later.');
      } else {
        this.emailError.set('Signup failed. Please try again.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  private validateForm(): boolean {
    let isValid = true;

    if (!this.name.trim()) {
      this.nameError.set('This field is required');
      isValid = false;
    }

    if (!this.email.trim()) {
      this.emailError.set('This field is required');
      isValid = false;
    } else if (!this.isValidEmail(this.email)) {
      this.emailError.set('Please enter a valid email address.');
      isValid = false;
    }

    if (!this.password.trim()) {
      this.passwordError.set('This field is required');
      isValid = false;
    } else if (this.password.trim().length < 6) {
      this.passwordError.set('Password must be at least 6 characters long.');
      isValid = false;
    }

    if (!this.confirmPassword.trim()) {
      this.confirmPasswordError.set('This field is required');
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
    return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email.trim());
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
