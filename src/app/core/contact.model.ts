export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
}

export type NewContact = Omit<Contact, 'id' | 'created_at'>;
