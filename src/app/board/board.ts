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

  private groupTasksByStatus(tasks: Task[]) {
    this.todoTasks = tasks.filter((task) => task.status === 'todo');
    this.inProgressTasks = tasks.filter((task) => task.status === 'in_progress');
    this.awaitFeedbackTasks = tasks.filter((task) => task.status === 'await_feedback');
    this.doneTasks = tasks.filter((task) => task.status === 'done');
  }

  onTaskDropped(event: CdkDragDrop<Task[]>, newStatus: TaskStatus) {
    if (event.previousContainer === event.container) {
      if (event.previousIndex === event.currentIndex) return;
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      event.container.data[event.currentIndex].status = newStatus;
    }

    const updates = event.container.data.map((task, index) => ({
      id: task.id,
      status: newStatus,
      position: index,
    }));

    if (event.previousContainer !== event.container && event.previousContainer.data.length > 0) {
      const prevStatus = event.previousContainer.data[0].status;
      event.previousContainer.data.forEach((task, index) => {
        updates.push({
          id: task.id,
          status: prevStatus,
          position: index,
        });
      });
    }

    this.taskService
      .updateTaskPositions(updates)
      .catch((e) => console.error('Error updating task order:', e));
  }

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

  closeTaskDialog() {
    this.selectedTaskId = null;
    this.changeDetectorRef.detectChanges();
  }

  matchesSearch(task: Task): boolean {
    const searchTerm = this.searchTerm.trim().toLowerCase();
    if (!searchTerm) return true;

    const title = task.title.toLowerCase();
    const description = (task.description ?? '').toLowerCase();
    return title.includes(searchTerm) || description.includes(searchTerm);
  }

  hasVisibleTasks(tasks: Task[]): boolean {
    return tasks.some((task) => this.matchesSearch(task));
  }

  get isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= 812;
  }

  openAddTaskDialog(status: TaskStatus = 'todo') {
    const isMobileView = typeof window !== 'undefined' && window.innerWidth <= 812;
    if (isMobileView) {
      this.router.navigate(['/add-task'], { queryParams: { status } });
    } else {
      this.addTaskStatus = status;
      this.showAddTaskDialog = true;
    }
  }

  closeAddTaskDialog() {
    this.showAddTaskDialog = false;
    this.loadTasks();
  }
}
