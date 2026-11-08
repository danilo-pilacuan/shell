import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ProjectStore, UsuarioStore, proporcionarSincronizacionBackend } from '@projecthub/shared';
import { REMOTE_MODULE_LOADER } from '@projecthub/shared';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    ProjectStore,
    UsuarioStore,
    proporcionarSincronizacionBackend(),
    { provide: REMOTE_MODULE_LOADER, useValue: loadRemoteModule },
  ]
};