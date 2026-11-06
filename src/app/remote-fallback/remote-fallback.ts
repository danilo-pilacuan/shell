import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * Fallback cuando un remote no carga (rulebook): mensaje en la zona de
 * contenido del remote caido; el resto de la aplicacion sigue funcionando.
 */
@Component({
  selector: 'app-remote-fallback',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="remote-fallback" role="alert">
      <h2>Modulo no disponible</h2>
      <p>
        El modulo <code>{{ remote }}</code> no se pudo cargar en este momento.
        El resto de la aplicacion sigue funcionando.
      </p>
    </section>
  `,
  styles: [
    `
      .remote-fallback {
        padding: 1.25rem;
        border: 1px solid var(--ph-peligro, #c62828);
        border-radius: var(--ph-radio, 8px);
        background: #fdecea;
        color: var(--ph-peligro, #c62828);

        h2 {
          margin: 0 0 0.5rem;
          font-size: 1.05rem;
        }

        p {
          margin: 0;
          font-size: 0.875rem;
        }
      }
    `,
  ],
})
export class RemoteFallback {
  private readonly route = inject(ActivatedRoute);

  protected readonly remote = this.route.snapshot.data['remote'] ?? 'remote';
}
