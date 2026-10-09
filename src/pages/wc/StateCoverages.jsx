import { useEffect, useState } from 'react'
import { Input, Select } from '../../components/FormField'
import {
  FieldGroup,
  SectionLabel,
  RowGroup,
  AnswerRow,
  RemoveButton,
  AddAnother,
  Segmented,
  YesNo,
  InfoDot,
  AlertGlyph,
  InfoPanel,
} from '../../components/wc/primitives'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'


/* Policy-level, so it sits above the state selector — everything from the
   state tabs down is per-state. */
const EL_LIMITS = [
  '$100K / $500K / $100K',
  '$500K / $500K / $500K',
  '$1M / $1M / $1M',
]

const OFFICER_TITLES = [
  'President', 'Vice President', 'Secretary', 'Treasurer',
  'CEO', 'CFO', 'Owner', 'Partner', 'Managing member', 'Director',
]

const OFFICER_STATUS = [
  { value: 'include', label: 'Include' },
  { value: 'exclude', label: 'Exclude' },
]

const CERTIFICATES = ['Yes', 'No', 'Sometimes']

const ENTITY_LABELS = {
  corp: 'Corporation', llc: 'LLC', sole: 'Sole proprietor', partner: 'Partnership',
}

/* Reference only — the agent enters the correct twin code themselves. */
const DUAL_WAGE = [
  { pair: '5183 / 5187', trade: 'Plumbing', cutoff: '$31/hr' },
]

const emptyClass  = () => ({ location: '', code: '', description: '', payroll: '', ftEmployees: '', ptEmployees: '' })
const emptyOfficer = () => ({ name: '', title: '', status: 'include' })

export default function StateCoverages({ formData, updateFormData, replaceFormSection }) {
  const pz = formData.pageZero || {}
  const business = formData.business || {}
  const data = formData.coverage || {}

  const homeState = pz.state || 'CA'
  const [pickedState, setPickedState] = useState(homeState)

  /* The submission covers the states it has locations in, so the list is
     read off Locations rather than built here — a state with no location
     behind it had nothing to schedule payroll against. */
  const states = [...new Set([
    homeState,
    ...(formData.locations?.list || []).map(l => l.state).filter(Boolean),
  ])]

  /* A location can be removed after its state was being edited here, which
     would otherwise leave the page on a tab that no longer exists. */
  const activeState = states.includes(pickedState) ? pickedState : homeState

  /* Payroll scheduled against a state that has since lost its last location
     would still be rated. Drop it when the state goes — `officers` and
     `elLimits` live in this section too, so only two-letter keys are
     considered. */
  const orphans = Object.keys(data).filter(k => /^[A-Z]{2}$/.test(k) && !states.includes(k))
  useEffect(() => {
    if (!orphans.length) return
    const next = { ...data }
    orphans.forEach(k => delete next[k])
    ;(replaceFormSection || updateFormData)('coverage', next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orphans.join(',')])

  const entityType = business.entityType || 'corp'

  const stateData = data[activeState] || {
    officers: [emptyOfficer()],
    classes: [{
      location: '',
      code: pz.mainClass || '5183',
      description: pz.classDescription || 'Plumbing NOC',
      payroll: pz.estimatedPayroll || '$480,000',
      ftEmployees: '6',
      ptEmployees: '0',
    }],
    usesSubs: 'no',
    blanketWaiver: false,
  }

  const patchState = (partial) => {
    updateFormData('coverage', { ...data, [activeState]: { ...stateData, ...partial } })
  }

  const classes  = stateData.classes  || []
  // Officers persist across state tabs — the same people run the company
  // wherever it operates.
  const officers = data.officers || stateData.officers || [emptyOfficer()]

  const patchOfficers = (next) => updateFormData('coverage', { ...data, officers: next })
  const updateOfficer = (idx, patchRow) =>
    patchOfficers(officers.map((row, i) => i === idx ? { ...row, ...patchRow } : row))
  const addOfficer = () => patchOfficers([...officers, emptyOfficer()])
  const removeOfficer = (idx) => patchOfficers(officers.filter((_, i) => i !== idx))

  const updateClass = (idx, patchRow) =>
    patchState({ classes: classes.map((row, i) => i === idx ? { ...row, ...patchRow } : row) })
  const addClass = () => patchState({ classes: [...classes, emptyClass()] })
  const removeClass = (idx) => patchState({ classes: classes.filter((_, i) => i !== idx) })

  const emod = formData.underwriting?.experienceMod

  // The two officer notices are independent: a table holding both an
  // included and an excluded officer shows both at once.
  const anyIncluded = officers.some(o => o.status !== 'exclude')
  const anyExcluded = officers.some(o => o.status === 'exclude')

  /* Locations the agent can assign a class row to. */
  // Short labels — the column is narrow and the number is what identifies
  // the location; the address itself lives on the Locations page.
  const locationOptions = (business.locations?.length
    ? business.locations.map((_, i) => `Location ${i + 1}`)
    : ['Location 1'])

  return (
    <div className="w-full space-y-6">
      <RowGroup label="Policy-level coverage">
        <AnswerRow label="Employer's liability limits">
          <div style={{ width: 220 }}>
            <Select
              options={EL_LIMITS}
              value={data.elLimits || EL_LIMITS[1]}
              onChange={val => updateFormData('coverage', { ...data, elLimits: val })}
            />
          </div>
        </AnswerRow>
      </RowGroup>

      {/* One chip per state the submission has a location in. There is no
          add control: a state arrives here by having a location added to it
          on Locations, which is the only place the address behind it is
          captured. */}
      <div>
        <SectionLabel>State</SectionLabel>
        <div className="flex items-center gap-2 flex-wrap" role="radiogroup" aria-label="Active state">
          {states.map(st => {
            const selected = activeState === st
            return (
              <button
                key={st}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setPickedState(st)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${selected ? 'force-white-text' : 'border'}`}
                style={selected
                  ? { background: BRAND_GRADIENT, color: 'white' }
                  : { background: 'var(--surface-card)', borderColor: 'var(--line)', color: 'var(--ink-2)' }}
              >
                {st}
              </button>
            )
          })}
        </div>
        <p className="text-[12px] text-gray-500 mt-2.5">
          {states.length === 1
            ? 'Add a location in another state on Locations and it will appear here.'
            : 'States follow the locations on this submission — add or remove one on Locations.'}
        </p>
      </div>

      <RowGroup label="Experience mod">
        <AnswerRow
          label="Experience mod (Ex-Mod)"
          help={emod ? 'Pre-filled based on FEIN lookup with CA Bureau — please confirm.' : undefined}
        >
          <div style={{ width: 150 }}>
            <Input
              align="right"
              value={emod || ''}
              onChange={val => updateFormData('underwriting', {
                experienceMod: val,
                experienceModSource: 'Manual',
              })}
              placeholder="1.00"
            />
          </div>
        </AnswerRow>
      </RowGroup>

      <FieldGroup label="Officers & Owners">
        <InfoPanel
          lead={<>{activeState} · {ENTITY_LABELS[entityType] || 'Corporation'}.</>}
          className="mb-4"
        >
          Officers are automatically included but may elect to be excluded.
        </InfoPanel>

        <div className="space-y-3">
          {officers.map((row, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_150px] lg:grid-cols-[1fr_170px_210px_40px] gap-3 items-end">
              <Input
                label={idx === 0 ? 'Name' : undefined}
                value={row.name}
                onChange={val => updateOfficer(idx, { name: val })}
                placeholder="Full name"
              />
              <Select
                label={idx === 0 ? 'Title' : undefined}
                options={OFFICER_TITLES}
                value={row.title}
                onChange={val => updateOfficer(idx, { title: val })}
              />
              <div>
                {idx === 0 && (
                  <label className="block text-[13px] font-semibold text-gray-600 mb-1.5 tracking-wide">Status</label>
                )}
                <div className="h-[42px] flex items-center flex-nowrap">
                  <Segmented
                    className="flex-nowrap"
                    options={OFFICER_STATUS}
                    value={row.status || 'include'}
                    onChange={val => updateOfficer(idx, { status: val })}
                    name={`Officer ${idx + 1} status`}
                  />
                </div>
              </div>
              <div className="flex items-center justify-center h-[42px]">
                <RemoveButton onClick={() => removeOfficer(idx)} label="Remove officer" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <AddAnother onClick={addOfficer}>Add officer</AddAnother>
        </div>

        {anyIncluded && (
          <p className="text-[12px] text-gray-500 mt-4 flex items-start gap-2">
            <span style={{ color: '#5C2ED4' }}>ⓘ</span>
            Please schedule officer payroll according to state minimum/maximum guidelines.
          </p>
        )}
        {anyExcluded && (
          <p className="text-[12px] mt-2 flex items-start gap-2 im-note-warn">
            <span>⚠</span>
            A signed exclusion form will be required for the state of {activeState}.
          </p>
        )}
      </FieldGroup>

      <FieldGroup
        label={
          <span className="inline-flex items-center gap-1.5">
            Classes &amp; Payroll — {activeState}
            <InfoDot
              title="Dual-wage classes in this quote"
              text={`Enter the correct twin class code directly on the row based on the average hourly wage for that class. ${DUAL_WAGE.map(d => `${d.pair} (${d.trade}) — ${d.cutoff}`).join('; ')}.`}
            />
          </span>
        }
      >
        <div className="space-y-3">
          {classes.map((row, idx) => (
            <div key={idx} className="grid grid-cols-2 sm:grid-cols-[126px_minmax(0,1fr)_102px_62px_62px_32px] gap-2.5 items-end">
              <Select
                label={idx === 0 ? 'Location' : undefined}
                options={locationOptions}
                value={row.location || locationOptions[0]}
                onChange={val => updateClass(idx, { location: val })}
              />
              {/* Code and description are one field — type the trade to
                  find the code, or type the code directly. */}
              <Input
                label={idx === 0 ? 'Class code' : undefined}
                value={row.code && row.description ? `${row.code} — ${row.description}` : row.code}
                onChange={val => {
                  const [code, ...rest] = val.split('—')
                  updateClass(idx, { code: code.trim(), description: rest.join('—').trim() })
                }}
                placeholder="e.g. 8810 or clerical"
              />
              <Input
                label={idx === 0 ? 'Annual payroll' : undefined}
                align="right"
                value={row.payroll}
                onChange={val => updateClass(idx, { payroll: val })}
                placeholder="$"
              />
              <Input
                label={idx === 0 ? 'FT' : undefined}
                align="right"
                value={row.ftEmployees}
                onChange={val => updateClass(idx, { ftEmployees: val })}
                placeholder="0"
              />
              <Input
                label={idx === 0 ? 'PT' : undefined}
                align="right"
                value={row.ptEmployees}
                onChange={val => updateClass(idx, { ptEmployees: val })}
                placeholder="0"
              />
              <div className="flex items-center justify-center h-[42px] -ml-1">
                <RemoveButton onClick={() => removeClass(idx)} label="Remove class" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <AddAnother onClick={addClass}>Add class</AddAnother>
        </div>
      </FieldGroup>

      <RowGroup label="Subcontractor / 1099 exposure">
        <AnswerRow label="Uses subcontractors?">
          <YesNo
            value={stateData.usesSubs || 'no'}
            onChange={val => patchState({ usesSubs: val })}
            name="Uses subcontractors"
          />
        </AnswerRow>

        {stateData.usesSubs === 'yes' && (
          <AnswerRow label="% of work subcontracted">
            <div style={{ width: 150 }}>
              <Input
                align="right"
                value={stateData.subPercent}
                onChange={val => patchState({ subPercent: val })}
                placeholder="%"
              />
            </div>
          </AnswerRow>
        )}

        {stateData.usesSubs === 'yes' && (
          <AnswerRow label="Certificates collected for all subs?">
            <div style={{ width: 150 }}>
              <Select
                options={CERTIFICATES}
                value={stateData.subCertificates}
                onChange={val => patchState({ subCertificates: val })}
              />
            </div>
          </AnswerRow>
        )}
      </RowGroup>

      {stateData.usesSubs === 'yes' && (
        <InfoPanel
          lead="Collect certificates of insurance from every subcontractor before work begins."
        >
          Payroll paid to uninsured or uncertificated subs is added to your payroll at audit and
          charged at the applicable class rate.
        </InfoPanel>
      )}

      <RowGroup label="Coverage options">
        <AnswerRow label="Blanket waiver of subrogation">
          <YesNo
            value={stateData.blanketWaiver ? 'yes' : 'no'}
            onChange={v => patchState({ blanketWaiver: v === 'yes' })}
            name="Blanket waiver of subrogation"
          />
        </AnswerRow>
      </RowGroup>
    </div>
  )
}
