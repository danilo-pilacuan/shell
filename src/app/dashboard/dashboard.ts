import { ChangeDetectionStrategy, Component, Type, computed, inject, signal } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { IntlFormat } from '@projecthub/ui';
import { ProjectStore, sesionStore } from '@projecthub/shared';

interface WidgetCargado {
  nombre: string;
  remote: string;
  componente: Type<unknown> | null;
  error: string | null;
}

/**
 * Dashboard del shell (8.6): compone widgets federados de mfe-projects,
 * mfe-reports y mfe-governance. Si un remote no carga, muestra el fallback
 * de ese widget y el resto del dashboard sigue funcionando (rulebook).
 */
@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly store = inject(ProjectStore);
  protected readonly intl = inject(IntlFormat);

  protected readonly widgets = signal<WidgetCargado[]>([
    { nombre: 'Resumen de proyecto', remote: 'mfe-projects', componente: null, error: null },
    { nombre: 'KPIs del portafolio', remote: 'mfe-reports', componente: null, error: null },
    { nombre: 'Estado de gates', remote: 'mfe-governance', componente: null, error: null },
  ]);

  protected readonly proyectos = this.store.proyectos;
  protected readonly proyectoId = signal(this.store.proyectos()[0]?.id ?? '');

  protected readonly inputsProyecto = computed<Record<string, unknown>>(() => ({
    proyectoId: this.proyectoId(),
  }));

  protected readonly inputsVacios: Record<string, unknown> = {};

  constructor() {
    this.cargarWidget('mfe-projects', './Widget', 'ProjectSummaryWidget', 0);
    this.cargarWidget('mfe-reports', './Widget', 'PortfolioKpiWidget', 1);
    this.cargarWidget('mfe-governance', './Widget', 'GateStatusWidget', 2);
  }

  protected cambiarProyecto(event: Event): void {
    this.proyectoId.set((event.target as HTMLSelectElement).value);
  }

  private cargarWidget(
    remote: string,
    exposedModule: string,
    exportName: string,
    indice: number,
  ): void {
    loadRemoteModule(remote, exposedModule)
      .then((m: Record<string, Type<unknown>>) => {
        this.widgets.update((lista) =>
          lista.map((w, i) =>
            i === indice ? { ...w, componente: m[exportName] ?? null } : w,
          ),
        );
      })
      .catch((err: unknown) => {
        this.widgets.update((lista) =>
          lista.map((w, i) =>
            i === indice
              ? { ...w, error: err instanceof Error ? err.message : String(err) }
              : w,
          ),
        );
      });
  }
}
