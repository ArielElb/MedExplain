import React from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { TrendResult } from '../types';

interface Props {
  trends: TrendResult[];
}

const TrendChart: React.FC<Props> = ({ trends }) => {
  if (!trends || trends.length === 0) return null;

  return (
    <div className="card trend-section">
      <div className="card__header trend-header">
        <div className="trend-title-group">
          <div className="trend-icon-badge">
            <TrendingUp size={22} />
          </div>
          <div>
            <h3 className="trend-title">מגמות ושינויים לעומת בדיקות קודמות</h3>
            <p className="muted small">
              השוואה דינמית בין הבדיקה הנוכחית לבדיקה ההיסטורית הקודמת
            </p>
          </div>
        </div>
      </div>

      <div className="trend-grid">
        {trends.map((t) => {
          const isUp = t.direction === 'increased';
          const isDown = t.direction === 'decreased';

          return (
            <div
              key={t.testKey}
              className={`trend-card ${t.isConcerning ? 'trend-card--concern' : ''}`}
            >
              <div className="trend-card__header">
                <span className="trend-card__test-name">{t.testName}</span>
                <span
                  className={`trend-delta-pill ${
                    isUp
                      ? t.isConcerning ? 'delta--danger' : 'delta--warning'
                      : isDown
                      ? t.isConcerning ? 'delta--danger' : 'delta--info'
                      : 'delta--neutral'
                  }`}
                >
                  {isUp && <ArrowUpRight size={14} />}
                  {isDown && <ArrowDownRight size={14} />}
                  {!isUp && !isDown && <ArrowRight size={14} />}
                  <span>{t.percentChange > 0 ? `+${t.percentChange}%` : `${t.percentChange}%`}</span>
                </span>
              </div>

              {/* Comparison Visual Values */}
              <div className="trend-values-row">
                <div className="trend-val-box">
                  <span className="trend-val-lbl">בדיקה קודמת</span>
                  <span className="trend-val-num">{t.previousValue}</span>
                  <span className="trend-val-unit">{t.unit}</span>
                </div>

                <div className="trend-arrow-indicator">
                  {isUp ? (
                    <TrendingUp size={20} className={t.isConcerning ? 'text-rose' : 'text-amber'} />
                  ) : isDown ? (
                    <TrendingDown size={20} className={t.isConcerning ? 'text-rose' : 'text-blue'} />
                  ) : (
                    <Minus size={20} className="text-muted" />
                  )}
                </div>

                <div className="trend-val-box trend-val-box--current">
                  <span className="trend-val-lbl">בדיקה נוכחית</span>
                  <span className="trend-val-num font-bold">{t.currentValue}</span>
                  <span className="trend-val-unit">{t.unit}</span>
                </div>
              </div>

              {/* Interpretation Note */}
              <p className="trend-card__interpretation">{t.interpretation}</p>

              {t.recommendedQuestion && (
                <div className="trend-card__question">
                  <span className="trend-q-tag">שאלה מובילה:</span>
                  <span className="trend-q-text">{t.recommendedQuestion}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrendChart;

