import { Injectable, EventEmitter, inject } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { Subtask, NewSubtask } from '../models/subtask.model';

@Injectable({ providedIn: 'root' })
export class SubtaskService {
  private supabase = inject(SupabaseService);
  private table = this.supabase.client.from('subtasks');

  subtasksChanged = new EventEmitter<string>();

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
    const created = data as Subtask;
    this.subtasksChanged.emit(created.task_id);
    return created;
  }

  async updateSubtask(id: string, changes: Partial<NewSubtask>): Promise<Subtask> {
    const { data, error } = await this.table.update(changes).eq('id', id).select().single();
    if (error) throw error;
    const updated = data as Subtask;
    this.subtasksChanged.emit(updated.task_id);
    return updated;
  }

  async deleteSubtask(id: string, taskId?: string): Promise<void> {
    const { error } = await this.table.delete().eq('id', id);
    if (error) throw error;
    if (taskId) {
      this.subtasksChanged.emit(taskId);
    }
  }
}
