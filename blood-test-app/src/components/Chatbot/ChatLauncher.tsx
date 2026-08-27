import React from 'react';
import { Sparkles, X, Bot } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  hasResults: boolean;
  isAiConnected: boolean;
}

const ChatLauncher: React.FC<Props> = ({
  isOpen,
  onToggle,
  hasResults,
  isAiConnected,
}) => {
  return (
    <div className="chat-launcher-container no-print">
      <button
        type="button"
        className={`chat-launcher-pill ${isOpen ? 'chat-launcher-pill--open' : ''}`}
        onClick={onToggle}
        title={isOpen ? 'סגור שיחה עם העוזר הרפואי' : 'שאל את העוזר הרפואי החכם'}
        aria-label="פתח שיחה עם העוזר הרפואי"
      >
        <div className="launcher-icon-wrap">
          {isOpen ? (
            <X size={20} className="launcher-icon" />
          ) : (
            <>
              <Bot size={22} className="launcher-icon" />
              <Sparkles size={12} className="launcher-sparkle" />
            </>
          )}
        </div>

        <span className="launcher-text">
          {isOpen ? 'סגור שיחה' : hasResults ? 'שאל על התוצאות' : 'עוזר AI רפואי'}
        </span>

        {!isOpen && isAiConnected && (
          <span className="ai-active-indicator" title="Gemini AI מחובר" />
        )}
      </button>
    </div>
  );
};

export default ChatLauncher;
