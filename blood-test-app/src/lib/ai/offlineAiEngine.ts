import { AnalysisResult, PatientContext } from '../../types';

/**
 * Intelligent Offline Clinical Reasoning & Medical Dialogue Engine.
 * Generates structured, empathetic and accurate natural language answers
 * based on the active patient results without requiring an external API key.
 */
export const generateOfflineAiResponse = (
  userQuery: string,
  result?: AnalysisResult | null,
  patient?: PatientContext
): string => {
  const query = userQuery.toLowerCase().trim();

  // No active blood test results loaded yet
  if (!result || result.analysis.length === 0) {
    if (query.includes('שלום') || query.includes('היי') || query.includes('בוקר') || query.includes('ערב')) {
      return `שלום! 👋 אני **MedExplain AI** — העוזר הרפואי החכם שלך להסבר בדיקות דם.
כרגע עדיין לא הוזנו תוצאות בדיקה. באפשרותך:
1. לבחור אחד מ-**12 דוגמאות המטופלים** בתפריט למעלה.
2. להזין ידנית את תוצאות בדיקת הדם שלך בטופס.
3. לשאול אותי שאלות כלליות על בדיקות מעבדה נפוצות (כמו המוגלובין, פריטין, סוכר, שומנים בדם ודלקת).`;
    }
    return `אשמח לעזור! כדי לתת לך תשובה מדויקת ומותאמת אישית, כדאי להזין את ערכי בדיקת הדם בטופס או לבחור באחד מ-**12 תרחישי המטופלים** לדוגמה.
בינתיים, ניתן לשאול שאלות על מדדי מעבדה שונים (כגון: *מה זה פריטין?*, *איך מורידים LDL?*, *מה אומר מדד CRP?*).`;
  }

  const abnormalItems = result.analysis.filter((a) => a.severity !== 'normal');
  const normalItems = result.analysis.filter((a) => a.severity === 'normal');

  // Case 1: Overall summary request
  if (
    query.includes('הסבר') ||
    query.includes('סיכום') ||
    query.includes('תוצאות') ||
    query.includes('תסביר') ||
    query.includes('מה אומר') ||
    query.includes('איך יצא') ||
    query.includes('בדיקה')
  ) {
    if (abnormalItems.length === 0) {
      return `🎉 **חדשות מצוינות! כל ${result.analysis.length} המדדים שנבדקו נמצאים בטווח הנורמה.**

### 📋 תמונת מצב כללית:
- **איזון סוכר ושומנים**: תקין.
- **ספירת דם ומאגרים**: ערכים אופטימליים.
- **מדדי דלקת ותפקודי איברים**: ללא עדות לתהליך חריג.

💡 **המלצה לפגישה עם הרופא/ה**: מומלץ לשמור על אורח החיים הנוכחי, ולהמשיך בביצוע בדיקות סקר תקופתיות לפי גיל והנחיות רופא/ת המשפחה.`;
    }

    let summary = `### 🩺 סיכום תמונת הבדיקות עבור ${patient?.name || 'המטופל/ת'}:\n`;
    summary += `נבדקו **${result.analysis.length} מדדים**, מתוכם **${abnormalItems.length} מדדים** דורשים תשומת לב.\n\n`;

    if (result.contextFindings.length > 0) {
      summary += `🔍 **התמונה הכוללת (שילובי מדדים):**\n`;
      result.contextFindings.forEach((f) => {
        summary += `- **${f.headline}**: ${f.patientMessage}\n`;
      });
      summary += `\n`;
    }

    summary += `⚠️ **מדדים שחורגים מהנורמה:**\n`;
    abnormalItems.forEach((item) => {
      summary += `- **${item.name}** (${item.result} ${item.unit}): ${item.safeMessage}\n`;
    });

    if (normalItems.length > 0) {
      summary += `\n✅ **מדדים בטווח התקין:** ${normalItems.map((n) => n.name).join(', ')}.\n`;
    }

    summary += `\n💬 **הצעד הבא המומלץ**: כדאי להיכנס ללשונית **'הכנה לרופא'** כדי להדפיס או להעתיק את רשימת השאלות והממצאים לשיחה עם הרופא/ה.`;
    return summary;
  }

  // Case 2: Doctor Questions inquiry
  if (
    query.includes('שאלות') ||
    query.includes('לשאול') ||
    query.includes('רופא') ||
    query.includes('פגישה') ||
    query.includes('תור')
  ) {
    if (result.rankedDoctorQuestions && result.rankedDoctorQuestions.length > 0) {
      return `### 📋 שאלות מפתח מומלצות לשיחה עם הרופא/ה:

${result.rankedDoctorQuestions
  .slice(0, 5)
  .map((q: string, i: number) => `**${i + 1}.** ${q}`)
  .join('\n\n')}

💡 **טיפ לפגישה**: הרופאים מעריכים מטופלים שמגיעים ממוקדים! מומלץ לסמן את השאלות החשובות לך בעמוד **'הכנה לרופא'** ולהביאן לפגישה.`;
    }
  }

  // Case 3: Combinations & Synergy inquiry
  if (
    query.includes('שילוב') ||
    query.includes('תמונה כוללת') ||
    query.includes('ביחד') ||
    query.includes('קשר') ||
    query.includes('צירוף')
  ) {
    if (result.contextFindings.length > 0) {
      return `### 🧩 ניתוח שילובי המדדים בבדיקה שלך:

${result.contextFindings
  .map(
    (f) => `#### ${f.headline}
${f.patientMessage}
- **מדדים מעורבים**: ${f.matchedTests.join(', ')}
- **חשיבות קלינית**: בחינת המדדים יחד נותנת אינדיקציה מהימנה בהרבה מבדיקה של כל ערך בנפרד.`
  )
  .join('\n\n')}`;
    }
    return `לא זוהו שילובים מיוחדים של סיכון הדורשים התייחסות משותפת. המדדים שנבדקו אינם מראים דפוס רפואי משולב חריג.`;
  }

  // Case 4: Trends inquiry
  if (
    query.includes('מגמה') ||
    query.includes('מגמות') ||
    query.includes('קודם') ||
    query.includes('שינוי') ||
    query.includes('עבר')
  ) {
    if (result.trends.length > 0) {
      return `### 📈 מעקב מגמות לעומת בדיקות קודמות:

${result.trends
  .map(
    (t) => `**${t.testName}**:
- ערך קודם: ${t.previousValue} ${t.unit} ➡️ ערך נוכחי: ${t.currentValue} ${t.unit}
- שינוי: **${t.percentChange > 0 ? '+' : ''}${t.percentChange}%**
- פרשנות: ${t.interpretation}`
  )
  .join('\n\n')}`;
    }
    return `כרגע לא הוזנו ערכים קודמים להשוואה. אם יש לך תוצאות מבדיקות ישנות, תוכל/י להזין אותן תחת 'ערכים קודמים' בטופס כדי לראות את כיוון המגמה.`;
  }

  // Case 5: Diet & Lifestyle inquiry
  if (
    query.includes('תזונה') ||
    query.includes('אוכל') ||
    query.includes('ספורט') ||
    query.includes('פעילות') ||
    query.includes('תוספים') ||
    query.includes('ויטמינים') ||
    query.includes('לשפר')
  ) {
    let advice = `### 🥗 כיווני תזונה ואורח חיים מומלצים לדיון עם הרופא/ה:\n\n`;

    const hasIronIssue = abnormalItems.some((a) => a.markerId === 'ferritin' || a.markerId === 'hemoglobin');
    const hasLipidIssue = abnormalItems.some((a) => a.markerId === 'ldl' || a.markerId === 'cholesterol' || a.markerId === 'triglycerides');
    const hasSugarIssue = abnormalItems.some((a) => a.markerId === 'glucose' || a.markerId === 'hba1c');

    if (hasIronIssue) {
      advice += `🥩 **לשיפור מאגרי ברזל והמוגלובין**:
- שילוב מזונות עשירים בברזל (קטניות, טחינה מלאה, עלים ירוקים, בשר רזה).
- צריכת ויטמין C (פירות הדר, פלפל) יחד עם הברזל לשיפור הספיגה.
- הימנעות משתיית קפה/תה סמוך לארוחות עשירות בברזל.
- בירור עם הרופא לגבי תוסף ברזל מתאים במידת הצורך.\n\n`;
    }

    if (hasLipidIssue) {
      advice += `🥑 **לאיזון שומני הדם והכולסטרול (LDL / טריגליצרידים)**:
- העשרת התפריט בסיבים תזונתיים מסיסים (שיבולת שועל, קטניות).
- הפחתת שומן רווי ומזון מעובד, ומעבר לשומנים בלתי רווים (שמן זית, אבוקדו, אגוזים).
- פעילות אירובית קבועה (150 דקות בשבוע) להעלאת ה-HDL והורדת הטריגליצרידים.\n\n`;
    }

    if (hasSugarIssue) {
      advice += `🥦 **לאיזון סוכר ו-HbA1c**:
- מעבר לפחמימות מורכבות עם אינדקס גליקמי נמוך (דגנים מלאים, ירקות).
- צמצום משקאות ממותקים וסוכרים פשוטים.
- הליכה קלה של 10-15 דקות לאחר הארוחות לשיפור רגישות התאים לאינסולין.\n\n`;
    }

    if (!hasIronIssue && !hasLipidIssue && !hasSugarIssue) {
      advice += `התזונה הים-תיכונית העשירה בירקות, פירות, שמן זית, דגים ודגנים מלאים מהווה את הבסיס המוכח ביותר לשמירה על ערכי דם מיטביים ובריאות הלב.\n\n`;
    }

    advice += `⚠️ *הערה חשובה: כל שינוי תזונתי משמעותי או נטילת תוספים כדאי לתאם מול דיאטן/ית קליני/ת או רופא/ת המשפחה.*`;
    return advice;
  }

  // Case 6: Specific biomarker search in user query
  for (const item of result.analysis) {
    if (
      query.includes(item.name.toLowerCase()) ||
      (item.abbreviation && query.includes(item.abbreviation.toLowerCase())) ||
      query.includes(item.markerId)
    ) {
      return `### 🔬 מידע ממוקד על ${item.name}:

- **התוצאה שלך**: **${item.result} ${item.unit}**
- **טווח תקין**: ${item.reference} ${item.unit}
- **סטטוס**: **${item.status}**

📖 **מה המדד בודק**:
${item.whatItMeasures || item.description}

💡 **משמעות התוצאה**:
${item.safeMessage}

${
  item.possibleReasons && item.possibleReasons.length > 0
    ? `🔍 **סיבות אפשריות להשפעה על המדד**:
${item.possibleReasons.map((r) => `- ${r}`).join('\n')}`
    : ''
}

${
  item.questions && item.questions.length > 0
    ? `\n❓ **שאלות מומלצות לרופא/ה**:
${item.questions.map((q) => `- ${q}`).join('\n')}`
    : ''
}`;
    }
  }

  // Generic fallback with helpful guidance
  return `קיבלתי את שאלתך לגבי הבדיקות! 😊

בהתבסס על הנתונים שהוזנו:
- ישנם **${abnormalItems.length} מדדים** שמומלץ לשים לב אליהם${
    abnormalItems.length > 0 ? ` (${abnormalItems.map((a) => a.name).join(', ')})` : ''
  }.
- ניתן לשאול אותי כל שאלה על מדד ספציפי, על שילובי המדדים, או על הכנה לפגישה אצל הרופא/ה.

על מה תרצה/י שנתמקד?`;
};
