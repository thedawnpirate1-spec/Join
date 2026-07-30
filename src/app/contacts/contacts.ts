import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ContactService } from '../core/services/contact.service';
import { Contact, NewContact } from '../core/models/contact.model';
import { isOwnContact as checkIsOwnContact } from '../core/utils/contact-utils';
import { ContactDialog } from '../contact-dialog/contact-dialog';
import { Avatar } from '../shared/avatar/avatar';

/** Component for managing and displaying contacts. */
@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [FormsModule, ContactDialog, Avatar],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
})
export class Contacts implements OnInit {
  private contactService = inject(ContactService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  contacts: Contact[] = [];
  groupedContacts: { [key: string]: Contact[] } = {};
  letters: string[] = [];

  isDialogOpen = false;
  dialogMode: 'add' | 'edit' = 'add';
  dialogContact: Contact | null = null;

  selectedContact: Contact | null = null;
  showDetailsMobile = false;
  isMobileMenuOpen = false;
  showSuccessToast = false;

  /** Whether a contact is the demo "logged in" contact, shown with a "(You)" label. */
  isOwnContact(contact: Contact | null): boolean {
    return checkIsOwnContact(contact);
  }

  /** Resets the mobile detail/menu view whenever navigation returns to the plain /contacts route. */
  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event.urlAfterRedirects === '/contacts') {
          this.showDetailsMobile = false;
          this.isMobileMenuOpen = false;
          this.selectedContact = null;
        }
      });
  }

  ngOnInit() {
    this.loadContacts();
  }

  /** Loads all contacts and re-groups the list whenever a background revalidation refreshes them. */
  async loadContacts() {
    try {
      const contacts = await this.contactService.getContacts((freshContacts) => {
        this.contacts = freshContacts;
        this.groupContacts();
        this.refreshSelectedContact();
        this.cdr.detectChanges();
      });
      this.contacts = contacts;
      this.groupContacts();
      this.refreshSelectedContact();
      this.cdr.detectChanges();
    } catch (e) {
      console.error('Error loading contacts:', e);
    }
  }

  /** Re-points the selected contact at its fresh copy after a reload, in case it changed. */
  private refreshSelectedContact() {
    if (!this.selectedContact) return;
    const fresh = this.contacts.find((c) => c.id === this.selectedContact!.id);
    this.selectedContact = fresh || null;
  }

  /** Groups contacts alphabetically. */
  groupContacts() {
    const groups: { [key: string]: Contact[] } = {};
    this.contacts.forEach((contact) => {
      const firstLetter = contact.first_name ? contact.first_name.charAt(0).toUpperCase() : '#';
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(contact);
    });

    this.letters = Object.keys(groups).sort();
    this.letters.forEach((letter) => {
      groups[letter].sort((a, b) => {
        const nameA = (a.first_name + ' ' + a.last_name).toLowerCase();
        const nameB = (b.first_name + ' ' + b.last_name).toLowerCase();
        return nameA.localeCompare(nameB);
      });
    });

    this.groupedContacts = groups;
  }

  /** Selects a contact to display details. */
  selectContact(contact: Contact) {
    this.selectedContact = contact;
    this.showDetailsMobile = true;
    this.isMobileMenuOpen = false;
  }

  /** Closes mobile contact details view. */
  closeDetailsMobile() {
    this.showDetailsMobile = false;
    this.isMobileMenuOpen = false;
    this.selectedContact = null;
  }

  /** Opens dialog modal in 'add' mode. */
  openAddModal() {
    this.dialogMode = 'add';
    this.dialogContact = null;
    this.isDialogOpen = true;
    this.cdr.detectChanges();
  }

  /** Opens dialog modal in 'edit' mode. */
  openEditModal(contact: Contact, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.dialogMode = 'edit';
    this.dialogContact = contact;
    this.isDialogOpen = true;
    this.isMobileMenuOpen = false;
    this.cdr.detectChanges();
  }

  /** Closes the active dialog modal. */
  closeDialog() {
    this.isDialogOpen = false;
    this.cdr.detectChanges();
  }

  /** Handles the dialog's save event for both add and edit modes. */
  async onDialogSaved(contactData: NewContact) {
    try {
      if (this.dialogMode === 'add') {
        await this.addContactFromDialog(contactData);
      } else if (this.dialogContact) {
        await this.updateContactFromDialog(this.dialogContact.id, contactData);
      }

      this.isDialogOpen = false;
      await this.loadContacts();
      this.cdr.detectChanges();
    } catch (e) {
      console.error('Error saving contact:', e);
    }
  }

  /** Creates a contact and briefly shows a success toast. */
  private async addContactFromDialog(contactData: NewContact): Promise<void> {
    await this.contactService.addContact(contactData);
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
      this.cdr.detectChanges();
    }, 1500);
  }

  /** Updates a contact and refreshes the selected-contact detail view. */
  private async updateContactFromDialog(id: string, contactData: NewContact): Promise<void> {
    this.selectedContact = await this.contactService.updateContact(id, contactData);
  }

  /** Deletes the selected contact. */
  async deleteSelectedContact() {
    if (!this.selectedContact) return;
    await this.removeContact(this.selectedContact.id);
  }

  /** Handles contact deletion from the dialog. */
  async onDialogDeleted() {
    if (!this.dialogContact) return;
    this.isDialogOpen = false;
    this.cdr.detectChanges();
    await this.removeContact(this.dialogContact.id);
  }

  /** Deletes contact and updates state. */
  private async removeContact(id: string) {
    try {
      await this.contactService.deleteContact(id);
      this.selectedContact = null;
      this.showDetailsMobile = false;
      this.isMobileMenuOpen = false;
      await this.loadContacts();
      this.cdr.detectChanges();
    } catch (e) {
      console.error('Error deleting contact:', e);
    }
  }

  /** Toggles mobile options menu. */
  toggleMobileMenu(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.cdr.detectChanges();
  }

  /** Closes mobile options menu. */
  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    this.cdr.detectChanges();
  }
}
