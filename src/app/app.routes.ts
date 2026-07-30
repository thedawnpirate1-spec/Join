import { Routes } from '@angular/router';
import { authGuard } from './core/services/auth.guard';

/** Top-level route table; all pages except login/signup/help/legal require authentication. */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((m) => m.Login),
  },
  {
    path: 'summary',
    loadComponent: () => import('./summary/summary').then((m) => m.Summary),
    canActivate: [authGuard],
  },
  {
    path: 'contacts',
    loadComponent: () => import('./contacts/contacts').then((m) => m.Contacts),
    canActivate: [authGuard],
  },
  {
    path: 'board',
    loadComponent: () => import('./board/board').then((m) => m.Board),
    canActivate: [authGuard],
  },
  {
    path: 'add-task',
    loadComponent: () => import('./add-task/add-task').then((m) => m.AddTask),
    canActivate: [authGuard],
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
  {
    path: 'signup',
    loadComponent: () => import('./signup/signup').then((m) => m.Signup),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
