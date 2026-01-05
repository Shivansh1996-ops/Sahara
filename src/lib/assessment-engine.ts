/**
 * Mental Health Assessment Engine
 * 
 * Provides validated screening tools for depression (PHQ-9), anxiety (GAD-7),
 * and stress (PSS). These are screening tools only and do not diagnose.
 */

// ============================================================================
// TYPES
// ============================================================================

export type AssessmentType = 'PHQ9' | 'GAD7' | 'PSS';

export interface AssessmentQuestion {
  id: number;
  text: string;
  options: AssessmentOption[];
}

export interface AssessmentOption {
  value: number;
  label: string;
}

export interface Assessment {
  id: AssessmentType;
  name: string;
  description: string;
  purpose: string;
  timeToComplete: number; // minutes
  questions: AssessmentQuestion[];
  scoringGuide: ScoringRange[];
  disclaimer: string;
}

export interface ScoringRange {
  min: number;
  max: number;
  severity: 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe';
  interpretation: string;
  recommendations: string[];
}

export interface AssessmentResult {
  id: string;
  assessmentType: AssessmentType;
  score: number;
  maxScore: number;
  severity: string;
  interpretation: string;
  recommendations: string[];
  answers: number[];
  completedAt: Date;
}

// ============================================================================
// PHQ-9 (Patient Health Questionnaire-9) - Depression Screening
// ============================================================================

const phq9Options: AssessmentOption[] = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' }
];

export const PHQ9: Assessment = {
  id: 'PHQ9',
  name: 'PHQ-9 Depression Screening',
  description: 'A brief questionnaire to help understand how you\'ve been feeling over the past two weeks.',
  purpose: 'This screening helps identify symptoms that may be associated with depression.',
  timeToComplete: 3,
  disclaimer: 'This is a screening tool, not a diagnostic instrument. It does not replace professional evaluation. If you\'re concerned about your mental health, please consult a healthcare provider.',
  questions: [
    { id: 1, text: 'Little interest or pleasure in doing things', options: phq9Options },
    { id: 2, text: 'Feeling down, depressed, or hopeless', options: phq9Options },
    { id: 3, text: 'Trouble falling or staying asleep, or sleeping too much', options: phq9Options },
    { id: 4, text: 'Feeling tired or having little energy', options: phq9Options },
    { id: 5, text: 'Poor appetite or overeating', options: phq9Options },
    { id: 6, text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down', options: phq9Options },
    { id: 7, text: 'Trouble concentrating on things, such as reading the newspaper or watching television', options: phq9Options },
    { id: 8, text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual', options: phq9Options },
    { id: 9, text: 'Thoughts that you would be better off dead or of hurting yourself in some way', options: phq9Options }
  ],
  scoringGuide: [
    {
      min: 0, max: 4,
      severity: 'minimal',
      interpretation: 'Your responses suggest minimal symptoms. This is a positive sign.',
      recommendations: [
        'Continue practicing self-care',
        'Maintain healthy habits like regular sleep and exercise',
        'Stay connected with supportive people'
      ]
    },
    {
      min: 5, max: 9,
      severity: 'mild',
      interpretation: 'Your responses suggest some mild symptoms. Many people experience these feelings from time to time.',
      recommendations: [
        'Consider talking to someone you trust about how you\'re feeling',
        'Try incorporating more self-care activities',
        'Monitor how you\'re feeling over the next few weeks',
        'The CBT tools in this app may be helpful'
      ]
    },
    {
      min: 10, max: 14,
      severity: 'moderate',
      interpretation: 'Your responses suggest moderate symptoms. It may be helpful to seek additional support.',
      recommendations: [
        'Consider speaking with a healthcare provider or counselor',
        'Reach out to supportive friends or family',
        'Continue using wellness tools and self-care practices',
        'Remember that seeking help is a sign of strength'
      ]
    },
    {
      min: 15, max: 19,
      severity: 'moderately_severe',
      interpretation: 'Your responses suggest moderately severe symptoms. Professional support is recommended.',
      recommendations: [
        'We encourage you to speak with a healthcare provider soon',
        'Consider reaching out to a mental health professional',
        'Talk to someone you trust about how you\'re feeling',
        'You don\'t have to face this alone'
      ]
    },
    {
      min: 20, max: 27,
      severity: 'severe',
      interpretation: 'Your responses suggest significant symptoms. Please consider reaching out for professional support.',
      recommendations: [
        'Please consider speaking with a healthcare provider as soon as possible',
        'If you\'re having thoughts of self-harm, please reach out to a crisis line',
        'You deserve support and help is available',
        'Consider talking to someone you trust today'
      ]
    }
  ]
};

// ============================================================================
// GAD-7 (Generalized Anxiety Disorder-7) - Anxiety Screening
// ============================================================================

const gad7Options: AssessmentOption[] = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' }
];

export const GAD7: Assessment = {
  id: 'GAD7',
  name: 'GAD-7 Anxiety Screening',
  description: 'A brief questionnaire to help understand your anxiety levels over the past two weeks.',
  purpose: 'This screening helps identify symptoms that may be associated with anxiety.',
  timeToComplete: 2,
  disclaimer: 'This is a screening tool, not a diagnostic instrument. It does not replace professional evaluation. If you\'re concerned about your mental health, please consult a healthcare provider.',
  questions: [
    { id: 1, text: 'Feeling nervous, anxious, or on edge', options: gad7Options },
    { id: 2, text: 'Not being able to stop or control worrying', options: gad7Options },
    { id: 3, text: 'Worrying too much about different things', options: gad7Options },
    { id: 4, text: 'Trouble relaxing', options: gad7Options },
    { id: 5, text: 'Being so restless that it\'s hard to sit still', options: gad7Options },
    { id: 6, text: 'Becoming easily annoyed or irritable', options: gad7Options },
    { id: 7, text: 'Feeling afraid as if something awful might happen', options: gad7Options }
  ],
  scoringGuide: [
    {
      min: 0, max: 4,
      severity: 'minimal',
      interpretation: 'Your responses suggest minimal anxiety symptoms. This is a positive sign.',
      recommendations: [
        'Continue practicing stress management techniques',
        'Maintain healthy routines',
        'The breathing exercises in this app can help maintain calm'
      ]
    },
    {
      min: 5, max: 9,
      severity: 'mild',
      interpretation: 'Your responses suggest mild anxiety symptoms. Some anxiety is normal and manageable.',
      recommendations: [
        'Try the grounding and breathing exercises in this app',
        'Consider what might be contributing to your worry',
        'Practice relaxation techniques regularly',
        'Monitor your symptoms over the coming weeks'
      ]
    },
    {
      min: 10, max: 14,
      severity: 'moderate',
      interpretation: 'Your responses suggest moderate anxiety symptoms. Additional support may be helpful.',
      recommendations: [
        'Consider speaking with a healthcare provider or counselor',
        'The CBT tools in this app may help with worry management',
        'Practice regular relaxation and grounding exercises',
        'Reach out to supportive people in your life'
      ]
    },
    {
      min: 15, max: 21,
      severity: 'severe',
      interpretation: 'Your responses suggest significant anxiety symptoms. Professional support is recommended.',
      recommendations: [
        'We encourage you to speak with a healthcare provider',
        'Consider reaching out to a mental health professional',
        'Use the grounding exercises when feeling overwhelmed',
        'Remember that anxiety is treatable and help is available'
      ]
    }
  ]
};

// ============================================================================
// PSS (Perceived Stress Scale) - Stress Assessment
// ============================================================================

const pssOptions: AssessmentOption[] = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Almost never' },
  { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Fairly often' },
  { value: 4, label: 'Very often' }
];

const pssOptionsReversed: AssessmentOption[] = [
  { value: 4, label: 'Never' },
  { value: 3, label: 'Almost never' },
  { value: 2, label: 'Sometimes' },
  { value: 1, label: 'Fairly often' },
  { value: 0, label: 'Very often' }
];

export const PSS: Assessment = {
  id: 'PSS',
  name: 'Perceived Stress Scale',
  description: 'A questionnaire to understand your stress levels over the past month.',
  purpose: 'This helps measure how stressful you perceive situations in your life.',
  timeToComplete: 3,
  disclaimer: 'This is a self-assessment tool to help you understand your stress levels. It is not a diagnostic instrument.',
  questions: [
    { id: 1, text: 'In the last month, how often have you been upset because of something that happened unexpectedly?', options: pssOptions },
    { id: 2, text: 'In the last month, how often have you felt that you were unable to control the important things in your life?', options: pssOptions },
    { id: 3, text: 'In the last month, how often have you felt nervous and stressed?', options: pssOptions },
    { id: 4, text: 'In the last month, how often have you felt confident about your ability to handle your personal problems?', options: pssOptionsReversed },
    { id: 5, text: 'In the last month, how often have you felt that things were going your way?', options: pssOptionsReversed },
    { id: 6, text: 'In the last month, how often have you found that you could not cope with all the things that you had to do?', options: pssOptions },
    { id: 7, text: 'In the last month, how often have you been able to control irritations in your life?', options: pssOptionsReversed },
    { id: 8, text: 'In the last month, how often have you felt that you were on top of things?', options: pssOptionsReversed },
    { id: 9, text: 'In the last month, how often have you been angered because of things that happened that were outside of your control?', options: pssOptions },
    { id: 10, text: 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?', options: pssOptions }
  ],
  scoringGuide: [
    {
      min: 0, max: 13,
      severity: 'minimal',
      interpretation: 'Your responses suggest low perceived stress. You seem to be managing life\'s challenges well.',
      recommendations: [
        'Continue your current stress management practices',
        'Maintain healthy habits and routines',
        'Stay connected with supportive people'
      ]
    },
    {
      min: 14, max: 26,
      severity: 'moderate',
      interpretation: 'Your responses suggest moderate stress levels. This is common and manageable with good self-care.',
      recommendations: [
        'Consider what stressors you might be able to reduce',
        'Practice regular relaxation techniques',
        'The breathing and grounding exercises can help',
        'Make time for activities you enjoy'
      ]
    },
    {
      min: 27, max: 40,
      severity: 'severe',
      interpretation: 'Your responses suggest high perceived stress. Additional support and stress management may be helpful.',
      recommendations: [
        'Consider speaking with a counselor or healthcare provider',
        'Identify and address major stressors where possible',
        'Prioritize self-care and rest',
        'Use the relaxation tools in this app regularly',
        'Reach out to supportive people in your life'
      ]
    }
  ]
};

// ============================================================================
// ASSESSMENT FUNCTIONS
// ============================================================================

export function getAssessment(type: AssessmentType): Assessment {
  switch (type) {
    case 'PHQ9': return PHQ9;
    case 'GAD7': return GAD7;
    case 'PSS': return PSS;
  }
}

export function calculateScore(assessment: Assessment, answers: number[]): number {
  return answers.reduce((sum, answer) => sum + answer, 0);
}

export function getMaxScore(assessment: Assessment): number {
  return assessment.questions.reduce((max, q) => {
    const maxOption = Math.max(...q.options.map(o => o.value));
    return max + maxOption;
  }, 0);
}

export function interpretScore(assessment: Assessment, score: number): ScoringRange {
  for (const range of assessment.scoringGuide) {
    if (score >= range.min && score <= range.max) {
      return range;
    }
  }
  // Default to last range if score exceeds expected
  return assessment.scoringGuide[assessment.scoringGuide.length - 1];
}

export function createAssessmentResult(
  assessmentType: AssessmentType,
  answers: number[]
): AssessmentResult {
  const assessment = getAssessment(assessmentType);
  const score = calculateScore(assessment, answers);
  const maxScore = getMaxScore(assessment);
  const interpretation = interpretScore(assessment, score);
  
  return {
    id: `result-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    assessmentType,
    score,
    maxScore,
    severity: interpretation.severity,
    interpretation: interpretation.interpretation,
    recommendations: interpretation.recommendations,
    answers,
    completedAt: new Date()
  };
}

export function getAllAssessments(): Assessment[] {
  return [PHQ9, GAD7, PSS];
}

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

export interface AssessmentHistory {
  assessmentType: AssessmentType;
  results: AssessmentResult[];
}

export function analyzeAssessmentTrend(results: AssessmentResult[]): {
  trend: 'improving' | 'stable' | 'worsening';
  change: number;
  message: string;
} {
  if (results.length < 2) {
    return { trend: 'stable', change: 0, message: 'Take more assessments to see your trend.' };
  }
  
  const sorted = [...results].sort((a, b) => 
    new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );
  
  const recent = sorted.slice(-3);
  const avgRecent = recent.reduce((sum, r) => sum + r.score, 0) / recent.length;
  const oldest = sorted[0].score;
  
  const change = ((avgRecent - oldest) / oldest) * 100;
  
  // For these assessments, lower scores are better
  if (change < -10) {
    return { 
      trend: 'improving', 
      change: Math.abs(change),
      message: 'Your scores have been improving. Keep up the good work!' 
    };
  } else if (change > 10) {
    return { 
      trend: 'worsening', 
      change,
      message: 'Your scores have increased. Consider reaching out for additional support.' 
    };
  }
  
  return { 
    trend: 'stable', 
    change: Math.abs(change),
    message: 'Your scores have been relatively stable.' 
  };
}

export function getRecommendedRetakeInterval(severity: string): number {
  // Returns days until recommended retake
  switch (severity) {
    case 'minimal': return 30;
    case 'mild': return 14;
    case 'moderate': return 7;
    case 'moderately_severe': return 7;
    case 'severe': return 7;
    default: return 14;
  }
}
