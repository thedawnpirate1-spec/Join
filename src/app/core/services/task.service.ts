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

  async addTask(task: NewTask, assignedContactIds: string[] = []): Promise<Task> {
    const payload = {
      ...task,
      contact_ids: assignedContactIds.length ? assignedContactIds : null
    };
    const { data, error } = await this.table.insert(payload).select().single();
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
  }
}
