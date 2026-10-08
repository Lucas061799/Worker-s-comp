import { Select } from '../../components/FormField'
import { FieldGroup, SectionLabel, StepNav } from '../../components/wc/primitives'

/* The descriptor each carrier files against a class code. Taken from the
   prototype; a code with nothing filed falls back to a plain "-00 General". */
const SUBCLASS_OPTIONS = {
  '5183': ['5183-00 Plumbing NOC', '5183-01 Plumbing — Residential', '5183-02 Plumbing — Commercial/Industrial'],
  '5187': ['5187-00 Plumbing NOC', '5187-01 Plumbing — Residential', '5187-02 Plumbing — Commercial/Industrial'],
  '5645': ['5645-00 Carpentry NOC', '5645-01 Carpentry — Detached dwellings ≤3 stories'],
  '5474': ['5474-00 Painting NOC', '5474-01 Painting — Interior only', '5474-02 Painting — Interior & exterior'],
  '9079': ['9079-00 Restaurant NOC', '9079-01 Restaurant — Full service', '9079-02 Restaurant — Quick service'],
  '8810': ['8810-00 Clerical NOC'],
  '8017': ['8017-00 Retail store NOC'],
  '7228': ['7228-00 Trucking — Long haul NOC'],
  '7229': ['7229-00 Trucking — Local hauling NOC'],
}

const optionsFor = (code) => SUBCLASS_OPTIONS[code] || [`${code}-00 General`]

/* Every distinct class code on the submission, in the order it was scheduled.
   A code used in two states is still one descriptor, so it is asked once. */
function classesOn(formData) {
  const coverage = formData.coverage || {}
  const seen = new Set()
  const out = []
  Object.keys(coverage).forEach(key => {
    const classes = coverage[key]?.classes
    if (!Array.isArray(classes)) return
    classes.forEach(c => {
      if (!c.code || seen.has(c.code)) return
      seen.add(c.code)
      out.push({ code: c.code, description: c.description || '—' })
    })
  })
  return out
}

export default function SubClassCode({ formData, updateFormData, carrierName, onBack, onContinue }) {
  const rows = classesOn(formData)
  const picked = formData.subclass || {}

  const set = (code) => (val) => updateFormData('subclass', { [code]: val })

  /* Every class needs a descriptor before the carrier's own questions make
     sense, so Continue waits on all of them. */
  const allChosen = rows.every(r => picked[r.code])

  return (
    <div className="w-full space-y-6">
      <FieldGroup>
        <p className="text-[12.5px] text-gray-500 leading-relaxed mb-4">
          Descriptor codes vary by carrier. Confirm the right sub-class descriptor for each
          class code on this submission before we ask the remaining {carrierName}-specific questions.
        </p>

        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--line)' }}>
          <div className="grid grid-cols-[88px_1fr_minmax(220px,1.1fr)] gap-3 px-3.5 py-2.5"
            style={{ background: 'var(--fill-subtle)', borderBottom: '1px solid var(--line)' }}>
            <SectionLabel className="!mb-0 !text-[10px]">Class</SectionLabel>
            <SectionLabel className="!mb-0 !text-[10px]">Description</SectionLabel>
            <SectionLabel className="!mb-0 !text-[10px]">Sub-class code *</SectionLabel>
          </div>

          {rows.map((r, i) => (
            <div key={r.code}
              className="grid grid-cols-[88px_1fr_minmax(220px,1.1fr)] gap-3 items-center px-3.5 py-3"
              style={{ borderTop: i ? '1px solid var(--line-soft)' : 'none' }}>
              <span className="text-[12.5px] font-semibold" style={{ color: 'var(--ink)' }}>{r.code}</span>
              <span className="text-[12.5px] truncate" style={{ color: 'var(--ink-2)' }}>{r.description}</span>
              <Select
                options={optionsFor(r.code)}
                value={picked[r.code] || ''}
                onChange={set(r.code)}
                placeholder="Select a descriptor…"
              />
            </div>
          ))}
        </div>
      </FieldGroup>

      <StepNav
        onBack={onBack}
        onContinue={onContinue}
        canContinue={allChosen}
      />
    </div>
  )
}
