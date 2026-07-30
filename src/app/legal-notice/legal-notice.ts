import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Static legal notice (Impressum) page. */
@Component({
  selector: 'app-legal-notice',
  imports: [RouterLink],
  templateUrl: './legal-notice.html',
  styleUrl: './legal-notice.scss',
})
export class LegalNotice {}
