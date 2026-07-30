import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../core/services/task.service';
import { Task, TaskStatus } from '../core/models/task.model';
import { Task as TaskCard } from '../task/task';
import { AddTask } from '../add-task/add-task';
import { EditTask } from '../edit-task/edit-task';

/** Kanban board: groups tasks into columns by status and handles drag-and-drop reordering. */
@Component({
  selector: 'app-board',
  imports: [CdkDrag, CdkDropList, FormsModule, TaskCard, EditTask, AddTask],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board implements OnInit {
  private taskService = inject(TaskService);
  private router = inject(Router);
  private changeDetectorRef = inject(ChangeDetectorRef);

  searchTerm = '';
  showAddTaskDialog = false;
  addTaskStatus: TaskStatus = 'todo';
  selectedTaskId: string | null = null;
  private isDragging = false;

  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  awaitFeedbackTasks: Task[] = [];
  doneTasks: Task[] = [];

  ngOnInit() {
    this.loadTasks();
  }

  /** Loads all tasks and re-groups the columns whenever a background revalidation refreshes them. */
  async loadTasks() {
    try {
      const tasks = await this.taskService.getTasks((freshTasks) => {
        this.groupTasksByStatus(freshTasks);
        this.changeDetectorRef.detectChanges();
      });
      this.groupTasksByStatus(tasks);
      this.changeDetectorRef.detectChanges();
    } catch (e) {
      console.error('Error loading tasks:', e);
    }
  }

  /** Splits the given tasks into the four column arrays by status. */
  private groupTasksByStatus(tasks: Task[]) {
    this.todoTasks = tasks.filter((task) => task.status === 'todo');
    this.inProgressTasks = tasks.filter((task) => task.status === 'in_progress');
    this.awaitFeedbackTasks = tasks.filter((task) => task.status === 'await_feedback');
    this.doneTasks = tasks.filter((task) => task.status === 'done');
  }

  /** Handles a task being dropped on a column: updates local arrays, then persists the new order. */
  onTaskDropped(event: CdkDragDrop<Task[]>, newStatus: TaskStatus) {
    if (this.isNoOpReorder(event)) return;

    this.applyDropToArrays(event, newStatus);
    const updates = this.buildPositionUpdates(event, newStatus);
    this.persistTaskOrder(updates);
  }

  /** Whether the drop is a same-column drag that didn't actually change position. */
  private isNoOpReorder(event: CdkDragDrop<Task[]>): boolean {
    return (
      event.previousContainer === event.container && event.previousIndex === event.currentIndex
    );
  }

  /** Reorders within, or transfers between, the column arrays to match the drop. */
  private applyDropToArrays(event: CdkDragDrop<Task[]>, newStatus: TaskStatus) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );
    event.container.data[event.currentIndex].status = newStatus;
  }

  /** Builds the position/status updates for the destination column, and the source column if changed. */
  private buildPositionUpdates(event: CdkDragDrop<Task[]>, newStatus: TaskStatus) {
    const updates = event.container.data.map((task, index) => ({
      id: task.id,
      status: newStatus,
      position: index,
    }));

    if (event.previousContainer !== event.container && event.previousContainer.data.length > 0) {
      updates.push(...this.buildSourceColumnUpdates(event.previousContainer.data));
    }

    return updates;
  }

  /** Builds position updates for tasks left behind in the source column after a transfer. */
  private buildSourceColumnUpdates(tasks: Task[]) {
    const prevStatus = tasks[0].status;
    return tasks.map((task, index) => ({ id: task.id, status: prevStatus, position: index }));
  }

  /** Persists the new task order to the backend, logging (without throwing) on failure. */
  private persistTaskOrder(updates: { id: string; status: TaskStatus; position: number }[]) {
    this.taskService
      .updateTaskPositions(updates)
      .catch((e) => console.error('Error updating task order:', e));
  }

  /** Marks that a drag is in progress, so the following click doesn't reopen the task dialog. */
  onDragStarted() {
    this.isDragging = true;
  }

  /**
   * Opens the task dialog, unless the click came from a finished drag.
   */
  openTaskDialog(task: Task) {
    if (this.isDragging) {
      this.isDragging = false;
      return;
    }
    this.selectedTaskId = task.id;
    this.changeDetectorRef.detectChanges();
  }

  /** Closes the task detail dialog. */
  closeTaskDialog() {
    this.selectedTaskId = null;
    this.changeDetectorRef.detectChanges();
  }

  /** Whether a task's title or description matches the current search term. */
  matchesSearch(task: Task): boolean {
    const searchTerm = this.searchTerm.trim().toLowerCase();
    if (!searchTerm) return true;

    const title = task.title.toLowerCase();
    const description = (task.description ?? '').toLowerCase();
    return title.includes(searchTerm) || description.includes(searchTerm);
  }

  /** Whether any task in the list matches the current search term. */
  hasVisibleTasks(tasks: Task[]): boolean {
    return tasks.some((task) => this.matchesSearch(task));
  }

  /** Whether the viewport is narrow enough to use the mobile layout. */
  get isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= 812;
  }

  /** Opens "add task" for the given column: a dedicated page on mobile, a dialog on desktop. */
  openAddTaskDialog(status: TaskStatus = 'todo') {
    if (this.isMobile) {
      this.router.navigate(['/add-task'], { queryParams: { status } });
    } else {
      this.addTaskStatus = status;
      this.showAddTaskDialog = true;
    }
  }

  /** Closes the add-task dialog and reloads the board to show the new task. */
  closeAddTaskDialog() {
    this.showAddTaskDialog = false;
    this.loadTasks();
  }
}
