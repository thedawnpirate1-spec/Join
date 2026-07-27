import { Category, Priority } from '../models/task.model';

export function getCategoryDisplayLabel(category: Category | null): string {
  if (category === 'user_story') return 'User Story';
  if (category === 'technical_task') return 'Technical Task';
  return '';
}

export function getPriorityDisplayLabel(priority: Priority): string {
  if (!priority) return 'Medium';
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function getPriorityIconPath(priority: Priority): string {
  switch (priority) {
    case 'urgent':
      return '/Assets/icons/red-arrows-up-icon.svg';
    case 'medium':
      return '/Assets/icons/equal-orange-icon.svg';
    case 'low':
      return '/Assets/icons/arrow-down-green-icon.svg';
    default:
      return '/Assets/icons/equal-orange-icon.svg';
  }
}
