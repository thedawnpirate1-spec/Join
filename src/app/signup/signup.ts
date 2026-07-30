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

  /** Icon path for the privacy-policy checkbox, reflecting checked and hover state. */
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

  /** Validates the email field, setting `emailError` if blank or malformed. */
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

  /** Validates the name field, setting `nameError` if blank. */
  validateNameField(): void {
    if (!this.name.trim()) {
      this.nameError.set('This field is required');
    } else {
      this.nameError.set('');
    }
  }

  /** Validates the password field, setting `passwordError` if blank or too short. */
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

  /** Validates the confirm-password field, setting `confirmPasswordError` if blank or mismatched. */
  validateConfirmPasswordField(): void {
    if (!this.confirmPassword.trim()) {
      this.confirmPasswordError.set('This field is required');
    } else if (this.password !== this.confirmPassword) {
      this.confirmPasswordError.set("Your passwords don't match. Please try again.");
    } else {
      this.confirmPasswordError.set('');
    }
  }

  /** Re-validates the email field live, but only once it already has an error to clear. */
  onEmailChange(): void {
    if (!this.emailError()) {
      return;
    }

    this.validateEmailField();
  }

  /** Re-validates the password field live once the user has typed or it already has an error. */
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
      setTimeout(() => this.router.navigateByUrl('/login'), 1200);
    } catch (error: any) {
      this.emailError.set(this.resolveSignupErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  /** Maps a signup failure to a user-facing message, distinguishing duplicate-email and rate-limit cases. */
  private resolveSignupErrorMessage(error: any): string {
    if (this.isDuplicateEmailError(error)) return 'This email address is already registered.';
    if (this.isRateLimitError(error)) return 'Too many requests. Please try again later.';
    return 'Signup failed. Please try again.';
  }

  /** Whether a signup error indicates the email is already registered. */
  private isDuplicateEmailError(error: any): boolean {
    return (
      error?.message === 'EMAIL_EXISTS' ||
      error?.message?.toLowerCase().includes('already registered') ||
      error?.message?.toLowerCase().includes('already in use') ||
      error?.message?.toLowerCase().includes('user already exists')
    );
  }

  /** Whether an auth error represents a rate-limit response. */
  private isRateLimitError(error: any): boolean {
    return (
      error?.status === 429 ||
      error?.message?.toLowerCase().includes('rate limit') ||
      error?.message?.includes('429')
    );
  }

  /** Validates all signup fields, including privacy acceptance, returning overall validity. */
  private validateForm(): boolean {
    this.validateNameField();
    this.validateEmailField();
    this.validatePasswordField();
    this.validateConfirmPasswordField();
    this.validatePrivacyAcceptance();

    return !(
      this.nameError() ||
      this.emailError() ||
      this.passwordError() ||
      this.confirmPasswordError() ||
      this.privacyError()
    );
  }

  /** Validates that the privacy policy has been accepted, setting `privacyError` otherwise. */
  private validatePrivacyAcceptance(): void {
    this.privacyError.set(this.acceptedPrivacy ? '' : 'Please accept the privacy policy.');
  }

  /** Basic "local@domain.tld" shape check used by signup email validation. */
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email.trim());
  }

  /** Clears all form error and success signals. */
  clearErrors(): void {
    this.nameError.set('');
    this.emailError.set('');
    this.passwordError.set('');
    this.confirmPasswordError.set('');
    this.privacyError.set('');
    this.successMessage.set('');
  }

  /** Clears the name field error. */
  clearNameError(): void {
    this.nameError.set('');
  }

  /** Clears the email field error. */
  clearEmailError(): void {
    this.emailError.set('');
  }

  /** Clears the password field error, hiding the reveal state if the field is now empty. */
  clearPasswordError(): void {
    this.passwordError.set('');

    if (!this.password) {
      this.showPassword.set(false);
    }
  }

  /** Clears the confirm-password field error, hiding the reveal state if the field is now empty. */
  clearConfirmPasswordError(): void {
    this.confirmPasswordError.set('');

    if (!this.confirmPassword) {
      this.showConfirmPassword.set(false);
    }
  }

  /** Clears the privacy-policy acceptance error. */
  clearPrivacyError(): void {
    this.privacyError.set('');
  }
}
