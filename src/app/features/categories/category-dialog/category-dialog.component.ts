import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

import { httpErrorMessage } from '../../../core/http/http-error-message';
import { ZidiumWebServiceFrontCategoryDto as CategoryDto } from '../../../core/api/model/zidium-web-service-front-category-dto';
import { CategoriesStore } from '../categories.store';
import { nameExistsValidator } from '../name-exists.validator';

/**
 * Routed Add/Edit dialog for a category.
 *
 * `/categories/new` opens in add mode; `/categories/:id` loads the record and opens
 * in edit mode with the Name field populated. `canEdit=false` renders the form
 * read-only and hides Save. Closing navigates back to the list; the shared
 * {@link CategoriesStore} (inherited from the parent route's injector) refreshes the
 * list after a successful save.
 */
@Component({
  selector: 'app-category-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './category-dialog.component.html',
  styleUrl: './category-dialog.component.scss',
})
export class CategoryDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(CategoriesStore);
  private readonly messages = inject(MessageService);

  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');

  /** Edited record id; `null` in add mode. */
  readonly id = signal<number | null>(null);
  readonly canEdit = signal(true);
  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly isEdit = computed(() => this.id() !== null);
  readonly title = computed(() => (this.isEdit() ? 'Edit' : 'Add'));

  readonly form = this.fb.nonNullable.group({
    name: [
      '',
      {
        validators: [Validators.required],
        asyncValidators: [nameExistsValidator((name, id) => this.store.nameExists(name, id))],
      },
    ],
  });

  ngOnInit(): void {
    const id = this.readRouteId();
    if (id !== null) {
      this.loadForEdit(id);
    }
  }

  /** Parse the `:id` route param; `null` means add mode (the `/new` path). */
  private readRouteId(): number | null {
    const param = this.route.snapshot.paramMap.get('id');
    return param === null ? null : Number(param);
  }

  /** Enter edit mode: rebind the id-aware Name validator and fetch the record. */
  private loadForEdit(id: number): void {
    this.id.set(id);
    this.bindNameValidator(id);
    this.fetchCategory(id);
  }

  /** Rebind the async validator with the current id so the record's own name passes. */
  private bindNameValidator(id: number): void {
    this.form.controls.name.setAsyncValidators(
      nameExistsValidator((name, currentId) => this.store.nameExists(name, currentId), id),
    );
  }

  private fetchCategory(id: number): void {
    this.loading.set(true);
    this.store.getById(id).subscribe({
      next: (category) => this.onCategoryLoaded(category),
      error: (err: HttpErrorResponse) => this.onLoadError(err),
    });
  }

  private onCategoryLoaded(category: CategoryDto): void {
    this.canEdit.set(category.canEdit);
    this.form.controls.name.setValue(category.name);
    if (!category.canEdit) {
      this.form.disable();
    }
    this.loading.set(false);
  }

  private onLoadError(err: HttpErrorResponse): void {
    this.loading.set(false);
    this.messages.add({ severity: 'error', summary: 'Error', detail: httpErrorMessage(err) });
    this.close();
  }

  save(): void {
    if (this.form.invalid || !this.canEdit()) {
      return;
    }

    const name = this.form.getRawValue().name.trim();
    const editing = this.isEdit();
    this.saving.set(true);

    const request = editing ? this.store.update(this.id()!, name) : this.store.add(name);
    request.subscribe({
      next: () => {
        this.messages.add({
          severity: 'success',
          summary: editing ? 'Category updated' : 'Category created',
        });
        this.close();
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.messages.add({ severity: 'error', summary: 'Error', detail: httpErrorMessage(err) });
      },
    });
  }

  /**
   * Move focus to the Name field when the dialog opens, instead of PrimeNG's
   * default (the header close button — which otherwise shows a focus ring).
   */
  focusName(): void {
    this.nameInput()?.nativeElement.focus();
  }

  close(): void {
    this.router.navigate(['/categories']);
  }

  /** Show the Name error only once the user has interacted, matching the login flow. */
  showNameError(): boolean {
    const control = this.form.controls.name;
    return control.invalid && (control.dirty || control.touched);
  }
}
