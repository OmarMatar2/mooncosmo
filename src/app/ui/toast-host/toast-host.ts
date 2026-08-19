import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'toast-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="toasts" role="status" aria-live="polite" aria-atomic="false">
      @for (toast of vm.toasts(); track toast.id) {
        <div class="toast">
          <span class="toast__message">{{ toast.message }}</span>
          @if (toast.actionLabel && toast.actionRoute) {
            <a class="toast__action" [routerLink]="toast.actionRoute">{{ toast.actionLabel }}</a>
          }
          <button
            type="button"
            class="toast__close"
            aria-label="Dismiss notification"
            (click)="vm.dismiss(toast.id)"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './toast-host.scss',
})
export class ToastHost {
  protected readonly vm = inject(ToastService);
}
