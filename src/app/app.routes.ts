import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
    title: 'Jiaranest — Toys & Kids\' Clothing',
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./features/listing/listing.component').then((m) => m.ListingComponent),
    title: 'Search results — Jiaranest',
  },
  {
    path: 'category/:slug',
    loadComponent: () =>
      import('./features/listing/listing.component').then((m) => m.ListingComponent),
  },
  {
    path: 'product/:slug',
    loadComponent: () =>
      import('./features/product/product.component').then((m) => m.ProductComponent),
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart.component').then((m) => m.CartComponent),
    title: 'Your Cart — Jiaranest',
  },
  {
    path: 'wishlist',
    loadComponent: () =>
      import('./features/wishlist/wishlist.component').then((m) => m.WishlistComponent),
    title: 'Your Wishlist — Jiaranest',
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent),
    title: 'Checkout — Jiaranest',
  },
  { path: '**', redirectTo: '' },
];
