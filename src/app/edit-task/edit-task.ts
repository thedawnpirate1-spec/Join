import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Task, Priority } from '../core/models/task.model';
import { Subtask } from '../core/models/subtask.model';
import { Contact } from '../core/models/contact.model';
import { TaskService } from '../core/services/task.service';
import { SubtaskService } from '../core/services/subtask.service';
import { ContactService } from '../core/services/contact.service';
import { getContactColor, getContactInitials } from '../core/utils/contact-utils';

@Component({
  selector: 'app-edit-task',
  imports: [FormsModule],
  templateUrl: './edit-task.html',
  styleUrl: './edit-task.scss',
})
export class EditTask implements OnInit {
  private taskService = inject(TaskService);
  private subtaskService = inject(SubtaskService);
  private contactService = inject(ContactService);
  private changeDetectorRef = inject(ChangeDetectorRef);

  @Input({ required: true }) taskId!: string;

  @Output() close = new EventEmitter<void>();
  @Output() changed = new EventEmitter<void>();

  task: Task | null = null;
  subtasks: Subtask[] = [];
  assignedContacts: Contact[] = [];
  allContacts: Contact[] = [];

  isEditMode = false;

  editTitle = '';
  editDescription = '';
  editDueDate = '';
  editPriority: Priority = 'medium';
  editContactIds: string[] = [];
  newSubtaskTitle = '';

  ngOnInit() {
    this.loadTask();
  }

  /**
   * Loads the current task data with subtasks and assigned contacts from Supabase.
   */
  async loadTask() {
    try {
      this.task = await this.taskService.getTask(this.taskId);
      this.subtasks = await this.subtaskService.getSubtasks(this.taskId);
      this.assignedContacts = await this.taskService.getAssignedContacts(this.task.id);
      this.changeDetectorRef.detectChanges();
    } catch (e) {
      console.error('Error loading task:', e);
    }
  }

  get categoryLabel(): string {
    return this.task?.category === 'technical_task' ? 'Technical Task' : 'User Story';
  }

  get priorityLabel(): string {
    if (!this.task) return '';
    return this.task.priority.charAt(0).toUpperCase() + this.task.priority.slice(1);
  }

  get priorityIcon(): string {
    if (this.task?.priority === 'urgent') return '/Assets/icons/red-arrows-up-icon.svg';
    if (this.task?.priority === 'low') return '/Assets/icons/arrow-down-green-icon.svg';
    return '/Assets/icons/equal-orange-icon.svg';
  }

  /**
   * Returns the due date in the display format dd/mm/yyyy.
   */
  get formattedDueDate(): string {
    if (!this.task?.due_date) return 'No due date';
    return this.task.due_date.split('-').reverse().join('/');
  }

  getAvatarInitials(contact: Contact): string {
    return getContactInitials(contact);
  }

  getAvatarColor(contact: Contact): string {
    return getContactColor(contact);
  }

  onClose() {
    this.close.emit();
  }

  /**
   * Toggles the done state of a subtask and saves it to Supabase.
   */
  async toggleSubtask(subtask: Subtask) {
    try {
      const updated = await this.subtaskService.updateSubtask(subtask.id, { done: !subtask.done });
      this.subtasks = this.subtasks.map((s) => (s.id === updated.id ? updated : s));
      this.changed.emit();
      this.changeDetectorRef.detectChanges();
    } catch (e) {
      console.error('Error updating subtask:', e);
    }
  }

  /**
   * Deletes the task together with all of its subtasks.
   */
  async deleteTask() {
    if (!this.task) return;
    try {
      for (const subtask of this.subtasks) {
        await this.subtaskService.deleteSubtask(subtask.id);
      }
      await this.taskService.deleteTask(this.task.id);
      this.changed.emit();
      this.close.emit();
    } catch (e) {
      console.error('Error deleting task:', e);
    }
  }

  /**
   * Switches to edit mode and fills the form with the current task values.
   */
  startEdit() {
    if (!this.task) return;
    this.editTitle = this.task.title;
    this.editDescription = this.task.description ?? '';
    this.editDueDate = this.task.due_date ?? '';
    this.editPriority = this.task.priority;
    this.editContactIds = [...(this.task.contact_ids ?? [])];
    this.isEditMode = true;
    this.loadAllContacts();
  }

  private async loadAllContacts() {
    try {
      this.allContacts = await this.contactService.getContacts();
      this.changeDetectorRef.detectChanges();
    } catch (e) {
      console.error('Error loading contacts:', e);
    }
  }

  setPriority(priority: Priority) {
    this.editPriority = priority;
  }

  isContactAssigned(contactId: string): boolean {
    return this.editContactIds.includes(contactId);
  }

  toggleContact(contactId: string) {
    if (this.isContactAssigned(contactId)) {
      this.editContactIds = this.editContactIds.filter((id) => id !== contactId);
    } else {
      this.editContactIds = [...this.editContactIds, contactId];
    }
  }

  /**
   * Adds a new subtask for this task in Supabase.
   */
  async addSubtask() {
    const title = this.newSubtaskTitle.trim();
    if (!title || !this.task) return;
    try {
      const subtask = await this.subtaskService.addSubtask({ task_id: this.task.id, title });
      this.subtasks = [...this.subtasks, subtask];
      this.newSubtaskTitle = '';
      this.changed.emit();
      this.changeDetectorRef.detectChanges();
    } catch (e) {
      console.error('Error adding subtask:', e);
    }
  }

  /**
   * Removes a subtask permanently from Supabase.
   */
  async removeSubtask(subtask: Subtask) {
    try {
      await this.subtaskService.deleteSubtask(subtask.id);
      this.subtasks = this.subtasks.filter((s) => s.id !== subtask.id);
      this.changed.emit();
      this.changeDetectorRef.detectChanges();
    } catch (e) {
      console.error('Error deleting subtask:', e);
    }
  }

  /**
   * Saves the edited task values back to Supabase and returns to the view mode.
   */
  async saveTask() {
    if (!this.task || !this.editTitle.trim()) return;
    try {
      this.task = await this.taskService.updateTask(this.task.id, {
        title: this.editTitle.trim(),
        description: this.editDescription.trim() || null,
        due_date: this.editDueDate || null,
        priority: this.editPriority,
        contact_ids: this.editContactIds,
      });
      this.assignedContacts = await this.taskService.getAssignedContacts(this.task.id);
      this.isEditMode = false;
      this.changed.emit();
      this.changeDetectorRef.detectChanges();
    } catch (e) {
      console.error('Error saving task:', e);
    }
  }
}
