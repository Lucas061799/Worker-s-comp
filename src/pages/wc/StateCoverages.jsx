import { useEffect, useState } from 'react'
import { Input, Select, FormGrid } from '../../components/FormField'
import {
  FieldGroup,
  SectionLabel,
  InfoDot,
  RemoveButton,
  AddAnother,
  Segmented,
  YesNo,
  InfoPanel,
  Tag,
  SideSheet,
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
/* California's dual-wage classes, off the marketplace's own table. One
   trade, two codes, split at an hourly wage: the first of each pair is the
   low-wage code and the second the high-wage one, which is the order the
   marketplace lists and names them in. Payroll either side of the line is
   reported separately, so entering one brings its twin onto the sheet.

   Four cutoffs are missing because the reference they were read from had
   them behind a scrollbar. The pairs are right, so the twin still arrives;
   only the figure is blank until someone fills it in. */
const DUAL_WAGE_EFFECTIVE = '9/1/26'

const DUAL_WAGE = [
  { low: '5027', high: '5028', trade: 'Masonry', cutoff: '$37' },
  { low: '5190', high: '5140', trade: 'Electrical Wiring', cutoff: '$40' },
  { low: '5183', high: '5187', trade: 'Plumbing / Refrigeration / Heating or Air Conditioning Equipment', cutoff: '$35' },
  { low: '5185', high: '5186', trade: 'Automatic Sprinkler Installation', cutoff: '$36' },
  { low: '5201', high: '5205', trade: 'Concrete or Cement Work', cutoff: '$36' },
  { low: '5403', high: '5432', trade: 'Carpentry', cutoff: '$46' },
  { low: '5446', high: '5447', trade: 'Wallboard Installation', cutoff: '$45' },
  { low: '5467', high: '5470', trade: 'Glaziers', cutoff: '$43' },
  { low: '5474', high: '5482', trade: 'Painting / Waterproofing', cutoff: '$36' },
  { low: '5484', high: '5485', trade: 'Plastering or Stucco Work', cutoff: '$42' },
  { low: '5538', high: '5542', trade: 'Sheet Metal Work / Heating or Air Conditioning Ductwork', cutoff: '$37' },
  { low: '5552', high: '5553', trade: 'Roofing', cutoff: '$33' },
  { low: '5632', high: '5633', trade: 'Steel Framing', cutoff: null },
  { low: '6218', high: '6220', trade: 'Excavation / Grading / Land Leveling', cutoff: null },
  { low: '6307', high: '6308', trade: 'Sewer Construction', cutoff: null },
  { low: '6315', high: '6316', trade: 'Water / Gas Mains', cutoff: null },
]

const pairFor = (code) => DUAL_WAGE.find(d => d.low === code || d.high === code)

/* The marketplace names them "Masonry–low wage" and "Masonry–high wage",
   so the row the agent did not type reads the same as the one they did. */
function dualLabel(code) {
  const d = pairFor(code)
  if (!d) return null
  return `${d.trade} — ${d.low === code ? 'low' : 'high'} wage`
}

/* The classifications panel. It arrives with the twin — the moment the
   sheet gains a row nobody typed is the moment to say why — and can be
   put away and called back. A side sheet, so the class rows it explains
   stay in view beside it. */
function DualWagePanel({ onClose }) {
  return (
    <SideSheet title="Dual wage classifications" onClose={onClose}>
      <p className="px-5 pb-4 text-[12px] leading-[18px] text-gray-500">
        In California some construction operations split into two classifications on the
        hourly wage paid. Both codes go on the submission, so the policy binds with each.
        The splits below are the ones in force for this policy&rsquo;s effective date.
      </p>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scroll"
        style={{ borderTop: '1px solid var(--line-soft)' }}>
        <table className="w-full text-[11.5px]">
          <thead>
            <tr className="text-gray-400">
              <th className="font-semibold text-left px-4 py-1.5 whitespace-nowrap">Code</th>
              <th className="font-semibold text-left px-2 py-1.5">Title</th>
              <th className="font-semibold text-right px-4 py-1.5 whitespace-nowrap">{DUAL_WAGE_EFFECTIVE}</th>
            </tr>
          </thead>
          <tbody>
            {DUAL_WAGE.map(d => (
              <tr key={d.low} style={{ borderTop: '1px solid var(--line-soft)' }}>
                <td className="px-4 py-1.5 whitespace-nowrap font-semibold" style={{ color: 'var(--ink)' }}>
                  {d.low} / {d.high}
                </td>
                <td className="px-2 py-1.5 text-gray-500 leading-snug">{d.trade}</td>
                <td className="px-4 py-1.5 text-right whitespace-nowrap font-semibold"
                  style={{ color: d.cutoff ? 'var(--ink)' : '#9CA3AF' }}>
                  {d.cutoff || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SideSheet>
  )
}

const emptyClass  = () => ({ location: '', code: '', description: '', payroll: '', ftEmployees: '', ptEmployees: '' })
const emptyOfficer = () => ({ name: '', title: '', ownership: '', status: 'include' })

/* FormField's label, for the hand-built controls that sit beside an Input
   and have to line up with it. */
function FieldLabel({ children, required }) {
  return (
    /* 20px, the height FormField's own label comes out at, so a hand-built
       control and an Input beside it start their boxes on the same line.
       A <label> rather than a span, too: the page's ink treatment darkens
       `label`, and a span beside it comes out a whole step lighter. */
    <label className="flex items-center h-5 text-[13px] font-semibold text-gray-600 mb-1.5 tracking-wide">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  )
}

const STATE_CARD_STYLE = { background: '#F9FAFB', border: '1px solid #E5E7EB' }

/* The page's two layouts, switched from the demo control at its foot so
   they can be compared on the same answers: every section of a state in
   its own headed box, or the earlier single state card with its sections
   divided by rules inside it. */
const COVERAGE_LAYOUTS = [
  { value: 'boxes', label: 'Separate boxes — one per section' },
  { value: 'single', label: 'Single card — sections divided by rules' },
]

/* How the states are moved between, from the same demo control: folder
   tabs with one state open at a time, or an accordion of every state,
   each opening in place under its own header. */
const STATE_SWITCHERS = [
  { value: 'tabs', label: 'Tabs — one state at a time' },
  { value: 'accordion', label: 'Accordion — every state stacked' },
]

/* The one-line summary an accordion header carries, so a collapsed state
   still says how much is scheduled under it. */
function stateSummary(sd) {
  const classes = (sd.classes || []).filter(c => (c.code || '').trim())
  const payroll = (sd.classes || []).reduce(
    (sum, c) => sum + (Number(String(c.payroll || '').replace(/[^0-9.]/g, '')) || 0), 0)
  const officers = (sd.officers || []).filter(o => (o.name || '').trim()).length
  const parts = [
    `${classes.length} class code${classes.length === 1 ? '' : 's'}`,
    payroll ? `$${payroll.toLocaleString('en-US')} payroll` : 'No payroll yet',
  ]
  if (officers) parts.push(`${officers} officer${officers === 1 ? '' : 's'}`)
  return parts.join(' · ')
}

/* One section of a state, as its own card with its heading outside it —
   the dashed group heading every other card on the flow wears, so the
   page reads as a stack of headed boxes rather than one long one.
   Anything that acts on the whole section (the classifications panel, say)
   rides on the heading's line, at the far end of it.

   Not `boxed`, it is the earlier layout's heading inside the state card:
   14px navy, with the rule above it separating one section from the next. */
function SubSection({ title, sub, aside, boxed = true, children }) {
  if (!boxed) {
    return (
      <div className="mt-7 pt-7 border-t" style={{ borderColor: 'var(--line)' }}>
        <div className="flex items-center justify-between gap-4 mb-2">
          <h4 className="text-[14px] font-semibold text-navy flex items-center gap-1.5 flex-1 min-w-0">{title}</h4>
          {aside}
        </div>
        {sub && <p className="text-[12.5px] text-gray-500 leading-relaxed">{sub}</p>}
        <div className={sub ? 'mt-5' : 'mt-3'}>{children}</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-2.5">
        <SectionLabel className="!mb-0">{title}</SectionLabel>
        {aside}
      </div>
      <div className="im-field-card rounded-xl p-5 sm:p-6" style={STATE_CARD_STYLE}>
        {sub && <p className="text-[12.5px] text-gray-500 leading-relaxed mb-5">{sub}</p>}
        {children}
      </div>
    </div>
  )
}

/* The mod reads itself back: a mod is only meaningful as the credit or
   debit it represents, and an agent who typed 0.87 should not have to work
   out that it is 13% off. */
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
function StateCard({ st, locs, entityType, sd, patch, mod, setMod, layout = 'boxes', showTitle = true }) {
  /* Shown when a twin arrives, and whenever the agent asks for it back. */
  const [wagePanel, setWagePanel] = useState(false)
  const officers = sd.officers || []
  const classes  = sd.classes  || []
  const rule = officerRule(st, entityType)

  // Only an included officer has payroll to schedule.
  const anyIncluded = officers.some(o => o.status !== 'exclude')

  /* The listed officers' shares have to account for the whole company. Only
     checked once a share has been typed, so an untouched row is not an error. */
  const ownershipEntered = officers.some(o => String(o.ownership || '') !== '')
  const ownershipSum = officers.reduce((sum, o) => sum + (Number(o.ownership) || 0), 0)
  const ownershipOff = ownershipEntered && ownershipSum !== 100

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

  /* A row shows the first location when the one it holds is not on this
     state's list, so the twin has to be filed against what is on screen
     rather than what is stored. */
  const shownLocation = (row) => locationOptions.some(o => o.value === row.location)
    ? row.location
    : locationOptions[0]?.value || ''

  /* Leaving a dual-wage code puts its twin on the sheet, at the same
     location, with the payroll left empty — splitting it is the agent's
     call, but remembering the other code should not be. Nothing happens
     if that pair is already down for the location.

     California only: the split is that state's, and a code typed on
     another state's card means something else there. */
  const addTwinFor = (idx) => {
    if (st !== 'CA') return
    const row = classes[idx]
    if (!row) return
    const code = (row.code || '').trim()
    const d = pairFor(code)
    if (!d) return
    const twin = d.low === code ? d.high : d.low
    const loc = shownLocation(row)
    if (classes.some(r => (r.code || '').trim() === twin && shownLocation(r) === loc)) return
    setClasses([...classes, {
      ...emptyClass(),
      location: loc,
      code: twin,
      description: dualLabel(twin) || '',
    }])
    /* The sheet just gained a row nobody typed, so the panel says why. */
    setWagePanel(true)
  }

  const boxed = layout !== 'single'

  /* The state's own terms: its name, its mod and its waiver. */
  const head = (
    <>
      {/* The accordion's header already names the state. */}
      {showTitle && (
        <div className="flex items-center gap-2.5 mb-5">
          <Tag tone="brand" shape="chip">{st}</Tag>
          <h3 className="text-[15px] font-bold text-navy">{STATE_NAMES[st] || st}</h3>
        </div>
      )}
      {/* The two state-level terms, side by side: what the state's bureau
          says the risk is worth, and whether the policy waives subrogation
          across the board. The liability limits are back above the tabs —
          they belong to the policy, not to whichever state is open. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <div>
          <Input
            label={
              <span className="flex items-center gap-2 h-5">
                <span>Experience mod<span className="text-red-400 ml-0.5">*</span></span>
                {st === 'CA' && <Tag size="sm" tone="teal">WCIRB</Tag>}
              </span>
            }
            value={mod}
            onChange={setMod}
            placeholder="e.g. 1.00"
          />
        </div>

        <div>
          <FieldLabel required>Blanket waiver of subrogation?</FieldLabel>
          {/* The pills carry the same 42px line an Input does, so the two
              columns sit level whichever one is taller. */}
          <div className="h-[42px] flex items-center">
            <YesNo
              size="field"
              value={sd.blanketWaiver ? 'yes' : 'no'}
              onChange={v => patch({ blanketWaiver: v === 'yes' })}
              name={`Blanket waiver of subrogation in ${st}`}
            />
          </div>
        </div>
      </div>
    </>
  )

  const sections = (
    <>
      <SubSection boxed={boxed} title="Owners & officers">
        {/* One callout, not three. The entity rule was a grey sub-line, the
            payroll guidance an amber panel and the exclusion note a small
            orange line — three weights for what is all the same kind of
            thing. The section's own rules go in one neutral panel, written
            as the appetite answers are: bold opening, then the sentence.
            Only the per-row consequence stays beside its row. */}
        <InfoPanel className="mb-5">
          <b className="font-semibold text-navy">{rule.lead}</b> {rule.body}
          {anyIncluded && (
            <> Schedule an included officer&rsquo;s payroll in Classes &amp; payroll at no less
              than the {STATE_NAMES[st] || st} minimum and no more than the maximum.</>
          )}
        </InfoPanel>

        <div className="space-y-4">
          {officers.map((row, idx) => (
            <div key={idx}>
              {/* Name and Title share what is left after Status and the
                  remove button, so the two read as a pair rather than a
                  long box beside a short one. */}
              <div className="grid grid-cols-[1fr_150px] lg:grid-cols-[1fr_1fr_120px_210px_40px] gap-3 items-end">
                <Input
                  label={idx === 0 ? 'Name' : undefined}
                  required
                  value={row.name}
                  onChange={val => updateOfficer(idx, { name: val })}
                  placeholder="Full name"
                />
                <Select
                  label={idx === 0 ? 'Title' : undefined}
                  required
                  options={OFFICER_TITLES}
                  value={row.title}
                  onChange={val => updateOfficer(idx, { title: val })}
                />
                {/* Whole percents only, and never above 100 — a share of a
                    company has nowhere else to go. */}
                <Input
                  label={idx === 0 ? 'Ownership %' : undefined}
                  required
                  align="right"
                  value={row.ownership}
                  onChange={val => {
                    const n = val.replace(/\D/g, '').slice(0, 3).replace(/^0+/, '')
                    updateOfficer(idx, { ownership: n && Number(n) > 100 ? '100' : n })
                  }}
                  placeholder="%"
                />
                <div>
                  {idx === 0 && <FieldLabel required>Status</FieldLabel>}
                  <div className="h-[42px] flex items-center flex-nowrap">
                    <Segmented
                      size="field"
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
              {/* What the election commits the agent to, on the row that made
                  it rather than in a notice further down that does not say
                  who it is about. Include is the default, so it shows too. */}
              {row.status === 'exclude' ? (
                <p className="text-[11.5px] im-note-warn mt-1.5">
                  Excluded: don't schedule payroll for this person. A signed exclusion
                  form will be required for {STATE_NAMES[st] || st}.
                </p>
              ) : (
                <p className="text-[11.5px] im-note-warn mt-1.5">
                  Included: Schedule payroll for this person per state guidelines. A signed
                  inclusion form is not required.
                </p>
              )}
            </div>
          ))}
        </div>

        {ownershipOff && (
          <p role="alert" className="text-[11.5px] font-semibold text-red-500 mt-3">
            Ownership sum must equal 100%
          </p>
        )}

        <div className="mt-5">
          <AddAnother onClick={() => setOfficers([...officers, emptyOfficer()])}>
            Add officer
          </AddAnother>
        </div>

      </SubSection>

      <SubSection
        boxed={boxed}
        title="Classes &amp; payroll"
        aside={st === 'CA' ? (
          <button type="button" onClick={() => setWagePanel(true)}
            className="im-wage-link text-[12px] font-semibold shrink-0 inline-flex items-center gap-1.5 underline underline-offset-2">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M3 10h18M9 10v10" />
            </svg>
            Dual wage classifications
          </button>
        ) : null}
      >
        <div>
        {wagePanel && st === 'CA' && <DualWagePanel onClose={() => setWagePanel(false)} />}
        <div className="space-y-4">
          {classes.map((row, idx) => (
            <div key={idx} /* Location carries "Loc 1 — 1420 Prospect Rd, Saratoga" and was
                 clipped to "Loc 1 — 1…" at 126px, while the class code —
                 whose longest value measures 227px — had 412px to spread
                 into. The 124px moves from one to the other. Location can
                 give some of it back when the column narrows (the dual wage
                 sheet open beside it), before the class code is squeezed
                 shut. */
              className="grid grid-cols-2 sm:grid-cols-[minmax(160px,290px)_minmax(180px,1fr)_118px_52px_52px_32px] gap-3 items-end">
              <Select
                label={idx === 0 ? 'Location' : undefined}
                required
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
                required
                value={row.code && row.description ? `${row.code} — ${row.description}` : row.code}
                onChange={val => {
                  const [code, ...rest] = val.split('—')
                  updateClass(idx, { code: code.trim(), description: rest.join('—').trim() })
                }}
                onBlur={() => addTwinFor(idx)}
                placeholder="e.g. 8810 or clerical"
              />
              <Input
                label={idx === 0 ? 'Annual payroll' : undefined}
                required
                align="right"
                value={row.payroll}
                onChange={val => updateClass(idx, { payroll: val })}
                placeholder="$"
              />
              <Input
                label={idx === 0 ? 'FT' : undefined}
                required
                align="right"
                value={row.ftEmployees}
                onChange={val => updateClass(idx, { ftEmployees: val })}
                placeholder="0"
              />
              <Input
                label={idx === 0 ? 'PT' : undefined}
                required
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

        </div>

        <div className="mt-5">
          <AddAnother onClick={() => setClasses([...classes, emptyClass()])}>Add class</AddAnother>
        </div>
      </SubSection>

      <SubSection boxed={boxed} title="Subcontractors">
        {/* The card is already the state's, so the question does not name
            it. The radiogroup still does, since two cards are on the page
            and their names have to differ. */}
        <FieldLabel required>Does this business use subcontractors?</FieldLabel>
        <YesNo
          value={sd.usesSubs || 'no'}
          onChange={val => patch({ usesSubs: val })}
          name={`Uses subcontractors in ${st}`}
        />

        {sd.usesSubs === 'yes' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mt-5">
            <div>
              {/* What the number means moves into the ⓘ; the line below
                  the field is kept for the one thing worth interrupting
                  for, which is a share high enough to lose markets. */}
              <Input
                label={
                  <span className="flex items-center gap-1.5">
                    % of work subcontracted<span className="text-red-400">*</span>
                    <InfoDot
                      title="% of work subcontracted"
                      text="Share of total work done by subs, across this state's operations."
                    />
                  </span>
                }
                value={sd.subPercent}
                onChange={val => patch({ subPercent: val })}
                placeholder="%"
              />
              {subPct > 25 && (
                <p className="text-xs mt-1.5 im-note-warn">Over 25%: some carriers decline</p>
              )}
            </div>
            <div>
              <Select
                label="Certificates collected for all subs?"
                required
                options={CERTIFICATES}
                value={sd.subCertificates}
                onChange={val => patch({ subCertificates: val })}
              />
              {/* Every answer says something back. A sub without a
                  certificate is rated as an employee, so the payroll above
                  has to carry them — and a Yes holds only while the
                  certificates do, since the audit checks them again. */}
              {(sd.subCertificates === 'Yes' || sd.subCertificates === 'No' || sd.subCertificates === 'Sometimes') && (
                <p className="text-xs mt-1.5 im-note-warn">
                  {sd.subCertificates === 'Yes'
                    ? 'Certificates must be maintained. Uninsured subcontractors may be included at audit.'
                    : sd.subCertificates === 'No'
                      ? 'Uninsured subs are rated as employees — include their pay in the class codes above.'
                      : 'Any sub without a certificate is rated as an employee — include their pay above.'}
                </p>
              )}
            </div>
          </div>
        )}
      </SubSection>
    </>
  )

  /* Four cards stacked: the state's own terms, then its officers, its
     classes and its subcontractors, each boxed on its own. Or, in the
     earlier layout, all of it in the one state card. */
  return boxed ? (
    <div className="space-y-6">
      <div className="im-field-card rounded-xl p-5 sm:p-6" style={STATE_CARD_STYLE}>{head}</div>
      {sections}
    </div>
  ) : (
    <div className="im-field-card rounded-xl p-5 sm:p-6" style={STATE_CARD_STYLE}>
      {head}
      {sections}
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

  /* Which state's section is open. The policy-level row above the tabs
     does not move with it — only everything below does. */
  const [activeState, setActiveState] = useState(states[0])
  /* Which layout the demo control has picked. Not persisted — a reviewer's
     comparison, not part of the submission. */
  const [layout, setLayout] = useState('boxes')
  const [switcher, setSwitcher] = useState('tabs')
  /* The accordion's open states, independent of one another. The first
     starts open so the page does not land on a column of closed bars. */
  const [openStates, setOpenStates] = useState(() => [states[0]])
  const toggleOpen = (st) => setOpenStates(cur =>
    cur.includes(st) ? cur.filter(s => s !== st) : [...cur, st])
  const active = states.includes(activeState) ? activeState : states[0]
  useEffect(() => {
    if (!states.includes(activeState)) setActiveState(states[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [states.join(',')])

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
      {/* Everything the policy carries whatever states it touches. It sits
          above the tabs because it does not change when they do. */}
      <FieldGroup label="Policy-level coverage">
        {/* Label above its control, like every other field on the flow —
            the label-left row read as a settings line rather than a
            question being answered. */}
        <FormGrid>
          <Select
            label="Employer's liability limits"
            required
            options={EL_LIMITS}
            value={data.elLimits || EL_LIMITS[1]}
            onChange={val => updateFormData('coverage', { ...data, elLimits: val })}
          />
        </FormGrid>
      </FieldGroup>

      {/* The state-level block as a tabbed folder. One tab per state, and
          only the open one's sections below — the states are answered one
          at a time, and stacking every card made a page long enough that
          which answers belonged to which state stopped being obvious. The
          tabs stand on the outline that holds everything they switch, so it
          is plain which sections change with the state — and that
          Employer's liability, above it, does not. A single-state
          submission has nothing to switch between, so the tabs stay off. */}
      {switcher === 'tabs' ? (
      <div>
        {states.length > 1 && (
          <div role="tablist" aria-label="States on this policy"
            className="im-state-track flex flex-wrap items-end gap-1">
            {states.map(st => {
              const on = st === active
              return (
                <button
                  key={st}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActiveState(st)}
                  className={`im-state-tab${on ? ' im-state-tab-on' : ''} inline-flex items-center gap-2 h-10 px-5 rounded-t-lg text-[13px] font-semibold`}
                >
                  {/* The code a step quieter than the name beside it, so the
                      name is what reads. */}
                  <span className="im-state-tab-code font-bold tracking-[0.06em] text-[11px]">{st}</span>
                  <span>{STATE_NAMES[st] || st}</span>
                </button>
              )
            })}
          </div>
        )}
        {/* Square at the top-left only while tabs stand on it, so the first
            tab runs straight down into the panel's edge. */}
        <div className={`im-state-panel rounded-2xl p-3 sm:p-5${states.length > 1 ? ' rounded-tl-none' : ''}`}>
          <SectionLabel>State-level coverage</SectionLabel>
          <StateCard
            key={active}
            st={active}
            locs={allLocations.filter(l => l.state === active)}
            entityType={entityType}
            sd={stateDataFor(active)}
            patch={patchState(active)}
            mod={modOf(active)}
            setMod={setModOf(active)}
            layout={layout}
          />
        </div>
      </div>
      ) : (
        /* The same block as an accordion: every state on the page at once,
           each under a header bar that opens it in place, drawn in the
           tabbed panel's outline so what one header opens is plain. */
        <div>
          <SectionLabel>State-level coverage</SectionLabel>
          <div className="space-y-3">
            {states.map(st => {
              const open = openStates.includes(st)
              const sd = stateDataFor(st)
              return (
                <div key={st} className={`im-state-acc rounded-2xl${open ? ' im-state-acc-open' : ''}`}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => toggleOpen(st)}
                    className="im-state-acc-head w-full flex items-center gap-3 px-4 sm:px-5 h-14 text-left rounded-2xl"
                  >
                    <span className="im-state-tab-code font-bold tracking-[0.06em] text-[11px]">{st}</span>
                    <span className="text-[14px] font-semibold">{STATE_NAMES[st] || st}</span>
                    <span className="im-state-acc-sum ml-auto text-[12px] truncate hidden sm:block">
                      {stateSummary(sd)}
                    </span>
                    <svg className={`w-4 h-4 shrink-0 transition-transform ml-auto sm:ml-0${open ? ' rotate-180' : ''}`}
                      fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {open && (
                    <div className="px-3 pb-3 sm:px-5 sm:pb-5 pt-1">
                      <StateCard
                        st={st}
                        locs={allLocations.filter(l => l.state === st)}
                        entityType={entityType}
                        sd={sd}
                        patch={patchState(st)}
                        mod={modOf(st)}
                        setMod={setModOf(st)}
                        layout={layout}
                        showTitle={false}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* A demo control, not part of the flow — the payment step's kind:
          the two layouts of this page, on the same answers. */}
      <div className="pt-4" style={{ borderTop: '1px solid var(--line-soft)' }}>
        <div className="flex flex-wrap gap-4">
          <div style={{ width: 340, maxWidth: '100%' }}>
            <Select
              label="Layout"
              wideMenu
              options={COVERAGE_LAYOUTS}
              value={layout}
              onChange={setLayout}
            />
          </div>
          <div style={{ width: 340, maxWidth: '100%' }}>
            <Select
              label="States"
              wideMenu
              options={STATE_SWITCHERS}
              value={switcher}
              onChange={setSwitcher}
            />
          </div>
        </div>
        <p className="text-[11px] text-gray-400 mt-2">
          Demo only — other layouts of this page, on the same answers.
        </p>
      </div>
    </div>
  )
}
