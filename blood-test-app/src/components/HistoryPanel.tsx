import React from 'react';
import { AnalysisResult } from '../types';
import { Trash2, History, Clock } from 'lucide-react';

interface Props {
  items: AnalysisResult[];
  enabled: boolean;
  available: boolean;
  onToggle: (next: boolean) => void;
  onSelect: (item: AnalysisResult) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const HistoryPanel: React.FC<Props> = ({
  items,
  enabled,
  available,
  onToggle,
  onSelect,
  onDelete,
  onClearAll,
}) => (
  <div className="card history-card no-print">
    <div className="card__header">
      <div className="history-card__title">
        <h2>
          <History size={22} className="icon-history" /> היסטוריית בדיקות מקומית (אופציונלי)
        </h2>
      </div>
      {enabled && items.length > 0 && (
        <button
          type="button"
          className="btn--ghost btn--danger btn--small"
          onClick={onClearAll}
        >
          <Trash2 size={15} />
          <span>מחיקת כל ההיסטוריה</span>
        </button>
      )}
    </div>

    {!available ? (
      <p className="muted">
        הדפדפן חוסם אחסון מקומי, ולכן שמירת היסטוריה אינה זמינה. הפענוח עצמו עובד כרגיל.
      </p>
    ) : (
      <>
        <div className="history-toggle-box">
          <label className="switch">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => onToggle(event.target.checked)}
            />
            <span className="switch__label">שמירת פענוחים אוטומטית בדפדפן זה</span>
          </label>
          <p className="muted small switch__hint">
            כבוי כברירת מחדל. כשהמתג דולק, הבדיקות נשמרות אך ורק בזיכרון המקומי של הדפדפן שלך
            (localStorage) ואינן נשלחות לאף שרת חיצוני. כיבוי המתג מוחק את כל ההיסטוריה השמורה.
          </p>
        </div>

        {enabled && items.length > 0 && (
          <div className="history-list-wrapper">
            <span className="history-list-title">בדיקות שמורות קודמות ({items.length}):</span>
            <ul className="history-list">
              {items.map((item) => (
                <li key={item.id} className="history-item-row">
                  <button
                    type="button"
                    className="history__item-btn"
                    onClick={() => onSelect(item)}
                    title="לחצו לצפייה בתוצאות בדיקה זו"
                  >
                    <div className="history__item-date">
                      <Clock size={15} className="muted" />
                      <span>{new Date(item.createdAt).toLocaleString('he-IL', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>

                    <div className="history__item-badges">
                      <span className="badge badge--muted">
                        {item.summary.total} מדדים
                      </span>
                      {item.summary.danger > 0 ? (
                        <span className="badge badge--danger">
                          {item.summary.danger} חריגים
                        </span>
                      ) : (
                        <span className="badge badge--normal">
                          הכל תקין ✓
                        </span>
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    className="icon-btn history__delete-btn"
                    aria-label="מחיקת בדיקה זו"
                    title="מחיקה מההיסטוריה"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </>
    )}
  </div>
);

export default HistoryPanel;
