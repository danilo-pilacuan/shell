import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormField } from '@projecthub/ui';
import {
  AutenticacionService,
  ErrorAutenticacion,
  sesionStore,
} from '@projecthub/shared';

/**
 * Perfil del usuario con sesion real (docs/funcionalidades.md 14.5).
 * Formulario de cambio de contrasena propia: exige la contrasena actual y
 * aplica la politica minima del backend (8+ caracteres, errores 401/422
 * mapeados a mensajes). Reutiliza las convenciones de Login: signals,
 * ocupado y error visible.
 */
@Component({
  selector: 'app-perfil',
  imports: [RouterLink, MatButton, MatInputModule, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="perfil">
      <h1>Mi perfil</h1>
      <p class="ayuda">
        Sesion de {{ actor()?.nombre ?? 'usuario' }} ({{ actor()?.correo }})
      </p>
      <form (submit)="guardar($event)">
        <ph-form-field label="Contrasena actual" [requerido]="true">
          <input
            matInput
            type="password"
            name="actual"
            autocomplete="current-password"
            required
            [value]="actual()"
            (input)="actual.set($any($event.target).value)"
          />
        </ph-form-field>
        <ph-form-field label="Contrasena nueva (minimo 8 caracteres)" [requerido]="true">
          <input
            matInput
            type="password"
            name="nueva"
            autocomplete="new-password"
            required
            minlength="8"
            [value]="nueva()"
            (input)="nueva.set($any($event.target).value)"
          />
        </ph-form-field>
        <ph-form-field label="Confirmar contrasena nueva" [requerido]="true">
          <input
            matInput
            type="password"
            name="confirmacion"
            autocomplete="new-password"
            required
            [value]="confirmacion()"
            (input)="confirmacion.set($any($event.target).value)"
          />
        </ph-form-field>
        @if (error(); as mensaje) {
          <p class="error" role="alert">{{ mensaje }}</p>
        }
        @if (exito(); as mensaje) {
          <p class="exito" role="status">{{ mensaje }}</p>
        }
        <div class="acciones">
          <a routerLink="/">Volver</a>
          <button type="submit" mat-flat-button class="boton" [disabled]="ocupado()">
            {{ ocupado() ? 'Guardando...' : 'Cambiar contrasena' }}
          </button>
        </div>
      </form>
    </section>
  `,
  styles: [
    `
      .perfil {
        max-width: 24rem;
        margin: 3rem auto;
        padding: 1.5rem;
        border: 1px solid var(--ph-borde, #d5dae2);
        border-radius: var(--ph-radio, 8px);
        background: var(--ph-superficie, #fff);
      }
      h1 {
        font-size: 1.125rem;
        margin: 0 0 0.25rem;
      }
      .ayuda {
        margin: 0 0 1rem;
        color: var(--ph-texto-suave, #5b6472);
        font-size: 0.8125rem;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .error {
        margin: 0;
        color: var(--ph-error, #b3261e);
        font-size: 0.8125rem;
      }
      .exito {
        margin: 0;
        color: var(--ph-exito, #1b7f4d);
        font-size: 0.8125rem;
      }
      .acciones {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      a {
        color: var(--ph-texto-suave, #5b6472);
        font-size: 0.8125rem;
      }
      .boton {
        --mat-button-filled-container-color: var(--ph-primario, #1c5fd6);
        --mat-button-filled-label-text-color: #fff;

        padding: 0.5rem 0.75rem;
        border-radius: var(--ph-radio, 8px);
        font: inherit;
      }
      .boton:disabled {
        opacity: 0.6;
        cursor: default;
      }
    `,
  ],
})
export class Perfil {
  protected readonly sesion = sesionStore();
  protected readonly actor = this.sesion.usuarioActivo;
  protected readonly actual = signal('');
  protected readonly nueva = signal('');
  protected readonly confirmacion = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly exito = signal<string | null>(null);
  protected readonly ocupado = signal(false);

  private readonly autenticacion = inject(AutenticacionService);

  protected guardar(event: Event): void {
    event.preventDefault();
    if (this.ocupado()) {
      return;
    }
    this.error.set(null);
    this.exito.set(null);
    if (this.nueva() !== this.confirmacion()) {
      this.error.set('La confirmacion no coincide con la contrasena nueva.');
      return;
    }
    if (this.nueva().length < 8) {
      this.error.set('La contrasena nueva debe tener al menos 8 caracteres.');
      return;
    }
    this.ocupado.set(true);
    this.autenticacion
      .cambiarContrasena(this.actual(), this.nueva())
      .then(() => {
        this.exito.set('Contrasena cambiada. Usala en tu proximo inicio de sesion.');
        this.actual.set('');
        this.nueva.set('');
        this.confirmacion.set('');
      })
      .catch((e: unknown) => {
        this.error.set(
          e instanceof ErrorAutenticacion ? e.message : 'No se pudo cambiar la contrasena.',
        );
      })
      .finally(() => this.ocupado.set(false));
  }
}
