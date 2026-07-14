import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./mainside/mainside').then((m) => m.Mainside),
  },
  {
    path: 'contacts',
    loadComponent: () => import('./contacts/contacts').then((m) => m.Contacts),
  },
  {
    path: 'board',
    loadComponent: () => import('./board/board').then((m) => m.Board),
  },
  {
    path: 'add-task',
    loadComponent: () => import('./add-task/add-task').then((m) => m.AddTask),
  },
  {
    path: 'help',
    loadComponent: () => import('./help/help').then((m) => m.Help),
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./privacy-policy/privacy-policy').then((m) => m.PrivacyPolicy),
  },
  {
    path: 'legal-notice',
    loadComponent: () => import('./legal-notice/legal-notice').then((m) => m.LegalNotice),
  },
];
