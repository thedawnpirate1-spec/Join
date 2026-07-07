export type Priority = 'urgent' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'await_feedback' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: Priority;
  status: TaskStatus;
  category: string | null;
  created_at: string;
}

export type NewTask = Omit<Task, 'id' | 'created_at' | 'status'> & {
  status?: TaskStatus;
};
