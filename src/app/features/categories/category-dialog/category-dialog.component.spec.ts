import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';

import { CategoryDialogComponent } from './category-dialog.component';
import { CategoriesStore } from '../categories.store';
import { ZidiumWebServiceFrontCategoryDto as CategoryDto } from '../../../core/api/model/zidium-web-service-front-category-dto';

describe('CategoryDialogComponent', () => {
  let store: jasmine.SpyObj<CategoriesStore>;
  let router: jasmine.SpyObj<Router>;

  /**
   * Builds the component for the given route id (`null` → add mode). Pass a
   * `category` to stub the edit-mode `getById` response.
   */
  function setup(
    idParam: string | null,
    category?: CategoryDto,
  ): ComponentFixture<CategoryDialogComponent> {
    store = jasmine.createSpyObj<CategoriesStore>('CategoriesStore', [
      'getById',
      'nameExists',
      'add',
      'update',
    ]);
    store.nameExists.and.returnValue(of(false));
    if (category) {
      store.getById.and.returnValue(of(category));
    }
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
    const fixture = setup('7', { id: 7, name: 'Sensors', canEdit: true, canDelete: true });
    const component = fixture.componentInstance;
    expect(component.isEdit()).toBeTrue();
    expect(component.title()).toBe('Edit');
    expect(component.id()).toBe(7);
    expect(component.form.controls.name.value).toBe('Sensors');
    expect(component.canEdit()).toBeTrue();
  });

  it('disables the form when the record is read-only', () => {
    const fixture = setup('3', { id: 3, name: 'Locked', canEdit: false, canDelete: false });
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
