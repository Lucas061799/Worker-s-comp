import { useState } from 'react'
import { Select } from '../../components/FormField'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

function FieldGroup({ label, children }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-2.5 pl-0.5">{label}</div>
      <div className="rounded-xl p-5 sm:p-6"
        style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
        {children}
      </div>
    </div>
  )
}

function ConfirmChip({ label, value, source, onChange }) {
  return (
    <div
      className="grid items-center gap-3 px-4 py-2.5 rounded-lg mb-2"
      style={{
        background: 'white',
        border: '1px solid rgba(92,46,212,0.15)',
        gridTemplateColumns: 'minmax(0,1fr) 220px auto',
      }}
    >
      <span className="text-sm text-gray-800 truncate">
        {label} — <b className="text-gray-900">{value}</b>
      </span>
      <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wide">
        from {source}
      </span>
      <button
        type="button"
        onClick={onChange}
        className="text-xs font-semibold underline shrink-0 transition hover:opacity-80"
        style={{ color: '#5C2ED4' }}
      >
        Change
      </button>
    </div>
  )
}

// Outlined Yes/No pill pair — purple for Yes, magenta for No, each with a
// filled radio dot inside. Matches the ColoredYesNo pattern from
// UnderwritingQuestions so every Y/N control in the app is consistent.
const YES_NO_STYLES = {
  yes: { border: '#5C2ED4', text: '#5C2ED4', bg: 'rgba(92,46,212,0.08)',  dot: 'linear-gradient(88.09deg, #5C2ED4 0%, #7C3AED 100%)' },
  no:  { border: '#A614C3', text: '#A614C3', bg: 'rgba(166,20,195,0.08)', dot: 'linear-gradient(88.09deg, #A614C3 0%, #D946EF 100%)' },
}

function Seg({ value, onChange }) {
  return (
    <div className="flex gap-2 shrink-0">
      {[
        { label: 'No',  val: 'no'  },
        { label: 'Yes', val: 'yes' },
      ].map(opt => {
        const s = YES_NO_STYLES[opt.val]
        const active = value === opt.val
        return (
          <button
            key={opt.val}
            type="button"
            onClick={() => onChange(opt.val)}
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
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export default function CarrierFlow({ formData, updateFormData, onContinueToQuote, onGoToStep, onBack }) {
  const carrier = formData.bind?.selectedCarrier || 'CNA'
  const pz = formData.pageZero || {}
  const biz = formData.business || {}
  const uw = formData.underwriting || {}

  const [answers, setAnswers] = useState({ newResidential: 'no', mix: 'mixed' })
  const canContinue = answers.newResidential && answers.mix

  return (
    <div className="w-full space-y-6">
      <p className="text-xs font-bold uppercase tracking-[0.15em] font-mono"
        style={{
          background: BRAND_GRADIENT,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Carrier flow · {carrier}
      </p>
      <p className="text-sm text-gray-500 -mt-4">
        We answered what we could from your application — confirm or change, then finish the two that remain.
      </p>

      {/* Auto-resolve banner */}
      <div
        className="rounded-lg p-4 flex items-start gap-3"
        style={{ background: '#F3F0FF', border: '1px solid rgba(92,46,212,0.15)' }}
      >
        <span
          className="w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: BRAND_GRADIENT }}
        >
          ✓
        </span>
        <p className="text-sm text-gray-700 leading-relaxed">
          <b className="text-gray-900">Descriptor selected automatically.</b>{' '}
          Class <span className="font-mono">{pz.mainClass || '5183'} · {pz.classDescription || 'Plumbing NOC'}</span> is the only descriptor for this class — we skipped that page.
          When a class has multiple descriptors (e.g., mowing vs. tree pruning), you'll choose here instead.
        </p>
      </div>

      <FieldGroup label="Answered from your application">
        <div>
          <ConfirmChip
            label="Years in business" value={biz.yearsInBusiness || '8'}
            source="Business info"
            onChange={() => onGoToStep && onGoToStep(1)}
          />
          <ConfirmChip
            label="Subcontractor work > 25%" value={uw.sub_25_pct === 'yes' ? 'Yes' : 'No'}
            source="Underwriting questions"
            onChange={() => onGoToStep && onGoToStep(5)}
          />
          <ConfirmChip
            label="Written safety program" value={uw.safety_program === 'no' ? 'No' : 'Yes'}
            source="Underwriting questions"
            onChange={() => onGoToStep && onGoToStep(5)}
          />
        </div>
      </FieldGroup>

      <FieldGroup label={`2 questions ${carrier} still needs`}>
        <div>
          <div className="flex items-center justify-between gap-4 py-3"
            style={{ borderBottom: '1px solid #F3F4F6' }}>
            <span className="text-sm text-gray-800">Any work on new residential construction &gt; 3 units?</span>
            <Seg
              value={answers.newResidential}
              onChange={v => setAnswers(a => ({ ...a, newResidential: v }))}
            />
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <span className="text-sm text-gray-800">Percentage of commercial vs. residential work</span>
            <div style={{ minWidth: 200 }}>
              <Select
                options={[
                  { value: 'commercial',   label: 'Mostly commercial' },
                  { value: 'mixed',        label: 'Mixed 50 / 50' },
                  { value: 'residential',  label: 'Mostly residential' },
                ]}
                value={answers.mix}
                onChange={val => setAnswers(a => ({ ...a, mix: val }))}
              />
            </div>
          </div>
        </div>
      </FieldGroup>

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
          disabled={!canContinue}
          onClick={() => {
            updateFormData('bind', { carrierQuestions: answers, packageId: 'wc-basic', addonsConfirmed: true })
            onContinueToQuote && onContinueToQuote()
          }}
          className="btn-gradient force-white-text px-8 py-3 rounded-xl text-sm font-bold"
          style={{
            background: canContinue ? BRAND_GRADIENT : '#D1D5DB',
            boxShadow: canContinue ? '0 4px 20px rgba(92,46,212,0.3)' : 'none',
            cursor: canContinue ? 'pointer' : 'not-allowed',
          }}
        >
          Continue to quote →
        </button>
      </div>
    </div>
  )
}
