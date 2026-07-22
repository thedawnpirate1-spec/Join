import { Component, HostBinding, Input } from '@angular/core';
import { Contact, NewContact } from '../../core/models/contact.model';
import { getContactColor, getContactInitials } from '../../core/utils/contact-utils';

/** Colored circle showing a contact's initials, reused wherever an avatar is displayed. */
@Component({
  selector: 'app-avatar',
  standalone: true,
  templateUrl: './avatar.html',
})
export class Avatar {
  @Input() contact: Contact | NewContact | null = null;

  @HostBinding('style.background-color')
  get backgroundColor(): string {
    return getContactColor(this.contact);
  }

  get initials(): string {
    return getContactInitials(this.contact);
  }
}
