import { TestBed } from '@angular/core/testing';
import { REMOTE_MODULE_LOADER, type RemoteModuleLoader } from '@projecthub/shared';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  it('muestra las tres celdas de widgets federados', async () => {
    const loaderStub: RemoteModuleLoader = () => new Promise(() => undefined);
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [{ provide: REMOTE_MODULE_LOADER, useValue: loaderStub }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const celdas = el.querySelectorAll('.celda-widget');
    expect(celdas.length).toBe(3);

    // Sin remotes en el entorno de test, cada celda muestra carga o fallback,
    // nunca queda vacia.
    const estados = el.querySelectorAll('.cargando, .fallback, ph-summary-widget');
    expect(estados.length).toBeGreaterThanOrEqual(3);
  });
});
