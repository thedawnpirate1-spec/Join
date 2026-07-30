/** A contact stored in the address book. */
export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
  color_index: number;
}

/** Payload for creating a contact; server-assigned fields are omitted. */
export type NewContact = Omit<Contact, 'id' | 'created_at' | 'color_index'>;
