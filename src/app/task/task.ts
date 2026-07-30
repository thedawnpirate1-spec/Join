import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { Task as TaskModel } from '../core/models/task.model';
import { Subtask } from '../core/models/subtask.model';
import { Contact } from '../core/models/contact.model';
import { SubtaskService } from '../core/services/subtask.service';
import { TaskService } from '../core/services/task.service';
import { Avatar } from '../shared/avatar/avatar';

/** Board card for a single task: shows its category, progress, and assigned contacts. */
@Component({
  selector: 'app-task',
  imports: [Avatar],
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

  /** Subscribes to subtask changes so this card's progress stays in sync with edits elsewhere. */
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

  /** Reloads subtasks and assigned contacts whenever the bound task input changes. */
  ngOnChanges() {
    this.loadSubtasks();
    this.loadAssignedContacts();
  }

  /** Fetches this task's subtasks and refreshes the view. */
  private async loadSubtasks() {
    if (!this.task) return;
    try {
      this.subtasks = await this.subtaskService.getSubtasks(this.task.id);
      this.changeDetectorRef.detectChanges();
    } catch (e) {
      console.error('Error loading subtasks:', e);
    }
  }

  /** Fetches this task's assigned contacts and refreshes the view. */
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
}
