import { useState } from 'react'
import { Input, Select } from '../../components/FormField'
import {
  RowGroup as FieldGroup,
  AnswerRow as GroupRow,
  YesNo as Seg,
} from '../../components/wc/primitives'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

const CERTIFICATES = ['Yes', 'No', 'Sometimes']

export default function CarrierFlow({ formData, updateFormData, onContinueToQuote, onBack }) {
  const carrier = formData.bind?.selectedCarrier || 'CNA'
  const pz = formData.pageZero || {}
  const biz = formData.business || {}
  const uw = formData.underwriting || {}
  const state = pz.state || 'CA'
  const cov = formData.coverage || {}
  const stateCov = cov[state] || {}
  const patchCoverage = (partial) =>
    updateFormData('coverage', { ...cov, [state]: { ...stateCov, ...partial } })

  const [answers, setAnswers] = useState({ publicInfrastructure: 'no', trenchDepth: '' })
  const canContinue = !!answers.publicInfrastructure && !!answers.trenchDepth

  return (
    <div className="w-full space-y-6">
      {/* Auto-resolve note — the canonical info panel. */}
      <div className="im-info-panel rounded-xl p-4 flex items-center gap-3">
        <span className="im-panel-icon w-7 h-7 rounded-full flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5" strokeLinecap="round" />
          <circle cx="12" cy="16.5" r="0.6" fill="currentColor" />
          </svg>
        </span>
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
        <GroupRow label="Year business was established">
          {/* Matches the Yes/No pair below it, so every control in the
              group starts and ends on the same two edges. */}
          <div style={{ width: 150 }}>
            {/* Plain text, exactly as Business info types the same field —
                type="number" brings the native stepper with it. */}
            <Input
              align="right"
              value={biz.yearEstablished || ''}
              onChange={v => updateFormData('business', { yearEstablished: v })}
            />
          </div>
        </GroupRow>
        <GroupRow label="Is there a written safety program/policy?">
          <Seg
            value={uw.safety_program || 'yes'}
            onChange={v => updateFormData('underwriting', { safety_program: v })}
          />
        </GroupRow>
        <GroupRow
          label="Certificates collected for all subs?"
          help={stateCov.usesSubs === 'yes' && stateCov.subPercent
            ? `${stateCov.subPercent}% of work subcontracted`
            : undefined}
        >
          <div style={{ width: 150 }}>
            <Select
              options={CERTIFICATES}
              value={stateCov.subCertificates || 'Yes'}
              onChange={v => patchCoverage({ subCertificates: v })}
            />
          </div>
        </GroupRow>
      </FieldGroup>

      <FieldGroup label={`2 questions ${carrier} still needs`}>
        <GroupRow label="Any work on public infrastructure?">
          <Seg
            value={answers.publicInfrastructure}
            onChange={v => setAnswers(a => ({ ...a, publicInfrastructure: v }))}
          />
        </GroupRow>
        <GroupRow label="Max trench depth (ft)">
          <div style={{ width: 150 }}>
            <Input
              align="right"
              value={answers.trenchDepth}
              onChange={val => setAnswers(a => ({ ...a, trenchDepth: val }))}
              placeholder="0"
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
            : { background: 'var(--fill-disabled)', color: '#9CA3AF' }}
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
