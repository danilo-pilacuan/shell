import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { Dashboard } from './dashboard/dashboard';

/**
 * Carga un remote y devuelve sus rutas; si el remote no responde, muestra el
 * fallback en su zona de contenido y el resto de la aplicacion sigue
 * funcionando (rulebook: degradacion elegante).
 */
function remoteConFallback(remote: string): Routes {
  return [
    {
      loadChildren: () =>
        loadRemoteModule(remote, './Module')
          .then((m) => m.remoteRoutes)
          .catch(() => fallbackRoutes(remote)),
    },
  ];
}

function fallbackRoutes(remote: string): Routes {
  return [
    {
      path: '**',
      loadComponent: () =>
        import('./remote-fallback/remote-fallback').then((m) => m.RemoteFallback),
      data: { remote },
    },
  ];
}

export const routes: Routes = [
  { path: '', component: Dashboard, title: 'ProjectHub' },
  { path: 'projects', ...remoteConFallback('mfe-projects') },
  { path: 'reports', ...remoteConFallback('mfe-reports') },
  { path: 'admin', ...remoteConFallback('mfe-admin') },
  { path: 'governance', ...remoteConFallback('mfe-governance') },
  { path: '**', redirectTo: '' },
];
