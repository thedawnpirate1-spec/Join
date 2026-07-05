import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Contact, NewContact } from '../core/contact.model';

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

  name = '';
  email = '';
  phone = '';

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

  onSave(): void {
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
