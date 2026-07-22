import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Contact, NewContact } from '../core/models/contact.model';
import { Avatar } from '../shared/avatar/avatar';
import { validateNameValue, validateEmailValue, validatePhoneValue } from '../core/utils/validation.utils';

@Component({
  selector: 'app-contact-dialog',
  standalone: true,
  imports: [FormsModule, Avatar],
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
    this.nameError = validateNameValue(this.name);
    return !this.nameError;
  }

  validateEmail(): boolean {
    this.emailError = validateEmailValue(this.email);
    return !this.emailError;
  }

  validatePhone(): boolean {
    this.phoneError = validatePhoneValue(this.phone);
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
