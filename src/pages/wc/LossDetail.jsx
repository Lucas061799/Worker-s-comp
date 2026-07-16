import { DateInput, Select } from '../../components/FormField'

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
      <p className="text-sm text-gray-500 -mt-2">One row per claim.</p>

      <FieldGroup label={`Claims (${losses.length})`}>
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 pb-2 pr-2 pl-2 w-12">#</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 pb-2 pr-2">Date of loss</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 pb-2 pr-2">Type</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 pb-2 pr-2">Amount paid</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 pb-2 pr-2">Status</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {losses.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td className="py-2 pr-2 pl-2 font-mono text-gray-500 text-xs">{idx + 1}</td>
                  <td className="py-2 pr-2 min-w-[150px]">
                    <DateInput value={row.date} onChange={val => updateLoss(idx, { date: val })} />
                  </td>
                  <td className="py-2 pr-2 min-w-[140px]">
                    <Select
                      options={LOSS_TYPES}
                      value={row.type}
                      onChange={val => updateLoss(idx, { type: val })}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input type="text" value={row.amount} onChange={e => updateLoss(idx, { amount: e.target.value })} placeholder="$"
                      className="w-full px-2.5 py-1.5 rounded-md text-sm outline-none font-mono"
                      style={{ background: 'white', border: '1px solid #E5E7EB' }}/>
                  </td>
                  <td className="py-2 pr-2 min-w-[120px]">
                    <Select
                      options={LOSS_STATUS}
                      value={row.status}
                      onChange={val => updateLoss(idx, { status: val })}
                    />
                  </td>
                  <td className="py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeLoss(idx)}
                      className="w-6 h-6 rounded-full inline-flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                      aria-label="Remove claim"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={addLoss}
          className="add-another-btn w-full mt-3 rounded-lg py-2.5 text-sm font-semibold transition"
          style={{ border: '1.5px dashed rgba(92,46,212,0.35)', color: '#5C2ED4', background: 'transparent' }}
        >
          + Add claim
        </button>
      </FieldGroup>
    </div>
  )
}
