import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, map, startWith } from 'rxjs';

/** A value that may still be loading. */
export interface Loadable<T> {
  loading: boolean;
  data: T;
}

/**
 * Turn an Observable into a `Loadable` signal so templates can distinguish
 * "still loading" from "loaded but empty" — the key to showing a shimmer only
 * while the response is pending.
 *
 *   readonly featured = loadable(this.catalog.getFeatured(), []);
 *   ... featured().loading ? <skeleton> : <cards for featured().data>
 *
 * `initial` is the empty value used while loading (e.g. [] for a list).
 */
export function loadable<T>(source: Observable<T>, initial: T): Signal<Loadable<T>> {
  return toSignal(
    source.pipe(
      map((data) => ({ loading: false, data })),
      startWith({ loading: true, data: initial }),
    ),
    { initialValue: { loading: true, data: initial } },
  );
}
