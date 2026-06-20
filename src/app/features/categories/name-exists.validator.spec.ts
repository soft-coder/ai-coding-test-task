import { fakeAsync, tick } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { Observable, of, throwError } from 'rxjs';

import { nameExistsValidator } from './name-exists.validator';

describe('nameExistsValidator', () => {
  function run(
    value: string,
    check: (name: string, id?: number) => Observable<boolean>,
    id?: number,
  ) {
    const control = new FormControl(value);
    let result: unknown;
    (nameExistsValidator(check, id)(control) as Observable<unknown>).subscribe((r) => (result = r));
    tick(300); // debounce window
    return () => result;
  }

  it('returns nameTaken when the server says the name exists', fakeAsync(() => {
    const result = run('dup', () => of(true));
    expect(result()).toEqual({ nameTaken: true });
  }));

  it('returns null when the name is free', fakeAsync(() => {
    const result = run('free', () => of(false));
    expect(result()).toBeNull();
  }));

  it('skips the request for an empty value', fakeAsync(() => {
    const check = jasmine.createSpy('check').and.returnValue(of(true));
    const control = new FormControl('   ');
    let result: unknown = 'unset';
    (nameExistsValidator(check)(control) as Observable<unknown>).subscribe((r) => (result = r));
    expect(check).not.toHaveBeenCalled();
    expect(result).toBeNull();
  }));

  it('passes the current id through so the record does not clash with itself', fakeAsync(() => {
    const check = jasmine.createSpy('check').and.returnValue(of(false));
    run('Self', check, 9);
    expect(check).toHaveBeenCalledWith('Self', 9);
  }));

  it('does not block submission when the check errors', fakeAsync(() => {
    const result = run('boom', () => throwError(() => new Error('network')));
    expect(result()).toBeNull();
  }));
});
