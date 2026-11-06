import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TokenAlmacen } from '@projecthub/shared';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    TestBed.inject(TokenAlmacen).limpiar();
  });

  afterEach(() => {
    TestBed.inject(TokenAlmacen).limpiar();
  });

  it('muestra el titulo y la navegacion de primer nivel', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.shell-title')?.textContent).toContain('ProjectHub');

    const links = Array.from(compiled.querySelectorAll('nav a')).map((a) =>
      a.textContent?.trim(),
    );
    expect(links).toEqual([
      'Proyectos',
      'Reportes',
      'Administracion',
      'Gobernanza',
    ]);
  });

  it('incluye el selector de usuario activo en el header', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    const selector = compiled.querySelector('app-user-switcher select');
    expect(selector).not.toBeNull();
  });
});
