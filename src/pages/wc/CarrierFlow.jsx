import { useState } from 'react'
import { Input, Select } from '../../components/FormField'
import { YesNo as Seg } from '../../components/wc/primitives'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

/* The card supplies the side padding; the rows supply the vertical
   rhythm, and divide-y draws rules only between them — so the last row
   never leaves a hairline floating above the card's edge. */
function FieldGroup({ label, children }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-2.5 pl-0.5">{label}</div>
      <div className="rounded-xl px-5 sm:px-6 py-1 divide-y divide-[#F3F4F6]"
        style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
        {children}
      </div>
    </div>
  )
}

/* One row of the group: the sentence on the left, its controls on the
   right, on a fixed 56px line so pill answers and selects sit level. */
function GroupRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 min-h-[56px] py-1.5">
      <span className="text-sm text-gray-800 min-w-0">{label}</span>
      <span className="flex items-center gap-3 shrink-0">{children}</span>
    </div>
  )
}

export default function CarrierFlow({ formData, updateFormData, onContinueToQuote, onBack }) {
  const carrier = formData.bind?.selectedCarrier || 'CNA'
  const pz = formData.pageZero || {}
  const biz = formData.business || {}
  const uw = formData.underwriting || {}

  const [answers, setAnswers] = useState({ newResidential: 'no', mix: 'mixed' })
  const canContinue = answers.newResidential && answers.mix

  return (
    <div className="w-full space-y-6">
      {/* Auto-resolve note — the canonical info panel. */}
      <div className="rounded-xl p-4 flex items-start gap-3"
        style={{ background: 'rgba(92,46,212,0.05)', border: '1px solid rgba(92,46,212,0.18)' }}>
        <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="#5C2ED4" strokeWidth="1.8" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5" strokeLinecap="round" />
          <circle cx="12" cy="16.5" r="0.6" fill="#5C2ED4" />
        </svg>
        <p className="text-[12.5px] text-gray-600 leading-relaxed">
          <span className="font-bold text-navy">Descriptor selected automatically.</span>{' '}
          Class {pz.mainClass || '5183'} — {pz.classDescription || 'Plumbing NOC'} is the only
          descriptor for this class, so we skipped that page. When a class has multiple descriptors
          (mowing vs. tree pruning, say), you'll choose here instead.
        </p>
      </div>

      {/* Carried over from the application, but live — reading the answer
          and fixing it are the same gesture, so nobody has to leave the
          page to correct one. Edits write back to the source section. */}
      <FieldGroup label="Answered from your application">
        <GroupRow label="Years in business">
          <div style={{ width: 96 }}>
            <Input
              type="number"
              value={biz.yearsInBusiness || ''}
              onChange={v => updateFormData('business', { yearsInBusiness: v })}
            />
          </div>
        </GroupRow>
        <GroupRow label="Subcontracted work > 25% of receipts">
          <Seg
            value={uw.sub_25_pct || 'no'}
            onChange={v => updateFormData('underwriting', { sub_25_pct: v })}
          />
        </GroupRow>
        <GroupRow label="Written safety program in place">
          <Seg
            value={uw.safety_program || 'yes'}
            onChange={v => updateFormData('underwriting', { safety_program: v })}
          />
        </GroupRow>
      </FieldGroup>

      <FieldGroup label={`2 questions ${carrier} still needs`}>
        <GroupRow label="Any work on new residential construction > 3 units?">
          <Seg
            value={answers.newResidential}
            onChange={v => setAnswers(a => ({ ...a, newResidential: v }))}
          />
        </GroupRow>
        <GroupRow label="Percentage of commercial vs. residential work">
          <div style={{ width: 200 }}>
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
        </GroupRow>
      </FieldGroup>

      <div className={`pt-2 flex items-center gap-3 ${onBack ? 'justify-between' : 'justify-start'}`}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="h-10 px-5 inline-flex items-center justify-center rounded-xl text-sm font-semibold"
            style={{ background: 'white', border: '1.5px solid #E5E7EB', color: '#6B7280' }}
          >
            Back
          </button>
        )}
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => {
            updateFormData('bind', { carrierQuestions: answers, packageId: 'wc-basic', addonsConfirmed: true })
            onContinueToQuote && onContinueToQuote()
          }}
          className="flex items-center gap-2 px-7 py-2.5 text-sm font-semibold text-white rounded-xl transition hover:opacity-90 disabled:cursor-not-allowed"
          style={canContinue
            ? { background: BRAND_GRADIENT, boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }
            : { background: '#D1D5DB' }}
        >
          Continue to quote
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
