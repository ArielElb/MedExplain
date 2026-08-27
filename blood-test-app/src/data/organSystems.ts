import { AnalysisItem } from '../types';

export interface OrganSystem {
  id: string;
  name: string;
  iconName: string;
  description: string;
  markerIds: string[];
  keyFunctions: string[];
}

export interface OrganSystemStatus {
  system: OrganSystem;
  score: number; // 0-100 (100 is optimal)
  status: 'optimal' | 'attention' | 'warning';
  statusLabel: string;
  totalMarkers: number;
  testedMarkers: number;
  abnormalMarkers: AnalysisItem[];
  normalMarkers: AnalysisItem[];
}

export const ORGAN_SYSTEMS: OrganSystem[] = [
  {
    id: 'cardiovascular',
    name: 'מערכת הלב וכלי הדם (Cardiovascular & Lipids)',
    iconName: 'Heart',
    description: 'איזון שומני הדם, מניעת טרשת עורקים ובריאות כלי הדם.',
    markerIds: ['cholesterol', 'ldl', 'hdl', 'triglycerides'],
    keyFunctions: ['הובלת כולסטרול ברקמות', 'מניעת הצטברות פלאק בעורקים', 'אספקת דם תקינה לשריר הלב'],
  },
  {
    id: 'hematology',
    name: 'ספירת דם ומאגרי חמצן (Hematology & Iron)',
    iconName: 'Droplet',
    description: 'ייצור כדוריות דם אדומות, מאגרי ברזל ואספקת חמצן לרקמות.',
    markerIds: ['hemoglobin', 'ferritin', 'iron', 'plt'],
    keyFunctions: ['הובלת חמצן לתאים', 'מניעת עייפות ואנמיה', 'קרישת דם תקינה על ידי טסיות'],
  },
  {
    id: 'metabolic',
    name: 'סוכר ומטבוליזם אנרגטי (Metabolic & Glucose)',
    iconName: 'Activity',
    description: 'ויסות רמות הגלוקוז, תפקוד האינסולין ואיזון אנרגטי תאי.',
    markerIds: ['glucose', 'hba1c'],
    keyFunctions: ['הפקת אנרגיה מתזונה', 'רגישות תאים לאינסולין', 'שמירה על כלי דם קטנים ועצבים'],
  },
  {
    id: 'hepatic',
    name: 'תפקודי כבד ומערכת העיכול (Hepatic System)',
    iconName: 'Shield',
    description: 'ניקוי רעלים, ייצור חלבונים ועיבוד שומנים ותרופות.',
    markerIds: ['alt', 'ast'],
    keyFunctions: ['סינון ונטרול רעלים', 'ייצור גורמי קרישה וחלבונים', 'עיבוד תרופות ומזון'],
  },
  {
    id: 'renal',
    name: 'תפקודי כליות ומאזן נוזלים (Renal Function)',
    iconName: 'Filter',
    description: 'סינון חומרי פסולת מהדם ושמירה על מאזן נוזלים ומלחים.',
    markerIds: ['creatinine', 'egfr'],
    keyFunctions: ['פינוי תוצרי פירוק שרירי', 'ויסות לחץ דם ומאזן מים', 'שמירה על רמות אלקטרוליטים'],
  },
  {
    id: 'immunity',
    name: 'מערכת החיסון ומדדי דלקת (Immunity & Inflammation)',
    iconName: 'Zap',
    description: 'הגנה מפני זיהומים וויסות תהליכי דלקת בגוף.',
    markerIds: ['wbc', 'crp'],
    keyFunctions: ['זיהוי ונטרול מחוללי מחלה', 'תגובה חיסונית מהירה', 'בקרת דלקת כרונית'],
  },
];

export function evaluateOrganSystems(analysisList: AnalysisItem[]): OrganSystemStatus[] {
  const analysisMap = new Map<string, AnalysisItem>();
  analysisList.forEach((item) => {
    analysisMap.set(item.markerId, item);
  });

  return ORGAN_SYSTEMS.map((system) => {
    const relatedItems: AnalysisItem[] = [];
    system.markerIds.forEach((id) => {
      const item = analysisMap.get(id);
      if (item) relatedItems.push(item);
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

    if (score < 60 || abnormal.some((i) => i.severity === 'danger')) {
      status = 'warning';
      statusLabel = 'דורש בירור רפואי ⚠️';
    } else if (score < 90 || abnormal.length > 0) {
      status = 'attention';
      statusLabel = 'תשומת לב קלה 🔍';
    }

    return {
      system,
      score,
      status,
      statusLabel,
      totalMarkers: system.markerIds.length,
      testedMarkers: relatedItems.length,
      abnormalMarkers: abnormal,
      normalMarkers: normal,
    };
  });
}

