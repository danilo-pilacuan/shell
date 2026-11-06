import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { UserSwitcher } from './user-switcher/user-switcher';

@Component({
  imports: [RouterOutlet, RouterLink, UserSwitcher],
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('ProjectHub');
  protected readonly navLinks = [
    { path: '/projects', label: 'Proyectos' },
    { path: '/reports', label: 'Reportes' },
    { path: '/admin', label: 'Administracion' },
    { path: '/governance', label: 'Gobernanza' },
  ];
}
