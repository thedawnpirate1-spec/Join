import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ContactService } from '../core/contact.service';
import { Contact, NewContact } from '../core/contact.model';
import { ContactDialog } from '../contact-dialog/contact-dialog';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [FormsModule, ContactDialog],
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

  async loadContacts() {
    try {
      this.contacts = await this.contactService.getContacts();
      this.groupContacts();
      if (this.selectedContact) {
        const fresh = this.contacts.find((c) => c.id === this.selectedContact!.id);
        this.selectedContact = fresh || null;
      }
      this.cdr.detectChanges();
    } catch (e) {
      console.error('Error loading contacts:', e);
    }
  }

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

  getInitials(contact: Contact | NewContact | null): string {
    if (!contact) return '';
    const f = contact.first_name ? contact.first_name.charAt(0).toUpperCase() : '';
    const l = contact.last_name ? contact.last_name.charAt(0).toUpperCase() : '';
    return f + l;
  }

  getColor(contact: Contact | NewContact | null): string {
    if (!contact) return '#FF7A00';
    const colors = [
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
    const name = (contact.first_name || '') + (contact.last_name || '');
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  selectContact(contact: Contact) {
    this.selectedContact = contact;
    this.showDetailsMobile = true;
    this.isMobileMenuOpen = false;
  }

  closeDetailsMobile() {
    this.showDetailsMobile = false;
    this.isMobileMenuOpen = false;
    this.selectedContact = null;
  }

  openAddModal() {
    this.dialogMode = 'add';
    this.dialogContact = null;
    this.isDialogOpen = true;
    this.cdr.detectChanges();
  }

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

  closeDialog() {
    this.isDialogOpen = false;
    this.cdr.detectChanges();
  }

  async onDialogSaved(contactData: NewContact) {
    try {
      if (this.dialogMode === 'add') {
        await this.contactService.addContact(contactData);
      }

      if (this.dialogMode === 'edit' && this.dialogContact) {
        const updatedContact = await this.contactService.updateContact(
          this.dialogContact.id,
          contactData,
        );

        this.selectedContact = updatedContact;
      }

      this.isDialogOpen = false;
      await this.loadContacts();
      this.cdr.detectChanges();
    } catch (e) {
      console.error('Error saving contact:', e);
    }
  }

  async deleteSelectedContact() {
    if (!this.selectedContact) return;
    try {
      await this.contactService.deleteContact(this.selectedContact.id);
      this.selectedContact = null;
      this.showDetailsMobile = false;
      this.isMobileMenuOpen = false;
      await this.loadContacts();
      this.cdr.detectChanges();
    } catch (e) {
      console.error('Error deleting contact:', e);
    }
  }

  toggleMobileMenu(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.cdr.detectChanges();
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    this.cdr.detectChanges();
  }
}
