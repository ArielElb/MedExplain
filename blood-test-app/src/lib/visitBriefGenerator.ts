import { AnalysisResult, VisitBrief } from '../types';

export const VISIT_BRIEF_CHECKLIST = [
  'בדיקות דם קודמות (לצורך השוואה וראיית מגמה)',
  'רשימת תרופות קבועות ותוספי תזונה בשימוש שוטף',
  'תיעוד תסמינים רלוונטיים שהופיעו לאחרונה (עייפות, כאב, שינוי בהרגשה)',
  'שאלות ממוקדות שהוכנו מראש מתוך הדוח',
];

export const generateVisitBrief = (result: AnalysisResult): VisitBrief => {
  const flaggedItems = result.analysis.filter(
    (item) => item.severity === 'danger' || item.severity === 'warning'
  );

  const keyFindings = flaggedItems.map((item) => {
    const statusLabel = item.severity === 'danger' ? 'חריג' : 'גבולי';
    return `${item.name}: ${item.result} ${item.unit} (${statusLabel} — טווח נורמה: ${item.reference})`;
  });

  let summaryHeadline = '';
  if (result.summary.danger > 0) {
    summaryHeadline = `אותרו ${result.summary.danger} מדדים החורגים מטווח הנורמה ו-${result.summary.warning} מדדים גבוליים המצדיקים התייחסות של רופא/ת המשפחה.`;
  } else if (result.summary.warning > 0) {
    summaryHeadline = `כל המדדים בטווח התקין למעט ${result.summary.warning} מדדים גבוליים הדורשים מעקב שגרתי.`;
  } else {
    summaryHeadline = 'כל תוצאות בדיקות הדם שנבדקו נמצאות בטווח הנורמה התקין.';
  }

  return {
    patient: result.patient || {
      name: 'מטופל/ת (הזנה אישית)',
      age: undefined,
      sex: undefined,
    },
    generatedAt: result.createdAt,
    summaryHeadline,
    keyFindings,
    contextFindings: result.contextFindings,
    trends: result.trends,
    rankedQuestions: result.rankedDoctorQuestions.slice(0, 8),
    checklist: VISIT_BRIEF_CHECKLIST,
    disclaimer: result.disclaimer,
  };
};

