/* ──────────────────────────────────────────────────────────────────────────
   Workers' Comp — shared step primitives.

   Adapted verbatim from Inland Marine's primitives.jsx so both flows share
   one vocabulary. Every class it emits (im-*) is defined in index.css.
   ────────────────────────────────────────────────────────────────────────── */

import { Children, useEffect, useRef, useState } from 'react'

export const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

/* Close a popover when the pointer taps somewhere else. */
function useClickAway(ref, onAway) {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onAway() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onAway])
}

/* Gradient text — the accent for anything that reads as "brand". */
export function BrandText({ children, className = '' }) {
  return (
    <span
      className={className}
      style={{
        background: BRAND_GRADIENT,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {children}
    </span>
  )
}

/* Section header. Space above, bold title over a hairline, optional
   subtitle underneath. */
export function StepHeader({ title, subtitle }) {
  return (
    <div className="pt-6 md:pt-8 mb-4 md:mb-5">
      <div className="pb-3 md:pb-4 border-b" style={{ borderColor: '#D1D5DB' }}>
        <h2 className="text-base md:text-lg font-bold text-navy">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 leading-relaxed max-w-2xl mt-1.5">{subtitle}</p>}
      </div>
    </div>
  )
}

/* A carrier's logo on a square white tile. */
/* Stands in for a carrier mark nobody has supplied yet. The tiles were wearing
   whichever logo happened to be in the assets folder — AmTrust showed
   Coterie's — and another company's mark on a carrier's card is worse than no
   mark at all. Same grey glyph the cross-sell block uses for its unchosen
   product. Drop the real artwork in here when it arrives. */
export function CarrierLogo({ carrier, size = 40, className = '' }) {
  return (
    <div
      className={`im-carrier-tile rounded-xl flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size, padding: Math.round(size * 0.08) }}
      title={carrier?.name}
    >
      <svg
        width={Math.round(size * 0.46)} height={Math.round(size * 0.46)}
        viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9.5" r="1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 20" />
      </svg>
    </div>
  )
}

/* Uppercase label above a group of fields. */
export function SectionLabel({ children, className = '' }) {
  return (
    <div className={`text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-2.5 pl-0.5 ${className}`}>
      {children}
    </div>
  )
}

/* Labelled card holding a set of fields. */
export function FieldGroup({ label, children, className = '' }) {
  return (
    <div className={className}>
      {label && <SectionLabel>{label}</SectionLabel>}
      <div className="rounded-xl p-5 sm:p-6" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
        {children}
      </div>
    </div>
  )
}

/* The compact answer list: the card supplies the side padding, the rows
   supply the rhythm, and divide-y draws rules only between them so the
   last row never leaves a hairline above the card's edge. Use this
   wherever a page asks a run of short questions — a full-width toggle
   per question reads as an oversized control for a binary answer. */
export function RowGroup({ label, children, className = '' }) {
  return (
    <div className={className}>
      {label && <SectionLabel>{label}</SectionLabel>}
      <div className="rounded-xl px-5 sm:px-6 py-1 divide-y divide-[#F3F4F6]"
        style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
        {children}
      </div>
    </div>
  )
}

/* One row of a RowGroup: the question on the left, its control on the
   right, on a 56px line so pills and selects sit level down the column. */
export function AnswerRow({ label, help, stacked = false, children }) {
  const question = (
    <span className="text-sm text-gray-800 min-w-0">
      {label}
      {help && <span className="block text-[11px] text-gray-400 mt-0.5 leading-snug">{help}</span>}
    </span>
  )

  /* A control with more than two or three options runs out of room beside
     its question and pushes the text into a second line. Stacked gives the
     answer the full width on its own row instead. */
  if (stacked) {
    return (
      <div className="py-3">
        {question}
        <div className="mt-2.5">{children}</div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-4 min-h-[56px] py-1.5">
      {question}
      <span className="flex items-center gap-3 shrink-0">{children}</span>
    </div>
  )
}

/* The centred dialog, mirrored from CBIC's Modal so every confirmation in
   the app is one definition rather than a hand-rolled copy that drifts:
   a 17px tracked title over a hairline, 14px body, and a footer that puts
   the secondary left and the primary right. */
export function Modal({ title, onDismiss, children, footer, width = 420 }) {
  return (
    <div
      className="bop-page fixed inset-0 z-[10000] flex items-center justify-center p-6"
      style={{ background: 'rgba(15,10,40,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={onDismiss}
    >
      <div
        className="im-modal rounded-2xl overflow-hidden"
        style={{ width, maxWidth: '100%', boxShadow: '0 24px 64px rgba(15,10,40,0.28)' }}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="px-7 pt-6 pb-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-[17px] font-bold text-navy tracking-wide">{title}</h3>
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  aria-label="Close"
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 -mr-1 transition hover:bg-gray-50"
                  style={{ border: '1px solid var(--line)' }}
                >
                  <svg className="w-3 h-3" fill="none" stroke="#9CA3AF" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="mt-4" style={{ borderBottom: '1px solid var(--line-soft)' }} />
          </div>
        )}
        <div className="px-7 pb-7">{children}</div>
        {/* wrap so a pair of long labels stacks rather than spilling past
            the sheet's edge, whatever width the dialog is given */}
        {footer && <div className="px-7 pb-7 flex flex-wrap items-center justify-between gap-3">{footer}</div>}
      </div>
    </div>
  )
}

export function ModalButton({ children, onClick, variant = 'primary' }) {
  const primary = variant === 'primary'
  return (
    <button
      type="button"
      onClick={onClick}
      /* One height for both, set rather than left to padding — the ghost
         also carries a border, so equal padding would still measure short. */
      className={`h-11 inline-flex items-center justify-center shrink-0 whitespace-nowrap rounded-xl text-sm transition ${primary
        ? 'px-6 font-bold text-white hover:opacity-90'
        : 'px-5 font-medium text-gray-500 hover:bg-gray-50'}`}
      /* Commercial Auto's secondary button: no fill, a 1px --line stroke and
         gray-500 text. It used to take --surface, which in dark is the page
         colour — darker than the card it sits on, so it read as a hole
         punched in the sheet. Transparent simply inherits the card. */
      style={primary
        ? { background: BRAND_GRADIENT, boxShadow: '0 4px 18px rgba(92,46,212,0.30)' }
        : { border: '1px solid var(--line)', background: 'transparent' }}
    >
      {children}
    </button>
  )
}

/* Brand-tinted banner — carrier context the agent needs before answering. */
export function Banner({ children, icon = true }) {
  return (
    <div className="im-banner rounded-xl px-4 py-3.5 flex gap-3 items-start">
      {icon && (
        <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="url(#imBannerG)" strokeWidth="1.7" />
          <path d="M12 11v5M12 8h.01" stroke="url(#imBannerG)" strokeWidth="1.9" strokeLinecap="round" />
          <defs>
            <linearGradient id="imBannerG" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5C2ED4" /><stop offset="100%" stopColor="#A614C3" />
            </linearGradient>
          </defs>
        </svg>
      )}
      <div className="text-[13px] leading-relaxed text-gray-600 flex-1 min-w-0">{children}</div>
    </div>
  )
}

/* A note under a group of fields: an icon and one grey line. */
/* Material Symbols "error" — the alert mark the design calls for. Filled, so
   it takes its colour from the disc it sits in. */
export function AlertGlyph({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">
      <path d="M508.5-291.5Q520-303 520-320t-11.5-28.5Q497-360 480-360t-28.5 11.5Q440-337 440-320t11.5 28.5Q463-280 480-280t28.5-11.5ZM440-440h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
    </svg>
  )
}

/* A note in a panel. On a single-line note the icon and the copy end up
   centred against each other; on a longer one they both start at the top —
   which is what the eye wants in each case, and what a fixed items-start or
   items-center can only get right one at a time.

   No measuring needed: the text box carries the disc's height as a minimum
   and centres its own content. One line and the box is exactly the disc's
   height, so the line centres on it; two and the box grows past it, so both
   sit at the top. */
export function InfoPanel({ children, icon, lead, className = '' }) {
  return (
    <div className={`im-info-panel rounded-xl p-4 flex items-start gap-3 ${className}`}>
      <span className="im-panel-icon w-7 h-7 rounded-full flex items-center justify-center shrink-0">
        {icon || <AlertGlyph />}
      </span>
      <span className="flex-1 min-h-7 flex items-center">
        <p className="text-[12.5px] text-gray-600 leading-relaxed">
          {lead && <><span className="font-bold text-navy">{lead}</span>{' '}</>}
          {children}
        </p>
      </span>
    </div>
  )
}

export function InfoLine({ children, className = '', icon = 'info' }) {
  return (
    /* The same box the panel notes use, scaled down for a single line: it sat
       loose on the page as bare text and a glyph, which read as a different
       component from the notes directly above it. */
    <p className={`im-info-panel rounded-xl px-4 py-3 flex items-center gap-2.5 text-[11.5px] leading-relaxed ${className}`}>
      <span className="im-panel-icon w-5 h-5 rounded-full flex items-center justify-center shrink-0">
        <AlertGlyph className="w-3 h-3" />
      </span>
      {/* The colour rides on the text, not the box: .im-info-panel sets `color`
          for the glyph, and at equal specificity it was winning over the
          utility and painting the copy brand purple. */}
      <span className="text-gray-500">{children}</span>
    </p>
  )
}

/* Quiet panel that explains what a ticked checkbox means. */
export function NotePanel({ title, children }) {
  return (
    <div className="rounded-xl px-4 py-3" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
      <p className="text-[13px] font-semibold text-gray-700">{title}</p>
      {children && <p className="text-[12.5px] text-gray-500 mt-0.5 leading-relaxed">{children}</p>}
    </div>
  )
}

/* Tag chip — SIC / NAICS / coverage family. */
export function Tag({ children, tone = 'default' }) {
  /* The brand tone wears the gradient, not a flat violet — the same
     purple-to-magenta wash the radio pills take, with the text to match. */
  const brand = tone === 'brand'
  const styles = brand
    ? {
        background: 'linear-gradient(88.09deg, rgba(92,46,212,0.08) 0%, rgba(166,20,195,0.08) 100%)',
        border: '1px solid rgba(92,46,212,0.18)',
      }
    : { background: 'white', border: '1px solid #E5E7EB', color: '#6B7280' }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold" style={styles}>
      {brand ? <BrandText>{children}</BrandText> : children}
    </span>
  )
}

/* Info dot with a hover-opened definition card. */
export function InfoDot({ text, title, label = 'What this covers' }) {
  const [open, setOpen] = useState(false)
  const [popStyle, setPopStyle] = useState({})
  const ref = useRef(null)
  const btnRef = useRef(null)
  useClickAway(ref, () => setOpen(false))

  /* Fixed, and positioned off the trigger — the same escape the Select
     dropdown makes. Absolute put the card inside the page's scroller, so
     an overflow ancestor clipped it. */
  useEffect(() => {
    if (!open || !btnRef.current) return
    const recalc = () => {
      if (!btnRef.current) return
      const r = btnRef.current.getBoundingClientRect()
      const width = Math.min(320, window.innerWidth - 32)
      // flip left or above rather than running off the edge
      const left = Math.min(Math.max(12, r.left), window.innerWidth - width - 12)
      const below = r.bottom + 8
      const flipUp = below + 180 > window.innerHeight
      setPopStyle({
        position: 'fixed',
        left,
        ...(flipUp ? { bottom: window.innerHeight - r.top + 8 } : { top: below }),
        width,
        zIndex: 10001,
      })
    }
    recalc()
    window.addEventListener('scroll', recalc, true)
    window.addEventListener('resize', recalc)
    return () => {
      window.removeEventListener('scroll', recalc, true)
      window.removeEventListener('resize', recalc)
    }
  }, [open])

  return (
    <span className="relative inline-flex" ref={ref}>
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        data-open={open}
        onClick={() => setOpen(v => !v)}
        className="im-info-dot w-4 h-4 rounded-full flex items-center justify-center"
      >
        <span className="text-[10px] font-bold leading-none">i</span>
      </button>

      {open && (
        <span
          role="dialog"
          aria-label={title || label}
          /* The dot often sits inside a SectionLabel, which is uppercase
             and tracked — the card must not inherit either. */
          style={{ ...popStyle, textTransform: 'none', letterSpacing: 'normal' }}
          className="im-info-pop block rounded-2xl overflow-hidden text-left normal-case"
        >
          <span className="im-info-pop-head flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-[13px] font-bold leading-snug" style={{ color: 'var(--ink)' }}>{title || label}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="im-info-pop-close w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
          <span className="block px-4 py-3.5 text-[12.5px] text-gray-600 leading-relaxed">{text}</span>
        </span>
      )}
    </span>
  )
}


/* $ inside a spinning ring. */
export function PriceTicker({ isDark = false }) {
  return (
    <div
      className="shrink-0 relative flex items-center justify-center"
      style={{ width: 24, height: 24 }}
      aria-label="Waiting on this carrier"
    >
      <svg
        width="24" height="24" viewBox="0 0 24 24" fill="none"
        className="absolute inset-0 animate-spin"
        style={{ animationDuration: '1.1s' }}
      >
        <defs>
          <linearGradient id="imSpinG" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5C2ED4" /><stop offset="100%" stopColor="#A614C3" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="10" stroke={isDark ? 'rgba(255,255,255,0.10)' : '#E5E7EB'} strokeWidth="2" />
        <path d="M22 12a10 10 0 0 0-10-10" stroke="url(#imSpinG)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span
        className="relative text-[11px] font-bold"
        style={{
          background: BRAND_GRADIENT,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        $
      </span>
    </div>
  )
}

/* Switch. Off is a neutral track; on is the brand gradient. */
export function Toggle({ checked, onChange, ariaLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className="relative w-10 h-[22px] rounded-full shrink-0 transition-all"
      style={{ background: checked ? BRAND_GRADIENT : '#D1D5DB' }}
    >
      <span
        className="im-toggle-knob absolute top-[3px] w-4 h-4 rounded-full transition-all"
        style={{ left: checked ? '21px' : '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }}
      />
    </button>
  )
}

/* Yes / No pair — the house control from GL-BOP / CBIC:
   a rounded-lg button with a radio dot on the left and the label
   on the right, a purple ring and a light tinted fill when on. */
/* The house radio pill, in a row. YesNo is the two-option case; pass
   `options` for anything wider (coverage status, claim type). */
export function Segmented({ options, value, onChange, name, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-2.5 ${className}`} role="radiogroup" aria-label={name}>
      {options.map(opt => {
        const v = typeof opt === 'string' ? opt : opt.value
        const labelText = typeof opt === 'string' ? opt : opt.label
        const on = value === v
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange && onChange(v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${
              on ? 'yn-on' : 'yn-off'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                on ? 'yn-ring' : 'yn-off-ring'
              }`}
            >
              {on && <span className="w-1.5 h-1.5 rounded-full yn-dot" />}
            </span>
            {labelText}
          </button>
        )
      })}
    </div>
  )
}

const YES_NO = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]

export function YesNo({ value, onChange, name, className = '' }) {
  return (
    <Segmented
      options={YES_NO}
      value={value}
      onChange={onChange}
      name={name}
      className={`gap-4 ${className}`}
    />
  )
}

/* A row of mutually exclusive choices — same look as YesNo. */
export function PillGroup({ options, value, onChange, label, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`} role="radiogroup" aria-label={label}>
      {options.map(opt => {
        const v = opt.value ?? opt
        const l = opt.label ?? opt
        const selected = v === value
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(v)}
            className={`px-5 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
              selected ? 'force-white-text' : 'border-[1.5px]'
            }`}
            style={selected
              ? { background: BRAND_GRADIENT, color: 'white' }
              : { background: 'white', borderColor: '#E5E7EB', color: '#6B7280' }}
          >
            {l}
          </button>
        )
      })}
    </div>
  )
}

/* Question card — GL-BOP / CBIC shape: soft grey fill, grey line, p-4.
   The error border swaps to red-200 while the question is unanswered. */
export function QuestionCard({ error = false, className = '', children }) {
  return (
    <div
      className={`rounded-xl p-4 ${className}`}
      style={{ background: '#F9FAFB', border: `1px solid ${error ? '#FCA5A5' : '#E5E7EB'}` }}
    >
      {children}
    </div>
  )
}

/* One question: label, YesNo pair, and any follow-up branch.
   Label typography follows CBIC's ToggleQuestion — 13px semibold
   gray-600, wide tracking — not the softer text-sm gray-800. */
export function QuestionRow({ label, help, value, onChange, error = false, children }) {
  const hasFollowUp = Children.toArray(children).some(Boolean)

  return (
    <QuestionCard error={error}>
      <p className={`block text-[13px] font-semibold mb-2.5 tracking-wide ${error ? 'text-red-500' : 'text-gray-600'}`}>
        {label}
      </p>
      {help && <p className="text-[12px] text-gray-400 -mt-1.5 mb-2.5 leading-relaxed max-w-2xl">{help}</p>}
      <YesNo value={value} onChange={onChange} name={label} />
      {hasFollowUp && <div className="mt-4 pt-4 im-rule">{children}</div>}
    </QuestionCard>
  )
}

/* Warning / error line. */
export function FieldError({ children, className = '' }) {
  return (
    <p className={`text-[10px] text-red-500 mt-1 flex items-center gap-1 ${className}`}>
      <span>⚠</span> {children}
    </p>
  )
}

/* Removes the row it sits in. */
export function RemoveButton({ onClick, label = 'Remove' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="im-remove w-6 h-6 rounded-full flex items-center justify-center shrink-0"
    >
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  )
}

/* Dashed "add another" action. */
export function AddAnother({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="add-another-btn w-full flex items-center justify-center gap-2 text-xs font-semibold border border-dashed border-[#A614C3]/30 rounded-xl px-4 py-3 transition"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#A614C3' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <span className="text-gradient">{children}</span>
    </button>
  )
}

/* Primary gradient button. */
export function PrimaryButton({ children, onClick, disabled = false, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`h-10 px-6 min-w-[112px] inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all ${disabled ? '' : 'force-white-text'} ${className}`}
      style={disabled
        ? { background: 'var(--fill-disabled)', color: '#9CA3AF', cursor: 'not-allowed' }
        : { background: BRAND_GRADIENT, color: 'white', boxShadow: '0 4px 16px rgba(92,46,212,0.28)' }}
    >
      {children}
    </button>
  )
}

/* Back / Continue footer for a step. */
export function StepNav({ onBack, onContinue, canContinue = true, hint, continueLabel = 'Continue' }) {
  return (
    <div>
      {hint && (
        <p className={`text-xs mb-3 ${canContinue ? 'text-gray-400' : 'text-gray-500'}`}>
          {hint}
        </p>
      )}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            /* The secondary button, as Commercial Auto draws it — no fill, a
               1px --line stroke, gray-500 text. A white fill went to the page
               colour in dark, under the surface it sits on. */
            className="h-10 px-6 min-w-[112px] inline-flex items-center justify-center rounded-xl text-sm font-medium text-gray-500 transition-all"
            style={{ background: 'transparent', border: '1px solid var(--line)' }}
          >
            Back
          </button>
        ) : <span />}
        {/* A screen can advance by something other than this footer — the
            payment one does, through its own Pay button — so Continue is
            optional and the row keeps Back on the left. */}
        {onContinue
          ? <PrimaryButton onClick={onContinue} disabled={!canContinue}>{continueLabel}</PrimaryButton>
          : <span />}
      </div>
    </div>
  )
}
