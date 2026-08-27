import React from 'react';
import { Layers, AlertCircle, HelpCircle } from 'lucide-react';
import { ContextFinding } from '../types';
import { getCombinationQuestions } from '../lib/contextEngine';

interface Props {
  findings: ContextFinding[];
}

const CrossTestCard: React.FC<Props> = ({ findings }) => {
  if (!findings || findings.length === 0) return null;

  return (
    <div className="card cross-test-section">
      <div className="card__header cross-test-header">
        <div className="cross-test-title-group">
          <div className="cross-test-icon-badge">
            <Layers size={22} />
          </div>
          <div>
            <h3 className="cross-test-title">התמונה הכוללת — שילובי מדדים רפואיים</h3>
            <p className="muted small">
              מערכת הכללים זיהתה דפוס רפואי רב-מערכתי הנובע מהצלבת מספר תוצאות יחד
            </p>
          </div>
        </div>
      </div>

      <div className="cross-test-grid">
        {findings.map((finding) => {
          const comboQuestions = getCombinationQuestions(finding.ruleId);
          return (
            <div key={finding.ruleId} className="cross-test-item">
              <div className="cross-test-item__top">
                <div className="cross-test-item__headline">
                  <AlertCircle size={18} className="text-amber" />
                  <h4>{finding.headline}</h4>
                </div>
                {finding.badgeText && (
                  <span className="badge badge--warning">{finding.badgeText}</span>
                )}
              </div>

              <p className="cross-test-item__message">{finding.patientMessage}</p>

              {comboQuestions.length > 0 && (
                <div className="cross-test-item__questions">
                  <div className="cross-test-q-header">
                    <HelpCircle size={14} className="text-primary" />
                    <span className="small font-semibold">שאלות ממוקדות לשילוב זה:</span>
                  </div>
                  <ul className="cross-test-q-list">
                    {comboQuestions.map((q, idx) => (
                      <li key={idx} className="cross-test-q-li">
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CrossTestCard;

