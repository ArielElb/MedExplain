/**
 * MedExplain AI - Organ Systems & Biological Domains
 * Comprehensive mapping of 6 core biological domains to laboratory biomarkers,
 * clinical functions, and client-side deterministic health score evaluation.
 */

import { AnalysisItem } from '../types';

export type OrganSystemId =
  | 'cardiovascular'
  | 'hematology'
  | 'metabolic'
  | 'hepatic'
  | 'renal'
  | 'immunity';

export interface OrganSystem {
  id: OrganSystemId;
  name: string;
  hebrewName: string;
  iconName: string;
  description: string;
  markerIds: string[];
  keyFunctions: string[];
  clinicalFocus: string;
}

export interface OrganSystemStatus {
  system: OrganSystem;
  score: number; // 0-100 (100 is optimal)
  status: 'optimal' | 'attention' | 'warning';
  statusLabel: string;
  badgeClass: string;
  totalMarkers: number;
  testedMarkers: number;
  abnormalMarkers: AnalysisItem[];
  normalMarkers: AnalysisItem[];
  summaryText: string;
}

export const ORGAN_SYSTEMS: OrganSystem[] = [
  {
    id: 'cardiovascular',
    name: 'מערכת הלב, כלי הדם והשומנים (Cardiovascular & Lipids)',
    hebrewName: 'לב וכלי דם',
    iconName: 'Heart',
    description: 'הערכת מאזן שומני הדם (ליפידים), הסיכון לטרשת עורקים ובריאות כלי הדם ושריר הלב.',
    markerIds: ['cholesterol', 'ldl', 'hdl', 'triglycerides'],
    keyFunctions: [
      'הובלת כולסטרול וטריגליצרידים ברקמות הגוף',
      'מניעת שקיעת פלאק טרשתי בדפנות העורקים',
      'שמירה על זרימת דם תקינה למוח וללב',
    ],
    clinicalFocus: 'איזון רמות LDL וטריגליצרידים תוך שמירה על רמות HDL מגנות מפחית משמעותית אירועים קרדיווסקולריים.',
  },
  {
    id: 'hematology',
    name: 'ספירת דם, מאגרי חמצן וברזל (Hematology & Oxygen Delivery)',
    hebrewName: 'דם ומאגרי חמצן',
    iconName: 'Droplet',
    description: 'ייצור כדוריות דם אדומות, מאגרי ברזל זמינים, חמצון הרקמות ותפקוד קרישת הדם הראשוני.',
    markerIds: ['hemoglobin', 'ferritin', 'iron', 'plt', 'platelets'],
    keyFunctions: [
      'נשיאת חמצן מהריאות לכל תאי ואיברי הגוף',
      'שמירה על מאגרי ברזל זמינים בטחול ובכבד',
      'מניעת דימומים ועצירת פציעות באמצעות טסיות דם',
    ],
    clinicalFocus: 'איתור מוקדם של מחסור בברזל, אנמיה ותרומבוציטופניה למניעת עייפות כרונית ופגיעה בחיוניות.',
  },
  {
    id: 'metabolic',
    name: 'משק הסוכר ומטבוליזם אנרגטי (Metabolic & Glycemic Balance)',
    hebrewName: 'סוכר ומטבוליזם',
    iconName: 'Activity',
    description: 'בקרת רמות הגלוקוז בדם, תפקוד הפרשת האינסולין מהלבלב ומניעת תנגודת לאינסולין וסוכרת.',
    markerIds: ['glucose', 'hba1c'],
    keyFunctions: [
      'אספקת אנרגיה זמינה לתאי המוח והשרירים',
      'ויסות רגישות הקולטנים לאינסולין ברקמות',
      'מניעת נזק ארוך טווח לכלי דם קטנים (עיניים, כליות, עצבים)',
    ],
    clinicalFocus: 'שמירה על ערכי גלוקוז ו-HbA1c מיטביים מונעת סיבוכים מיקרו ומקרו-וסקולריים.',
  },
  {
    id: 'hepatic',
    name: 'תפקודי כבד ומערכת העיכול (Hepatic & Digestive System)',
    hebrewName: 'כבד ומערכת העיכול',
    iconName: 'Shield',
    description: 'שלמות תאי הכבד, יכולת סינון ונטרול רעלים, ייצור חלבונים ועיבוד תרופות ומזון.',
    markerIds: ['alt', 'ast'],
    keyFunctions: [
      'סינון ונטרול חומרים זרים, רעלים ותרופות',
      'ייצור חלבוני פלזמה וגורמי קרישה חיוניים',
      'עיבוד שומנים ופחמימות וייצור נוזל המרה',
    ],
    clinicalFocus: 'עלייה באנזימי כבד (ALT/AST) עשויה להצביע על כבד שומני, השפעת תרופות או עומס מטבולי.',
  },
  {
    id: 'renal',
    name: 'תפקודי כליות ומאזן נוזלים ואלקטרוליטים (Renal & Fluid Homeostasis)',
    hebrewName: 'כליות ומאזן נוזלים',
    iconName: 'Filter',
    description: 'סינון חומרי פסולת מהדם, קצב הסינון הכלייתי (eGFR), ויסות לחץ דם ומאזן מלחים חיוניים.',
    markerIds: ['creatinine', 'egfr', 'urea', 'sodium', 'potassium', 'calcium'],
    keyFunctions: [
      'פינוי תוצרי פירוק חנקניים (קריאטינין ואוריאה)',
      'בקרת מאזן המים והאלקטרוליטים (נתרן, אשלגן, סידן)',
      'שמירה על לחץ דם יציב ומאזן חומצה-בסיס',
    ],
    clinicalFocus: 'ניטור מוקדם של קריאטינין ו-eGFR חיוני למניעת פגיעה כלייתית כרונית והתייבשות.',
  },
  {
    id: 'immunity',
    name: 'מערכת החיסון ומדדי דלקת (Immunity & Inflammation)',
    hebrewName: 'חיסון ודלקת',
    iconName: 'Zap',
    description: 'פעילות מערכת החיסון, תגובה לזיהומים חיידקיים וויראליים, וניטור תהליכי דלקת סיסטמיים.',
    markerIds: ['wbc', 'crp', 'esr'],
    keyFunctions: [
      'זיהוי ותקיפת מחוללי מחלה (וירוסים, חיידקים, פטריות)',
      'הפעלת תגובה דלקתית מבוקרת לריפוי רקמות פגועות',
      'כיבוי תהליכי דלקת ומניעת נזק רקמתי עצמי',
    ],
    clinicalFocus: 'שילוב של WBC, CRP ו-ESR מסייע להבחין בין זיהום אקוטי לתהליך דלקתי ממושך.',
  },
];

/**
 * Maps any variant biomarker ID (e.g. 'platelets' vs 'plt') to equivalent recognized IDs.
 */
function normalizeMarkerId(id: string): string {
  if (id === 'platelets') return 'plt';
  if (id === 'b12') return 'vitamin_b12';
  return id;
}

/**
 * Pure client-side evaluator calculating deterministic health status and scores (0-100)
 * for all 6 biological domains based on entered lab tests.
 */
export function evaluateOrganSystems(analysisList: AnalysisItem[]): OrganSystemStatus[] {
  const analysisMap = new Map<string, AnalysisItem>();
  
  analysisList.forEach((item) => {
    analysisMap.set(item.markerId, item);
    // Also record alias if applicable
    const normalized = normalizeMarkerId(item.markerId);
    if (normalized !== item.markerId) {
      analysisMap.set(normalized, item);
    }
  });

  return ORGAN_SYSTEMS.map((system) => {
    const relatedItems: AnalysisItem[] = [];
    const seenIds = new Set<string>();

    system.markerIds.forEach((id) => {
      const item = analysisMap.get(id) || analysisMap.get(normalizeMarkerId(id));
      if (item && !seenIds.has(item.markerId)) {
        seenIds.add(item.markerId);
        relatedItems.push(item);
      }
    });

    const abnormal = relatedItems.filter((i) => i.severity !== 'normal');
    const normal = relatedItems.filter((i) => i.severity === 'normal');

    let score = 100;
    if (relatedItems.length > 0) {
      const penalty = abnormal.reduce((acc, item) => {
        return acc + (item.severity === 'danger' ? 35 : 15);
      }, 0);
      score = Math.max(20, 100 - penalty);
    }

    let status: 'optimal' | 'attention' | 'warning' = 'optimal';
    let statusLabel = 'מאוזן ותקין ✅';
    let badgeClass = 'badge--success';
    let summaryText = 'כל המדדים שנבדקו במערכת זו נמצאים בטווח הנורמה האופטימלי.';

    if (relatedItems.length === 0) {
      status = 'optimal';
      statusLabel = 'לא הוזנו מדדים';
      badgeClass = 'badge--muted';
      summaryText = 'לא הוזנו עדיין בדיקות המשויכות ישירות למערכת זו.';
    } else if (score < 70 || abnormal.some((a) => a.severity === 'danger')) {
      status = 'warning';
      statusLabel = 'דורש התייחסות רפואית ❗';
      badgeClass = 'badge--danger';
      const markerNames = abnormal.map((a) => a.name.split(' ')[0]).join(', ');
      summaryText = `נמצאו חריגות משמעותיות במדדים: ${markerNames}. מומלץ להעלות ממצאים אלו בשיחה עם הרופא/ה.`;
    } else if (score < 90 || abnormal.length > 0) {
      status = 'attention';
      statusLabel = 'לתשומת לב ומעקב ⚠️';
      badgeClass = 'badge--warning';
      const markerNames = abnormal.map((a) => a.name.split(' ')[0]).join(', ');
      summaryText = `נמצאו ערכים גבוליים במדדים: ${markerNames}. כדאי לשקול מעקב תקופתי והתאמות תזונה.`;
    }

    return {
      system,
      score,
      status,
      statusLabel,
      badgeClass,
      totalMarkers: system.markerIds.length,
      testedMarkers: relatedItems.length,
      abnormalMarkers: abnormal,
      normalMarkers: normal,
      summaryText,
    };
  });
}

/**
 * Find organ system definition by its ID.
 */
export function getOrganSystemById(id: OrganSystemId): OrganSystem | undefined {
  return ORGAN_SYSTEMS.find((s) => s.id === id);
}

/**
 * Find which organ system a given biomarker belongs to.
 */
export function getOrganSystemForMarker(markerId: string): OrganSystem | undefined {
  const norm = normalizeMarkerId(markerId);
  return ORGAN_SYSTEMS.find(
    (s) => s.markerIds.includes(markerId) || s.markerIds.includes(norm)
  );
}

export default ORGAN_SYSTEMS;
