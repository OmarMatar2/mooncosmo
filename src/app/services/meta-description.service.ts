import { Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * Keeps <meta name="description"> in step with the active route.
 *
 * Angular's Router owns `title` but not the description, so each route carries its
 * copy in `data.description` and this service applies it. Routes without one fall
 * back to the description in index.html, which is the site-wide default.
 */
@Injectable({ providedIn: 'root' })
export class MetaDescriptionService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly meta = inject(Meta);

  private readonly fallback = this.meta.getTag('name="description"')?.content ?? '';

  start(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.apply());
  }

  private apply(): void {
    let route = this.route;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const description = route.snapshot.data['description'];
    this.meta.updateTag({
      name: 'description',
      content: typeof description === 'string' ? description : this.fallback,
    });
  }
}
