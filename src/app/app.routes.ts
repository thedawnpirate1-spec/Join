import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./mainside/mainside').then((m) => m.Mainside),
  },
  {
    path: 'help',
    loadComponent: () => import('./help/help').then((m) => m.Help),
  },
];
