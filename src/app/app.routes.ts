import { Route, Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { Dashboard } from './dashboard/dashboard';
import { permisoGuard } from './auth/permiso.guard';
import { sesionGuard } from './auth/sesion.guard';

/**
 * Carga un remote y devuelve su configuracion de ruta; si el remote no
 * responde, muestra el fallback en su zona de contenido y el resto de la
 * aplicacion sigue funcionando (rulebook: degradacion elegante).
 * Devuelve un objeto Route (no un arreglo): el punto de uso lo expande
 * dentro de la ruta con path propio.
 */
function remoteConFallback(remote: string): Route {
  return {
    loadChildren: () =>
      loadRemoteModule(remote, './Module')
        .then((m) => m.remoteRoutes)
        .catch(() => fallbackRoutes(remote)),
  };
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
  { path: 'projects', canActivate: [sesionGuard], ...remoteConFallback('mfe-projects') },
  { path: 'reports', canActivate: [sesionGuard], ...remoteConFallback('mfe-reports') },
  {
    path: 'admin',
    canActivate: [sesionGuard, permisoGuard],
    data: { roles: ['Admin'] },
    ...remoteConFallback('mfe-admin'),
  },
  { path: 'governance', canActivate: [sesionGuard], ...remoteConFallback('mfe-governance') },
  {
    path: 'sin-permisos',
    loadComponent: () =>
      import('./sin-permisos/sin-permisos').then((m) => m.SinPermisos),
    title: 'Sin permisos - ProjectHub',
  },
  { path: '**', redirectTo: '' },
];
