import { BIOMARKERS_BY_ID } from '../data/biomarkers';
import { TrendResult } from '../types';

const TREND_CONCERN_DIRECTION: Record<string, 'increased' | 'decreased'> = {
  hba1c: 'increased',
  glucose: 'increased',
  ldl: 'increased',
  triglycerides: 'increased',
  hemoglobin: 'decreased',
  ferritin: 'decreased',
  crp: 'increased',
  wbc: 'increased',
  creatinine: 'increased',
  alt: 'increased',
  tsh: 'increased',
};

const TREND_RECOMMENDED_QUESTIONS: Record<string, string> = {
  hba1c: 'האם השינוי ב-HbA1c לעומת הבדיקה הקודמת משנה את תדירות המעקב או הטיפול המומלץ?',
  glucose: 'האם העלייה ברמת הסוכר מצריכה בדיקת HbA1c או שינוי תזונתי ממוקד?',
  ldl: 'האם מגמת העלייה ב-LDL לעומת הבדיקה הקודמת מצריכה התחלת טיפול או מעקב תכוף יותר?',
  hemoglobin: 'האם מגמת הירידה בהמוגלובין מצריכה בירור מעבדתי נוסף (כגון ברזל או B12)?',
  ferritin: 'האם מגמת הירידה בפריטין מעידה על התרוקנות מאגרים ומצריכה תוסף ברזל?',
  crp: 'האם העלייה ב-CRP מצביעה על תהליך דלקתי פעיל שמצריך בדיקה חוזרת?',
  wbc: 'האם העלייה בכדוריות הדם הלבנות קשורה למחלה או זיהום אחרון, ומתי כדאי לחזור על הבדיקה?',
};

export const calculateTrends = (
  currentValues: Record<string, number>,
  previousValues?: Record<string, number>
): TrendResult[] => {
  if (!previousValues || Object.keys(previousValues).length === 0) {
    return [];
  }

  const trends: TrendResult[] = [];

  for (const [testKey, prevVal] of Object.entries(previousValues)) {
    const currVal = currentValues[testKey];
    if (currVal === undefined || !Number.isFinite(currVal) || !Number.isFinite(prevVal)) {
      continue;
    }

    const marker = BIOMARKERS_BY_ID[testKey];
    const testName = marker ? marker.name : testKey;
    const unit = marker ? marker.unit : '';

    const delta = parseFloat((currVal - prevVal).toFixed(2));
    const percentChange = prevVal !== 0 ? parseFloat(((delta / prevVal) * 100).toFixed(1)) : 0;

    let direction: 'increased' | 'decreased' | 'unchanged' = 'unchanged';
    if (delta > 0.01) direction = 'increased';
    else if (delta < -0.01) direction = 'decreased';

    const concernDir = TREND_CONCERN_DIRECTION[testKey];
    const isConcerning = Boolean(concernDir && concernDir === direction && Math.abs(percentChange) >= 5);

    let interpretation = '';
    if (direction === 'unchanged') {
      interpretation = 'הערך יציב לחלוטין בהשוואה לבדיקה הקודמת.';
    } else if (direction === 'increased') {
      interpretation = `נרשמה עלייה של ${Math.abs(delta)} ${unit} (${percentChange > 0 ? '+' : ''}${percentChange}%) לעומת הבדיקה הקודמת (${prevVal} ${unit}).`;
    } else {
      interpretation = `נרשמה ירידה של ${Math.abs(delta)} ${unit} (${percentChange}%) לעומת הבדיקה הקודמת (${prevVal} ${unit}).`;
    }

    trends.push({
      testKey,
      testName,
      unit,
      previousValue: prevVal,
      currentValue: currVal,
      delta,
      percentChange,
      direction,
      isConcerning,
      interpretation,
      recommendedQuestion: TREND_RECOMMENDED_QUESTIONS[testKey],
    });
  }

  return trends;
};

