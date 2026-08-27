export interface ExtractedMarker {
  key: string;
  name: string;
  value: string;
  unit: string;
  originalText: string;
}

export interface ParseLabReportResult {
  extracted: Record<string, string>;
  markersList: ExtractedMarker[];
  rawCount: number;
  detectedPatientName?: string;
  detectedDate?: string;
  unmatchedLines: string[];
}

interface MatcherDef {
  key: string;
  name: string;
  unit: string;
  patterns: RegExp[];
}

export const LAB_MATCHERS: MatcherDef[] = [
  {
    key: 'glucose',
    name: 'גלוקוז בצום (Glucose)',
    unit: 'mg/dL',
    patterns: [
      /(?:glucose|glu|גלוקוז|סוכר\s*בצום|גלוקוזה|glucose\s*in\s*serum)[\s:=_-]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*(?:mg\/dL)?\s*(?:glucose|glu|גלוקוז)/i,
    ],
  },
  {
    key: 'hba1c',
    name: 'המוגלובין מסוכרר (HbA1c)',
    unit: '%',
    patterns: [
      /(?:hba1c|hb\s*a1c|a1c|המוגלובין\s*a1c|המוגלובין\s*מסוכרר|glycated\s*hb)[\s:=_%-]+([0-9]+(?:\.[0-9]+)?)/i,
    ],
  },
  {
    key: 'hemoglobin',
    name: 'המוגלובין (Hemoglobin)',
    unit: 'g/dL',
    patterns: [
      /(?:hemoglobin|hgb|hb|המוגלובין)[\s:=_-]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*(?:g\/dL)?\s*(?:hgb|hemoglobin|המוגלובין)/i,
    ],
  },
  {
    key: 'ferritin',
    name: 'פריטין (Ferritin)',
    unit: 'ng/mL',
    patterns: [
      /(?:ferritin|פריטין)[\s:=_-]+([0-9]+(?:\.[0-9]+)?)/i,
    ],
  },
  {
    key: 'iron',
    name: 'ברזל בסרום (Iron)',
    unit: 'mcg/dL',
    patterns: [
      /(?:iron|fe|ברזל(?:\s*בסרום)?)[\s:=_-]+([0-9]+(?:\.[0-9]+)?)/i,
    ],
  },
  {
    key: 'plt',
    name: 'טסיות דם (Platelets)',
    unit: 'K/uL',
    patterns: [
      /(?:platelets|plt|טסיות(?:\s*דם)?)[\s:=_-]+([0-9]+(?:\.[0-9]+)?)/i,
    ],
  },
  {
    key: 'wbc',
    name: 'כדוריות דם לבנות (WBC)',
    unit: 'K/uL',
    patterns: [
      /(?:wbc|leukocytes|לויקוציטים|כדוריות\s*לבנות|תאי\s*דם\s*לבנים)[\s:=_-]+([0-9]+(?:\.[0-9]+)?)/i,
    ],
  },
  {
    key: 'crp',
    name: 'מדד דלקת CRP',
    unit: 'mg/L',
    patterns: [
      /(?:crp|c-reactive\s*protein|חלבון\s*c\s*תגובתי|חלבון\s*תגובתי\s*c)[\s:=_-]+([0-9]+(?:\.[0-9]+)?)/i,
    ],
  },
  {
    key: 'cholesterol',
    name: 'כולסטרול כללי (Cholesterol)',
    unit: 'mg/dL',
    patterns: [
      /(?:total\s*cholesterol|cholesterol|chol|כולסטרול(?:\s*כללי)?)[\s:=_-]+([0-9]+(?:\.[0-9]+)?)/i,
    ],
  },
  {
    key: 'ldl',
    name: 'כולסטרול LDL',
    unit: 'mg/dL',
    patterns: [
      /(?:ldl-c|ldl\s*cholesterol|ldl|כולסטרול\s*ldl|כולסטרול\s*רע)[\s:=_-]+([0-9]+(?:\.[0-9]+)?)/i,
    ],
  },
  {
    key: 'hdl',
    name: 'כולסטרול HDL',
    unit: 'mg/dL',
    patterns: [
      /(?:hdl-c|hdl\s*cholesterol|hdl|כולסטרול\s*hdl|כולסטרול\s*טוב)[\s:=_-]+([0-9]+(?:\.[0-9]+)?)/i,
    ],
  },
  {
    key: 'triglycerides',
    name: 'טריגליצרידים (Triglycerides)',
    unit: 'mg/dL',
    patterns: [
      /(?:triglycerides|trig|טריגליצרידים)[\s:=_-]+([0-9]+(?:\.[0-9]+)?)/i,
    ],
  },
  {
    key: 'creatinine',
    name: 'קריאטינין (Creatinine)',
    unit: 'mg/dL',
    patterns: [
      /(?:creatinine|crea|קריאטינין)[\s:=_-]+([0-9]+(?:\.[0-9]+)?)/i,
    ],
  },
  {
    key: 'egfr',
    name: 'קצב סינון כלייתי (eGFR)',
    unit: 'mL/min',
    patterns: [
      /(?:egfr|gfr|סינון\s*כלייתי)[\s:=_-]+([0-9]+(?:\.[0-9]+)?)/i,
    ],
  },
  {
    key: 'alt',
    name: 'אנזימי כבד ALT / GPT',
    unit: 'U/L',
    patterns: [
      /(?:alt|gpt|sgpt|אלט|אלנין\s*אמינוטרנספראז)[\s:=_-]+([0-9]+(?:\.[0-9]+)?)/i,
    ],
  },
  {
    key: 'ast',
    name: 'אנזימי כבד AST / GOT',
    unit: 'U/L',
    patterns: [
      /(?:ast|got|sgot|אסט)[\s:=_-]+([0-9]+(?:\.[0-9]+)?)/i,
    ],
  },
  {
    key: 'tsh',
    name: 'בלוטת התריס (TSH)',
    unit: 'mIU/L',
    patterns: [
      /(?:tsh|thyrotropin|בלוטת\s*התריס|תירואיד)[\s:=_-]+([0-9]+(?:\.[0-9]+)?)/i,
    ],
  },
  {
    key: 'vitamin_d',
    name: 'ויטמין D (25-OH)',
    unit: 'ng/mL',
    patterns: [
      /(?:vitamin\s*d|vit\s*d|25-oh-vit-d|ויטמין\s*d|ויטמין\s*די)[\s:=_-]+([0-9]+(?:\.[0-9]+)?)/i,
    ],
  },
  {
    key: 'vitamin_b12',
    name: 'ויטמין B12',
    unit: 'pg/mL',
    patterns: [
      /(?:vitamin\s*b12|vit\s*b12|b12|ויטמין\s*b12|בי\s*12)[\s:=_-]+([0-9]+(?:\.[0-9]+)?)/i,
    ],
  },
];

/**
 * Parses raw text copied from Clalit, Maccabi, Meuhedet, Leumit, or lab PDFs.
 */
export function parseRawLabText(rawText: string): ParseLabReportResult {
  const extracted: Record<string, string> = {};
  const markersList: ExtractedMarker[] = [];
  const unmatchedLines: string[] = [];

  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  let detectedPatientName: string | undefined;
  let detectedDate: string | undefined;

  for (const line of lines) {
    // Detect Patient Name (e.g. שם המטופל: דנה שחר / Patient: John Doe)
    const nameMatch = line.match(/(?:שם(?:\s*המטופל|\s*נבדק)?|patient(?:\s*name)?):\s*([א-תa-zA-Z\s]{2,30})/i);
    if (nameMatch && !detectedPatientName) {
      detectedPatientName = nameMatch[1].trim();
    }

    // Detect Date (e.g. תאריך בדיקה: 15/04/2026 or 2026-04-15)
    const dateMatch = line.match(/(?:תאריך(?:\s*בדיקה)?|date):\s*([0-9]{1,4}[/.-][0-9]{1,2}[/.-][0-9]{1,4})/i);
    if (dateMatch && !detectedDate) {
      detectedDate = dateMatch[1].trim();
    }

    let matched = false;

    for (const matcher of LAB_MATCHERS) {
      if (extracted[matcher.key]) continue; // already found

      for (const pattern of matcher.patterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          const valNum = parseFloat(match[1]);
          if (!isNaN(valNum)) {
            extracted[matcher.key] = String(valNum);
            markersList.push({
              key: matcher.key,
              name: matcher.name,
              value: String(valNum),
              unit: matcher.unit,
              originalText: line,
            });
            matched = true;
            break;
          }
        }
      }
      if (matched) break;
    }

    if (!matched && line.length > 3) {
      unmatchedLines.push(line);
    }
  }

  return {
    extracted,
    markersList,
    rawCount: Object.keys(extracted).length,
    detectedPatientName,
    detectedDate,
    unmatchedLines,
  };
}

