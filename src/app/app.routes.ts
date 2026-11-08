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
 *
 * `cargar` es inyectable para poder probar el camino de fallo en unit tests
 * sin depender de la federacion real.
 */
export function cargaRemote(
  remote: string,
  cargar: (remote: string, exposed: string) => Promise<unknown> = loadRemoteModule,
): Route {
  return {
    loadChildren: () =>
      cargar(remote, './Module')
        .then((m) => (m as { remoteRoutes: Routes }).remoteRoutes)
        .catch((error: unknown) => {
          // El fallback es silencioso por diseno (degradacion elegante), pero
          // sin este registro la causa real del fallo queda oculta (p. ej. un
          // dev server sirviendo un build desactualizado); el error debe
          // persistir en consola para poder diagnosticar.
          console.warn(
            `[federacion] No se pudo cargar '${remote}' ('./Module'); se muestra el fallback.`,
            error,
          );
          return fallbackRoutes(remote);
        }),
  };
}

function remoteConFallback(remote: string): Route {
  return cargaRemote(remote);
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
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((m) => m.Login),
    title: 'Iniciar sesion - ProjectHub',
  },
  {
    path: 'perfil',
    canActivate: [sesionGuard],
    loadComponent: () => import('./perfil/perfil').then((m) => m.Perfil),
    title: 'Mi perfil - ProjectHub',
  },
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
