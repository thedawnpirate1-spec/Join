import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TaskService } from '../core/services/task.service';
import { AuthService } from '../core/services/auth-service';
import { Task } from '../core/models/task.model';

/**
 * Component representing the Summary overview dashboard.
 * Displays counts of tasks by status, upcoming deadlines, and user greetings.
 */
@Component({
  selector: 'app-summary',
  imports: [RouterLink],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
})
export class Summary implements OnInit {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private changeDetectorRef = inject(ChangeDetectorRef);

  todoCount = 0;
  doneCount = 0;
  urgentCount = 0;
  boardCount = 0;
  progressCount = 0;
  feedbackCount = 0;
  upcomingDeadline = 'No upcoming deadline';
  userName = 'User';

  showMobileGreetingOverlay = false;
  isFadingOut = false;

  /**
   * Generates a time-based greeting string (Good morning, Good afternoon, or Good evening).
   */
  get greetingText(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  /**
   * Determines if the currently logged in user is a guest user.
   */
  get isGuest(): boolean {
    return (
      !this.userName ||
      this.userName === 'Guest User' ||
      this.userName === 'Guest' ||
      this.userName === 'User'
    );
  }

  /**
   * Initializes component data by fetching summary metrics and user information concurrently.
   */
  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadMetrics(), this.loadUser()]);
    this.checkMobileGreetingOverlay();
    this.changeDetectorRef.detectChanges();
  }

  /**
   * Displays and automatically dismisses the mobile greeting overlay after a fresh login.
   */
  private checkMobileGreetingOverlay(): void {
    const isJustLoggedIn = sessionStorage.getItem('justLoggedIn') === 'true';
    if (isJustLoggedIn && window.innerWidth <= 1024) {
      sessionStorage.removeItem('justLoggedIn');
      this.showMobileGreetingOverlay = true;

      setTimeout(() => {
        this.isFadingOut = true;
        this.changeDetectorRef.detectChanges();
      }, 1500);

      setTimeout(() => {
        this.showMobileGreetingOverlay = false;
        this.isFadingOut = false;
        this.changeDetectorRef.detectChanges();
      }, 2000);
    } else {
      sessionStorage.removeItem('justLoggedIn');
    }
  }

  /**
   * Loads task metrics from the TaskService and updates the local state.
   */
  async loadMetrics(): Promise<void> {
    try {
      const tasks = await this.taskService.getTasks((freshTasks) => {
        this.processTasks(freshTasks);
        this.changeDetectorRef.detectChanges();
      });
      this.processTasks(tasks);
    } catch (error) {
      console.error('Error loading summary metrics:', error);
    }
  }

  /**
   * Aggregates task metrics by status and identifies the earliest upcoming deadline.
   *
   * @param tasks List of task items to process.
   */
  private processTasks(tasks: Task[]): void {
    this.boardCount = tasks.length;
    this.todoCount = tasks.filter((t) => t.status === 'todo').length;
    this.doneCount = tasks.filter((t) => t.status === 'done').length;
    this.progressCount = tasks.filter((t) => t.status === 'in_progress').length;
    this.feedbackCount = tasks.filter((t) => t.status === 'await_feedback').length;

    const openTasks = tasks.filter((t) => t.status !== 'done');

    const urgentTasks = openTasks.filter((t) => t.priority === 'urgent');
    this.urgentCount = urgentTasks.length;

    const tasksWithDueDate = openTasks.filter((t) => t.due_date);
    if (tasksWithDueDate.length > 0) {
      const urgentWithDueDate = urgentTasks.filter((t) => t.due_date);
      const sourceTasks = urgentWithDueDate.length > 0 ? urgentWithDueDate : tasksWithDueDate;

      sourceTasks.sort((a, b) => {
        const da = new Date(a.due_date!).getTime();
        const db = new Date(b.due_date!).getTime();
        return da - db;
      });

      this.upcomingDeadline = this.formatDate(sourceTasks[0].due_date);
    } else {
      this.upcomingDeadline = 'No upcoming deadline';
    }
  }

  /**
   * Loads the current user's name from AuthService.
   */
  async loadUser(): Promise<void> {
    try {
      const name = await this.authService.getUserName();
      this.userName = name && name.trim() ? name : 'Guest';
    } catch (error) {
      console.error('Error loading user name:', error);
      this.userName = 'Guest';
    }
  }

  /**
   * Formats an ISO date string into a human-readable date representation.
   *
   * @param dateStr ISO date string or null.
   * @returns Formatted date string (e.g. "July 24, 2026").
   */
  private formatDate(dateStr: string | null): string {
    if (!dateStr) return 'No upcoming deadline';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
}
