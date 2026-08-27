import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardPaste,
  Sparkles,
  X,
  Check,
  Trash2,
  FileText,
  AlertCircle,
  Building2,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { BIOMARKERS_BY_ID } from '../data/biomarkers';
import { PatientContext } from '../types';

export interface SmartPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (
    values: Record<string, string>,
    patient?: Partial<PatientContext>
  ) => void;
}

interface ParsedMarkerItem {
  markerId: string;
  name: string;
  unit: string;
  value: string;
  originalText?: string;
  severity: 'normal' | 'warning' | 'danger';
  statusText: string;
}

interface ParsedResult {
  markers: Record<string, string>;
  items: ParsedMarkerItem[];
  patient: Partial<PatientContext>;
  rawCount: number;
}

// Comprehensive aliases mapping for Israeli HMO lab formats (Hebrew & English)
const ALIAS_RULES: Array<{
  markerId: string;
  patterns: RegExp[];
}> = [
  {
    markerId: 'glucose',
    patterns: [
      /\b(?:glucose|glu|sugar)\b/i,
      /גלוקוז(?:[\s\-]+בצום|[\s\-]+בדם|\s*\(?B\)?)?/i,
      /סוכר(?:[\s\-]+בצום|[\s\-]+בדם)?/i,
    ],
  },
  {
    markerId: 'hba1c',
    patterns: [
      /\b(?:hba1c|hb-a1c|hb\s*a1c|a1c|glycated\s*hemoglobin|hemoglobin\s*a1c)\b/i,
      /המוגלובין[\s\-]+a1c/i,
      /המוגלובין[\s\-]+מסוכרר/i,
    ],
  },
  {
    markerId: 'ldl',
    patterns: [
      /\b(?:ldl|ldl-c|ldl-cholesterol|cholesterol-ldl|ldl\s*calc)\b/i,
      /כולסטרול[\s\-]+ldl/i,
      /כולסטרול[\s\-]+רע/i,
      /ldl[\s\-]+כולסטרול/i,
    ],
  },
  {
    markerId: 'hdl',
    patterns: [
      /\b(?:hdl|hdl-c|hdl-cholesterol|cholesterol-hdl|hdl-cholest)\b/i,
      /כולסטרול[\s\-]+hdl/i,
      /כולסטרול[\s\-]+טוב/i,
      /hdl[\s\-]+כולסטרול/i,
    ],
  },
  {
    markerId: 'triglycerides',
    patterns: [
      /\b(?:triglycerides|triglyceride|trig|trigs)\b/i,
      /טריגליצרידים/i,
      /טריגליצריד/i,
    ],
  },
  {
    markerId: 'hemoglobin',
    patterns: [
      /\b(?:hemoglobin|hgb|hb)\b(?!\s*a1c)/i,
      /המוגלובין(?!\s*מסוכרר|\s*a1c)/i,
    ],
  },
  {
    markerId: 'wbc',
    patterns: [
      /\b(?:wbc|leukocytes|white\s*blood\s*cells)\b/i,
      /כדוריות\s*דם\s*לבנות/i,
      /לויקוציטים/i,
    ],
  },
  {
    markerId: 'platelets',
    patterns: [
      /\b(?:platelets|plt|thrombocytes)\b/i,
      /טסיות(?:\s*דם)?/i,
      /תרומבוציטים/i,
    ],
  },
  {
    markerId: 'ferritin',
    patterns: [
      /\b(?:ferritin|feritin)\b/i,
      /פריטין/i,
    ],
  },
  {
    markerId: 'b12',
    patterns: [
      /\b(?:vitamin\s*b12|vit\s*b12|vit-b12|b12|b-12|cobalamin)\b/i,
      /ויטמין\s*b12/i,
      /ויטמין\s*בי\s*12/i,
      /ויטמין\s*b-12/i,
    ],
  },
  {
    markerId: 'vitamin_d',
    patterns: [
      /\b(?:vitamin\s*d|vit\s*d|vit-d|25-oh-d|25-hydroxyvitamin\s*d|vitamin\s*d\s*\(25-oh\))\b/i,
      /ויטמין\s*d\b/i,
      /ויטמין\s*די\b/i,
    ],
  },
  {
    markerId: 'crp',
    patterns: [
      /\b(?:crp|c-reactive\s*protein|c\s*reactive\s*protein)\b/i,
      /חלבון\s*מגיב\s*c/i,
      /סי\s*אר\s*פי/i,
    ],
  },
  {
    markerId: 'creatinine',
    patterns: [
      /\b(?:creatinine|creat|crea)\b/i,
      /קריאטינין/i,
      /קראטינין/i,
    ],
  },
  {
    markerId: 'alt',
    patterns: [
      /\b(?:alt|sgpt|alt\s*\(gpt\)|alt\s*\(sgpt\)|gpt|alanine\s*aminotransferase)\b/i,
      /אלנין\s*אמינוטרנספראז/i,
      /טרנסאמינאז/i,
    ],
  },
  {
    markerId: 'tsh',
    patterns: [
      /\b(?:tsh|thyrotropin|thyroid\s*stimulating\s*hormone)\b/i,
      /הורמון\s*בלוטת\s*התריס/i,
      /בלוטת\s*התריס/i,
    ],
  },
];

const SAMPLE_TEXTS = {
  clalit: `קופת חולים כללית - גיליון תוצאות מעבדה
תאריך דגימה: 14/06/2026
שם המטופל/ת: יעל כהן | גיל: 38 | מין: נקבה

בדיקות ביוכימיה והמטולוגיה:
GLUCOSE 108 mg/dL (70 - 100) *חורג*
HbA1C (%) 5.8 % (4.0 - 5.7) *גבולי*
CHOLESTEROL-LDL calc 134.0 mg/dL (60 - 130) *חורג*
HDL-CHOLEST. 44 mg/dL (40 - 80)
TRIGLYCERIDES 180 mg/dL (10 - 150)
HEMOGLOBIN 11.2 g/dL (12.0 - 16.0) *נמוך*
WBC 6.8 K/uL (4.5 - 11.0)
PLT 285 K/uL (150 - 450)
FERRITIN 12 ng/mL (30 - 300) *נמוך*
VITAMIN B12 240 pg/mL (200 - 900)
VITAMIN D (25-OH) 22 ng/mL (30 - 100) *גבולי*
C-REACTIVE PROTEIN 1.8 mg/L (0.0 - 5.0)
CREATININE 0.88 mg/dL (0.60 - 1.20)
ALT (GPT) 32 U/L (0 - 50)
TSH 2.45 mIU/L (0.35 - 4.20)`,

  maccabi: `מכבי שירותי בריאות - גיליון תוצאות בדיקות דם
שם: דוד לוי | גיל: 52 | מין: זכר

גלוקוז (דם) | Glucose (B) | 114 mg/dL | 70-100
המוגלובין A1c | 6.2 % | 4.0-5.7
כולסטרול LDL | 148 mg/dL | 0-100
כולסטרול HDL | 38 mg/dL | 40-80
טריגליצרידים | 225 mg/dL | 0-150
המוגלובין | 14.6 g/dL | 13.5-17.5
לויקוציטים (WBC) | 7.9 10^3/micl | 4.5-11.0
טסיות (PLT) | 240 10^3/micl | 150-450
פריטין | 65 ng/ml | 20-250
ויטמין B12 | 340 pg/ml | 200-900
ויטמין D | 28 ng/ml | 30-100
CRP | 3.2 mg/L | 0.0-5.0
קראטינין | 1.05 mg/dl | 0.60-1.20
ALT (SGPT) | 58 U/L | 5-45
TSH | 3.10 mIU/L | 0.40-4.00`,

  meuhedet: `קופת חולים מאוחדת / לאומית - תוצאות בדיקות מעבדה
שם המטופלת: רונית אלון, גיל: 29, מין: נקבה

בדיקה: Hemoglobin, תוצאה: 10.1 g/dL, טווח: 12.0 - 16.0
בדיקה: Ferritin, תוצאה: 7 ng/mL, טווח: 15 - 150
בדיקה: Vitamin B12, תוצאה: 185 pg/mL, טווח: 200 - 900
בדיקה: Vitamin D, תוצאה: 16 ng/mL, טווח: 30 - 100
בדיקה: WBC, תוצאה: 5.6 K/uL, טווח: 4.5 - 11.0
בדיקה: Platelets, תוצאה: 310 K/uL, טווח: 150 - 450
בדיקה: Glucose, תוצאה: 86 mg/dL, טווח: 70 - 99
בדיקה: HbA1c, תוצאה: 5.1 %, טווח: 4.0 - 5.6
בדיקה: LDL Cholesterol, תוצאה: 92 mg/dL, טווח: 0 - 100
בדיקה: HDL Cholesterol, תוצאה: 56 mg/dL, טווח: 40 - 80
בדיקה: Triglycerides, תוצאה: 85 mg/dL, טווח: 0 - 150
בדיקה: Creatinine, תוצאה: 0.72 mg/dL, טווח: 0.50 - 1.00
בדיקה: ALT (GPT), תוצאה: 19 U/L, טווח: 0 - 35
בדיקה: TSH, תוצאה: 1.95 mIU/L, טווח: 0.40 - 4.00
בדיקה: CRP, תוצאה: 0.9 mg/L, טווח: 0.0 - 5.0`,
};

function parseLabText(rawText: string, defaultSex: 'male' | 'female' = 'female'): ParsedResult {
  const result: ParsedResult = {
    markers: {},
    items: [],
    patient: {},
    rawCount: 0,
  };

  if (!rawText || !rawText.trim()) return result;

  // 1. Extract Patient Demographics
  const nameMatch = rawText.match(/(?:שם(?:\s*המטופל(?:\/ת)?)?|Patient|Name)\s*[:|]\s*([^\r\n,|–-]+)/i);
  if (nameMatch && nameMatch[1]) {
    const trimmed = nameMatch[1].trim();
    if (trimmed.length > 1 && !trimmed.includes('תאריך') && !trimmed.includes('קופת')) {
      result.patient.name = trimmed;
    }
  }

  const ageMatch = rawText.match(/(?:גיל|Age)\s*[:|]\s*(\d{1,3})/i);
  if (ageMatch && ageMatch[1]) {
    const ageNum = parseInt(ageMatch[1], 10);
    if (ageNum > 0 && ageNum <= 120) {
      result.patient.age = ageNum;
    }
  }

  const sexMatch = rawText.match(/(?:מין|Gender|Sex)\s*[:|]\s*(נקבה|אישה|נשים|זכר|גבר|גברים|female|male|f|m)\b/i);
  if (sexMatch && sexMatch[1]) {
    const sexVal = sexMatch[1].toLowerCase();
    if (['זכר', 'גבר', 'גברים', 'male', 'm'].includes(sexVal)) {
      result.patient.sex = 'male';
    } else {
      result.patient.sex = 'female';
    }
  }

  const currentSex = result.patient.sex || defaultSex;

  // 2. Parse lines for biomarkers
  const lines = rawText.split(/[\r\n]+/);

  ALIAS_RULES.forEach((rule) => {
    const marker = BIOMARKERS_BY_ID[rule.markerId];
    if (!marker) return;

    for (const line of lines) {
      // Check if line contains any alias
      const matchesRule = rule.patterns.some((pattern) => pattern.test(line));
      if (!matchesRule) continue;

      // Mask reference ranges like (70-100) or 70 - 100 or טווח: 70-100
      const cleanLine = line
        .replace(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/g, ' REF_RANGE ')
        .replace(/טווח\s*[:|]?\s*[\d\.\s\-–]+/g, ' REF_RANGE ')
        .replace(/\([\d\.\s\-–]+\)/g, ' REF_RANGE ');

      // Find all remaining numeric tokens
      const numberMatches = cleanLine.match(/(?:^|[^\w.])(\d+(?:\.\d+)?)(?:[^\w.]|$)/g);
      if (numberMatches) {
        const numbers = numberMatches
          .map((m) => {
            const numStr = m.replace(/[^\d.]/g, '');
            return parseFloat(numStr);
          })
          .filter((n) => !isNaN(n) && Number.isFinite(n));

        // Filter numbers within valid physiological boundaries for this marker
        const validNumber = numbers.find((n) => n >= marker.min && n <= marker.max);

        if (validNumber !== undefined && result.markers[rule.markerId] === undefined) {
          const valStr = String(validNumber);
          result.markers[rule.markerId] = valStr;

          const evaluation = marker.evaluate(validNumber, currentSex);
          result.items.push({
            markerId: marker.markerId,
            name: marker.name,
            unit: marker.unit,
            value: valStr,
            originalText: line.trim(),
            severity: evaluation.severity,
            statusText: evaluation.status,
          });
          break; // Found marker for this rule
        }
      }
    }
  });

  result.rawCount = Object.keys(result.markers).length;
  return result;
}

export const SmartPasteModal: React.FC<SmartPasteModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [rawText, setRawText] = useState('');
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Parse text in real-time
  const parsed = useMemo(() => parseLabText(rawText), [rawText]);

  // Sync editedValues when parsed markers change
  useEffect(() => {
    setEditedValues(parsed.markers);
  }, [parsed.markers]);

  const handleValueChange = (markerId: string, val: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [markerId]: val,
    }));
  };

  const handleRemoveMarker = (markerId: string) => {
    setEditedValues((prev) => {
      const next = { ...prev };
      delete next[markerId];
      return next;
    });
  };

  const handleLoadSample = (key: keyof typeof SAMPLE_TEXTS) => {
    setRawText(SAMPLE_TEXTS[key]);
  };

  const handleClear = () => {
    setRawText('');
    setEditedValues({});
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRawText(text);
      }
    } catch {
      // Fallback
    }
  };

  const handleConfirmImport = () => {
    const finalValues: Record<string, string> = {};
    Object.entries(editedValues).forEach(([k, v]) => {
      if (v.trim() !== '') {
        finalValues[k] = v.trim();
      }
    });

    onImport(finalValues, parsed.patient);
    onClose();
  };

  if (!isOpen) return null;

  const validMarkersCount = Object.keys(editedValues).filter(
    (k) => editedValues[k] && editedValues[k].trim() !== ''
  ).length;

  return (
    <div
      className="smart-paste-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="smart-paste-title"
    >
      <div className="smart-paste-modal">
        {/* Modal Header */}
        <div className="smart-paste-header">
          <div className="smart-paste-title-group">
            <div className="smart-paste-icon-badge">
              <ClipboardPaste size={22} />
            </div>
            <div>
              <h3 id="smart-paste-title" className="smart-paste-title">
                ייבוא והדבקה מהירה מתוצאות מעבדה
              </h3>
              <p className="smart-paste-subtitle">
                הדביקו טקסט גולמי שהועתק מאתר קופת החולים שלכם (כללית, מכבי, מאוחדת, לאומית) — המערכת תזהה את המדדים אוטומטית!
              </p>
            </div>
          </div>
          <button
            type="button"
            className="smart-paste-close-btn"
            onClick={onClose}
            aria-label="סגור חלון"
          >
            <X size={20} />
          </button>
        </div>

        {/* HMO Sample Buttons */}
        <div className="smart-paste-samples-bar">
          <span className="smart-paste-samples-label">
            <Building2 size={15} />
            <strong>טעינת טקסט דוגמה לבדיקה:</strong>
          </span>
          <div className="smart-paste-samples-buttons">
            <button
              type="button"
              className="smart-paste-sample-btn sample-btn--clalit"
              onClick={() => handleLoadSample('clalit')}
            >
              דוגמה מכללית 🟢
            </button>
            <button
              type="button"
              className="smart-paste-sample-btn sample-btn--maccabi"
              onClick={() => handleLoadSample('maccabi')}
            >
              דוגמה ממכבי 🔵
            </button>
            <button
              type="button"
              className="smart-paste-sample-btn sample-btn--meuhedet"
              onClick={() => handleLoadSample('meuhedet')}
            >
              דוגמה ממאוחדת / לאומית 🟠
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="smart-paste-body">
          {/* Left / Top: Large Textarea */}
          <div className="smart-paste-input-col">
            <div className="smart-paste-textarea-header">
              <label htmlFor="raw-lab-textarea" className="form-label font-semibold">
                <FileText size={15} /> הדבקת טקסט הבדיקה:
              </label>
              <div className="smart-paste-textarea-actions">
                <button
                  type="button"
                  className="btn--ghost btn--small"
                  onClick={handlePasteFromClipboard}
                  title="הדבק ישירות מלוח הגזירים"
                >
                  <ClipboardPaste size={14} />
                  <span>הדבק מלוח הגזירים</span>
                </button>
                {rawText && (
                  <button
                    type="button"
                    className="btn--ghost btn--small text-muted"
                    onClick={handleClear}
                    title="נקה טקסט"
                  >
                    <RefreshCw size={13} />
                    <span>נקה הכל</span>
                  </button>
                )}
              </div>
            </div>

            <textarea
              id="raw-lab-textarea"
              className="smart-paste-textarea"
              placeholder={`הדביקו כאן את תוצאות המעבדה... לדוגמה:
GLUCOSE 105 mg/dL (70 - 100)
CHOLESTEROL-LDL 138 mg/dL
המוגלובין 12.4
פריטין 18 ng/mL...`}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={9}
              autoFocus
            />

            {/* Detected Patient Metadata Badge */}
            {(parsed.patient.name || parsed.patient.age || parsed.patient.sex) && (
              <div className="smart-paste-patient-badge">
                <span className="font-semibold text-primary">פרטי מטופל/ת שזוהו:</span>
                {parsed.patient.name && <span className="badge badge--pill">שם: {parsed.patient.name}</span>}
                {parsed.patient.age && <span className="badge badge--pill">גיל: {parsed.patient.age}</span>}
                {parsed.patient.sex && (
                  <span className="badge badge--pill">
                    מין: {parsed.patient.sex === 'male' ? 'זכר' : 'נקבה'}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right / Bottom: Real-Time Preview Cards */}
          <div className="smart-paste-preview-col">
            <div className="smart-paste-preview-header">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <span className="font-semibold">מדדים שזוהו בזמן אמת:</span>
              </div>
              <span
                className={`badge ${
                  validMarkersCount > 0 ? 'badge--primary-filled' : 'badge--muted'
                }`}
              >
                {validMarkersCount} מדדים זוהו
              </span>
            </div>

            {validMarkersCount === 0 ? (
              <div className="smart-paste-empty-preview">
                <HelpCircle size={32} className="text-muted" />
                <p className="font-semibold">טרם זוהו מדדים</p>
                <p className="small muted">
                  הדביקו טקסט בתיבה מימין או לחצו על אחת מדוגמאות קופות החולים למעלה.
                </p>
              </div>
            ) : (
              <div className="smart-paste-items-list">
                {Object.entries(editedValues).map(([markerId, val]) => {
                  const marker = BIOMARKERS_BY_ID[markerId];
                  if (!marker) return null;

                  const num = parseFloat(val);
                  const evalResult = !isNaN(num)
                    ? marker.evaluate(num, parsed.patient.sex || 'female')
                    : null;

                  return (
                    <div key={markerId} className="smart-paste-item-card">
                      <div className="smart-paste-item-info">
                        <span className="smart-paste-item-name">{marker.name}</span>
                        <div className="smart-paste-item-meta">
                          <span className="small muted">יחידות: {marker.unit}</span>
                          {evalResult && (
                            <span className={`badge badge--${evalResult.severity} chip-badge`}>
                              {evalResult.status}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="smart-paste-item-actions">
                        <input
                          type="number"
                          step={marker.step || 'any'}
                          className="smart-paste-val-input"
                          value={val}
                          onChange={(e) => handleValueChange(markerId, e.target.value)}
                          aria-label={`ערך עבור ${marker.name}`}
                        />
                        <button
                          type="button"
                          className="smart-paste-item-del-btn"
                          onClick={() => handleRemoveMarker(markerId)}
                          title="הסר מדד זה מהייבוא"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="smart-paste-footer">
          <div className="smart-paste-footer-info">
            <AlertCircle size={15} className="text-muted" />
            <span className="small muted">
              כל החישובים מתבצעים מקומית בדפדפן בלבד ללא העברת מידע רפואי לרשת.
            </span>
          </div>

          <div className="smart-paste-footer-buttons">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
            >
              ביטול
            </button>
            <button
              type="button"
              className="btn btn--primary smart-paste-submit-btn"
              disabled={validMarkersCount === 0}
              onClick={handleConfirmImport}
            >
              <Check size={17} />
              <span>
                ייבא את {validMarkersCount > 0 ? `${validMarkersCount} המדדים` : 'המדדים'} שנמצאו
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartPasteModal;
