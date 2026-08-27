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
  Bot,
  Sparkles,
} from 'lucide-react';
import { NavigationPage } from '../types';

interface Props {
  activePage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  hasResults: boolean;
  resultsCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenChat?: () => void;
}

const Navbar: React.FC<Props> = ({
  activePage,
  onNavigate,
  hasResults,
  resultsCount,
  theme,
  onToggleTheme,
  onOpenChat,
}) => {
  const navItems = [
    { id: 'home' as NavigationPage, label: 'ראשי', fullLabel: 'עמוד ראשי', icon: <Home size={19} /> },
    {
      id: 'scenarios' as NavigationPage,
      label: 'דוגמאות',
      fullLabel: 'דוגמאות מטופלים',
      icon: <Users size={19} />,
      badge: '12',
      fullBadge: '12 דוגמאות',
    },
    {
      id: 'results' as NavigationPage,
      label: 'תוצאות',
      fullLabel: 'התוצאות שלי',
      icon: <Activity size={19} />,
      badge: hasResults ? String(resultsCount) : undefined,
      fullBadge: hasResults ? `${resultsCount} מדדים` : undefined,
      badgeClass: hasResults ? 'badge--primary-filled' : undefined,
    },
    {
      id: 'visit-brief' as NavigationPage,
      label: 'הכנה לרופא',
      fullLabel: 'הכנה לרופא',
      icon: <FileSpreadsheet size={19} />,
      badge: hasResults ? '✓' : undefined,
      fullBadge: hasResults ? 'מוכן' : undefined,
      badgeClass: 'badge--normal',
    },
    { id: 'about' as NavigationPage, label: 'אודות', fullLabel: 'אודות ובטיחות', icon: <Info size={19} /> },
  ];

  return (
    <>
      {/* Top Header Bar */}
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
              <HeartPulse size={22} className="navbar__logo-icon" />
            </div>
            <div className="navbar__brand-text">
              <span className="navbar__title">
                MedExplain <span className="navbar__title-ai">AI</span>
              </span>
              <span className="navbar__subtitle">פענוח והסבר בדיקות דם</span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="navbar__nav navbar__nav--desktop">
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
                      <span className="navbar__link-label">{item.fullLabel}</span>
                      {item.fullBadge && (
                        <span
                          className={`navbar__badge ${
                            item.badgeClass || (isActive ? 'navbar__badge--active' : '')
                          }`}
                        >
                          {item.fullBadge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Actions (Chat button + Theme toggle + Privacy Pill) */}
          <div className="navbar__actions">
            {onOpenChat && (
              <button
                type="button"
                className="btn--nav-chat"
                onClick={onOpenChat}
                title="שאל את עוזר ה-AI של האתר"
              >
                <Bot size={17} />
                <span className="nav-chat-label">עוזר AI</span>
                <Sparkles size={11} className="nav-chat-sparkle" />
              </button>
            )}

            <button
              type="button"
              className="theme-toggle-btn"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'מעבר למצב בהיר' : 'מעבר למצב כהה (Dark Mode)'}
              aria-label="החלף מצב תצוגה"
            >
              {theme === 'dark' ? (
                <Sun size={17} className="text-amber" />
              ) : (
                <Moon size={17} className="text-slate" />
              )}
              <span className="theme-toggle-label">{theme === 'dark' ? 'בהיר' : 'כהה'}</span>
            </button>

            <div
              className="navbar__privacy-pill"
              title="100% חישוב מקומי בדפדפן - ללא שרת וללא מאגר נתונים"
            >
              <ShieldCheck size={15} className="text-emerald" />
              <span className="privacy-pill-text">100% פרטי</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Floating Bottom App Bar */}
      <nav className="mobile-bottom-nav no-print" aria-label="ניווט ראשי בנייד">
        <div className="mobile-bottom-nav__container">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`mobile-nav-btn ${isActive ? 'mobile-nav-btn--active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <div className="mobile-nav-icon-wrap">
                  {item.icon}
                  {item.badge && (
                    <span
                      className={`mobile-nav-badge ${
                        item.badgeClass === 'badge--primary-filled'
                          ? 'mobile-nav-badge--primary'
                          : ''
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="mobile-nav-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
