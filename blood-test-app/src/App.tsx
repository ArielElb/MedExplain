import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ScenariosPage from './pages/ScenariosPage';
import ResultsPage from './pages/ResultsPage';
import VisitBriefPage from './pages/VisitBriefPage';
import AboutPage from './pages/AboutPage';
import { useAnalysis } from './hooks/useAnalysis';
import { useLocalHistory } from './hooks/useLocalHistory';
import { useTheme } from './hooks/useTheme';
import { NavigationPage, PatientContext, PatientScenario, AnalysisResult } from './types';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<NavigationPage>('home');
  const { result, errors, analyze, analyzeDirect, setResult } = useAnalysis();
  const history = useLocalHistory();
  const { theme, toggleTheme } = useTheme();

  const [formInitialValues, setFormInitialValues] = useState<Record<string, string>>({});
  const [patientContext, setPatientContext] = useState<PatientContext | undefined>(undefined);

  const handleNavigate = (page: NavigationPage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectScenario = (scenario: PatientScenario) => {
    // Convert numeric values to strings for form compatibility
    const strValues: Record<string, string> = {};
    Object.entries(scenario.values).forEach(([k, v]) => {
      strValues[k] = String(v);
    });

    const patient: PatientContext = {
      id: scenario.id,
      name: scenario.name,
      age: scenario.age,
      sex: scenario.sex,
      context: scenario.context,
      notes: scenario.notes,
      contextTags: scenario.context_tags,
    };

    setFormInitialValues(strValues);
    setPatientContext(patient);

    // Run direct analysis
    const analysis = analyzeDirect(scenario.values, patient, scenario.previous_values);
    if (analysis) {
      history.save(analysis);
    }

    // Navigate to results page
    setActivePage('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitForm = (
    values: Record<string, string>,
    patient?: PatientContext,
    previousValues?: Record<string, number>
  ) => {
    setFormInitialValues(values);
    setPatientContext(patient);

    const analysis = analyze(values, patient, previousValues);
    if (analysis) {
      history.save(analysis);
    }
  };

  const handleSelectHistory = (item: AnalysisResult) => {
    setResult(item);
    if (item.patient) {
      setPatientContext(item.patient);
    }
    const strValues: Record<string, string> = {};
    item.analysis.forEach((a) => {
      strValues[a.markerId] = String(a.result);
    });
    setFormInitialValues(strValues);
    setActivePage('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-layout">
      {/* Top Navigation Bar with Dark/Light Toggle */}
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        hasResults={Boolean(result)}
        resultsCount={result ? result.analysis.length : 0}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="container main-content">
        {activePage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectScenario={handleSelectScenario}
            hasResults={Boolean(result)}
          />
        )}

        {activePage === 'scenarios' && (
          <ScenariosPage onSelectScenario={handleSelectScenario} />
        )}

        {activePage === 'results' && (
          <ResultsPage
            result={result}
            errors={errors}
            initialValues={formInitialValues}
            initialPatient={patientContext}
            onSubmitForm={handleSubmitForm}
            onNavigateToVisitBrief={() => handleNavigate('visit-brief')}
            history={{
              items: history.items,
              enabled: history.enabled,
              available: history.available,
              toggle: history.toggle,
              select: handleSelectHistory,
              remove: history.remove,
              clearAll: history.clearAll,
            }}
          />
        )}

        {activePage === 'visit-brief' && (
          <VisitBriefPage
            result={result}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'about' && <AboutPage />}
      </main>

      {/* App Footer */}
      <footer className="footer no-print">
        <div className="container">
          <p className="footer-warning">
            נבנה למטרות הסברה והעצמת המטופל/ת. המידע אינו מהווה אבחנה רפואית, המלצה על טיפול או תחליף לייעוץ מקצועי.
            במקרה של תסמינים חריגים או שינוי בהרגשה — יש לפנות לבדיקת רופא/ה בהקדם. במצב חירום יש לפנות למוקד מד״א (101).
          </p>
          <div className="footer-meta">
            <p className="small muted">
              MedExplain AI • 100% פרטי ומקומי • כל החישובים מבוצעים בדפדפן שלך בלבד
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
