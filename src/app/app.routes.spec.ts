import { describe, expect, it, vi } from 'vitest';
import { Routes } from '@angular/router';
import { cargaRemote } from './app.routes';

function cargarOk(): Promise<{ remoteRoutes: Routes }> {
  return Promise.resolve({ remoteRoutes: [{ path: 'ping', redirectTo: '' }] });
}

describe('cargaRemote', () => {
  it('usa remoteRoutes cuando el remote carga', async () => {
    const route = cargaRemote('mfe-x', vi.fn(cargarOk));

    const routes = await route.loadChildren!();
    expect(routes).toEqual([{ path: 'ping', redirectTo: '' }]);
  });

  it('recurre al fallback y registra el error cuando el remote falla', async () => {
    const fallo = new Error('build desactualizado');
    const cargar = vi.fn(() => Promise.reject(fallo));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    try {
      const route = cargaRemote('mfe-x', cargar);

      const routes = (await route.loadChildren!()) as Routes;
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('**');
      expect(routes[0].data).toEqual({ remote: 'mfe-x' });
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("No se pudo cargar 'mfe-x'"),
        fallo,
      );
    } finally {
      warn.mockRestore();
    }
  });
});
