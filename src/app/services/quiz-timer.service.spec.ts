import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PersistenceService } from './persistence.service';
import {
  AUTO_EXTENSION_MESSAGE,
  EXTENSION_MS,
  EXTENSION_PROMPT_MESSAGE,
  INITIAL_ALLOWANCE_MS,
  QuizTimerService,
  TIMER_STORAGE_KEY,
} from './quiz-timer.service';

/**
 * An in-memory stand-in for localStorage. The service's contract is "persists through
 * PersistenceService", so the tests exercise that rather than the ambient global —
 * which the test runner does not provide.
 */
class FakePersistence {
  readonly store = new Map<string, unknown>();

  read<T>(key: string, isValid: (value: unknown) => value is T): T | null {
    const raw = this.store.get(key);
    if (raw === undefined) {
      return null;
    }
    const parsed: unknown = JSON.parse(JSON.stringify(raw));
    return isValid(parsed) ? parsed : null;
  }

  write(key: string, value: unknown): void {
    this.store.set(key, value);
  }

  remove(key: string): void {
    this.store.delete(key);
  }
}

/** Shared across "reload" cases, where a new service must see the persisted state. */
let persistence: FakePersistence;

/** Advances both the clock and the service's 1s interval together. */
function advance(ms: number): void {
  vi.advanceTimersByTime(ms);
}

function makeService(): QuizTimerService {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [{ provide: PersistenceService, useValue: persistence }],
  });
  return TestBed.inject(QuizTimerService);
}

describe('QuizTimerService', () => {
  beforeEach(() => {
    persistence = new FakePersistence();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-20T12:00:00Z'));
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  it('does not run until the quiz CTA starts it', () => {
    const timer = makeService();
    expect(timer.isRunning()).toBe(false);
  });

  it('starts with a ten-minute allowance', () => {
    const timer = makeService();
    timer.start();
    expect(timer.isRunning()).toBe(true);
    expect(timer.remainingMs()).toBe(INITIAL_ALLOWANCE_MS);
    expect(timer.remainingLabel()).toBe('10:00');
    expect(timer.message()).toBeNull();
  });

  it('counts down without any message while time remains', () => {
    const timer = makeService();
    timer.start();
    advance(9 * 60 * 1000);
    expect(timer.remainingLabel()).toBe('1:00');
    expect(timer.message()).toBeNull();
    expect(timer.canExtend()).toBe(false);
  });

  it('extends itself automatically at ten minutes and says so', () => {
    const timer = makeService();
    timer.start();
    advance(INITIAL_ALLOWANCE_MS);

    expect(timer.extensionCount()).toBe(1);
    expect(timer.remainingMs()).toBe(EXTENSION_MS);
    expect(timer.message()).toBe(AUTO_EXTENSION_MESSAGE);
    // It continues on its own — no button, no interruption.
    expect(timer.canExtend()).toBe(false);
    expect(timer.isRunning()).toBe(true);
  });

  it('asks before extending at the next five-minute mark', () => {
    const timer = makeService();
    timer.start();
    advance(INITIAL_ALLOWANCE_MS);
    advance(EXTENSION_MS);

    expect(timer.remainingMs()).toBe(0);
    expect(timer.message()).toBe(EXTENSION_PROMPT_MESSAGE);
    expect(timer.canExtend()).toBe(true);
    // It never resets progress or stops on its own.
    expect(timer.isRunning()).toBe(true);
  });

  it('grants five more minutes when asked, and can repeat indefinitely', () => {
    const timer = makeService();
    timer.start();
    advance(INITIAL_ALLOWANCE_MS);

    for (let round = 1; round <= 4; round++) {
      advance(EXTENSION_MS);
      expect(timer.canExtend(), `round ${round}`).toBe(true);
      timer.extend();
      expect(timer.canExtend(), `round ${round} after extending`).toBe(false);
      expect(timer.remainingMs(), `round ${round} remaining`).toBe(EXTENSION_MS);
    }
    expect(timer.extensionCount()).toBe(5);
  });

  it('stops for good once the products reach the cart', () => {
    const timer = makeService();
    timer.start();
    advance(60 * 1000);
    timer.stop();

    expect(timer.isRunning()).toBe(false);
    expect(timer.message()).toBeNull();
    expect(timer.canExtend()).toBe(false);

    // No further extension can fire after the cart add.
    const before = timer.extensionCount();
    advance(INITIAL_ALLOWANCE_MS * 2);
    expect(timer.extensionCount()).toBe(before);
  });

  it('survives a reload without restarting', () => {
    const first = makeService();
    first.start();
    advance(4 * 60 * 1000);
    expect(first.remainingLabel()).toBe('6:00');

    // A fresh service instance reads the persisted start time.
    const reloaded = makeService();
    expect(reloaded.isRunning()).toBe(true);
    expect(reloaded.remainingLabel()).toBe('6:00');
  });

  it('carries its extensions across a reload too', () => {
    const first = makeService();
    first.start();
    advance(INITIAL_ALLOWANCE_MS);
    expect(first.extensionCount()).toBe(1);

    const reloaded = makeService();
    expect(reloaded.extensionCount()).toBe(1);
    expect(reloaded.remainingLabel()).toBe('5:00');
  });

  it('stays stopped across a reload', () => {
    const first = makeService();
    first.start();
    first.stop();

    const reloaded = makeService();
    expect(reloaded.isRunning()).toBe(false);
  });

  it('ignores a second start while already running', () => {
    const timer = makeService();
    timer.start();
    advance(3 * 60 * 1000);
    timer.start();
    expect(timer.remainingLabel()).toBe('7:00');
  });

  it('clears everything on reset, so a retake starts fresh', () => {
    const timer = makeService();
    timer.start();
    advance(6 * 60 * 1000);
    timer.reset();

    expect(timer.isRunning()).toBe(false);
    expect(persistence.store.has(TIMER_STORAGE_KEY)).toBe(false);

    timer.start();
    expect(timer.remainingLabel()).toBe('10:00');
  });

  it('never reports a negative remaining time', () => {
    const timer = makeService();
    timer.start();
    timer.stop();
    advance(INITIAL_ALLOWANCE_MS * 3);
    expect(timer.remainingMs()).toBeGreaterThanOrEqual(0);
  });
});
