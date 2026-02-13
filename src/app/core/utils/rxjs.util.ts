import { MonoTypeOperatorFunction } from 'rxjs';
import { finalize } from 'rxjs/operators';

export function withBusyFlag(setBusy: (busy: boolean) => void): MonoTypeOperatorFunction<unknown> {
  return (source) => {
    setBusy(true);
    return source.pipe(
      finalize(() => {
        setBusy(false);
      })
    );
  };
}
