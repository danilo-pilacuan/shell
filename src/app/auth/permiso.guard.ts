import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import {
  EtapaCicloVida,
  Rol,
  sesionStore,
  tienePermiso,
} from '@projecthub/shared';

/**
 * Guard de permisos (docs/funcionalidades.md 1.7): evalua si el rol del
 * usuario activo habilita una accion segun la etapa configurada en
 * route.data. Si no hay sesion redirige al dashboard; si hay sesion pero
 * sin permiso redirige a la vista "sin permisos" conservando el destino
 * en el query param `de`.
 */
export const permisoGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const data = route.data as {
    accion?: string;
    etapa?: string;
    roles?: string[];
  };
  const sesion = sesionStore();
  const router = inject(Router);

  if (!sesion.haySesion()) {
    return router.createUrlTree(['/']);
  }

  const roles = sesion.rolesActivos();

  // Modo estricto por roles: basta que el usuario tenga uno de data.roles.
  if (Array.isArray(data.roles) && data.roles.length > 0) {
    const requeridos = data.roles;
    const tieneRol = roles.some((r) => requeridos.includes(r));
    return tieneRol
      ? true
      : router.createUrlTree(['/sin-permisos'], { queryParams: { de: state.url } });
  }

  // Modo matriz: data.accion + data.etapa consultan la matriz de permisos.
  const etapa = data.etapa as EtapaCicloVida | undefined;
  const accion = data.accion as never;
  if (etapa && accion && tienePermiso(etapa, accion, roles as readonly Rol[])) {
    return true;
  }
  return router.createUrlTree(['/sin-permisos'], { queryParams: { de: state.url } });
};

