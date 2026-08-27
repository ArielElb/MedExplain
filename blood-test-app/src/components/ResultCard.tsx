import React, { useState } from 'react';
import { AnalysisItem } from '../types';
import RangeGauge from './RangeGauge';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Tag,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ListPlus,
  Clock,
} from 'lucide-react';

interface Props {
  item: AnalysisItem;
  defaultExpanded?: boolean;
}

const ResultCard: React.FC<Props> = ({ item, defaultExpanded = true }) => {
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(defaultExpanded);
  const [isDetailOpen, setIsDetailOpen] = useState(item.severity !== 'normal');
  const [copied, setCopied] = useState(false);

  const handleCopyQuestions = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.questions.length) return;
    const textToCopy =
      `שאלות לרופא/ה לגבי ${item.name} (תוצאה: ${item.result} ${item.unit}):\n` +
      item.questions.map((q, idx) => `${idx + 1}. ${q}`).join('\n');
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const getSeverityIcon = () => {
    switch (item.severity) {
      case 'normal':
        return <CheckCircle2 size={20} className="text-emerald" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-amber" />;
      case 'danger':
        return <AlertCircle size={20} className="text-rose" />;
    }
  };

  return (
    <article className={`result result--${item.severity}`}>
      {/* Card Header */}
      <header className="result__header">
        <div className="result__title-wrap">
          <div className="result__badge-row">
            <span className="result__category-badge">
              <Tag size={12} />
              {item.category}
            </span>
            {item.abbreviation && (
              <span className="badge badge--neutral font-mono">{item.abbreviation}</span>
            )}
            <span className={`badge badge--${item.severity}`}>
              {item.status}
            </span>
          </div>
          <h3 className="result__title">{item.name}</h3>
        </div>

        <div className="result__value-box">
          <span className="result__value-label">תוצאה:</span>
          <div className="result__value-display">
            {getSeverityIcon()}
            <span className="result__value-num">{item.result}</span>
            <span className="result__value-unit">{item.unit}</span>
          </div>
        </div>
      </header>

      {/* Visual Range Gauge Indicator */}
      <div className="result__gauge-section">
        <RangeGauge
          value={item.result}
          config={item.rangeConfig}
          severity={item.severity}
          referenceText={item.reference}
          unit={item.unit}
        />
      </div>

      {/* Description & Safe Interpretation Message */}
      <div className="result__content">
        <div className="result__message-box">
          <p className="result__message">{item.safeMessage}</p>
        </div>

        {/* Urgency & Recommendations Callout */}
        {item.urgency && item.severity !== 'normal' && (
          <div className="result__urgency-box">
            <Clock size={15} className="text-amber" />
            <span><strong>המלצה ודחיפות:</strong> {item.urgency}</span>
          </div>
        )}
      </div>

      {/* Expandable Clinical Context (What it measures & Possible Reasons) */}
      {(item.whatItMeasures || (item.possibleReasons && item.possibleReasons.length > 0)) && (
        <div className="result__detail-accordion">
          <button
            type="button"
            className="result__detail-toggle"
            onClick={() => setIsDetailOpen((prev) => !prev)}
            aria-expanded={isDetailOpen}
          >
            <span className="detail-toggle-text">
              <ListPlus size={16} />
              <span>מה המדד בודק ומה עשוי להשפיע עליו?</span>
            </span>
            {isDetailOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isDetailOpen && (
            <div className="result__detail-body">
              {item.whatItMeasures && (
                <div className="detail-subsection">
                  <span className="detail-sub-title">מה המדד בודק בגוף:</span>
                  <p className="detail-sub-text">{item.whatItMeasures}</p>
                </div>
              )}

              {item.possibleReasons && item.possibleReasons.length > 0 && (
                <div className="detail-subsection">
                  <span className="detail-sub-title">סיבות אפשריות להבדלים או לשינוי:</span>
                  <ul className="detail-reasons-list">
                    {item.possibleReasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Collapsible Doctor Questions Accordion */}
      {item.questions && item.questions.length > 0 && (
        <div className="result__accordion">
          <div className="result__accordion-header-row">
            <button
              type="button"
              className="result__accordion-toggle-btn"
              onClick={() => setIsQuestionsOpen((prev) => !prev)}
              aria-expanded={isQuestionsOpen}
            >
              <div className="result__accordion-title">
                <HelpCircle size={17} className="text-primary" />
                <span>שאלות מומלצות לשיחה עם הרופא/ה</span>
                <span className="badge badge--muted small-pill">{item.questions.length}</span>
              </div>
              {isQuestionsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            <button
              type="button"
              className="btn--copy-pill"
              onClick={handleCopyQuestions}
              title="העתק שאלות ללוח"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'הועתק!' : 'העתק שאלות'}</span>
            </button>
          </div>

          {isQuestionsOpen && (
            <div className="result__accordion-content">
              <ul className="result__questions-list">
                {item.questions.map((question, index) => (
                  <li key={index} className="result__question-item">
                    <span className="question-bullet">{index + 1}</span>
                    <span className="question-text">{question}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  );
};

export default ResultCard;
