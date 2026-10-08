import { Input, DateInput, Select, Textarea } from '../../components/FormField'
import {
  FieldGroup,
  RemoveButton,
  AddAnother,
  InfoDot,
  InfoLine,
} from '../../components/wc/primitives'

const LOSS_TYPES = ['Medical', 'Indemnity', 'Both']

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
  const addLoss = () => patch({ losses: [...losses, emptyLoss()] })
  const removeLoss = (idx) => patch({ losses: losses.filter((_, i) => i !== idx) })

  return (
    <div className="w-full space-y-6">
      <p className="text-sm text-gray-500 -mt-2">
        Please enter any claims or work-related injuries during the last 4 years.
      </p>

      <FieldGroup label={`Claims (${losses.length})`}>
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
          <AddAnother onClick={addLoss}>Add claim</AddAnother>
        </div>

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

        <InfoLine className="mt-5">
          If there are 4 or more claims, please email currently valued loss runs to
          <b className="font-semibold text-navy">comp@btisinc.com</b>. Be sure to reference the quote number above.
        </InfoLine>
      </FieldGroup>
    </div>
  )
}
