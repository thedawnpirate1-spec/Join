import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { TaskService } from './task.service';
import { ContactService } from './contact.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase = inject(SupabaseService);
  private taskService = inject(TaskService);
  private contactService = inject(ContactService);

  isLoggedIn = signal(false);

  constructor() {
    this.checkSession();

    this.supabase.client.auth.onAuthStateChange((event, session) => {
      this.isLoggedIn.set(!!session);
      if (!session) {
        this.clearCaches();
      }
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
    this.clearCaches();
  }

  clearCaches() {
    this.taskService.clearCache();
    this.contactService.clearCache();
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.client.auth.getUser();
    if (error) return null;
    return user;
  }

  async getUserName(): Promise<string> {
    const { data: { user } } = await this.supabase.client.auth.getUser();
    if (!user) return 'Guest User';
    
    if (user.email === 'guest@guest.com') return 'Guest';
    
    const meta = user.user_metadata;
    if (meta) {
      if (meta['full_name']) return meta['full_name'];
      if (meta['name'] && meta['name'] !== 'User') return meta['name'];
      if (meta['first_name'] || meta['last_name']) {
        return `${meta['first_name'] || ''} ${meta['last_name'] || ''}`.trim();
      }
    }
    
    if (user.email) {
      const parts = user.email.split('@');
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    
    return 'User';
  }
}
