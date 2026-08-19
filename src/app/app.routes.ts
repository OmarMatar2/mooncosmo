import { Routes } from '@angular/router';
import { quizStateGuard } from './guards/quiz-state.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'MoonCosmo — Naturally Derived Face & Body Care',
    data: {
      description:
        'MoonCosmo face and body scrubs and masks. Take the 60-second skin quiz and find the formula matched to your skin. Free shipping on all orders.',
    },
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'shop',
    title: 'Shop All Products — MoonCosmo',
    data: {
      description:
        'Browse every MoonCosmo scrub, mask and curated set. Free shipping on all orders — or take the 60-second quiz for a personalized match.',
    },
    loadComponent: () => import('./pages/shop/shop').then((m) => m.Shop),
  },
  {
    path: 'quiz',
    title: 'Skin Quiz — MoonCosmo',
    canActivate: [quizStateGuard],
    loadComponent: () => import('./pages/quiz/quiz').then((m) => m.Quiz),
  },
  {
    path: 'cart',
    title: 'Your Cart — MoonCosmo',
    loadComponent: () => import('./pages/cart/cart').then((m) => m.Cart),
  },
  { path: '**', redirectTo: '' },
];
