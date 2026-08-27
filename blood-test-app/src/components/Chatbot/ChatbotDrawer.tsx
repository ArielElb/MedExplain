import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Key,
  Trash2,
  X,
  Copy,
  Check,
  Zap,
  Info,
  ShieldCheck,
  ChevronDown,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { AnalysisResult, PatientContext } from '../../types';
import {
  ChatMessage,
  getStoredApiKey,
  setStoredApiKey,
  getStoredActiveModel,
  queryGeminiAssistant,
  validateGeminiApiKey,
} from '../../lib/ai/geminiService';
import { generateOfflineAiResponse } from '../../lib/ai/offlineAiEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  result?: AnalysisResult | null;
  patient?: PatientContext;
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome_msg',
  sender: 'assistant',
  text: `שלום! אני **MedExplain AI Assistant** 🩺
אני כאן כדי לעזור לך להבין את תוצאות בדיקות הדם, להסביר את המשמעות של המדדים בגוף, ולהכין אותך לפגישה עם הרופא/ה.

💡 באפשרותך לבחור באחת מהשאלות המוכנות למטה או להקליד כל שאלה.`,
  timestamp: Date.now(),
};

const ChatbotDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  result,
  patient,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Key validation state
  const [testStatus, setTestStatus] = useState<{
    state: 'idle' | 'testing' | 'success' | 'error';
    message?: string;
  }>({ state: 'idle' });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const hasApiKey = Boolean(apiKey.trim());

  // Quick contextual prompt suggestions
  const getSuggestedPrompts = (): string[] => {
    if (!result || result.analysis.length === 0) {
      return [
        'איך לקרוא בדיקות דם שגרתיות?',
        'מה זה פריטין ולמה הוא חשוב?',
        'מה ההבדל בין כולסטרול LDL ל-HDL?',
        'מה אומר מדד סוכר HbA1c?',
      ];
    }

    const prompts = [
      'הסבר לי בשפה פשוטה את תוצאות הבדיקה',
      'איזה שאלות הכי חשוב לשאול את הרופא/ה?',
    ];

    if (result.contextFindings.length > 0) {
      prompts.push('מה המשמעות של השילוב בין המדדים שלי?');
    }

    if (result.trends.length > 0) {
      prompts.push('מה כיוון המגמות לעומת בדיקות קודמות?');
    }

    prompts.push('אילו שינויים בתזונה ובאורח חיים כדאי לבדוק?');
    return prompts;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      let botResponse = '';

      if (hasApiKey) {
        // Mode 1: Gemini Live AI with full system prompt & clinical context
        try {
          botResponse = await queryGeminiAssistant(
            text,
            messages,
            result,
            patient,
            apiKey
          );
        } catch (apiErr: any) {
          console.warn('Gemini API query fallback to offline engine:', apiErr);
          // Fallback to offline engine if API fails or quota exceeded
          botResponse = generateOfflineAiResponse(text, result, patient);
          botResponse = `*(הערה: הופעל מנוע קליני מקומי עקב שגיאת חיבור ל-API)*\n\n` + botResponse;
        }
      } else {
        // Mode 2: High-Performance Offline Deterministic Clinical Engine
        // Simulate a natural response delay (300ms)
        await new Promise((resolve) => setTimeout(resolve, 300));
        botResponse = generateOfflineAiResponse(text, result, patient);
      }

      const assistantMsg: ChatMessage = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        text: botResponse,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: 'מצטער, חלה שגיאה בעיבוד התשובה. אנא נסה שנית.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      setTestStatus({ state: 'error', message: 'נא להזין מפתח API לבדיקה' });
      return;
    }

    setTestStatus({ state: 'testing', message: 'בודק חיבור מול Google Gemini...' });

    const res = await validateGeminiApiKey(apiKey);
    if (res.valid) {
      setStoredApiKey(apiKey);
      setTestStatus({ state: 'success', message: res.message });
      setTimeout(() => {
        setIsSettingsOpen(false);
      }, 1500);
    } else {
      setTestStatus({ state: 'error', message: res.message });
    }
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    setStoredApiKey(key);
    setTestStatus({ state: 'success', message: 'המפתח נשמר בהצלחה!' });
    setTimeout(() => {
      setIsSettingsOpen(false);
    }, 1000);
  };

  const handleRemoveApiKey = () => {
    setApiKey('');
    setStoredApiKey('');
    setTestStatus({ state: 'idle' });
  };

  const handleClearChat = () => {
    setMessages([DEFAULT_WELCOME_MESSAGE]);
  };

  const handleCopyMessage = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  // Render text with simple bold and bullet styling
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      // Headers ### or ####
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="chat-msg-h3">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('#### ')) {
        return (
          <h5 key={idx} className="chat-msg-h4">
            {line.replace('#### ', '')}
          </h5>
        );
      }
      // Bullet point
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const content = line.trim().replace(/^[-*]\s+/, '');
        return (
          <div key={idx} className="chat-bullet-row">
            <span className="chat-bullet-dot">•</span>
            <span>{renderInlineBold(content)}</span>
          </div>
        );
      }
      // Standard line
      return (
        <p key={idx} className="chat-msg-p">
          {renderInlineBold(line)}
        </p>
      );
    });
  };

  const renderInlineBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="chat-drawer-backdrop no-print" onClick={onClose}>
      <div
        className="chat-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="חלון שיחה עם העוזר הרפואי"
      >
        {/* Chat Drawer Header */}
        <div className="chat-drawer__header">
          <div className="chat-header__title-group">
            <div className="chat-avatar">
              <Bot size={20} className="chat-avatar-icon" />
            </div>
            <div className="chat-header__text">
              <span className="chat-title">MedExplain AI</span>
              <span className="chat-subtitle">
                {hasApiKey ? (
                  <span className="engine-status engine-status--gemini">
                    <Sparkles size={11} /> {getStoredActiveModel()} מחובר
                  </span>
                ) : (
                  <span className="engine-status engine-status--offline">
                    <Zap size={11} /> מנוע קליני מקומי (Offline)
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="chat-header__actions">
            <button
              type="button"
              className={`chat-header-btn ${isSettingsOpen ? 'chat-header-btn--active' : ''}`}
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              title="הגדרות מנוע AI ובדיקת תקינות מפתח API"
            >
              <Key size={16} />
            </button>
            <button
              type="button"
              className="chat-header-btn"
              onClick={handleClearChat}
              title="נקה שיחה"
            >
              <Trash2 size={16} />
            </button>
            <button
              type="button"
              className="chat-header-btn"
              onClick={onClose}
              title="סגור חלון"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Settings Panel Popover (Gemini API Key configuration & Testing) */}
        {isSettingsOpen && (
          <div className="chat-settings-panel">
            <div className="settings-header">
              <div className="settings-title">
                <Sparkles size={15} className="text-primary" />
                <span>הגדרת חיבור ל-Gemini API (אופציונלי)</span>
              </div>
              <button
                type="button"
                className="btn--close-settings"
                onClick={() => setIsSettingsOpen(false)}
              >
                <ChevronDown size={16} />
              </button>
            </div>
            <p className="settings-desc">
              האפליקציה פועלת מיידית ללא אינטרנט. להפעלת מודל <strong>Gemini 2.5 Flash</strong>, הזן/י מפתח API (מ-Google AI Studio) ולחץ <strong>"בדוק תקינות"</strong>:
            </p>
            <div className="settings-input-row">
              <input
                type="password"
                className="settings-api-input font-mono"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestStatus({ state: 'idle' });
                }}
              />
              <button
                type="button"
                className="btn--test-key"
                onClick={handleTestApiKey}
                disabled={testStatus.state === 'testing' || !apiKey.trim()}
                title="בדוק חיבור מיידי מול Gemini API"
              >
                {testStatus.state === 'testing' ? (
                  <Loader2 size={13} className="spin" />
                ) : (
                  <Sparkles size={13} />
                )}
                <span>בדוק תקינות</span>
              </button>
              <button
                type="button"
                className="btn--save-key"
                onClick={() => handleSaveApiKey(apiKey)}
                title="שמור מפתח בדפדפן"
              >
                שמור
              </button>
            </div>

            {/* Test Status Feedback Message */}
            {testStatus.state !== 'idle' && (
              <div className={`key-test-feedback key-test-feedback--${testStatus.state}`}>
                {testStatus.state === 'testing' && <Loader2 size={14} className="spin" />}
                {testStatus.state === 'success' && <CheckCircle2 size={14} className="text-emerald" />}
                {testStatus.state === 'error' && <AlertCircle size={14} className="text-rose" />}
                <span className="feedback-text">{testStatus.message}</span>
              </div>
            )}

            {hasApiKey && (
              <div className="settings-remove-row">
                <button
                  type="button"
                  className="btn--remove-key"
                  onClick={handleRemoveApiKey}
                >
                  הסר מפתח וחזור למנוע מקומי
                </button>
              </div>
            )}

            <div className="settings-privacy-note">
              <ShieldCheck size={13} className="text-emerald" />
              <span>המפתח נשמר מקומית במכשירך בלבד ונשלח ישירות מול Google</span>
            </div>
          </div>
        )}

        {/* Message Stream */}
        <div className="chat-messages-container">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`chat-message-row ${isUser ? 'chat-message-row--user' : 'chat-message-row--assistant'}`}
              >
                <div className="chat-msg-avatar">
                  {isUser ? <User size={15} /> : <Bot size={15} />}
                </div>

                <div className={`chat-bubble ${isUser ? 'chat-bubble--user' : 'chat-bubble--assistant'}`}>
                  <div className="chat-bubble-content">
                    {renderFormattedText(msg.text)}
                  </div>

                  {!isUser && (
                    <div className="chat-bubble-footer">
                      <button
                        type="button"
                        className="btn--copy-msg"
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        title="העתק תשובה"
                      >
                        {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedId === msg.id ? 'הועתק' : 'העתק'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="chat-message-row chat-message-row--assistant">
              <div className="chat-msg-avatar">
                <Bot size={15} />
              </div>
              <div className="chat-bubble chat-bubble--assistant chat-bubble--loading">
                <div className="typing-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="typing-text">מנתח ומגבש תשובה קלינית...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="chat-suggestions-bar">
          <span className="suggestions-label">שאלות מומלצות:</span>
          <div className="suggestions-scroll">
            {getSuggestedPrompts().map((prompt, i) => (
              <button
                key={i}
                type="button"
                className="suggestion-chip"
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input Box */}
        <div className="chat-input-wrapper">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="chat-input-form"
          >
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder="שאל/י כל שאלה על תוצאות הבדיקה..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!inputText.trim() || isLoading}
              title="שלח שאלה"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="chat-disclaimer-sub">
            <Info size={11} />
            <span>המידע להסברה והכנה לרופא בלבד • אינו מהווה אבחנה רפואית</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotDrawer;
