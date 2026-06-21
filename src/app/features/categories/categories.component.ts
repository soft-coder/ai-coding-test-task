import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

import { AuthService } from '../../core/auth/auth.service';
import { httpErrorMessage } from '../../core/http/http-error-message';
import { ZidiumWebServiceFrontCategoryDto as CategoryDto } from '../../core/api/model/zidium-web-service-front-category-dto';
import { CategoriesStore } from './categories.store';

/**
 * Categories list screen: app rail + header, search, sortable Name column, and a
 * CDK virtual-scroll body. Search/sort are client-side (see {@link CategoriesStore}).
 * Rows with `canEdit` navigate to the routed edit dialog; `canDelete` rows expose a
 * trash action guarded by a confirmation dialog.
 */
@Component({
  selector: 'app-categories',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterOutlet, ScrollingModule, InputTextModule, ButtonModule, DialogModule],
  providers: [CategoriesStore],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  protected readonly store = inject(CategoriesStore);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);

  /** Row awaiting delete confirmation; drives the confirmation dialog. */
  protected readonly deleteTarget = signal<CategoryDto | null>(null);
  protected readonly deleting = signal(false);

  ngOnInit(): void {
    this.store.load();
  }

  protected onSearch(event: Event): void {
    this.store.search.set((event.target as HTMLInputElement).value);
  }

  protected openEdit(category: CategoryDto): void {
    if (category.canEdit) {
      this.router.navigate(['/categories', category.id]);
    }
  }

  protected askDelete(event: Event, category: CategoryDto): void {
    event.stopPropagation(); // don't trigger row navigation
    this.deleteTarget.set(category);
  }

  protected cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  protected confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) {
      return;
    }
    this.deleting.set(true);
    this.store.remove(target.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteTarget.set(null);
        this.messages.add({ severity: 'success', summary: 'Category deleted' });
      },
      error: (err: HttpErrorResponse) => {
        this.deleting.set(false);
        this.deleteTarget.set(null);
        this.messages.add({ severity: 'error', summary: 'Error', detail: httpErrorMessage(err) });
      },
    });
  }

  protected logout(): void {
    this.auth.logout();
  }
}
