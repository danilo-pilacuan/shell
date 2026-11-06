import { TestBed } from '@angular/core/testing';
import { UserSwitcher } from './user-switcher';
import { provideRouter, Router } from '@angular/router';

describe('UserSwitcher', () => {
  it('ofrece solo usuarios activos de la semilla', async () => {
    await TestBed.configureTestingModule({
      imports: [UserSwitcher],
    }).compileComponents();

    const fixture = TestBed.createComponent(UserSwitcher);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const opciones = Array.from(el.querySelectorAll('option')).map((o) =>
      o.textContent?.trim(),
    );
    // 6 activos + la opcion "Sin sesion"; Ivan Inactivo (u-inactivo) no aparece.
    expect(opciones.length).toBe(7);
    expect(opciones).toContain('Diana Admin');
    expect(opciones).not.toContain('Ivan Inactivo');
  });

  it('cambia el usuario activo al seleccionar', async () => {
    await TestBed.configureTestingModule({
      imports: [UserSwitcher],
    }).compileComponents();

    const fixture = TestBed.createComponent(UserSwitcher);
    await fixture.whenStable();

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = 'u-pm';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    const texto = fixture.nativeElement.textContent ?? '';
    expect(texto).toContain('Project Manager');
  });

  it('navega al destino guardado en ?de= al iniciar sesion', async () => {
    await TestBed.configureTestingModule({
      imports: [UserSwitcher],
      providers: [
        provideRouter([
          { path: 'reports', loadComponent: () => Promise.resolve(UserSwitcher) },
        ]),
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    await router.navigate(['/'], { queryParams: { de: '/reports' } });

    const fixture = TestBed.createComponent(UserSwitcher);
    await fixture.whenStable();

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = 'u-admin';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/reports');
  });

  it('no navega si no hay destino guardado', async () => {
    await TestBed.configureTestingModule({
      imports: [UserSwitcher],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(UserSwitcher);
    await fixture.whenStable();

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = 'u-admin';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/');
  });
});
