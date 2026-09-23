import { Input, DateInput, Select } from '../../components/FormField'
import { RemoveButton, AddAnother } from '../../components/wc/primitives'

const LOSS_TYPES = ['Medical only', 'Lost time', 'Fatality']
const LOSS_STATUS = ['Closed', 'Open']

function FieldGroup({ label, children }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-2.5 pl-0.5">{label}</div>
      <div className="rounded-xl p-5 sm:p-6"
        style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
        {children}
      </div>
    </div>
  )
}

const emptyLoss = () => ({ date: '', type: 'Medical only', amount: '', status: 'Closed' })

export default function LossDetail({ formData, updateFormData }) {
  const data = formData.history || {}
  const claimCount = data.claimCount || 0
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
      <FieldGroup label={`Claims (${losses.length})`}>
        <div className="space-y-3">
          {losses.map((row, idx) => (
            <div key={idx} className="grid grid-cols-[150px_1fr_130px_130px_40px] gap-3 items-end">
              <DateInput
                label={idx === 0 ? 'Date of loss' : undefined}
                value={row.date}
                onChange={val => updateLoss(idx, { date: val })}
              />
              <Select
                label={idx === 0 ? 'Type' : undefined}
                options={LOSS_TYPES}
                value={row.type}
                onChange={val => updateLoss(idx, { type: val })}
              />
              <Input
                label={idx === 0 ? 'Amount paid' : undefined}
                value={row.amount}
                onChange={val => updateLoss(idx, { amount: val })}
                placeholder="$"
              />
              <Select
                label={idx === 0 ? 'Status' : undefined}
                options={LOSS_STATUS}
                value={row.status}
                onChange={val => updateLoss(idx, { status: val })}
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
      </FieldGroup>
    </div>
  )
}
