import React, { useState, useMemo } from 'react';
import { AnalysisResult } from '../types';
import ResultCard from './ResultCard';
import SummaryCard from './SummaryCard';
import Disclaimer from './Disclaimer';
import ExportBar from './ExportBar';
import CrossTestCard from './CrossTestCard';
import TrendChart from './TrendChart';
import PatientHeader from './PatientHeader';
import AiInsightsCard from './AiInsightsCard';
import OrganSystemsMap from './OrganSystemsMap';
import LifestylePlanCard from './LifestylePlanCard';
import WhatIfSimulator from './WhatIfSimulator';
import {
  MessageSquareQuote,
  Filter,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  FileSpreadsheet,
} from 'lucide-react';

interface Props {
  result: AnalysisResult;
  onNavigateToVisitBrief?: () => void;
  onOpenChat?: () => void;
}

type FilterType = 'all' | 'danger' | 'warning' | 'normal';

const ResultsList: React.FC<Props> = ({
  result,
  onNavigateToVisitBrief,
  onOpenChat,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [allExpanded, setAllExpanded] = useState<boolean>(true);
  const [copiedQuestions, setCopiedQuestions] = useState<boolean>(false);

  const flaggedItems = useMemo(() => {
    return result.analysis.filter(
      (item) => item.severity === 'danger' || item.severity === 'warning'
    );
  }, [result.analysis]);

  const filteredItems = useMemo(() => {
    if (filter === 'all') return result.analysis;
    return result.analysis.filter((item) => item.severity === filter);
  }, [result.analysis, filter]);

  const handleCopyRankedQuestions = async () => {
    if (!result.rankedDoctorQuestions.length) return;
    const text =
      'שאלות מומלצות לפגישה עם רופא/ת המשפחה (מתוך MedExplain AI):\n' +
      result.rankedDoctorQuestions.map((q, idx) => `${idx + 1}. ${q}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedQuestions(true);
      setTimeout(() => setCopiedQuestions(false), 2000);
    } catch {
      // Fallback
    }
  };

  const dangerCount = result.summary.danger;
  const warningCount = result.summary.warning;
  const normalCount = result.summary.normal;

  return (
    <section className="results">
      {/* Patient Header */}
      {result.patient && <PatientHeader patient={result.patient} />}

      {/* AI Clinical Insights Narrative */}
      <AiInsightsCard
        result={result}
        patient={result.patient}
        onOpenChat={onOpenChat || (() => {})}
      />

      {/* Summary Metrics */}
      <SummaryCard summary={result.summary} createdAt={result.createdAt} />

      {/* Action / Export Toolbar */}
      <ExportBar
        result={result}
        onNavigateToVisitBrief={onNavigateToVisitBrief}
      />

      {/* "מה דורש תשומת לב" - Compact Attention Chips */}
      {flaggedItems.length > 0 && (
        <div className="card attention-card">
          <div className="attention-card__header">
            <AlertOctagon size={20} className="text-amber" />
            <h3 className="attention-card__title">מה דורש תשומת לב בבדיקה זו?</h3>
            <span className="badge badge--warning">{flaggedItems.length} מדדים חורגים/גבוליים</span>
          </div>

          <div className="attention-chips-grid">
            {flaggedItems.map((item) => (
              <div
                key={item.markerId}
                className={`attention-chip attention-chip--${item.severity}`}
                onClick={() => setFilter(item.severity)}
                role="button"
                tabIndex={0}
                title="לחץ לסינון מדד זה ברשימה"
              >
                <div className="attention-chip__name">{item.name}</div>
                <div className="attention-chip__val">
                  <span>{item.result} {item.unit}</span>
                  <span className={`badge badge--${item.severity} chip-badge`}>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Biological Organ Systems Map */}
      <OrganSystemsMap analysis={result.analysis} />

      {/* "התמונה הכוללת" - Multi-Biomarker Combinations */}
      {result.contextFindings.length > 0 && (
        <CrossTestCard findings={result.contextFindings} />
      )}

      {/* Evidence-based Lifestyle & Nutrition Plan */}
      <LifestylePlanCard result={result} patient={result.patient} />

      {/* "מגמות ושינויים" - Historical Trend Deltas */}
      {result.trends.length > 0 && <TrendChart trends={result.trends} />}

      {/* What-If Lab Value Simulator */}
      <WhatIfSimulator initialResult={result} patient={result.patient} />

      {/* Filter and Accordion Control Bar */}
      <div className="results__toolbar no-print">
        <div className="filter-group">
          <span className="filter-label">
            <Filter size={15} /> סינון תצוגה:
          </span>
          <button
            type="button"
            className={`filter-btn ${filter === 'all' ? 'filter-btn--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            הכל ({result.analysis.length})
          </button>
          {dangerCount > 0 && (
            <button
              type="button"
              className={`filter-btn filter-btn--danger ${
                filter === 'danger' ? 'filter-btn--active' : ''
              }`}
              onClick={() => setFilter('danger')}
            >
              חריגים ({dangerCount})
            </button>
          )}
          {warningCount > 0 && (
            <button
              type="button"
              className={`filter-btn filter-btn--warning ${
                filter === 'warning' ? 'filter-btn--active' : ''
              }`}
              onClick={() => setFilter('warning')}
            >
              גבוליים ({warningCount})
            </button>
          )}
          {normalCount > 0 && (
            <button
              type="button"
              className={`filter-btn filter-btn--normal ${
                filter === 'normal' ? 'filter-btn--active' : ''
              }`}
              onClick={() => setFilter('normal')}
            >
              תקינים ({normalCount})
            </button>
          )}
        </div>

        <button
          type="button"
          className="btn--toggle-all"
          onClick={() => setAllExpanded(!allExpanded)}
        >
          {allExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span>{allExpanded ? 'כווץ את כל השאלות' : 'פתח את כל השאלות'}</span>
        </button>
      </div>

      {/* Biomarker Result Cards Grid */}
      <div className="results__grid">
        {filteredItems.map((item) => (
          <ResultCard
            key={item.markerId}
            item={item}
            defaultExpanded={allExpanded}
          />
        ))}
      </div>

      {/* Ranked Doctor Questions Section */}
      {result.rankedDoctorQuestions.length > 0 && (
        <div className="card general-questions-card">
          <div className="card__header">
            <div className="general-questions-header">
              <div className="q-icon-wrap">
                <MessageSquareQuote size={24} />
              </div>
              <div>
                <h2>שאלות מומלצות לשיחה עם הרופא/ה</h2>
                <p className="muted small">
                  שאלות מתועדפות ומדורגות לפי חשיבות קלינית, שילובי מדדים ומגמות בבדיקה שלך
                </p>
              </div>
            </div>

            <div className="doctor-prep-actions no-print">
              <button
                type="button"
                className="btn--copy-pill"
                onClick={handleCopyRankedQuestions}
              >
                {copiedQuestions ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedQuestions ? 'הועתק ללוח!' : 'העתק את כל השאלות'}</span>
              </button>

              {onNavigateToVisitBrief && (
                <button
                  type="button"
                  className="btn--export-visit-brief btn--small"
                  onClick={onNavigateToVisitBrief}
                >
                  <FileSpreadsheet size={15} />
                  <span>עבור לדף הכנה מלא לרופא</span>
                </button>
              )}
            </div>
          </div>

          <ul className="general-questions-list">
            {result.rankedDoctorQuestions.map((question, index) => (
              <li key={index} className="general-question-item">
                <span className="general-question-bullet">{index + 1}</span>
                <span className="general-question-text">{question}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Safety Medical Disclaimer */}
      <Disclaimer />
    </section>
  );
};

export default ResultsList;
