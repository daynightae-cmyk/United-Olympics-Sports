import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileQuestion,
  Layers,
  ShieldCheck,
  Target,
  Zap,
} from 'lucide-react';
import { BilingualText, bi } from '../bilingual/BilingualText';
import type {
  CoachBoardData,
  SportMindAction,
  SportMindEvidenceItem,
  SportMindModule,
} from '../../server/sportmind/types';

interface ModuleProps {
  module: SportMindModule;
}

export const CoachBoardCard: React.FC<{ data: CoachBoardData; title?: { en: string; ar: string }; actions?: SportMindAction[]; confidence?: { en: string; ar: string } }> = ({
  data,
  title,
  actions,
  confidence,
}) => {
  const navigate = useNavigate();

  return (
    <div className="sportmind-coach-board uos-glass-3 uos-halo">
      <div className="sportmind-module-header">
        <div className="sportmind-module-badge">
          <Target size={14} className="sportmind-icon" />
          <span><BilingualText value={bi('COACH BOARD', 'لوحة المدرب')} /></span>
        </div>
        {confidence && (
          <span className="sportmind-confidence-tag">
            <ShieldCheck size={12} />
            <BilingualText value={bi(confidence.en, confidence.ar)} />
          </span>
        )}
      </div>

      {title && (
        <h3 className="sportmind-module-title">
          <BilingualText value={bi(title.en, title.ar)} />
        </h3>
      )}

      {/* Objective */}
      <div className="sportmind-board-objective">
        <span className="sportmind-board-kicker"><BilingualText value={bi('SESSION OBJECTIVE', 'هدف الحصة')} /></span>
        <p className="sportmind-board-objective-text">
          <BilingualText value={bi(data.objective.en, data.objective.ar)} />
        </p>
      </div>

      {/* Structured Drill Progression Grid */}
      <div className="sportmind-board-grid">
        {/* Warm-Up */}
        <div className="sportmind-board-stage">
          <div className="sportmind-stage-head">
            <span className="sportmind-stage-tag"><BilingualText value={bi('WARM-UP', 'الإحماء')} /></span>
            <span className="sportmind-stage-time">
              <Clock size={12} /> {data.warmUp.durationMinutes} min
            </span>
          </div>
          <h4><BilingualText value={bi(data.warmUp.title.en, data.warmUp.title.ar)} /></h4>
          {data.warmUp.notes && (
            <p className="sportmind-stage-note"><BilingualText value={bi(data.warmUp.notes.en, data.warmUp.notes.ar)} /></p>
          )}
        </div>

        {/* Main Drill */}
        <div className="sportmind-board-stage sportmind-board-stage--main">
          <div className="sportmind-stage-head">
            <span className="sportmind-stage-tag sportmind-stage-tag--gold"><BilingualText value={bi('MAIN DRILL', 'التدريب الرئيسي')} /></span>
            <span className="sportmind-stage-time">
              <Clock size={12} /> {data.mainDrill.durationMinutes} min
            </span>
          </div>
          <h4><BilingualText value={bi(data.mainDrill.title.en, data.mainDrill.title.ar)} /></h4>
          <p><BilingualText value={bi(data.mainDrill.description.en, data.mainDrill.description.ar)} /></p>
          {data.mainDrill.progression && (
            <div className="sportmind-progression-box">
              <span className="sportmind-progression-label"><BilingualText value={bi('Progression Trigger:', 'معيار التصعيد:')} /></span>
              <p><BilingualText value={bi(data.mainDrill.progression.en, data.mainDrill.progression.ar)} /></p>
            </div>
          )}
        </div>

        {/* Cool-Down */}
        <div className="sportmind-board-stage">
          <div className="sportmind-stage-head">
            <span className="sportmind-stage-tag"><BilingualText value={bi('COOL-DOWN', 'التهدئة')} /></span>
            <span className="sportmind-stage-time">
              <Clock size={12} /> {data.coolDown.durationMinutes} min
            </span>
          </div>
          <h4><BilingualText value={bi(data.coolDown.title.en, data.coolDown.title.ar)} /></h4>
        </div>
      </div>

      {/* Coach Notes */}
      {data.coachNotes && (
        <div className="sportmind-board-notes">
          <span className="sportmind-board-kicker"><BilingualText value={bi('COACH FOCUS', 'توجيهات المدرب')} /></span>
          <p><BilingualText value={bi(data.coachNotes.en, data.coachNotes.ar)} /></p>
        </div>
      )}

      {/* Action Cluster */}
      {actions && actions.length > 0 && (
        <div className="sportmind-module-actions">
          {actions.map((act, i) => (
            <button
              key={i}
              type="button"
              className={`sportmind-btn sportmind-btn--${act.variant || 'secondary'} uos-touch`}
              onClick={() => navigate(act.to)}
            >
              <BilingualText value={bi(act.label.en, act.label.ar)} />
              <ArrowUpRight size={14} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const InsightCard: React.FC<ModuleProps> = ({ module }) => {
  const navigate = useNavigate();

  return (
    <div className="sportmind-insight-card uos-glass-3 uos-halo">
      <div className="sportmind-module-header">
        <div className="sportmind-module-badge sportmind-module-badge--insight">
          <Zap size={14} className="sportmind-icon" />
          <span><BilingualText value={bi('INSIGHT', 'معلومة')} /></span>
        </div>
        {module.confidenceLabel && (
          <span className="sportmind-confidence-tag">
            <ShieldCheck size={12} />
            <BilingualText value={bi(module.confidenceLabel.en, module.confidenceLabel.ar)} />
          </span>
        )}
      </div>

      {module.title && (
        <h3 className="sportmind-module-title">
          <BilingualText value={bi(module.title.en, module.title.ar)} />
        </h3>
      )}

      {module.body && (
        <p className="sportmind-module-body">
          <BilingualText value={bi(module.body.en, module.body.ar)} />
        </p>
      )}

      {module.actions && module.actions.length > 0 && (
        <div className="sportmind-module-actions">
          {module.actions.map((act, i) => (
            <button
              key={i}
              type="button"
              className={`sportmind-btn sportmind-btn--${act.variant || 'secondary'} uos-touch`}
              onClick={() => navigate(act.to)}
            >
              <BilingualText value={bi(act.label.en, act.label.ar)} />
              <ArrowUpRight size={14} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const AttentionCard: React.FC<ModuleProps> = ({ module }) => {
  const navigate = useNavigate();

  return (
    <div className="sportmind-attention-card uos-glass-3">
      <div className="sportmind-module-header">
        <div className="sportmind-module-badge sportmind-module-badge--attention">
          <AlertTriangle size={14} className="sportmind-icon" />
          <span><BilingualText value={bi('ATTENTION', 'تنبيه')} /></span>
        </div>
        {module.confidenceLabel && (
          <span className="sportmind-confidence-tag">
            <BilingualText value={bi(module.confidenceLabel.en, module.confidenceLabel.ar)} />
          </span>
        )}
      </div>

      {module.title && (
        <h3 className="sportmind-module-title">
          <BilingualText value={bi(module.title.en, module.title.ar)} />
        </h3>
      )}

      {module.body && (
        <p className="sportmind-module-body">
          <BilingualText value={bi(module.body.en, module.body.ar)} />
        </p>
      )}

      {module.actions && module.actions.length > 0 && (
        <div className="sportmind-module-actions">
          {module.actions.map((act, i) => (
            <button
              key={i}
              type="button"
              className={`sportmind-btn sportmind-btn--${act.variant || 'accent'} uos-touch`}
              onClick={() => navigate(act.to)}
            >
              <BilingualText value={bi(act.label.en, act.label.ar)} />
              <ArrowUpRight size={14} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const NeedsDataCard: React.FC<ModuleProps> = ({ module }) => {
  return (
    <div className="sportmind-needs-data-card uos-glass-2">
      <div className="sportmind-module-header">
        <div className="sportmind-module-badge sportmind-module-badge--neutral">
          <FileQuestion size={14} className="sportmind-icon" />
          <span><BilingualText value={bi('DATA NOTICE', 'تنبيه البيانات')} /></span>
        </div>
      </div>
      {module.title && (
        <h4 className="sportmind-module-subtitle">
          <BilingualText value={bi(module.title.en, module.title.ar)} />
        </h4>
      )}
      {module.body && (
        <p className="sportmind-module-subtext">
          <BilingualText value={bi(module.body.en, module.body.ar)} />
        </p>
      )}
    </div>
  );
};

export const EvidenceList: React.FC<{ items: SportMindEvidenceItem[] }> = ({ items }) => {
  return (
    <div className="sportmind-evidence-panel uos-glass-2">
      <div className="sportmind-evidence-head">
        <Layers size={13} className="sportmind-gold-icon" />
        <span className="sportmind-evidence-title">
          <BilingualText value={bi('EVIDENCE & RECORDS USED', 'المصادر والبيانات المعتمدة')} />
        </span>
      </div>
      <ul className="sportmind-evidence-items">
        {items.map((item, idx) => (
          <li key={idx} className="sportmind-evidence-item">
            <CheckCircle2 size={12} className="sportmind-evidence-check" />
            <span><BilingualText value={bi(item.description.en, item.description.ar)} /></span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const SportMindModuleRenderer: React.FC<{ module: SportMindModule }> = ({ module }) => {
  if (module.type === 'COACH_BOARD' && module.coachBoard) {
    return (
      <CoachBoardCard
        data={module.coachBoard}
        title={module.title}
        actions={module.actions}
        confidence={module.confidenceLabel}
      />
    );
  }

  if (module.type === 'ATTENTION') {
    return <AttentionCard module={module} />;
  }

  if (module.type === 'NEEDS_DATA') {
    return <NeedsDataCard module={module} />;
  }

  return <InsightCard module={module} />;
};
