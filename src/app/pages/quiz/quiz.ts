import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AnalysisScreen } from '../../components/analysis-screen/analysis-screen';
import { QuizProgress } from '../../components/quiz-progress/quiz-progress';
import { QuizQuestion } from '../../components/quiz-question/quiz-question';
import { ResultView } from '../../components/result-view/result-view';
import { UpsellView } from '../../components/upsell-view/upsell-view';
import { QuizViewModel } from '../../viewmodels/quiz.viewmodel';

@Component({
  selector: 'app-quiz',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AnalysisScreen, QuizProgress, QuizQuestion, ResultView, UpsellView],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss',
})
export class Quiz {
  protected readonly vm = inject(QuizViewModel);
}
