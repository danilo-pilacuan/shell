import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {
  ApiEnlaceService,
  AutenticacionService,
  sesionStore,
} from '@projecthub/shared';

/**
 * Guard de sesion (docs/funcionalidades.md 1.7, sesion real 10.3):
 * sin usuario autenticado no hay navegacion a secciones protegidas;
 * redirige a /login conservando el destino en `de` para reanudarlo tras
 * iniciar sesion. Con token presente pero sesion aun restaurandose se
 * concede el paso (la restauracion ocurre en el app initializer).
 */
export const sesionGuard: CanActivateFn = (_route, state) => {
  const sesion = sesionStore();
  const router = inject(Router);
  const enlace = inject(ApiEnlaceService);
  const autenticacion = inject(AutenticacionService);

  if (sesion.haySesion()) {
    return true;
  }
  if (enlace.disponible && autenticacion.sesionReal()) {
    // Token presente con sesion aun restaurandose; se concede el paso.
    return true;
  }
  return router.createUrlTree(['/login'], { queryParams: { de: state.url } });
};
