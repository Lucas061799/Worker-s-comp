import { CARRIERS } from '../pages/wc/CarrierSelection'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

const ICONS = {
  user:     'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  building: 'M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1M9 13h1m4 0h1M9 17h1m4 0h1',
  doc:      'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  shield:   'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  tools:    'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  clock:    'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  money:    'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
}

const COVERAGE_STATUS_LABELS = {
  inforce: 'Coverage in force', lapse: 'Lapse', newventure: 'New venture', noprior: 'No prior',
}

const ENTITY_LABELS = {
  corp: 'Corporation', llc: 'LLC', sole: 'Sole proprietor', partner: 'Partnership',
}

/* Short forms of the credit questions — the summary is a read-back, so
   the full question wording would crowd the page. */
const UW_LABELS = {
  owner_involved:      'Owner Involved Day-to-Day',
  ten_years_exp:       '10+ Years Industry Experience',
  supervisor_ratio:    'Low Supervisor Ratio',
  turnover_rate:       'Annual Turnover Rate',
  safety_program:      'Written Safety Program',
  safety_committee:    'Safety Committee / Manager',
  safety_meetings:     'Regular Safety Meetings',
  orientation_program: 'Orientation / Training Program',
  accident_procedures: 'Accident Investigation Procedures',
  ppe_required:        'PPE Required',
  machines_guarded:    'Machines Properly Guarded',
  first_aid:           'First Aid / Eye Wash Available',
  benefits_provided:   'Employee Benefits',
  drug_testing:        'Pre-Employment Drug Testing',
  return_to_work:      'Return to Work Program',
  cleaning_frequency:  'Work Area Cleaning',
}

/* The teal chip all the products use on these summary panels — the one
   place they step outside the purple. */
/* The pencil CBIC puts on every panel: a read-back is for catching a
   mistake, so it has to be a way back in. */
function EditButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Edit ${label}`}
      className="no-print w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition hover:bg-gray-50"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="#9CA3AF" strokeWidth="1.6" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    </button>
  )
}

function Panel({ title, icon = 'shield', onEdit, children }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--surface-card)', border: '1px solid var(--line)', breakInside: 'avoid' }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(115,201,183,0.12)' }}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="#73C9B7" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[icon] || ICONS.shield} />
          </svg>
        </div>
        <h3 className="text-xs font-bold flex-1" style={{ color: 'var(--ink)' }}>{title}</h3>
        {onEdit && <EditButton onClick={onEdit} label={title} />}
      </div>
      <div>{children}</div>
    </div>
  )
}

function Row({ label, value }) {
  if (value === '' || value == null) return null
  return (
    <div className="flex items-start justify-between gap-4 py-1.5" style={{ borderBottom: '1px solid var(--line-soft)' }}>
      <span className="text-[10px] leading-snug flex-1 min-w-0" style={{ color: '#9CA3AF' }}>{label}</span>
      <span className="text-[10px] font-semibold text-right leading-snug max-w-[55%]" style={{ color: 'var(--ink)' }}>{value}</span>
    </div>
  )
}

const yesNo = (v) => (v === 'yes' || v === true ? 'Yes' : v === 'no' || v === false ? 'No' : '')
const money = (n) => (n ? `$${Number(n).toLocaleString()}` : '')

export default function PrintSummary({ formData, visible, onClose, onEdit }) {
  // A pencil sends the agent back to the step that owns the answer.
  const edit = (stepId) => onEdit ? () => { onClose(); onEdit(stepId) } : undefined
  if (!visible) return null

  const pz   = formData.pageZero     || {}
  const biz  = formData.business     || {}
  const hist = formData.history      || {}
  const uw   = formData.underwriting || {}
  const sel  = formData.carrierSelection?.checked || {}
  const state = pz.state || 'CA'
  const cov = formData.coverage || {}
  const stateCov = cov[state] || {}
  const classes = stateCov.classes || []
  const losses = hist.losses || []

  const totalPayroll = classes.reduce((sum, c) => {
    const n = parseInt(String(c.payroll || '').replace(/[^\d]/g, ''), 10)
    return sum + (Number.isFinite(n) ? n : 0)
  }, 0)
  const totalEmployees = classes.reduce(
    (sum, c) => sum + (parseInt(c.ftEmployees, 10) || 0) + (parseInt(c.ptEmployees, 10) || 0), 0)

  const selectedCarriers = CARRIERS.filter(c => sel[c.id] !== false)

  return (
    <div className="bop-page fixed inset-0 z-[9999] flex items-center justify-center p-4 uw-preview-backdrop"
      style={{ background: 'rgba(15,10,40,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div
        id="submission-print-area"
        className="im-sheet relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header — sits on the card surface, above the soft body */}
        <div className="shrink-0" style={{ background: 'var(--surface-card)', borderBottom: '1px solid var(--line-soft)' }}>
          <div className="flex items-start gap-4 px-5 pt-4 pb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(88.09deg, rgba(92,46,212,0.12) 0%, rgba(166,20,195,0.12) 100%)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="wcSumCheckG" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#5C2ED4" /><stop offset="100%" stopColor="#A614C3" />
                  </linearGradient>
                </defs>
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  stroke="url(#wcSumCheckG)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold leading-tight" style={{ color: 'var(--ink)' }}>Application summary</h1>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#9CA3AF' }}>
                {biz.name || 'This submission'} — everything captured so far.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              title="Close"
              className="no-print w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all hover:bg-gray-50"
              style={{ border: '1px solid var(--line)', background: 'var(--surface-card)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <path stroke="url(#wcSumCheckG)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll px-4 py-4" style={{ background: 'var(--surface-soft)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">

                <Panel title="Business" icon="building" onEdit={edit(1)}>
                  <Row label="Legal Name" value={biz.name} />
                  <Row label="Structure" value={ENTITY_LABELS[biz.entityType]} />
                  <Row label="FEIN" value={biz.fein} />
                  <Row label="Contractor Licence" value={biz.license} />
                  <Row label="Year Established" value={biz.yearEstablished} />
                  <Row label="Industry Experience" value={biz.industryExperience && `${biz.industryExperience} yrs`} />
                  <Row label="DBA" value={biz.hasDba ? biz.dbaName : ""} />
                  <Row label="Website" value={biz.website} />
                </Panel>

                <Panel title="Contact" icon="user" onEdit={edit(1)}>
                  <Row label="Phone" value={biz.phone} />
                  <Row label="Email" value={biz.email} />
                  <Row label="Address" value={biz.address} />
                  <Row label="City / State / Zip" value={[biz.city, biz.state, biz.zip].filter(Boolean).join(', ')} />
                  <Row label="Mailing" value={biz.mailSame === false
                    ? [biz.mailAddress, biz.mailCity, biz.mailState, biz.mailZip].filter(Boolean).join(', ')
                    : 'Same as physical'} />
                </Panel>

                <Panel title="Classifications" icon="doc" onEdit={edit(4)}>
                  <Row label="Primary Class" value={pz.mainClass && `${pz.mainClass} — ${pz.classDescription}`} />
                  <Row label="Industry" value={pz.industry} />
                  {classes.filter(c => c.code).map((c, i) => (
                    <Row key={i} label={`${c.code} — ${c.description || ''}`} value={c.payroll} />
                  ))}
                </Panel>

                <Panel title="Payroll" icon="money" onEdit={edit(4)}>
                  <Row label="Total Employees" value={totalEmployees || ''} />
                  <Row label="Total Annual Payroll" value={money(totalPayroll)} />
                  <Row label="Experience Mod" value={uw.experienceMod && `${uw.experienceMod} · ${uw.experienceModSource || 'Manual'}`} />
                  <Row label="Blanket Waiver" value={yesNo(stateCov.blanketWaiver)} />
                  <Row label="Officers" value={(cov.officers || []).map(o => `${o.name} (${o.status === 'exclude' ? 'Excluded' : 'Included'})`).join(', ')} />
                  <Row label="EL Limits" value={cov.elLimits} />
                  <Row label="Uses Subcontractors" value={yesNo(stateCov.usesSubs)} />
                </Panel>

                <Panel title="Coverage History" icon="clock" onEdit={edit(2)}>
                  <Row label="Coverage Status" value={COVERAGE_STATUS_LABELS[hist.coverageStatus] || '—'} />
                  <Row label="Prior Years" value={hist.priorYears} />
                  <Row label="Current Carrier" value={hist.currentCarrier} />
                  <Row label="Current Premium" value={hist.currentPremium} />
                  <Row label="Claims (4 yrs)" value={hist.claimCount ?? 0} />
                  {losses.filter(l => l.date).map((l, i) => (
                    <Row key={i} label={`Claim ${i + 1} · ${l.type || ''}`} value={l.amount} />
                  ))}
                </Panel>

                <Panel title="Credit Opportunity" icon="tools" onEdit={edit(5)}>
                  {/* Two of these answer with a frequency rather than
                      yes/no, so print the stored value as-is. */}
                  {Object.entries(UW_LABELS).map(([k, label]) => (
                    <Row key={k} label={label}
                      value={uw[k] === 'yes' || uw[k] === 'no' ? yesNo(uw[k]) : uw[k]} />
                  ))}
                </Panel>

                <Panel title="Markets Approached" icon="shield" onEdit={edit(6)}>
                  {selectedCarriers.length === 0
                    ? <Row label="Selected" value="None" />
                    : selectedCarriers.map(c => (
                      <Row key={c.id} label={c.name}
                        value={c.reco ? 'BTIS Serviced' : c.promo ? 'Promo active' : 'Selected'} />
                    ))}
                </Panel>

          </div>
        </div>

        {/* Sticky footer — outline action left, brand action right, the
            shape CBIC's preview uses. */}
        <div
          className="no-print shrink-0 px-5 py-3.5 flex items-center justify-between gap-3"
          style={{ borderTop: '1px solid var(--line)', background: 'var(--surface-card)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition hover:opacity-80"
            style={{ color: 'var(--ink-2)', border: '1px solid var(--line)', background: 'var(--surface-card)' }}
          >
            ← Back to Edit
          </button>
          <button
            type="button"
            onClick={() => setTimeout(() => window.print(), 50)}
            className="px-7 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
            style={{ background: BRAND_GRADIENT, boxShadow: '0 4px 14px rgba(92,46,212,0.3)' }}
          >
            Print / Save as PDF →
          </button>
        </div>

      </div>
    </div>
  )
}
