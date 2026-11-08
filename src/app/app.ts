import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ApiEnlaceService } from '@projecthub/shared';
import { PermissionBanner } from '@projecthub/ui';
import { UserSwitcher } from './user-switcher/user-switcher';

@Component({
  imports: [RouterOutlet, RouterLink, UserSwitcher, PermissionBanner],
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly enlace = inject(ApiEnlaceService);

  protected readonly title = signal('ProjectHub');
  protected readonly navLinks = [
    { path: '/projects', label: 'Proyectos' },
    { path: '/reports', label: 'Reportes' },
    { path: '/admin', label: 'Administracion' },
    { path: '/governance', label: 'Gobernanza' },
  ];

  /** Banner de degradacion (iteracion 32): visible solo sin backend. */
  protected readonly sinBackend = computed(() => this.enlace.estado() === 'indisponible');
}
