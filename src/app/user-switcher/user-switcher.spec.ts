import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { MatSelect } from '@angular/material/select';
import { UserSwitcher } from './user-switcher';

describe('UserSwitcher', () => {
  it('ofrece solo usuarios activos de la semilla', async () => {
    await TestBed.configureTestingModule({
      imports: [UserSwitcher],
    }).compileComponents();

    const fixture = TestBed.createComponent(UserSwitcher);
    await fixture.whenStable();
    fixture.detectChanges();

    const select = fixture.debugElement.query(By.css('mat-select'))
      .componentInstance as MatSelect;

    const opciones = select.options.map((o) => o.viewValue.trim());
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

    fixture.componentInstance.seleccionar('u-pm');
    await fixture.whenStable();
    fixture.detectChanges();

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

    fixture.componentInstance.seleccionar('u-admin');
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

    fixture.componentInstance.seleccionar('u-admin');
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/');
  });
});
