import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'categories' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'categories',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/categories/categories.component').then((m) => m.CategoriesComponent),
    children: [
      // Add/Edit render as a routed dialog over the list (shared CategoriesStore).
      {
        path: 'new',
        loadComponent: () =>
          import('./features/categories/category-dialog/category-dialog.component').then(
            (m) => m.CategoryDialogComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/categories/category-dialog/category-dialog.component').then(
            (m) => m.CategoryDialogComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'categories' },
];
