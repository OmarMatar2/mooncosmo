import { DesiredResult, QuizOption, SkinGoal, SkinType } from '../models/quiz.model';

export const SKIN_TYPE_QUESTION = 'How would you describe your skin most of the time?';
export const GOAL_QUESTION = 'What would you most like to improve about your skin?';
export const RESULT_QUESTION = 'How would you love your skin to look and feel afterward?';

export const SKIN_TYPE_OPTIONS: readonly QuizOption<SkinType>[] = [
  { value: 'oily', label: 'Oily' },
  { value: 'combination', label: 'Combination (oily in some areas, normal in others)' },
  { value: 'normal', label: 'Normal' },
  { value: 'dry', label: 'Dry' },
  { value: 'sensitive', label: 'Sensitive' },
];

export const GOAL_OPTIONS: readonly QuizOption<SkinGoal>[] = [
  { value: 'dullness', label: 'Dull-looking skin' },
  { value: 'texture', label: 'Rough or uneven texture' },
  { value: 'dryness', label: 'Dryness or lack of softness' },
  { value: 'excess-oil', label: 'Excess oil or clogged-looking pores' },
  { value: 'tired', label: 'Skin that looks tired or needs freshness' },
  { value: 'glow', label: 'I want a healthy-looking glow' },
];

export const RESULT_OPTIONS: readonly QuizOption<DesiredResult>[] = [
  { value: 'bright', label: 'Bright & radiant' },
  { value: 'soft', label: 'Soft & moisturized' },
  { value: 'fresh', label: 'Fresh & revitalized' },
  { value: 'clean', label: 'Clean & deeply cleansed' },
  { value: 'smooth', label: 'Smooth & polished' },
  { value: 'glowing', label: 'Glowing & healthy-looking' },
];

/**
 * "Why we chose this for you" is composed at read time from three pieces rather than
 * written out as 180 variants:
 *   SKIN_TYPE_FRAGMENTS[q1] + GOAL_FRAGMENTS[q2] + product.description
 * The skin-type fragment is stored with its own full stop so it reads as a sentence in
 * isolation; the composer swaps it for a comma before appending the goal clause.
 * The composition itself lives in the ViewModel, not in a template.
 */
export const SKIN_TYPE_FRAGMENTS: Readonly<Record<SkinType, string>> = {
  oily: 'You told us your skin tends to be oily.',
  combination: 'You told us your skin is combination — oily in some areas, normal in others.',
  normal: 'You told us your skin is generally normal.',
  dry: 'You told us your skin tends to be dry.',
  sensitive: 'You told us your skin is sensitive.',
};

export const GOAL_FRAGMENTS: Readonly<Record<SkinGoal, string>> = {
  dullness: 'and that dullness is what bothers you most.',
  texture: 'and that rough or uneven texture is what bothers you most.',
  dryness: 'and that dryness is what bothers you most.',
  'excess-oil': 'and that excess oil and clogged-looking pores are your main concern.',
  tired: 'and that your skin has been looking tired.',
  glow: "and that you're after a healthy-looking glow.",
};

/**
 * Shown under the upsell card when the visitor answered Dry or Sensitive and the
 * upsell is the Minty Fresh Clay Mask — informational, not a warning banner.
 */
export const UPSELL_SENSITIVITY_NOTICE =
  'Contains menthol and mint oils — you may feel a cooling tingle. We recommend a patch test first.';

/** Rotating copy for the analysis screen, in order. */
export const ANALYSIS_MESSAGES: readonly string[] = [
  'Reviewing your answers…',
  'Analyzing your skin type…',
  'Matching your goals…',
  'Preparing your result…',
];

export const ANALYSIS_DURATION_MS = 2800;
export const ANALYSIS_DURATION_REDUCED_MS = 600;
