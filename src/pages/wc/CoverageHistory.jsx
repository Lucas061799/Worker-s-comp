import { Input, Select, Textarea, FormGrid } from '../../components/FormField'
import {
  FieldGroup,
  Segmented,
  YesNo,
  InfoLine,
  AlertGlyph,
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

/* Label above a pill answer — the shape Business info uses for its
   mailing-address and additional-locations questions. */
function PillField({ label, required, children }) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-gray-600 mb-2.5 tracking-wide">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}


const MIN_WORDS = 10
const countWords = (text) => (text || '').trim().split(/\s+/).filter(Boolean).length

export default function CoverageHistory({ formData, updateFormData }) {
  const data = formData.history || {}
  const status = data.coverageStatus || 'inforce'
  const claimsPast4 = data.claimsPast4
  const claimCount = data.claimCount ?? 0

  const patch = (partial) => updateFormData('history', partial)
  const words = countWords(data.operations)

  // Only a risk with a current or recently-lapsed policy has these.
  const hasPriorPolicy = status === 'inforce' || status === 'lapse'

  const setClaims = (val) => {
    // Answering No clears the count, which is what hides the Loss history step.
    patch(val === 'yes' ? { claimsPast4: 'yes' } : { claimsPast4: 'no', claimCount: 0 })
  }


  return (
    <div className="w-full space-y-6">
      {/* Clearance runs again when the agent leaves General Info, and a
          matching submission on this insured surfaces here. The prototype
          simulates a match every time so the banner is always visible —
          wire this to the real check when there is one. */}
      <div className="im-info-panel rounded-xl p-4 flex items-start gap-3">
        <span className="im-panel-icon w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5">
          <AlertGlyph />
        </span>
        <p className="text-[12.5px] text-gray-600 leading-relaxed">
          <span className="font-bold text-navy">Heads up.</span>{' '}
          We found another submission for this insured submitted within the past 30 days.
          We operate on a jump-ball basis, so no Broker of Record (BOR) letter is required at
          this time. We'll re-run this check again when bind is attempted to confirm there's no
          duplicate submission — the first submission to bind coverage with the insured's
          approval gets the business.
        </p>
      </div>

      {/* A form, not a question list: typed and chosen values carry their
          label above the field, the way Business info does. The compact
          label-left row is for Yes/No and segmented answers. */}
      <FieldGroup label="Current coverage">
        <div className="space-y-5">
          <PillField label="What is the current coverage status?" required>
            <Segmented
              options={COVERAGE_STATUS}
              value={status}
              onChange={val => patch({ coverageStatus: val })}
              name="Current coverage"
            />
          </PillField>

          {status === 'lapse' && (
            <Input
              label="Reason for lapse"
              required
              value={data.lapseReason}
              onChange={val => patch({ lapseReason: val })}
              placeholder="Why did coverage lapse?"
            />
          )}

          {hasPriorPolicy && (
            <FormGrid>
              <Select
                label="How many prior years?"
                required
                options={PRIOR_YEARS}
                value={data.priorYears}
                onChange={val => patch({ priorYears: val })}
              />
              <Input
                label="What is your current carrier?"
                required
                value={data.currentCarrier}
                onChange={val => patch({ currentCarrier: val })}
                placeholder="Carrier name"
              />
            </FormGrid>
          )}

          {hasPriorPolicy && (
            <FormGrid>
              <Input
                label="What is your current premium?"
                required
                value={data.currentPremium}
                onChange={val => patch({ currentPremium: val })}
                placeholder="$"
              />
              <div />
            </FormGrid>
          )}

          {/* The count lives inside the field's own wrapper, so the group's
              space-y-5 pushes the pair rather than opening a gap between the
              box and the line that belongs to it. */}
          <div>
            <Textarea
              label="Description of operations"
              required
              value={data.operations}
              onChange={val => patch({ operations: val })}
              placeholder="Briefly describe what the business does day to day (at least 10 words)…"
              rows={3}
            />
            <p className="text-[11px] mt-1.5"
              style={{ color: words >= MIN_WORDS ? '#9CA3AF' : '#A614C3' }}>
              {words} word{words === 1 ? '' : 's'} — {MIN_WORDS} minimum
            </p>
          </div>
        </div>
      </FieldGroup>

      <FieldGroup label="Claims">
        {/* The question gets the whole line — it needs 516px of the 679 here,
            so sharing the row with anything wrapped it onto two. */}
        <PillField
          label="Has the business had any claims or work-related injuries in the past 4 years?"
          required
        >
          <YesNo value={claimsPast4} onChange={setClaims} name="Claims in past 4 years" />
        </PillField>

        {claimsPast4 === 'yes' && (
          <Input
            label="How many claims?"
            required
            className="w-36 mt-5"
            value={claimCount ? String(claimCount) : ''}
            onChange={val => patch({ claimCount: parseInt(val, 10) || 0 })}
            placeholder="0"
            digits
            maxLength={3}
          />
        )}
      </FieldGroup>

      {/* Four or more claims goes to an underwriter rather than through
          the self-service detail screen, so we ask for loss runs instead. */}
      {claimsPast4 === 'yes' && claimCount >= 4 && (
        <div className="im-info-panel rounded-xl p-4 flex items-center gap-3">
          <span className="im-panel-icon w-7 h-7 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </span>
          <p className="text-[12.5px] text-gray-600 leading-relaxed">
            <span className="font-bold text-navy">{claimCount} claims reported.</span>{' '}
            Please email currently valued loss runs to <b className="font-semibold text-navy">comp@btisinc.com</b>, and upload them as a
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
