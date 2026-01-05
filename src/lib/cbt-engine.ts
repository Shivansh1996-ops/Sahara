/**
 * CBT (Cognitive Behavioral Therapy) Engine
 * 
 * Provides evidence-based CBT tools and exercises for mental wellness.
 */

// ============================================================================
// TYPES
// ============================================================================

export type CognitiveDistortion = 
  | 'all_or_nothing'
  | 'catastrophizing'
  | 'mind_reading'
  | 'fortune_telling'
  | 'emotional_reasoning'
  | 'should_statements'
  | 'labeling'
  | 'personalization'
  | 'mental_filter'
  | 'discounting_positives';

export interface ThoughtRecord {
  id: string;
  situation: string;
  automaticThought: string;
  emotions: { name: string; intensity: number }[];
  cognitiveDistortions: CognitiveDistortion[];
  evidence: { supporting: string; against: string };
  alternativeThought: string;
  newEmotions: { name: string; intensity: number }[];
  createdAt: Date;
}

export interface CBTExercise {
  id: string;
  type: CBTExerciseType;
  title: string;
  description: string;
  duration: number;
  steps: CBTStep[];
  benefits: string[];
}

export type CBTExerciseType = 
  | 'thought_record'
  | 'behavioral_activation'
  | 'worry_time'
  | 'gratitude_practice'
  | 'exposure_hierarchy'
  | 'cognitive_restructuring'
  | 'mindful_breathing'
  | 'progressive_relaxation';

export interface CBTStep {
  id: number;
  title: string;
  instruction: string;
  inputType?: 'text' | 'scale' | 'multiselect' | 'none';
  options?: string[];
}

export interface CBTProgress {
  exerciseType: CBTExerciseType;
  completedCount: number;
  lastCompleted: Date;
  insights: string[];
}

// ============================================================================
// COGNITIVE DISTORTIONS
// ============================================================================

export const cognitiveDistortions: Record<CognitiveDistortion, { name: string; description: string; example: string; challenge: string }> = {
  all_or_nothing: {
    name: "All-or-Nothing Thinking",
    description: "Seeing things in black and white categories. If a situation falls short of perfect, you see it as a total failure.",
    example: "I made one mistake, so I'm a complete failure.",
    challenge: "Is there a middle ground? Can something be partially successful?"
  },
  catastrophizing: {
    name: "Catastrophizing",
    description: "Expecting the worst possible outcome or blowing things out of proportion.",
    example: "If I fail this test, my life is ruined.",
    challenge: "What's the most likely outcome? What would I tell a friend?"
  },
  mind_reading: {
    name: "Mind Reading",
    description: "Assuming you know what others are thinking without evidence.",
    example: "They didn't text back, so they must hate me.",
    challenge: "Do I have evidence for this? Are there other explanations?"
  },
  fortune_telling: {
    name: "Fortune Telling",
    description: "Predicting negative outcomes without evidence.",
    example: "I know the interview will go badly.",
    challenge: "Can I really predict the future? What evidence do I have?"
  },
  emotional_reasoning: {
    name: "Emotional Reasoning",
    description: "Believing that because you feel a certain way, it must be true.",
    example: "I feel stupid, so I must be stupid.",
    challenge: "Are feelings always facts? What would the evidence say?"
  },
  should_statements: {
    name: "Should Statements",
    description: "Using 'should', 'must', or 'ought to' statements that create unrealistic expectations.",
    example: "I should always be productive.",
    challenge: "Is this expectation realistic? What would be more flexible?"
  },
  labeling: {
    name: "Labeling",
    description: "Attaching a negative label to yourself or others based on one event.",
    example: "I'm such a loser.",
    challenge: "Is this label fair based on one situation? What else is true about me?"
  },
  personalization: {
    name: "Personalization",
    description: "Taking responsibility for events outside your control.",
    example: "It's my fault they're in a bad mood.",
    challenge: "What factors were actually in my control? What else could explain this?"
  },
  mental_filter: {
    name: "Mental Filter",
    description: "Focusing only on the negative aspects while ignoring positives.",
    example: "I got great feedback but one criticism, so it was terrible.",
    challenge: "What positives am I overlooking? What's the full picture?"
  },
  discounting_positives: {
    name: "Discounting the Positives",
    description: "Dismissing positive experiences as not counting.",
    example: "They only said that to be nice.",
    challenge: "Why am I dismissing this? What if I accepted it at face value?"
  }
};

// ============================================================================
// CBT EXERCISES
// ============================================================================

export const cbtExercises: CBTExercise[] = [
  {
    id: 'thought_record',
    type: 'thought_record',
    title: 'Thought Record',
    description: 'Identify and challenge negative automatic thoughts by examining the evidence.',
    duration: 10,
    benefits: ['Identify thinking patterns', 'Challenge negative thoughts', 'Develop balanced thinking'],
    steps: [
      { id: 1, title: 'Describe the Situation', instruction: 'What happened? Where were you? Who was there?', inputType: 'text' },
      { id: 2, title: 'Identify Your Thought', instruction: 'What went through your mind? What were you thinking?', inputType: 'text' },
      { id: 3, title: 'Rate Your Emotions', instruction: 'What emotions did you feel? Rate their intensity (0-100).', inputType: 'scale' },
      { id: 4, title: 'Identify Distortions', instruction: 'Which thinking patterns might be at play?', inputType: 'multiselect', options: Object.keys(cognitiveDistortions) },
      { id: 5, title: 'Examine Evidence', instruction: 'What evidence supports this thought? What evidence is against it?', inputType: 'text' },
      { id: 6, title: 'Alternative Thought', instruction: 'What is a more balanced way to think about this?', inputType: 'text' },
      { id: 7, title: 'Re-rate Emotions', instruction: 'How do you feel now? Rate your emotions again.', inputType: 'scale' }
    ]
  },
  {
    id: 'behavioral_activation',
    type: 'behavioral_activation',
    title: 'Behavioral Activation',
    description: 'Plan and engage in activities that bring a sense of pleasure or accomplishment.',
    duration: 5,
    benefits: ['Increase positive activities', 'Break cycle of avoidance', 'Improve mood'],
    steps: [
      { id: 1, title: 'Current Activity Level', instruction: 'How active have you been today? (1-10)', inputType: 'scale' },
      { id: 2, title: 'Identify Activities', instruction: 'List 3 activities that usually make you feel good or accomplished.', inputType: 'text' },
      { id: 3, title: 'Choose One', instruction: 'Pick one activity you can do in the next hour.', inputType: 'text' },
      { id: 4, title: 'Plan It', instruction: 'When exactly will you do it? What do you need?', inputType: 'text' },
      { id: 5, title: 'Predict Your Mood', instruction: 'How do you think you\'ll feel after? (1-10)', inputType: 'scale' },
      { id: 6, title: 'Commit', instruction: 'Say "I will do [activity] at [time]"', inputType: 'text' }
    ]
  },
  {
    id: 'worry_time',
    type: 'worry_time',
    title: 'Worry Time',
    description: 'Contain your worries to a specific time period to reduce their impact throughout the day.',
    duration: 15,
    benefits: ['Reduce constant worrying', 'Gain control over anxious thoughts', 'Improve focus'],
    steps: [
      { id: 1, title: 'List Your Worries', instruction: 'Write down everything that\'s worrying you right now.', inputType: 'text' },
      { id: 2, title: 'Categorize', instruction: 'For each worry: Is it something you can control or not?', inputType: 'text' },
      { id: 3, title: 'Action Items', instruction: 'For controllable worries, what\'s one small step you can take?', inputType: 'text' },
      { id: 4, title: 'Let Go', instruction: 'For uncontrollable worries, practice saying "I notice this worry and I\'m letting it go for now."', inputType: 'none' },
      { id: 5, title: 'Schedule Next Worry Time', instruction: 'When will your next worry time be? (Aim for same time daily)', inputType: 'text' },
      { id: 6, title: 'Transition', instruction: 'Take 3 deep breaths and choose an activity to transition to.', inputType: 'none' }
    ]
  },
  {
    id: 'gratitude_practice',
    type: 'gratitude_practice',
    title: 'Gratitude Practice',
    description: 'Focus on positive aspects of life to shift perspective and improve mood.',
    duration: 5,
    benefits: ['Shift focus to positives', 'Improve overall mood', 'Build resilience'],
    steps: [
      { id: 1, title: 'Three Good Things', instruction: 'List 3 things you\'re grateful for today, big or small.', inputType: 'text' },
      { id: 2, title: 'Why It Matters', instruction: 'For each one, why does it matter to you?', inputType: 'text' },
      { id: 3, title: 'Savor the Feeling', instruction: 'Close your eyes and really feel the gratitude for 30 seconds.', inputType: 'none' },
      { id: 4, title: 'Share It', instruction: 'Is there someone you could thank or share this with?', inputType: 'text' },
      { id: 5, title: 'Future Gratitude', instruction: 'What\'s one thing you\'re looking forward to?', inputType: 'text' }
    ]
  },
  {
    id: 'mindful_breathing',
    type: 'mindful_breathing',
    title: 'Mindful Breathing',
    description: 'Use focused breathing to calm your nervous system and center yourself.',
    duration: 5,
    benefits: ['Reduce anxiety', 'Calm the nervous system', 'Increase present-moment awareness'],
    steps: [
      { id: 1, title: 'Get Comfortable', instruction: 'Find a comfortable position. You can sit or lie down.', inputType: 'none' },
      { id: 2, title: 'Notice Your Breath', instruction: 'Without changing it, notice how you\'re breathing right now.', inputType: 'none' },
      { id: 3, title: 'Deep Breath In', instruction: 'Breathe in slowly through your nose for 4 counts.', inputType: 'none' },
      { id: 4, title: 'Hold', instruction: 'Hold your breath gently for 4 counts.', inputType: 'none' },
      { id: 5, title: 'Breathe Out', instruction: 'Exhale slowly through your mouth for 6 counts.', inputType: 'none' },
      { id: 6, title: 'Repeat', instruction: 'Continue this pattern for 5 cycles. Notice how you feel.', inputType: 'none' },
      { id: 7, title: 'Reflect', instruction: 'How do you feel now compared to when you started?', inputType: 'scale' }
    ]
  },
  {
    id: 'progressive_relaxation',
    type: 'progressive_relaxation',
    title: 'Progressive Muscle Relaxation',
    description: 'Systematically tense and relax muscle groups to release physical tension.',
    duration: 10,
    benefits: ['Release physical tension', 'Reduce stress', 'Improve body awareness'],
    steps: [
      { id: 1, title: 'Get Comfortable', instruction: 'Lie down or sit comfortably. Close your eyes.', inputType: 'none' },
      { id: 2, title: 'Feet & Legs', instruction: 'Tense your feet and legs for 5 seconds, then release. Notice the difference.', inputType: 'none' },
      { id: 3, title: 'Stomach', instruction: 'Tense your stomach muscles for 5 seconds, then release.', inputType: 'none' },
      { id: 4, title: 'Hands & Arms', instruction: 'Make fists and tense your arms for 5 seconds, then release.', inputType: 'none' },
      { id: 5, title: 'Shoulders & Neck', instruction: 'Raise your shoulders to your ears for 5 seconds, then release.', inputType: 'none' },
      { id: 6, title: 'Face', instruction: 'Scrunch your face for 5 seconds, then release completely.', inputType: 'none' },
      { id: 7, title: 'Full Body', instruction: 'Scan your body. Notice any remaining tension and breathe into it.', inputType: 'none' },
      { id: 8, title: 'Reflect', instruction: 'How relaxed do you feel now? (1-10)', inputType: 'scale' }
    ]
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function identifyDistortions(thought: string): CognitiveDistortion[] {
  const lowerThought = thought.toLowerCase();
  const identified: CognitiveDistortion[] = [];
  
  // All-or-nothing
  if (/always|never|completely|totally|everyone|no one|nothing|everything/i.test(lowerThought)) {
    identified.push('all_or_nothing');
  }
  
  // Catastrophizing
  if (/worst|terrible|awful|disaster|ruined|end of|can't handle/i.test(lowerThought)) {
    identified.push('catastrophizing');
  }
  
  // Mind reading
  if (/they think|they must|they probably|they're judging|they hate/i.test(lowerThought)) {
    identified.push('mind_reading');
  }
  
  // Fortune telling
  if (/will fail|won't work|going to be|it's going to|will never/i.test(lowerThought)) {
    identified.push('fortune_telling');
  }
  
  // Emotional reasoning
  if (/i feel like|feels like i'm|because i feel/i.test(lowerThought)) {
    identified.push('emotional_reasoning');
  }
  
  // Should statements
  if (/should|must|have to|ought to|need to be/i.test(lowerThought)) {
    identified.push('should_statements');
  }
  
  // Labeling
  if (/i'm a|i'm such a|i'm so|what a|loser|failure|idiot|stupid/i.test(lowerThought)) {
    identified.push('labeling');
  }
  
  // Personalization
  if (/my fault|because of me|i caused|i made them/i.test(lowerThought)) {
    identified.push('personalization');
  }
  
  return identified;
}

export function generateAlternativeThought(
  originalThought: string,
  distortions: CognitiveDistortion[]
): string {
  const suggestions: string[] = [];
  
  for (const distortion of distortions) {
    const info = cognitiveDistortions[distortion];
    suggestions.push(info.challenge);
  }
  
  if (suggestions.length === 0) {
    return "What would be a more balanced way to think about this situation?";
  }
  
  return suggestions[0];
}

export function getExerciseById(id: string): CBTExercise | undefined {
  return cbtExercises.find(e => e.id === id);
}

export function getExercisesByType(type: CBTExerciseType): CBTExercise[] {
  return cbtExercises.filter(e => e.type === type);
}

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

export function calculateCBTProgress(completedExercises: { type: CBTExerciseType; date: Date }[]): CBTProgress[] {
  const progressMap = new Map<CBTExerciseType, CBTProgress>();
  
  for (const exercise of completedExercises) {
    const existing = progressMap.get(exercise.type);
    if (existing) {
      existing.completedCount++;
      if (exercise.date > existing.lastCompleted) {
        existing.lastCompleted = exercise.date;
      }
    } else {
      progressMap.set(exercise.type, {
        exerciseType: exercise.type,
        completedCount: 1,
        lastCompleted: exercise.date,
        insights: []
      });
    }
  }
  
  return Array.from(progressMap.values());
}
