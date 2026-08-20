import {
  AgeRange,
  DesiredResult,
  QuizOption,
  ScoredSlug,
  SkinConcern,
  SkinTone,
  SkinType,
} from '../models/quiz.model';

// ---- Question copy ---------------------------------------------------------
export const AGE_QUESTION = "What's your age range?";
export const TONE_QUESTION = "What's your skin tone?";
export const SKIN_TYPE_QUESTION = 'How would you describe your skin most of the time?';
export const CONCERN_QUESTION = 'What would you most like to improve about your skin?';
export const RESULT_QUESTION = 'How would you love your skin to look and feel afterward?';

// ---- Options ---------------------------------------------------------------
/**
 * Q1. Collected for the "why we chose this" copy and future analytics only — age
 * appears in no scoring or eligibility table anywhere in the app.
 */
export const AGE_OPTIONS: readonly QuizOption<AgeRange>[] = [
  { value: 'under-18', label: 'Under 18' },
  { value: '18-24', label: '18–24' },
  { value: '25-34', label: '25–34' },
  { value: '35-44', label: '35–44' },
  { value: '45-plus', label: '45 and above' },
];

/**
 * Q2. The swatches are indicative only — they help the visitor place themselves on
 * the scale. Tone filters eligibility but is never presented as a reason a product
 * was chosen (see composeReason).
 */
export const TONE_OPTIONS: readonly QuizOption<SkinTone>[] = [
  {
    value: 'fair',
    label: 'Fair',
    description: 'Burns easily, rarely tans',
    swatch: '#f2d9c4',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Golden or olive undertones',
    swatch: '#dcb188',
  },
  {
    value: 'tan',
    label: 'Tan',
    description: 'Tans easily, warm brown',
    swatch: '#b17c50',
  },
  {
    value: 'deep',
    label: 'Deep',
    description: 'Rich brown to deep',
    swatch: '#6b4229',
  },
];

/** Q3. Filters eligibility and adds the suitability bonus. */
export const SKIN_TYPE_OPTIONS: readonly QuizOption<SkinType>[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'oily', label: 'Oily' },
  { value: 'combination', label: 'Combination', description: 'Oily in some areas, normal in others' },
  { value: 'dry', label: 'Dry' },
  { value: 'sensitive', label: 'Sensitive' },
];

/** Q4. Scored only. */
export const CONCERN_OPTIONS: readonly QuizOption<SkinConcern>[] = [
  { value: 'dullness', label: 'Dull-looking skin' },
  { value: 'texture', label: 'Rough or uneven texture' },
  { value: 'dryness', label: 'Dryness or lack of softness' },
  { value: 'excess-oil', label: 'Excess oil or clogged-looking pores' },
  { value: 'tired', label: 'Skin that looks tired' },
  { value: 'glow', label: 'I want a healthy-looking glow' },
];

/** Q5. Scored only. */
export const RESULT_OPTIONS: readonly QuizOption<DesiredResult>[] = [
  { value: 'bright', label: 'Bright & radiant' },
  { value: 'soft', label: 'Soft & moisturized' },
  { value: 'fresh', label: 'Fresh & revitalized' },
  { value: 'clean', label: 'Clean & deeply cleansed' },
  { value: 'smooth', label: 'Smooth & polished' },
  { value: 'glowing', label: 'Glowing & healthy-looking' },
];

// ---- "Why we chose this for you" fragments ---------------------------------
/**
 * The block is composed at read time from typed fragments rather than written out as
 * hundreds of variants:
 *
 *   "You told us your skin is {type} with a {tone} tone, and that {concern}.
 *    {Product} {approved description} — and it's formulated for {bestFor}, so it
 *    suits yours."
 *
 * Two rules are enforced by the shape of this data, not by review:
 *  - the benefit sentence is the product's own approved description, so the block can
 *    never assert a claim the master sheet does not make;
 *  - tone appears only in the descriptive opener, never in the reasoning clause, so
 *    no product is ever described as being "for" a particular skin tone.
 *
 * Composition itself lives in composeReason (the engine), called from the ViewModel.
 */
export const SKIN_TYPE_FRAGMENTS: Readonly<Record<SkinType, string>> = {
  normal: 'your skin is generally normal',
  oily: 'your skin is oily',
  combination: 'your skin is combination — oily in some areas, normal in others',
  dry: 'your skin tends to be dry',
  sensitive: 'your skin is sensitive',
};

/** Descriptive only. Never used as a justification — see the note above. */
export const SKIN_TONE_FRAGMENTS: Readonly<Record<SkinTone, string>> = {
  fair: 'with a fair tone',
  medium: 'with a medium tone',
  tan: 'with a tan tone',
  deep: 'with a deep tone',
};

export const CONCERN_FRAGMENTS: Readonly<Record<SkinConcern, string>> = {
  dullness: 'dull-looking skin is your main concern',
  texture: 'rough or uneven texture is your main concern',
  dryness: 'dryness and a lack of softness are your main concern',
  'excess-oil': 'excess oil and clogged pores are your main concern',
  tired: 'your skin has been looking tired',
  glow: "a healthy-looking glow is what you're after",
};

/**
 * How each product's approved description attaches to its name in the benefit
 * sentence. The descriptions are fixed brand copy and not all of them open with a
 * verb — "rich in vitamins and antioxidants…" needs an "is" to read as a sentence,
 * "unclogs pores…" does not. Only the connector varies; it asserts nothing itself, so
 * the claim stays exactly what the approved copy says.
 */
export const BENEFIT_CONNECTORS: Readonly<Record<ScoredSlug, string>> = {
  'hibiscus-rosa-radiance-scrub': '',
  'lemon-mint-cucumber-scrub': '',
  'turmeric-glow-scrub': '',
  'golden-radiance-scrub': '',
  'apricot-glow-scrub': 'is',
};

/** Names the visitor's own skin type back to them in the closing clause. */
export const SKIN_TYPE_LABELS: Readonly<Record<SkinType, string>> = {
  normal: 'normal',
  oily: 'oily',
  combination: 'combination',
  dry: 'dry',
  sensitive: 'sensitive',
};

// ---- Routine completer -----------------------------------------------------
/**
 * Shown beneath the routine-completer card for Dry and Sensitive skin only. The mask
 * is offered to every visitor; this notice is what makes that safe.
 */
export const UPSELL_SENSITIVITY_NOTICE =
  'Contains menthol and mint oils — you may feel a cooling tingle. We recommend a patch test first.';

// ---- Analysis screen -------------------------------------------------------
/** Rotating copy for the analysis screen, in order. */
export const ANALYSIS_MESSAGES: readonly string[] = [
  'Reviewing your answers…',
  'Analyzing your skin type…',
  'Matching your concerns…',
  'Preparing your result…',
];

export const ANALYSIS_DURATION_MS = 2800;
export const ANALYSIS_DURATION_REDUCED_MS = 600;
