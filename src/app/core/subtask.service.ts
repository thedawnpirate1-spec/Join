import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Subtask, NewSubtask } from './subtask.model';

@Injectable({ providedIn: 'root' })
export class SubtaskService {
  private supabase = inject(SupabaseService);
  private table = this.supabase.client.from('subtasks');

  async getSubtasks(taskId: string): Promise<Subtask[]> {
    const { data, error } = await this.table
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data as Subtask[];
  }

  async addSubtask(subtask: NewSubtask): Promise<Subtask> {
    const { data, error } = await this.table.insert(subtask).select().single();
    if (error) throw error;
    return data as Subtask;
  }

  async updateSubtask(id: string, changes: Partial<NewSubtask>): Promise<Subtask> {
    const { data, error } = await this.table
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Subtask;
  }

  async deleteSubtask(id: string): Promise<void> {
    const { error } = await this.table.delete().eq('id', id);
    if (error) throw error;
  }
}
