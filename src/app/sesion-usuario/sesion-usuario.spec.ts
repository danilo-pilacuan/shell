import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { SESION_STORE, Usuario } from '@projecthub/shared';
import { SesionUsuario } from './sesion-usuario';

/** Usuario autenticado de los tests (equivale a un login exitoso). */
const DIANA: Usuario = {
  id: 'u-admin',
  nombre: 'Diana Admin',
  correo: 'diana@projecthub.local',
  roles: ['Admin'],
  activo: true,
};

async function montar() {
  await TestBed.configureTestingModule({
    imports: [SesionUsuario],
    providers: [provideRouter([{ path: 'login', component: PaginaLogin }])],
  }).compileComponents();
  const fixture = TestBed.createComponent(SesionUsuario);
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

/** Destino minimo de login para verificar la navegacion del cierre. */
@Component({ template: '' })
class PaginaLogin {}

describe('SesionUsuario', () => {
  it('sin sesion muestra el enlace de inicio de sesion', async () => {
    const fixture = await montar();
    const texto = fixture.nativeElement.textContent ?? '';
    expect(texto).toContain('Iniciar sesion');
    expect(texto).not.toContain('Diana Admin');
  });

  it('con sesion real muestra el usuario, sus roles y cerrar sesion', async () => {
    const fixture = await montar();
    TestBed.inject(SESION_STORE).fijarUsuario(DIANA);
    await fixture.whenStable();
    fixture.detectChanges();
    const texto = fixture.nativeElement.textContent ?? '';
    expect(texto).toContain('Diana Admin');
    expect(texto).toContain('Admin');
    expect(texto).toContain('Cambiar contrasena');
    expect(texto).toContain('Cerrar sesion');
    expect(texto).not.toContain('Usuario activo');
  });

  it('cerrarSesion limpia la sesion y navega a /login', async () => {
    const fixture = await montar();
    TestBed.inject(SESION_STORE).fijarUsuario(DIANA);
    await fixture.whenStable();
    fixture.detectChanges();
    (fixture.componentInstance as unknown as { cerrarSesion: () => void }).cerrarSesion();
    await fixture.whenStable();
    expect(TestBed.inject(SESION_STORE).haySesion()).toBe(false);
    expect(TestBed.inject(Router).url).toBe('/login');
  });
});