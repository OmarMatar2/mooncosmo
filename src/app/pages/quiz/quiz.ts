import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AnalysisScreen } from '../../components/analysis-screen/analysis-screen';
import { QuizProgress } from '../../components/quiz-progress/quiz-progress';
import { QuizQuestion } from '../../components/quiz-question/quiz-question';
import { QuizTimer } from '../../components/quiz-timer/quiz-timer';
import { ResultView } from '../../components/result-view/result-view';
import { UpsellView } from '../../components/upsell-view/upsell-view';
import { QuizViewModel } from '../../viewmodels/quiz.viewmodel';

@Component({
  selector: 'app-quiz',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AnalysisScreen, QuizProgress, QuizQuestion, QuizTimer, ResultView, UpsellView],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss',
})
export class Quiz {
  protected readonly vm = inject(QuizViewModel);

  constructor() {
    // The quiz CTA is what brings the visitor here, so arriving on the page is the
    // moment the session starts. Restarting an already-running timer is a no-op.
    this.vm.startTimer();
  }
}
