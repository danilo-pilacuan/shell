import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
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
        <button type="button" (click)="cerrarSesion()" aria-label="Cerrar sesion">
          Cerrar sesion
        </button>
      </div>
    } @else {
      <label class="user-switcher">
        <span class="etiqueta">Sesion</span>
        <select
          [value]="sesion.usuarioActivo()?.id ?? ''"
          (change)="seleccionar($event)"
          aria-label="Usuario activo"
        >
          <option value="" disabled [selected]="!sesion.haySesion()">Sin sesion</option>
          @for (u of sesion.usuariosActivos(); track u.id) {
            <option [value]="u.id" [selected]="sesion.usuarioActivo()?.id === u.id">
              {{ u.nombre }}
            </option>
          }
        </select>
        @if (sesion.usuarioActivo(); as actor) {
          <span class="roles">
            @for (rol of actor.roles; track rol) {
              <span class="rol">{{ ETIQUETA_ROL[rol] }}</span>
            }
          </span>
        }
      </label>
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
      select {
        padding: 0.3rem 0.45rem;
        border: 1px solid var(--ph-borde, #d5dae2);
        border-radius: var(--ph-radio, 8px);
        background: var(--ph-superficie, #fff);
        color: var(--ph-texto, #1c2430);
      }
      .roles {
        display: flex;
        gap: 0.25rem;
      }
      .nombre {
        font-weight: 600;
      }
      button {
        padding: 0.3rem 0.55rem;
        border: 1px solid var(--ph-borde, #d5dae2);
        border-radius: var(--ph-radio, 8px);
        background: var(--ph-superficie, #fff);
        color: var(--ph-texto, #1c2430);
        font: inherit;
        font-size: 0.75rem;
        cursor: pointer;
      }
      button:hover {
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

  protected seleccionar(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
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
