import { Component, OnInit, Input, Output, EventEmitter, inject, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../core/services/task.service';
import { SubtaskService } from '../core/services/subtask.service';
import { ContactService } from '../core/services/contact.service';
import { Contact } from '../core/models/contact.model';
import { Priority, Category, NewTask, TaskStatus } from '../core/models/task.model';
import { getContactColor, getContactInitials } from '../core/utils/contact-utils';

/** Component for creating and adding tasks. */
@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTask implements OnInit {
  private taskService = inject(TaskService);
  private subtaskService = inject(SubtaskService);
  private contactService = inject(ContactService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  /** Set when rendered inside a dialog overlay instead of as a routed page. */
  @Input() isDialog = false;
  /** Status the new task is created with, e.g. when opened from a specific board column. */
  @Input() initialStatus: TaskStatus = 'todo';
  @Output() close = new EventEmitter<void>();

  title = '';
  description = '';
  due_date = '';
  priority: Priority = 'medium';
  category: Category | null = null;

  contacts: Contact[] = [];
  selectedContacts: Contact[] = [];
  isAssignedDropdownOpen = false;
  searchTerm = '';

  isCategoryDropdownOpen = false;

  subtasks: { title: string; done: boolean }[] = [];
  subtaskInput = '';
  isEditingSubtask: number | null = null;
  editedSubtaskTitle = '';

  showValidationErrors = false;
  showSuccessToast = false;
  today = '';

  touchedFields = {
    title: false,
    due_date: false,
    category: false,
  };

  markAsTouched(field: 'title' | 'due_date' | 'category') {
    this.touchedFields[field] = true;
  }

  isFieldInvalid(field: 'title' | 'due_date' | 'category'): boolean {
    if (field === 'title') {
      return (this.touchedFields.title || this.showValidationErrors) && !this.title.trim();
    }
    if (field === 'due_date') {
      return (this.touchedFields.due_date || this.showValidationErrors) && !this.due_date;
    }
    if (field === 'category') {
      return (this.touchedFields.category || this.showValidationErrors) && !this.category;
    }
    return false;
  }

  ngOnInit() {
    this.loadContacts();
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    this.today = `${yyyy}-${mm}-${dd}`;
  }

  async loadContacts() {
    try {
      this.contacts = await this.contactService.getContacts();
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  }

  selectPriority(prio: Priority) {
    this.priority = prio;
  }

  toggleAssignedDropdown() {
    this.isAssignedDropdownOpen = !this.isAssignedDropdownOpen;
    this.isCategoryDropdownOpen = false;
  }

  toggleCategoryDropdown() {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
    this.isAssignedDropdownOpen = false;
  }

  selectCategory(cat: Category) {
    this.category = cat;
    this.touchedFields.category = true;
    this.isCategoryDropdownOpen = false;
  }

  toggleContact(contact: Contact, event: Event) {
    event.stopPropagation();

    const idx = this.selectedContacts.findIndex((c) => c.id === contact.id);
    if (idx > -1) {
      this.selectedContacts.splice(idx, 1);
    } else {
      this.selectedContacts.push(contact);
    }
  }

  isContactSelected(contact: Contact): boolean {
    return this.selectedContacts.some((c) => c.id === contact.id);
  }

  getFilteredContacts(): Contact[] {
    if (!this.searchTerm) return this.contacts;
    const term = this.searchTerm.toLowerCase();
    return this.contacts.filter((c) => {
      const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
      return fullName.includes(term) || c.email.toLowerCase().includes(term);
    });
  }

  getInitials(contact: Contact): string {
    return getContactInitials(contact);
  }

  getBgColor(contact: Contact): string {
    return getContactColor(contact);
  }

  /** Adds a new subtask to the list. */
  addSubtask() {
    if (this.subtaskInput.trim()) {
      this.subtasks.push({
        title: this.subtaskInput.trim(),
        done: false,
      });
      this.subtaskInput = '';
    }
  }

  clearSubtaskInput() {
    this.subtaskInput = '';
  }

  /** Removes a subtask by index. */
  removeSubtask(index: number) {
    this.subtasks.splice(index, 1);
  }

  /** Starts editing a subtask. */
  startEditSubtask(index: number, event: MouseEvent) {
    event.stopPropagation();
    this.isEditingSubtask = index;
    this.editedSubtaskTitle = this.subtasks[index].title;
  }

  /** Saves the edited subtask title. */
  saveEditSubtask(index: number) {
    if (this.editedSubtaskTitle.trim()) {
      this.subtasks[index].title = this.editedSubtaskTitle.trim();
      this.isEditingSubtask = null;
      this.editedSubtaskTitle = '';
    } else {
      this.removeSubtask(index);
      this.isEditingSubtask = null;
    }
  }

  /** Cancels subtask editing. */
  cancelEditSubtask() {
    this.isEditingSubtask = null;
    this.editedSubtaskTitle = '';
  }

  /** Resets the task form. */
  clearForm() {
    this.title = '';
    this.description = '';
    this.due_date = '';
    this.priority = 'medium';
    this.category = null;
    this.selectedContacts = [];
    this.subtasks = [];
    this.subtaskInput = '';
    this.searchTerm = '';
    this.showValidationErrors = false;
    this.touchedFields = {
      title: false,
      due_date: false,
      category: false,
    };
  }

  /** Checks if the required form fields are valid. */
  isFormValid(): boolean {
    return !!this.title.trim() && !!this.due_date && !!this.category;
  }

  /** Saves the task and all its subtasks. */
  async onSubmit() {
    this.showValidationErrors = true;

    if (!this.isFormValid()) {
      return;
    }

    try {
      const newTask: NewTask = {
        title: this.title.trim(),
        description: this.description.trim() || null,
        due_date: this.due_date || null,
        priority: this.priority,
        category: this.category,
        status: this.initialStatus,
      };

      const created = await this.taskService.addTask(
        newTask,
        this.selectedContacts.map((c) => c.id)
      );

      if (this.subtasks.length > 0) {
        for (const sub of this.subtasks) {
          await this.subtaskService.addSubtask({
            task_id: created.id,
            title: sub.title,
            done: false,
          });
        }
      }

      this.showSuccessToast = true;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.showSuccessToast = false;
        this.cdr.detectChanges();
        if (this.isDialog) {
          this.close.emit();
        } else {
          this.router.navigate(['/board']);
        }
      }, 1500);

    } catch (error) {
      console.error('Error saving task:', error);
    }
  }

  /** Closes dropdowns on document-wide click events. */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (!target.closest('.custom-dropdown-assigned')) {
      this.isAssignedDropdownOpen = false;
    }

    if (!target.closest('.custom-dropdown-category')) {
      this.isCategoryDropdownOpen = false;
    }
  }
}
