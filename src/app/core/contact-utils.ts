import { Contact, NewContact } from './contact.model';

const AVATAR_COLORS = [
  '#FF7A00',
  '#FF5EB2',
  '#6E52FF',
  '#9327FF',
  '#00BEE8',
  '#1FD7C1',
  '#FFC700',
  '#FF4646',
  '#462FFF',
  '#0038FF',
];

export function getContactInitials(contact: Contact | NewContact | null): string {
  if (!contact) return '';
  const f = contact.first_name ? contact.first_name.charAt(0).toUpperCase() : '';
  const l = contact.last_name ? contact.last_name.charAt(0).toUpperCase() : '';
  return f + l;
}

export function getContactColor(contact: Contact | NewContact | null): string {
  if (!contact) return AVATAR_COLORS[0];
  const name = (contact.first_name || '') + (contact.last_name || '');
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
