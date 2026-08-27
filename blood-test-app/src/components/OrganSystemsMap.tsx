import React, { useState, useMemo } from 'react';
import {
  HeartPulse,
  Droplet,
  Zap,
  Activity,
  Filter,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Info,
  X,
} from 'lucide-react';
import { AnalysisItem, Severity } from '../types';

export interface OrganSystemsMapProps {
  analysis: AnalysisItem[];
  onSelectMarker?: (markerId: string) => void;
}

export interface OrganSystemDef {
  id: string;
  name: string;
  englishName: string;
  icon: React.ReactNode;
  markerIds: string[];
  description: string;
  clinicalSignificance: string;
  lifestyleTip: string;
  doctorQuestions: string[];
}

export const ORGAN_SYSTEMS: OrganSystemDef[] = [
  {
    id: 'cardiovascular',
    name: 'מערכת הלב וכלי הדם',
    englishName: 'Cardiovascular System',
    icon: <HeartPulse className="system-icon system-icon--cardio" size={24} />,
    markerIds: ['ldl', 'hdl', 'triglycerides', 'glucose', 'crp'],
    description: 'הערכת פרופיל שומני הדם, הצטברות פלאק בעורקים ומדדי דלקת המשפיעים על תפקוד הלב.',
    clinicalSignificance:
      'שמירה על רמות LDL נמוכות ו-HDL מגן, יחד עם טריגליצרידים תקינים, מונעת שקיעת שומנים בדפנות העורקים ושומרת על גמישות כלי הדם.',
    lifestyleTip: 'תזונה ים-תיכונית (שמן זית, אגוזים, דגי ים), הפחתת שומן רווי ופעילות אירובית קבועה של 150 דקות בשבוע.',
    doctorQuestions: [
      'מהו יעד ה-LDL המדויק המומלץ עבורי בהתחשב בהיסטוריה המשפחתית?',
      'האם פרופיל השומנים והסוכר שלי מצריך התערבות תרופתית או שינוי באורח חיים?',
    ],
  },
  {
    id: 'hematology',
    name: 'המטולוגיה ומאגרי דם',
    englishName: 'Hematology & Iron Reserves',
    icon: <Droplet className="system-icon system-icon--hema" size={24} />,
    markerIds: ['hemoglobin', 'ferritin', 'b12', 'wbc', 'platelets'],
    description: 'כושר נשיאת החמצן על ידי תאי הדם האדומים, מאגרי הברזל, מערכת הקרישה וספירת הדם הכללית.',
    clinicalSignificance:
      'המוגלובין ופריטין תקינים מבטיחים אספקת חמצן יעילה למוח ולשרירים, מונעים עייפות וחולשה, ומספקים אנרגיה יומיומית.',
    lifestyleTip: 'שילוב מזונות עשירים בברזל (קטניות, טחינה מלאה, בשר רזה) יחד עם ויטמין C, והפרדת שתיית קפה/תה משעות הארוחה.',
    doctorQuestions: [
      'האם ערכי ההמוגלובין והפריטין מעידים על צורך בנטילת תוסף ברזל או B12?',
      'האם יש צורך בבירור של מקור הירידה במאגרי הברזל מעבר לתזונה?',
    ],
  },
  {
    id: 'metabolic',
    name: 'סוכר ומטבוליזם אנרגטי',
    englishName: 'Metabolic & Glycemic Balance',
    icon: <Zap className="system-icon system-icon--metabolic" size={24} />,
    markerIds: ['glucose', 'hba1c', 'triglycerides'],
    description: 'רמת הסוכר בצום ובחודשים האחרונים, רגישות לאינסולין ויעילות הפקת האנרגיה בתאים.',
    clinicalSignificance:
      'איזון הגלוקוז וה-HbA1c מונע התפתחות טרום-סוכרת, מגן על כלי הדם הקטנים בעיניים ובכליות, ושומר על חיוניות יציבה לאורך היום.',
    lifestyleTip: 'העדפת פחמימות מורכבות עם סיבים תזונתיים, הימנעות משתייה מתוקה, והליכה מתונה של 10-15 דקות לאחר ארוחות.',
    doctorQuestions: [
      'האם תוצאת ה-HbA1c נמצאת בטווח האופטימלי או דורשת מעקב סוכר הדוק יותר?',
      'אילו שינויים תזונתיים מומלצים לי בשלב זה?',
    ],
  },
  {
    id: 'hepatic',
    name: 'תפקודי כבד ומטבוליזם',
    englishName: 'Hepatic Function & Liver Health',
    icon: <Activity className="system-icon system-icon--hepatic" size={24} />,
    markerIds: ['alt', 'triglycerides'],
    description: 'בריאות תאי הכבד, יכולת סינון רעלים, ועיבוד שומנים ופחמימות.',
    clinicalSignificance:
      'אנזים ALT רגיש לעומס שומני, השפעת תרופות ואלכוהול. ערך תקין מעיד על תפקוד כבדי תקין ופינוי יעיל של תוצרי חילוף חומרים.',
    lifestyleTip: 'הפחתת סוכר פירות מרוכז (פרוקטוז), הימנעות מאלכוהול מוגזם, ושילוב ירקות מצליבים (ברוקולי, כרובית) בתפריט.',
    doctorQuestions: [
      'האם עלייה באנזימי הכבד קשורה לתרופות או תוספי תזונה שאני נוטל/ת?',
      'האם מומלץ לבצע בדיקת אולטרסוואנד כבד להערכת כבד שומני?',
    ],
  },
  {
    id: 'renal',
    name: 'תפקודי כליה ומאזן נוזלים',
    englishName: 'Renal Function & Filtration',
    icon: <Filter className="system-icon system-icon--renal" size={24} />,
    markerIds: ['creatinine'],
    description: 'קצב סינון הדם על ידי הכליות (eGFR), פינוי פסולת חנקנית ושמירה על מאזן נוזלים ומלחים בגוף.',
    clinicalSignificance:
      'קריאטינין בטווח הנורמה מעיד על כושר סינון כלייתי תקין. הכליות חיוניות לוויסות לחץ הדם, מאזן חומצה-בסיס וייצור הורמונים.',
    lifestyleTip: 'שתייה מספקת של מים (1.5–2.5 ליטר ביום בהתאם למזג האוויר והמאמץ), והפחתת שימוש עודף במשככי כאבים מקבוצת NSAIDs.',
    doctorQuestions: [
      'מהו ערך ה-eGFR המשוער שלי לפי גיל, מין ורמת הקריאטינין?',
      'האם התוצאה מעידה על התייבשות זמנית או עומס כלייתי?',
    ],
  },
  {
    id: 'immunity',
    name: 'מערכת החיסון ובקרת דלקת',
    englishName: 'Immune System & Inflammation',
    icon: <ShieldCheck className="system-icon system-icon--immune" size={24} />,
    markerIds: ['wbc', 'crp', 'vitamin_d'],
    description: 'מערך ההגנה מפני זיהומים (WBC), מדדי דלקת סיסטמית (CRP), ואיזון חיסוני (ויטמין D).',
    clinicalSignificance:
      'אינטגרציה בין כדוריות דם לבנות תקינות, CRP נמוך וויטמין D מספק מבטיחה הגנה אופטימלית מפני פתוגנים ושקט דלקתי.',
    lifestyleTip: 'שינה איכותית של 7-8 שעות, חשיפה מבוקרת לשמש, הפחתת סטרס, ותזונה עשירה בנוגדי חמצון.',
    doctorQuestions: [
      'האם עלייה ב-CRP או WBC קשורה למחלה ויראלית/חיידקית שהייתה לי לאחרונה?',
      'האם כדאי ליטול תוסף ויטמין D לתמיכה במערכת החיסון ובאיזה מינון?',
    ],
  },
];

interface SystemStatusSummary {
  system: OrganSystemDef;
  testedMarkers: AnalysisItem[];
  untestedMarkerIds: string[];
  totalMarkersCount: number;
  testedCount: number;
  normalCount: number;
  warningCount: number;
  dangerCount: number;
  overallSeverity: Severity | 'untested';
  overallStatusText: string;
  healthScorePercent: number;
}

export const OrganSystemsMap: React.FC<OrganSystemsMapProps> = ({
  analysis,
  onSelectMarker,
}) => {
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);

  // Map analysis items by markerId for fast lookup
  const analysisMap = useMemo(() => {
    const map = new Map<string, AnalysisItem>();
    analysis.forEach((item) => {
      map.set(item.markerId, item);
    });
    return map;
  }, [analysis]);

  // Compute status for all 6 organ systems
  const systemsSummaries: SystemStatusSummary[] = useMemo(() => {
    return ORGAN_SYSTEMS.map((system) => {
      const testedMarkers: AnalysisItem[] = [];
      const untestedMarkerIds: string[] = [];

      system.markerIds.forEach((id) => {
        const item = analysisMap.get(id);
        if (item) {
          testedMarkers.push(item);
        } else {
          untestedMarkerIds.push(id);
        }
      });

      const totalMarkersCount = system.markerIds.length;
      const testedCount = testedMarkers.length;

      let normalCount = 0;
      let warningCount = 0;
      let dangerCount = 0;

      testedMarkers.forEach((m) => {
        if (m.severity === 'danger') dangerCount += 1;
        else if (m.severity === 'warning') warningCount += 1;
        else normalCount += 1;
      });

      let overallSeverity: Severity | 'untested' = 'untested';
      let overallStatusText = 'לא נבדק';
      let healthScorePercent = 0;

      if (testedCount > 0) {
        if (dangerCount > 0) {
          overallSeverity = 'danger';
          overallStatusText = 'חריג ❗';
        } else if (warningCount > 0) {
          overallSeverity = 'warning';
          overallStatusText = 'דורש תשומת לב ⚠️';
        } else {
          overallSeverity = 'normal';
          overallStatusText = 'תקין ומאוזן ✅';
        }

        // Calculate a 0-100% score for this system
        const score = Math.round(
          ((normalCount * 1.0 + warningCount * 0.5) / testedCount) * 100
        );
        healthScorePercent = score;
      }

      return {
        system,
        testedMarkers,
        untestedMarkerIds,
        totalMarkersCount,
        testedCount,
        normalCount,
        warningCount,
        dangerCount,
        overallSeverity,
        overallStatusText,
        healthScorePercent,
      };
    });
  }, [analysisMap]);

  const activeDrawerSystem = useMemo(() => {
    if (!selectedSystemId) return null;
    return systemsSummaries.find((s) => s.system.id === selectedSystemId) || null;
  }, [selectedSystemId, systemsSummaries]);

  const handleToggleSystem = (systemId: string) => {
    setSelectedSystemId((prev) => (prev === systemId ? null : systemId));
  };

  return (
    <section className="card organ-systems-container" aria-label="מפת מערכות הגוף הביולוגיות">
      {/* Header */}
      <div className="card__header organ-systems-header">
        <div className="organ-systems-title-group">
          <div className="organ-systems-badge-icon">
            <HeartPulse size={24} />
          </div>
          <div>
            <h3 className="organ-systems-title">מפת 6 מערכות הגוף הביולוגיות</h3>
            <p className="muted small">
              הערכת בריאות אינטגרטיבית הממפה את בדיקות הדם שלך למערכות הגוף הפיזיולוגיות
            </p>
          </div>
        </div>

        {/* Global Summary Badge */}
        <div className="organ-systems-top-stats">
          <span className="badge badge--primary-filled">
            {systemsSummaries.filter((s) => s.overallSeverity === 'normal').length} מתוך 6 מערכות תקינות
          </span>
        </div>
      </div>

      {/* Grid of 6 Organ Systems */}
      <div className="organ-systems-grid">
        {systemsSummaries.map((summary) => {
          const { system, testedCount, totalMarkersCount, overallSeverity, healthScorePercent } = summary;
          const isSelected = selectedSystemId === system.id;

          // Stroke circumference for 40px radius circle = 2 * PI * 36 ≈ 226
          const radius = 32;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset =
            testedCount > 0
              ? circumference - (healthScorePercent / 100) * circumference
              : circumference;

          return (
            <div
              key={system.id}
              className={`organ-card organ-card--${overallSeverity} ${
                isSelected ? 'organ-card--selected' : ''
              }`}
              onClick={() => handleToggleSystem(system.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleToggleSystem(system.id);
                }
              }}
              aria-expanded={isSelected}
              aria-label={`${system.name}, סטטוס: ${summary.overallStatusText}`}
            >
              {/* Card Top */}
              <div className="organ-card__top">
                <div className="organ-card__icon-wrap">{system.icon}</div>

                {/* Circular Score Gauge */}
                <div className="organ-gauge-circle" title={`ציון בריאות המערכת: ${testedCount > 0 ? `${healthScorePercent}%` : 'לא נבדק'}`}>
                  <svg className="organ-gauge-svg" width="76" height="76" viewBox="0 0 76 76">
                    <circle
                      className="organ-gauge-bg"
                      cx="38"
                      cy="38"
                      r={radius}
                      strokeWidth="6"
                    />
                    <circle
                      className={`organ-gauge-bar organ-gauge-bar--${overallSeverity}`}
                      cx="38"
                      cy="38"
                      r={radius}
                      strokeWidth="6"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      transform="rotate(-90 38 38)"
                    />
                  </svg>
                  <div className="organ-gauge-inner">
                    {testedCount > 0 ? (
                      <span className="organ-gauge-num font-mono">{healthScorePercent}%</span>
                    ) : (
                      <span className="organ-gauge-na small muted">--</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Title & English Subtitle */}
              <div className="organ-card__titles">
                <h4 className="organ-card__name">{system.name}</h4>
                <span className="organ-card__en-name small muted">{system.englishName}</span>
              </div>

              {/* Status Badge */}
              <div className="organ-card__badge-row">
                <span className={`badge badge--${overallSeverity === 'untested' ? 'muted' : overallSeverity}`}>
                  {overallSeverity === 'normal' && <CheckCircle2 size={13} />}
                  {overallSeverity === 'warning' && <AlertTriangle size={13} />}
                  {overallSeverity === 'danger' && <AlertCircle size={13} />}
                  <span>{summary.overallStatusText}</span>
                </span>
                <span className="small muted">
                  {testedCount} / {totalMarkersCount} מדדים
                </span>
              </div>

              {/* Biomarkers Quick Tags */}
              <div className="organ-card__markers-list">
                {system.markerIds.map((markerId) => {
                  const item = analysisMap.get(markerId);
                  if (item) {
                    return (
                      <span
                        key={markerId}
                        className={`organ-marker-chip organ-marker-chip--${item.severity}`}
                        title={`${item.name}: ${item.result} ${item.unit} (${item.status})`}
                      >
                        <span className="organ-marker-dot" />
                        <span className="organ-marker-abbr">{item.abbreviation || item.name.split(' ')[0]}</span>
                        <strong className="organ-marker-val">{item.result}</strong>
                      </span>
                    );
                  }
                  return (
                    <span
                      key={markerId}
                      className="organ-marker-chip organ-marker-chip--empty"
                      title={`${markerId} לא נבדק`}
                    >
                      <span className="organ-marker-dot-empty" />
                      <span className="muted small">{markerId.toUpperCase()}</span>
                    </span>
                  );
                })}
              </div>

              {/* Expand Hint Footer */}
              <div className="organ-card__footer">
                <span className="small font-semibold text-primary">
                  {isSelected ? 'סגור פירוט מערכת' : 'לחץ להרחבה ומשמעות קלינית'}
                </span>
                {isSelected ? <ChevronUp size={16} className="text-primary" /> : <ChevronDown size={16} className="text-primary" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded System Drawer / Deep Dive Panel */}
      {activeDrawerSystem && (
        <div className="organ-drawer-wrap" role="region" aria-label={`פירוט ${activeDrawerSystem.system.name}`}>
          <div className="organ-drawer">
            {/* Drawer Header */}
            <div className="organ-drawer__header">
              <div className="organ-drawer__title-group">
                <div className="organ-drawer__icon-badge">
                  {activeDrawerSystem.system.icon}
                </div>
                <div>
                  <h4 className="organ-drawer__title">
                    {activeDrawerSystem.system.name}
                    <span className="organ-drawer__en-badge font-mono">{activeDrawerSystem.system.englishName}</span>
                  </h4>
                  <p className="organ-drawer__desc small muted">{activeDrawerSystem.system.description}</p>
                </div>
              </div>

              <div className="organ-drawer__actions">
                <span className={`badge badge--${activeDrawerSystem.overallSeverity === 'untested' ? 'muted' : activeDrawerSystem.overallSeverity}`}>
                  {activeDrawerSystem.overallStatusText}
                </span>
                <button
                  type="button"
                  className="organ-drawer__close-btn"
                  onClick={() => setSelectedSystemId(null)}
                  aria-label="סגור פירוט מערכת"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Drawer Content Columns */}
            <div className="organ-drawer__body">
              {/* Column 1: Test Results in this System */}
              <div className="organ-drawer__col organ-drawer__col--tests">
                <div className="organ-drawer__section-title">
                  <Activity size={16} className="text-primary" />
                  <h5>בדיקות מעבדה במערכת זו ({activeDrawerSystem.testedCount} מתוך {activeDrawerSystem.totalMarkersCount})</h5>
                </div>

                {activeDrawerSystem.testedMarkers.length === 0 ? (
                  <p className="small muted">לא הוזנו בדיקות עבור מערכת זו בטופס הבדיקה הנוכחי.</p>
                ) : (
                  <div className="organ-drawer__tests-list">
                    {activeDrawerSystem.testedMarkers.map((marker) => (
                      <div
                        key={marker.markerId}
                        className={`organ-test-row organ-test-row--${marker.severity}`}
                        onClick={() => onSelectMarker?.(marker.markerId)}
                      >
                        <div className="organ-test-row__info">
                          <span className="organ-test-row__name font-semibold">{marker.name}</span>
                          <span className="organ-test-row__ref small muted">טווח רפרנס: {marker.reference} {marker.unit}</span>
                          <p className="organ-test-row__msg small">{marker.safeMessage}</p>
                        </div>

                        <div className="organ-test-row__val-box">
                          <span className="organ-test-row__val font-mono">{marker.result} {marker.unit}</span>
                          <span className={`badge badge--${marker.severity} chip-badge`}>
                            {marker.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Column 2: Clinical Significance & Doctor Questions */}
              <div className="organ-drawer__col organ-drawer__col--clinical">
                <div className="organ-drawer__card organ-drawer__card--info">
                  <div className="organ-drawer__card-header">
                    <Info size={16} className="text-primary" />
                    <span className="font-semibold small">משמעות קלינית ותפקוד ביולוגי</span>
                  </div>
                  <p className="small">{activeDrawerSystem.system.clinicalSignificance}</p>
                </div>

                <div className="organ-drawer__card organ-drawer__card--lifestyle">
                  <div className="organ-drawer__card-header">
                    <Zap size={16} className="text-emerald" />
                    <span className="font-semibold small">המלצת אורח חיים ממוקדת</span>
                  </div>
                  <p className="small">{activeDrawerSystem.system.lifestyleTip}</p>
                </div>

                <div className="organ-drawer__card organ-drawer__card--questions">
                  <div className="organ-drawer__card-header">
                    <HelpCircle size={16} className="text-amber" />
                    <span className="font-semibold small">שאלות מומלצות לרופא/ת המשפחה עבור מערכת זו:</span>
                  </div>
                  <ul className="organ-drawer__q-list">
                    {activeDrawerSystem.system.doctorQuestions.map((q, idx) => (
                      <li key={idx} className="small">{q}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default OrganSystemsMap;
