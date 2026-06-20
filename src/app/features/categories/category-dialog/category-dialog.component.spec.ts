import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';

import { CategoryDialogComponent } from './category-dialog.component';
import { CategoriesStore } from '../categories.store';

describe('CategoryDialogComponent', () => {
  let store: jasmine.SpyObj<CategoriesStore>;
  let router: jasmine.SpyObj<Router>;

  function setup(idParam: string | null): ComponentFixture<CategoryDialogComponent> {
    store = jasmine.createSpyObj<CategoriesStore>('CategoriesStore', [
      'getById',
      'nameExists',
      'add',
      'update',
    ]);
    store.nameExists.and.returnValue(of(false));
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [CategoryDialogComponent],
      providers: [
        provideNoopAnimations(),
        { provide: CategoriesStore, useValue: store },
        { provide: Router, useValue: router },
        { provide: MessageService, useValue: jasmine.createSpyObj('MessageService', ['add']) },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => idParam } } },
        },
      ],
    });

    const fixture = TestBed.createComponent(CategoryDialogComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('opens in add mode with an empty form when there is no id', () => {
    const fixture = setup(null);
    const component = fixture.componentInstance;
    expect(component.isEdit()).toBeFalse();
    expect(component.title()).toBe('Add');
    expect(component.form.controls.name.value).toBe('');
    expect(store.getById).not.toHaveBeenCalled();
  });

  it('loads the record and switches to edit mode', () => {
    store = jasmine.createSpyObj<CategoriesStore>('CategoriesStore', [
      'getById',
      'nameExists',
      'add',
      'update',
    ]);
    store.nameExists.and.returnValue(of(false));
    store.getById.and.returnValue(of({ id: 7, name: 'Sensors', canEdit: true, canDelete: true }));
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [CategoryDialogComponent],
      providers: [
        provideNoopAnimations(),
        { provide: CategoriesStore, useValue: store },
        { provide: Router, useValue: router },
        { provide: MessageService, useValue: jasmine.createSpyObj('MessageService', ['add']) },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '7' } } } },
      ],
    });
    const fixture = TestBed.createComponent(CategoryDialogComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.isEdit()).toBeTrue();
    expect(component.title()).toBe('Edit');
    expect(component.id()).toBe(7);
    expect(component.form.controls.name.value).toBe('Sensors');
    expect(component.canEdit()).toBeTrue();
  });

  it('disables the form when the record is read-only', () => {
    store = jasmine.createSpyObj<CategoriesStore>('CategoriesStore', [
      'getById',
      'nameExists',
      'add',
      'update',
    ]);
    store.nameExists.and.returnValue(of(false));
    store.getById.and.returnValue(of({ id: 3, name: 'Locked', canEdit: false, canDelete: false }));
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [CategoryDialogComponent],
      providers: [
        provideNoopAnimations(),
        { provide: CategoriesStore, useValue: store },
        { provide: Router, useValue: router },
        { provide: MessageService, useValue: jasmine.createSpyObj('MessageService', ['add']) },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '3' } } } },
      ],
    });
    const fixture = TestBed.createComponent(CategoryDialogComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.canEdit()).toBeFalse();
    expect(component.form.disabled).toBeTrue();
  });

  it('saves a new category via the store and navigates back', () => {
    const fixture = setup(null);
    const component = fixture.componentInstance;
    store.add.and.returnValue(of(99));

    component.form.controls.name.setValue('Brand new');
    component.save();

    expect(store.add).toHaveBeenCalledWith('Brand new');
    expect(router.navigate).toHaveBeenCalledWith(['/categories']);
  });

  it('does not save when the form is invalid', () => {
    const fixture = setup(null);
    const component = fixture.componentInstance;
    component.form.controls.name.setValue(''); // required
    component.save();
    expect(store.add).not.toHaveBeenCalled();
  });

  it('close navigates to the list', () => {
    const fixture = setup(null);
    fixture.componentInstance.close();
    expect(router.navigate).toHaveBeenCalledWith(['/categories']);
  });
});
