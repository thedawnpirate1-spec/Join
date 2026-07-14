import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private router: Router) {}

  onLogin(): void {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter email and password.';
      return;
    }

    console.log('Login:', {
      email: this.email,
      password: this.password,
    });

    this.router.navigateByUrl('/summary');
  }

  onGuestLogin(): void {
    console.log('Guest login');

    this.router.navigateByUrl('/summary');
  }

  goToSignup(): void {
    this.router.navigateByUrl('/signup');
  }
}
