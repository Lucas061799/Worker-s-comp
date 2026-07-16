import { useState } from 'react'
import norbieface from '../../assets/norbieface.png'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

const DECLINE_ITEMS = [
  'Employees under the age of 16',
  'Work aboard aircraft or watercraft',
  'Demolition, blasting, or use of explosives',
  'Work above three stories in height',
  'Coverage declined or canceled for fraud or misrepresentation',
  'Operations involving asbestos or hazardous waste removal',
]

const SAFETY_QUESTIONS = [
  { key: 'safety_program', label: 'Written safety program in place' },
  { key: 'toolbox_talks',  label: 'Regular toolbox talks / safety meetings' },
  { key: 'osha_training',  label: 'OSHA-compliant training for field staff' },
]

const EMPLOYEE_QUESTIONS = [
  { key: 'sub_certificates', label: 'Certificates collected from all subcontractors' },
  { key: 'sub_25_pct',       label: 'Subcontracted work > 25% of receipts' },
]

// Standard (recommended) answers for the quick-fill banner. WC defaults
// match the HTML proposal — auto-decline No, safety practices Yes,
// certificates Yes, sub > 25% No.
const RECOMMENDED = {
  decline_any:      'No',
  safety_program:   'Yes',
  toolbox_talks:    'Yes',
  osha_training:    'Yes',
  sub_certificates: 'Yes',
  sub_25_pct:       'No',
}

const ALL_KEYS = ['decline_any', 'safety_program', 'toolbox_talks', 'osha_training', 'sub_certificates', 'sub_25_pct']

const YES_NO_STYLES = {
  Yes: { border: '#5C2ED4', text: '#5C2ED4', bg: 'rgba(92,46,212,0.08)',  dot: 'linear-gradient(88.09deg, #5C2ED4 0%, #7C3AED 100%)' },
  No:  { border: '#A614C3', text: '#A614C3', bg: 'rgba(166,20,195,0.08)', dot: 'linear-gradient(88.09deg, #A614C3 0%, #D946EF 100%)' },
}

function ColoredYesNo({ value, onChange }) {
  return (
    <div className="flex gap-2 shrink-0">
      {['No', 'Yes'].map(opt => {
        const s = YES_NO_STYLES[opt]
        const active = value === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange && onChange(opt)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border-[1.5px] transition-all text-xs font-semibold"
            style={active
              ? { borderColor: s.border, color: s.text, background: s.bg }
              : { borderColor: '#E5E7EB', color: '#6B7280', background: 'white' }
            }
          >
            <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0"
              style={{ borderColor: active ? s.border : '#D1D5DB' }}>
              {active && <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />}
            </div>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function QuestionRow({ label, subtext, value, onChange, hasError = false, autoFilled = false }) {
  return (
    <div
      className="rounded-xl p-4 transition"
      style={{
        background: '#F9FAFB',
        border: hasError ? '1px solid #FCA5A5' : '1px solid #E5E7EB',
        boxShadow: hasError ? '0 0 0 2px rgba(252,165,165,0.3)' : 'none',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2 flex-wrap">
            <p className="text-sm font-medium text-gray-800 leading-snug">{label}</p>
            {autoFilled && (
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                style={{ background: 'rgba(243,240,255,1)', color: '#5C2ED4' }}
              >
                Auto-Filled
              </span>
            )}
          </div>
          {subtext && (
            <p className="text-xs text-gray-500 mt-1 leading-snug">{subtext}</p>
          )}
        </div>
        <ColoredYesNo value={value} onChange={onChange} />
      </div>
      {hasError && (
        <p className="text-[10px] text-red-500 mt-2 flex items-center gap-1">
          <span>⚠</span> Please answer this question
        </p>
      )}
    </div>
  )
}

function CollapsibleGroup({ title, count, color = '#5C2ED4', defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition"
        style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color }}>{title}</span>
          {count !== undefined && (
            <span className="text-[11px] font-medium" style={{ color: '#9CA3AF' }}>
              ({count} {count === 1 ? 'question' : 'questions'})
            </span>
          )}
        </div>
        <svg
          className="w-4 h-4 transition-transform shrink-0"
          style={{ color, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      {open && <div className="pt-2 space-y-2">{children}</div>}
    </div>
  )
}

// Special row for the auto-decline group — one Yes/No answers all six
// items. Renders the bulleted list of knockout conditions above a
// ColoredYesNo and surfaces the red alert when Yes is selected.
function DeclineRow({ items, value, onChange, hasError }) {
  const triggered = value === 'Yes'
  return (
    <div
      className="rounded-xl overflow-hidden transition"
      style={{
        background: '#F9FAFB',
        border: hasError ? '1px solid #FCA5A5' : '1px solid #E5E7EB',
        boxShadow: hasError ? '0 0 0 2px rgba(252,165,165,0.3)' : 'none',
      }}
    >
      {/* Knockout conditions — two-column grid with branded bullets */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-2.5">
          Knockout conditions
        </p>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
          {items.map(i => (
            <div key={i} className="flex items-start gap-2.5">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0 mt-2"
                style={{ background: BRAND_GRADIENT }}
              />
              <span className="text-[13px] text-gray-700 leading-snug">{i}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer strip — question + Yes/No, on its own light bg */}
      <div
        className="flex items-center justify-between gap-3 px-4 py-3"
        style={{ background: 'white', borderTop: '1px solid #E5E7EB' }}
      >
        <p className="text-sm font-semibold text-gray-900">
          Any of the above apply to this business?
        </p>
        <ColoredYesNo value={value} onChange={onChange} />
      </div>

      {triggered && (
        <div
          className="px-4 py-3 text-xs flex items-start gap-2"
          style={{ background: '#FBEDEA', color: '#B3402F', borderTop: '1px solid #EFC5BC' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>
            <b>Heads up.</b> One or more knockout conditions apply — this risk is likely to decline across the panel. You can continue, but expect referrals.
          </span>
        </div>
      )}

      {hasError && (
        <p className="text-[10px] text-red-500 px-4 py-2 flex items-center gap-1"
          style={{ borderTop: '1px solid #FEE2E2', background: '#FEF2F2' }}>
          <span>⚠</span> Please answer this question
        </p>
      )}
    </div>
  )
}

export default function UnderwritingQuestions({
  formData,
  updateFormData,
  onGetIndication,
  onBack,
  quoting = false,
  quotesReady = false,
  showErrors = false,
  onValidateAll,
}) {
  const data = formData.underwriting || {}
  const set = (key) => (val) => updateFormData('underwriting', { [key]: val })
  const err = (key) => showErrors && (data[key] === undefined || data[key] === null || data[key] === '')

  const [quickFilled, setQuickFilled] = useState(false)

  const allAnswered = ALL_KEYS.every(k => data[k] !== undefined && data[k] !== null && data[k] !== '')

  const handleQuickFill = () => {
    updateFormData('underwriting', RECOMMENDED)
    setQuickFilled(true)
  }

  const handleReset = () => {
    updateFormData('underwriting', Object.fromEntries(ALL_KEYS.map(k => [k, undefined])))
    setQuickFilled(false)
  }

  const handleContinue = () => {
    if (onValidateAll && !onValidateAll()) return
    onGetIndication && onGetIndication()
  }

  return (
    <div className="w-full space-y-5">
      <p className="text-sm text-gray-500 -mt-2">
        Grouped so it reads as three short sections — not thirty scattered boxes.
      </p>

      {/* Norbie quick-fill banner */}
      {!quickFilled && !allAnswered && (
        <div
          className="rounded-xl px-5 py-4"
          style={{
            background: 'linear-gradient(135deg, #F8F6FF 0%, #F2FAF8 100%)',
            border: '1px solid rgba(124,58,237,0.12)',
          }}
        >
          <div className="hidden md:flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={norbieface} alt="Norbie" className="w-9 h-9 rounded-full shrink-0" />
              <div>
                <p className="text-sm font-bold leading-snug" style={{ color: '#1B0750' }}>
                  Let Norbie pre-fill standard answers.
                </p>
                <p className="text-xs mt-0.5 text-gray-500">
                  Apply <span className="font-semibold text-gradient">recommended answers</span> instantly
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="btn-gradient force-white-text flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition hover:opacity-90 shrink-0"
              style={{ background: BRAND_GRADIENT, boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Quick-fill standard answers
            </button>
          </div>

          <div className="md:hidden">
            <div className="flex items-center gap-3 mb-3">
              <img src={norbieface} alt="Norbie" className="w-9 h-9 rounded-full shrink-0" />
              <div>
                <p className="text-sm font-bold leading-snug" style={{ color: '#1B0750' }}>
                  Let Norbie pre-fill standard answers.
                </p>
                <p className="text-xs mt-0.5 text-gray-500">
                  Apply <span className="font-semibold text-gradient">recommended answers</span> instantly
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="btn-gradient force-white-text w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition hover:opacity-90"
              style={{ background: BRAND_GRADIENT, boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Quick-fill standard answers
            </button>
          </div>
        </div>
      )}

      {/* Reset link after quick-fill */}
      {quickFilled && allAnswered && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium" style={{ color: '#5C2ED4' }}>
            Standard answers applied — expand each group to review or adjust.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold underline"
            style={{ color: '#6B7280' }}
          >
            Reset
          </button>
        </div>
      )}

      {/* Group 1 — Auto-decline */}
      <CollapsibleGroup
        title="Do any of the following apply?"
        count={1}
        color="#5C2ED4"
        defaultOpen={true}
      >
        <DeclineRow
          items={DECLINE_ITEMS}
          value={data.decline_any}
          onChange={set('decline_any')}
          hasError={err('decline_any')}
        />
      </CollapsibleGroup>

      {/* Group 2 — Safety practices */}
      <CollapsibleGroup
        title="Safety practices"
        count={SAFETY_QUESTIONS.length}
        color="#5C2ED4"
        defaultOpen={true}
      >
        {SAFETY_QUESTIONS.map(q => (
          <QuestionRow
            key={q.key}
            label={q.label}
            value={data[q.key]}
            onChange={set(q.key)}
            hasError={err(q.key)}
            autoFilled={quickFilled && data[q.key] === RECOMMENDED[q.key]}
          />
        ))}
      </CollapsibleGroup>

      {/* Group 3 — Employees & subs */}
      <CollapsibleGroup
        title="Employees & subcontractors"
        count={EMPLOYEE_QUESTIONS.length}
        color="#A614C3"
        defaultOpen={true}
      >
        {EMPLOYEE_QUESTIONS.map(q => (
          <QuestionRow
            key={q.key}
            label={q.label}
            value={data[q.key]}
            onChange={set(q.key)}
            hasError={err(q.key)}
            autoFilled={quickFilled && data[q.key] === RECOMMENDED[q.key]}
          />
        ))}
      </CollapsibleGroup>

      {/* Back / Continue */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: 'white', color: '#6B7280', border: '1.5px solid #E5E7EB' }}
          >
            ← Back
          </button>
        ) : <span />}
        <button
          type="button"
          disabled={!allAnswered || quoting || quotesReady}
          onClick={handleContinue}
          className="btn-gradient force-white-text px-8 py-3 rounded-xl text-sm font-bold transition-all"
          style={{
            background: allAnswered ? BRAND_GRADIENT : '#D1D5DB',
            boxShadow: allAnswered ? '0 4px 20px rgba(92,46,212,0.3)' : 'none',
            cursor: allAnswered && !quoting && !quotesReady ? 'pointer' : 'not-allowed',
            opacity: quoting || quotesReady ? 0.7 : 1,
          }}
        >
          {quoting ? 'Getting Quotes…' : quotesReady ? 'Quotes Ready ✓' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}
