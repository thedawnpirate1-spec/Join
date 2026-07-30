import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../core/models/contact.model';
import { isOwnContact } from '../../core/utils/contact-utils';
import { Avatar } from '../avatar/avatar';
import { ClickOutsideDirective } from '../click-outside.directive';

/**
 * "Assigned to" contact picker: search dropdown with checkboxes plus the row of
 * selected-contact badges below it. Shared between add-task and edit-task.
 */
@Component({
  selector: 'app-contact-assign-dropdown',
  standalone: true,
  imports: [FormsModule, Avatar, ClickOutsideDirective],
  templateUrl: './contact-assign-dropdown.html',
  styleUrl: './contact-assign-dropdown.scss',
})
export class ContactAssignDropdown {
  @Input() contacts: Contact[] = [];
  @Input() selectedIds: string[] = [];
  @Input() isOpen = false;

  @Output() selectedIdsChange = new EventEmitter<string[]>();
  @Output() isOpenChange = new EventEmitter<boolean>();

  searchTerm = '';

  /** Contacts matching the current search term, by name or email. */
  get filteredContacts(): Contact[] {
    if (!this.searchTerm) return this.contacts;
    const term = this.searchTerm.toLowerCase();
    return this.contacts.filter((c) => {
      const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
      return fullName.includes(term) || c.email.toLowerCase().includes(term);
    });
  }

  /** The contacts currently selected, in badge-row order. */
  get selectedContacts(): Contact[] {
    return this.contacts.filter((c) => this.selectedIds.includes(c.id));
  }

  /** Whether a contact is among the currently selected ids. */
  isSelected(contact: Contact): boolean {
    return this.selectedIds.includes(contact.id);
  }

  /** Whether a contact is the demo "logged in" contact, shown with a "(You)" label. */
  isOwnContact(contact: Contact): boolean {
    return isOwnContact(contact);
  }

  /** Opens the dropdown. */
  openDropdown() {
    this.isOpenChange.emit(true);
  }

  /** Toggles the dropdown open/closed. */
  toggleDropdown() {
    this.isOpenChange.emit(!this.isOpen);
  }

  /** Closes the dropdown. */
  closeDropdown() {
    this.isOpenChange.emit(false);
  }

  /** Toggles a contact's selection state without letting the click bubble to the dropdown. */
  toggleContact(contact: Contact, event: Event) {
    event.stopPropagation();
    const next = this.isSelected(contact)
      ? this.selectedIds.filter((id) => id !== contact.id)
      : [...this.selectedIds, contact.id];
    this.selectedIdsChange.emit(next);
  }
}
