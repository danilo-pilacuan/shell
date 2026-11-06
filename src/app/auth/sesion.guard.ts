import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {
  ApiEnlaceService,
  AutenticacionService,
  sesionStore,
} from '@projecthub/shared';

/**
 * Guard de sesion (docs/funcionalidades.md 1.7, extendido en fase 14):
 * sin usuario activo no hay navegacion a secciones protegidas.
 * - Con backend disponible: redirige a /login (autenticacion real) conservando
 *   el destino en `de` para reanudarlo tras iniciar sesion.
 * - Sin backend (modo demo, degradacion elegante): conserva el comportamiento
 *   previo (dashboard con el selector de sesion simulada).
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
  const destino = enlace.disponible ? '/login' : '/';
  return router.createUrlTree([destino], { queryParams: { de: state.url } });
};
