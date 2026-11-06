import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SinPermisos } from './sin-permisos';

describe('SinPermisos', () => {
  it('muestra el aviso sin destino cuando no hay query param', async () => {
    await TestBed.configureTestingModule({
      imports: [SinPermisos],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(SinPermisos);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Sin permisos');
  });
});
