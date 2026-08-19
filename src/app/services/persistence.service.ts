import { Injectable } from '@angular/core';

/**
 * Thin, failure-tolerant wrapper around localStorage. Storage can throw in private
 * browsing modes and is absent during unit tests, so every access is guarded and a
 * failure simply means "no persisted state".
 */
@Injectable({ providedIn: 'root' })
export class PersistenceService {
  private readonly storage = this.resolveStorage();

  read<T>(key: string, isValid: (value: unknown) => value is T): T | null {
    if (!this.storage) {
      return null;
    }
    try {
      const raw = this.storage.getItem(key);
      if (raw === null) {
        return null;
      }
      const parsed: unknown = JSON.parse(raw);
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  write(key: string, value: unknown): void {
    if (!this.storage) {
      return;
    }
    try {
      this.storage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota exceeded or storage disabled — the app stays fully usable without it.
    }
  }

  remove(key: string): void {
    if (!this.storage) {
      return;
    }
    try {
      this.storage.removeItem(key);
    } catch {
      // Ignored for the same reason as write().
    }
  }

  private resolveStorage(): Storage | null {
    try {
      const probe = '__mooncosmo_probe__';
      localStorage.setItem(probe, '1');
      localStorage.removeItem(probe);
      return localStorage;
    } catch {
      return null;
    }
  }
}
