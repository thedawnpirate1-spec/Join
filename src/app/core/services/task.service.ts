import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Task, NewTask } from '../models/task.model';
import { Contact } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private supabase = inject(SupabaseService);
  private table = this.supabase.client.from('tasks');

  private tasksCache: Task[] | null = null;

  async getTasks(onRevalidate?: (tasks: Task[]) => void, forceRefresh = false): Promise<Task[]> {
    if (this.tasksCache && !forceRefresh) {
      if (onRevalidate) {
        this.revalidateTasks(onRevalidate);
      }
      return this.tasksCache;
    }
    const { data, error } = await this.table.select('*');
    if (error) throw error;
    this.tasksCache = this.sortTasks(data as Task[]);
    return this.tasksCache;
  }

  async getTask(id: string): Promise<Task> {
    if (this.tasksCache) {
      const cached = this.tasksCache.find((t) => t.id === id);
      if (cached) return cached;
    }
    const { data, error } = await this.table.select('*').eq('id', id).single();
    if (error) throw error;
    return data as Task;
  }

  async addTask(task: NewTask, assignedContactIds: string[] = []): Promise<Task> {
    const payload = {
      ...task,
      contact_ids: assignedContactIds.length ? assignedContactIds : null
    };
    const { data, error } = await this.table.insert(payload).select().single();
    if (error) throw error;
    
    const newTask = data as Task;
    if (this.tasksCache) {
      this.tasksCache.push(newTask);
      this.tasksCache = this.sortTasks(this.tasksCache);
    }
    return newTask;
  }

  async updateTask(id: string, changes: Partial<NewTask>): Promise<Task> {
    const { data, error } = await this.table.update(changes).eq('id', id).select().single();
    if (error) throw error;
    
    const updatedTask = data as Task;
    if (this.tasksCache) {
      const idx = this.tasksCache.findIndex((t) => t.id === id);
      if (idx > -1) {
        this.tasksCache[idx] = updatedTask;
        this.tasksCache = this.sortTasks(this.tasksCache);
      }
    }
    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    const { error } = await this.table.delete().eq('id', id);
    if (error) throw error;
    
    if (this.tasksCache) {
      this.tasksCache = this.tasksCache.filter((t) => t.id !== id);
    }
  }

  clearCache() {
    this.tasksCache = null;
  }

  private sortTasks(tasks: Task[]): Task[] {
    return tasks.sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    });
  }

  private async revalidateTasks(onRevalidate: (tasks: Task[]) => void): Promise<void> {
    try {
      const { data, error } = await this.table.select('*');
      if (error) throw error;
      const freshTasks = this.sortTasks(data as Task[]);

      const hasChanged = JSON.stringify(this.tasksCache) !== JSON.stringify(freshTasks);
      if (hasChanged) {
        this.tasksCache = freshTasks;
        onRevalidate(this.tasksCache);
      }
    } catch (e) {
      console.error('Error revalidating tasks:', e);
    }
  }

  async getAssignedContacts(taskId: string): Promise<Contact[]> {
    const task = await this.getTask(taskId);
    if (!task || !task.contact_ids || !task.contact_ids.length) return [];
    
    const { data, error } = await this.supabase.client
      .from('contacts')
      .select('*')
      .in('id', task.contact_ids);
    if (error) throw error;
    return data as Contact[];
  }

  async setAssignedContacts(taskId: string, contactIds: string[]): Promise<void> {
    const { error } = await this.table
      .update({ contact_ids: contactIds.length ? contactIds : null })
      .eq('id', taskId);
    if (error) throw error;

    if (this.tasksCache) {
      const idx = this.tasksCache.findIndex((t) => t.id === taskId);
      if (idx > -1) {
        this.tasksCache[idx].contact_ids = contactIds.length ? contactIds : null;
      }
    }
  }
}
