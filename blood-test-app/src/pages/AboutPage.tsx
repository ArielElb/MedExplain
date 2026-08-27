import React, { useState } from 'react';
import {
  Info,
  ShieldCheck,
  HeartPulse,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Lock,
  Cpu,
  FileCheck2,
  PhoneCall,
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'האם המערכת מבצעת אבחון רפואי?',
    answer:
      'חד משמעית לא. המערכת מספקת הסברים בהירים על טווחי נורמה של בדיקות מעבדה ומשמעותן הכללית, ומסייעת למטופל/ת לגבש שאלות ממוקדות לקראת הפגישה עם רופא/ת המשפחה. רק רופא/ה מוסמך/ת יכול/ה לאבחן ולקבוע טיפול בהתבסס על התמונה הקלינית הכוללת.',
  },
  {
    question: 'היכן נשמרים נתוני בדיקות הדם שלי?',
    answer:
      'הנתונים אינם נשמרים בשום שרת, ענן או בסיס נתונים. כל החישובים, הניתוחים והמגמות מחושבים בזמן אמת בזיכרון המקומי של הדפדפן שלך בלבד. אין שליחה של מידע רפואי לשום גורם חיצוני.',
  },
  {
    question: 'מדוע נעשה שימוש במנוע כללים דטרמיניסטי ולא במודל שפה חופשי (LLM/ChatGPT)?',
    answer:
      'ברפואה, דיוק ועקביות הם קריטיים. מודלי שפה גנרטיביים עלולים "להזות" (Hallucinations) או לשנות את המלצותיהם בכל הרצה. MedExplain AI עושה שימוש במנוע כללים רפואי מובנה ומאומת (Deterministic Clinical Rules) המבטיח שכל תוצאה תפוענח לפי אותם ספים רפואיים מהימנים וללא סטיות אקראיות.',
  },
  {
    question: 'כיצד מחושבות המגמות בהשוואה לבדיקות קודמות?',
    answer:
      'עבור מדדים שבהם הוזנו נתונים היסטוריים (כמו HbA1c, פריטין, LDL ו-CRP), המערכת מחשבת את הפרש הערכים (דלתא) ואחוז השינוי, ומספקת הסבר תמציתי האם מדובר בשינוי משמעותי המצריך מעקב או התאמת יעדים.',
  },
  {
    question: 'מהו דף "הכנה לרופא" (Visit Brief)?',
    answer:
      'זהו מסמך מרוכז ומובנה המיועד להדפסה או לצפייה בטלפון הנייד במהלך הפגישה במרפאה. הוא כולל את תמצית החריגות, שילובי המדדים, שאלות מובילות שניתן לסמן בצ\'קבוקסים ואזור לכתיבת הערות הרופא/ה.',
  },
];

const AboutPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="about-page">
      {/* Page Header */}
      <header className="page-header text-center">
        <div className="page-header__badge">
          <Info size={16} />
          <span>אודות, עקרונות בטיחות וארכיטקטורה</span>
        </div>
        <h1 className="page-header__title">אודות MedExplain AI</h1>
        <p className="page-header__subtitle">
          פרויקט שפותח במטרה להנגיש תוצאות מעבדה דיגיטליות, להפחית חרדה מיותרת
          ולהעצים את המטופל/ת בשיחה עם הצוות הרפואי.
        </p>
      </header>

      {/* Clinical Motivation & Vision */}
      <section className="about-section card">
        <div className="about-section__header">
          <div className="about-icon-wrap">
            <HeartPulse size={24} className="text-primary" />
          </div>
          <h2>האתגר הקליני: הפער בין קבלת התוצאה לפגישה עם הרופא/ה</h2>
        </div>
        <p className="about-text">
          מטופלים רבים מקבלים כיום את תוצאות בדיקות הדם הדיגיטליות ישירות לאפליקציית קופת החולים,
          שעות או ימים לפני שיש להם הזדמנות לשוחח עם רופא/ת המשפחה. הופעת ערך חורג באדום ("חריג") ללא
          הקשר קליני גורמת לא פעם לחרדה מוגברת, לחיפושים מבלבלים ברשת ולהדבקת מידע רפואי פרטי בכלי בינה מלאכותית ציבוריים.
        </p>
        <p className="about-text font-semibold">
          MedExplain AI גושרת בדיוק על הפער הזה: היא מסבירה, מעניקה הקשר ומכינה לשיחה — ללא אבחון וללא תחליף לרופא/ה.
        </p>
      </section>

      {/* What it Does vs What it Doesn't Do */}
      <section className="what-it-does-grid">
        <div className="card does-box does-box--yes">
          <div className="does-header">
            <FileCheck2 size={24} className="text-emerald" />
            <h3>מה המערכת עושה:</h3>
          </div>
          <ul className="does-list">
            <li>מסבירה ערכי בדיקות דם בשפה פשוטה וברורה</li>
            <li>מדגימה טווחי ייחוס מקובלים ונורמות מעבדה</li>
            <li>מזהה שילובי מדדים רב-מערכתיים (Cross-Test Patterns)</li>
            <li>משווה מגמות ושינויים לעומת בדיקות קודמות</li>
            <li>מכינה רשימת שאלות ממוקדות ומותאמות לשיחה עם הרופא/ה</li>
            <li>שומרת על פרטיות מוחלטת ב-100% בצד הלקוח</li>
          </ul>
        </div>

        <div className="card does-box does-box--no">
          <div className="does-header">
            <AlertTriangle size={24} className="text-rose" />
            <h3>מה המערכת אינה עושה:</h3>
          </div>
          <ul className="does-list">
            <li>אינה מאבחנת מחלות או מצבים רפואיים</li>
            <li>אינה רושמת תרופות, מינונים או טיפולים</li>
            <li>אינה מהווה תחליף לבדיקה גופנית ושיקול דעת של רופא/ה</li>
            <li>אינה שומרת או משדרת נתונים רפואיים לשרתים</li>
            <li>אינה מתאימה למצבי חירום רפואיים חריפים</li>
          </ul>
        </div>
      </section>

      {/* Tech & Privacy Guarantees */}
      <section className="about-section card">
        <div className="about-section__header">
          <div className="about-icon-wrap">
            <Lock size={24} className="text-emerald" />
          </div>
          <h2>ארכיטקטורה ופרטיות: 100% Client-Side</h2>
        </div>
        <p className="about-text">
          האפליקציה פועלת במלואה על גבי הדפדפן במחשב או בטלפון הנייד שלך. כל האלגוריתמים, מנוע הכללים
          ומאגר הידע הרפואי ארוזים בתוך הקבצים הסטטיים של האתר:
        </p>
        <div className="privacy-tech-pills">
          <span className="privacy-tech-pill">
            <ShieldCheck size={16} /> ללא שרת (No Backend)
          </span>
          <span className="privacy-tech-pill">
            <ShieldCheck size={16} /> ללא מסד נתונים (No Database)
          </span>
          <span className="privacy-tech-pill">
            <ShieldCheck size={16} /> ללא שמירת עוגיות מעקב (No Trackers)
          </span>
          <span className="privacy-tech-pill">
            <ShieldCheck size={16} /> יכולת עבודה מלאה Offline
          </span>
        </div>
      </section>

      {/* Deterministic Rules vs LLM Hallucinations */}
      <section className="about-section card">
        <div className="about-section__header">
          <div className="about-icon-wrap">
            <Cpu size={24} className="text-primary" />
          </div>
          <h2>מנוע כללים קליני דטרמיניסטי לעומת AI גנרטיבי</h2>
        </div>
        <p className="about-text">
          בניגוד לצ\'אטבוטים כלליים המבוססים על מודלי שפה (LLM) שעלולים להמציא מידע ("הזיות") או לתת תשובות שונות לאותה בדיקה,
          מערכת זו פועלת על בסיס <strong>מנוע כללים רפואי דטרמיניסטי (Deterministic Clinical Rules Engine)</strong>:
        </p>
        <p className="about-text">
          כל סף נורמה, כל כלל שילוב רב-מדדי וכל שאלה המומלצת לפגישה מוגדרים מראש על בסיס פרוטוקולים רפואיים מקובלים.
          ההסבר הנבחר מותאם במדויק לחומרת הערך ולרקע הקליני — ללא ניחושים וללא חוסר עקביות.
        </p>
      </section>

      {/* FAQ Accordion */}
      <section className="about-section card">
        <div className="about-section__header">
          <div className="about-icon-wrap">
            <HelpCircle size={24} className="text-primary" />
          </div>
          <h2>שאלות נפוצות (FAQ)</h2>
        </div>

        <div className="faq-accordion">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className="faq-item">
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-q-text">{faq.question}</span>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {isOpen && (
                  <div className="faq-answer-body">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Emergency Guidance Alert */}
      <section className="card emergency-banner">
        <div className="emergency-banner__icon">
          <PhoneCall size={28} />
        </div>
        <div className="emergency-banner__content">
          <h3>במקרה של תסמינים חריפים או מצב חירום רפואי</h3>
          <p>
            אם את/ה חווה קוצר נשימה חריף, כאבים בחזה, חולשה פתאומית, חום גבוה או שינוי במצב ההכרה —
            אין להמתין לפענוח בדיקות דם או לפגישה עתידית. יש לפנות מיידית למוקד החירום של מד"א (101) או לחדר המיון הקרוב.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

