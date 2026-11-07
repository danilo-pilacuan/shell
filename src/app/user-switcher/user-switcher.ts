import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AutenticacionService, ETIQUETA_ROL, sesionStore } from '@projecthub/shared';

/**
 * Area de sesion del header. Dos modos:
 * - Sesion real (fase 14, token del login): muestra el usuario autenticado,
 *   sus roles y el boton Cerrar sesion; el selector de usuarios desaparece
 *   porque la identidad la determina el backend.
 * - Modo demo (sin backend): selector de usuario activo (1.6) de la sesion
 *   simulada, solo usuarios activos (1.8). Al seleccionar, si la navegacion
 *   previa fue redirigida por sesionGuard/permisoGuard y quedo guardada en
 *   el query param `de`, reanuda esa ruta (promesa del guard 1.7).
 */
@Component({
  selector: 'app-user-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    @if (auth.sesionReal()) {
      <div class="user-switcher real">
        @if (sesion.usuarioActivo(); as actor) {
          <span class="nombre">{{ actor.nombre }}</span>
          <span class="roles">
            @for (rol of actor.roles; track rol) {
              <span class="rol">{{ ETIQUETA_ROL[rol] }}</span>
            }
          </span>
        }
        <button type="button" mat-button class="boton" (click)="irAPerfil()" aria-label="Cambiar contrasena">
          Cambiar contrasena
        </button>
        <button type="button" mat-button class="boton" (click)="cerrarSesion()" aria-label="Cerrar sesion">
          Cerrar sesion
        </button>
      </div>
    } @else {
      <div class="user-switcher demo">
        <span class="etiqueta">Sesion</span>
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="campo">
          <mat-label>Usuario activo</mat-label>
          <mat-select
            [value]="sesion.usuarioActivo()?.id ?? ''"
            (selectionChange)="seleccionar($any($event).value)"
          >
            <mat-option value="" [disabled]="true">Sin sesion</mat-option>
            @for (u of sesion.usuariosActivos(); track u.id) {
              <mat-option [value]="u.id">{{ u.nombre }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        @if (sesion.usuarioActivo(); as actor) {
          <span class="roles">
            @for (rol of actor.roles; track rol) {
              <span class="rol">{{ ETIQUETA_ROL[rol] }}</span>
            }
          </span>
        }
      </div>
    }
  `,
  styles: [
    `
      .user-switcher {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8125rem;
      }
      .etiqueta {
        color: var(--ph-texto-suave, #5b6472);
        text-transform: uppercase;
        letter-spacing: 0.03em;
        font-size: 0.6875rem;
      }
      .campo {
        width: 13rem;
        font-size: 0.8125rem;
        --mdc-outlined-text-field-container-color: var(--ph-superficie, #fff);
      }
      .roles {
        display: flex;
        gap: 0.25rem;
      }
      .nombre {
        font-weight: 600;
      }
      .boton {
        --mat-button-filled-container-color: var(--ph-primario, #1f5eff);
        --mat-button-filled-label-text-color: #fff;

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
export class UserSwitcher {
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

  seleccionar(id: string): void {
    if (!id) {
      this.sesion.cerrar();
      return;
    }
    try {
      this.sesion.seleccionar(id);
      this.irAlDestinoGuardado();
    } catch {
      // Un usuario inactivo no aparece en el selector; no deberia ocurrir.
    }
  }

  /**
   * Reanuda la ruta guardada en el query param `de` (puesto por sesionGuard
   * o permisoGuard). Solo URLs internas que empiezan con una sola barra;
   * descarta protocolos externos (javascript:, http:).
   */
  private irAlDestinoGuardado(): void {
    const destino = this.router.parseUrl(this.router.url).queryParams['de'];
    if (typeof destino !== 'string' || destino.length < 2) {
      return;
    }
    if (!destino.startsWith('/')) {
      return;
    }
    void this.router.navigateByUrl(destino);
  }
}
