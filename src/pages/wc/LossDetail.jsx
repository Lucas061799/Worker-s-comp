import { Input, DateInput, Select, Textarea } from '../../components/FormField'
import {
  FieldGroup,
  RemoveButton,
  AddAnother,
  InfoDot,
  InfoPanel,
} from '../../components/wc/primitives'

const LOSS_TYPES = ['Medical', 'Indemnity', 'Both']

// 4 or more claims go to an underwriter with loss runs, so the detail
// screen stops at 3.
const MAX_CLAIMS = 3

const emptyLoss = () => ({ date: '', amount: '', type: 'Medical', description: '' })

export default function LossDetail({ formData, updateFormData }) {
  const data = formData.history || {}
  const claimCount = data.claimCount || 0
  // Rows pre-populate to match the count entered on Coverage history.
  const seed = Array.from({ length: Math.max(claimCount, 1) }, () => emptyLoss())
  const losses = data.losses && data.losses.length ? data.losses : seed

  const patch = (partial) => updateFormData('history', { ...data, losses, ...partial })
  const updateLoss = (idx, patchRow) => {
    const next = losses.map((row, i) => i === idx ? { ...row, ...patchRow } : row)
    patch({ losses: next })
  }
  const atMax = losses.length >= MAX_CLAIMS
  const addLoss = () => { if (!atMax) patch({ losses: [...losses, emptyLoss()] }) }
  const removeLoss = (idx) => patch({ losses: losses.filter((_, i) => i !== idx) })

  return (
    <div className="w-full space-y-6">
      <p className="text-sm text-gray-500 -mt-2">
        Please enter any claims or work-related injuries during the last 4 years.
      </p>

      <FieldGroup label="Claims">
        <div className="space-y-3">
          {losses.map((row, idx) => (
            <div key={idx} className="grid grid-cols-[150px_140px_130px_1fr_40px] gap-3 items-end">
              <DateInput
                label={idx === 0 ? 'Date of loss' : undefined}
                value={row.date}
                onChange={val => updateLoss(idx, { date: val })}
              />
              <Input
                label={idx === 0 ? 'Total incurred' : undefined}
                value={row.amount}
                onChange={val => updateLoss(idx, { amount: val })}
                placeholder="$"
              />
              <Select
                label={idx === 0 ? 'Type' : undefined}
                options={LOSS_TYPES}
                value={row.type}
                onChange={val => updateLoss(idx, { type: val })}
              />
              <Input
                label={idx === 0 ? 'Description' : undefined}
                value={row.description}
                onChange={val => updateLoss(idx, { description: val })}
                placeholder="What happened?"
              />
              <div className="flex items-center justify-center h-[42px]">
                <RemoveButton onClick={() => removeLoss(idx)} label="Remove claim" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <AddAnother onClick={addLoss} disabled={atMax}>
            Add claim
          </AddAnother>
        </div>

        {/* On the page rather than in a hover card, so it is read without
            hunting for it and the address can be clicked. */}
        {atMax && (
          <InfoPanel
            className="mt-3"
            icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>}
          >
            If there are more than 3 claims, please email currently valued loss runs
            to <a href="mailto:comp@btisinc.com" className="font-semibold text-navy underline underline-offset-2">comp@btisinc.com</a>,
            or upload them as a required document when this submission is referred to
            underwriting. Be sure to reference the quote number above.
          </InfoPanel>
        )}

        {/* One explanation covering the claims above, rather than a box per
            row — and it belongs with them rather than in a panel of its own,
            since it is about these claims. Optional; the info dot says why it
            is worth filling in. */}
        <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--line-soft)' }}>
          <label className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-600 mb-2.5 tracking-wide">
            Claims corrective action
            <InfoDot
              title="Claims corrective action"
              text="For best pricing available, please provide."
            />
          </label>
          <Textarea
            value={data.correctiveAction}
            onChange={val => patch({ correctiveAction: val })}
            placeholder="Describe the corrective action(s) taken across the claim(s) above"
            rows={3}
          />
        </div>
      </FieldGroup>
    </div>
  )
}
