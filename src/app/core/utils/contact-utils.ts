import { Contact, NewContact } from '../models/contact.model';

const GOLDEN_ANGLE = 137.508;

export function getContactInitials(contact: Contact | NewContact | null): string {
  if (!contact) return '';
  const firstname_initial = contact.first_name ? contact.first_name.charAt(0).toUpperCase() : '';
  const lastname_initial = contact.last_name ? contact.last_name.charAt(0).toUpperCase() : '';
  return firstname_initial + lastname_initial;
}

/** Identifies the demo "logged in" contact used to render the "(You)" label. */
export function isOwnContact(contact: Contact | NewContact | null): boolean {
  if (!contact) return false;
  return (
    (contact.first_name === 'Sofia' && contact.last_name === 'Müller') ||
    contact.email === 'sofia@mueller.de'
  );
}

export function getContactColor(contact: Contact | NewContact | null): string {
  if (!contact) return `hsl(0, 70%, 50%)`;
  if ('color_index' in contact) {
    const hue = (contact.color_index * GOLDEN_ANGLE) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }
  const name = (contact.first_name || '') + (contact.last_name || '');
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 70%, 50%)`;
}
