import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { AutenticacionService, ETIQUETA_ROL, sesionStore } from '@projecthub/shared';

/**
 * Area de sesion del header. Solo sesion real (10.3): muestra el usuario
 * autenticado, sus roles y los botones de perfil y cierre; sin sesion
 * ofrece el acceso al login. La identidad la determina el backend (10.2):
 * no existe cambio de usuario sin credenciales. Nombre moderno del antiguo
 * user-switcher, que dejo de ser un selector mock (it. 55).
 */
@Component({
  selector: 'app-sesion-usuario',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, RouterLink],
  template: `
    @if (sesion.usuarioActivo(); as actor) {
      <div class="sesion-usuario real">
        <span class="nombre">{{ actor.nombre }}</span>
        <span class="roles">
          @for (rol of actor.roles; track $index) {
            <span class="rol">{{ ETIQUETA_ROL[rol] }}</span>
          }
        </span>
        <button type="button" mat-button class="boton" (click)="irAPerfil()" aria-label="Cambiar contrasena">
          Cambiar contrasena
        </button>
        <button type="button" mat-button class="boton" (click)="cerrarSesion()" aria-label="Cerrar sesion">
          Cerrar sesion
        </button>
      </div>
    } @else {
      <a mat-button class="boton" routerLink="/login">Iniciar sesion</a>
    }
  `,
  styles: [
    `
      .sesion-usuario {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8125rem;
      }
      .roles {
        display: flex;
        gap: 0.25rem;
      }
      .nombre {
        font-weight: 600;
      }
      .boton {
        padding: 0.3rem 0.55rem;
        border: 1px solid var(--ph-borde, #d5dae2);
        border-radius: var(--ph-radio, 8px);
        background: var(--ph-superficie, #fff);
        color: var(--ph-texto, #1c2430);
        font: inherit;
        font-size: 0.75rem;
        cursor: pointer;
      }
      .boton:hover {
        border-color: var(--ph-primario, #1c5fd6);
        color: var(--ph-primario, #1c5fd6);
      }
      .rol {
        padding: 0.1rem 0.45rem;
        border-radius: 999px;
        background: var(--ph-fondo, #f4f6fa);
        border: 1px solid var(--ph-borde, #d5dae2);
        font-size: 0.6875rem;
      }
    `,
  ],
})
export class SesionUsuario {
  protected readonly sesion = sesionStore();
  protected readonly auth = inject(AutenticacionService);
  protected readonly ETIQUETA_ROL = ETIQUETA_ROL;
  private readonly router = inject(Router);

  /** Cierra la sesion real y vuelve a la pantalla de login. */
  protected cerrarSesion(): void {
    this.auth.cerrarSesion();
    void this.router.navigateByUrl('/login');
  }

  /** Cambio de contrasena propia (14.5) en la pantalla de perfil. */
  protected irAPerfil(): void {
    void this.router.navigateByUrl('/perfil');
  }
}
