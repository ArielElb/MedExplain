import { getCombinationQuestions } from './contextEngine';
import { AnalysisItem, ContextFinding, PatientContext, TrendResult } from '../types';
import { GENERAL_QUESTIONS } from '../data/biomarkers';

const CONTEXT_TAG_QUESTIONS: Record<string, string[]> = {
  cardiovascular_family_history: [
    'לאור ההיסטוריה המשפחתית של מחלות לב, האם מומלץ להחמיר את יעדי הכולסטרול או להשלים בדיקות נוספות (כמו בדיקת מאמץ או סקירת עורקים)?',
  ],
  vegetarian_diet: [
    'בהתחשב בתזונה צמחונית/טבעונית, אילו תוספים והשלמות תזונתיות מומלצות למניעת ירידה במאגרי ברזל ו-B12?',
  ],
  recent_viral_illness: [
    'האם ייתכן שהחריגה בספירת הדם ובמדדי הדלקת היא שארית מהמחלה הוויראלית שהייתה לאחרונה, ומתי כדאי לחזור על הבדיקה?',
  ],
  joint_pain: [
    'האם מדדי הדלקת המוגברים מצדיקים השלמת בירור ראומטולוגי או בדיקת נוגדנים למפרקים?',
  ],
};

export const rankAndDeduplicateQuestions = (
  items: AnalysisItem[],
  contextFindings: ContextFinding[],
  trends: TrendResult[],
  patient?: PatientContext
): string[] => {
  const orderedQuestions: string[] = [];
  const seen = new Set<string>();

  const add = (q?: string) => {
    if (!q) return;
    const clean = q.trim();
    if (!clean || seen.has(clean)) return;
    seen.add(clean);
    orderedQuestions.push(clean);
  };

  // 1. Cross-test combination questions (highest priority & broadest clinical signal)
  for (const finding of contextFindings) {
    const questions = getCombinationQuestions(finding.ruleId);
    questions.forEach(add);
  }

  // 2. Trend-aware questions (high priority for evolving values)
  for (const trend of trends) {
    if (trend.isConcerning && trend.recommendedQuestion) {
      add(trend.recommendedQuestion);
    }
  }

  // 3. Patient clinical context tag questions (personalized to patient history)
  if (patient?.contextTags) {
    for (const tag of patient.contextTags) {
      const tagQuestions = CONTEXT_TAG_QUESTIONS[tag];
      if (tagQuestions) {
        tagQuestions.forEach(add);
      }
    }
  }

  // 4. Test-specific questions for abnormal (danger) findings
  const dangerItems = items.filter((item) => item.severity === 'danger');
  for (const item of dangerItems) {
    item.questions.forEach(add);
  }

  // 5. Test-specific questions for borderline (warning) findings
  const warningItems = items.filter((item) => item.severity === 'warning');
  for (const item of warningItems) {
    item.questions.forEach(add);
  }

  // 6. Any other trend questions
  for (const trend of trends) {
    if (trend.recommendedQuestion) {
      add(trend.recommendedQuestion);
    }
  }

  // 7. General physician questions (fallback / foundational)
  GENERAL_QUESTIONS.forEach(add);

  return orderedQuestions;
};

