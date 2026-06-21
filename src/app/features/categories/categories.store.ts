import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { CategoriesService } from '../../core/api/api/categories.service';
import { ZidiumWebServiceFrontCategoryDto as CategoryDto } from '../../core/api/model/zidium-web-service-front-category-dto';
import { httpErrorMessage } from '../../core/http/http-error-message';

/**
 * State for the categories list. The backend returns the whole list with no
 * paging/search/sort (see docs/decisions.md D1), so search and sort run here over
 * the loaded items; the view virtualizes them with CDK.
 */
@Injectable()
export class CategoriesStore {
  private readonly api = inject(CategoriesService);

  private readonly _items = signal<CategoryDto[]>([]);
  readonly canAdd = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly search = signal('');
  readonly sortDesc = signal(false);

  /** Filtered (by name) + sorted (by name, direction from `sortDesc`). */
  readonly visible = computed(() => {
    const term = this.search().trim().toLowerCase();
    const items = term
      ? this._items().filter((c) => c.name.toLowerCase().includes(term))
      : this._items();
    const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
    return this.sortDesc() ? sorted.reverse() : sorted;
  });

  readonly isEmpty = computed(() => !this.loading() && !this.error() && this.visible().length === 0);

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getAll().subscribe({
      next: (res) => {
        this._items.set(res.items);
        this.canAdd.set(res.canAdd);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(httpErrorMessage(err));
        this.loading.set(false);
      },
    });
  }

  toggleSort(): void {
    this.sortDesc.update((desc) => !desc);
  }

  /** Single record fetch for the edit dialog (carries `canEdit` for read-only gating). */
  getById(id: number): Observable<CategoryDto> {
    return this.api.getById(id);
  }

  /** Server-side uniqueness check backing the async Name validator. `true` ⇒ taken. */
  nameExists(name: string, id?: number): Observable<boolean> {
    return this.api.nameExists(name, id);
  }

  /** Create, then refresh the list so the new row appears. Emits the new id. */
  add(name: string): Observable<number> {
    return this.api.add({ name }).pipe(tap(() => this.load()));
  }

  /** Update, then refresh the list. */
  update(id: number, name: string): Observable<unknown> {
    return this.api.update(id, { name }).pipe(tap(() => this.load()));
  }

  /** Delete, then refresh the list. */
  remove(id: number): Observable<unknown> {
    return this.api._delete(id).pipe(tap(() => this.load()));
  }
}
