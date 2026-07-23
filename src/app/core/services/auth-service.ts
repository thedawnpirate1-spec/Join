import { computed, Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { TaskService } from './task.service';
import { ContactService } from './contact.service';
import { NewContact } from '../models/contact.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase = inject(SupabaseService);
  private taskService = inject(TaskService);
  private contactService = inject(ContactService);

  isLoggedIn = signal(false);
  userName = signal<string>('Guest User');

  userInitials = computed(() => {
    const name = this.userName();

    if (!name || name === 'Guest User') {
      return 'GU';
    }

    if (name === 'Guest') {
      return 'G';
    }

    return name
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  });

  constructor() {
    this.checkSession();

    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this.setUserData(session?.user ?? null);

      if (!session) {
        this.clearCaches();
      }
    });
  }

  async checkSession(): Promise<void> {
    const { data, error } = await this.supabase.client.auth.getSession();

    if (error) {
      console.error('Error checking session:', error);
      this.setUserData(null);
      return;
    }

    this.setUserData(data.session?.user ?? null);
  }

  async login(email: string, password: string): Promise<void> {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    this.setUserData(data.user);
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.client.auth.signOut();

    if (error) throw error;

    this.setUserData(null);
    this.clearCaches();
  }

  clearCaches(): void {
    this.taskService.clearCache();
    this.contactService.clearCache();
  }

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await this.supabase.client.auth.getUser();

    if (error) return null;

    return user;
  }

  async getUserName(): Promise<string> {
    const user = await this.getCurrentUser();

    return this.resolveUserName(user);
  }

  async signUp(email: string, password: string, name: string): Promise<void> {
    const { error } = await this.supabase.client.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) throw error;

    const contact = this.createContactFromSignup(name, email);

    await this.contactService.addContact(contact);
  }

  private createContactFromSignup(name: string, email: string): NewContact {
    const nameParts = name.trim().split(' ').filter(Boolean);

    const firstName = nameParts[0] ?? '';
    const lastName = nameParts.slice(1).join(' ');

    return {
      first_name: firstName,
      last_name: lastName,
      email: email.trim(),
      phone: '',
    };
  }

  private setUserData(user: any): void {
    this.isLoggedIn.set(!!user);
    this.userName.set(this.resolveUserName(user));
  }

  private resolveUserName(user: any): string {
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
      const emailName = user.email.split('@')[0];

      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }

    return 'User';
  }
}
