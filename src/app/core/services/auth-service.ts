import { computed, Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { TaskService } from './task.service';
import { ContactService } from './contact.service';
import { NewContact } from '../models/contact.model';

/**
 * Service managing user authentication, active session state, and user profile data.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase = inject(SupabaseService);
  private taskService = inject(TaskService);
  private contactService = inject(ContactService);

  /** Signal indicating whether a user is currently authenticated. */
  isLoggedIn = signal(false);

  /** Signal holding the current user's display name. */
  userName = signal<string>('Guest User');

  /** Computed signal returning up to two initials derived from the user's display name. */
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

  /**
   * Checks for an active authentication session from Supabase and updates application state.
   */
  async checkSession(): Promise<void> {
    const { data, error } = await this.supabase.client.auth.getSession();

    if (error) {
      console.error('Error checking session:', error);
      this.setUserData(null);
      return;
    }

    this.setUserData(data.session?.user ?? null);
  }

  /**
   * Authenticates a user with email and password credentials.
   *
   * @param email User email address.
   * @param password User password.
   */
  async login(email: string, password: string): Promise<void> {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    this.setUserData(data.user);
  }

  /**
   * Signs out the currently authenticated user and clears local service caches.
   */
  async logout(): Promise<void> {
    const { error } = await this.supabase.client.auth.signOut();

    if (error) throw error;

    this.setUserData(null);
    this.clearCaches();
  }

  /**
   * Clears cached data in dependent services.
   */
  clearCaches(): void {
    this.taskService.clearCache();
    this.contactService.clearCache();
  }

  /**
   * Fetches the current authenticated Supabase user object.
   *
   * @returns User object or null if unauthenticated.
   */
  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await this.supabase.client.auth.getUser();

    if (error) return null;

    return user;
  }

  /**
   * Resolves the display name of the current authenticated user.
   *
   * @returns Resolved display name string.
   */
  async getUserName(): Promise<string> {
    const user = await this.getCurrentUser();

    return this.resolveUserName(user);
  }

  /**
   * Registers a new user account with email, password, and name, and adds them to contacts.
   *
   * @param email User email.
   * @param password User password.
   * @param name Full name of the new user.
   */
  async signUp(email: string, password: string, name: string): Promise<void> {
    const cleanEmail = email.trim();

    await this.ensureEmailNotRegistered(cleanEmail);
    const data = await this.createAuthAccount(cleanEmail, password, name);
    this.ensureSignupSucceeded(data);
    await this.addSignupContact(name, cleanEmail);
  }

  /**
   * Rejects signup if a contact already exists with the given email.
   *
   * @param email Email address to check.
   * @throws Error('EMAIL_EXISTS') when a matching contact is found.
   */
  private async ensureEmailNotRegistered(email: string): Promise<void> {
    const { data: existingContacts } = await this.supabase.client
      .from('contacts')
      .select('id')
      .ilike('email', email)
      .limit(1);

    if (existingContacts && existingContacts.length > 0) {
      throw new Error('EMAIL_EXISTS');
    }
  }

  /**
   * Creates the Supabase auth account for a new user.
   *
   * @param email Cleaned email address.
   * @param password User password.
   * @param name Full name stored in user metadata.
   * @returns The Supabase signUp response data.
   */
  private async createAuthAccount(email: string, password: string, name: string) {
    const { data, error } = await this.supabase.client.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      this.rethrowAsEmailExistsIfMatching(error.message);
      throw error;
    }

    return data;
  }

  /**
   * Throws Error('EMAIL_EXISTS') if the given message indicates a duplicate account.
   *
   * @param message Error message to inspect.
   */
  private rethrowAsEmailExistsIfMatching(message: string | undefined): void {
    const errMsg = message?.toLowerCase() || '';
    if (
      errMsg.includes('already registered') ||
      errMsg.includes('already in use') ||
      errMsg.includes('user already exists') ||
      errMsg.includes('duplicate') ||
      errMsg.includes('unique') ||
      errMsg.includes('already exists')
    ) {
      throw new Error('EMAIL_EXISTS');
    }
  }

  /**
   * Guards against Supabase silently returning an existing (unconfirmed) identity as success.
   *
   * @param data Supabase signUp response data.
   * @throws Error('EMAIL_EXISTS') when the returned user has no identities.
   */
  private ensureSignupSucceeded(data: any): void {
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw new Error('EMAIL_EXISTS');
    }
  }

  /**
   * Adds the newly signed-up user to the contacts list, tolerating duplicate-contact races.
   *
   * @param name Full name of the new user.
   * @param email Cleaned email address.
   */
  private async addSignupContact(name: string, email: string): Promise<void> {
    const contact = this.createContactFromSignup(name, email);

    try {
      await this.contactService.addContact(contact);
    } catch (addContactError: any) {
      if (addContactError?.code === '23505') throw new Error('EMAIL_EXISTS');
      this.rethrowAsEmailExistsIfMatching(addContactError?.message);
      console.error('Error adding contact during signup:', addContactError);
    }
  }

  /**
   * Creates a NewContact object from a user's signup name and email.
   *
   * @param name Full name.
   * @param email Email address.
   * @returns Structured NewContact payload.
   */
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

  /**
   * Updates internal signals for login state and user name based on the user session.
   *
   * @param user Supabase user object or null.
   */
  private setUserData(user: any): void {
    this.isLoggedIn.set(!!user);
    this.userName.set(this.resolveUserName(user));
  }

  /**
   * Resolves a user's display name from metadata, email, or guest fallbacks.
   *
   * @param user Supabase user object or null.
   * @returns Formatted name string.
   */
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
