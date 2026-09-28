import { Input, Select, Textarea } from '../../components/FormField'
import {
  FieldGroup,
  RowGroup,
  AnswerRow,
  Segmented,
  YesNo,
  InfoLine,
} from '../../components/wc/primitives'

/* Where the risk stands today. Everything below the status question is
   conditional on it: a lapse needs a reason, and only a risk that has (or
   recently had) a policy can name a carrier and premium. */
const COVERAGE_STATUS = [
  { value: 'inforce',    label: 'Coverage in force' },
  { value: 'lapse',      label: 'Lapse' },
  { value: 'newventure', label: 'New venture' },
  { value: 'noprior',    label: 'No prior' },
]

const PRIOR_YEARS = ['1', '2', '3', '4+']

/* The description carries weight in underwriting, so the counter nudges
   for a real sentence rather than a two-word trade name. */
const MIN_WORDS = 10
const countWords = (text) => (text || '').trim().split(/\s+/).filter(Boolean).length

export default function CoverageHistory({ formData, updateFormData }) {
  const data = formData.history || {}
  const status = data.coverageStatus || 'inforce'
  const claimsPast4 = data.claimsPast4
  const claimCount = data.claimCount ?? 0

  const patch = (partial) => updateFormData('history', partial)

  // Only a risk with a current or recently-lapsed policy has these.
  const hasPriorPolicy = status === 'inforce' || status === 'lapse'
  const words = countWords(data.operations)

  const setClaims = (val) => {
    // Answering No clears the count, which is what hides the Loss history step.
    patch(val === 'yes' ? { claimsPast4: 'yes' } : { claimsPast4: 'no', claimCount: 0 })
  }

  return (
    <div className="w-full space-y-6">
      <RowGroup label="Current coverage">
        <AnswerRow label="What is the current coverage status?">
          <Segmented
            options={COVERAGE_STATUS}
            value={status}
            onChange={val => patch({ coverageStatus: val })}
            name="Current coverage"
          />
        </AnswerRow>

        {status === 'lapse' && (
          <AnswerRow label="Reason for lapse">
            <div style={{ width: 260 }}>
              <Input
                value={data.lapseReason}
                onChange={val => patch({ lapseReason: val })}
                placeholder="Why did coverage lapse?"
              />
            </div>
          </AnswerRow>
        )}

        {hasPriorPolicy && (
          <AnswerRow label="How many prior years?">
            <div style={{ width: 150 }}>
              <Select
                options={PRIOR_YEARS}
                value={data.priorYears}
                onChange={val => patch({ priorYears: val })}
              />
            </div>
          </AnswerRow>
        )}

        {hasPriorPolicy && (
          <AnswerRow label="What is your current carrier?">
            <div style={{ width: 260 }}>
              <Input
                value={data.currentCarrier}
                onChange={val => patch({ currentCarrier: val })}
                placeholder="Carrier name"
              />
            </div>
          </AnswerRow>
        )}

        {hasPriorPolicy && (
          <AnswerRow label="What is your current premium?">
            <div style={{ width: 150 }}>
              <Input
                align="right"
                value={data.currentPremium}
                onChange={val => patch({ currentPremium: val })}
                placeholder="$"
              />
            </div>
          </AnswerRow>
        )}
      </RowGroup>

      <FieldGroup label="Description of operations">
        <Textarea
          value={data.operations}
          onChange={val => patch({ operations: val })}
          placeholder="Describe what the business actually does day to day — the work performed, where, and for whom."
          rows={3}
        />
        <p className="text-[11px] mt-2" style={{ color: words >= MIN_WORDS ? '#9CA3AF' : '#A614C3' }}>
          {words} word{words === 1 ? '' : 's'} — {MIN_WORDS} minimum
        </p>
      </FieldGroup>

      <RowGroup label="Claims">
        <AnswerRow label="Has the business had any claims or work-related injuries in the past 4 years?">
          <YesNo value={claimsPast4} onChange={setClaims} name="Claims in past 4 years" />
        </AnswerRow>

        {claimsPast4 === 'yes' && (
          <AnswerRow label="How many claims?">
            <div style={{ width: 150 }}>
              <Input
                align="right"
                value={claimCount ? String(claimCount) : ''}
                onChange={val => patch({ claimCount: parseInt(val, 10) || 0 })}
                placeholder="0"
              />
            </div>
          </AnswerRow>
        )}
      </RowGroup>

      {/* Four or more claims goes to an underwriter rather than through
          the self-service detail screen, so we ask for loss runs instead. */}
      {claimsPast4 === 'yes' && claimCount >= 4 && (
        <div className="im-info-panel rounded-xl p-4 flex items-start gap-3">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-[12.5px] text-gray-600 leading-relaxed">
            <span className="font-bold text-navy">{claimCount} claims reported.</span>{' '}
            Please email currently valued loss runs to comp@btisinc.com, and upload them as a
            required document when this submission is referred to underwriting. Be sure to
            reference the quote number above.
          </p>
        </div>
      )}

      {claimsPast4 === 'yes' && claimCount > 0 && claimCount < 4 && (
        <InfoLine>
          You'll list each claim on Loss history — it just appeared on the left.
        </InfoLine>
      )}
    </div>
  )
}
