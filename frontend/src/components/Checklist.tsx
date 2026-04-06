import { useState } from 'react';
import { STATUS_CONFIG, tokens } from '../constants';
import { SectionIcon } from './ui';

// ── ChecklistItem ─────────────────────────────────────────────────────────────

interface ChecklistItemProps {
  sid: string;
  name: string;
  data: { status: string | null; obs: string } | undefined;
  onSetStatus: (key: string, val: string) => void;
  onSetObs: (key: string, val: string) => void;
}

export function ChecklistItem({ sid, name, data, onSetStatus, onSetObs }: ChecklistItemProps) {
  const [obsOpen, setObsOpen] = useState(false);
  const key           = `${sid}:${name}`;
  const currentStatus = data?.status ?? null;

  const accentColor =
    currentStatus === 'ok'   ? tokens.color.ok :
    currentStatus === 'warn' ? tokens.color.warn :
    currentStatus === 'crit' ? tokens.color.crit :
    tokens.color.border;

  return (
    <div
      className="checklist-item"
      style={{
        background: tokens.color.surface,
        borderLeft: `2.5px solid ${accentColor}`,
        transition: 'border-color 0.15s ease, background 0.15s ease',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '11px 16px',
        gap: 12,
        minHeight: 50,
      }}>
        <span style={{
          flex: 1,
          fontSize: '0.86rem',
          color: currentStatus ? tokens.color.text : tokens.color.textSecond,
          transition: 'color 0.12s',
          lineHeight: 1.4,
        }}>
          {name}
        </span>

        {/* Note toggle */}
        <button
          onClick={() => setObsOpen((o) => !o)}
          title={data?.obs ? 'Ver observação' : 'Adicionar observação'}
          style={{
            background: data?.obs ? tokens.color.warnBg : 'none',
            border: data?.obs ? `1px solid ${tokens.color.warnBorder}` : '1px solid transparent',
            cursor: 'pointer',
            fontFamily: tokens.fontMono,
            fontSize: '0.58rem',
            letterSpacing: '0.06em',
            color: data?.obs ? tokens.color.warn : tokens.color.subtle,
            padding: '3px 8px',
            textTransform: 'uppercase',
            flexShrink: 0,
            borderRadius: tokens.radius.sm,
            transition: tokens.transition.fast,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
          aria-label="Abrir/fechar observação"
        >
          <svg width={9} height={9} viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round">
            <path d="M1 1.5h7M1 4.5h5M1 7.5h6"/>
          </svg>
          {data?.obs ? 'Nota' : 'Obs.'}
        </button>

        {/* Status buttons */}
        <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
          {Object.entries(STATUS_CONFIG).map(([val, cfg]) => {
            const active = currentStatus === val;
            return (
              <button
                key={val}
                onClick={() => onSetStatus(key, val)}
                style={{
                  fontFamily: tokens.fontMono,
                  fontSize: '0.58rem',
                  fontWeight: active ? 600 : 500,
                  letterSpacing: '0.03em',
                  padding: '4px 10px',
                  border: `1px solid ${active ? cfg.border : tokens.color.border}`,
                  background: active ? cfg.bg : 'transparent',
                  color: active ? cfg.color : tokens.color.subtle,
                  cursor: 'pointer',
                  borderRadius: tokens.radius.sm,
                  transition: 'all 0.12s cubic-bezier(0.4,0,0.2,1)',
                  whiteSpace: 'nowrap',
                }}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Obs textarea */}
      {(obsOpen || data?.obs) && (
        <div style={{
          padding: '0 16px 11px 19px',
          animation: 'fadeUp 0.16s ease forwards',
        }}>
          <textarea
            value={data?.obs || ''}
            onChange={(e) => onSetObs(key, e.target.value)}
            rows={2}
            placeholder="Observação técnica..."
            autoFocus={obsOpen && !data?.obs}
            style={{
              width: '100%',
              fontFamily: tokens.fontSans,
              fontSize: '0.83rem',
              color: tokens.color.text,
              background: tokens.color.bgAlt,
              border: `1px solid ${tokens.color.border}`,
              borderRadius: tokens.radius.sm,
              padding: '7px 11px',
              outline: 'none',
              resize: 'none',
              lineHeight: 1.5,
              transition: 'border-color 0.18s, box-shadow 0.18s',
            }}
          />
        </div>
      )}
    </div>
  );
}

// ── ChecklistSection ──────────────────────────────────────────────────────────

interface Section {
  id: string;
  label: string;
  icon: string;
  items: string[];
}

interface ChecklistSectionProps {
  sec: Section;
  checklist: Record<string, { status: string | null; obs: string }>;
  onSetStatus: (key: string, val: string) => void;
  onSetObs: (key: string, val: string) => void;
}

export function ChecklistSection({ sec, checklist, onSetStatus, onSetObs }: ChecklistSectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  const filled = sec.items.filter(
    (n) => checklist[`${sec.id}:${n}`]?.status != null
  ).length;

  const isComplete = filled === sec.items.length;
  const hasCrit    = sec.items.some((n) => checklist[`${sec.id}:${n}`]?.status === 'crit');
  const progress   = sec.items.length ? (filled / sec.items.length) * 100 : 0;

  return (
    <div style={{
      marginBottom: 24,
      border: `1px solid ${hasCrit ? tokens.color.critBorder : tokens.color.border}`,
      borderRadius: tokens.radius.lg,
      overflow: 'hidden',
      transition: 'border-color 0.18s',
      background: tokens.color.surface,
      boxShadow: tokens.shadow.xs,
    }}>
      {/* Section header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '13px 18px',
          background: isComplete ? tokens.color.okBg : tokens.color.surfaceHigh,
          border: 'none',
          cursor: 'pointer',
          gap: 11,
          borderBottom: collapsed ? 'none' : `1px solid ${tokens.color.border}`,
          transition: 'background 0.15s',
        }}
      >
        {/* Section icon */}
        <span style={{
          color: hasCrit ? tokens.color.crit : isComplete ? tokens.color.ok : tokens.color.muted,
          display: 'flex', alignItems: 'center', flexShrink: 0,
          transition: 'color 0.15s',
        }}>
          <SectionIcon id={sec.id} size={15} />
        </span>

        <span style={{
          fontFamily: tokens.fontMono,
          fontSize: '0.7rem',
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: hasCrit ? tokens.color.crit : tokens.color.text,
          flex: 1,
          textAlign: 'left',
          transition: 'color 0.15s',
        }}>
          {sec.label}
        </span>

        {/* Progress pill */}
        <span style={{
          fontFamily: tokens.fontMono,
          fontSize: '0.6rem',
          padding: '2px 9px',
          borderRadius: tokens.radius.full,
          background: isComplete ? tokens.color.okBg : tokens.color.bg,
          border: `1px solid ${isComplete ? tokens.color.okBorder : tokens.color.border}`,
          color: isComplete ? tokens.color.ok : tokens.color.muted,
          transition: 'all 0.18s',
        }}>
          {filled}/{sec.items.length}
        </span>

        {/* Mini progress bar */}
        <div style={{
          width: 52, height: 2,
          background: tokens.color.border,
          borderRadius: 1, overflow: 'hidden', flexShrink: 0,
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: hasCrit ? tokens.color.crit : isComplete ? tokens.color.ok : tokens.color.warn,
            borderRadius: 1,
            transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>

        {/* Collapse chevron */}
        <svg
          width={13} height={13} viewBox="0 0 13 13" fill="none"
          stroke={tokens.color.subtle} strokeWidth={1.5} strokeLinecap="round"
          style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0)', transition: 'transform 0.18s ease', flexShrink: 0 }}
        >
          <path d="M2.5 4.5l4 4 4-4" />
        </svg>
      </button>

      {/* Items */}
      {!collapsed && (
        <div style={{
          background: tokens.color.border,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          animation: 'fadeUp 0.18s ease forwards',
        }}>
          {sec.items.map((name) => (
            <ChecklistItem
              key={name}
              sid={sec.id}
              name={name}
              data={checklist[`${sec.id}:${name}`]}
              onSetStatus={onSetStatus}
              onSetObs={onSetObs}
            />
          ))}
        </div>
      )}
    </div>
  );
}
