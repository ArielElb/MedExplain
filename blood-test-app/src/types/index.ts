export type Severity = 'normal' | 'warning' | 'danger';

export interface RangeConfig {
  visualMin: number;
  visualMax: number;
  normalMin?: number;
  normalMax?: number;
  warningMin?: number;
  warningMax?: number;
  unit: string;
  lowLabel?: string;
  normalLabel?: string;
  highLabel?: string;
}

export interface Evaluation {
  status: string;
  severity: Severity;
  message: string;
  questions: string[];
  direction?: 'low' | 'normal' | 'high';
  whatItMeasures?: string;
  possibleReasons?: string[];
  urgency?: string;
}

export interface Biomarker {
  markerId: string;
  name: string;
  abbreviation?: string;
  unit: string;
  category: string;
  description: string;
  /** Reference range, for display only. */
  reference: string | { male: string; female: string };
  min: number;
  max: number;
  step: number;
  sexSpecific?: boolean;
  evaluate: (value: number, sex?: 'male' | 'female') => Evaluation;
  rangeConfig?: RangeConfig | { male: RangeConfig; female: RangeConfig };
}

export interface AnalysisItem {
  markerId: string;
  name: string;
  abbreviation?: string;
  result: number;
  unit: string;
  category: string;
  description: string;
  reference: string;
  status: string;
  severity: Severity;
  direction: 'low' | 'normal' | 'high';
  safeMessage: string;
  questions: string[];
  rangeConfig?: RangeConfig;
  whatItMeasures?: string;
  possibleReasons?: string[];
  urgency?: string;
}

export interface AnalysisSummary {
  total: number;
  normal: number;
  warning: number;
  danger: number;
  headline: string;
}

export interface ContextFinding {
  ruleId: string;
  matchedTests: string[];
  priority: number;
  headline: string;
  patientMessage: string;
  questionTags: string[];
  badgeText?: string;
}

export interface TrendResult {
  testKey: string;
  testName: string;
  unit: string;
  previousValue: number;
  currentValue: number;
  delta: number;
  percentChange: number;
  direction: 'increased' | 'decreased' | 'unchanged';
  isConcerning: boolean;
  interpretation: string;
  recommendedQuestion?: string;
}

export interface PatientContext {
  id?: string;
  name?: string;
  age?: number;
  sex?: 'male' | 'female';
  context?: string;
  notes?: string | null;
  contextTags?: string[];
}

export interface PatientScenario {
  id: string;
  title: string;
  name: string;
  age: number;
  sex: 'male' | 'female';
  category: 'routine' | 'lipids_sugar' | 'anemia_iron' | 'inflammation' | 'complex';
  context: string;
  notes: string | null;
  values: Record<string, number>;
  previous_values: Record<string, number>;
  context_tags: string[];
}

export interface VisitBrief {
  patient: PatientContext;
  generatedAt: string;
  summaryHeadline: string;
  keyFindings: string[];
  contextFindings: ContextFinding[];
  trends: TrendResult[];
  rankedQuestions: string[];
  checklist: string[];
  disclaimer: string;
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  patient?: PatientContext;
  analysis: AnalysisItem[];
  summary: AnalysisSummary;
  contextFindings: ContextFinding[];
  trends: TrendResult[];
  generalQuestions: string[];
  rankedDoctorQuestions: string[];
  disclaimer: string;
  previousValues?: Record<string, number>;
}

export interface TestResults {
  [markerId: string]: number;
}

export interface DemoPreset {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeSeverity: Severity;
  values: Record<string, string>;
  patient?: PatientContext;
  previousValues?: Record<string, number>;
}

export type NavigationPage = 'home' | 'scenarios' | 'results' | 'visit-brief' | 'about';
