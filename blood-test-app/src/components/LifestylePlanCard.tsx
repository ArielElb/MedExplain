import React, { useState, useMemo } from 'react';
import {
  Utensils,
  Salad,
  Flame,
  Zap,
  Dumbbell,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Apple,
  Fish,
  Coffee,
  Sun,
} from 'lucide-react';
import { AnalysisResult, AnalysisItem, PatientContext } from '../types';

export interface LifestylePlanCardProps {
  result?: AnalysisResult | null;
  patient?: PatientContext;
}

type TabKey = 'all' | 'diet' | 'synergies' | 'exercise' | 'dietitian';

export const LifestylePlanCard: React.FC<LifestylePlanCardProps> = ({
  result,
  patient: _patient,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [copiedQuestions, setCopiedQuestions] = useState(false);
  const [copiedPlan, setCopiedPlan] = useState(false);

  // Map markers for tailored rules
  const markersMap = useMemo(() => {
    const map = new Map<string, AnalysisItem>();
    if (result?.analysis) {
      result.analysis.forEach((item) => map.set(item.markerId, item));
    }
    return map;
  }, [result]);

  const hasHighLipids = Boolean(
    (markersMap.get('ldl')?.severity === 'danger' || markersMap.get('ldl')?.severity === 'warning') ||
    (markersMap.get('triglycerides')?.severity === 'danger' || markersMap.get('triglycerides')?.severity === 'warning') ||
    markersMap.get('hdl')?.severity === 'danger'
  );

  const hasHighSugar = Boolean(
    (markersMap.get('glucose')?.severity === 'danger' || markersMap.get('glucose')?.severity === 'warning') ||
    (markersMap.get('hba1c')?.severity === 'danger' || markersMap.get('hba1c')?.severity === 'warning')
  );

  const hasLowIron = Boolean(
    markersMap.get('hemoglobin')?.severity === 'danger' ||
    markersMap.get('ferritin')?.severity === 'danger' ||
    markersMap.get('ferritin')?.severity === 'warning'
  );

  const hasLowB12 = Boolean(
    markersMap.get('b12')?.severity === 'danger' || markersMap.get('b12')?.severity === 'warning'
  );

  const hasLowVitD = Boolean(
    markersMap.get('vitamin_d')?.severity === 'danger' || markersMap.get('vitamin_d')?.severity === 'warning'
  );

  const hasHighAlt = Boolean(
    markersMap.get('alt')?.severity === 'danger' || markersMap.get('alt')?.severity === 'warning'
  );

  const hasHighCrp = Boolean(
    markersMap.get('crp')?.severity === 'danger' || markersMap.get('wbc')?.severity === 'danger'
  );

  // Dynamic dietitian questions tailored to lab results
  const dietitianQuestions = useMemo(() => {
    const questions: string[] = [];

    if (hasHighLipids) {
      questions.push('כיצד לשלב סיבים מסיסים (כגון שיבולת שועל וקטניות) ושומנים מונסטרליים להורדת LDL והעלאת HDL?');
      questions.push('מהו המינון היומי המומלץ עבורי של אגוזי מלך, שקדים וזרעי פשתן?');
    }

    if (hasHighSugar) {
      questions.push('כיצד לבנות צלחת מאוזנת עם עומס גליקמי נמוך כדי למנוע עליות חדות בסוכר לאחר הארוחה?');
      questions.push('אילו פחמימות מורכבות ומלאות מומלצות ביותר לשמירה על שובע ואיזון ה-HbA1c?');
    }

    if (hasLowIron) {
      questions.push('כיצד לתזמן אכילת מזונות עשירים בברזל (צמחי או מן החי) עם ויטמין C להשגת ספיגה מקסימלית?');
      questions.push('כמה זמן מומלץ להמתין בין ארוחה עשירה בברזל לשתיית קפה, תה או צריכת מוצרי חלב?');
    }

    if (hasHighAlt) {
      questions.push('אילו התאמות תזונתיות מומלצות להפחתת עומס שומני על הכבד ולהורדת אנזימי ALT?');
    }

    if (hasHighCrp) {
      questions.push('אילו מזונות אנטי-דלקתיים עשירים בנוגדי חמצון מומלץ להוסיף לתפריט להורדת מדדי הדלקת?');
    }

    if (hasLowVitD || hasLowB12) {
      questions.push('איזה סוג ומינון של תוספי תזונה (ויטמין D / B12) מומלץ לשלב, ועם אילו ארוחות?');
    }

    // Default universal questions if no specific abnormalities
    if (questions.length === 0) {
      questions.push('כיצד להתאים את עקרונות התזונה הים-תיכונית לסדר היום ולהעדפות האישיות שלי?');
      questions.push('אילו שילובי מזון מומלצים לשמירה על חיוניות ואנרגיה גבוהה לאורך שעות היום?');
      questions.push('מהי כמות החלבון והסיבים התזונתיים המומלצת עבורי לפי משקל גוף ורמת פעילות?');
    }

    return questions;
  }, [hasHighLipids, hasHighSugar, hasLowIron, hasLowB12, hasLowVitD, hasHighAlt, hasHighCrp]);

  const handleCopyQuestions = async () => {
    const text =
      'שאלות מומלצות לפגישה עם דיאטן/ית קליני/ת (מתוך MedExplain AI):\n' +
      dietitianQuestions.map((q, idx) => `${idx + 1}. ${q}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedQuestions(true);
      setTimeout(() => setCopiedQuestions(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyFullPlan = async () => {
    const text = `תוכנית אורח חיים ותזונה ים-תיכונית מותאמת אישית (MedExplain AI):
--------------------------------------------------
1. עקרונות התזונה הים-תיכונית:
- שמן זית כתית מעולה כמקור שומן עיקרי (2-3 כפות ביום)
- שפע ירקות טריים ומבושלים במגוון צבעים בכל ארוחה
- קטניות (עדשים, חומוס, שעועית) לפחות 3-4 פעמים בשבוע
- דגי ים עשירים באומגה 3 (סלמון, סרדינים, מקרל) פעמיים בשבוע
- חופן אגוזי מלך או שקדים טבעיים מדי יום

2. שילובי ספיגה חכמים:
- ברזל + ויטמין C: שילוב קטניות/טחינה עם פלפל אדום, עגבניות או לימון סחוט
- הפרדת קפאין/סידן מברזל: המתנה של שעה לפחות לפני שתיית קפה/תה לאחר הארוחה
- ויטמין D עם ארוחה המכילה שומן איכותי (שמן זית, אבוקדו)

3. פעילות גופנית מותאמת:
- 150 דקות שבועיות של פעילות אירובית מתונה (הליכה מהירה, שחייה, רכיבה)
- 2-3 אימוני התנגדות/כוח בשבוע לשיפור רגישות לאינסולין
- הליכה מתונה של 10-15 דקות לאחר ארוחות עיקריות

4. שאלות לדיאטן/ית קליני/ת:
${dietitianQuestions.map((q, idx) => `${idx + 1}. ${q}`).join('\n')}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedPlan(true);
      setTimeout(() => setCopiedPlan(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <section className="card lifestyle-card" aria-label="תוכנית אורח חיים ותזונה ים-תיכונית">
      {/* Card Header */}
      <div className="card__header lifestyle-header">
        <div className="lifestyle-title-group">
          <div className="lifestyle-icon-badge">
            <Salad size={24} />
          </div>
          <div>
            <h3 className="lifestyle-title">תוכנית אורח חיים ותזונה ים-תיכונית</h3>
            <p className="muted small">
              המלצות מותאמות אישית לממצאי בדיקות הדם שלך: תזונה מבוססת מחקר, שילובי ספיגה, פעילות גופנית והכנה לדיאטנ/ית
            </p>
          </div>
        </div>

        <div className="lifestyle-header-actions no-print">
          <button
            type="button"
            className="btn--ghost btn--small"
            onClick={handleCopyFullPlan}
          >
            {copiedPlan ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
            <span>{copiedPlan ? 'התוכנית הועתקה!' : 'העתק תוכנית מלאה'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="lifestyle-tabs-bar no-print" role="tablist">
        <button
          type="button"
          className={`lifestyle-tab ${activeTab === 'all' ? 'lifestyle-tab--active' : ''}`}
          onClick={() => setActiveTab('all')}
          role="tab"
          aria-selected={activeTab === 'all'}
        >
          <Sparkles size={15} />
          <span>הכל</span>
        </button>
        <button
          type="button"
          className={`lifestyle-tab ${activeTab === 'diet' ? 'lifestyle-tab--active' : ''}`}
          onClick={() => setActiveTab('diet')}
          role="tab"
          aria-selected={activeTab === 'diet'}
        >
          <Utensils size={15} />
          <span>תזונה ים-תיכונית</span>
          {hasHighLipids || hasHighSugar ? <span className="tab-indicator" /> : null}
        </button>
        <button
          type="button"
          className={`lifestyle-tab ${activeTab === 'synergies' ? 'lifestyle-tab--active' : ''}`}
          onClick={() => setActiveTab('synergies')}
          role="tab"
          aria-selected={activeTab === 'synergies'}
        >
          <Zap size={15} />
          <span>שילובי ספיגה חכמים</span>
          {hasLowIron || hasLowVitD ? <span className="tab-indicator" /> : null}
        </button>
        <button
          type="button"
          className={`lifestyle-tab ${activeTab === 'exercise' ? 'lifestyle-tab--active' : ''}`}
          onClick={() => setActiveTab('exercise')}
          role="tab"
          aria-selected={activeTab === 'exercise'}
        >
          <Dumbbell size={15} />
          <span>פעילות גופנית</span>
        </button>
        <button
          type="button"
          className={`lifestyle-tab ${activeTab === 'dietitian' ? 'lifestyle-tab--active' : ''}`}
          onClick={() => setActiveTab('dietitian')}
          role="tab"
          aria-selected={activeTab === 'dietitian'}
        >
          <HelpCircle size={15} />
          <span>שאלות לדיאטנ/ית</span>
          <span className="badge badge--pill small">{dietitianQuestions.length}</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="lifestyle-content">
        {/* SECTION 1: Mediterranean Diet */}
        {(activeTab === 'all' || activeTab === 'diet') && (
          <div className="lifestyle-section">
            <div className="lifestyle-section__header">
              <Utensils size={18} className="text-primary" />
              <h4 className="lifestyle-section__title">תזונה ים-תיכונית מותאמת אישית</h4>
              <span className="badge badge--normal">דפוס התזונה המוביל בבריאות הלב ומניעה</span>
            </div>

            <div className="diet-grid">
              {/* Box 1: Foods to prioritize */}
              <div className="diet-box diet-box--embrace">
                <div className="diet-box__title">
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span className="font-semibold">מה מומלץ להעשיר בתפריט:</span>
                </div>
                <ul className="diet-box__list">
                  <li>
                    <strong>שמן זית כתית מעולה:</strong> 2-3 כפות ביום כתוספת לסלט או לתבשילים, עשיר בחומצה אולאית נוגדת דלקת.
                  </li>
                  <li>
                    <strong>קטניות מגוונות:</strong> עדשים שחורות/ירוקות, גרגרי חומוס, שעועית ופול — מקור מצוין לחלבון וסיבים מסיסים המפחיתים LDL.
                  </li>
                  <li>
                    <strong>אגוזי מלך ושקדים טבעיים:</strong> חופן (30 גרם) ביום תורם חומצות שומן אומגה 3 צמחיות ומסייע לאיזון כולסטרול.
                  </li>
                  <li>
                    <strong>דגי ים שמנים:</strong> סלמון, סרדינים, מקרל או הליבוט (2 פעמים בשבוע) לתמיכה ב-HDL והפחתת טריגליצרידים.
                  </li>
                  <li>
                    <strong>ירקות ב-5 צבעים:</strong> עגבניות (ליקופן), עלים ירוקים (מגנזיום וחומצה פולית), פלפלים (ויטמין C), גזר וברוקולי.
                  </li>
                </ul>
              </div>

              {/* Box 2: Foods to moderate */}
              <div className="diet-box diet-box--moderate">
                <div className="diet-box__title">
                  <AlertCircle size={16} className="text-amber" />
                  <span className="font-semibold">מה מומלץ למתן ולהחליף:</span>
                </div>
                <ul className="diet-box__list">
                  <li>
                    <strong>פחמימות פשוטות ומזון מעובד:</strong> החלפת קמח לבן, מאפים וסוכר לבן בדגנים מלאים (שיבולת שועל, קינואה, לחם מחמצת מלא).
                  </li>
                  <li>
                    <strong>משקאות ממותקים ומיצי פירות:</strong> מעבר למים, חליטות צמחים או סודה עם לימון ונענע למניעת עומס שומני על הכבד.
                  </li>
                  <li>
                    <strong>שומן טראנס ושומן רווי מעובד:</strong> צמצום נקניקים, גבינות קשות שמנות מאוד ומאפים תעשייתיים להורדת LDL.
                  </li>
                  <li>
                    <strong>מלח ונתרן מוסף:</strong> תיבול בעשבי תיבול טריים (אורגנו, טימין, רוזמרין), שום, בצל, כורכום ולימון במקום אבקות מרק.
                  </li>
                </ul>
              </div>
            </div>

            {/* Targeted Lab-Specific Highlight */}
            {(hasHighLipids || hasHighSugar || hasLowIron || hasHighAlt) && (
              <div className="diet-targeted-alert">
                <Sparkles size={18} className="text-primary" />
                <div>
                  <span className="font-semibold small text-primary">התאמה ממוקדת לבדיקות הדם שלך:</span>
                  <p className="small">
                    {hasHighLipids && '• בשל ערכי השומנים (LDL/טריגליצרידים): מומלץ להקפיד במיוחד על סיבים מסיסים משיבולת שועל וקטניות, המפנים כולסטרול במערכת העיכול. '}
                    {hasHighSugar && '• בשל ערכי הסוכר/HbA1c: מומלץ לשלב חלבון או שומן בריא בכל ארוחה המכילה פחמימה כדי למתן את קצב כניסת הגלוקוז לדם. '}
                    {hasHighAlt && '• בשל אנזימי הכבד (ALT): מומלץ להפחית מזונות עתירי סירופ תירס ופרוקטוז ולהעדיף תה ירוק וירקות מצליבים. '}
                    {hasLowIron && '• בשל מאגרי הברזל/המוגלובין: מומלץ לשלב טחינה מלאה, עדשים וקטניות לצד מקור ויטמין C טרי בכל ארוחה עיקרית.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: Smart Nutrient Synergies */}
        {(activeTab === 'all' || activeTab === 'synergies') && (
          <div className="lifestyle-section">
            <div className="lifestyle-section__header">
              <Zap size={18} className="text-amber" />
              <h4 className="lifestyle-section__title">שילובי ספיגה חכמים (Nutrient Synergies)</h4>
              <span className="badge badge--warning">ביולוגיה של ספיגת ויטמינים ומינרלים</span>
            </div>

            <div className="synergy-cards-grid">
              {/* Synergy 1: Iron + Vitamin C */}
              <div className="synergy-card">
                <div className="synergy-card__header">
                  <Apple size={20} className="text-rose" />
                  <span className="font-semibold">ברזל צמחי + ויטמין C</span>
                  <span className="badge badge--normal chip-badge">ספיגה מוגברת פי 3</span>
                </div>
                <p className="small">
                  ברזל מן הצומח (Non-Heme Iron) המצוי בעדשים, טחינה מלאה, תרד וגרגרי חומוס נספג בשיעור נמוך יחסית.
                  אכילתם יחד עם מזון עשיר בוויטמין C (לימון סחוט, עגבניות, פלפל אדום או תפוז) ממירה את הברזל למבנה כימי שנספג במעי ביעילות משולשת!
                </p>
                <div className="synergy-card__example small">
                  <strong>דוגמה פרקטית:</strong> סלט ירקות עם פלפל אדום ומיץ לימון טרי מעל מג׳דרה של עדשים ואורז מלא.
                </div>
              </div>

              {/* Synergy 2: Separation of Iron from Calcium/Caffeine */}
              <div className="synergy-card">
                <div className="synergy-card__header">
                  <Coffee size={20} className="text-amber" />
                  <span className="font-semibold">הפרדת קפה, תה וסידן מברזל</span>
                  <span className="badge badge--warning chip-badge">מניעת עיכוב ספיגה</span>
                </div>
                <p className="small">
                  טאנינים ופוליפנולים המצויים בקפה, תה שחור/ירוק וקקאו, לצד סידן במוצרי חלב ותוספים, נקשרים למולקולות הברזל ומעכבים את ספיגתן בכ-60%-80%.
                </p>
                <div className="synergy-card__example small">
                  <strong>דוגמה פרקטית:</strong> המתינו לפחות שעה עד שעה וחצי מסיום ארוחה עשירה בברזל (או נטילת תוסף ברזל) לפני שתיית כוס קפה או תה.
                </div>
              </div>

              {/* Synergy 3: Fat-Soluble Vitamin D */}
              <div className="synergy-card">
                <div className="synergy-card__header">
                  <Sun size={20} className="text-primary" />
                  <span className="font-semibold">ויטמין D לצד שומן איכותי</span>
                  <span className="badge badge--normal chip-badge">ויטמין מסיס שומן</span>
                </div>
                <p className="small">
                  ויטמין D (כמו גם ויטמינים A, E, K) הוא ויטמין מסיס שומן. ספיגתו במערכת העיכול תלויה בנוכחות חומצות שומן המעודדות הפרשת מיצי מרה ומיצלות.
                </p>
                <div className="synergy-card__example small">
                  <strong>דוגמה פרקטית:</strong> נטילת תוסף ויטמין D מומלצת לצד ארוחה עיקרית הכוללת שמן זית, אבוקדו, טחינה או דגים.
                </div>
              </div>

              {/* Synergy 4: Omega 3 & Antioxidants */}
              <div className="synergy-card">
                <div className="synergy-card__header">
                  <Fish size={20} className="text-emerald" />
                  <span className="font-semibold">אומגה 3 + תבלינים נוגדי חמצון</span>
                  <span className="badge badge--normal chip-badge">הגנה מפני עקה חמצונית</span>
                </div>
                <p className="small">
                  חומצות שומן רב-בלתי-רוויות (EPA/DHA) רגישות לחמצון בגוף. שילובן עם נוגדי חמצון טבעיים (כורכומין, שום, רוזמרין ושמן זית) שומר על יציבותן ומעצים את השפעתן נוגדת הדלקת.
                </p>
                <div className="synergy-card__example small">
                  <strong>דוגמה פרקטית:</strong> אפיית פילה דג סלמון בתנור עם עשבי תיבול טריים, שום כתוש ושמן זית.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: Tailored Exercise Recommendations */}
        {(activeTab === 'all' || activeTab === 'exercise') && (
          <div className="lifestyle-section">
            <div className="lifestyle-section__header">
              <Dumbbell size={18} className="text-primary" />
              <h4 className="lifestyle-section__title">המלצות פעילות גופנית מותאמות</h4>
              <span className="badge badge--normal">אימון אירובי + אימוני התנגדות וכוח</span>
            </div>

            <div className="exercise-grid">
              <div className="exercise-card">
                <div className="exercise-card__header">
                  <Flame size={20} className="text-amber" />
                  <span className="font-semibold">אימון אירובי מתון: 150 דקות בשבוע</span>
                </div>
                <p className="small">
                  הליכה נמרצת, שחייה, רכיבה על אופניים או ריצה קלה המחולקות ל-30 דקות, 5 פעמים בשבוע (או 75 דקות פעילות עצימה).
                </p>
                <div className="exercise-benefits small">
                  <span className="font-semibold text-emerald">תועלת ישירה בבדיקות דם:</span>
                  <span>מעלה כולסטרול מגן (HDL), מפחיתה טריגליצרידים, משפרת לחץ דם ומגבירה רגישות לאינסולין.</span>
                </div>
              </div>

              <div className="exercise-card">
                <div className="exercise-card__header">
                  <Dumbbell size={20} className="text-primary" />
                  <span className="font-semibold">אימוני התנגדות וכוח: 2-3 פעמים בשבוע</span>
                </div>
                <p className="small">
                  תרגילי משקל גוף (שכיבות סמיכה, סקוואטים), רצועות גומי או משקולות המפעילים את קבוצות השרירים הגדולות (רגליים, גב, חזה).
                </p>
                <div className="exercise-benefits small">
                  <span className="font-semibold text-emerald">תועלת ישירה בבדיקות דם:</span>
                  <span>מגבירה את קולטני ה-GLUT-4 בשריר המכניסים סוכר ללא תלות מלאה באינסולין ומורידה ישירות HbA1c.</span>
                </div>
              </div>

              <div className="exercise-card">
                <div className="exercise-card__header">
                  <Clock size={20} className="text-rose" />
                  <span className="font-semibold">טיפ קליני: הליכה של 10-15 דקות לאחר ארוחה</span>
                </div>
                <p className="small">
                  הליכה מתונה וקלה מיד לאחר סיום ארוחה עיקרית מפעילה את שרירי הרגליים וסופחת גלוקוז מזרם הדם, מה שמונע פיקים חדים של סוכר ואינסולין.
                </p>
                <div className="exercise-benefits small">
                  <span className="font-semibold text-emerald">תועלת ישירה בבדיקות דם:</span>
                  <span>ממתנת קפיצות סוכר ומשפרת את תחושת הקלילות והעיכול לאחר הארוחה.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: Questions for the Clinical Dietitian */}
        {(activeTab === 'all' || activeTab === 'dietitian') && (
          <div className="lifestyle-section">
            <div className="lifestyle-section__header">
              <HelpCircle size={18} className="text-amber" />
              <h4 className="lifestyle-section__title">שאלות ממוקדות לפגישה עם דיאטן/ית קליני/ת</h4>
              <button
                type="button"
                className="btn--ghost btn--small no-print"
                onClick={handleCopyQuestions}
              >
                {copiedQuestions ? (
                  <Check size={14} className="text-emerald" />
                ) : (
                  <Copy size={14} />
                )}
                <span>{copiedQuestions ? 'השאלות הועתקו!' : 'העתק שאלות ללוח'}</span>
              </button>
            </div>

            <p className="small muted">
              הכינו את השאלות הבאות לקראת פגישת הייעוץ התזונתי בקופת החולים כדי לקבל תוכנית מותאמת ומדויקת ביותר:
            </p>

            <div className="dietitian-q-list">
              {dietitianQuestions.map((q, idx) => (
                <div key={idx} className="dietitian-q-item">
                  <div className="dietitian-q-num font-mono">{idx + 1}</div>
                  <p className="dietitian-q-text small font-semibold">{q}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default LifestylePlanCard;
