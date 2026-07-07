import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Task, NewTask } from './task.model';
import { Contact } from './contact.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private supabase = inject(SupabaseService);
  private table = this.supabase.client.from('tasks');

  async getTasks(): Promise<Task[]> {
    const { data, error } = await this.table
      .select('*')
      .order('due_date', { ascending: true });
    if (error) throw error;
    return data as Task[];
  }

  async getTask(id: string): Promise<Task> {
    const { data, error } = await this.table.select('*').eq('id', id).single();
    if (error) throw error;
    return data as Task;
  }

  async addTask(task: NewTask, assignedContactIds: string[] = []): Promise<Task> {
    const { data, error } = await this.table.insert(task).select().single();
    if (error) throw error;
    const created = data as Task;
    if (assignedContactIds.length) {
      await this.setAssignedContacts(created.id, assignedContactIds);
    }
    return created;
  }

  async updateTask(id: string, changes: Partial<NewTask>): Promise<Task> {
    const { data, error } = await this.table
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Task;
  }

  async deleteTask(id: string): Promise<void> {
    const { error } = await this.table.delete().eq('id', id);
    if (error) throw error;
  }

  async getAssignedContacts(taskId: string): Promise<Contact[]> {
    const { data, error } = await this.supabase.client
      .from('task_contacts')
      .select('contact:contacts(*)')
      .eq('task_id', taskId);
    if (error) throw error;
    return (data ?? []).map((row: any) => row.contact as Contact);
  }

  async setAssignedContacts(taskId: string, contactIds: string[]): Promise<void> {
    const { error: deleteError } = await this.supabase.client
      .from('task_contacts')
      .delete()
      .eq('task_id', taskId);
    if (deleteError) throw deleteError;

    if (!contactIds.length) return;

    const { error: insertError } = await this.supabase.client
      .from('task_contacts')
      .insert(contactIds.map((contactId) => ({ task_id: taskId, contact_id: contactId })));
    if (insertError) throw insertError;
  }
}
