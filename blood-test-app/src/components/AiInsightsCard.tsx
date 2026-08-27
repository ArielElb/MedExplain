import React, { useState } from 'react';
import { Sparkles, Bot, MessageSquare, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AnalysisResult, PatientContext } from '../types';

interface Props {
  result: AnalysisResult;
  patient?: PatientContext;
  onOpenChat: () => void;
}

const AiInsightsCard: React.FC<Props> = ({ result, patient, onOpenChat }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const abnormalItems = result.analysis.filter((a) => a.severity !== 'normal');
  const hasSynergy = result.contextFindings.length > 0;
  const hasTrends = result.trends.length > 0;

  // Generate an instant synthesized clinical narrative
  const generateNarrative = (): string[] => {
    const points: string[] = [];

    if (abnormalItems.length === 0) {
      points.push(
        `כל ${result.analysis.length} המדדים שנבדקו נמצאים בטווח הנורמה — תמונת מעבדה אופטימלית ואיזון מטבולי תקין.`
      );
      points.push(
        'מומלץ להמשיך באורח החיים הנוכחי ולבצע בדיקות סקר תקופתיות בהתאם לגיל ולהמלצות רופא/ת המשפחה.'
      );
      return points;
    }

    // Lead point with patient name and abnormal counts
    points.push(
      `מתוך ${result.analysis.length} מדדים שנבדקו, זוהו ${abnormalItems.length} מדדים הדורשים תשומת לב קלינית עבור ${
        patient?.name || 'המטופל/ת'
      }.`
    );

    // Synergy point if available
    if (hasSynergy) {
      const topFinding = result.contextFindings[0];
      points.push(
        `התמונה הכוללת: ${topFinding.headline} — ${topFinding.patientMessage}`
      );
    }

    // Trend point if available
    if (hasTrends) {
      const topTrend = result.trends.find((t) => t.isConcerning) || result.trends[0];
      points.push(
        `מעקב מגמות: נצפתה מגמת שינוי במדד ${topTrend.testName} (${topTrend.percentChange > 0 ? '+' : ''}${topTrend.percentChange}% לעומת ערך קודם).`
      );
    }

    // Recommended action
    points.push(
      'מומלץ לעבור על השאלות הממוקדות שהוכנו לשיחה עם הרופא/ה בלשונית "הכנה לרופא" כדי להפיק את המרב מהפגישה.'
    );

    return points;
  };

  const narrativePoints = generateNarrative();

  return (
    <div className="card ai-insights-card">
      <div className="ai-insights-header">
        <div className="ai-insights-title-wrap">
          <div className="ai-badge-icon">
            <Sparkles size={20} className="text-primary" />
          </div>
          <div>
            <div className="ai-card-badge-row">
              <span className="ai-pill">
                <Bot size={13} /> MedExplain AI Insights
              </span>
              <span className="ai-status-pill">ניתוח קליני משולב</span>
            </div>
            <h3 className="ai-insights-title">תובנות בינה מלאכותית ותמונת מצב</h3>
          </div>
        </div>

        <div className="ai-insights-actions">
          <button
            type="button"
            className="btn--ask-ai"
            onClick={onOpenChat}
            title="פתח צ'אט עם העוזר הרפואי"
          >
            <MessageSquare size={16} />
            <span>שאל את ה-AI על הבדיקות</span>
          </button>

          <button
            type="button"
            className="btn--toggle-insights"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            title={isExpanded ? 'כווץ תובנות' : 'הרחב תובנות'}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="ai-insights-body">
          <ul className="ai-narrative-list">
            {narrativePoints.map((point, idx) => (
              <li key={idx} className="ai-narrative-item">
                <div className="ai-bullet">
                  {idx === 0 && abnormalItems.length === 0 ? (
                    <CheckCircle2 size={16} className="text-emerald" />
                  ) : idx === 1 && hasSynergy ? (
                    <AlertTriangle size={16} className="text-amber" />
                  ) : (
                    <Sparkles size={14} className="text-primary" />
                  )}
                </div>
                <p className="ai-point-text">{point}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AiInsightsCard;

