/** Urgency level of a task. */
export type Priority = 'urgent' | 'medium' | 'low';

/** Board column a task currently belongs to. */
export type TaskStatus = 'todo' | 'in_progress' | 'await_feedback' | 'done';

/** Classification of a task shown as a badge. */
export type Category = 'user_story' | 'technical_task';

/** A task tracked on the board. */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: Priority;
  status: TaskStatus;
  category: Category | null;
  created_at: string;
  contact_ids?: string[] | null;
  position?: number | null;
}

/** Payload for creating a task; server-assigned and defaulted fields are omitted. */
export type NewTask = Omit<Task, 'id' | 'created_at' | 'status' | 'position'> & {
  status?: TaskStatus;
  position?: number;
};
