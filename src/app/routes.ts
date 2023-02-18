import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'about', loadComponent: () => import('./about.container') },
    { path: 'tree', loadComponent: () => import('./tree.container') },
    { path: 'config', loadComponent: () => import('./config.container') },
    { path: '', redirectTo: 'about' },
];
