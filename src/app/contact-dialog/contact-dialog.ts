import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Contact, NewContact } from '../core/contact.model';
import { getContactColor, getContactInitials } from '../core/contact-utils';

@Component({
  selector: 'app-contact-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact-dialog.html',
  styleUrl: './contact-dialog.scss',
})
export class ContactDialog implements OnInit {
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() contact: Contact | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<NewContact>();
  @Output() deleted = new EventEmitter<void>();

  name = '';
  email = '';
  phone = '';

  nameError = '';
  emailError = '';
  phoneError = '';

  private readonly namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,}$/;
  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly phonePattern = /^\+?[0-9]{6,20}$/;

  get avatarInitials(): string {
    return getContactInitials(this.contact);
  }

  get avatarColor(): string {
    return getContactColor(this.contact);
  }

  ngOnInit(): void {
    if (this.mode === 'edit' && this.contact) {
      this.name = `${this.contact.first_name} ${this.contact.last_name}`.trim();
      this.email = this.contact.email;
      this.phone = this.contact.phone || '';
    }
  }

  onClose(): void {
    this.close.emit();
  }

  validateName(): boolean {
    const value = this.name.trim();
    if (!value) {
      this.nameError = 'Please enter a name.';
    } else if (!this.namePattern.test(value)) {
      this.nameError = 'Name may only contain letters and must be at least 2 characters long.';
    } else {
      this.nameError = '';
    }
    return !this.nameError;
  }

  validateEmail(): boolean {
    const value = this.email.trim();
    if (!value) {
      this.emailError = 'Please enter an email address.';
    } else if (!this.emailPattern.test(value)) {
      this.emailError = 'Please enter a valid email address.';
    } else {
      this.emailError = '';
    }
    return !this.emailError;
  }

  validatePhone(): boolean {
    const value = this.phone.trim();
    if (!value) {
      this.phoneError = '';
    } else if (!this.phonePattern.test(value)) {
      this.phoneError = 'Please enter a valid phone number.';
    } else {
      this.phoneError = '';
    }
    return !this.phoneError;
  }

  onSecondaryAction(): void {
    if (this.mode === 'edit') {
      this.deleted.emit();
    } else {
      this.close.emit();
    }
  }

  onSave(): void {
    const isNameValid = this.validateName();
    const isEmailValid = this.validateEmail();
    const isPhoneValid = this.validatePhone();
    if (!isNameValid || !isEmailValid || !isPhoneValid) return;

    const nameParts = this.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ');

    const contactData: NewContact = {
      first_name: firstName,
      last_name: lastName,
      email: this.email.trim(),
      phone: this.phone.trim(),
    };

    this.saved.emit(contactData);
  }
}
