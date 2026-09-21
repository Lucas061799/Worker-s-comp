import { useState } from 'react'
import norbieface from '../../assets/norbieface.png'
import {
  BRAND_GRADIENT,
  BrandText,
  SectionLabel,
  QuestionCard,
  QuestionRow,
  YesNo,
  FieldError,
  PrimaryButton,
  Banner,
} from '../../components/wc/primitives'

/* Six knockout conditions — one Yes answers all of them. */
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

/* Standard (recommended) defaults — matches Inland's prototype-mode idea:
   an agent can accept the recommended answer set and see it applied. */
const RECOMMENDED = {
  decline_any:      'no',
  safety_program:   'yes',
  toolbox_talks:    'yes',
  osha_training:    'yes',
  sub_certificates: 'yes',
  sub_25_pct:       'no',
}

const ALL_KEYS = ['decline_any', 'safety_program', 'toolbox_talks', 'osha_training', 'sub_certificates', 'sub_25_pct']

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
  const declineTriggered = data.decline_any === 'yes'

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
        Answer three short sections — knockout conditions, safety practices, and employees & subs.
      </p>

      {/* Norbie quick-fill — brand banner, not a bespoke gradient */}
      {!quickFilled && !allAnswered && (
        <Banner icon={false}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <img src={norbieface} alt="Norbie" className="w-8 h-8 rounded-full shrink-0" />
              <div>
                <p className="text-[13px] font-semibold leading-snug text-gray-800">
                  Let Norbie pre-fill standard answers.
                </p>
                <p className="text-[11px] mt-0.5 text-gray-500">
                  Apply <BrandText className="font-semibold">recommended answers</BrandText> instantly.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="btn-gradient force-white-text inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold"
              style={{ background: BRAND_GRADIENT, boxShadow: '0 4px 14px rgba(92,46,212,0.22)' }}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Quick-fill
            </button>
          </div>
        </Banner>
      )}

      {quickFilled && allAnswered && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px]">
            <BrandText className="font-semibold">Standard answers applied.</BrandText>
            <span className="text-gray-500 ml-1">Expand each card below to review or adjust.</span>
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold underline text-gray-500"
          >
            Reset
          </button>
        </div>
      )}

      {/* Group 1 — Auto-decline */}
      <div>
        <SectionLabel>Knockout conditions</SectionLabel>
        <QuestionCard error={err('decline_any')}>
          <p className="text-[12px] uppercase tracking-[0.08em] font-bold text-gray-400 mb-3">
            Do any of the following apply?
          </p>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 mb-4">
            {DECLINE_ITEMS.map(i => (
              <div key={i} className="flex items-start gap-2.5">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0 mt-2"
                  style={{ background: BRAND_GRADIENT }}
                />
                <span className="text-[13px] text-gray-700 leading-snug">{i}</span>
              </div>
            ))}
          </div>
          <div className="im-rule pt-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">
              Any of the above apply to this business?
            </p>
            <YesNo value={data.decline_any} onChange={set('decline_any')} name="Auto-decline" />
          </div>
          {declineTriggered && (
            <div className="im-chip im-chip-stop mt-3">
              One or more knockout conditions apply — expect referrals.
            </div>
          )}
          {err('decline_any') && <FieldError className="mt-2">Please answer this question</FieldError>}
        </QuestionCard>
      </div>

      {/* Group 2 — Safety practices */}
      <div>
        <SectionLabel>Safety practices</SectionLabel>
        <div className="space-y-2">
          {SAFETY_QUESTIONS.map(q => (
            <QuestionRow
              key={q.key}
              label={q.label}
              value={data[q.key]}
              onChange={set(q.key)}
              error={err(q.key)}
            />
          ))}
        </div>
      </div>

      {/* Group 3 — Employees & subs */}
      <div>
        <SectionLabel>Employees &amp; subcontractors</SectionLabel>
        <div className="space-y-2">
          {EMPLOYEE_QUESTIONS.map(q => (
            <QuestionRow
              key={q.key}
              label={q.label}
              value={data[q.key]}
              onChange={set(q.key)}
              error={err(q.key)}
            />
          ))}
        </div>
      </div>

      {/* Continue */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="h-10 px-6 min-w-[112px] inline-flex items-center justify-center rounded-xl text-sm font-semibold"
            style={{ background: 'white', border: '1.5px solid #E5E7EB', color: '#6B7280' }}
          >
            Back
          </button>
        ) : <span />}
        <PrimaryButton
          onClick={handleContinue}
          disabled={!allAnswered || quoting || quotesReady}
        >
          {quoting ? 'Getting Quotes…' : quotesReady ? 'Quotes Ready ✓' : 'Continue'}
        </PrimaryButton>
      </div>
    </div>
  )
}
