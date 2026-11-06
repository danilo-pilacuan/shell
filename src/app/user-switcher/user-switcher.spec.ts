import { TestBed } from '@angular/core/testing';
import { UserSwitcher } from './user-switcher';

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
});
