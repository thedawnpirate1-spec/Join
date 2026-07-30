import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

/** Minimal shape a subtask needs to be rendered/edited in this list. */
export interface SubtaskListItem {
  id: string;
  title: string;
}

/**
 * Add/edit/delete UI for a list of subtasks, shared between add-task and edit-task.
 * The parent owns the actual data and decides how add/update/remove are persisted.
 */
@Component({
  selector: 'app-subtask-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './subtask-list.html',
  styleUrl: './subtask-list.scss',
})
export class SubtaskList {
  @Input() subtasks: SubtaskListItem[] = [];
  @Output() add = new EventEmitter<string>();
  @Output() update = new EventEmitter<{ id: string; title: string }>();
  @Output() remove = new EventEmitter<string>();

  newTitle = '';
  editingId: string | null = null;
  editedTitle = '';

  /** Emits the trimmed new-subtask title and clears the input, ignoring blank input. */
  addSubtask() {
    const title = this.newTitle.trim();
    if (!title) return;
    this.add.emit(title);
    this.newTitle = '';
  }

  /** Clears the new-subtask input. */
  clearInput() {
    this.newTitle = '';
  }

  /** Enters edit mode for a subtask without letting the click bubble further. */
  startEdit(item: SubtaskListItem, event: MouseEvent) {
    event.stopPropagation();
    this.editingId = item.id;
    this.editedTitle = item.title;
  }

  /** Leaves edit mode, discarding any in-progress edit. */
  cancelEdit() {
    this.editingId = null;
    this.editedTitle = '';
  }

  /** Saves the edited title, or removes the subtask if the edit was cleared to blank. */
  saveEdit(id: string) {
    const title = this.editedTitle.trim();
    if (!title) {
      this.removeSubtask(id);
      return;
    }
    this.update.emit({ id, title });
    this.cancelEdit();
  }

  /** Emits removal of a subtask, exiting edit mode first if it was being edited. */
  removeSubtask(id: string) {
    if (this.editingId === id) {
      this.cancelEdit();
    }
    this.remove.emit(id);
  }
}
