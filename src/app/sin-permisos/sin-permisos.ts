import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * Vista "sin permisos" (docs/funcionalidades.md 1.7): se muestra cuando el
 * rol del usuario activo no esta habilitado para la seccion solicitada.
 * El resto de la aplicacion sigue funcionando; para cambiar de identidad se
 * cierra la sesion y se vuelve a autenticar con otras credenciales (10.2).
 */
@Component({
  selector: 'app-sin-permisos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="sin-permisos" role="alert">
      <h2>Sin permisos</h2>
      <p>
        Tu usuario activo no tiene un rol habilitado para esta seccion.
        @if (destino) {
          Seccion solicitada: <code>{{ destino }}</code
          >.
        }
      </p>
      <p>
        Pide a un administrador que asigne el rol requerido, o cierra la
        sesion y autenticate con un usuario habilitado.
        @if (destino) {
          Intenta de nuevo desde <code>/{{ destino }}</code
          >.
        }
      </p>
    </section>
  `,
  styles: [
    `
      .sin-permisos {
        padding: 1.25rem;
        border: 1px solid var(--ph-advertencia, #ef6c00);
        border-radius: var(--ph-radio, 8px);
        background: #fff3e0;
        color: var(--ph-advertencia, #ef6c00);

        h2 {
          margin: 0 0 0.5rem;
          font-size: 1.05rem;
        }

        p {
          margin: 0 0 0.5rem;
          font-size: 0.875rem;
          color: var(--ph-texto, #37474f);
        }

        p:last-child {
          margin-bottom: 0;
        }
      }
    `,
  ],
})
export class SinPermisos {
  private readonly route = inject(ActivatedRoute);

  /** Seccion original solicitada (query param `de` que deja el guard). */
  protected readonly destino = this.route.snapshot.queryParamMap.get('de') ?? '';
}
