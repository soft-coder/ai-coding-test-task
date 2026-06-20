import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { InputTextModule } from 'primeng/inputtext';

import { AuthService } from '../../core/auth/auth.service';
import { CategoriesStore } from './categories.store';

/**
 * Categories list screen: app rail + header, search, sortable Name column, and a
 * CDK virtual-scroll body. Search/sort are client-side (see {@link CategoriesStore}).
 * Row click → edit dialog and the per-row delete action land with the CRUD feature.
 */
@Component({
  selector: 'app-categories',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ScrollingModule, InputTextModule],
  providers: [CategoriesStore],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  protected readonly store = inject(CategoriesStore);
  private readonly auth = inject(AuthService);

  ngOnInit(): void {
    this.store.load();
  }

  protected onSearch(event: Event): void {
    this.store.search.set((event.target as HTMLInputElement).value);
  }

  protected logout(): void {
    this.auth.logout();
  }
}
