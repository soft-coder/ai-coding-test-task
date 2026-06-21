import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, catchError, map, of, switchMap, timer } from 'rxjs';

/** Debounce before hitting the backend, so typing doesn't fire a request per keystroke. */
const DEBOUNCE_MS = 300;

/**
 * Async validator that flags a category name already taken on the server.
 *
 * @param check  calls `GET /front/categories/name-exists`; resolves `true` when taken.
 * @param currentId  the edited record's id, so its own name isn't reported as a clash
 *                   (omitted when adding).
 */
export function nameExistsValidator(
  check: (name: string, id?: number) => Observable<boolean>,
  currentId?: number,
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const name = (control.value ?? '').trim();
    if (!name) {
      return of(null); // emptiness is the `required` validator's job
    }
    return timer(DEBOUNCE_MS).pipe(
      switchMap(() => check(name, currentId)),
      map((taken) => (taken ? { nameTaken: true } : null)),
      // A failed check must not block submission — let the save round-trip surface errors.
      catchError(() => of(null)),
    );
  };
}
