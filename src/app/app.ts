import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { ApiEnlaceService, AutenticacionService } from '@projecthub/shared';
import { PermissionBanner } from '@projecthub/ui';
import { SesionUsuario } from './sesion-usuario/sesion-usuario';

@Component({
  imports: [RouterOutlet, RouterLink, SesionUsuario, PermissionBanner],
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly enlace = inject(ApiEnlaceService);
  private readonly autenticacion = inject(AutenticacionService);
  private readonly router = inject(Router);

  protected readonly title = signal('ProjectHub');
  protected readonly navLinks = [
    { path: '/projects', label: 'Proyectos' },
    { path: '/reports', label: 'Reportes' },
    { path: '/admin', label: 'Administracion' },
    { path: '/governance', label: 'Gobernanza' },
  ];

  /** Banner de degradacion (iteracion 32): visible solo sin backend. */
  protected readonly sinBackend = computed(() => this.enlace.estado() === 'indisponible');

  /** Ruta actual (para no redirigir si ya estamos en /login). */
  private readonly rutaActual = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /**
   * Sesion expirada en pleno uso (14.6): el token ya fue limpiado por
   * ApiEnlaceService; aqui se cierra la sesion y se lleva al usuario a
   * /login con el aviso. Cuenta desactivada (14.7): mismo cierre, aviso
   * propio. Un solo aviso por evento.
   */
  constructor() {
    let expiracionesProcesadas = 0;
    let desactivacionesProcesadas = 0;
    effect(() => {
      const total = this.autenticacion.expiraciones();
      while (expiracionesProcesadas < total) {
        expiracionesProcesadas++;
        if (!this.rutaActual().startsWith('/login')) {
          void this.router.navigateByUrl('/login?expirada=1', { replaceUrl: true });
        }
      }
      const totalDesactivaciones = this.autenticacion.desactivaciones();
      while (desactivacionesProcesadas < totalDesactivaciones) {
        desactivacionesProcesadas++;
        if (!this.rutaActual().startsWith('/login')) {
          void this.router.navigateByUrl('/login?desactivada=1', { replaceUrl: true });
        }
      }
    });
  }
}
