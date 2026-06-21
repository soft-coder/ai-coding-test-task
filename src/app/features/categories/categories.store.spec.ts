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
    api = jasmine.createSpyObj<CategoriesService>('CategoriesService', [
      'getAll',
      'getById',
      'nameExists',
      'add',
      'update',
      '_delete',
    ]);
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

  it('add posts the name and reloads the list', () => {
    (api.add as jasmine.Spy).and.returnValue(of(42));
    (api.getAll as jasmine.Spy).and.returnValue(of({ items, canAdd: true }));
    store.add('New').subscribe();
    expect(api.add).toHaveBeenCalledWith({ name: 'New' });
    expect(api.getAll).toHaveBeenCalled();
  });

  it('update posts to the id and reloads the list', () => {
    (api.update as jasmine.Spy).and.returnValue(of(undefined));
    (api.getAll as jasmine.Spy).and.returnValue(of({ items, canAdd: true }));
    store.update(7, 'Renamed').subscribe();
    expect(api.update).toHaveBeenCalledWith(7, { name: 'Renamed' });
    expect(api.getAll).toHaveBeenCalled();
  });

  it('remove deletes by id and reloads the list', () => {
    (api._delete as jasmine.Spy).and.returnValue(of(undefined));
    (api.getAll as jasmine.Spy).and.returnValue(of({ items, canAdd: true }));
    store.remove(3).subscribe();
    expect(api._delete).toHaveBeenCalledWith(3);
    expect(api.getAll).toHaveBeenCalled();
  });

  it('nameExists forwards name and id to the API', () => {
    (api.nameExists as jasmine.Spy).and.returnValue(of(true));
    store.nameExists('dup', 5).subscribe();
    expect(api.nameExists).toHaveBeenCalledWith('dup', 5);
  });
});
