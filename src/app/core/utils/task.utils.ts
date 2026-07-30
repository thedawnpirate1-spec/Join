import { Category, Priority } from '../models/task.model';

/** Maps a task category to its human-readable badge label. */
export function getCategoryDisplayLabel(category: Category | null): string {
  if (category === 'user_story') return 'User Story';
  if (category === 'technical_task') return 'Technical Task';
  return '';
}

/** Capitalizes a priority value for display, defaulting to "Medium". */
export function getPriorityDisplayLabel(priority: Priority): string {
  if (!priority) return 'Medium';
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}
