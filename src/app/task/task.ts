import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
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
export class Task implements OnChanges, OnInit, OnDestroy {
  private subtaskService = inject(SubtaskService);
  private taskService = inject(TaskService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private subtaskSub?: Subscription;

  @Input({ required: true }) task!: TaskModel;

  subtasks: Subtask[] = [];
  assignedContacts: Contact[] = [];

  ngOnInit() {
    this.subtaskSub = this.subtaskService.subtasksChanged.subscribe((taskId) => {
      if (this.task && taskId === this.task.id) {
        this.loadSubtasks();
      }
    });
  }

  ngOnDestroy() {
    this.subtaskSub?.unsubscribe();
  }

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
      this.assignedContacts = await this.taskService.getAssignedContacts(this.task.id);
      this.changeDetectorRef.detectChanges();
    } catch (e) {
      console.error('Error loading assigned contacts:', e);
    }
  }

  /**
   * Returns the readable label for the task category.
   */
  get categoryLabel(): string {
    return this.task.category === 'technical_task' ? 'Technical Task' : 'User Story';
  }

  /**
   * Returns the number of completed subtasks.
   */
  get completedSubtaskCount(): number {
    return this.subtasks.filter((subtask) => subtask.done).length;
  }

  /**
   * Returns the completion percentage of all subtasks.
   * Used for the width of the subtask progress bar.
   */
  get subtaskProgressPercent(): number {
    return this.subtasks.length ? (this.completedSubtaskCount / this.subtasks.length) * 100 : 0;
  }

  /**
   * Returns the assigned contacts that should be displayed as avatar circles.
   * The task card shows a maximum of three avatars directly.
   */
  get visibleAssignedContacts(): Contact[] {
    return this.assignedContacts.slice(0, 3);
  }

  /**
   * Returns the number of assigned contacts that are hidden behind the "+x" avatar.
   */
  get hiddenAssignedContactsCount(): number {
    return Math.max(this.assignedContacts.length - 3, 0);
  }

  /**
   * Returns the initials that should be displayed inside a contact avatar.
   *
   * @param contact - The contact whose initials should be displayed.
   * @returns The contact initials.
   */
  getAvatarInitials(contact: Contact): string {
    return getContactInitials(contact);
  }

  /**
   * Returns the background color that should be used for a contact avatar.
   *
   * @param contact - The contact whose avatar color should be returned.
   * @returns The avatar background color as a hex color string.
   */
  getAvatarColor(contact: Contact): string {
    return getContactColor(contact);
  }
}
