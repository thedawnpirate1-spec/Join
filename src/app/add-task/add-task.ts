import { Component, OnInit, Input, Output, EventEmitter, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../core/services/task.service';
import { SubtaskService } from '../core/services/subtask.service';
import { ContactService } from '../core/services/contact.service';
import { Contact } from '../core/models/contact.model';
import { Priority, Category, NewTask, TaskStatus } from '../core/models/task.model';
import { ClickOutsideDirective } from '../shared/click-outside.directive';
import { SubtaskList, SubtaskListItem } from '../shared/subtask-list/subtask-list';
import { PrioritySelector } from '../shared/priority-selector/priority-selector';
import { ContactAssignDropdown } from '../shared/contact-assign-dropdown/contact-assign-dropdown';
import { getTodayIsoString } from '../core/utils/date.utils';

/** Component for creating and adding tasks. */
@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ClickOutsideDirective,
    SubtaskList,
    PrioritySelector,
    ContactAssignDropdown,
  ],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTask implements OnInit {
  private taskService = inject(TaskService);
  private subtaskService = inject(SubtaskService);
  private contactService = inject(ContactService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
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
  selectedContactIds: string[] = [];
  isAssignedDropdownOpen = false;

  isCategoryDropdownOpen = false;

  subtasks: { title: string; done: boolean }[] = [];

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
    this.today = getTodayIsoString();

    const statusParam = this.route.snapshot.queryParams['status'] as TaskStatus;
    if (statusParam && ['todo', 'in_progress', 'await_feedback', 'done'].includes(statusParam)) {
      this.initialStatus = statusParam;
    }
  }

  async loadContacts() {
    try {
      this.contacts = await this.contactService.getContacts();
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  }

  onAssignedDropdownOpenChange(open: boolean) {
    this.isAssignedDropdownOpen = open;
    if (open) this.isCategoryDropdownOpen = false;
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

  /** Maps local subtasks to the shape the shared subtask editor expects. */
  get subtaskItems(): SubtaskListItem[] {
    return this.subtasks.map((s, i) => ({ id: String(i), title: s.title }));
  }

  onAddSubtask(title: string) {
    this.subtasks.push({ title, done: false });
  }

  onUpdateSubtask(event: { id: string; title: string }) {
    const subtask = this.subtasks[Number(event.id)];
    if (subtask) subtask.title = event.title;
  }

  onRemoveSubtask(id: string) {
    this.subtasks.splice(Number(id), 1);
  }

  /** Resets the task form. */
  clearForm() {
    this.title = '';
    this.description = '';
    this.due_date = '';
    this.priority = 'medium';
    this.category = null;
    this.selectedContactIds = [];
    this.subtasks = [];
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

      const created = await this.taskService.addTask(newTask, this.selectedContactIds);

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
}
