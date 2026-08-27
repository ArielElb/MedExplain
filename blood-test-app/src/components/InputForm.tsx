import React, { useMemo, useState, useEffect } from 'react';
import { Biomarker, DemoPreset, PatientContext } from '../types';
import { DEMO_PRESETS } from '../data/biomarkers';
import SmartPasteModal from './SmartPasteModal';
import {
  FlaskConical,
  RotateCcw,
  Search,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Filter,
  Check,
  User,
  FileText,
} from 'lucide-react';

interface Props {
  markers: Biomarker[];
  initialValues?: Record<string, string>;
  initialPatient?: PatientContext;
  onSubmit: (
    values: Record<string, string>,
    patient?: PatientContext,
    previousValues?: Record<string, number>
  ) => void;
}

const InputForm: React.FC<Props> = ({
  markers,
  initialValues = {},
  initialPatient,
  onSubmit,
}) => {
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [patientName, setPatientName] = useState(initialPatient?.name || '');
  const [patientAge, setPatientAge] = useState(initialPatient?.age ? String(initialPatient.age) : '');
  const [patientSex, setPatientSex] = useState<'male' | 'female'>(initialPatient?.sex || 'female');
  const [patientContext, setPatientContext] = useState(initialPatient?.context || '');
  const [showDemographics, setShowDemographics] = useState(Boolean(initialPatient?.name || initialPatient?.age));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePresetNotification, setActivePresetNotification] = useState<string | null>(null);
  const [previousValuesState, setPreviousValuesState] = useState<Record<string, number> | undefined>(undefined);
  const [isSmartPasteOpen, setIsSmartPasteOpen] = useState(false);

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setValues(initialValues);
    }
  }, [initialValues]);

  useEffect(() => {
    if (initialPatient) {
      if (initialPatient.name) setPatientName(initialPatient.name);
      if (initialPatient.age) setPatientAge(String(initialPatient.age));
      if (initialPatient.sex) setPatientSex(initialPatient.sex);
      if (initialPatient.context) setPatientContext(initialPatient.context);
    }
  }, [initialPatient]);

  // Group all categories
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    markers.forEach((m) => set.add(m.category));
    return Array.from(set);
  }, [markers]);

  // Filter markers based on search and category
  const filteredMarkers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return markers.filter((marker) => {
      const matchesCategory =
        selectedCategory === 'all' || marker.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!query) return true;
      return (
        marker.name.toLowerCase().includes(query) ||
        marker.markerId.toLowerCase().includes(query) ||
        (marker.abbreviation && marker.abbreviation.toLowerCase().includes(query)) ||
        marker.category.toLowerCase().includes(query) ||
        marker.description.toLowerCase().includes(query)
      );
    });
  }, [markers, searchQuery, selectedCategory]);

  // Group filtered markers by category for structured layout
  const groupedCategories = useMemo(() => {
    const map = new Map<string, Biomarker[]>();
    filteredMarkers.forEach((marker) => {
      const list = map.get(marker.category) || [];
      list.push(marker);
      map.set(marker.category, list);
    });
    return Array.from(map.entries());
  }, [filteredMarkers]);

  const handleChange = (markerId: string, value: string) => {
    setValues((prev) => ({ ...prev, [markerId]: value }));
  };

  const handleClearMarker = (markerId: string) => {
    setValues((prev) => {
      const next = { ...prev };
      delete next[markerId];
      return next;
    });
  };

  const handleLoadPreset = (preset: DemoPreset) => {
    setValues(preset.values);
    if (preset.patient) {
      setPatientName(preset.patient.name || '');
      setPatientAge(preset.patient.age ? String(preset.patient.age) : '');
      setPatientSex(preset.patient.sex || 'female');
      setPatientContext(preset.patient.context || '');
      setShowDemographics(true);
    }
    setPreviousValuesState(preset.previousValues);
    setActivePresetNotification(`נטענו נתוני דוגמה: "${preset.title}" (${Object.keys(preset.values).length} מדדים)`);
    setTimeout(() => setActivePresetNotification(null), 4000);
  };

  const handleClearAll = () => {
    setValues({});
    setPreviousValuesState(undefined);
    setActivePresetNotification('כל הערכים נוקו בהצלחה');
    setTimeout(() => setActivePresetNotification(null), 3000);
  };

  const handleSmartImport = (importedValues: Record<string, string>, patient?: Partial<PatientContext>) => {
    setValues((prev) => ({ ...prev, ...importedValues }));
    if (patient) {
      if (patient.name) setPatientName(patient.name);
      if (patient.age) setPatientAge(String(patient.age));
      if (patient.sex) setPatientSex(patient.sex);
      if (patient.context) setPatientContext(patient.context);
      setShowDemographics(true);
    }
    const count = Object.keys(importedValues).length;
    setActivePresetNotification(`יובאו בהצלחה ${count} מדדים מטופס הבדיקה!`);
    setTimeout(() => setActivePresetNotification(null), 3500);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const patientObj: PatientContext | undefined =
      patientName || patientAge || patientContext
        ? {
            name: patientName.trim() || undefined,
            age: patientAge ? parseInt(patientAge, 10) : undefined,
            sex: patientSex,
            context: patientContext.trim() || undefined,
          }
        : undefined;

    onSubmit(values, patientObj, previousValuesState);
  };

  const filledCount = Object.values(values).filter((v) => v.trim() !== '').length;

  // Realtime quick evaluation for live input feedback
  const getLiveFeedback = (marker: Biomarker, valStr: string) => {
    if (!valStr || valStr.trim() === '') return null;
    const num = parseFloat(valStr);
    if (isNaN(num)) return null;

    const evaluation = marker.evaluate(num, patientSex);
    switch (evaluation.severity) {
      case 'normal':
        return { text: 'בטווח תקין', class: 'input-feedback--normal', icon: <CheckCircle2 size={13} /> };
      case 'warning':
        return { text: 'ערך גבולי', class: 'input-feedback--warning', icon: <AlertTriangle size={13} /> };
      case 'danger':
        return { text: 'חורג מהטווח', class: 'input-feedback--danger', icon: <AlertCircle size={13} /> };
    }
  };

  return (
    <>
      <form className="card form-card no-print" onSubmit={handleSubmit}>
        {/* Form Header */}
        <div className="card__header form-card__header">
          <div className="form-card__title-group">
            <h2>
              <FlaskConical size={24} className="icon-flask" /> הזנת ערכי בדיקות דם
            </h2>
            <p className="form-card__subtitle">
              הזינו את הערכים המופיעים בטופס הבדיקה שלכם (אין חובה למלא הכל — מספיק מדד אחד).
            </p>
          </div>

          <div className="form-card__badges">
            <button
              type="button"
              className="btn--smart-paste-trigger"
              onClick={() => setIsSmartPasteOpen(true)}
              title="הדבק טקסט של בדיקת דם מכללית/מכבי/PDF לייבוא מהיר"
            >
              <FileText size={15} />
              <span>הדבק טופס מקופת חולים</span>
              <Sparkles size={12} className="text-amber" />
            </button>

            <button
              type="button"
              className="btn--ghost btn--small"
              onClick={() => setShowDemographics(!showDemographics)}
            >
              <User size={15} />
              <span>{showDemographics ? 'הסתר פרטי מטופל/ת' : 'הוסף פרטי מטופל/ת'}</span>
            </button>
            <span className={`badge ${filledCount > 0 ? 'badge--primary-filled' : 'badge--muted'}`}>
              {filledCount} מתוך {markers.length} מדדים הוזנו
            </span>
          </div>
        </div>

      {/* Patient Demographics Optional Bar */}
      {showDemographics && (
        <div className="demographics-form-section">
          <div className="demographics-form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="patient-name-input">שם המטופל/ת (אופציונלי):</label>
              <input
                id="patient-name-input"
                type="text"
                className="form-input"
                placeholder="לדוגמה: ישראל ישראלי"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>

            <div className="form-group form-group--small">
              <label className="form-label" htmlFor="patient-age-input">גיל:</label>
              <input
                id="patient-age-input"
                type="number"
                min="0"
                max="120"
                className="form-input"
                placeholder="גיל"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
              />
            </div>

            <div className="form-group form-group--small">
              <label className="form-label">מין ביולוגי:</label>
              <div className="sex-toggle-group">
                <button
                  type="button"
                  className={`sex-toggle-btn ${patientSex === 'female' ? 'sex-toggle-btn--active' : ''}`}
                  onClick={() => setPatientSex('female')}
                >
                  נקבה
                </button>
                <button
                  type="button"
                  className={`sex-toggle-btn ${patientSex === 'male' ? 'sex-toggle-btn--active' : ''}`}
                  onClick={() => setPatientSex('male')}
                >
                  זכר
                </button>
              </div>
            </div>

            <div className="form-group form-group--full">
              <label className="form-label" htmlFor="patient-context-input">רקע רפואי / סיבת הבדיקה (אופציונלי):</label>
              <input
                id="patient-context-input"
                type="text"
                className="form-input"
                placeholder="לדוגמה: מעקב שגרתי שנתי, בירור עייפות, תזונה צמחונית, היסטוריה משפחתית..."
                value={patientContext}
                onChange={(e) => setPatientContext(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Preset / Sample Data Loader Bar */}
      <div className="preset-bar">
        <div className="preset-bar__header">
          <span className="preset-bar__label">
            <Sparkles size={16} className="icon-sparkle" />
            <strong>טעינה מהירה של דוגמאות:</strong>
          </span>
          <span className="muted small">לחצו לטעינה מיידית של נתוני בדיקה להדגמה</span>
        </div>

        <div className="preset-bar__buttons">
          {DEMO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`preset-btn preset-btn--${preset.badgeSeverity}`}
              onClick={() => handleLoadPreset(preset)}
              title={preset.subtitle}
            >
              <span className="preset-btn__title">{preset.title}</span>
              <span className={`badge badge--${preset.badgeSeverity} preset-btn__badge`}>
                {preset.badge}
              </span>
            </button>
          ))}
        </div>

        {activePresetNotification && (
          <div className="preset-notification">
            <Check size={16} />
            <span>{activePresetNotification}</span>
          </div>
        )}
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="filter-toolbar">
        {/* Search Input */}
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="חיפוש מדד (לדוגמה: גלוקוז, WBC, ברזל, כבד, כליות, TSH)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="נקה חיפוש"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="category-pills" role="tablist">
          <button
            type="button"
            className={`category-pill ${selectedCategory === 'all' ? 'category-pill--active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            הכל
            <span className="pill-count">{markers.length}</span>
          </button>
          {categoriesList.map((cat) => {
            const count = markers.filter((m) => m.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                className={`category-pill ${selectedCategory === cat ? 'category-pill--active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
                <span className="pill-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Biomarker Inputs Container */}
      {groupedCategories.length === 0 ? (
        <div className="empty-search">
          <Filter size={32} className="muted" />
          <p>לא נמצאו מדדים התואמים לחיפוש "{searchQuery}".</p>
          <button
            type="button"
            className="btn--ghost btn--small"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
          >
            איפוס סינונים
          </button>
        </div>
      ) : (
        groupedCategories.map(([category, list]) => (
          <fieldset className="fieldset" key={category}>
            <legend className="fieldset__legend">
              <span className="legend-text">{category}</span>
              <span className="legend-count">({list.length})</span>
            </legend>

            <div className="form-grid">
              {list.map((marker) => {
                const currentVal = values[marker.markerId] ?? '';
                const liveFeedback = getLiveFeedback(marker, currentVal);
                const displayRef =
                  typeof marker.reference === 'string'
                    ? marker.reference
                    : patientSex === 'male'
                    ? marker.reference.male
                    : marker.reference.female;

                return (
                  <div
                    className={`input-card ${currentVal ? 'input-card--has-value' : ''}`}
                    key={marker.markerId}
                  >
                    <div className="input-card__header">
                      <label htmlFor={marker.markerId} className="input-card__label">
                        <span className="marker-name">{marker.name}</span>
                        <span className="marker-unit">({marker.unit})</span>
                      </label>
                      <div className="input-card__ref-info" title={marker.description}>
                        <span className="ref-pill">נורמה: {displayRef}</span>
                      </div>
                    </div>

                    <div className="input-field-wrapper">
                      <input
                        id={marker.markerId}
                        name={marker.markerId}
                        type="number"
                        inputMode="decimal"
                        autoComplete="off"
                        step={marker.step}
                        min={marker.min}
                        max={marker.max}
                        placeholder={`הזינו ערך (${marker.unit})`}
                        value={currentVal}
                        onChange={(event) => handleChange(marker.markerId, event.target.value)}
                        className={`biomarker-input ${liveFeedback ? liveFeedback.class : ''}`}
                      />

                      {currentVal && (
                        <button
                          type="button"
                          className="input-clear-single"
                          onClick={() => handleClearMarker(marker.markerId)}
                          title="נקה ערך זה"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Live status feedback badge below input */}
                    {liveFeedback && (
                      <div className={`live-feedback-pill ${liveFeedback.class}`}>
                        {liveFeedback.icon}
                        <span>{liveFeedback.text}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </fieldset>
        ))
      )}

      {/* Action Submit & Reset Footer */}
      <div className="form-actions">
        <button
          type="submit"
          className="btn--submit"
          disabled={filledCount === 0}
        >
          <FlaskConical size={20} />
          <span>
            {filledCount === 0
              ? 'הזינו לפחות ערך אחד להסבר'
              : `קבל הסבר ופענוח ל-${filledCount} מדדים`}
          </span>
        </button>

        {filledCount > 0 && (
          <button
            type="button"
            className="btn--ghost btn--clear"
            onClick={handleClearAll}
          >
            <RotateCcw size={16} />
            <span>נקה הכל</span>
          </button>
        )}
      </div>
    </form>

    <SmartPasteModal
      isOpen={isSmartPasteOpen}
      onClose={() => setIsSmartPasteOpen(false)}
      onImport={handleSmartImport}
    />
  </>
  );
};

export default InputForm;
