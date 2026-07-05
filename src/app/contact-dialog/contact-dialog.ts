import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Contact } from '../core/contact.model';

@Component({
  selector: 'app-contact-dialog',
  standalone: true,
  imports: [],
  templateUrl: './contact-dialog.html',
  styleUrl: './contact-dialog.scss',
})
export class ContactDialog {
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() contact: Contact | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onSave() {
    this.saved.emit();
  }
}
