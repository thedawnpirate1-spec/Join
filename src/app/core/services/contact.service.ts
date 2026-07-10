import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { Contact, NewContact } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private supabase = inject(SupabaseService);
  private table = this.supabase.client.from('contacts');

  async getContacts(): Promise<Contact[]> {
    const { data, error } = await this.table.select('*').order('first_name', { ascending: true });
    if (error) throw error;
    return data as Contact[];
  }

  async addContact(contact: NewContact): Promise<Contact> {
    const { data, error } = await this.table.insert(contact).select().single();
    if (error) throw error;
    return data as Contact;
  }

  async updateContact(id: string, changes: Partial<NewContact>): Promise<Contact> {
    const { data, error } = await this.table.update(changes).eq('id', id).select().single();
    if (error) throw error;
    return data as Contact;
  }

  async deleteContact(id: string): Promise<void> {
    const { error } = await this.table.delete().eq('id', id);
    if (error) throw error;
  }
}
