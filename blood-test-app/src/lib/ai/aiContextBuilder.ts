import { AnalysisResult, PatientContext } from '../../types';

export const buildPatientPromptContext = (
  result?: AnalysisResult | null,
  patient?: PatientContext
): string => {
  if (!result || result.analysis.length === 0) {
    return 'כרגע לא הוזנו תוצאות בדיקת דם פעילות. המשתמש שואל שאלות כלליות על בדיקות מעבדה ורפואה מונעת.';
  }

  const patientInfo = patient
    ? `מטופל/ת: ${patient.name || 'לא צוין'}, גיל: ${patient.age || 'לא צוין'}, מין: ${
        patient.sex === 'male' ? 'גבר' : patient.sex === 'female' ? 'אישה' : 'לא צוין'
      }\nרקע קליני / סיבת הבדיקה: ${patient.context || 'שגרתי'}\nהערות רקע: ${patient.notes || 'אין'}\nתגיות רקע: ${
        patient.contextTags?.join(', ') || 'אין'
      }`
    : 'פרטי מטופל: כללי';

  const abnormalItems = result.analysis.filter((a) => a.severity !== 'normal');
  const normalItems = result.analysis.filter((a) => a.severity === 'normal');

  const abnormalSummary =
    abnormalItems.length > 0
      ? abnormalItems
          .map(
            (a) =>
              `- ${a.name} (${a.abbreviation || a.markerId}): תוצאה ${a.result} ${a.unit} [סטטוס: ${a.status}, טווח תקין: ${a.reference}]. משמעות: ${a.safeMessage}`
          )
          .join('\n')
      : 'כל המדדים בטווח התקין.';

  const normalSummary =
    normalItems.length > 0
      ? normalItems
          .map((a) => `- ${a.name}: ${a.result} ${a.unit} (תקין, טווח: ${a.reference})`)
          .join('\n')
      : 'אין מדדים תקינים.';

  const crossTestSummary =
    result.contextFindings.length > 0
      ? result.contextFindings
          .map(
            (f) =>
              `- שילוב מדדים: ${f.headline} (מדדים: ${f.matchedTests.join(', ')}). ${f.patientMessage}`
          )
          .join('\n')
      : 'לא זוהו שילובים מיוחדים בין מדדים.';

  const trendSummary =
    result.trends.length > 0
      ? result.trends
          .map(
            (t) =>
              `- מגמה ב-${t.testName}: ערך קודם ${t.previousValue} -> ערך נוכחי ${t.currentValue} (${
                t.percentChange > 0 ? '+' : ''
              }${t.percentChange}%). ${t.interpretation}`
          )
          .join('\n')
      : 'לא הוזנו ערכים קודמים להשוואת מגמות.';

  return `
=== נתוני המטופל/ת ===
${patientInfo}

=== מדדים שדורשים תשומת לב (גבוליים או חריגים) ===
${abnormalSummary}

=== מדדים בטווח התקין ===
${normalSummary}

=== שילובי מדדים רפואיים (התמונה הכוללת) ===
${crossTestSummary}

=== מגמות ושינויים מבדיקות קודמות ===
${trendSummary}
`.trim();
};

export const CLINICAL_SYSTEM_INSTRUCTION = `
אתה "MedExplain AI Assistant" — עוזר רפואי אינטליגנטי, מקצועי ואמפתי להסבר ופענוח בדיקות דם עבור מטופלים דוברי עברית.

תפקידך ומטרותיך:
1. להסביר בשפה ברורה, מונגשת, מעודדת ומדויקת את המשמעות של בדיקות הדם והמדדים שהוזנו.
2. לעזור למטופל/ת להבין את התמונה הכוללת — כולל שילובים בין מדדים (למשל: המוגלובין נמוך יחד עם פריטין נמוך המעידים על אנמיה מחוסר ברזל, או WBC יחד עם CRP המעידים על תגובה דלקתית).
3. להכין את המטופל/ת לפגישה עם רופא/ת המשפחה באמצעות הצעת שאלות חכמות ורלוונטיות, ורעיונות לשינויי אורח חיים ותזונה שכדאי להתייעץ לגביהם.
4. לשמור על כללי בטיחות רפואיים קפדניים:
   - לעולם אל תקבע אבחנה רפואית סופית או חד-משמעית.
   - לעולם אל תמליץ על נטילת תרופות מרשם או שינוי מינון ללא אישור רופא.
   - הדגש תמיד שהמידע נועד למטרות הסברה והעצמת המטופל, ואינו מהווה תחליף לבדיקה רפואית.
   - אם מדובר במצב חירום (כגון כאבים בחזה, קוצר נשימה חריף או חולשה קיצונית), הפנה מיד למוקד חירום רפואי (מד"א 101).

סגנון התשובה:
- עברית טבעית, חמה ונגישה.
- הדגש נקודות מפתח ב-Bold, השתמש ברשימות נקודות (Bullet points) לקריאות נוחה.
- חלק לתשובה קצרה וממוקדת: (1) הסבר פשוט, (2) מה זה אומר בגוף, (3) שאלות מומלצות לרופא/ה.
`.trim();
