import React, { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  FileJson,
  Printer,
  Share2,
  FileSpreadsheet,
} from 'lucide-react';
import { AnalysisResult } from '../types';
import { copyTextReport, downloadJson, downloadTextReport } from '../lib/export';

interface Props {
  result: AnalysisResult;
  onNavigateToVisitBrief?: () => void;
}

const ExportBar: React.FC<Props> = ({ result, onNavigateToVisitBrief }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyTextReport(result);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div className="export-bar-card no-print">
      <div className="export-bar-card__label">
        <Share2 size={16} />
        <span>פעולות ויצוא:</span>
      </div>

      <div className="export-bar__buttons">
        {onNavigateToVisitBrief && (
          <button
            type="button"
            className="btn--export btn--export-visit-brief"
            onClick={onNavigateToVisitBrief}
            title="מעבר לדף סיכום ביקור מוכן לרופא"
          >
            <FileSpreadsheet size={16} />
            <span>הכנה לרופא (Visit Brief)</span>
          </button>
        )}

        <button
          type="button"
          className="btn--export btn--export-primary"
          onClick={() => window.print()}
          title="הדפסה על דף או שמירה כקובץ PDF"
        >
          <Printer size={16} />
          <span>הדפסה / שמירה כ-PDF</span>
        </button>

        <button
          type="button"
          className="btn--export"
          onClick={handleCopy}
          title="העתקת דוח מלא ללוח"
        >
          {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
          <span>{copied ? 'הועתק ללוח! ✓' : 'העתקת דוח מלא'}</span>
        </button>

        <button
          type="button"
          className="btn--export"
          onClick={() => downloadTextReport(result)}
          title="הורדת הדוח כקובץ טקסט (TXT)"
        >
          <Download size={16} />
          <span>הורדה כקובץ טקסט</span>
        </button>

        <button
          type="button"
          className="btn--export"
          onClick={() => downloadJson(result)}
          title="הורדת הנתונים המובנים כקובץ JSON"
        >
          <FileJson size={16} />
          <span>הורדת JSON</span>
        </button>
      </div>
    </div>
  );
};

export default ExportBar;
