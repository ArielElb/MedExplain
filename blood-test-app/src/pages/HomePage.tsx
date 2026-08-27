import React from 'react';
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  Users,
  FileSpreadsheet,
  ArrowLeft,
  Sparkles,
  Activity,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { NavigationPage, PatientScenario } from '../types';
import { PATIENT_SCENARIOS } from '../data/scenarios';

interface Props {
  onNavigate: (page: NavigationPage) => void;
  onSelectScenario: (scenario: PatientScenario) => void;
  hasResults?: boolean;
}

const HomePage: React.FC<Props> = ({
  onNavigate,
  onSelectScenario,
}) => {
  // 3 Featured live demos
  const isolatedDemo = PATIENT_SCENARIOS.find((s) => s.id === 'scenario_03')!; // Ronit Levi - High LDL
  const comboDemo = PATIENT_SCENARIOS.find((s) => s.id === 'scenario_08')!; // Dana Shachar - Iron Def Anemia
  const trendDemo = PATIENT_SCENARIOS.find((s) => s.id === 'scenario_04')!; // David Mizrahi - Pre-diabetes trend

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__badge">
          <ShieldCheck size={16} className="hero__badge-icon text-emerald" />
          <span>100% פרטי ומקומי בדפדפן — ללא שרת וללא שמירת נתונים</span>
        </div>
        <h1 className="hero__title">
          פענוח והסבר בדיקות דם בגובה העיניים
        </h1>
        <p className="hero__subtitle">
          מערכת חכמה להסבר תוצאות מעבדה בשפה פשוטה, זיהוי שילובי מדדים רפואיים, ניתוח מגמות
          והכנת שאלות ממוקדות לשיחה עם רופא/ת המשפחה.
        </p>

        <div className="hero__cta-group">
          <button
            type="button"
            className="btn--hero-primary"
            onClick={() => onNavigate('results')}
          >
            <Zap size={20} />
            <span>הזנת תוצאות אישיות בטופס</span>
          </button>

          <button
            type="button"
            className="btn--hero-secondary"
            onClick={() => onNavigate('scenarios')}
          >
            <Users size={20} />
            <span>צפייה ב-12 מקרי מטופלים לדוגמה</span>
          </button>
        </div>
      </section>

      {/* 3 Core Value Pillars */}
      <section className="value-pillars-grid">
        <div className="value-pillar-card">
          <div className="pillar-icon-wrap pillar-icon--privacy">
            <ShieldCheck size={28} />
          </div>
          <h3>פרטיות מוחלטת 100%</h3>
          <p>
            כל החישובים מתבצעים בדפדפן שלך בלבד. אין שרת, אין API, אין מעקב ואין שליחת נתונים רפואיים לשום גורם חיצוני.
          </p>
        </div>

        <div className="value-pillar-card">
          <div className="pillar-icon-wrap pillar-icon--clarity">
            <CheckCircle2 size={28} />
          </div>
          <h3>הסבר בגובה העיניים</h3>
          <p>
            פישוט מדדים רפואיים מורכבים להסברים בהירים ומרגיעים, עם הסבר מפורט מה המדד בודק ומה עשוי להשפיע עליו.
          </p>
        </div>

        <div className="value-pillar-card">
          <div className="pillar-icon-wrap pillar-icon--prep">
            <FileSpreadsheet size={28} />
          </div>
          <h3>הכנה ממוקדת לרופא/ה</h3>
          <p>
            דוח ביקור מובנה (Visit Brief) הכולל שאלות מומלצות, שילובי מדדים ומגמות מוכנות להדפסה או לשמירה כ-PDF.
          </p>
        </div>
      </section>

      {/* 3 Featured Live Demos (One-Click Launch) */}
      <section className="featured-demos-section">
        <div className="section-header-center">
          <span className="badge badge--primary font-bold">
            <Sparkles size={14} /> הדגמה חיה בלחיצה אחת
          </span>
          <h2>3 דוגמאות קליניות מובחרות</h2>
          <p className="muted">
            לחצו על אחת הדוגמאות כדי לצפות בניתוח חי מלא: ממצא בודד, שילוב רב-מדדי, או מגמת שינוי
          </p>
        </div>

        <div className="featured-demos-grid">
          {/* Demo 1: Isolated finding */}
          <div
            className="featured-demo-card"
            onClick={() => onSelectScenario(isolatedDemo)}
            role="button"
            tabIndex={0}
          >
            <div className="demo-card-badge-row">
              <span className="badge badge--danger">ממצא בודד</span>
              <span className="demo-type-pill">
                <Activity size={13} /> שומנים בדם
              </span>
            </div>
            <h3 className="demo-card-title">LDL גבוה במעקב שגרתי</h3>
            <p className="demo-card-patient">
              <strong>{isolatedDemo.name}</strong>, בת {isolatedDemo.age}
            </p>
            <p className="demo-card-desc">
              בדיקת שומנים עם ערך LDL של 178 mg/dL על רקע היסטוריה משפחתית של מחלות לב.
            </p>
            <div className="demo-card-action">
              <span>פתח ניתוח מלא</span>
              <ArrowLeft size={16} />
            </div>
          </div>

          {/* Demo 2: Cross-test synergy */}
          <div
            className="featured-demo-card featured-demo-card--highlight"
            onClick={() => onSelectScenario(comboDemo)}
            role="button"
            tabIndex={0}
          >
            <div className="demo-card-badge-row">
              <span className="badge badge--warning">שילוב מדדים (Cross-Test)</span>
              <span className="demo-type-pill">
                <Layers size={13} /> אנמיה וברזל
              </span>
            </div>
            <h3 className="demo-card-title">אנמיה מחוסר ברזל משולבת</h3>
            <p className="demo-card-patient">
              <strong>{comboDemo.name}</strong>, בת {comboDemo.age}
            </p>
            <p className="demo-card-desc">
              המוגלובין נמוך (10.4) יחד עם פריטין נמוך (8) המפעילים כלל שילוב רב-מערכתי של חסר ברזל.
            </p>
            <div className="demo-card-action">
              <span>פתח ניתוח מלא</span>
              <ArrowLeft size={16} />
            </div>
          </div>

          {/* Demo 3: Trend Delta */}
          <div
            className="featured-demo-card"
            onClick={() => onSelectScenario(trendDemo)}
            role="button"
            tabIndex={0}
          >
            <div className="demo-card-badge-row">
              <span className="badge badge--warning">מגמת שינוי (Trend)</span>
              <span className="demo-type-pill">
                <TrendingUp size={13} /> סוכר ומטבוליזם
              </span>
            </div>
            <h3 className="demo-card-title">עלייה ב-HbA1c (טרום סוכרת)</h3>
            <p className="demo-card-patient">
              <strong>{trendDemo.name}</strong>, בן {trendDemo.age}
            </p>
            <p className="demo-card-desc">
              עלייה ב-HbA1c מ-5.7% ל-6.0% המציגה השוואת מגמות ושינוי באורח החיים.
            </p>
            <div className="demo-card-action">
              <span>פתח ניתוח מלא</span>
              <ArrowLeft size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* Fast CTA Banner */}
      <section className="home-footer-cta">
        <div className="home-footer-cta__content">
          <h2>מוכנים להתחיל בפענוח הבדיקה שלכם?</h2>
          <p>הזינו את הנתונים ישירות בטופס או בחרו מתוך 12 הדוגמאות הקליניות הקיימות.</p>
          <div className="home-footer-cta__actions">
            <button
              type="button"
              className="btn--submit"
              onClick={() => onNavigate('results')}
            >
              <Zap size={18} />
              <span>הזנת תוצאות אישיות</span>
            </button>
            <button
              type="button"
              className="btn--ghost"
              onClick={() => onNavigate('scenarios')}
            >
              <Users size={18} />
              <span>מעבר ל-12 מקרי הדוגמה</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
