import { useState } from 'react'
import norbieface from '../../assets/norbieface.png'
import { Select } from '../../components/FormField'
import {
  BRAND_GRADIENT,
  BrandText,
  RowGroup,
  AnswerRow,
  YesNo,
  PrimaryButton,
  Banner,
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

  const [quickFilled, setQuickFilled] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

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
        Please validate all credit questions for this risk to improve pricing.
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
        <div
          className="im-info-panel rounded-xl px-4 py-3 flex items-center justify-between gap-3"
        >
          <p className="text-xs font-medium" style={{ color: '#5C2ED4' }}>
            Standard answers applied — expand each card below to review or adjust.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="text-[10px] underline shrink-0"
            style={{ color: '#6B7280' }}
          >
            Reset all
          </button>
        </div>
      )}

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

      {/* Action row — Continue is left-aligned; clicking it opens the
          Application Preview so the agent reviews the whole submission
          before it goes to rating. Matches Commercial Auto's pattern. */}
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
          onClick={() => {
            if (onValidateAll && !onValidateAll()) return
            setShowPreview(true)
          }}
          disabled={!allAnswered || quoting || quotesReady}
          className="flex items-center gap-2 px-7 py-2.5 text-sm font-semibold text-white rounded-xl transition hover:opacity-90 disabled:cursor-not-allowed"
          style={allAnswered && !quoting && !quotesReady
            ? { background: BRAND_GRADIENT, boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }
            : { background: '#D1D5DB' }}
        >
          {quoting ? 'Getting Quotes…' : quotesReady ? 'Quotes Ready ✓' : 'Preview & Continue'}
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      {showPreview && (
        <ApplicationPreviewModal
          formData={formData}
          onClose={() => setShowPreview(false)}
          onSubmit={() => { setShowPreview(false); onGetIndication && onGetIndication() }}
        />
      )}
    </div>
  )
}

function PreviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid #F3F4F6' }}>
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-semibold text-gray-800 text-right">{value || '—'}</span>
    </div>
  )
}

const PREVIEW_ICONS = {
  building: 'M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1M9 13h1m4 0h1M9 17h1m4 0h1',
  doc:      'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  clock:    'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  tools:    'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  shield:   'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  user:     'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
}

/* Same panel head the submission receipt and print summary use: teal
   icon chip, bold navy title. */
function PreviewSection({ title, icon = 'shield', children }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(115,201,183,0.12)' }}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="#73C9B7" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={PREVIEW_ICONS[icon] || PREVIEW_ICONS.shield} />
          </svg>
        </div>
        <h3 className="text-xs font-bold text-navy">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function ApplicationPreviewModal({ formData, onClose, onSubmit }) {
  const pz  = formData.pageZero      || {}
  const biz = formData.business      || {}
  const hist= formData.history       || {}
  const state = pz.state || 'CA'
  const stateCov = (formData.coverage || {})[state] || {}
  const uw  = formData.underwriting  || {}
  const sel = formData.carrierSelection?.checked || {}
  const selectedCount = Object.values(sel).filter(Boolean).length
  const totalPayroll = (stateCov.classes || []).reduce((sum, c) => {
    const n = parseInt(String(c.payroll || '').replace(/[^\d]/g, ''), 10)
    return sum + (Number.isFinite(n) ? n : 0)
  }, 0)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,10,40,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ maxHeight: '92vh', background: '#F9FAFB' }}
        onClick={ev => ev.stopPropagation()}
      >
        <div className="shrink-0" style={{ background: 'white', borderBottom: '1px solid #F3F4F6' }}>
          <div className="flex items-start gap-4 px-5 pt-4 pb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(88.09deg,rgba(92,46,212,0.12) 0%,rgba(166,20,195,0.12) 100%)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="wcPrevHdrG" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#5C2ED4"/>
                    <stop offset="100%" stopColor="#A614C3"/>
                  </linearGradient>
                </defs>
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  stroke="url(#wcPrevHdrG)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold leading-tight text-gray-900">Application Overview</h1>
              <p className="text-xs mt-0.5 text-gray-500">Review the submission before it goes to rating.</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all"
              style={{ border: '1px solid #E5E7EB', background: 'white' }}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <PreviewSection title="Business">
              <PreviewRow label="Name" value={biz.name} />
              <PreviewRow label="Entity" value={biz.entityType && ({corp:'Corporation',llc:'LLC',sole:'Sole proprietor',partner:'Partnership'})[biz.entityType]} />
              <PreviewRow label="Primary state" value={pz.state} />
              <PreviewRow label="Effective" value={pz.effectiveDate} />
              <PreviewRow label="Years in business" value={biz.yearsInBusiness} />
            </PreviewSection>

            <PreviewSection title="Class & payroll">
              <PreviewRow label="Primary class" value={pz.mainClass && `${pz.mainClass} — ${pz.classDescription}`} />
              <PreviewRow label="Industry" value={pz.industry} />
              <PreviewRow label="Classes on file" value={(stateCov.classes || []).length} />
              <PreviewRow label="Annual payroll" value={totalPayroll ? `$${totalPayroll.toLocaleString()}` : '—'} />
              <PreviewRow label="Blanket waiver" value={stateCov.blanketWaiver ? 'Yes' : 'No'} />
            </PreviewSection>

            <PreviewSection title="Coverage history">
              <PreviewRow label="Coverage status" value={hist.currentCarrier || hist.coverageStatus} />
              <PreviewRow label="Claims (4 yrs)" value={hist.claimCount ?? 0} />
              <PreviewRow label="Experience mod" value={uw.experienceMod && `${uw.experienceMod} · ${uw.experienceModSource || ''}`} />
            </PreviewSection>

            <PreviewSection title="Credit opportunity">
              <PreviewRow label="Safety program" value={uw.safety_program === 'yes' ? 'Yes' : 'No'} />
              <PreviewRow label="Safety meetings" value={uw.safety_meetings === 'yes' ? 'Yes' : 'No'} />
              <PreviewRow label="Return to work program" value={uw.return_to_work === 'yes' ? 'Yes' : 'No'} />
              <PreviewRow label="Turnover rate" value={uw.turnover_rate} />
            </PreviewSection>

            <PreviewSection title="Carriers">
              <PreviewRow label="Markets selected" value={selectedCount ? `${selectedCount} of 6` : 'All'} />
            </PreviewSection>

            <PreviewSection title="Contact">
              <PreviewRow label="Phone" value={biz.phone} />
              <PreviewRow label="Email" value={biz.email} />
            </PreviewSection>
          </div>
        </div>

        <div className="shrink-0 px-5 py-3.5 flex items-center justify-between gap-3"
          style={{ borderTop: '1px solid #E5E7EB', background: 'white' }}>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-semibold"
            style={{ background: 'white', color: '#6B7280', border: '1.5px solid #E5E7EB' }}
          >
            Keep editing
          </button>
          <button
            onClick={onSubmit}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
            style={{ background: BRAND_GRADIENT, boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }}
          >
            Get price indication →
          </button>
        </div>
      </div>
    </div>
  )
}
