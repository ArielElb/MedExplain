import React, { useRef, useState } from 'react';
import {
  Edit3,
  FlaskConical,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import InputForm from '../components/InputForm';
import ResultsList from '../components/ResultsList';
import HistoryPanel from '../components/HistoryPanel';
import PrivacyNote from '../components/PrivacyNote';
import Disclaimer from '../components/Disclaimer';
import { AnalysisResult, PatientContext } from '../types';
import { BIOMARKERS } from '../data/biomarkers';

interface Props {
  result: AnalysisResult | null;
  errors: string[];
  initialValues: Record<string, string>;
  initialPatient?: PatientContext;
  onSubmitForm: (
    values: Record<string, string>,
    patient?: PatientContext,
    previousValues?: Record<string, number>
  ) => void;
  onNavigateToVisitBrief: () => void;
  onOpenChat?: () => void;
  history: {
    items: AnalysisResult[];
    enabled: boolean;
    available: boolean;
    toggle: (enabled: boolean) => void;
    select: (item: AnalysisResult) => void;
    remove: (id: string) => void;
    clearAll: () => void;
  };
}

const ResultsPage: React.FC<Props> = ({
  result,
  errors,
  initialValues,
  initialPatient,
  onSubmitForm,
  onNavigateToVisitBrief,
  onOpenChat,
  history,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(!result);
  const formRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (
    values: Record<string, string>,
    patient?: PatientContext,
    previousValues?: Record<string, number>
  ) => {
    onSubmitForm(values, patient, previousValues);
    setIsFormOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectHistory = (item: AnalysisResult) => {
    history.select(item);
    setIsFormOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="results-page">
      {/* Header only if no result yet */}
      {!result && (
        <header className="page-header text-center">
          <div className="page-header__badge">
            <FlaskConical size={16} />
            <span>פענוח והסבר תוצאות מעבדה</span>
          </div>
          <h1 className="page-header__title">הזנת תוצאות בדיקות דם</h1>
          <p className="page-header__subtitle">
            הזינו את המדדים המופיעים בטופס הבדיקה שלכם כדי לקבל הסבר קליני מקיף והכנה ממוקדת לרופא/ת המשפחה.
          </p>
        </header>
      )}

      {/* Form Collapsible Accordion Toolbar (when result exists) */}
      {result && (
        <div className="form-toggle-bar no-print">
          <button
            type="button"
            className="btn--form-toggle"
            onClick={() => setIsFormOpen(!isFormOpen)}
          >
            <div className="form-toggle-label">
              <Edit3 size={16} />
              <span>{isFormOpen ? 'סגור טופס הזנת נתונים' : 'עריכת נתוני בדיקה או הזנת מדדים נוספים'}</span>
            </div>
            {isFormOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      )}

      {/* Input Form */}
      {isFormOpen && (
        <div ref={formRef} className="form-container-wrap">
          <InputForm
            markers={BIOMARKERS}
            initialValues={initialValues}
            initialPatient={initialPatient}
            onSubmit={handleSubmit}
          />
        </div>
      )}

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="alert alert--error no-print">
          <ul className="bullets">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Analysis Results Display */}
      {result && (
        <div className="results-wrapper">
          <ResultsList
            result={result}
            onNavigateToVisitBrief={onNavigateToVisitBrief}
            onOpenChat={onOpenChat}
          />
        </div>
      )}

      {/* Local Browser History */}
      <HistoryPanel
        items={history.items}
        enabled={history.enabled}
        available={history.available}
        onToggle={history.toggle}
        onSelect={handleSelectHistory}
        onDelete={history.remove}
        onClearAll={history.clearAll}
      />

      {/* Privacy and Medical Disclaimer Notices at the bottom */}
      <div className="notices-grid no-print" style={{ marginTop: '2rem' }}>
        <PrivacyNote />
        <Disclaimer />
      </div>
    </div>
  );
};

export default ResultsPage;
