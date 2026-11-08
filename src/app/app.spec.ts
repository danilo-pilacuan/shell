import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { ApiEnlaceService, TokenAlmacen } from '@projecthub/shared';
import { App } from './app';

/** Ruta stub para navegaciones del router en tests. */
@Component({ selector: 'app-dummy', template: '' })
class DummyRoute {}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: 'projects', component: DummyRoute },
          { path: 'login', component: DummyRoute },
        ]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
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

    const selector = compiled.querySelector('app-user-switcher mat-select');
    expect(selector).not.toBeNull();
  });

  it('oculta el banner de backend caido cuando la API responde', async () => {
    const fixture = TestBed.createComponent(App);
    const enlace = TestBed.inject(ApiEnlaceService);
    enlace.marcar(true);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.shell-banner-api')).toBeNull();
  });

  it('muestra el banner de modo demo cuando el backend no responde', async () => {
    const fixture = TestBed.createComponent(App);
    const enlace = TestBed.inject(ApiEnlaceService);
    enlace.marcar(false);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    const banner = compiled.querySelector('.shell-banner-api');
    expect(banner).not.toBeNull();
    expect(banner?.textContent).toContain('Sin conexion con el backend');
    expect(banner?.textContent).toContain('modo demo');
  });

  it('el banner desaparece cuando el backend se recupera (sondeo de salud)', async () => {
    const fixture = TestBed.createComponent(App);
    const enlace = TestBed.inject(ApiEnlaceService);
    enlace.marcar(false);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.shell-banner-api')).not.toBeNull();

    enlace.marcar(true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.shell-banner-api')).toBeNull();
  });

  it('redirige a /login?expirada=1 cuando el backend invalida la sesion (14.6)', async () => {
    TestBed.inject(TokenAlmacen).guardar('jwt-vigente');
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/projects');
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const enlace = TestBed.inject(ApiEnlaceService);
    const promesa = enlace.lista('/api/usuarios');
    TestBed.inject(HttpTestingController)
      .expectOne('http://localhost:8100/api/usuarios')
      .flush(
        { detail: { codigo: 'SESION_INVALIDA', mensaje: 'Tu sesion ha expirado.' } },
        { status: 401, statusText: 'Unauthorized' },
      );
    await promesa;
    await fixture.whenStable();

    expect(router.url).toBe('/login?expirada=1');
    expect(TestBed.inject(TokenAlmacen).leer()).toBeNull();
  });
});
