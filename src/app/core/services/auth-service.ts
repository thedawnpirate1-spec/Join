import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase = inject(SupabaseService);

  isLoggedIn = signal(false);

  constructor() {
    this.checkSession();

    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this.isLoggedIn.set(!!session);
    });
  }

  async checkSession(): Promise<void> {
    const { data, error } = await this.supabase.client.auth.getSession();

    if (error) {
      console.error('Error checking session:', error);
      this.isLoggedIn.set(false);
      return;
    }

    this.isLoggedIn.set(!!data.session);
  }

  async login(email: string, password: string): Promise<void> {
    const { error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    this.isLoggedIn.set(true);
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.client.auth.signOut();

    if (error) throw error;

    this.isLoggedIn.set(false);
  }
}
