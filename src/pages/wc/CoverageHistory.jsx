import { Input, DateInput } from '../../components/FormField'
import { RemoveButton, AddAnother } from '../../components/wc/primitives'

function FieldGroup({ label, right, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5 pl-0.5 pr-0.5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">{label}</div>
        {right}
      </div>
      <div className="rounded-xl p-5 sm:p-6"
        style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
        {children}
      </div>
    </div>
  )
}

const emptyTerm = () => ({ carrier: '', effective: '', expiration: '', premium: '' })

export default function CoverageHistory({ formData, updateFormData }) {
  const data = formData.history || {}
  const terms = data.priorTerms && data.priorTerms.length
    ? data.priorTerms
    : [{ carrier: 'State Fund', effective: '2025-08-01', expiration: '2026-08-01', premium: '$5,980' }]
  const claimCount = data.claimCount ?? 0

  const patch = (partial) => updateFormData('history', { ...data, priorTerms: terms, ...partial })

  const updateTerm = (idx, patchRow) => {
    const next = terms.map((row, i) => i === idx ? { ...row, ...patchRow } : row)
    patch({ priorTerms: next })
  }
  const addTerm = () => {
    if (terms.length >= 4) return
    patch({ priorTerms: [...terms, emptyTerm()] })
  }
  const removeTerm = (idx) => patch({ priorTerms: terms.filter((_, i) => i !== idx) })

  return (
    <div className="w-full space-y-6">
      <p className="text-sm text-gray-500 -mt-2">
        Add up to four prior terms. One row per term — same details, far fewer boxes.
      </p>

      <FieldGroup label="Prior Terms">
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 pb-2 pr-2 pl-2 w-12">#</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 pb-2 pr-2">Carrier</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 pb-2 pr-2">Effective</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 pb-2 pr-2">Expiration</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 pb-2 pr-2">Premium</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {terms.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td className="py-2 pr-2 pl-2 font-mono text-gray-500 text-xs">{idx + 1}</td>
                  <td className="py-2 pr-2">
                    <input
                      type="text"
                      value={row.carrier}
                      onChange={e => updateTerm(idx, { carrier: e.target.value })}
                      placeholder="Carrier"
                      className="w-full px-2.5 py-1.5 rounded-md text-sm outline-none"
                      style={{ background: 'white', border: '1px solid #E5E7EB' }}
                    />
                  </td>
                  <td className="py-2 pr-2 min-w-[150px]">
                    <DateInput
                      value={row.effective}
                      onChange={val => updateTerm(idx, { effective: val })}
                    />
                  </td>
                  <td className="py-2 pr-2 min-w-[150px]">
                    <DateInput
                      value={row.expiration}
                      onChange={val => updateTerm(idx, { expiration: val })}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="text"
                      value={row.premium}
                      onChange={e => updateTerm(idx, { premium: e.target.value })}
                      placeholder="$"
                      className="w-full px-2.5 py-1.5 rounded-md text-sm outline-none font-mono"
                      style={{ background: 'white', border: '1px solid #E5E7EB' }}
                    />
                  </td>
                  <td className="py-2 text-center">
                    <RemoveButton onClick={() => removeTerm(idx)} label="Remove term" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {terms.length < 4 && (
          <div className="mt-3">
            <AddAnother onClick={addTerm}>Add prior term</AddAnother>
          </div>
        )}
      </FieldGroup>

      <FieldGroup label="Claims">
        <div className="max-w-xs">
          <Input
            label="Claims in the last 4 years"
            type="number"
            value={String(claimCount)}
            onChange={val => patch({ claimCount: parseInt(val, 10) || 0 })}
            placeholder="0"
          />
        </div>
        <p className="text-xs text-gray-500 mt-3">
          {claimCount > 0
            ? "You'll list each claim on the next step — it just appeared on the left."
            : "No claims — you're done here. The loss detail step stays hidden."}
        </p>
      </FieldGroup>
    </div>
  )
}
