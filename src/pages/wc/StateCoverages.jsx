import { useEffect } from 'react'
import { Input, Select } from '../../components/FormField'
import {
  RowGroup,
  AnswerRow,
  SectionLabel,
  RemoveButton,
  AddAnother,
  Segmented,
  YesNo,
  InfoDot,
  InfoPanel,
  Tag,
} from '../../components/wc/primitives'

/* Policy-level, so it sits above the state cards — everything inside a
   card is per-state. */
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

/* The card is headed by the state's name, not its abbreviation — "CA" is
   the badge, "California" is the heading. */
const STATE_NAMES = {
  CA: 'California', AZ: 'Arizona', NV: 'Nevada', PA: 'Pennsylvania', DE: 'Delaware',
}

/* Reference only — the agent enters the correct twin code themselves. */
const DUAL_WAGE = [
  { pair: '5183 / 5187', trade: 'Plumbing', cutoff: '$31/hr' },
]

const emptyClass  = () => ({ location: '', code: '', description: '', payroll: '', ftEmployees: '', ptEmployees: '' })
const emptyOfficer = () => ({ name: '', title: '', status: 'include' })

/* FormField's label, for the hand-built controls that sit beside an Input
   and have to line up with it. */
function FieldLabel({ children, required }) {
  return (
    /* 20px, the height FormField's own label comes out at, so a hand-built
       control and an Input beside it start their boxes on the same line. */
    <span className="flex items-center h-5 text-[13px] font-semibold text-gray-600 mb-1.5 tracking-wide">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </span>
  )
}

/* A heading inside a state card. The rule above it is what separates one
   subsection from the next — the card itself is the state. */
function SubSection({ title, sub, children }) {
  return (
    <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--line)' }}>
      <SectionLabel className="!mb-2 flex items-center gap-1.5">{title}</SectionLabel>
      {sub && <p className="text-[12.5px] text-gray-500 leading-relaxed">{sub}</p>}
      <div className="mt-4">{children}</div>
    </div>
  )
}

/* The mod reads itself back: a mod is only meaningful as the credit or
   debit it represents, and an agent who typed 0.87 should not have to work
   out that it is 13% off. */
function modNote(value) {
  const n = parseFloat(value)
  if (!n) return ['Pre-filled from the FEIN lookup when available — enter 1.00 if the insured has no mod.', 'text-gray-500']
  const pct = Math.round(Math.abs(1 - n) * 100)
  if (n < 1) return [`${pct}% credit: better-than-average loss experience`, 'im-note-good']
  if (n > 1) return [`${pct}% debit: worse-than-average loss experience`, 'im-note-warn']
  return ['Unity mod: no credit or debit', 'text-gray-500']
}

/* Who is covered by default is a state-and-entity rule, so it is stated on
   the state's own card rather than once for the submission. */
function officerRule(st, entityType) {
  if (entityType === 'corp') {
    return { lead: `${st} corporation:`, body: 'officers are included automatically but may elect to be excluded.' }
  }
  if (entityType === 'llc') {
    return { lead: `${st} LLC:`, body: "confirm each member's election — coverage is not automatic." }
  }
  return {
    lead: `${st} ${(ENTITY_LABELS[entityType] || 'business').toLowerCase()}:`,
    body: 'owners are usually excluded unless they elect coverage.',
  }
}

/* One card per state the submission has a location in. Everything on it is
   that state's: its mod, its waiver, its officers, its payroll schedule and
   its subcontractors. There is no "add state" control — a state arrives
   here by having a location added to it on Locations, which is the only
   place the address behind it is captured. */
function StateCard({ st, locs, entityType, sd, patch, mod, setMod }) {
  const officers = sd.officers || []
  const classes  = sd.classes  || []
  const rule = officerRule(st, entityType)
  const [note, noteTone] = modNote(mod)

  // Only an included officer has payroll to schedule.
  const anyIncluded = officers.some(o => o.status !== 'exclude')

  const subPct = Number(String(sd.subPercent || '').replace(/[^0-9.]/g, ''))

  /* Numbered as the Locations table numbers them — the physical address from
     General Info is Location 1 — and carrying the street, because
     "Location 2" on its own does not tell anyone which site they are
     scheduling payroll for. The trigger truncates the label; the menu
     shows it whole. */
  const locationOptions = locs.map(l => ({
    value: `Location ${l.n}`,
    label: l.full ? `Loc ${l.n} — ${l.full}` : `Loc ${l.n}`,
  }))

  const setOfficers = (next) => patch({ officers: next })
  const updateOfficer = (idx, partial) =>
    setOfficers(officers.map((row, i) => i === idx ? { ...row, ...partial } : row))

  const setClasses = (next) => patch({ classes: next })
  const updateClass = (idx, partial) =>
    setClasses(classes.map((row, i) => i === idx ? { ...row, ...partial } : row))

  return (
    <div className="im-field-card rounded-xl p-5 sm:p-6"
      style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>

      <div className="flex items-center gap-2.5">
        <Tag tone="brand" shape="chip">{st}</Tag>
        <h3 className="text-[15px] font-bold text-navy">{STATE_NAMES[st] || st}</h3>
      </div>
      <p className="text-[12.5px] text-gray-500 leading-relaxed mt-2">
        {locs.length} location{locs.length === 1 ? '' : 's'}:{' '}
        {locs.map(l => `Loc ${l.n} · ${l.street || '—'}`).join('  ·  ')}
      </p>

      {/* The two state-level terms, side by side: what the state's bureau
          says the risk is worth, and whether the policy waives subrogation
          across the board. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mt-5">
        <div>
          <Input
            label={
              <span className="flex items-center gap-2 h-5">
                <span>Experience mod<span className="text-red-400 ml-0.5">*</span></span>
                {st === 'CA' && <Tag size="sm">WCIRB</Tag>}
              </span>
            }
            value={mod}
            onChange={setMod}
            placeholder="e.g. 1.00"
          />
          <p className={`text-xs mt-1.5 ${noteTone}`}>{note}</p>
        </div>

        <div>
          <FieldLabel required>Blanket waiver of subrogation?</FieldLabel>
          {/* The pills carry the same 42px line an Input does, so the two
              columns sit level whichever one is taller. */}
          <div className="h-[42px] flex items-center">
            <YesNo
              value={sd.blanketWaiver ? 'yes' : 'no'}
              onChange={v => patch({ blanketWaiver: v === 'yes' })}
              name={`Blanket waiver of subrogation in ${st}`}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            Common when contracts with general contractors require it.
          </p>
        </div>
      </div>

      <SubSection
        title="Owners & officers"
        sub={<><span className="font-bold text-navy">{rule.lead}</span> {rule.body}</>}
      >
        <div className="space-y-3">
          {officers.map((row, idx) => (
            <div key={idx}>
              <div className="grid grid-cols-[1fr_150px] lg:grid-cols-[1fr_170px_210px_40px] gap-3 items-end">
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
                  {idx === 0 && <FieldLabel>Status</FieldLabel>}
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
                  <RemoveButton
                    onClick={() => setOfficers(officers.filter((_, i) => i !== idx))}
                    label="Remove officer"
                  />
                </div>
              </div>
              {/* What excluding this person commits the agent to, on the row
                  that made the election rather than in a notice further down
                  that does not say who it is about. */}
              {row.status === 'exclude' && (
                <p className="text-[11.5px] im-note-warn mt-1.5">
                  Excluded: don't schedule payroll for this person. A signed exclusion
                  form will be required for {STATE_NAMES[st] || st}.
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5">
          <AddAnother onClick={() => setOfficers([...officers, emptyOfficer()])}>
            Add officer
          </AddAnother>
        </div>

        {anyIncluded && (
          <InfoPanel
            tone="warn"
            className="mt-5"
            lead={`Schedule officer payroll according to ${STATE_NAMES[st] || st} minimum/maximum guidelines.`}
          >
            Included officers go in Classes &amp; payroll below at no less than the state
            minimum and no more than the maximum. [Current {st} min / max]
          </InfoPanel>
        )}
      </SubSection>

      <SubSection
        title={
          <>
            Classes &amp; payroll
            <InfoDot
              title="Dual-wage classes in this quote"
              text={`Enter the correct twin class code directly on the row based on the average hourly wage for that class. ${DUAL_WAGE.map(d => `${d.pair} (${d.trade}) — ${d.cutoff}`).join('; ')}.`}
            />
          </>
        }
        sub="One line per class code at each location. Annual payroll, before taxes."
      >
        <div className="space-y-3">
          {classes.map((row, idx) => (
            <div key={idx} className="grid grid-cols-2 sm:grid-cols-[126px_minmax(0,1fr)_102px_62px_62px_32px] gap-2.5 items-end">
              <Select
                label={idx === 0 ? 'Location' : undefined}
                options={locationOptions}
                wideMenu
                /* A row can be holding a location that belonged to another
                   state before a location moved; fall back rather than show
                   the placeholder on a row that does have an answer. */
                value={locationOptions.some(o => o.value === row.location)
                  ? row.location
                  : locationOptions[0]?.value}
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
                <RemoveButton
                  onClick={() => setClasses(classes.filter((_, i) => i !== idx))}
                  label="Remove class"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <AddAnother onClick={() => setClasses([...classes, emptyClass()])}>Add class</AddAnother>
        </div>
      </SubSection>

      <SubSection title="Subcontractors">
        <FieldLabel required>Does the business use subcontractors in {st}?</FieldLabel>
        <YesNo
          value={sd.usesSubs || 'no'}
          onChange={val => patch({ usesSubs: val })}
          name={`Uses subcontractors in ${st}`}
        />

        {sd.usesSubs === 'yes' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mt-5">
              <div>
                <Input
                  label="% of work subcontracted"
                  required
                  value={sd.subPercent}
                  onChange={val => patch({ subPercent: val })}
                  placeholder="%"
                />
                <p className={`text-xs mt-1.5 ${subPct > 25 ? 'im-note-warn' : 'text-gray-500'}`}>
                  {subPct > 25
                    ? 'Over 25%: some carriers decline'
                    : 'Share of total work done by subs'}
                </p>
              </div>
              <Select
                label="Certificates collected for all subs?"
                required
                options={CERTIFICATES}
                value={sd.subCertificates}
                onChange={val => patch({ subCertificates: val })}
              />
            </div>

            <InfoPanel
              className="mt-5"
              lead="Collect certificates of insurance from every subcontractor before work begins."
            >
              Payroll paid to uninsured or uncertificated subs is added to your payroll at
              audit and charged at the applicable class rate.
            </InfoPanel>
          </>
        )}
      </SubSection>
    </div>
  )
}

export default function StateCoverages({ formData, updateFormData, replaceFormSection }) {
  const pz = formData.pageZero || {}
  const business = formData.business || {}
  const data = formData.coverage || {}

  const homeState = pz.state || 'CA'

  /* The submission covers the states it has locations in, so the list is
     read off Locations rather than built here — a state with no location
     behind it had nothing to schedule payroll against. */
  const states = [...new Set([
    homeState,
    ...(formData.locations?.list || []).map(l => l.state).filter(Boolean),
  ])]

  /* Payroll scheduled against a state that has since lost its last location
     would still be rated. Drop it when the state goes — `elLimits` lives in
     this section too, so only two-letter keys are considered. */
  const orphans = Object.keys(data).filter(k => /^[A-Z]{2}$/.test(k) && !states.includes(k))
  useEffect(() => {
    if (!orphans.length) return
    const next = { ...data }
    orphans.forEach(k => delete next[k])
    ;(replaceFormSection || updateFormData)('coverage', next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orphans.join(',')])

  const entityType = business.entityType || 'corp'

  /* Location 1 is the physical address from General Info. */
  const allLocations = [
    {
      n: 1,
      state: business.state || homeState,
      street: business.address || '',
      full: [business.address, business.city].filter(Boolean).join(', '),
    },
    ...(formData.locations?.list || []).map((l, i) => ({
      n: i + 2,
      state: l.state || homeState,
      street: [l.address, l.suite].filter(Boolean).join(', '),
      full: [[l.address, l.suite].filter(Boolean).join(', '), l.city].filter(Boolean).join(', '),
    })),
  ]

  /* The home state's card starts from what page zero already asked for; a
     state added later starts empty. */
  const defaultsFor = (st) => ({
    officers: [emptyOfficer()],
    classes: st === homeState
      ? [{
          location: '',
          code: pz.mainClass || '5183',
          description: pz.classDescription || 'Plumbing NOC',
          payroll: pz.estimatedPayroll || '$480,000',
          ftEmployees: '6',
          ptEmployees: '0',
        }]
      : [emptyClass()],
    usesSubs: 'no',
    blanketWaiver: false,
  })

  /* Officers used to sit at the top of the section, shared across states.
     They belong to the state whose rules decide whether they are covered,
     so a record written under the old shape hands its list to the home
     state rather than losing it. */
  const stateDataFor = (st) => {
    const base = data[st] || defaultsFor(st)
    if (base.officers) return base
    return { ...base, officers: (st === homeState && data.officers) || [emptyOfficer()] }
  }

  const patchState = (st) => (partial) => {
    updateFormData('coverage', { ...data, [st]: { ...stateDataFor(st), ...partial } })
  }

  /* The home state's mod is the one the quote is rated on, so it stays on
     `underwriting` where the FEIN lookup writes it and the indication reads
     it. Any other state keeps its own on its card. */
  const modOf = (st) => st === homeState
    ? (formData.underwriting?.experienceMod || '')
    : (data[st]?.mod || '')
  const setModOf = (st) => (val) => st === homeState
    ? updateFormData('underwriting', { experienceMod: val, experienceModSource: 'Manual' })
    : patchState(st)({ mod: val })

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

      {states.map(st => (
        <StateCard
          key={st}
          st={st}
          locs={allLocations.filter(l => l.state === st)}
          entityType={entityType}
          sd={stateDataFor(st)}
          patch={patchState(st)}
          mod={modOf(st)}
          setMod={setModOf(st)}
        />
      ))}
    </div>
  )
}
