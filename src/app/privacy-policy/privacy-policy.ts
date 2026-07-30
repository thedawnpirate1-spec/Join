import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Static privacy policy page. */
@Component({
  selector: 'app-privacy-policy',
  imports: [RouterLink],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.scss',
})
export class PrivacyPolicy {}
