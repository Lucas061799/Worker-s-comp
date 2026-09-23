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
        <div className="space-y-3">
          {terms.map((row, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_150px_150px_130px_40px] gap-3 items-end">
              <Input
                label={idx === 0 ? 'Carrier' : undefined}
                value={row.carrier}
                onChange={val => updateTerm(idx, { carrier: val })}
                placeholder="Carrier"
              />
              <DateInput
                label={idx === 0 ? 'Effective' : undefined}
                value={row.effective}
                onChange={val => updateTerm(idx, { effective: val })}
              />
              <DateInput
                label={idx === 0 ? 'Expiration' : undefined}
                value={row.expiration}
                onChange={val => updateTerm(idx, { expiration: val })}
              />
              <Input
                label={idx === 0 ? 'Premium' : undefined}
                value={row.premium}
                onChange={val => updateTerm(idx, { premium: val })}
                placeholder="$"
              />
              <div className="flex items-center justify-center h-[42px]">
                <RemoveButton onClick={() => removeTerm(idx)} label="Remove term" />
              </div>
            </div>
          ))}
        </div>

        {terms.length < 4 && (
          <div className="mt-5">
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
