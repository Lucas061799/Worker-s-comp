import { useState } from 'react'
import { Input, Select } from '../../components/FormField'
import {
  FieldGroup,
  RowGroup,
  AnswerRow,
  RemoveButton,
  AddAnother,
  Segmented,
  YesNo,
  InfoDot,
} from '../../components/wc/primitives'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']

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

export default function StateCoverages({ formData, updateFormData }) {
  const pz = formData.pageZero || {}
  const business = formData.business || {}
  const data = formData.coverage || {}

  const [activeState, setActiveState] = useState(pz.state || 'CA')
  const [addedStates, setAddedStates] = useState([])
  const [addOpen, setAddOpen] = useState(false)

  const homeState = pz.state || 'CA'
  const availableStates = US_STATES.filter(s => s !== homeState && !addedStates.includes(s))

  const commitAddState = (next) => {
    if (next) {
      setAddedStates([...addedStates, next])
      setActiveState(next)
    }
    setAddOpen(false)
  }

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

      {/* State tabs — one pill per state, gradient fill for the active one.
          Everything below is that state's own data. */}
      <div className="flex items-center gap-2 flex-wrap" role="radiogroup" aria-label="Active state">
        {[homeState, ...addedStates].map(s => {
          const selected = activeState === s
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setActiveState(s)}
              className={`px-5 py-1.5 rounded-full text-[13px] font-semibold transition-all ${selected ? 'force-white-text' : 'border-[1.5px]'}`}
              style={selected
                ? { background: BRAND_GRADIENT, color: 'white' }
                : { background: 'white', borderColor: '#E5E7EB', color: '#6B7280' }
              }
            >
              {s}
            </button>
          )
        })}
        {addOpen ? (
          <div className="w-[150px]">
            <Select options={availableStates} value="" onChange={commitAddState} placeholder="Pick a state…" />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="px-4 py-1.5 rounded-full text-[13px] font-semibold border border-dashed border-[#A614C3]/30 transition hover:border-[#A614C3]/60"
            style={{ background: 'white', color: '#A614C3' }}
          >
            + Add state
          </button>
        )}
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
        <div className="im-info-panel rounded-xl p-4 mb-4 flex items-start gap-3">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5" strokeLinecap="round" />
            <circle cx="12" cy="16.5" r="0.6" fill="currentColor" />
          </svg>
          <p className="text-[12.5px] text-gray-600 leading-relaxed flex-1">
            <span className="font-bold text-navy">
              {activeState} · {ENTITY_LABELS[entityType] || 'Corporation'}.
            </span>{' '}
            Officers are automatically included but may elect to be excluded.
          </p>
        </div>

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
            <div key={idx} className="grid grid-cols-2 sm:grid-cols-[126px_minmax(0,1fr)_102px_78px_78px_32px] gap-2.5 items-end">
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
                label={idx === 0 ? 'Full-time' : undefined}
                align="right"
                value={row.ftEmployees}
                onChange={val => updateClass(idx, { ftEmployees: val })}
                placeholder="0"
              />
              <Input
                label={idx === 0 ? 'Part-time' : undefined}
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
        <div className="im-info-panel rounded-xl p-4 flex items-start gap-3">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-[12.5px] text-gray-600 leading-relaxed">
            <span className="font-bold text-navy">Collect certificates of insurance from every subcontractor before work begins.</span>{' '}
            Payroll paid to uninsured or uncertificated subs is added to your payroll at audit and
            charged at the applicable class rate.
          </p>
        </div>
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
