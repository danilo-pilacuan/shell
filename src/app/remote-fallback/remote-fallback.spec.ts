import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RemoteFallback } from './remote-fallback';

describe('RemoteFallback', () => {
  it('muestra el nombre del remote caido', async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteFallback],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(RemoteFallback);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Modulo no disponible');
  });
});
