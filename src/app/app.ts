import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterLink],
  selector: 'app-root',
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
