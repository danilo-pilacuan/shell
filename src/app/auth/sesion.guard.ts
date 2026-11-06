import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { sesionStore } from '@projecthub/shared';

/**
 * Guard de sesion (docs/funcionalidades.md 1.7): sin usuario activo no hay
 * navegacion a secciones protegidas. Redirige al dashboard conservando el
 * destino en `de` para que el usuario pueda iniciar sesion y volver.
 */
export const sesionGuard: CanActivateFn = (_route, state) => {
  const sesion = sesionStore();
  const router = inject(Router);

  if (sesion.haySesion()) {
    return true;
  }
  return router.createUrlTree(['/'], { queryParams: { de: state.url } });
};
