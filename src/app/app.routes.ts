import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';

export const routes: Routes = [
  {
    path: 'projects',
    loadChildren: () =>
      loadRemoteModule('mfe-projects', './Module').then((m) => m.remoteRoutes),
  },
  {
    path: 'reports',
    loadChildren: () =>
      loadRemoteModule('mfe-reports', './Module').then((m) => m.remoteRoutes),
  },
  {
    path: 'admin',
    loadChildren: () =>
      loadRemoteModule('mfe-admin', './Module').then((m) => m.remoteRoutes),
  },
  {
    path: 'governance',
    loadChildren: () =>
      loadRemoteModule('mfe-governance', './Module').then((m) => m.remoteRoutes),
  },
  { path: '', redirectTo: 'projects', pathMatch: 'full' },
  { path: '**', redirectTo: 'projects' },
];
