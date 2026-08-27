export interface CombinationRule {
  ruleId: string;
  matchedTests: string[];
  requiredDirections: Record<string, 'low' | 'high'>;
  priority: number;
  headline: string;
  patientMessage: string;
  questionTags: string[];
  badgeText: string;
}

export const COMBINATION_RULES: CombinationRule[] = [
  {
    ruleId: 'hemoglobin_ferritin_low',
    matchedTests: ['hemoglobin', 'ferritin'],
    requiredDirections: { hemoglobin: 'low', ferritin: 'low' },
    priority: 1,
    headline: 'המוגלובין נמוך + פריטין נמוך',
    patientMessage:
      'השילוב בין רמת המוגלובין נמוכה לרמת פריטין נמוכה מצביע לרוב על תמונת חסר ברזל (אנמיה מחוסר ברזל), ומדגיש את הצורך בהערכה רפואית ממוקדת של מאגרי הברזל והגורמים לכך.',
    questionTags: ['iron_deficiency_pattern'],
    badgeText: 'דפוס חסר ברזל / אנמיה',
  },
  {
    ruleId: 'wbc_crp_high',
    matchedTests: ['wbc', 'crp'],
    requiredDirections: { wbc: 'high', crp: 'high' },
    priority: 1,
    headline: 'WBC מוגבר + CRP מוגבר',
    patientMessage:
      'עלייה משולבת בכדוריות הדם הלבנות (WBC) ובחלבון ה-CRP מעידה לרוב על תגובה דלקתית או תהליך זיהומי פעיל/אחרון בגוף, ומומלץ לקשור אותה לתסמינים קליניים בפגישה עם הרופא/ה.',
    questionTags: ['inflammatory_pattern'],
    badgeText: 'דפוס תגובה דלקתית / זיהום',
  },
  {
    ruleId: 'ldl_hdl_risk',
    matchedTests: ['ldl', 'hdl'],
    requiredDirections: { ldl: 'high', hdl: 'low' },
    priority: 2,
    headline: 'LDL גבוה + HDL נמוך',
    patientMessage:
      'שילוב של כולסטרול LDL גבוה במקביל ל-HDL נמוך מעלה את פרופיל הסיכון הליפידי ומהווה גורם מפתח בשיחה על בריאות הלב, יעדי איזון ושינויי אורח חיים.',
    questionTags: ['lipid_profile_pattern'],
    badgeText: 'פרופיל סיכון שומנים',
  },
  {
    ruleId: 'metabolic_syndrome_pattern',
    matchedTests: ['ldl', 'triglycerides'],
    requiredDirections: { ldl: 'high', triglycerides: 'high' },
    priority: 3,
    headline: 'LDL גבוה + טריגליצרידים גבוהים',
    patientMessage:
      'שילוב של כולסטרול LDL וטריגליצרידים מוגברים משקף מעורבות ליפידית רחבה יותר, המושפעת רבות מתזונה, פעילות גופנית ואיזון מטבולי כללי.',
    questionTags: ['metabolic_pattern'],
    badgeText: 'פרופיל ליפידי משולב',
  },
  {
    ruleId: 'glucose_hba1c_pattern',
    matchedTests: ['glucose', 'hba1c'],
    requiredDirections: { glucose: 'high', hba1c: 'high' },
    priority: 2,
    headline: 'גלוקוז גבוה + HbA1c גבוה',
    patientMessage:
      'עלייה הן ברמת הגלוקוז הנקודתית והן ב-HbA1c המשקף ממוצע חודשי מעידה על מגמת אי-איזון ממושכת במשק הסוכר ומצריכה בניית תוכנית מעקב מותאמת.',
    questionTags: ['glycemic_pattern'],
    badgeText: 'פרופיל סוכר משולב',
  },
];

export const COMBINATION_QUESTIONS: Record<string, string[]> = {
  hemoglobin_ferritin_low: [
    'האם השילוב מצביע על אנמיה מחוסר ברזל הדורשת טיפול בתוסף?',
    'איזה סוג ומינון של תוסף ברזל מתאימים לי ביותר, ולכמה זמן?',
    'האם יש צורך לבדוק ויטמינים נוספים (כגון B12 וחומצה פולית)?',
    'האם מומלץ בירור של מקור איבוד הברזל או בעיות ספיגה?',
  ],
  wbc_crp_high: [
    'האם העלייה المشותפת תואמת מחלה או זיהום שהיו לי לאחרונה?',
    'האם נדרש טיפול תרופתי או רק מעקב ומנוחה?',
    'מתי מומלץ לחזור על הבדיקות לוודא חזרה של המדדים לנורמה?',
    'האם ישנם תסמינים ספציפיים שצריכים להדליק נורה אדומה לפני הבדיקה החוזרת?',
  ],
  ldl_hdl_risk: [
    'מהו יעד ה-LDL המדויק שמומלץ להגיע אליו בהתחשב ברקע הרפואי והמשפחתי שלי?',
    'האם כדאי להתחיל בטיפול תרופתי (כגון סטטינים) או להתמקד בשינוי תזונתי ופעילות גופנית בשלב זה?',
    'אילו שינויים ספציפיים בתזונה עשויים להעלות את ה-HDL ולהוריד את ה-LDL?',
    'מתי כדאי לבצע בדיקת מעקב חוזרת של פרופיל השומנים?',
  ],
  metabolic_syndrome_pattern: [
    'האם מומלץ ייעוץ דיאטני מותאם אישית להורדת טריגליצרידים ושומנים בדם?',
    'האם יש צורך בהערכת מדדי כבד או אולטרסוואנד בטן?',
  ],
  glucose_hba1c_pattern: [
    'האם התוצאות מוגדרות כטרום-סוכרת או סוכרת, ומהם יעדי הטיפול?',
    'האם כדאי להתחיל טיפול תרופתי מקדים או מעקב תזונתי והפחתת פחמימות?',
  ],
};

