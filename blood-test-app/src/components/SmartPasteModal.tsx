import React, { useState } from 'react';
import { FileText, Sparkles, X, Check, ArrowRight, AlertCircle, Copy } from 'lucide-react';
import { parseRawLabText, ParseLabReportResult } from '../lib/importers/smartLabTextParser';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (values: Record<string, string>, patientName?: string, date?: string) => void;
}

const SAMPLE_CLALIT_TEXT = `תוצאות בדיקות מעבדה - כללית Online
שם המטופל: דנה שחר
תאריך בדיקה: 15/04/2026

GLUCOSE 114 mg/dL
HBA1C 5.9 %
HEMOGLOBIN 10.4 g/dL
FERRITIN 9 ng/mL
IRON 42 mcg/dL
CHOLESTEROL 228 mg/dL
LDL-CHOLESTEROL 152 mg/dL
HDL-CHOLESTEROL 44 mg/dL
TRIGLYCERIDES 190 mg/dL
CREATININE 0.85 mg/dL
WBC 7.2 K/uL
CRP 1.8 mg/L
ALT (GPT) 24 U/L
TSH 2.4 mIU/L
VITAMIN D (25-OH) 18 ng/mL`;

const SAMPLE_MACCABI_TEXT = `מכבי שירותי בריאות - תיק רפואי
נבדק: איתי רוזן
תאריך: 2026-03-10

גלוקוז בצום: 92
המוגלובין: 14.8
כולסטרול כללי: 175
כולסטרול LDL: 95
כולסטרול HDL: 58
טריגליצרידים: 110
קריאטינין: 0.95
כדוריות לבנות (WBC): 6.4
פריטין: 120
ויטמין B12: 450`;

const SmartPasteModal: React.FC<Props> = ({ isOpen, onClose, onImport }) => {
  const [rawText, setRawText] = useState('');
  const [parsed, setParsed] = useState<ParseLabReportResult | null>(null);

  const handleTextChange = (text: string) => {
    setRawText(text);
    if (text.trim().length > 5) {
      setParsed(parseRawLabText(text));
    } else {
      setParsed(null);
    }
  };

  const handleApplySample = (sample: string) => {
    setRawText(sample);
    setParsed(parseRawLabText(sample));
  };

  const handleExecuteImport = () => {
    if (!parsed || parsed.rawCount === 0) return;
    onImport(parsed.extracted, parsed.detectedPatientName, parsed.detectedDate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop no-print" onClick={onClose}>
      <div
        className="modal-content smart-paste-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="סורק טקסט חכם מתוצאות מעבדה"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-wrap">
              <FileText size={22} className="text-primary" />
            </div>
            <div>
              <h3 className="modal-title">ייבוא מהיר מטופס בדיקות (Smart Paste)</h3>
              <p className="modal-subtitle">
                העתק/י את תוצאות המעבדה מאתר קופת החולים (כללית, מכבי, מאוחדת, לאומית) או מ-PDF והדבק/י כאן:
              </p>
            </div>
          </div>
          <button type="button" className="btn--modal-close" onClick={onClose} title="סגור">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Sample preset buttons */}
          <div className="sample-paste-bar">
            <span className="sample-label">דוגמאות מוכנות לבדיקה:</span>
            <button
              type="button"
              className="btn--sample-paste"
              onClick={() => handleApplySample(SAMPLE_CLALIT_TEXT)}
            >
              <Copy size={13} />
              <span>דוגמה מ'כללית Online' (15 מדדים)</span>
            </button>
            <button
              type="button"
              className="btn--sample-paste"
              onClick={() => handleApplySample(SAMPLE_MACCABI_TEXT)}
            >
              <Copy size={13} />
              <span>דוגמה מ'מכבי Online' (10 מדדים)</span>
            </button>
          </div>

          {/* Paste Textarea */}
          <textarea
            className="smart-paste-textarea"
            placeholder="הדבק/י כאן את תוצאות הבדיקה (למשל: GLUCOSE 105, HEMOGLOBIN 11.2, פריטין 8)..."
            value={rawText}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={7}
          />

          {/* Real-time Recognition Preview */}
          {parsed && parsed.rawCount > 0 && (
            <div className="extracted-preview-box">
              <div className="preview-header">
                <div className="preview-title">
                  <Sparkles size={16} className="text-primary" />
                  <span>
                    זוהו בהצלחה <strong>{parsed.rawCount} מדדי מעבדה</strong>
                    {parsed.detectedPatientName && ` עבור ${parsed.detectedPatientName}`}
                    {parsed.detectedDate && ` (${parsed.detectedDate})`}:
                  </span>
                </div>
              </div>

              <div className="extracted-chips-grid">
                {parsed.markersList.map((m) => (
                  <div key={m.key} className="extracted-chip">
                    <span className="chip-name">{m.name.split('(')[0].trim()}</span>
                    <span className="chip-val">
                      {m.value} {m.unit}
                    </span>
                    <Check size={13} className="text-emerald" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {parsed && parsed.rawCount === 0 && rawText.trim().length > 10 && (
            <div className="alert alert--warning">
              <AlertCircle size={16} />
              <span>לא זוהו מדדים מוכרים בטקסט שהודבק. וודא/י שהטקסט מכיל שמות מדדים ומספרים.</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn--secondary" onClick={onClose}>
            ביטול
          </button>
          <button
            type="button"
            className="btn--primary btn--import-action"
            disabled={!parsed || parsed.rawCount === 0}
            onClick={handleExecuteImport}
          >
            <span>ייבא {parsed?.rawCount || 0} מדדים לטופס</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartPasteModal;

