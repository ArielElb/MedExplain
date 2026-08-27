import { Biomarker, Evaluation, DemoPreset } from '../types';

export const DISCLAIMER =
  'המידע המוצג נועד להסברה ולהכנה לשיחה עם רופא/ת המשפחה בלבד. ' +
  'אין באמור אבחנה רפואית, המלצה על טיפול או תחליף לייעוץ מקצועי. ' +
  'פענוח תוצאות תלוי בהיסטוריה הרפואית האישית, בגיל, במין ובבדיקות קודמות.';

export const GENERAL_QUESTIONS = [
  'האם התוצאות שלי השתנו לעומת הבדיקות הקודמות?',
  'האם יש מדד שדורש בדיקה חוזרת, ומתי?',
  'האם יש קשר בין הממצאים לתסמינים שאני מרגיש/ה?',
  'אילו שינויים באורח החיים או בתזונה מומלצים לאור התוצאות?',
];

const normalEval = (
  message: string,
  whatItMeasures?: string,
  urgency?: string
): Evaluation => ({
  status: 'תקין ✅',
  severity: 'normal',
  direction: 'normal',
  message,
  questions: [
    'האם תדירות המעקב השגרתית הנוכחית מתאימה למצבי הבריאותי?',
    'האם ישנם הרגלי תזונה ואורח חיים מומלצים להמשך שמירה על ערך תקין זה?',
  ],
  whatItMeasures,
  urgency: urgency || 'הערך בטווח הנורמה ואינו מעלה צורך בבירור מיוחד.',
});

type MarkerDefinition = Omit<Biomarker, 'markerId'>;

const DEFINITIONS: Record<string, MarkerDefinition> = {
  glucose: {
    name: 'Glucose (גלוקוז בצום)',
    abbreviation: 'GLU',
    unit: 'mg/dL',
    category: 'סוכר ומטבוליזם',
    description: 'רמת הסוכר בדם לאחר צום של 8 שעות לפחות.',
    reference: '70–99',
    min: 30,
    max: 500,
    step: 1,
    rangeConfig: {
      visualMin: 40,
      visualMax: 180,
      normalMin: 70,
      normalMax: 99,
      warningMax: 125,
      unit: 'mg/dL',
      lowLabel: 'נמוך (<70)',
      normalLabel: 'תקין (70–99)',
      highLabel: 'גבוה (>125)',
    },
    evaluate: (value) => {
      const whatItMeasures = 'גלוקוז הוא מקור האנרגיה העיקרי של תאי הגוף. רמתו בצום משקפת את יכולת הגוף והלבלב לווסת את מאזן הסוכר.';
      if (value < 70) {
        return {
          status: 'חריג ❗',
          severity: 'danger',
          direction: 'low',
          message: 'הערך נמוך מהטווח המקובל (היפוגליקמיה קלה). לעיתים מדובר בצום ממושך, מאמץ גופני או השפעת תנאי הדגימה.',
          whatItMeasures,
          possibleReasons: ['צום ממושך מהרגיל', 'פעילות גופנית עצימה סמוך לבדיקה', 'תרופות להורדת סוכר', 'תנודתיות אישית'],
          urgency: 'כדאי לעדכן את הרופא/ה, במיוחד אם מלווה ברעד, הזעה, סחרחורת או רעב פתאומי.',
          questions: [
            'האם הערך הנמוך יכול להיות קשור לאורך הצום לפני הבדיקה?',
            'האם כדאי לחזור על הבדיקה או לבצע מעקב סוכר נוסף?',
          ],
        };
      }
      if (value <= 99) {
        return normalEval('הערך בטווח התקין.', whatItMeasures);
      }
      if (value <= 125) {
        return {
          status: 'גבולי ⚠️',
          severity: 'warning',
          direction: 'high',
          message: 'הערך גבוה מעט מהטווח הרגיל בצום (הפרעה בסוכר בצום / טרום-סוכרת).',
          whatItMeasures,
          possibleReasons: ['צריכת פחמימות מוגברת לפני הבדיקה', 'צום שאינו מלא', 'מתח נפשי / לחץ', 'התחלה של תנגודת לאינסולין'],
          urgency: 'מומלץ לתאם שיחה רגילה עם רופא/ת המשפחה לקבלת המלצות תזונה והמשך מעקב.',
          questions: [
            'האם מומלץ להשלים בדיקת HbA1c להערכת ממוצע הסוכר הממושך?',
            'אילו שינויים באורח החיים ובתזונה עשויים להחזיר את הערך לנורמה?',
          ],
        };
      }
      return {
        status: 'חריג ❗',
        severity: 'danger',
        direction: 'high',
        message: 'הערך גבוה מהטווח המקובל בצום ודורש התייחסות רפואית.',
        whatItMeasures,
        possibleReasons: ['אי-איזון במשק הסוכר / סוכרת', 'השפעת תרופות מסוימות', 'מתח חריף או מחלה נלווית'],
        urgency: 'מומלץ לקבוע תור לרופא/ת המשפחה בהקדם סביר להערכה והתאמת תוכנית טיפול.',
        questions: [
          'האם התוצאה מצריכה בירור נוסף, העמסת סוכר או בדיקת HbA1c?',
          'האם הערך השתנה בהשוואה לבדיקות קודמות שלי?',
        ],
      };
    },
  },

  hba1c: {
    name: 'HbA1c (המוגלובין מסוכרר)',
    abbreviation: 'HbA1c',
    unit: '%',
    category: 'סוכר ומטבוליזם',
    description: 'מדד המשקף את ממוצע רמות הסוכר בדם ב-2-3 החודשים האחרונים.',
    reference: 'עד 5.6%',
    min: 3,
    max: 20,
    step: 0.1,
    rangeConfig: {
      visualMin: 4.0,
      visualMax: 9.0,
      normalMin: 4.0,
      normalMax: 5.6,
      warningMax: 6.4,
      unit: '%',
      normalLabel: 'תקין (עד 5.6)',
      highLabel: 'סוכרת (≥6.5)',
    },
    evaluate: (value) => {
      const whatItMeasures = 'HbA1c מודד את אחוז ההמוגלובין שנקשר לסוכר בכדוריות הדם האדומות, ומספק תמונה מהימנה של איזון הסוכר לאורך כ-90 יום.';
      if (value <= 5.6) return normalEval('הערך בטווח התקין — איזון סוכר מעולה.', whatItMeasures);
      if (value <= 6.4) {
        return {
          status: 'גבולי ⚠️',
          severity: 'warning',
          direction: 'high',
          message: 'הערך בטווח טרום-סוכרת (5.7%–6.4%). זהו חלון הזדמנות מצוין להשפעה באמצעות תזונה ופעילות.',
          whatItMeasures,
          possibleReasons: ['תנגודת לאינסולין', 'שינויים תזונתיים וצריכת סוכרים', 'גורמים גנטיים'],
          urgency: 'מומלץ לדון בממצא בפגישה השגרתית הקרובה עם רופא/ת המשפחה.',
          questions: [
            'אילו שינויים בתזונה ובפעילות גופנית יסייעו להורדת ה-HbA1c לנורמה?',
            'מתי כדאי לחזור על הבדיקה לצורך מעקב (לרוב כל 3-6 חודשים)?',
          ],
        };
      }
      return {
        status: 'חריג ❗',
        severity: 'danger',
        direction: 'high',
        message: 'הערך גבוה (≥6.5%) ומצביע על רמות סוכר מוגברות לאורך זמן.',
        whatItMeasures,
        possibleReasons: ['סוכרת לא מאוזנת', 'שינוי ביעילות הטיפול התרופתי'],
        urgency: 'מומלץ לפנות לרופא/ת המשפחה בהקדם לקביעת יעדי איזון וטיפול.',
        questions: [
          'האם הערך השתנה לעומת בדיקות קודמות?',
          'האם נדרשת התאמה או התחלה של טיפול תרופתי?',
        ],
      };
    },
  },

  ldl: {
    name: "LDL (כולסטרול 'רע')",
    abbreviation: 'LDL-C',
    unit: 'mg/dL',
    category: 'שומנים בדם',
    description: 'כולסטרול שעלול להצטבר בדפנות כלי הדם ולהשפיע על בריאות הלב.',
    reference: 'מתחת ל-100 (תלוי בגורמי סיכון)',
    min: 20,
    max: 400,
    step: 1,
    rangeConfig: {
      visualMin: 30,
      visualMax: 200,
      normalMin: 30,
      normalMax: 100,
      warningMax: 130,
      unit: 'mg/dL',
      normalLabel: 'רצוי (<100)',
      highLabel: 'גבוה (>130)',
    },
    evaluate: (value) => {
      const whatItMeasures = 'ליפופרוטאין בצפיפות נמוכה (LDL) מוביל כולסטרול מהכבד לרקמות הגוף. רמות גבוהות עלולות לשקוע בעורקים.';
      if (value < 100) return normalEval('הערך בטווח הרצוי לאוכלוסייה הכללית.', whatItMeasures);
      if (value <= 130) {
        return {
          status: 'גבולי ⚠️',
          severity: 'warning',
          direction: 'high',
          message: 'הערך גבולי (100–130 mg/dL). יעד ה-LDL האישי מותאם לפי גורמי סיכון (גיל, לחץ דם, היסטוריה משפחתית).',
          whatItMeasures,
          possibleReasons: ['תזונה עשירה בשומן רווי', 'גנטיקה ונטייה משפחתית', 'חוסר בפעילות אירובית'],
          urgency: 'נושא מתאים לדיון בפגישה השנתית התקופתית.',
          questions: [
            'מהו יעד ה-LDL המדויק שמומלץ עבורי בהתאם לפרופיל הסיכון שלי?',
            'האם כדאי לשלב שינוי תזונתי או תוספים לפני ששוקלים טיפול תרופתי?',
          ],
        };
      }
      return {
        status: 'חריג ❗',
        severity: 'danger',
        direction: 'high',
        message: 'הערך גבוה מהמומלץ (מעל 130 mg/dL) ומצריך הערכת סיכון קרדיווסקולרי כולל.',
        whatItMeasures,
        possibleReasons: ['גנטיקה (היפרכולסטרולמיה משפחתית)', 'תזונה ואורח חיים', 'תפקודי תריס נמוכים'],
        urgency: 'מומלץ להיוועץ ברופא/ת המשפחה לקבלת המלצות מותאמות.',
        questions: [
          'האם במצב שלי מומלץ להתחיל טיפול תרופתי (כגון סטטינים) או לנסות שינוי אורח חיים?',
          'אילו שינויים תזונתיים מבוססי מחקר מומלצים ביותר?',
        ],
      };
    },
  },

  hdl: {
    name: "HDL (כולסטרול 'טוב')",
    abbreviation: 'HDL-C',
    unit: 'mg/dL',
    category: 'שומנים בדם',
    description: 'כולסטרול המסייע בפינוי עודפי כולסטרול מהדם חזרה לכבד.',
    reference: '40 ומעלה (40+ גברים, 50+ נשים)',
    min: 10,
    max: 150,
    step: 1,
    rangeConfig: {
      visualMin: 15,
      visualMax: 90,
      normalMin: 40,
      normalMax: 90,
      unit: 'mg/dL',
      lowLabel: 'נמוך (<40)',
      normalLabel: 'תקין / מגן (≥40)',
    },
    evaluate: (value) => {
      const whatItMeasures = 'ליפופרוטאין בצפיפות גבוהה (HDL) פועל כ"שואב אבק" המפנה כולסטרול מדפנות כלי הדם ומספק הגנה ללב.';
      if (value >= 40) return normalEval('הערך בטווח התקין ומהווה גורם מגן ללב.', whatItMeasures);
      return {
        status: 'חריג ❗',
        severity: 'danger',
        direction: 'low',
        message: 'הערך נמוך מהטווח המומלץ (<40 mg/dL), מה שעשוי להפחית את ההגנה הטבעית של כלי הדם.',
        whatItMeasures,
        possibleReasons: ['היעדר פעילות גופנית אירובית מספקת', 'עישון', 'תזונה דלת שומנים בריאים (כמו שמן זית, אגוזים)', 'גנטיקה'],
        urgency: 'כדאי לדון בדרכים להעלות את הערך בפגישה הקרובה.',
        questions: [
          'אילו שינויים (כמו פעילות אירובית ותזונה ים-תיכונית) יעזרו להעלות את ה-HDL?',
          'האם יש השפעה למשקל הגוף על רמת ה-HDL במקרה שלי?',
        ],
      };
    },
  },

  triglycerides: {
    name: 'Triglycerides (טריגליצרידים)',
    abbreviation: 'TRIG',
    unit: 'mg/dL',
    category: 'שומנים בדם',
    description: 'סוג השומן הנפוץ ביותר בגוף, מושפע ישירות מתזונה ומצום לפני הבדיקה.',
    reference: 'מתחת ל-150',
    min: 20,
    max: 1000,
    step: 1,
    rangeConfig: {
      visualMin: 30,
      visualMax: 350,
      normalMin: 30,
      normalMax: 150,
      warningMax: 199,
      unit: 'mg/dL',
      normalLabel: 'תקין (<150)',
      highLabel: 'גבוה (>200)',
    },
    evaluate: (value) => {
      const whatItMeasures = 'טריגליצרידים הם שומנים המאוחסנים בתאי השומן ומשמשים לאנרגיה. רמתם עולה בתגובה לצריכת סוכרים, פחמימות ואלכוהול.';
      if (value < 150) return normalEval('הערך בטווח התקין.', whatItMeasures);
      if (value <= 199) {
        return {
          status: 'גבולי ⚠️',
          severity: 'warning',
          direction: 'high',
          message: 'הערך מעט גבוה מהטווח (150–199 mg/dL). לרוב מגיב מהר מאוד לשינוי תזונתי.',
          whatItMeasures,
          possibleReasons: ['ארוחה עתירת פחמימות/סוכר לפני הבדיקה', 'צום של פחות מ-12 שעות', 'צריכת אלכוהול', 'משקל עודף'],
          urgency: 'מומלץ לעקוב בפגישה השגרתית.',
          questions: [
            'האם כדאי לחזור על הבדיקה תוך הקפדה יתרה על צום מלא של 12 שעות?',
            'אילו הפחתות בסוכרים פשוטים מומלצות?',
          ],
        };
      }
      return {
        status: 'חריג ❗',
        severity: 'danger',
        direction: 'high',
        message: 'הערך גבוה מהטווח המקובל (≥200 mg/dL).',
        whatItMeasures,
        possibleReasons: ['תסמונת מטבולית', 'צריכת אלכוהול מוגברת', 'נטייה משפחתית', 'סוכרת לא מאוזנת'],
        urgency: 'מומלץ להתייעץ עם הרופא/ה לבניית תוכנית איזון.',
        questions: [
          'האם נדרש בירור מטבולי או בדיקות כבד נוספות?',
          'מתי כדאי לחזור על הבדיקה לאחר שינוי באורח החיים?',
        ],
      };
    },
  },

  hemoglobin: {
    name: 'Hemoglobin (המוגלובין)',
    abbreviation: 'Hb',
    unit: 'g/dL',
    category: 'ספירת דם (CBC)',
    description: 'החלבון בכדוריות הדם האדומות שאחראי על נשיאת חמצן לכל תאי הגוף.',
    reference: '12.0–15.5 (נשים) / 13.5–17.5 (גברים)',
    min: 3,
    max: 25,
    step: 0.1,
    sexSpecific: true,
    rangeConfig: {
      visualMin: 8.0,
      visualMax: 20.0,
      normalMin: 12.0,
      normalMax: 17.5,
      unit: 'g/dL',
      lowLabel: 'נמוך (<12.0)',
      normalLabel: 'תקין',
      highLabel: 'גבוה (>17.5)',
    },
    evaluate: (value, sex = 'female') => {
      const whatItMeasures = 'המוגלובין נושא חמצן מהריאות לרקמות הגוף. רמות נמוכות מאפיינות אנמיה וגורמות לחולשה ועייפות.';
      const lowThreshold = sex === 'male' ? 13.5 : 12.0;
      const highThreshold = sex === 'male' ? 17.5 : 16.0;

      if (value < lowThreshold) {
        return {
          status: 'חריג ❗',
          severity: 'danger',
          direction: 'low',
          message: `הערך נמוך מהטווח המקובל (${value} לעומת סף תחתון של ${lowThreshold} g/dL). ממצא זה מחשיד לאנמיה.`,
          whatItMeasures,
          possibleReasons: ['מחסור בברזל או פריטין נמוך', 'מחסור בוויטמין B12 או חומצה פולית', 'איבוד דם (וסת, מערכת עיכול)', 'מחלות כרוניות'],
          urgency: 'מומלץ לפנות לרופא/ת המשפחה לבירור סיבת הירידה.',
          questions: [
            'האם יש צורך להשלים בדיקות ברזל, פריטין, B12 וחומצה פולית?',
            'האם התוצאה מסבירה עייפות, חיוורון או קוצר נשימה במאמץ?',
          ],
        };
      }
      if (value > highThreshold) {
        return {
          status: 'גבולי ⚠️',
          severity: 'warning',
          direction: 'high',
          message: `הערך מעט מעל הטווח הרגיל (${value} g/dL). לעיתים קרובות משקף התייבשות זמנית או עישון.`,
          whatItMeasures,
          possibleReasons: ['התייבשות או חוסר שתייה מספקת לפני הבדיקה', 'עישון', 'שהייה בגובה רב', 'מצבים ריאתיים'],
          urgency: 'מומלץ לחזור על הבדיקה במצב שתייה מאוזן.',
          questions: ['האם כדאי לחזור על הבדיקה תוך הקפדה על שתייה מרובה?'],
        };
      }
      return normalEval(`ההמוגלובין בטווח התקין (${value} g/dL).`, whatItMeasures);
    },
  },

  wbc: {
    name: 'WBC (כדוריות דם לבנות)',
    abbreviation: 'WBC',
    unit: 'K/uL',
    category: 'ספירת דם (CBC)',
    description: 'תאי מערכת החיסון הנלחמים בזיהומים, חיידקים, וירוסים ודלקות.',
    reference: '4.5–11.0',
    min: 0.5,
    max: 50,
    step: 0.1,
    rangeConfig: {
      visualMin: 2.0,
      visualMax: 16.0,
      normalMin: 4.5,
      normalMax: 11.0,
      unit: 'K/uL',
      lowLabel: 'נמוך (<4.5)',
      normalLabel: 'תקין (4.5–11.0)',
      highLabel: 'גבוה (>11.0)',
    },
    evaluate: (value) => {
      const whatItMeasures = 'תאי הדם הלבנים מהווים את קו ההגנה העיקרי של מערכת החיסון. כמותם מגיבה באופן דינמי למחלות, מתח ודלקת.';
      if (value >= 4.5 && value <= 11.0) {
        return normalEval('ספירת תאי הדם הלבנים תקינה.', whatItMeasures);
      }
      if (value > 11.0) {
        return {
          status: 'חריג ❗',
          severity: 'danger',
          direction: 'high',
          message: 'הערך גבוה מהטווח. לעיתים קרובות זוהי תגובה תקינה של מערכת החיסון לזיהום, התקררות או דלקת אחרונה.',
          whatItMeasures,
          possibleReasons: ['זיהום ויראלי או חיידקי אחרון', 'תהליך דלקתי בגוף', 'מתח נפשי / פיזי סמוך לבדיקה', 'תרופות (כגון סטרואידים)'],
          urgency: 'אם מלווה בחום או כאבים, יש לפנות לרופא/ה. ללא תסמינים, לרוב מומלץ מעקב חוזר.',
          questions: [
            'האם העלייה קשורה למחלה או צינון שהיו לי לאחרונה?',
            'האם יש צורך לחזור על ספירת הדם בעוד מספר שבועות כדי לוודא ירידה?',
          ],
        };
      }
      return {
        status: 'חריג ❗',
        severity: 'danger',
        direction: 'low',
        message: 'הערך נמוך מהטווח המקובל (לויקופניה קלה). לעיתים קשור להחלמה ממחלה ויראלית.',
        whatItMeasures,
        possibleReasons: ['התאוששות לאחר זיהום ויראלי', 'השפעת תרופות', 'חוסרים תזונתיים מסוימים', 'וריאציה תקינה'],
        urgency: 'מומלץ לבדוק בהשוואה לבדיקות קודמות.',
        questions: [
          'האם הערך הנמוך הופיע גם בבדיקות קודמות שלי?',
          'האם יש צורך במעקב חוזר או בדיקות משלימות?',
        ],
      };
    },
  },

  platelets: {
    name: 'Platelets (טסיות דם)',
    abbreviation: 'PLT',
    unit: 'K/uL',
    category: 'ספירת דם (CBC)',
    description: 'טסיות הדם משתתפות בתהליך קרישת הדם ועצירת דימומים.',
    reference: '150–450',
    min: 10,
    max: 1000,
    step: 1,
    rangeConfig: {
      visualMin: 80,
      visualMax: 550,
      normalMin: 150,
      normalMax: 450,
      unit: 'K/uL',
      lowLabel: 'נמוך (<150)',
      normalLabel: 'תקין (150–450)',
      highLabel: 'גבוה (>450)',
    },
    evaluate: (value) => {
      const whatItMeasures = 'טסיות דם אחראיות על יצירת קריש דם ראשוני בעת פציעה לשם מניעת דימום.';
      if (value >= 150 && value <= 450) {
        return normalEval('ספירת הטסיות תקינה.', whatItMeasures);
      }
      return {
        status: 'חריג ❗',
        severity: 'danger',
        direction: value < 150 ? 'low' : 'high',
        message: value < 150
          ? 'ספירת הטסיות נמוכה מהנורמה (תרומבוציטופניה קלה). יש לעקוב אחר סימני דימום או שטפי דם קלים.'
          : 'ספירת הטסיות מעל הטווח המקובל, לרוב תגובה זמנית לתהליך דלקתי או מחסור בברזל.',
        whatItMeasures,
        possibleReasons: value < 150
          ? ['זיהום ויראלי', 'השפעת תרופות', 'היצמדות טסיות במבחנה (ממצא מעבדתי טכני)']
          : ['תגובה לדלקת או זיהום', 'מחסור בברזל', 'עישון'],
        urgency: 'מומלץ להביא לעיון הרופא/ה.',
        questions: [
          'האם התוצאה חוזרת על עצמה בבדיקות קודמות?',
          'האם נדרשת בדיקת משטח דם ידני או ספירה חוזרת?',
        ],
      };
    },
  },

  ferritin: {
    name: 'Ferritin (פריטין)',
    abbreviation: 'FERR',
    unit: 'ng/mL',
    category: 'ברזל וויטמינים',
    description: 'המדד המדויק ביותר המשקף את כמות מאגרי הברזל הזמינים בגוף.',
    reference: '30–300 (נשים לעיתים 15–200)',
    min: 1,
    max: 2000,
    step: 1,
    rangeConfig: {
      visualMin: 10,
      visualMax: 400,
      normalMin: 30,
      normalMax: 300,
      unit: 'ng/mL',
      lowLabel: 'נמוך (<30)',
      normalLabel: 'תקין (30–300)',
      highLabel: 'גבוה (>300)',
    },
    evaluate: (value) => {
      const whatItMeasures = 'פריטין הוא חלבון האוגר ברזל בתאי הגוף. רמה נמוכה מעידה על ריקון מאגרים עוד בטרם מתפתחת אנמיה גלויה.';
      if (value < 30) {
        return {
          status: 'חריג ❗',
          severity: 'danger',
          direction: 'low',
          message: 'הערך נמוך מהטווח המומלץ ומצביע על התרוקנות או דלדול של מאגרי הברזל בגוף.',
          whatItMeasures,
          possibleReasons: ['תזונה דלת ברזל (כגון צמחונות/טבעונות ללא השלמה)', 'איבוד דם במחזור החודשי', 'בעיות ספיגה במערכת העיכול'],
          urgency: 'מומלץ לפנות לרופא/ה לקבלת הנחיה לגבי תוסף ברזל מתאים.',
          questions: [
            'האם כדאי להתחיל ליטול תוסף ברזל ובאיזה מינון וסוג?',
            'האם יש צורך לברר את סיבת הירידה במאגרים מעבר לתזונה?',
          ],
        };
      }
      if (value > 300) {
        return {
          status: 'גבולי ⚠️',
          severity: 'warning',
          direction: 'high',
          message: 'הערך גבוה מהנורמה. פריטין הוא גם מדד דלקת (Acute phase reactant) ועולה במצבי דלקת זמניים.',
          whatItMeasures,
          possibleReasons: ['תהליך דלקתי או זיהומי בגוף', 'עומס ברזל או נטילת תוספים ממושכת', 'מחלות כבד'],
          urgency: 'מומלץ להשוות עם מדדי דלקת (כגון CRP).',
          questions: ['האם כדאי לחזור על הבדיקה יחד עם בדיקת CRP?'],
        };
      }
      return normalEval('מאגרי הברזל בגוף נראים תקינים ומספקים.', whatItMeasures);
    },
  },

  b12: {
    name: 'Vitamin B12 (ויטמין B12)',
    abbreviation: 'B12',
    unit: 'pg/mL',
    category: 'ברזל וויטמינים',
    description: 'חיוני לתפקוד תקין של מערכת העצבים, לזיכרון וליצירת כדוריות דם אדומות.',
    reference: '200–900',
    min: 50,
    max: 2000,
    step: 1,
    rangeConfig: {
      visualMin: 100,
      visualMax: 1000,
      normalMin: 300,
      normalMax: 900,
      warningMin: 200,
      unit: 'pg/mL',
      lowLabel: 'חסר (<200)',
      normalLabel: 'תקין (300–900)',
    },
    evaluate: (value) => {
      const whatItMeasures = 'ויטמין B12 חיוני לתהליכי חלוקת תאים ולשמירה על מעטפת המיאלין של תאי העצב.';
      if (value < 200) {
        return {
          status: 'חריג ❗',
          severity: 'danger',
          direction: 'low',
          message: 'הערך נמוך מהטווח המקובל ומצביע על מחסור ב-B12 העלול לגרום לעייפות, נימול או ירידה בריכוז.',
          whatItMeasures,
          possibleReasons: ['תזונה צמחונית/טבעונית ללא תוסף', 'ירידה בספיגה במערכת העיכול (היעדר גורם פנימי / תרופות לסותרי חומצה)'],
          urgency: 'מומלץ להתחיל תוסף בהנחיית הרופא/ה.',
          questions: [
            'איזה תוסף B12 מומלץ לי (כדורי מציצה תת-לשוניים או זריקות)?',
            'האם יש צורך לבדוק חומצה פולית במקביל?',
          ],
        };
      }
      if (value < 300) {
        return {
          status: 'גבולי ⚠️',
          severity: 'warning',
          direction: 'low',
          message: 'הערך בגבול התחתון של הנורמה (200–300 pg/mL) ועלול להתפתח למחסור.',
          whatItMeasures,
          urgency: 'כדאי לשקול השלמה מתונה.',
          questions: ['האם כדאי להתחיל תוסף מתון או להעשיר את התזונה?'],
        };
      }
      return normalEval('רמת ויטמין B12 בטווח התקין.', whatItMeasures);
    },
  },

  vitamin_d: {
    name: 'Vitamin D (ויטמין D)',
    abbreviation: 'Vit-D',
    unit: 'ng/mL',
    category: 'ברזל וויטמינים',
    description: 'חיוני לספיגת סידן, לבריאות העצם, לשרירים ולמערכת החיסון.',
    reference: '30–100',
    min: 3,
    max: 150,
    step: 1,
    rangeConfig: {
      visualMin: 5,
      visualMax: 110,
      normalMin: 30,
      normalMax: 100,
      warningMin: 20,
      unit: 'ng/mL',
      lowLabel: 'חסר (<20)',
      normalLabel: 'תקין (30–100)',
    },
    evaluate: (value) => {
      const whatItMeasures = 'ויטמין D נוצר בעור בעקבות חשיפה לשמש ומסייע בשמירה על צפיפות עצם וחיזוק המערכת החיסונית.';
      if (value < 20) {
        return {
          status: 'חריג ❗',
          severity: 'danger',
          direction: 'low',
          message: 'רמת ויטמין D נמוכה משמעותית מהרצוי ומעידה על חֶסֶר.',
          whatItMeasures,
          possibleReasons: ['חשיפה מועטה לשמש', 'שימוש במסנני קרינה', 'תזונה דלת ויטמין D'],
          urgency: 'מומלץ להיוועץ ברופא/ה לקביעת מינון תוסף מתאים (טיפות/כמוסות).',
          questions: [
            'איזה מינון של ויטמין D מומלץ לי ולכמה זמן?',
            'מתי מומלץ לבצע בדיקת מעקב?',
          ],
        };
      }
      if (value < 30) {
        return {
          status: 'גבולי ⚠️',
          severity: 'warning',
          direction: 'low',
          message: 'רמת ויטמין D אינה אופטימלית (20–30 ng/mL).',
          whatItMeasures,
          urgency: 'מומלץ לעדכן בפגישה השנתית.',
          questions: ['האם כדאי ליטול תוסף יומי במינון תחזוקתי?'],
        };
      }
      return normalEval('רמת ויטמין D בטווח הרצוי והמגן.', whatItMeasures);
    },
  },

  crp: {
    name: 'CRP (חלבון מגיב C)',
    abbreviation: 'CRP',
    unit: 'mg/L',
    category: 'מדדי דלקת',
    description: 'חלבון המיוצר בכבד ומשמש כמדד רגיש לקיומה של דלקת או זיהום בגוף.',
    reference: 'מתחת ל-5.0',
    min: 0,
    max: 300,
    step: 0.1,
    rangeConfig: {
      visualMin: 0,
      visualMax: 20,
      normalMin: 0,
      normalMax: 5.0,
      unit: 'mg/L',
      normalLabel: 'תקין (<5.0)',
      highLabel: 'דלקת (≥5.0)',
    },
    evaluate: (value) => {
      const whatItMeasures = 'C-Reactive Protein עולה במהירות בתגובה לדלקת, זיהום, חבלה או מחלה פעילה, ויורד במהירות עם ההחלמה.';
      if (value < 5.0) {
        return normalEval('רמת ה-CRP נמוכה ותקינה — אין עדות לתהליך דלקתי פעיל.', whatItMeasures);
      }
      return {
        status: 'חריג ❗',
        severity: 'danger',
        direction: 'high',
        message: `רמת ה-CRP מוגברת (${value} mg/L) ומצביעה על תגובה דלקתית או זיהום לאחרונה.`,
        whatItMeasures,
        possibleReasons: ['זיהום חיידקי או ויראלי', 'דלקת מפרקים / שרירים', 'פציעה או ניתוח לאחרונה', 'תהליך דלקתי כרוני'],
        urgency: 'מומלץ לקשור את התוצאה לקיומם של חום, כאבים או תסמינים אחרים.',
        questions: [
          'האם העלייה קשורה למחלה או תסמינים שהיו לי לאחרונה?',
          'האם כדאי לחזור על הבדיקה בעוד 2-4 שבועות לוודא ירידה?',
        ],
      };
    },
  },

  creatinine: {
    name: 'Creatinine (קריאטינין)',
    abbreviation: 'CREAT',
    unit: 'mg/dL',
    category: 'תפקודי כליה',
    description: 'תוצר פירוק טבעי של השרירים המסולק על ידי הכליות ומשמש להערכת תפקודן.',
    reference: '0.6–1.2 (משתנה לפי גיל, מין ומסת שריר)',
    min: 0.1,
    max: 15,
    step: 0.01,
    rangeConfig: {
      visualMin: 0.3,
      visualMax: 2.0,
      normalMin: 0.6,
      normalMax: 1.2,
      warningMin: 0.6,
      unit: 'mg/dL',
      lowLabel: 'נמוך (<0.6)',
      normalLabel: 'תקין (0.6–1.2)',
      highLabel: 'גבוה (>1.2)',
    },
    evaluate: (value) => {
      const whatItMeasures = 'קריאטינין משקף את קצב הסינון הכלייתי (eGFR). עליה בו עלולה להצביע על עומס כלייתי או התייבשות.';
      if (value >= 0.6 && value <= 1.2) {
        return normalEval('הערך בטווח המקובל — תפקוד כלייתי תקין.', whatItMeasures);
      }
      return {
        status: value < 0.6 ? 'גבולי ⚠️' : 'חריג ❗',
        severity: value < 0.6 ? 'warning' : 'danger',
        direction: value < 0.6 ? 'low' : 'high',
        message: value < 0.6
          ? 'הערך נמוך מהטווח. לרוב קשור למסת שריר נמוכה, הריון או תזונה ואינו מעיד על בעיה רפואית.'
          : 'הערך גבוה מהטווח המקובל. לעיתים נובע מחוסר שתייה מספקת (התייבשות) או מעומס על הכליות.',
        whatItMeasures,
        possibleReasons: value < 0.6
          ? ['מסת שריר נמוכה', 'תזונה דלת חלבון']
          : ['התייבשות סמוך לבדיקה', 'פעילות גופנית עצימה / תוספי קריאטין', 'שימוש בתרופות מקבוצת NSAIDs', 'ירידה בתפקוד הכלייתי'],
        urgency: 'מומלץ לדון עם הרופא/ה, במיוחד אם יש מחלות רקע כמו סוכרת או יתר לחץ דם.',
        questions: [
          'מהו חישוב ה-eGFR שלי לפי גיל ומין?',
          'האם כדאי לחזור על הבדיקה תוך הקפדה על שתיית מים מרובה?',
        ],
      };
    },
  },

  alt: {
    name: 'ALT / SGPT (אנזים כבד)',
    abbreviation: 'ALT',
    unit: 'U/L',
    category: 'תפקודי כבד',
    description: 'אנזים המצוי בריכוז גבוה בתאי הכבד ומשתחרר לדם כאשר יש עומס או פגיעה בתאי הכבד.',
    reference: '7–56',
    min: 1,
    max: 500,
    step: 1,
    rangeConfig: {
      visualMin: 5,
      visualMax: 90,
      normalMin: 7,
      normalMax: 56,
      unit: 'U/L',
      normalLabel: 'תקין (7–56)',
      highLabel: 'גבוה (>56)',
    },
    evaluate: (value) => {
      const whatItMeasures = 'ALT (אלנין אמינוטרנספראז) הוא סמן ספציפי לתאי הכבד, הרגיש לשינויים בתזונה, תרופות ואלכוהול.';
      if (value <= 56) return normalEval('תפקודי הכבד (ALT) בטווח התקין.', whatItMeasures);
      return {
        status: 'חריג ❗',
        severity: 'danger',
        direction: 'high',
        message: 'הערך גבוה מהטווח המקובל ומצביע על עומס או גירוי של תאי הכבד.',
        whatItMeasures,
        possibleReasons: ['כבד שומני', 'נטילת תרופות מסוימות (כולל משככי כאבים או תוספים)', 'צריכת אלכוהול', 'פעילות גופנית חריגה'],
        urgency: 'מומלץ להיוועץ ברופא/ת המשפחה להערכה מקיפה.',
        questions: [
          'האם העלייה קשורה לתרופות או תוספי תזונה שאני נוטל/ת?',
          'האם מומלץ לבצע אולטרסוואנד כבד או לחזור על הבדיקה?',
        ],
      };
    },
  },

  tsh: {
    name: 'TSH (הורמון בלוטת התריס)',
    abbreviation: 'TSH',
    unit: 'mIU/L',
    category: 'בלוטת התריס',
    description: 'הורמון המופרש מההיפופיזה ומווסת את פעילות בלוטת התריס וקצב חילוף החומרים בגוף.',
    reference: '0.4–4.0',
    min: 0.01,
    max: 100,
    step: 0.01,
    rangeConfig: {
      visualMin: 0.1,
      visualMax: 6.0,
      normalMin: 0.4,
      normalMax: 4.0,
      unit: 'mIU/L',
      lowLabel: 'נמוך (<0.4)',
      normalLabel: 'תקין (0.4–4.0)',
      highLabel: 'גבוה (>4.0)',
    },
    evaluate: (value) => {
      const whatItMeasures = 'TSH עולה כאשר בלוטת התריס פועלת בחסר (תת-פעילות) ויורד כאשר הבלוטה פועלת בעודף (יתר-פעילות).';
      if (value >= 0.4 && value <= 4.0) {
        return normalEval('איזון הורמון בלוטת התריס (TSH) תקין.', whatItMeasures);
      }
      return {
        status: 'חריג ❗',
        severity: 'danger',
        direction: value < 0.4 ? 'low' : 'high',
        message: value < 0.4
          ? 'הערך נמוך מהטווח ועשוי להצביע על פעילות יתר של בלוטת התריס (היפרתירואידיזם).'
          : 'הערך גבוה מהטווח ועשוי להצביע על תת-פעילות קלה/תת-קלינית של בלוטת התריס (היפותירואידיזם).',
        whatItMeasures,
        possibleReasons: value < 0.4
          ? ['יתר פעילות של בלוטת התריס', 'מינון יתר של תרופות לאיזון הבלוטה']
          : ['תת פעילות של הבלוטה (לרוב על רקע אוטואימוני שכיח)', 'דלקת תריס חולפת'],
        urgency: 'מומלץ להשלים בדיקת הורמוני תריס חופשיים (Free T4).',
        questions: [
          'האם מומלץ להשלים בדיקת Free T4 ונוגדני בלוטת התריס (Anti-TPO)?',
          'האם התוצאה מסבירה שינויים במשקל, עייפות או רגישות לחום/קור?',
        ],
      };
    },
  },
};

export const BIOMARKERS: Biomarker[] = Object.entries(DEFINITIONS).map(
  ([markerId, definition]) => ({ markerId, ...definition })
);

export const BIOMARKERS_BY_ID: Record<string, Biomarker> = BIOMARKERS.reduce(
  (acc, marker) => {
    acc[marker.markerId] = marker;
    return acc;
  },
  {} as Record<string, Biomarker>
);

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'all_normal',
    title: 'בדיקה תקופתית תקינה',
    subtitle: 'כל 15 המדדים בטווח הנורמה האופטימלי (מיכל אברהמי, 34)',
    badge: 'הכל תקין',
    badgeSeverity: 'normal',
    patient: {
      name: 'מיכל אברהמי',
      age: 34,
      sex: 'female',
      context: 'בדיקות דם שגרתיות שבוצעו במסגרת בדיקה תקופתית שנתית, ללא תלונות מיוחדות.',
    },
    values: {
      glucose: '88',
      hba1c: '5.2',
      ldl: '95',
      hdl: '58',
      triglycerides: '90',
      hemoglobin: '13.0',
      wbc: '6.5',
      platelets: '240',
      ferritin: '60',
      b12: '480',
      vitamin_d: '42',
      crp: '1.2',
      creatinine: '0.85',
      alt: '22',
      tsh: '2.1',
    },
  },
  {
    id: 'anemia_iron_pattern',
    title: 'אנמיה ומחסור בברזל (דנה שחר, 41)',
    subtitle: 'המוגלובין ופריטין נמוכים במקביל — שילוב קלאסי',
    badge: 'אנמיה וברזל',
    badgeSeverity: 'danger',
    patient: {
      name: 'דנה שחר',
      age: 41,
      sex: 'female',
      context: 'בירור עייפות מתמשכת, חיוורון וקושי במאמצים גופניים קלים בחודשיים האחרונים.',
    },
    values: {
      hemoglobin: '10.4',
      ferritin: '8',
      b12: '190',
      wbc: '5.4',
      platelets: '280',
      glucose: '90',
    },
    previousValues: {
      hemoglobin: 11.8,
      ferritin: 15,
    },
  },
  {
    id: 'metabolic_lipids',
    title: 'סיכון מטבולי ושומנים (אבי שפירא, 47)',
    subtitle: 'LDL גבוה (138), HbA1c גבולי (5.9) ו-HDL נמוך (37)',
    badge: 'סוכר ושומנים',
    badgeSeverity: 'danger',
    patient: {
      name: 'אבי שפירא',
      age: 47,
      sex: 'male',
      context: 'מעקב כולל לאחר תוצאות בדיקות דם שגרתיות המשלבות ערכי שומנים וסוכר גבוליים-חריגים.',
    },
    values: {
      glucose: '104',
      hba1c: '5.9',
      ldl: '138',
      hdl: '37',
      triglycerides: '210',
      alt: '48',
      creatinine: '0.95',
    },
    previousValues: {
      ldl: 128,
      hba1c: 5.6,
    },
  },
  {
    id: 'infection_inflammation',
    title: 'דלקת פעילה / זיהום (תומר אלבז, 33)',
    subtitle: 'כדוריות דם לבנות (WBC 12.8) ו-CRP גבוה (18.0)',
    badge: 'דלקת / זיהום',
    badgeSeverity: 'danger',
    patient: {
      name: 'תומר אלבז',
      age: 33,
      sex: 'male',
      context: 'פנה עקב תחושת חולי כללית, חום נמוך וכאבי שרירים שנמשכים מספר ימים.',
    },
    values: {
      wbc: '12.8',
      crp: '18.0',
      platelets: '420',
      hemoglobin: '13.9',
    },
  },
];
