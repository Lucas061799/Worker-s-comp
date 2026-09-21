import { useState } from 'react'
import { Select } from '../../components/FormField'
import { RemoveButton, AddAnother, YesNo, Banner, Tag, InfoLine } from '../../components/wc/primitives'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

const OFFICER_RULES = {
  corp: {
    label: 'Corporation',
    text: 'Officers are automatically included in coverage. They may elect to be excluded.',
    keep: 'Keep officers included',
    switch: 'Elect exclusion',
    help: 'Officers are included — schedule officer payroll in the class table below per WCIRB guidance.',
  },
  llc: {
    label: 'LLC',
    text: 'Managing members are automatically excluded from coverage. They may elect to be included.',
    keep: 'Keep members excluded',
    switch: 'Elect inclusion',
    help: 'Members are excluded — no member payroll is scheduled unless inclusion is elected.',
  },
  sole: {
    label: 'Sole proprietor',
    text: 'The owner is automatically excluded from coverage. They may elect to be included.',
    keep: 'Keep owner excluded',
    switch: 'Elect inclusion',
    help: 'The owner is excluded — schedule employee payroll only.',
  },
  partner: {
    label: 'Partnership',
    text: 'Partners are automatically excluded from coverage. They may elect to be included.',
    keep: 'Keep partners excluded',
    switch: 'Elect inclusion',
    help: 'Partners are excluded — schedule employee payroll only.',
  },
}

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

const emptyClass = () => ({ code: '', description: '', employees: '', payroll: '' })

export default function StateCoverages({ formData, updateFormData }) {
  const pz = formData.pageZero || {}
  const business = formData.business || {}
  const data = formData.coverage || {}

  const [activeState, setActiveState] = useState(pz.state || 'CA')
  const [addedStates, setAddedStates] = useState([])

  const entityType = business.entityType || 'corp'
  const rule = OFFICER_RULES[entityType] || OFFICER_RULES.corp

  const stateData = data[activeState] || {
    officerElection: 'auto',
    classes: [{
      code: pz.mainClass || '5183',
      description: pz.classDescription || 'Plumbing NOC',
      employees: '6',
      payroll: '$480,000',
    }],
    blanketWaiver: false,
  }

  const patchState = (partial) => {
    updateFormData('coverage', {
      ...data,
      [activeState]: { ...stateData, ...partial },
    })
  }

  const updateClass = (idx, patchRow) => {
    const next = stateData.classes.map((row, i) => i === idx ? { ...row, ...patchRow } : row)
    patchState({ classes: next })
  }
  const addClass = () => patchState({ classes: [...stateData.classes, emptyClass()] })
  const removeClass = (idx) => patchState({ classes: stateData.classes.filter((_, i) => i !== idx) })

  const emod = formData.underwriting?.experienceMod

  return (
    <div className="w-full space-y-6">
      <p className="text-sm text-gray-500 -mt-2">
        Owners &amp; officers, classes, and payroll — per state, on one page.
      </p>

      {/* State tabs — one YesNo-style pill per state, gradient fill for
          the active one, plain outline for the rest. Add-state is a
          small dashed outline that echoes AddAnother. */}
      <div className="flex items-center gap-2 flex-wrap" role="radiogroup" aria-label="Active state">
        {[pz.state || 'CA', ...addedStates].map(s => {
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
        <button
          type="button"
          onClick={() => {
            const next = prompt('Add state (2-letter code):')?.toUpperCase().slice(0, 2)
            if (next && !addedStates.includes(next) && next !== pz.state) {
              setAddedStates([...addedStates, next])
              setActiveState(next)
            }
          }}
          className="px-4 py-1.5 rounded-full text-[13px] font-semibold border border-dashed border-[#A614C3]/30 transition"
          style={{ background: 'white', color: '#A614C3' }}
        >
          + Add state
        </button>
      </div>

      <FieldGroup label="Officers & Owners">
        {/* Rule note — CBIC's canonical info panel: a light purple
            tinted card with a purple info icon on the left, a bold
            navy headline naming the rule and gray-600 body copy. The
            optional E-Mod tag rides on the right of the same row. */}
        <div className="rounded-xl p-4 mb-4 flex items-start gap-3"
          style={{ background: 'rgba(92,46,212,0.05)', border: '1px solid rgba(92,46,212,0.18)' }}>
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="#5C2ED4" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5" strokeLinecap="round" />
            <circle cx="12" cy="16.5" r="0.6" fill="#5C2ED4" />
          </svg>
          <p className="text-[12.5px] text-gray-600 leading-relaxed flex-1">
            <span className="font-bold text-navy">{activeState} · {rule.label}.</span>{' '}
            {rule.text} {rule.help}
          </p>
          {emod && (
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0"
              style={{ background: 'rgba(92,46,212,0.08)', border: '1px solid rgba(92,46,212,0.18)', color: '#5C2ED4' }}
            >
              E-Mod {emod} · {formData.underwriting?.experienceModSource || 'WCIRB'}
            </span>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Select
            label="Officer election"
            options={[
              { value: 'auto',  label: rule.keep },
              { value: 'elect', label: rule.switch },
            ]}
            value={stateData.officerElection}
            onChange={val => patchState({ officerElection: val })}
          />
          {!emod && (
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-1.5 tracking-wide">
                Experience mod
              </label>
              <div
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm"
                style={{ background: 'white', border: '1px dashed #E5E7EB', color: '#9CA3AF' }}
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="11" strokeLinecap="round"/>
                  <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none"/>
                </svg>
                <span className="text-xs">Enter FEIN on Business info to auto-pull.</span>
              </div>
            </div>
          )}
        </div>
      </FieldGroup>

      <FieldGroup label={`Classes & Payroll — ${activeState}`}>
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 pb-2 pr-2 pl-2 w-24">Class</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 pb-2 pr-2">Description</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 pb-2 pr-2 w-28">Employees</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 pb-2 pr-2 w-36">Annual payroll</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {stateData.classes.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td className="py-2 pr-2 pl-2">
                    <input type="text" value={row.code} onChange={e => updateClass(idx, { code: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-md text-sm font-mono outline-none"
                      style={{ background: 'white', border: '1px solid #E5E7EB' }}/>
                  </td>
                  <td className="py-2 pr-2">
                    <input type="text" value={row.description} onChange={e => updateClass(idx, { description: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-md text-sm outline-none"
                      style={{ background: 'white', border: '1px solid #E5E7EB' }}/>
                  </td>
                  <td className="py-2 pr-2">
                    <input type="number" min="0" value={row.employees} onChange={e => updateClass(idx, { employees: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-md text-sm outline-none"
                      style={{ background: 'white', border: '1px solid #E5E7EB' }}/>
                  </td>
                  <td className="py-2 pr-2">
                    <input type="text" value={row.payroll} onChange={e => updateClass(idx, { payroll: e.target.value })} placeholder="$"
                      className="w-full px-2.5 py-1.5 rounded-md text-sm font-mono outline-none"
                      style={{ background: 'white', border: '1px solid #E5E7EB' }}/>
                  </td>
                  <td className="py-2 text-center">
                    <RemoveButton onClick={() => removeClass(idx)} label="Remove class" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3">
          <AddAnother onClick={addClass}>Add class code</AddAnother>
        </div>
      </FieldGroup>

      <FieldGroup label="Coverages">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-800">Blanket waiver of subrogation</span>
          <YesNo
            value={stateData.blanketWaiver ? 'yes' : 'no'}
            onChange={v => patchState({ blanketWaiver: v === 'yes' })}
            name="Blanket waiver of subrogation"
          />
        </div>
      </FieldGroup>
    </div>
  )
}
