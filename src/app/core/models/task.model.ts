export type Priority = 'urgent' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'await_feedback' | 'done';
export type Category = 'user_story' | 'technical_task';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: Priority;
  status: TaskStatus;
  category: Category | null;
  created_at: string;
  contact_ids: string[] | null;
}

export type NewTask = Omit<Task, 'id' | 'created_at' | 'status'> & {
  status?: TaskStatus;
};
