import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  CheckSquare,
  Square,
  User,
  Calendar,
  Layers,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  Edit2,
} from 'lucide-react';
import { AnalysisResult, NavigationPage } from '../types';
import { generateVisitBrief } from '../lib/visitBriefGenerator';

interface Props {
  result: AnalysisResult | null;
  onNavigate: (page: NavigationPage) => void;
}

const VisitBriefPage: React.FC<Props> = ({ result, onNavigate }) => {
  const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>({});
  const [checkedChecklist, setCheckedChecklist] = useState<Record<number, boolean>>({});
  const [doctorNotes, setDoctorNotes] = useState<string>('');

  const brief = useMemo(() => {
    if (!result) return null;
    return generateVisitBrief(result);
  }, [result]);

  const toggleQuestionCheck = (index: number) => {
    setCheckedQuestions((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleChecklist = (index: number) => {
    setCheckedChecklist((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (!result || !brief) {
    return (
      <div className="visit-brief-empty card text-center p-8">
        <div className="empty-icon-wrap">
          <FileSpreadsheet size={48} className="text-primary" />
        </div>
        <h2>טרם פוענחו תוצאות בדיקות דם</h2>
        <p className="muted max-w-lg mx-auto mb-6">
          כדי להפיק דף "הכנה לרופא" (Visit Brief), הזינו תחילה את ערכי הבדיקה בטופס או בחרו באחת מ-12 הדוגמאות הקליניות.
        </p>
        <div className="empty-actions">
          <button
            type="button"
            className="btn--submit"
            onClick={() => onNavigate('results')}
          >
            <span>מעבר להזנת נתונים</span>
          </button>
          <button
            type="button"
            className="btn--ghost"
            onClick={() => onNavigate('scenarios')}
          >
            <span>בחירת מטופל/ת לדוגמה</span>
          </button>
        </div>
      </div>
    );
  }

  const patientName = brief.patient.name || 'מטופל/ת';
  const formattedDate = new Date(brief.generatedAt).toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="visit-brief-page">
      {/* Top Toolbar (Hidden on Print) */}
      <div className="visit-brief-toolbar no-print">
        <div className="visit-brief-toolbar__title">
          <FileSpreadsheet size={22} className="text-primary" />
          <div>
            <h2>דף הכנה לרופא/ת המשפחה (Visit Brief)</h2>
            <p className="muted small">
              מסמך מרוכז וקריא המרכז את עיקרי הממצאים, שילובי המדדים, המגמות והשאלות לפגישה
            </p>
          </div>
        </div>

        <div className="visit-brief-toolbar__actions">
          <button
            type="button"
            className="btn--primary"
            onClick={() => window.print()}
          >
            <Printer size={16} />
            <span>הדפסה / שמירה כ-PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="visit-brief-sheet card">
        {/* Document Header */}
        <header className="visit-sheet-header">
          <div className="visit-sheet-header__brand">
            <h1 className="visit-sheet-title">סיכום והכנה לביקור רופא/ת המשפחה</h1>
            <span className="visit-sheet-subtitle">הופק באמצעות MedExplain AI • פענוח מבוסס כללים קליניים</span>
          </div>

          <div className="visit-sheet-header__meta">
            <div className="sheet-meta-item">
              <User size={14} />
              <span><strong>שם:</strong> {patientName}</span>
            </div>
            {brief.patient.age && (
              <div className="sheet-meta-item">
                <span><strong>גיל:</strong> {brief.patient.age}</span>
              </div>
            )}
            {brief.patient.sex && (
              <div className="sheet-meta-item">
                <span><strong>מין:</strong> {brief.patient.sex === 'male' ? 'זכר' : 'נקבה'}</span>
              </div>
            )}
            <div className="sheet-meta-item">
              <Calendar size={14} />
              <span><strong>תאריך:</strong> {formattedDate}</span>
            </div>
          </div>
        </header>

        {/* Patient Clinical Context if available */}
        {brief.patient.context && (
          <div className="visit-sheet-section visit-sheet-context">
            <span className="section-label">רקע קליני / סיבת הבדיקה:</span>
            <p className="section-text">{brief.patient.context}</p>
          </div>
        )}

        {/* Executive Summary Headline */}
        <div className="visit-sheet-section visit-sheet-summary-box">
          <span className="section-label">תקציר כללי:</span>
          <p className="summary-headline-text">{brief.summaryHeadline}</p>
        </div>

        {/* 1. Key Abnormal / Borderline Findings */}
        <section className="visit-sheet-section">
          <h3 className="sheet-section-title">
            <AlertTriangle size={16} className="text-amber" />
            <span>1. מדדים שבלטו בבדיקה (חריגים וגבוליים)</span>
          </h3>

          {brief.keyFindings.length === 0 ? (
            <p className="muted small">כל המדדים שנבדקו נמצאים בטווח הנורמה התקין.</p>
          ) : (
            <ul className="sheet-findings-list">
              {brief.keyFindings.map((finding, idx) => (
                <li key={idx} className="sheet-finding-item">
                  <span className="finding-bullet">•</span>
                  <span className="finding-text">{finding}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 2. Cross-Test Findings */}
        {brief.contextFindings && brief.contextFindings.length > 0 && (
          <section className="visit-sheet-section">
            <h3 className="sheet-section-title">
              <Layers size={16} className="text-primary" />
              <span>2. שילוב מדדים רפואיים (Cross-Test Patterns)</span>
            </h3>
            <div className="sheet-combos-grid">
              {brief.contextFindings.map((cf) => (
                <div key={cf.ruleId} className="sheet-combo-box">
                  <span className="sheet-combo-name">{cf.headline}</span>
                  <p className="sheet-combo-desc">{cf.patientMessage}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. Trends & Deltas */}
        {brief.trends && brief.trends.length > 0 && (
          <section className="visit-sheet-section">
            <h3 className="sheet-section-title">
              <TrendingUp size={16} className="text-primary" />
              <span>3. מגמות ושינויים לעומת בדיקות קודמות</span>
            </h3>
            <div className="sheet-trends-table-wrap">
              <table className="sheet-trends-table">
                <thead>
                  <tr>
                    <th>מדד</th>
                    <th>בדיקה קודמת</th>
                    <th>בדיקה נוכחית</th>
                    <th>שינוי (דלתא)</th>
                    <th>משמעות המגמה</th>
                  </tr>
                </thead>
                <tbody>
                  {brief.trends.map((t) => (
                    <tr key={t.testKey} className={t.isConcerning ? 'row--concern' : ''}>
                      <td className="font-semibold">{t.testName}</td>
                      <td>{t.previousValue} {t.unit}</td>
                      <td className="font-bold">{t.currentValue} {t.unit}</td>
                      <td dir="ltr" className="font-mono">
                        {t.percentChange > 0 ? `+${t.percentChange}%` : `${t.percentChange}%`}
                      </td>
                      <td className="small">{t.interpretation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 4. Priority Questions for Physician (Interactive Checklist) */}
        <section className="visit-sheet-section">
          <h3 className="sheet-section-title">
            <HelpCircle size={16} className="text-primary" />
            <span>4. שאלות מומלצות לשיחה עם הרופא/ה (סמנו במהלך הפגישה)</span>
          </h3>

          <div className="sheet-questions-checklist">
            {brief.rankedQuestions.map((q, idx) => {
              const isChecked = Boolean(checkedQuestions[idx]);
              return (
                <div
                  key={idx}
                  className={`sheet-q-row ${isChecked ? 'sheet-q-row--checked' : ''}`}
                  onClick={() => toggleQuestionCheck(idx)}
                >
                  <button type="button" className="sheet-checkbox-btn no-print" aria-label="סמן שאלה זו">
                    {isChecked ? (
                      <CheckSquare size={18} className="text-emerald" />
                    ) : (
                      <Square size={18} className="text-muted" />
                    )}
                  </button>
                  <span className="sheet-print-checkbox print-only">☐</span>
                  <span className="sheet-q-text">{q}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. Appointment Preparation Checklist */}
        <section className="visit-sheet-section">
          <h3 className="sheet-section-title">
            <CheckSquare size={16} className="text-emerald" />
            <span>5. רשימת ציוד ומסמכים להביא לביקור</span>
          </h3>

          <div className="sheet-prep-checklist">
            {brief.checklist.map((item, idx) => {
              const isChecked = Boolean(checkedChecklist[idx]);
              return (
                <div
                  key={idx}
                  className={`sheet-prep-item ${isChecked ? 'sheet-prep-item--checked' : ''}`}
                  onClick={() => toggleChecklist(idx)}
                >
                  <button type="button" className="sheet-checkbox-btn no-print">
                    {isChecked ? (
                      <CheckSquare size={16} className="text-emerald" />
                    ) : (
                      <Square size={16} className="text-muted" />
                    )}
                  </button>
                  <span className="sheet-print-checkbox print-only">☐</span>
                  <span>{item}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. Doctor Notes Writable Area */}
        <section className="visit-sheet-section visit-sheet-notes-section">
          <h3 className="sheet-section-title">
            <Edit2 size={16} className="text-primary" />
            <span>6. סיכום והנחיות הרופא/ה (למילוי במהלך הפגישה)</span>
          </h3>

          <textarea
            className="sheet-notes-textarea no-print"
            placeholder="רשמו כאן הערות, המלצות תרופתיות, תאריך בדיקה חוזרת או הפניות שניתנו על ידי הרופא/ה..."
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            rows={4}
          />

          <div className="sheet-print-notes-lines print-only">
            <div className="print-line" />
            <div className="print-line" />
            <div className="print-line" />
            <div className="print-line" />
          </div>
        </section>

        {/* Footer Disclaimer */}
        <footer className="visit-sheet-footer">
          <p className="small muted">
            {brief.disclaimer}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default VisitBriefPage;
