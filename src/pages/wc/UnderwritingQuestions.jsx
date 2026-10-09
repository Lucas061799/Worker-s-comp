import { useEffect } from 'react'
import { Select } from '../../components/FormField'
import {
  BRAND_GRADIENT,
  RowGroup,
  AnswerRow,
  YesNo,
  PrimaryButton,
} from '../../components/wc/primitives'

/* The BTIS credit questionnaire, grouped by topic so the run of fifteen
   reads as four short lists rather than one wall. No conditional logic —
   every question is asked on every risk. Eligibility knockouts no longer
   live here; appetite is settled on page one. */
const CREDIT_GROUPS = [
  {
    label: 'Workforce & experience',
    questions: [
      { key: 'owner_involved',   label: 'Is the owner directly involved in day-to-day operations?' },
      { key: 'ten_years_exp',    label: 'Does the applicant have a minimum of 10 years experience in the industry of business?' },
      { key: 'supervisor_ratio', label: 'Is the supervisor to employee ratio low (1 sup / 12 or fewer employees)?' },
      {
        key: 'turnover_rate',
        label: "What is the applicant's annual employee turnover rate?",
        type: 'select',
        width: 150,
        options: ['Under 10%', '10-25%', '26-35%', '36-50%', '51-100%'],
      },
    ],
  },
  {
    label: 'Safety & training',
    questions: [
      { key: 'safety_program',      label: 'Is there a written safety program/policy?' },
      { key: 'safety_committee',    label: 'Is there a safety committee or designated safety manager?' },
      { key: 'safety_meetings',     label: 'Are regular safety meetings held with employees?' },
      { key: 'orientation_program', label: 'Does the business offer a formal orientation or training program?' },
      { key: 'accident_procedures', label: 'Are there formal accident investigation procedures in place?' },
      { key: 'ppe_required',        label: 'Are employees required to use appropriate personal protective equipment?' },
      { key: 'machines_guarded',    label: 'Are all machines, tools, and other devices properly guarded?' },
      { key: 'first_aid',           label: 'Are first aid kits, eye wash stations, and/or other medical devices available?' },
    ],
  },
  {
    label: 'Employee programs',
    questions: [
      { key: 'benefits_provided', label: 'Are benefits provided for employees?' },
      { key: 'drug_testing',      label: 'Is drug testing required of employees pre-employment?' },
      { key: 'return_to_work',    label: 'Is there a return to work program in place?' },
    ],
  },
  {
    label: 'Housekeeping',
    questions: [
      {
        key: 'cleaning_frequency',
        label: 'How often does the business clean employee work areas, common areas and/or public areas?',
        type: 'select',
        width: 150,
        options: ['Daily', 'Weekly', 'Never'],
      },
    ],
  },
]

const ALL_QUESTIONS = CREDIT_GROUPS.flatMap(g => g.questions)
const ALL_KEYS = ALL_QUESTIONS.map(q => q.key)

/* Every Yes/No answer credits the risk, so Yes is the standard answer;
   the two dropdowns take the most common response. */
const RECOMMENDED = Object.fromEntries(ALL_QUESTIONS.map(q => [
  q.key,
  q.type === 'select' ? q.options[0] : 'yes',
]))

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


  const allAnswered = ALL_KEYS.every(k => data[k] !== undefined && data[k] !== null && data[k] !== '')

  /* The standard answer is the answer for most risks, so the page opens on
     it and the agent corrects what differs — which is what the line above
     asks them to do. Only blanks are filled, so coming back here never
     overwrites an answer already given. */
  useEffect(() => {
    const blanks = Object.fromEntries(
      Object.entries(RECOMMENDED).filter(([k]) => data[k] === undefined || data[k] === null || data[k] === ''),
    )
    if (Object.keys(blanks).length) updateFormData('underwriting', blanks)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleContinue = () => {
    if (onValidateAll && !onValidateAll()) return
    onGetIndication && onGetIndication()
  }

  return (
    <div className="w-full space-y-6">
      <p className="text-sm text-gray-500 -mt-2">
        Please validate all credit questions for this risk to improve pricing.
      </p>

      {/* Four topic groups, asked as a compact list — question on the
          left, its answer on the right. */}
      {CREDIT_GROUPS.map(group => (
        <RowGroup key={group.label} label={group.label}>
          {group.questions.map(q => (
            <AnswerRow key={q.key} label={q.label}>
              {q.type === 'select' ? (
                <div style={{ width: q.width || 150 }}>
                  <Select
                    options={q.options}
                    value={data[q.key]}
                    onChange={set(q.key)}
                    error={err(q.key)}
                  />
                </div>
              ) : (
                <YesNo value={data[q.key]} onChange={set(q.key)} name={q.label} />
              )}
            </AnswerRow>
          ))}
        </RowGroup>
      ))}

      {/* Action row. Continue used to open an Application Overview first,
          but a real application holds far more than a dialog can show, and
          a summary that leaves most of it out is not a review — the
          receipt at the end prints the whole submission. */}
      {/* With a Back button the pair sits one at each edge; without one the
          primary anchors left rather than drifting to the right margin. */}
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
          onClick={handleContinue}
          disabled={!allAnswered || quoting || quotesReady}
          className="flex items-center gap-2 px-7 py-2.5 text-sm font-semibold text-white rounded-xl transition hover:opacity-90 disabled:cursor-not-allowed"
          style={allAnswered && !quoting && !quotesReady
            ? { background: BRAND_GRADIENT, boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }
            : { background: 'var(--fill-disabled)', color: '#9CA3AF' }}
        >
          {quoting ? 'Getting Quotes…' : quotesReady ? 'Quotes Ready ✓' : 'Continue'}
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
