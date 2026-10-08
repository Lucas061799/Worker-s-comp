import { useState } from 'react'
import { Input, Select, FormGrid } from '../../components/FormField'
import {
  FieldGroup,
  SectionLabel,
  RemoveButton,
  AddAnother,
  InfoLine,
  StepNav,
} from '../../components/wc/primitives'

const STATES = ['CA', 'AZ', 'NV', 'PA', 'DE']

const BLANK = { address: '', suite: '', city: '', state: 'CA', zip: '' }

/* Location 1 is the physical address from General Info — it is already on the
   submission, so it is listed rather than asked for again. */
function primaryFrom(business) {
  return {
    address: business.address || '',
    suite: '',
    city: business.city || '',
    state: business.state || 'CA',
    zip: business.zip || '',
    primary: true,
  }
}

export default function Locations({ formData, updateFormData, onBack, onContinue }) {
  const business = formData.business || {}
  const extra = formData.locations?.list || []
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState(BLANK)
  const [showErrors, setShowErrors] = useState(false)

  const rows = [primaryFrom(business), ...extra]

  const save = () => {
    if (!draft.address || !draft.city || !draft.state || !draft.zip) {
      setShowErrors(true)
      return
    }
    updateFormData('locations', { list: [...extra, { ...draft }] })
    setDraft(BLANK)
    setAdding(false)
    setShowErrors(false)
  }

  /* The primary never goes: the BRD asks that at least one location always
     remains, and that one is the physical address the policy is written at. */
  const remove = (i) => updateFormData('locations', { list: extra.filter((_, n) => n !== i) })

  const err = (key) => showErrors && !draft[key]

  return (
    <div className="w-full space-y-6">
      <FieldGroup label="Locations">
        <p className="text-[12.5px] text-gray-500 leading-relaxed mb-4">
          Your physical address carries over from General Info as Location 1.
          Add any additional locations below.
        </p>

        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--line)' }}>
          <div className="grid grid-cols-[44px_minmax(0,2.6fr)_minmax(0,1.3fr)_56px_72px_36px] gap-2 px-3.5 py-2.5"
            style={{ background: 'var(--fill-subtle)', borderBottom: '1px solid var(--line)' }}>
            {['Loc #', 'Street address', 'City', 'State', 'ZIP', ''].map((h, i) => (
              <SectionLabel key={i} className="!mb-0 !text-[10px]">{h}</SectionLabel>
            ))}
          </div>

          {rows.map((loc, i) => (
            <div key={i}
              className="grid grid-cols-[44px_minmax(0,2.6fr)_minmax(0,1.3fr)_56px_72px_36px] gap-2 items-center px-3.5 py-3 text-[12.5px]"
              style={{ borderTop: i ? '1px solid var(--line-soft)' : 'none', color: 'var(--ink-2)' }}>
              <span className="font-semibold">{i + 1}</span>
              <span className="truncate">{[loc.address, loc.suite].filter(Boolean).join(', ') || '—'}</span>
              <span className="truncate">{loc.city || '—'}</span>
              <span>{loc.state || '—'}</span>
              <span>{loc.zip || '—'}</span>
              <span className="flex justify-end">
                {!loc.primary && <RemoveButton onClick={() => remove(i - 1)} label="Remove location" />}
              </span>
            </div>
          ))}
        </div>

        {adding ? (
          <div className="rounded-xl p-4 mt-4" style={{ background: 'var(--surface-soft)', border: '1px solid var(--line)' }}>
            <SectionLabel>New location</SectionLabel>
            <div className="space-y-4">
              <FormGrid>
                <Input label="Street address" required value={draft.address}
                  onChange={v => setDraft(d => ({ ...d, address: v }))}
                  placeholder="e.g. 1420 Prospect Rd" error={err('address')} />
                <Input label="Suite / unit" value={draft.suite}
                  onChange={v => setDraft(d => ({ ...d, suite: v }))}
                  placeholder="Optional" />
              </FormGrid>
              <FormGrid cols={3}>
                <Input label="City" required value={draft.city}
                  onChange={v => setDraft(d => ({ ...d, city: v }))}
                  placeholder="City" error={err('city')} />
                <Select label="State" required options={STATES} value={draft.state}
                  onChange={v => setDraft(d => ({ ...d, state: v }))} />
                <Input label="ZIP" required value={draft.zip}
                  onChange={v => setDraft(d => ({ ...d, zip: v }))}
                  placeholder="95070" digits maxLength={5} error={err('zip')} />
              </FormGrid>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button type="button"
                onClick={() => { setAdding(false); setDraft(BLANK); setShowErrors(false) }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 transition hover:opacity-80"
                style={{ border: '1px solid var(--line)', background: 'transparent' }}>
                Cancel
              </button>
              <button type="button" onClick={save}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
                style={{ background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)' }}>
                Save location
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <AddAnother onClick={() => setAdding(true)}>Add location</AddAnother>
          </div>
        )}

        <InfoLine className="mt-5">
          Employee counts are captured per class on Classes &amp; payroll, not here.
        </InfoLine>
      </FieldGroup>

      <StepNav onBack={onBack} onContinue={onContinue} />
    </div>
  )
}
