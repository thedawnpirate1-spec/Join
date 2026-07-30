import { Component } from '@angular/core';

/** Static help/FAQ page. */
@Component({
  selector: 'app-help',
  imports: [],
  templateUrl: './help.html',
  styleUrl: './help.scss'
})
export class Help {
  /** Navigates back to the previous page in browser history. */
  goBack(): void {
    history.back();
  }
}
