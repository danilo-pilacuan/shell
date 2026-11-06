/** Tests de la pantalla de login (10.3, fase 14). */
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TokenAlmacen } from '@projecthub/shared';
import { Login } from './login';

const LOGIN_URL = 'http://localhost:8100/api/auth/login';

describe('Login', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<Login>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => null } } },
        },
      ],
    }).compileComponents();
    TestBed.inject(TokenAlmacen).limpiar();
    fixture = TestBed.createComponent(Login);
  });

  afterEach(() => {
    TestBed.inject(TokenAlmacen).limpiar();
    TestBed.inject(HttpTestingController).verify();
  });

  it('muestra el formulario con correo y contrasena', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Iniciar sesion');
    expect(el.querySelector('input[type="email"]')).not.toBeNull();
    expect(el.querySelector('input[type="password"]')).not.toBeNull();
  });

  it('envia las credenciales y muestra error ante 401', async () => {
    fixture.detectChanges();
    // Los miembros son protected; el test los maneja via esta vista de tipo.
    const comp = fixture.componentInstance as unknown as {
      correo: { set(v: string): void };
      contrasena: { set(v: string): void };
      entrar(e: Event): void;
    };
    comp.correo.set('diana@projecthub.local');
    comp.contrasena.set('incorrecta');
    comp.entrar(new Event('submit'));
    const req = TestBed.inject(HttpTestingController).expectOne(LOGIN_URL);
    expect(req.request.body).toEqual({
      correo: 'diana@projecthub.local',
      contrasena: 'incorrecta',
    });
    req.flush(
      { detail: { codigo: 'CREDENCIALES_INVALIDAS' } },
      { status: 401, statusText: 'Unauthorized' },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.error')?.textContent).toContain('incorrectos');
  });

  it('login valido guarda el token y despeja el error', async () => {
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      correo: { set(v: string): void };
      contrasena: { set(v: string): void };
      entrar(e: Event): void;
    };
    comp.correo.set('diana@projecthub.local');
    comp.contrasena.set('projecthub-demo');
    comp.entrar(new Event('submit'));
    const req = TestBed.inject(HttpTestingController).expectOne(LOGIN_URL);
    req.flush({
      token: 'jwt-e2e',
      usuario: {
        id: 'u-admin',
        nombre: 'Diana Admin',
        correo: 'diana@projecthub.local',
        roles: ['Admin'],
        activo: true,
      },
    });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(TestBed.inject(TokenAlmacen).leer()).toBe('jwt-e2e');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.error')).toBeNull();
  });
});
