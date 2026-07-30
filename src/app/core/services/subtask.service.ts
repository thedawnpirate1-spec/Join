import { Injectable, EventEmitter, inject } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { Subtask, NewSubtask } from '../models/subtask.model';

/** Manages CRUD operations for subtasks and notifies listeners when a task's subtasks change. */
@Injectable({ providedIn: 'root' })
export class SubtaskService {
  private supabase = inject(SupabaseService);
  private table = this.supabase.client.from('subtasks');

  /** Emits the parent task id whenever a subtask is added, updated, or deleted. */
  subtasksChanged = new EventEmitter<string>();

  /** Fetches all subtasks for a task, ordered by creation time. */
  async getSubtasks(taskId: string): Promise<Subtask[]> {
    const { data, error } = await this.table
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data as Subtask[];
  }

  /** Creates a subtask and notifies listeners of the change. */
  async addSubtask(subtask: NewSubtask): Promise<Subtask> {
    const { data, error } = await this.table.insert(subtask).select().single();
    if (error) throw error;
    const created = data as Subtask;
    this.subtasksChanged.emit(created.task_id);
    return created;
  }

  /** Updates a subtask and notifies listeners of the change. */
  async updateSubtask(id: string, changes: Partial<NewSubtask>): Promise<Subtask> {
    const { data, error } = await this.table.update(changes).eq('id', id).select().single();
    if (error) throw error;
    const updated = data as Subtask;
    this.subtasksChanged.emit(updated.task_id);
    return updated;
  }

  /** Deletes a subtask and, if the parent task id is known, notifies listeners of the change. */
  async deleteSubtask(id: string, taskId?: string): Promise<void> {
    const { error } = await this.table.delete().eq('id', id);
    if (error) throw error;
    if (taskId) {
      this.subtasksChanged.emit(taskId);
    }
  }
}
