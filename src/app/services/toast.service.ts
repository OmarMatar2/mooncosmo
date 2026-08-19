import { Injectable, signal } from '@angular/core';

export interface Toast {
  readonly id: number;
  readonly message: string;
  /** When present, the toast renders a router link with this label. */
  readonly actionLabel?: string;
  readonly actionRoute?: string;
}

const TOAST_DURATION_MS = 4000;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<readonly Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private nextId = 1;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  show(message: string, actionLabel?: string, actionRoute?: string): void {
    const id = this.nextId++;
    this._toasts.update((list) => [...list, { id, message, actionLabel, actionRoute }]);

    const timer = setTimeout(() => this.dismiss(id), TOAST_DURATION_MS);
    this.timers.set(id, timer);
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this._toasts.update((list) => list.filter((toast) => toast.id !== id));
  }
}
