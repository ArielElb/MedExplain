import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  ArrowLeft,
  FileText,
  Tag,
} from 'lucide-react';
import { PatientScenario } from '../types';
import { PATIENT_SCENARIOS } from '../data/scenarios';

interface Props {
  onSelectScenario: (scenario: PatientScenario) => void;
}

type ScenarioCategory = 'all' | 'routine' | 'lipids_sugar' | 'anemia_iron' | 'inflammation' | 'complex';

const CATEGORY_LABELS: Record<ScenarioCategory, string> = {
  all: 'כל המטופלים',
  lipids_sugar: 'שומנים וסוכר',
  anemia_iron: 'אנמיה ומאגרי ברזל',
  inflammation: 'דלקת וזיהום',
  routine: 'בדיקות שגרתיות',
  complex: 'תסמונת מורכבת',
};

const TAG_TRANSLATIONS: Record<string, string> = {
  cardiovascular_family_history: 'היסטוריה משפחתית של מחלות לב',
  vegetarian_diet: 'תזונה צמחונית/טבעונית',
  recent_viral_illness: 'מחלה ויראלית לאחרונה',
  joint_pain: 'כאבי מפרקים',
};

const ScenariosPage: React.FC<Props> = ({ onSelectScenario }) => {
  const [selectedCategory, setSelectedCategory] = useState<ScenarioCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredScenarios = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return PATIENT_SCENARIOS.filter((s) => {
      const matchCat = selectedCategory === 'all' || s.category === selectedCategory;
      if (!matchCat) return false;

      if (!query) return true;
      return (
        s.name.toLowerCase().includes(query) ||
        s.title.toLowerCase().includes(query) ||
        s.context.toLowerCase().includes(query) ||
        Object.keys(s.values).some((k) => k.toLowerCase().includes(query))
      );
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="scenarios-page">
      {/* Page Header */}
      <header className="page-header">
        <div className="page-header__badge">
          <Users size={16} />
          <span>מאגר מקרים קליניים להדגמה</span>
        </div>
        <h1 className="page-header__title">12 דוגמאות מטופלים קליניות</h1>
        <p className="page-header__subtitle">
          מאגר עשיר של 12 תרחישים המדגימים מקרים שכיחים: בדיקה שגרתית תקינה, ממצאים מבודדים,
          שילובי מדדים רב-מערכתיים (Cross-Test) ומעקב מגמות היסטורי.
        </p>
      </header>

      {/* Filter and Search Bar */}
      <div className="filter-toolbar mb-6">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="חיפוש מטופל/ת לפי שם, רקע קליני או מדד..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-pills" role="tablist">
          {(Object.keys(CATEGORY_LABELS) as ScenarioCategory[]).map((cat) => {
            const count =
              cat === 'all'
                ? PATIENT_SCENARIOS.length
                : PATIENT_SCENARIOS.filter((s) => s.category === cat).length;

            return (
              <button
                key={cat}
                type="button"
                className={`category-pill ${selectedCategory === cat ? 'category-pill--active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {CATEGORY_LABELS[cat]}
                <span className="pill-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="scenarios-grid">
        {filteredScenarios.map((scenario) => {
          const testCount = Object.keys(scenario.values).length;
          const hasPrev = Object.keys(scenario.previous_values).length > 0;
          const sexLabel = scenario.sex === 'female' ? 'נקבה' : 'זכר';

          return (
            <div key={scenario.id} className="scenario-card">
              <div className="scenario-card__header">
                <div className="scenario-card__title-row">
                  <span className="scenario-id-tag">{scenario.id.replace('scenario_', 'מקרה ')}</span>
                  <span className="scenario-category-badge">{CATEGORY_LABELS[scenario.category]}</span>
                </div>
                <h3 className="scenario-card__title">{scenario.title}</h3>
              </div>

              {/* Patient Demographics */}
              <div className="scenario-patient-row">
                <span className="scenario-patient-name">{scenario.name}</span>
                <span className="scenario-patient-demo">
                  {sexLabel}, בת/בן {scenario.age}
                </span>
                {scenario.notes && (
                  <span className="scenario-patient-note">{scenario.notes}</span>
                )}
              </div>

              {/* Clinical Context */}
              <p className="scenario-context-text">
                <FileText size={14} className="context-text-icon" />
                <span>{scenario.context}</span>
              </p>

              {/* Context Tags */}
              {scenario.context_tags && scenario.context_tags.length > 0 && (
                <div className="scenario-tags-row">
                  {scenario.context_tags.map((tag) => (
                    <span key={tag} className="context-tag-pill small">
                      <Tag size={11} />
                      <span>{TAG_TRANSLATIONS[tag] || tag}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Key Lab Values Preview Chips */}
              <div className="scenario-values-preview">
                <div className="scenario-val-preview-header">
                  <span className="small font-semibold">ערכי הבדיקה ({testCount} מדדים):</span>
                  {hasPrev && <span className="badge badge--warning small-pill">כולל בדיקה קודמת להשוואה</span>}
                </div>
                <div className="scenario-chips-wrap">
                  {Object.entries(scenario.values).slice(0, 6).map(([key, val]) => (
                    <span key={key} className="val-preview-chip">
                      <span className="val-chip-key">{key.toUpperCase()}:</span>
                      <span className="val-chip-num font-mono">{val}</span>
                    </span>
                  ))}
                  {testCount > 6 && (
                    <span className="val-preview-chip val-preview-chip--more">
                      +{testCount - 6} נוספים
                    </span>
                  )}
                </div>
              </div>

              {/* Launch CTA */}
              <div className="scenario-card__footer">
                <button
                  type="button"
                  className="btn--scenario-launch"
                  onClick={() => onSelectScenario(scenario)}
                >
                  <span>נתח תוצאות מטופל/ת זה</span>
                  <ArrowLeft size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScenariosPage;
