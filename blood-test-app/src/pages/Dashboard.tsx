import React, { useRef } from 'react';
import { ShieldCheck, HeartPulse, Edit3 } from 'lucide-react';
import InputForm from '../components/InputForm';
import ResultsList from '../components/ResultsList';
import HistoryPanel from '../components/HistoryPanel';
import Disclaimer from '../components/Disclaimer';
import PrivacyNote from '../components/PrivacyNote';
import { useAnalysis } from '../hooks/useAnalysis';
import { useLocalHistory } from '../hooks/useLocalHistory';
import { BIOMARKERS } from '../data/biomarkers';

const Dashboard: React.FC = () => {
  const { result, errors, analyze, setResult } = useAnalysis();
  const history = useLocalHistory();
  const resultsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (values: Record<string, string>) => {
    const analysis = analyze(values);
    if (analysis) {
      history.save(analysis);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleSelectHistory = (item: typeof result) => {
    setResult(item);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleScrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="container">
      {/* Header / Hero Section */}
      <header className="hero">
        <div className="hero__badge">
          <ShieldCheck size={16} className="hero__badge-icon" />
          <span>100% פרטי ומקומי בדפדפן</span>
        </div>
        <h1>
          <HeartPulse size={36} className="hero__icon" /> פענוח והסבר בדיקות דם
        </h1>
        <p className="hero__subtitle">
          הסבר אינטואיטיבי וברור לתוצאות בדיקות המעבדה שלך — והכנה מושלמת לשיחה עם רופא/ת המשפחה
        </p>
      </header>

      {/* Privacy and Medical Disclaimer Notices */}
      <div className="notices-grid no-print">
        <PrivacyNote />
        <Disclaimer />
      </div>

      {/* Input Form */}
      <div ref={formRef}>
        <InputForm markers={BIOMARKERS} onSubmit={handleSubmit} />
      </div>

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
        <div ref={resultsRef} className="results-wrapper">
          <div className="results-anchor-bar no-print">
            <button
              type="button"
              className="btn--ghost btn--small"
              onClick={handleScrollToForm}
            >
              <Edit3 size={14} />
              <span>עריכת נתוני הבדיקה בטופס</span>
            </button>
          </div>
          <ResultsList result={result} />
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

      {/* Footer */}
      <footer className="footer no-print">
        <p>
          נבנה למטרות הסברה והעצמת המטופל/ת. במקרה של תסמינים חריגים או שינוי בהרגשה — יש לפנות
          לבדיקת רופא/ה בהקדם. במצב חירום יש לפנות למוקד מד״א (101).
        </p>
        <p className="small muted">
          כל המידע מעובד על גבי הדפדפן שלך בלבד ואינו נשמר בשום שרת.
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
