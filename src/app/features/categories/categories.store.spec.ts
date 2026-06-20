import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { CategoriesStore } from './categories.store';
import { CategoriesService } from '../../core/api/api/categories.service';

describe('CategoriesStore', () => {
  let store: CategoriesStore;
  let api: jasmine.SpyObj<CategoriesService>;

  const items = [
    { id: 1, name: 'Banana', canEdit: true, canDelete: true },
    { id: 2, name: 'apple', canEdit: true, canDelete: false },
    { id: 3, name: 'Cherry', canEdit: false, canDelete: false },
  ];

  beforeEach(() => {
    api = jasmine.createSpyObj<CategoriesService>('CategoriesService', ['getAll']);
    TestBed.configureTestingModule({
      providers: [CategoriesStore, { provide: CategoriesService, useValue: api }],
    });
    store = TestBed.inject(CategoriesStore);
  });

  it('loads items and the canAdd flag', () => {
    (api.getAll as jasmine.Spy).and.returnValue(of({ items, canAdd: true }));
    store.load();
    expect(store.visible().length).toBe(3);
    expect(store.canAdd()).toBeTrue();
    expect(store.loading()).toBeFalse();
  });

  it('sorts by name ascending, then descending on toggle', () => {
    (api.getAll as jasmine.Spy).and.returnValue(of({ items, canAdd: true }));
    store.load();
    expect(store.visible().map((c) => c.name)).toEqual(['apple', 'Banana', 'Cherry']);
    store.toggleSort();
    expect(store.visible().map((c) => c.name)).toEqual(['Cherry', 'Banana', 'apple']);
  });

  it('filters by name, case-insensitively', () => {
    (api.getAll as jasmine.Spy).and.returnValue(of({ items, canAdd: true }));
    store.load();
    store.search.set('AN');
    expect(store.visible().map((c) => c.name)).toEqual(['Banana']);
  });

  it('captures an error message and clears loading on failure', () => {
    (api.getAll as jasmine.Spy).and.returnValue(throwError(() => ({ status: 500, message: 'boom' })));
    store.load();
    expect(store.error()).toBeTruthy();
    expect(store.loading()).toBeFalse();
  });
});
