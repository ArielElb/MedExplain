import React from 'react';
import { AnalysisSummary } from '../types';
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Calendar,
  Activity,
} from 'lucide-react';

interface Props {
  summary: AnalysisSummary;
  createdAt: string;
}

const SummaryCard: React.FC<Props> = ({ summary, createdAt }) => {
  const { total, normal, warning, danger, headline } = summary;

  const normalPct = total > 0 ? Math.round((normal / total) * 100) : 0;
  const warningPct = total > 0 ? Math.round((warning / total) * 100) : 0;
  const dangerPct = total > 0 ? Math.round((danger / total) * 100) : 0;

  const getHeadlineSeverity = () => {
    if (danger > 0) return 'danger';
    if (warning > 0) return 'warning';
    return 'normal';
  };

  const headlineSeverity = getHeadlineSeverity();

  return (
    <div className="card summary-card">
      {/* Card Header */}
      <div className="card__header summary-card__header">
        <div className="summary-card__title-group">
          <h2>
            <Activity size={24} className="icon-activity" /> סיכום ממצאי הבדיקה
          </h2>
        </div>
        <div className="summary-card__date">
          <Calendar size={15} />
          <span>{new Date(createdAt).toLocaleString('he-IL', { dateStyle: 'medium', timeStyle: 'short' })}</span>
        </div>
      </div>

      {/* Headline Banner */}
      <div className={`summary-banner summary-banner--${headlineSeverity}`}>
        <div className="summary-banner__icon">
          {headlineSeverity === 'normal' && <CheckCircle2 size={24} />}
          {headlineSeverity === 'warning' && <AlertTriangle size={24} />}
          {headlineSeverity === 'danger' && <AlertCircle size={24} />}
        </div>
        <div className="summary-banner__text">
          <p className="summary-headline-main">{headline}</p>
        </div>
      </div>

      {/* Visual Multi-segment Progress Bar */}
      <div className="summary-meter">
        <div className="summary-meter__header">
          <span className="summary-meter__title">התפלגות התוצאות</span>
          <span className="summary-meter__info">
            {normal} תקינים ({normalPct}%) · {warning} גבוליים ({warningPct}%) · {danger} חריגים ({dangerPct}%)
          </span>
        </div>

        <div className="summary-meter__bar">
          {normalPct > 0 && (
            <div
              className="summary-meter__segment summary-meter__segment--normal"
              style={{ width: `${normalPct}%` }}
              title={`תקינים: ${normal} (${normalPct}%)`}
            />
          )}
          {warningPct > 0 && (
            <div
              className="summary-meter__segment summary-meter__segment--warning"
              style={{ width: `${warningPct}%` }}
              title={`גבוליים: ${warning} (${warningPct}%)`}
            />
          )}
          {dangerPct > 0 && (
            <div
              className="summary-meter__segment summary-meter__segment--danger"
              style={{ width: `${dangerPct}%` }}
              title={`חריגים: ${danger} (${dangerPct}%)`}
            />
          )}
        </div>
      </div>

      {/* 4 Stat Metric Cards Grid */}
      <div className="summary-stats-grid">
        <div className="stat-card stat-card--total">
          <div className="stat-card__icon-wrap">
            <ClipboardList size={20} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__val">{total}</span>
            <span className="stat-card__label">סה״כ מדדים</span>
          </div>
        </div>

        <div className="stat-card stat-card--normal">
          <div className="stat-card__icon-wrap">
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__val">{normal}</span>
            <span className="stat-card__label">בטווח התקין</span>
          </div>
        </div>

        <div className="stat-card stat-card--warning">
          <div className="stat-card__icon-wrap">
            <AlertTriangle size={20} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__val">{warning}</span>
            <span className="stat-card__label">גבוליים למעקב</span>
          </div>
        </div>

        <div className="stat-card stat-card--danger">
          <div className="stat-card__icon-wrap">
            <AlertCircle size={20} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__val">{danger}</span>
            <span className="stat-card__label">חריגים לשיחה עם רופא</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
