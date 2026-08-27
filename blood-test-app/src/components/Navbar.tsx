import React from 'react';
import {
  HeartPulse,
  Home,
  Users,
  Activity,
  FileSpreadsheet,
  Info,
  ShieldCheck,
  Sun,
  Moon,
} from 'lucide-react';
import { NavigationPage } from '../types';

interface Props {
  activePage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  hasResults: boolean;
  resultsCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Navbar: React.FC<Props> = ({
  activePage,
  onNavigate,
  hasResults,
  resultsCount,
  theme,
  onToggleTheme,
}) => {
  const navItems = [
    { id: 'home' as NavigationPage, label: 'עמוד ראשי', icon: <Home size={18} /> },
    {
      id: 'scenarios' as NavigationPage,
      label: 'דוגמאות מטופלים',
      icon: <Users size={18} />,
      badge: '12 דוגמאות',
    },
    {
      id: 'results' as NavigationPage,
      label: 'התוצאות שלי',
      icon: <Activity size={18} />,
      badge: hasResults ? `${resultsCount} מדדים` : undefined,
      badgeClass: hasResults ? 'badge--primary-filled' : undefined,
    },
    {
      id: 'visit-brief' as NavigationPage,
      label: 'הכנה לרופא',
      icon: <FileSpreadsheet size={18} />,
      badge: hasResults ? 'מוכן' : undefined,
      badgeClass: 'badge--normal',
    },
    { id: 'about' as NavigationPage, label: 'אודות ובטיחות', icon: <Info size={18} /> },
  ];

  return (
    <header className="navbar no-print">
      <div className="navbar__container">
        {/* Brand Logo */}
        <div
          className="navbar__brand"
          onClick={() => onNavigate('home')}
          role="button"
          tabIndex={0}
          title="MedExplain AI - דף הבית"
        >
          <div className="navbar__logo-icon-wrapper">
            <HeartPulse size={24} className="navbar__logo-icon" />
          </div>
          <div className="navbar__brand-text">
            <span className="navbar__title">MedExplain <span className="navbar__title-ai">AI</span></span>
            <span className="navbar__subtitle">פענוח והסבר בדיקות דם</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="navbar__nav">
          <ul className="navbar__list">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <li key={item.id} className="navbar__item">
                  <button
                    type="button"
                    className={`navbar__link ${isActive ? 'navbar__link--active' : ''}`}
                    onClick={() => onNavigate(item.id)}
                  >
                    <span className="navbar__link-icon">{item.icon}</span>
                    <span className="navbar__link-label">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`navbar__badge ${
                          item.badgeClass || (isActive ? 'navbar__badge--active' : '')
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Actions (Theme toggle + Privacy Pill) */}
        <div className="navbar__actions">
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'מעבר למצב בהיר' : 'מעבר למצב כהה (Dark Mode)'}
            aria-label="החלף מצב תצוגה"
          >
            {theme === 'dark' ? (
              <Sun size={18} className="text-amber" />
            ) : (
              <Moon size={18} className="text-slate" />
            )}
            <span className="theme-toggle-label">{theme === 'dark' ? 'בהיר' : 'כהה'}</span>
          </button>

          <div className="navbar__privacy-pill" title="100% חישוב מקומי בדפדפן - ללא שרת וללא מאגר נתונים">
            <ShieldCheck size={16} className="text-emerald" />
            <span className="privacy-pill-text">100% פרטי</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
