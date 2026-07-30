/** A subtask belonging to a parent task. */
export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  done: boolean;
  created_at: string;
}

/** Payload for creating a subtask; `done` defaults to false server-side. */
export type NewSubtask = Omit<Subtask, 'id' | 'created_at' | 'done'> & {
  done?: boolean;
};
