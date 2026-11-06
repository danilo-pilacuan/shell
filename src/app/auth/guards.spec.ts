import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { SESION_STORE, SesionStore } from '@projecthub/shared';
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
  it('permite navegar con sesion activa', async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
    }).compileComponents();
    TestBed.inject<SesionStore>(SESION_STORE).seleccionar('u-admin');

    const resultado = TestBed.runInInjectionContext(() =>
      sesionGuard(snapshot(), estado('/admin')),
    );
    expect(resultado).toBe(true);
  });

  it('redirige al dashboard sin sesion activa', async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
    }).compileComponents();

    const router = TestBed.inject(Router);
    const resultado = TestBed.runInInjectionContext(() =>
      sesionGuard(snapshot(), estado('/admin')),
    );
    expect(resultado).not.toBe(true);
    expect(router.serializeUrl(resultado as UrlTree)).toBe('/?de=%2Fadmin');
  });
});

describe('permisoGuard', () => {
  it('permite entrar a /admin con rol Admin', async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
    }).compileComponents();
    TestBed.inject<SesionStore>(SESION_STORE).seleccionar('u-admin');

    const resultado = TestBed.runInInjectionContext(() =>
      permisoGuard(snapshot({ roles: ['Admin'] }), estado('/admin')),
    );
    expect(resultado).toBe(true);
  });

  it('redirige a /sin-permisos sin el rol requerido', async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
    }).compileComponents();
    // Paula es ProjectManager: sin rol Admin.
    TestBed.inject<SesionStore>(SESION_STORE).seleccionar('u-pm');

    const router = TestBed.inject(Router);
    const resultado = TestBed.runInInjectionContext(() =>
      permisoGuard(snapshot({ roles: ['Admin'] }), estado('/admin')),
    );
    expect(resultado).not.toBe(true);
    expect(router.serializeUrl(resultado as UrlTree)).toBe('/sin-permisos?de=%2Fadmin');
  });

  it('permite con modo matriz cuando el rol habilita la accion en la etapa', async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
    }).compileComponents();
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

  it('redirige a /sin-permisos en modo matriz sin permiso', async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
    }).compileComponents();
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
