import { Input, Select, Textarea, FormGrid, DateInput } from '../../components/FormField'
import {
  FieldGroup,
  Segmented,
  YesNo,
  AlertGlyph,
  CheckGlyph,
  InfoPanel,
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

/* The reasons underwriting actually sorts a lapse by. Typed free, the same
   four answers arrived in a dozen wordings and none of them counted. */
const LAPSE_REASONS = [
  'Non-payment of premium',
  'Prior policy non-renewed and not replaced',
  'No employees for a period of time',
  'Business temporarily closed',
  'Other',
]

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
    /* Yes starts the count at one, as the prototype's field does: the Loss
       history step turns on a count of 1–3, so leaving it at zero meant
       answering Yes did nothing until a number was typed. No clears it, which
       is what takes the step away again. */
    patch(val === 'yes'
      ? { claimsPast4: 'yes', ...(data.claimCount ? {} : { claimCount: 1 }) }
      : { claimsPast4: 'no', claimCount: 0 })
  }


  return (
    <div className="w-full space-y-6">
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

          {/* One grid for all of them, so they pack in order rather than
              each pair holding a row of its own. A lapse leads with its
              reason and the odd slot falls at the end; without one, the
              four fill two rows exactly. The whole set is gated the same
              way — a new venture and a risk with no prior have no policy
              to describe. */}
          {hasPriorPolicy && (
            <FormGrid>
              {status === 'lapse' && (
                <Select
                  label="Reason for lapse"
                  required
                  options={LAPSE_REASONS}
                  value={data.lapseReason}
                  /* Moving off Other drops what was typed under it, so a
                     changed answer cannot leave its old explanation behind
                     on the submission. */
                  onChange={val => patch({
                    lapseReason: val,
                    ...(val === 'Other' ? {} : { lapseReasonOther: '' }),
                  })}
                />
              )}
              {/* Other on its own says nothing an underwriter can use, so
                  it asks. It lands in the slot beside the reason, which
                  keeps the row packed. */}
              {status === 'lapse' && data.lapseReason === 'Other' && (
                <Input
                  label="Please specify"
                  required
                  value={data.lapseReasonOther}
                  onChange={val => patch({ lapseReasonOther: val })}
                  placeholder="Why did coverage lapse?"
                />
              )}
              <Select
                label="How many prior years?"
                required
                options={PRIOR_YEARS}
                value={data.priorYears}
                onChange={val => patch({ priorYears: val })}
              />
              <Input
                label="What is your most recent carrier?"
                required
                value={data.currentCarrier}
                onChange={val => patch({ currentCarrier: val })}
                placeholder="Carrier name"
              />
              <Input
                label="What is your most recent premium?"
                required
                value={data.currentPremium}
                onChange={val => patch({ currentPremium: val })}
                placeholder="$"
              />
              <DateInput
                label="Last date of coverage"
                required
                value={data.lastCoverageDate}
                onChange={val => patch({ lastCoverageDate: val })}
              />
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
            {/* Not how many words, only whether there are enough: the
                running count was a number to do arithmetic on, where the
                answer wanted is yes or no. The chips are the pair this app
                already uses for pass and fail, so no new colour appears
                for this one line. */}
            <p className={`text-[11px] mt-1.5 flex items-center gap-1.5 text-gray-500 ${
              words >= MIN_WORDS ? 'im-mark-pass' : 'im-mark-fail'}`}>
              {/* The label is its own span, not a bare text node: a text
                  node becomes an anonymous flex item, which is a fragile
                  thing to hang items-center on. The literal space goes with
                  it — gap-1.5 already sets the distance.

                  The glyph is 10px, not the 14px the panels use. Their text
                  is 13px; this line is 11px, whose ink measures 8.2px tall,
                  and a 14px glyph inks 12.8px — half again as tall as the
                  words beside it. Centred to 0.05px it still read as sitting
                  low, because a ring that much bigger hangs past the text
                  top and bottom. At 10px it inks 9.2px and the two match. */}
              {words >= MIN_WORDS ? (
                <>
                  <CheckGlyph className="w-2.5 h-2.5 shrink-0" />
                  <span>Meets the {MIN_WORDS}-word minimum</span>
                </>
              ) : (
                <>
                  <AlertGlyph className="w-2.5 h-2.5 shrink-0" />
                  <span>At least {MIN_WORDS} words</span>
                </>
              )}
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
          /* The box is narrow; the line under it is not, so it sits outside
             the Input rather than inheriting its 144px and wrapping. */
          <div className="mt-5">
            <Input
              label="How many claims?"
              required
              className="w-36"
              value={claimCount ? String(claimCount) : ''}
              onChange={val => patch({ claimCount: parseInt(val, 10) || 0 })}
              placeholder="0"
              digits
              maxLength={3}
            />
          </div>
        )}
      </FieldGroup>

      {/* Four or more claims goes to an underwriter rather than through
          the self-service detail screen, so we ask for loss runs instead. */}
      {claimsPast4 === 'yes' && claimCount >= 4 && (
        <InfoPanel
          icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>}
          lead={<>{claimCount} claims reported.</>}
        >
          Please email currently valued loss runs to <b className="font-semibold text-navy">comp@btisinc.com</b>, and upload them as a
          required document when this submission is referred to underwriting. Be sure to
          reference the quote number above.
        </InfoPanel>
      )}

    </div>
  )
}
