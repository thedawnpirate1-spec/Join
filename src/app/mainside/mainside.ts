import { Component } from '@angular/core';

@Component({
  selector: 'app-mainside',
  imports: [],
  templateUrl: './mainside.html',
  styleUrl: './mainside.scss',
})
export class Mainside {
  todoCount = 1;
  doneCount = 1;
  urgentCount = 1;
  boardCount = 5;
  progressCount = 2;
  feedbackCount = 2;
  upcomingDeadline = 'October 16, 2026';
  userName = 'Sofia Müller';
}
