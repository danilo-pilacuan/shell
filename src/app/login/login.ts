import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormField } from '@projecthub/ui';
import { AutenticacionService, ErrorAutenticacion } from '@projecthub/shared';

/**
 * Pantalla de login (docs/funcionalidades.md 10.3, fase 14). Valida las
 * credenciales contra el backend FastAPI (POST /api/auth/login); al entrar
 * reanuda la ruta guardada por sesionGuard en el query param `de`.
 * El backend no disponible se muestra como error y la app sigue navegable en
 * modo demo (degradacion elegante), pero las secciones protegidas exigen
 * sesion.
 */
@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatInputModule, FormField],
  template: `
    <section class="login">
      <h1>Iniciar sesion</h1>
      <p class="ayuda">Accede con tu correo de ProjectHub.</p>
      <form (submit)="entrar($event)">
        <ph-form-field label="Correo" [requerido]="true">
          <input
            matInput
            type="email"
            name="correo"
            autocomplete="username"
            required
            [value]="correo()"
            (input)="correo.set($any($event.target).value)"
          />
        </ph-form-field>
        <ph-form-field label="Contrasena" [requerido]="true">
          <input
            matInput
            type="password"
            name="contrasena"
            autocomplete="current-password"
            required
            [value]="contrasena()"
            (input)="contrasena.set($any($event.target).value)"
          />
        </ph-form-field>
        @if (avisoExpirada()) {
          <p class="error" role="alert">Tu sesion ha expirado; inicia sesion de nuevo.</p>
        }
        @if (avisoDesactivada()) {
          <p class="error" role="alert">Tu cuenta fue desactivada; contacta a un administrador.</p>
        }
        @if (error(); as mensaje) {
          <p class="error" role="alert">{{ mensaje }}</p>
        }
        <button type="submit" mat-flat-button class="boton" [disabled]="ocupado()">
          {{ ocupado() ? 'Verificando...' : 'Entrar' }}
        </button>
      </form>
    </section>
  `,
  styles: [
    `
      .login {
        max-width: 22rem;
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
      .boton {
        --mat-button-filled-container-color: var(--ph-primario, #1c5fd6);
        --mat-button-filled-label-text-color: #fff;

        align-self: flex-start;
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
export class Login {
  protected readonly correo = signal('');
  protected readonly contrasena = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly ocupado = signal(false);

  /** Aviso 14.6: el backend invalido la sesion en pleno uso (?expirada=1). */
  protected readonly avisoExpirada = signal(
    inject(ActivatedRoute).snapshot.queryParamMap.get('expirada') === '1',
  );

  /** Aviso 14.7: el actor fue desactivado con sesion activa (?desactivada=1). */
  protected readonly avisoDesactivada = signal(
    inject(ActivatedRoute).snapshot.queryParamMap.get('desactivada') === '1',
  );

  private readonly autenticacion = inject(AutenticacionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected entrar(event: Event): void {
    event.preventDefault();
    if (this.ocupado()) {
      return;
    }
    this.error.set(null);
    this.ocupado.set(true);
    this.autenticacion
      .iniciarSesion(this.correo(), this.contrasena())
      .then(() => {
        const destino = this.route.snapshot.queryParamMap.get('de');
        const url =
          typeof destino === 'string' && destino.startsWith('/') ? destino : '/';
        void this.router.navigateByUrl(url);
      })
      .catch((e: unknown) => {
        this.error.set(
          e instanceof ErrorAutenticacion
            ? e.message
            : 'No se pudo iniciar sesion.',
        );
      })
      .finally(() => this.ocupado.set(false));
  }
}
