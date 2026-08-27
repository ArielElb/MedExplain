import React, { useState, useMemo } from 'react';
import {
  Sliders,
  Sparkles,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowLeft,
  Heart,
  Target,
} from 'lucide-react';
import { AnalysisResult, PatientContext } from '../types';
import { analyzeBloodTest } from '../lib/analyzer';
import { BIOMARKERS_BY_ID } from '../data/biomarkers';

export interface WhatIfSimulatorProps {
  initialResult?: AnalysisResult | null;
  patient?: PatientContext;
}

interface SliderConfig {
  markerId: string;
  name: string;
  shortName: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  optimalTarget: number;
  description: string;
  improvementDirection: 'lower' | 'higher';
}

const ACTIONABLE_SLIDERS: SliderConfig[] = [
  {
    markerId: 'hba1c',
    name: 'HbA1c (המוגלובין מסוכרר)',
    shortName: 'HbA1c',
    unit: '%',
    min: 4.0,
    max: 10.0,
    step: 0.1,
    optimalTarget: 5.3,
    description: 'ממוצע הסוכר בדם ב-3 החודשים האחרונים',
    improvementDirection: 'lower',
  },
  {
    markerId: 'glucose',
    name: 'Glucose (גלוקוז בצום)',
    shortName: 'גלוקוז',
    unit: 'mg/dL',
    min: 50,
    max: 250,
    step: 1,
    optimalTarget: 88,
    description: 'רמת הסוכר לאחר צום לילה',
    improvementDirection: 'lower',
  },
  {
    markerId: 'ldl',
    name: "LDL (כולסטרול 'רע')",
    shortName: 'LDL',
    unit: 'mg/dL',
    min: 40,
    max: 240,
    step: 1,
    optimalTarget: 90,
    description: 'שומן שעלול להצטבר בדפנות העורקים',
    improvementDirection: 'lower',
  },
  {
    markerId: 'hdl',
    name: "HDL (כולסטרול 'טוב' ומגן)",
    shortName: 'HDL',
    unit: 'mg/dL',
    min: 25,
    max: 90,
    step: 1,
    optimalTarget: 58,
    description: 'מפנה עודפי כולסטרול חזרה לכבד',
    improvementDirection: 'higher',
  },
  {
    markerId: 'triglycerides',
    name: 'Triglycerides (טריגליצרידים)',
    shortName: 'טריגליצרידים',
    unit: 'mg/dL',
    min: 40,
    max: 400,
    step: 1,
    optimalTarget: 95,
    description: 'שומנים המושפעים מסוכרים ופחמימות',
    improvementDirection: 'lower',
  },
  {
    markerId: 'hemoglobin',
    name: 'Hemoglobin (המוגלובין)',
    shortName: 'המוגלובין',
    unit: 'g/dL',
    min: 8.0,
    max: 18.0,
    step: 0.1,
    optimalTarget: 13.8,
    description: 'הובלת חמצן מהריאות לכל תאי הגוף',
    improvementDirection: 'higher',
  },
  {
    markerId: 'ferritin',
    name: 'Ferritin (מאגרי ברזל)',
    shortName: 'פריטין',
    unit: 'ng/mL',
    min: 5,
    max: 350,
    step: 1,
    optimalTarget: 70,
    description: 'מאגרי הברזל הזמינים בגוף',
    improvementDirection: 'higher',
  },
  {
    markerId: 'vitamin_d',
    name: 'Vitamin D (ויטמין D)',
    shortName: 'ויטמין D',
    unit: 'ng/mL',
    min: 8,
    max: 100,
    step: 1,
    optimalTarget: 45,
    description: 'חיוני לעצמות, לשרירים ולמערכת החיסון',
    improvementDirection: 'higher',
  },
  {
    markerId: 'alt',
    name: 'ALT (אנזים כבד)',
    shortName: 'ALT',
    unit: 'U/L',
    min: 8,
    max: 120,
    step: 1,
    optimalTarget: 22,
    description: 'משקף עומס וגירוי על תאי הכבד',
    improvementDirection: 'lower',
  },
  {
    markerId: 'crp',
    name: 'CRP (מדד דלקת)',
    shortName: 'CRP',
    unit: 'mg/L',
    min: 0.1,
    max: 25.0,
    step: 0.1,
    optimalTarget: 1.0,
    description: 'מדד רגיש לקיומה של דלקת או זיהום',
    improvementDirection: 'lower',
  },
  {
    markerId: 'creatinine',
    name: 'Creatinine (תפקודי כליה)',
    shortName: 'קריאטינין',
    unit: 'mg/dL',
    min: 0.4,
    max: 2.5,
    step: 0.01,
    optimalTarget: 0.85,
    description: 'משקף את כושר הסינון של הכליות',
    improvementDirection: 'lower',
  },
];

// Helper to calculate a 0-100 overall score
function calculateHealthScore(result: AnalysisResult | null): number {
  if (!result || result.analysis.length === 0) return 0;
  const total = result.analysis.length;
  const normal = result.summary.normal;
  const warning = result.summary.warning;
  // Weight: Normal = 100%, Warning = 55%, Danger = 0%
  const score = Math.round(((normal * 100 + warning * 55) / total));
  return Math.min(100, Math.max(0, score));
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  initialResult,
  patient,
}) => {
  // Extract initial numeric values from initialResult
  const baselineValues: Record<string, number> = useMemo(() => {
    const map: Record<string, number> = {};
    if (initialResult?.analysis) {
      initialResult.analysis.forEach((item) => {
        map[item.markerId] = item.result;
      });
    } else {
      // Defaults if no result provided
      map.glucose = 108;
      map.hba1c = 5.9;
      map.ldl = 138;
      map.hdl = 38;
      map.triglycerides = 190;
      map.hemoglobin = 11.2;
      map.ferritin = 14;
      map.vitamin_d = 22;
      map.alt = 38;
      map.crp = 3.5;
      map.creatinine = 0.92;
    }
    return map;
  }, [initialResult]);

  // Current simulated values state
  const [simValues, setSimValues] = useState<Record<string, number>>(baselineValues);

  // Sync when baselineValues changes
  React.useEffect(() => {
    setSimValues(baselineValues);
  }, [baselineValues]);

  // Real-time analysis of baseline and simulated values
  const effectivePatient = initialResult?.patient || patient;

  const baselineAnalysis = useMemo(() => {
    return initialResult || analyzeBloodTest(baselineValues, effectivePatient);
  }, [initialResult, baselineValues, effectivePatient]);

  const simulatedAnalysis = useMemo(() => {
    return analyzeBloodTest(simValues, effectivePatient);
  }, [simValues, effectivePatient]);

  const baselineScore = useMemo(() => calculateHealthScore(baselineAnalysis), [baselineAnalysis]);
  const simulatedScore = useMemo(() => calculateHealthScore(simulatedAnalysis), [simulatedAnalysis]);
  const scoreDelta = simulatedScore - baselineScore;

  // Handle single slider change
  const handleSliderChange = (markerId: string, val: number) => {
    setSimValues((prev) => ({
      ...prev,
      [markerId]: val,
    }));
  };

  // Reset to original values
  const handleResetToBaseline = () => {
    setSimValues(baselineValues);
  };

  // Preset 1: Optimize All Targets
  const handleApplyOptimalTargets = () => {
    const next = { ...simValues };
    ACTIONABLE_SLIDERS.forEach((slider) => {
      if (next[slider.markerId] !== undefined) {
        next[slider.markerId] = slider.optimalTarget;
      }
    });
    setSimValues(next);
  };

  // Preset 2: Improve Metabolic & Lipids
  const handleImproveMetabolic = () => {
    setSimValues((prev) => ({
      ...prev,
      hba1c: 5.4,
      glucose: 88,
      ldl: 92,
      hdl: 52,
      triglycerides: 110,
    }));
  };

  // Preset 3: Improve Iron & Blood Reserves
  const handleImproveIron = () => {
    setSimValues((prev) => ({
      ...prev,
      hemoglobin: 13.6,
      ferritin: 65,
    }));
  };

  // Synergy Rules Comparison
  const baselineSynergies = baselineAnalysis.contextFindings || [];
  const simulatedSynergies = simulatedAnalysis.contextFindings || [];
  const resolvedSynergies = useMemo(() => {
    const simIds = new Set(simulatedSynergies.map((s) => s.ruleId));
    return baselineSynergies.filter((b) => !simIds.has(b.ruleId));
  }, [baselineSynergies, simulatedSynergies]);

  // Visible sliders (only show sliders that exist in baseline values, plus at least 6 standard ones)
  const visibleSliders = useMemo(() => {
    return ACTIONABLE_SLIDERS.filter(
      (s) => simValues[s.markerId] !== undefined
    );
  }, [simValues]);

  // Generate real-time clinical commentary
  const clinicalCommentary = useMemo(() => {
    const changes: string[] = [];

    if (simValues.hba1c !== undefined && baselineValues.hba1c !== undefined) {
      const delta = simValues.hba1c - baselineValues.hba1c;
      if (delta <= -0.4) {
        changes.push(
          `הפחתת ה-HbA1c ב-${Math.abs(delta).toFixed(1)}% משפרת באופן דרמטי את הרגישות לאינסולין ומפחיתה סיכון לסיבוכים כלי-דמיים.`
        );
      }
    }

    if (simValues.ldl !== undefined && baselineValues.ldl !== undefined) {
      const delta = simValues.ldl - baselineValues.ldl;
      if (delta <= -20) {
        changes.push(
          `הורדת ה-LDL ב-${Math.abs(delta)} mg/dL מקטינה משמעותית את קצב הצטברות הרובד הטרשתי בעורקי הלב.`
        );
      }
    }

    if (simValues.hdl !== undefined && baselineValues.hdl !== undefined) {
      const delta = simValues.hdl - baselineValues.hdl;
      if (delta >= 8) {
        changes.push(
          `עליית ה-HDL ב-${delta} mg/dL (דרך פעילות אירובית ותזונה ים-תיכונית) מעניקה הגנה ביולוגית פעילה לכלי הדם.`
        );
      }
    }

    if (simValues.ferritin !== undefined && baselineValues.ferritin !== undefined) {
      const delta = simValues.ferritin - baselineValues.ferritin;
      if (delta >= 20) {
        changes.push(
          `מילוי מאגרי הברזל (פריטין) מחזיר אנרגיה, משפר את כושר הריכוז ומונע התפתחות אנמיה.`
        );
      }
    }

    if (changes.length === 0) {
      return 'הזיזו את המחוונים מטה כדי לדמות השפעה של שינויי תזונה, פעילות גופנית או תוספים מותאמים על פרופיל הבריאות שלך.';
    }

    return changes.join(' ');
  }, [simValues, baselineValues]);

  return (
    <section className="card simulator-card" aria-label="סימולטור שיפור מדדים וסיכונים">
      {/* Header */}
      <div className="card__header simulator-header">
        <div className="simulator-title-group">
          <div className="simulator-icon-badge">
            <Sliders size={24} />
          </div>
          <div>
            <h3 className="simulator-title">סימולטור 'מה אם?' — הדמיית שיפור מדדים</h3>
            <p className="muted small">
              הזיזו את המחוונים כדי לראות כיצד שינויים תזונתיים ואורח חיים משפרים את ציון הבריאות ומנטרלים שילובי סיכון
            </p>
          </div>
        </div>

        {/* Reset Button */}
        <button
          type="button"
          className="btn--ghost btn--small"
          onClick={handleResetToBaseline}
          title="אפס את כל המחוונים לתוצאות המקוריות"
        >
          <RotateCcw size={14} />
          <span>אפס למקור</span>
        </button>
      </div>

      {/* Impact Score Comparison Bar */}
      <div className="simulator-score-panel">
        <div className="simulator-score-col">
          <span className="small muted font-semibold">ציון בריאות מקורי:</span>
          <div className="simulator-score-val-wrap">
            <span className="simulator-score-num font-mono">{baselineScore}</span>
            <span className="simulator-score-max small muted">/ 100</span>
          </div>
          <div className="simulator-score-counts small">
            <span className="text-emerald">{baselineAnalysis.summary.normal} תקינים</span>
            <span className="muted">•</span>
            <span className="text-amber">{baselineAnalysis.summary.warning} גבוליים</span>
            <span className="muted">•</span>
            <span className="text-rose">{baselineAnalysis.summary.danger} חריגים</span>
          </div>
        </div>

        <div className="simulator-score-arrow">
          <div className="simulator-arrow-circle">
            <ArrowLeft size={18} />
          </div>
          {scoreDelta !== 0 && (
            <span
              className={`badge ${
                scoreDelta > 0 ? 'badge--normal' : 'badge--danger'
              } simulator-delta-badge font-mono`}
            >
              {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta} נקודות
            </span>
          )}
        </div>

        <div className="simulator-score-col simulator-score-col--sim">
          <span className="small text-primary font-semibold">ציון לאחר שיפור מדומה:</span>
          <div className="simulator-score-val-wrap">
            <span className="simulator-score-num font-mono text-primary">{simulatedScore}</span>
            <span className="simulator-score-max small muted">/ 100</span>
          </div>
          <div className="simulator-score-counts small">
            <span className="text-emerald">{simulatedAnalysis.summary.normal} תקינים</span>
            <span className="muted">•</span>
            <span className="text-amber">{simulatedAnalysis.summary.warning} גבוליים</span>
            <span className="muted">•</span>
            <span className="text-rose">{simulatedAnalysis.summary.danger} חריגים</span>
          </div>
        </div>
      </div>

      {/* Quick Preset Buttons */}
      <div className="simulator-presets-bar">
        <span className="simulator-presets-label">
          <Sparkles size={15} className="text-primary" />
          <strong>סימולציות מהירות:</strong>
        </span>
        <div className="simulator-presets-btns">
          <button
            type="button"
            className="simulator-preset-btn"
            onClick={handleApplyOptimalTargets}
          >
            <Target size={14} className="text-emerald" />
            <span>יעדים אופטימליים מלאים</span>
          </button>
          <button
            type="button"
            className="simulator-preset-btn"
            onClick={handleImproveMetabolic}
          >
            <Zap size={14} className="text-amber" />
            <span>איזון סוכר ושומנים</span>
          </button>
          <button
            type="button"
            className="simulator-preset-btn"
            onClick={handleImproveIron}
          >
            <Heart size={14} className="text-rose" />
            <span>שיקום מאגרי ברזל</span>
          </button>
        </div>
      </div>

      {/* Dynamic Clinical Commentary Box */}
      <div className="simulator-commentary-box">
        <div className="simulator-commentary-header">
          <Sparkles size={16} className="text-primary" />
          <span className="font-semibold small">השפעה פיזיולוגית ורפואית של השינויים:</span>
        </div>
        <p className="small simulator-commentary-text">{clinicalCommentary}</p>
      </div>

      {/* Resolved Synergy Risks Alerts */}
      {resolvedSynergies.length > 0 && (
        <div className="simulator-resolved-synergies">
          <div className="resolved-synergy-header">
            <ShieldCheck size={18} className="text-emerald" />
            <span className="font-semibold small">
              שילובי סיכון שנוטרלו בהצלחה בסימולציה ({resolvedSynergies.length}):
            </span>
          </div>
          <div className="resolved-synergy-chips">
            {resolvedSynergies.map((rule) => (
              <span key={rule.ruleId} className="resolved-chip">
                <CheckCircle2 size={14} />
                <span>{rule.headline}</span>
                <span className="badge badge--normal chip-badge">נוטרל! ✨</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sliders Grid */}
      <div className="simulator-sliders-grid">
        {visibleSliders.map((slider) => {
          const currentVal = simValues[slider.markerId] ?? slider.optimalTarget;
          const origVal = baselineValues[slider.markerId];
          const hasChanged = origVal !== undefined && Math.abs(currentVal - origVal) > 0.001;
          const delta = origVal !== undefined ? currentVal - origVal : 0;

          const marker = BIOMARKERS_BY_ID[slider.markerId];
          const evaluation = marker ? marker.evaluate(currentVal, effectivePatient?.sex) : null;

          return (
            <div
              key={slider.markerId}
              className={`slider-box slider-box--${evaluation?.severity || 'normal'} ${
                hasChanged ? 'slider-box--modified' : ''
              }`}
            >
              {/* Slider Header */}
              <div className="slider-box__header">
                <div>
                  <span className="slider-box__name font-semibold">{slider.name}</span>
                  <span className="slider-box__desc small muted">{slider.description}</span>
                </div>

                <div className="slider-box__val-group">
                  <span className="slider-box__current-val font-mono">
                    {currentVal} {slider.unit}
                  </span>
                  {evaluation && (
                    <span className={`badge badge--${evaluation.severity} chip-badge`}>
                      {evaluation.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Slider Control */}
              <div className="slider-box__control-wrap">
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={currentVal}
                  onChange={(e) =>
                    handleSliderChange(slider.markerId, parseFloat(e.target.value))
                  }
                  className="simulator-range-input"
                  aria-label={`מחוון עבור ${slider.name}`}
                />
              </div>

              {/* Slider Footer Meta */}
              <div className="slider-box__footer">
                <span className="small muted">
                  יעד מומלץ: <strong className="font-mono">{slider.optimalTarget} {slider.unit}</strong>
                </span>

                {hasChanged && (
                  <div className="slider-box__delta small font-mono">
                    {delta > 0 ? (
                      <span className="text-amber flex items-center gap-1">
                        <TrendingUp size={13} /> +{delta.toFixed(slider.step < 1 ? 1 : 0)}
                      </span>
                    ) : (
                      <span className="text-emerald flex items-center gap-1">
                        <TrendingDown size={13} /> {delta.toFixed(slider.step < 1 ? 1 : 0)}
                      </span>
                    )}
                    <span className="muted small">(מקור: {origVal})</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default WhatIfSimulator;
