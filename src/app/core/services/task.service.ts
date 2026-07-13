import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Task, NewTask } from '../models/task.model';
import { Contact } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private supabase = inject(SupabaseService);
  private table = this.supabase.client.from('tasks');

  async getTasks(): Promise<Task[]> {
    const { data, error } = await this.table.select('*').order('due_date', { ascending: true });
    if (error) throw error;
    return data as Task[];
  }

  async getTask(id: string): Promise<Task> {
    const { data, error } = await this.table.select('*').eq('id', id).single();
    if (error) throw error;
    return data as Task;
  }

  async addTask(task: NewTask): Promise<Task> {
    const { data, error } = await this.table.insert(task).select().single();
    if (error) throw error;
    return data as Task;
  }

  async updateTask(id: string, changes: Partial<NewTask>): Promise<Task> {
    const { data, error } = await this.table.update(changes).eq('id', id).select().single();
    if (error) throw error;
    return data as Task;
  }

  async deleteTask(id: string): Promise<void> {
    const { error } = await this.table.delete().eq('id', id);
    if (error) throw error;
  }

  async getContactsByIds(contactIds: string[]): Promise<Contact[]> {
    if (!contactIds.length) return [];
    const { data, error } = await this.supabase.client
      .from('contacts')
      .select('*')
      .in('id', contactIds);
    if (error) throw error;
    return data as Contact[];
  }
}
