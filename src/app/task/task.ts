import { ChangeDetectorRef, Component, Input, OnChanges, inject } from '@angular/core';
import { Task as TaskModel } from '../core/models/task.model';
import { Subtask } from '../core/models/subtask.model';
import { Contact } from '../core/models/contact.model';
import { SubtaskService } from '../core/services/subtask.service';
import { TaskService } from '../core/services/task.service';
import { getContactColor, getContactInitials } from '../core/utils/contact-utils';

@Component({
  selector: 'app-task',
  imports: [],
  templateUrl: './task.html',
  styleUrl: './task.scss',
})
export class Task implements OnChanges {
  private subtaskService = inject(SubtaskService);
  private taskService = inject(TaskService);
  private changeDetectorRef = inject(ChangeDetectorRef);

  @Input({ required: true }) task!: TaskModel;

  subtasks: Subtask[] = [];
  assignedContacts: Contact[] = [];

  ngOnChanges() {
    this.loadSubtasks();
    this.loadAssignedContacts();
  }

  private async loadSubtasks() {
    if (!this.task) return;
    try {
      this.subtasks = await this.subtaskService.getSubtasks(this.task.id);
      this.changeDetectorRef.detectChanges();
    } catch (e) {
      console.error('Error loading subtasks:', e);
    }
  }

  private async loadAssignedContacts() {
    if (!this.task) return;
    try {
      this.assignedContacts = await this.taskService.getContactsByIds(this.task.contact_ids ?? []);
      this.changeDetectorRef.detectChanges();
    } catch (e) {
      console.error('Error loading assigned contacts:', e);
    }
  }

  get categoryLabel(): string {
    return this.task.category === 'technical_task' ? 'Technical Task' : 'User Story';
  }

  get completedSubtaskCount(): number {
    return this.subtasks.filter((subtask) => subtask.done).length;
  }

  get subtaskProgressPercent(): number {
    return this.subtasks.length ? (this.completedSubtaskCount / this.subtasks.length) * 100 : 0;
  }

  get visibleAssignedContacts(): Contact[] {
    return this.assignedContacts.slice(0, 3);
  }

  get hiddenAssignedContactsCount(): number {
    return Math.max(this.assignedContacts.length - 3, 0);
  }

  getAvatarInitials(contact: Contact): string {
    return getContactInitials(contact);
  }

  getAvatarColor(contact: Contact): string {
    return getContactColor(contact);
  }
}
