import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Placeholder categories screen — virtual-scroll table + CRUD land in their features. */
@Component({
  selector: 'app-categories',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<h1>Categories</h1>',
})
export class CategoriesComponent {}
