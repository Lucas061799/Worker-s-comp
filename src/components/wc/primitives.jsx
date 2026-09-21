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
        <h2 className="text-base md:text-lg font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 leading-relaxed max-w-2xl mt-1.5">{subtitle}</p>}
      </div>
    </div>
  )
}

/* A carrier's logo on a square white tile. */
export function CarrierLogo({ carrier, size = 40, className = '' }) {
  return (
    <div
      className={`im-carrier-tile rounded-xl flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size, padding: Math.round(size * 0.08) }}
    >
      <img src={carrier.logo} alt="" className="max-w-full max-h-full object-contain select-none" />
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
export function InfoLine({ children, className = '', icon = 'info' }) {
  return (
    <p className={`flex items-start gap-2 text-[11.5px] text-gray-400 leading-relaxed ${className}`}>
      <svg className="w-3.5 h-3.5 shrink-0 mt-px" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="url(#imInfoLine)" strokeWidth="1.7" />
        <path d={icon === 'alert' ? 'M12 7v6M12 16h.01' : 'M12 11v5M12 8h.01'} stroke="url(#imInfoLine)" strokeWidth="1.9" strokeLinecap="round" />
        <defs>
          <linearGradient id="imInfoLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5C2ED4" /><stop offset="100%" stopColor="#A614C3" />
          </linearGradient>
        </defs>
      </svg>
      <span>{children}</span>
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
  const styles = tone === 'brand'
    ? { background: 'rgba(92,46,212,0.08)', border: '1px solid rgba(92,46,212,0.18)', color: '#5C2ED4' }
    : { background: 'white', border: '1px solid #E5E7EB', color: '#6B7280' }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold" style={styles}>
      {children}
    </span>
  )
}

/* Info dot with a hover-opened definition card. */
export function InfoDot({ text, title, label = 'What this covers' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickAway(ref, () => setOpen(false))

  return (
    <span
      className="relative inline-flex"
      ref={ref}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="im-info-dot w-3.5 h-3.5 rounded-full flex items-center justify-center"
      >
        <span className="text-[9px] font-bold leading-none">i</span>
      </button>

      {open && (
        <span className="absolute left-0 top-full pt-2 z-40">
          <span
            role="dialog"
            aria-label={title || label}
            className="im-info-pop block w-80 max-w-[80vw] rounded-2xl overflow-hidden text-left"
          >
            <span className="im-info-pop-head flex items-start justify-between gap-3 px-4 py-3">
              <span className="text-[14px] font-bold text-gray-900 leading-snug">{title || label}</span>
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
export function YesNo({ value, onChange, name, className = '' }) {
  const pill = (v, labelText) => {
    const on = value === v
    return (
      <button
        key={v}
        type="button"
        role="radio"
        aria-checked={on}
        onClick={() => onChange && onChange(v)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${
          on
            ? 'border-[#5C2ED4] text-[#5C2ED4]'
            : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
        }`}
        style={on ? { background: 'linear-gradient(88.09deg, rgba(92,46,212,0.08) 0%, rgba(166,20,195,0.08) 100%)' } : undefined}
      >
        <span
          className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
            on ? 'border-[#A614C3]' : 'border-gray-300'
          }`}
        >
          {on && <span className="w-1.5 h-1.5 rounded-full" style={{ background: BRAND_GRADIENT }} />}
        </span>
        {labelText}
      </button>
    )
  }
  return (
    <div className={`flex gap-4 ${className}`} role="radiogroup" aria-label={name}>
      {pill('yes', 'Yes')}
      {pill('no', 'No')}
    </div>
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
        ? { background: '#D1D5DB', color: 'white', cursor: 'not-allowed' }
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
            className="h-10 px-6 min-w-[112px] inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'white', border: '1.5px solid #E5E7EB', color: '#6B7280' }}
          >
            Back
          </button>
        ) : <span />}
        <PrimaryButton onClick={onContinue} disabled={!canContinue}>{continueLabel}</PrimaryButton>
      </div>
    </div>
  )
}
