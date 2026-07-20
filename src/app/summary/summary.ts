import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TaskService } from '../core/services/task.service';
import { AuthService } from '../core/services/auth-service';
import { Task } from '../core/models/task.model';

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

  get greetingText(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  async ngOnInit() {
    await Promise.all([
      this.loadMetrics(),
      this.loadUser()
    ]);
    this.changeDetectorRef.detectChanges();
  }

  async loadMetrics() {
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

  private processTasks(tasks: Task[]) {
    this.boardCount = tasks.length;
    this.todoCount = tasks.filter((t) => t.status === 'todo').length;
    this.doneCount = tasks.filter((t) => t.status === 'done').length;
    this.progressCount = tasks.filter((t) => t.status === 'in_progress').length;
    this.feedbackCount = tasks.filter((t) => t.status === 'await_feedback').length;

    const urgentTasks = tasks.filter((t) => t.priority === 'urgent');
    this.urgentCount = urgentTasks.length;

    // Find the earliest upcoming deadline
    const tasksWithDueDate = tasks.filter((t) => t.due_date);
    if (tasksWithDueDate.length > 0) {
      // Prioritize urgent tasks with deadlines, fallback to any task with deadline
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

  async loadUser() {
    try {
      this.userName = await this.authService.getUserName();
    } catch (error) {
      console.error('Error loading user name:', error);
      this.userName = 'User';
    }
  }

  private formatDate(dateStr: string | null): string {
    if (!dateStr) return 'No upcoming deadline';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
}
