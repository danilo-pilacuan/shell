import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  ApiEnlaceService,
  SESION_STORE,
  SesionStore,
  TokenAlmacen,
} from '@projecthub/shared';
import { permisoGuard } from './permiso.guard';
import { sesionGuard } from './sesion.guard';

/** Snapshot minimo para invocar los guards funcionales en unit tests. */
function snapshot(data: Record<string, unknown> = {}): ActivatedRouteSnapshot {
  return { data } as unknown as ActivatedRouteSnapshot;
}

function estado(url: string): RouterStateSnapshot {
  return { url } as unknown as RouterStateSnapshot;
}

describe('sesionGuard', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    TestBed.inject(TokenAlmacen).limpiar();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    TestBed.inject(TokenAlmacen).limpiar();
    // Los guards no hacen peticiones; verify confirma que no las hubo.
    httpMock.verify();
  });

  it('permite navegar con sesion activa', () => {
    TestBed.inject<SesionStore>(SESION_STORE).seleccionar('u-admin');

    const resultado = TestBed.runInInjectionContext(() =>
      sesionGuard(snapshot(), estado('/admin')),
    );
    expect(resultado).toBe(true);
  });

  it('redirige a /login sin sesion con backend disponible (fase 14)', () => {
    const router = TestBed.inject(Router);
    const resultado = TestBed.runInInjectionContext(() =>
      sesionGuard(snapshot(), estado('/admin')),
    );
    expect(resultado).not.toBe(true);
    expect(router.serializeUrl(resultado as UrlTree)).toBe('/login?de=%2Fadmin');
  });

  it('redirige al dashboard sin sesion cuando el backend no responde (modo demo)', () => {
    TestBed.inject(ApiEnlaceService).marcar(false);

    const router = TestBed.inject(Router);
    const resultado = TestBed.runInInjectionContext(() =>
      sesionGuard(snapshot(), estado('/admin')),
    );
    expect(resultado).not.toBe(true);
    expect(router.serializeUrl(resultado as UrlTree)).toBe('/?de=%2Fadmin');
  });

  it('permite navegar con token de sesion real aunque la sesion tarde en restaurarse', () => {
    TestBed.inject(TokenAlmacen).guardar('jwt-de-prueba');

    const resultado = TestBed.runInInjectionContext(() =>
      sesionGuard(snapshot(), estado('/admin')),
    );
    expect(resultado).toBe(true);
  });
});

describe('permisoGuard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
    }).compileComponents();
    TestBed.inject(TokenAlmacen).limpiar();
  });

  afterEach(() => {
    TestBed.inject(TokenAlmacen).limpiar();
  });

  it('permite entrar a /admin con rol Admin', () => {
    TestBed.inject<SesionStore>(SESION_STORE).seleccionar('u-admin');

    const resultado = TestBed.runInInjectionContext(() =>
      permisoGuard(snapshot({ roles: ['Admin'] }), estado('/admin')),
    );
    expect(resultado).toBe(true);
  });

  it('redirige a /sin-permisos sin el rol requerido', () => {
    // Paula es ProjectManager: sin rol Admin.
    TestBed.inject<SesionStore>(SESION_STORE).seleccionar('u-pm');

    const router = TestBed.inject(Router);
    const resultado = TestBed.runInInjectionContext(() =>
      permisoGuard(snapshot({ roles: ['Admin'] }), estado('/admin')),
    );
    expect(resultado).not.toBe(true);
    expect(router.serializeUrl(resultado as UrlTree)).toBe('/sin-permisos?de=%2Fadmin');
  });

  it('permite con modo matriz cuando el rol habilita la accion en la etapa', () => {
    // Diana Admin tiene SOLO_GOBERNANZA: habilita cancelarProyecto en Ejecucion.
    TestBed.inject<SesionStore>(SESION_STORE).seleccionar('u-admin');

    const resultado = TestBed.runInInjectionContext(() =>
      permisoGuard(
        snapshot({ accion: 'cancelarProyecto', etapa: 'Ejecucion' }),
        estado('/projects/detalle/p1'),
      ),
    );
    expect(resultado).toBe(true);
  });

  it('redirige a /sin-permisos en modo matriz sin permiso', () => {
    // Andres Analista no habilita cancelarProyecto en Ejecucion.
    TestBed.inject<SesionStore>(SESION_STORE).seleccionar('u-analista');

    const resultado = TestBed.runInInjectionContext(() =>
      permisoGuard(
        snapshot({ accion: 'cancelarProyecto', etapa: 'Ejecucion' }),
        estado('/projects/detalle/p1'),
      ),
    );
    expect(resultado).not.toBe(true);
    const router = TestBed.inject(Router);
    expect(router.serializeUrl(resultado as UrlTree)).toBe(
      '/sin-permisos?de=%2Fprojects%2Fdetalle%2Fp1',
    );
  });
});
