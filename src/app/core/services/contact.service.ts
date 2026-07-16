import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { Contact, NewContact } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private supabase = inject(SupabaseService);
  private table = this.supabase.client.from('contacts');

  private contactsCache: Contact[] | null = null;

  async getContacts(onRevalidate?: (contacts: Contact[]) => void, forceRefresh = false): Promise<Contact[]> {
    if (this.contactsCache && !forceRefresh) {
      if (onRevalidate) {
        this.revalidateContacts(onRevalidate);
      }
      return this.contactsCache;
    }
    const { data, error } = await this.table.select('*');
    if (error) throw error;
    this.contactsCache = this.sortContacts(data as Contact[]);
    return this.contactsCache;
  }

  async addContact(contact: NewContact): Promise<Contact> {
    const { data, error } = await this.table.insert(contact).select().single();
    if (error) throw error;
    
    const newContact = data as Contact;
    if (this.contactsCache) {
      this.contactsCache.push(newContact);
      this.contactsCache = this.sortContacts(this.contactsCache);
    }
    return newContact;
  }

  async updateContact(id: string, changes: Partial<NewContact>): Promise<Contact> {
    const { data, error } = await this.table.update(changes).eq('id', id).select().single();
    if (error) throw error;
    
    const updatedContact = data as Contact;
    if (this.contactsCache) {
      const idx = this.contactsCache.findIndex((c) => c.id === id);
      if (idx > -1) {
        this.contactsCache[idx] = updatedContact;
        this.contactsCache = this.sortContacts(this.contactsCache);
      }
    }
    return updatedContact;
  }

  async deleteContact(id: string): Promise<void> {
    const { error } = await this.table.delete().eq('id', id);
    if (error) throw error;
    
    if (this.contactsCache) {
      this.contactsCache = this.contactsCache.filter((c) => c.id !== id);
    }
  }

  clearCache() {
    this.contactsCache = null;
  }

  private sortContacts(contacts: Contact[]): Contact[] {
    return contacts.sort((a, b) => {
      const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim();
      const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim();
      return nameA.localeCompare(nameB);
    });
  }

  private async revalidateContacts(onRevalidate: (contacts: Contact[]) => void): Promise<void> {
    try {
      const { data, error } = await this.table.select('*');
      if (error) throw error;
      const freshContacts = this.sortContacts(data as Contact[]);

      const hasChanged = JSON.stringify(this.contactsCache) !== JSON.stringify(freshContacts);
      if (hasChanged) {
        this.contactsCache = freshContacts;
        onRevalidate(this.contactsCache);
      }
    } catch (e) {
      console.error('Error revalidating contacts:', e);
    }
  }
}
