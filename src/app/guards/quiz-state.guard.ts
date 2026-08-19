import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { QuizViewModel } from '../viewmodels/quiz.viewmodel';

/**
 * Persisted quiz state can be stale or hand-edited. A step of 'result' or 'upsell'
 * with answers that cannot produce a recommendation is invalid: reset to question 1
 * and send the visitor home rather than rendering an empty result.
 */
export const quizStateGuard: CanActivateFn = () => {
  const vm = inject(QuizViewModel);
  const router = inject(Router);

  if (vm.hasValidState()) {
    return true;
  }

  vm.repairInvalidState();
  return router.createUrlTree(['/']);
};
