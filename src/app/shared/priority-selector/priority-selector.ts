import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Priority } from '../../core/models/task.model';

/** Urgent/Medium/Low priority picker, shared between add-task and edit-task. */
@Component({
  selector: 'app-priority-selector',
  standalone: true,
  templateUrl: './priority-selector.html',
  styleUrl: './priority-selector.scss',
})
export class PrioritySelector {
  @Input() priority: Priority = 'medium';
  @Output() priorityChange = new EventEmitter<Priority>();

  /** Emits the newly chosen priority. */
  select(priority: Priority) {
    this.priorityChange.emit(priority);
  }
}
