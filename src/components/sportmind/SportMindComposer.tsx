import React, { useRef, useEffect } from 'react';
import { Send, Square, Sparkles, X } from 'lucide-react';
import { BilingualText, bi } from '../bilingual/BilingualText';
import type { SportMindRole } from '../../server/sportmind/types';

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  role?: SportMindRole;
  contextPills?: Array<{ id: string; label: { en: string; ar: string }; onRemove?: () => void }>;
  suggestions?: Array<{ id: string; label: { en: string; ar: string }; prompt: string }>;
  disabled?: boolean;
}

export const SportMindComposer: React.FC<ComposerProps> = ({
  value,
  onChange,
  onSubmit,
  onStop,
  isStreaming = false,
  role = 'player',
  contextPills = [],
  suggestions = [],
  disabled = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && value.trim()) {
        onSubmit(value);
      }
    }
  };

  const getPlaceholder = () => {
    switch (role) {
      case 'admin':
        return bi('Ask about operations, branches, group readiness…', 'اسأل عن العمليات التشغيلية، الفروع، جاهزية المجموعات…');
      case 'coach':
        return bi('Ask about session plans, drill progression, attendance…', 'اسأل عن خطة الحصة، تصعيد التدريبات، الحضور…');
      case 'parent':
        return bi('Ask about your child’s schedule, progress, coach feedback…', 'اسأل عن جدول ابنك، تقدمه الرياضي، ملاحظات المدرب…');
      case 'player':
      default:
        return bi('Ask about your schedule, training drills, progress…', 'اسأل عن جدولك، تدريباتك، وملاحظات مدربك…');
    }
  };

  return (
    <div className="sportmind-composer-wrap uos-safe-bottom">
      {/* Suggestions Shortcuts (if available and no text entered) */}
      {!value.trim() && suggestions.length > 0 && (
        <div className="sportmind-suggestions-row">
          {suggestions.map((sug) => (
            <button
              key={sug.id}
              type="button"
              className="sportmind-suggestion-chip uos-touch"
              onClick={() => onSubmit(sug.prompt)}
              disabled={disabled || isStreaming}
            >
              <Sparkles size={12} className="sportmind-gold-icon" />
              <BilingualText value={bi(sug.label.en, sug.label.ar)} />
            </button>
          ))}
        </div>
      )}

      {/* Context Pills */}
      {contextPills.length > 0 && (
        <div className="sportmind-context-pills">
          {contextPills.map((pill) => (
            <span key={pill.id} className="sportmind-pill">
              <BilingualText value={bi(pill.label.en, pill.label.ar)} />
              {pill.onRemove && (
                <button
                  type="button"
                  onClick={pill.onRemove}
                  className="sportmind-pill-remove"
                  aria-label="Remove context filter"
                >
                  <X size={10} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Composer Input Box */}
      <form
        className="sportmind-composer uos-glass-3 uos-halo"
        onSubmit={(e) => {
          e.preventDefault();
          if (!isStreaming && value.trim()) {
            onSubmit(value);
          }
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder().en + ' | ' + getPlaceholder().ar}
          rows={1}
          disabled={disabled}
          className="sportmind-composer-input"
          aria-label="Ask SportMind | اسأل ساحة الذكاء الرياضي"
        />

        <div className="sportmind-composer-controls">
          {isStreaming ? (
            <button
              type="button"
              className="sportmind-stop-btn uos-touch"
              onClick={onStop}
              aria-label="Stop generation | إيقاف التوليد"
              title="Stop | إيقاف"
            >
              <Square size={14} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!value.trim() || disabled}
              className="sportmind-send-btn uos-touch"
              aria-label="Send | إرسال"
              title="Send | إرسال"
            >
              <Send size={15} />
            </button>
          )}
        </div>
      </form>
      <div className="sportmind-composer-footnote">
        <BilingualText
          value={bi(
            'SportMind generates athletic guidance from authorized records. Always verify session specifics with coaching staff.',
            'تولد ساحة الذكاء الرياضي إرشاداتها من السجلات المصرح بها. يُرجى دومًا التحقق من تفاصيل الحصص مع الكادر التدريبي.',
          )}
        />
      </div>
    </div>
  );
};
