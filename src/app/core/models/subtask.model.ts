export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  done: boolean;
  created_at: string;
}

export type NewSubtask = Omit<Subtask, 'id' | 'created_at' | 'done'> & {
  done?: boolean;
};
