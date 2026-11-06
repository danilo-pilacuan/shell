import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ETIQUETA_ROL, sesionStore } from '@projecthub/shared';

/**
 * Selector de usuario activo (1.6): sesion simulada que determina todos los
 * permisos. Solo ofrece usuarios activos (1.8).
 */
@Component({
  selector: 'app-user-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
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
  protected readonly ETIQUETA_ROL = ETIQUETA_ROL;

  protected seleccionar(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    if (!id) {
      this.sesion.cerrar();
      return;
    }
    try {
      this.sesion.seleccionar(id);
    } catch {
      // Un usuario inactivo no aparece en el selector; no deberia ocurrir.
    }
  }
}
