import { AnalysisItem } from '../types';

export interface NutritionProtocol {
  categoryTitle: string;
  badge: string;
  foodsToPrioritize: string[];
  foodsToModerate: string[];
  synergyTip: string;
  activityTip: string;
  dietitianQuestion: string;
}

export function generateLifestylePlan(abnormalItems: AnalysisItem[]): NutritionProtocol[] {
  const protocols: NutritionProtocol[] = [];
  const markerIds = new Set(abnormalItems.map((a) => a.markerId));

  // 1. Lipid & Cardiovascular Protocol
  if (markerIds.has('ldl') || markerIds.has('cholesterol') || markerIds.has('triglycerides')) {
    protocols.push({
      categoryTitle: 'פרוטוקול בריאות הלב ואיזון שומנים (Lipid Balance)',
      badge: 'שומנים וכולסטרול',
      foodsToPrioritize: [
        'שמן זית כתית מעולה, אבוקדו וטחינה גולמית (שומנים בלתי רווים)',
        'שיבולת שועל, קטניות (שעועית, עדשים, גרגרי חומוס) העשירים בסיבים מסיסים',
        'אגוזי מלך, זרעי צ׳יה ודגי ים (סלמון, סרדינים) העשירים באומגה 3',
      ],
      foodsToModerate: [
        'שומן רווי מבשר שמן, נקניקים, חמאה וגבינות קשות שמנות',
        'פחמימות פשוטות ומזונות מעובדים המעלים טריגליצרידים',
        'מזון מטוגן ומאפים תעשייתיים (שומן טראנס)',
      ],
      synergyTip: 'שילוב סיבים מסיסים (כגון שיבולת שועל) קושר את מלחי המרה במעי ומסייע בהורדה טבעית של רמות ה-LDL.',
      activityTip: '150 דקות בשבוע של פעילות אירובית מתונה (הליכה מהירה, שחייה או רכיבה) מסייעת בהעלאת כולסטרול ה-HDL הטוב.',
      dietitianQuestion: 'מהו היעד המומלץ עבורי של צריכת סיבים תזונתיים יומית, והאם כדאי לשלב פיטוסטרולים בתפריט?',
    });
  }

  // 2. Iron & Anemia Protocol
  if (markerIds.has('ferritin') || markerIds.has('hemoglobin') || markerIds.has('iron')) {
    protocols.push({
      categoryTitle: 'פרוטוקול העשרת מאגרי ברזל ומניעת אנמיה (Iron Synergy)',
      badge: 'ברזל ואנרגיה',
      foodsToPrioritize: [
        'בשר בקר רזה, הודו אדום ודגים (ברזל Heme בעל ספיגה גבוהה)',
        'עדשים, שעועית, טחינה מלאה, קינואה ועלים ירוקים כהים (ברזל Non-Heme)',
        'מזונות עשירים בוויטמין C (פלפל אדום, פירות הדר, עגבניות) לצד ארוחות עשירות בברזל',
      ],
      foodsToModerate: [
        'שתיית קפה, תה שחור או ירוק עד שעתיים לאחר ארוחות עשירות בברזל (טאנינים מעכבים ספיגה)',
        'צריכת מוצרי חלב עתירי סידן בצמוד לנטילת תוספי ברזל',
      ],
      synergyTip: 'ויטמין C משנה את מצב החמצון של הברזל הצמחי ומגביר את ספיגתו במעי עד פי 3!',
      activityTip: 'הימנע מאימוני כוח עצימים מדי בימי חולשה, ובצע הליכות קלות לשמירה על זרימת דם וחמצון רקמות.',
      dietitianQuestion: 'האם ספיגת הברזל שלי אופטימלית מהמזון, או שיש צורך בתוסף ברזל עדין למערכת העיכול?',
    });
  }

  // 3. Glucose & Metabolic Protocol
  if (markerIds.has('glucose') || markerIds.has('hba1c')) {
    protocols.push({
      categoryTitle: 'פרוטוקול איזון סוכר ורגישות לאינסולין (Glycemic Control)',
      badge: 'סוכר ומטבוליזם',
      foodsToPrioritize: [
        'ירקות מכל הצבעים (במיוחד מצליבים וירקות ירוקים)',
        'דגנים מלאים בעלי אינדקס גליקמי נמוך (שיפון, כוסמין, קינואה)',
        'חלבונים רזים בכל ארוחה למיתון קפיצות הסוכר בדם',
      ],
      foodsToModerate: [
        'משקאות ממותקים, מיצים טבעיים ומשקאות אנרגיה',
        'קמח לבן, אורז לבן וממתקים',
        'פירות יבשים בכמויות גדולות',
      ],
      synergyTip: 'אכילת חלבון וירקות לפני הפחמימה בארוחה (סדר אכילה נכון) מפחיתה משמעותית את קפיצת הסוכר שאחרי הארוחה.',
      activityTip: 'הליכה קלה של 10-15 דקות מיד לאחר הארוחה מעודדת את השרירים לקלוט גלוקוז ללא תלות מלאה באינסולין.',
      dietitianQuestion: 'איך לתכנן את חלוקת הפחמימות לאורך היום כדי למנוע עליות וירידות חדות ברמת הסוכר?',
    });
  }

  // Default Mediterranean baseline if no specific category is flagged
  if (protocols.length === 0) {
    protocols.push({
      categoryTitle: 'פרוטוקול התזונה הים-תיכונית לשמירה על מדדים מיטביים',
      badge: 'רפואה מונעת ואריכות ימים',
      foodsToPrioritize: [
        'שפע ירקות טריים ומבושלים במגוון צבעים (לפחות 5 מנות ביום)',
        'שמן זית כתית מעולה כמקור שומן עיקרי',
        'דגנים מלאים, קטניות, אגוזים וזרעים טבעיים',
        'דגים לפחות פעמיים בשבוע',
      ],
      foodsToModerate: [
        'בשר מעובד ומזון אולטרה-מעובד (UPF)',
        'סוכר מוסף ומשקאות ממותקים',
        'מלח עודף (נתרן)',
      ],
      synergyTip: 'התזונה הים-תיכונית הוכחה במחקרים קליניים כמפחיתה סיכון קרדיווסקולרי ותומכת באריכות חיים ובריאות המוח.',
      activityTip: 'שילוב של 150 דקות אירוביות בשבוע יחד עם 2 אימוני חיזוק שריר מהווה את מרשם הפעילות הגופנית המומלץ ביותר.',
      dietitianQuestion: 'כיצד להתאים את התפריט היומי לשמירה על אנרגיה יציבה ומדדים אופטימליים לאורך זמן?',
    });
  }

  return protocols;
}
