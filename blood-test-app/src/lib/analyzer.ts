import {
  BIOMARKERS_BY_ID,
  DISCLAIMER,
  GENERAL_QUESTIONS,
} from '../data/biomarkers';
import { evaluateCrossTestCombinations } from './contextEngine';
import { calculateTrends } from './trendEngine';
import { rankAndDeduplicateQuestions } from './questionEngine';
import {
  AnalysisItem,
  AnalysisResult,
  AnalysisSummary,
  PatientContext,
  TestResults,
} from '../types';

const SEVERITY_ORDER = { danger: 0, warning: 1, normal: 2 } as const;

const createId = (): string => {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && 'randomUUID' in cryptoObj) return cryptoObj.randomUUID();
  return `a_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const buildSummary = (items: AnalysisItem[]): AnalysisSummary => {
  const counts = { normal: 0, warning: 0, danger: 0 };
  items.forEach((item) => {
    counts[item.severity] += 1;
  });

  let headline: string;
  if (counts.danger > 0) {
    headline =
      'חלק מהערכים חורגים מהטווח המקובל. מומלץ להביא את התוצאות לשיחה עם רופא/ת המשפחה.';
  } else if (counts.warning > 0) {
    headline = 'רוב הערכים בטווח התקין, וישנם מדדים גבוליים שכדאי לעקוב אחריהם.';
  } else {
    headline = 'כל המדדים שהוזנו נמצאים בטווח התקין.';
  }

  return { total: items.length, ...counts, headline };
};

/**
 * Pure deterministic clinical evaluation pipeline running 100% in the client browser.
 */
export const analyzeBloodTest = (
  results: TestResults,
  patient?: PatientContext,
  previousValues?: Record<string, number>
): AnalysisResult => {
  const analysis: AnalysisItem[] = [];

  for (const [markerId, value] of Object.entries(results)) {
    const marker = BIOMARKERS_BY_ID[markerId];
    if (!marker || !Number.isFinite(value)) continue;

    const evaluation = marker.evaluate(value, patient?.sex);
    
    // Resolve display reference range (handle sex-specific ranges)
    let displayRef = '';
    if (typeof marker.reference === 'string') {
      displayRef = marker.reference;
    } else if (marker.reference) {
      displayRef = patient?.sex === 'male' ? marker.reference.male : marker.reference.female;
    }

    // Resolve range config if split by sex
    let resolvedRangeConfig = undefined;
    if (marker.rangeConfig) {
      if ('visualMin' in marker.rangeConfig) {
        resolvedRangeConfig = marker.rangeConfig;
      } else if (patient?.sex === 'male') {
        resolvedRangeConfig = marker.rangeConfig.male;
      } else {
        resolvedRangeConfig = marker.rangeConfig.female;
      }
    }

    analysis.push({
      markerId,
      name: marker.name,
      abbreviation: marker.abbreviation,
      result: value,
      unit: marker.unit,
      category: marker.category,
      description: marker.description,
      reference: displayRef,
      status: evaluation.status,
      severity: evaluation.severity,
      direction: evaluation.direction || 'normal',
      safeMessage: evaluation.message,
      questions: evaluation.questions,
      rangeConfig: resolvedRangeConfig,
      whatItMeasures: evaluation.whatItMeasures,
      possibleReasons: evaluation.possibleReasons,
      urgency: evaluation.urgency,
    });
  }

  // Sort by severity (danger -> warning -> normal)
  analysis.sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );

  // Evaluate cross-biomarker combinations
  const contextFindings = evaluateCrossTestCombinations(analysis);

  // Calculate trends vs previous values
  const trends = calculateTrends(results, previousValues);

  // Generate ranked & deduplicated questions
  const rankedDoctorQuestions = rankAndDeduplicateQuestions(
    analysis,
    contextFindings,
    trends,
    patient
  );

  return {
    id: createId(),
    createdAt: new Date().toISOString(),
    patient,
    analysis,
    summary: buildSummary(analysis),
    contextFindings,
    trends,
    generalQuestions: GENERAL_QUESTIONS,
    rankedDoctorQuestions,
    disclaimer: DISCLAIMER,
    previousValues,
  };
};
