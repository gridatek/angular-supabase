import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then((m) => m.Login),
  },
  {
    path: 'signup',
    loadComponent: () => import('./auth/signup/signup').then((m) => m.Signup),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./auth/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full',
      },
      {
        path: 'users',
        loadComponent: () => import('./admin/users/users').then((m) => m.Users),
      },
      {
        path: 'users/create',
        loadComponent: () => import('./admin/user-create/user-create').then((m) => m.UserCreate),
      },
      {
        path: 'users/edit/:id',
        loadComponent: () => import('./admin/user-edit/user-edit').then((m) => m.UserEdit),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
