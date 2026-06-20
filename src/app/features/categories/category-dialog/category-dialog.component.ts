import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

import { httpErrorMessage } from '../../../core/http/http-error-message';
import { CategoriesStore } from '../categories.store';
import { nameExistsValidator } from '../name-exists.validator';

/**
 * Routed Add/Edit dialog for a category.
 *
 * `/categories/new` opens in add mode; `/categories/:id` loads the record and opens
 * in edit mode (Id shown as read-only text, Name editable). `canEdit=false` renders
 * the form read-only and hides Save. Closing navigates back to the list; the shared
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
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam === null) {
      return; // add mode
    }

    const id = Number(idParam);
    this.id.set(id);
    // Re-bind the async validator with the current id so the record's own name passes.
    this.form.controls.name.setAsyncValidators(
      nameExistsValidator((name, currentId) => this.store.nameExists(name, currentId), id),
    );

    this.loading.set(true);
    this.store.getById(id).subscribe({
      next: (category) => {
        this.canEdit.set(category.canEdit);
        this.form.controls.name.setValue(category.name);
        if (!category.canEdit) {
          this.form.disable();
        }
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.messages.add({ severity: 'error', summary: 'Error', detail: httpErrorMessage(err) });
        this.close();
      },
    });
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

  close(): void {
    this.router.navigate(['/categories']);
  }

  /** Show the Name error only once the user has interacted, matching the login flow. */
  showNameError(): boolean {
    const control = this.form.controls.name;
    return control.invalid && (control.dirty || control.touched);
  }
}
