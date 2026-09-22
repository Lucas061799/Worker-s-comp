import norbielinkLogo from '../assets/norbielink-logo.png'
import btisLogo from '../assets/btislogo.png'
import { CARRIERS } from '../pages/wc/CarrierSelection'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

const ENTITY_LABELS = {
  corp: 'Corporation', llc: 'LLC', sole: 'Sole proprietor', partner: 'Partnership',
}

const UW_LABELS = {
  decline_any:      'Knockout conditions apply',
  safety_program:   'Written safety program',
  toolbox_talks:    'Toolbox talks / safety meetings',
  osha_training:    'OSHA-compliant training',
  sub_certificates: 'Sub certificates collected',
  sub_25_pct:       'Subs > 25% of receipts',
}

/* Same row shape as the Application Overview modal — label left,
   value right, hairline underneath. */
function Row({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex items-start justify-between gap-4 py-1.5" style={{ borderBottom: '1px solid #F3F4F6' }}>
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span className="text-xs font-semibold text-gray-800 text-right">{value}</span>
    </div>
  )
}

function YNRow({ label, value }) {
  if (value === undefined || value === null || value === '') return null
  const yes = value === 'yes' || value === 'Yes' || value === true
  return (
    <div className="flex items-center justify-between gap-4 py-1.5" style={{ borderBottom: '1px solid #F3F4F6' }}>
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0"
        style={yes
          ? { background: 'rgba(92,46,212,0.08)', border: '1px solid rgba(92,46,212,0.18)', color: '#5C2ED4' }
          : { background: 'white', border: '1px solid #E5E7EB', color: '#6B7280' }}>
        {yes ? 'Yes' : 'No'}
      </span>
    </div>
  )
}

/* FieldGroup vocabulary: SectionLabel above, plain bordered card below. */
function Section({ title, children }) {
  return (
    <div style={{ breakInside: 'avoid' }}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-2.5 pl-0.5">
        {title}
      </div>
      <div className="rounded-xl px-4 py-3" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
        {children}
      </div>
    </div>
  )
}

function Sub({ label }) {
  return (
    <p className="text-[11px] font-semibold text-gray-600 pt-2.5 pb-0.5 first:pt-0">{label}</p>
  )
}

function Empty({ children }) {
  return <p className="text-xs text-gray-400 py-1">{children}</p>
}

export default function PrintSummary({ formData, visible, onClose }) {
  if (!visible) return null

  const pz   = formData.pageZero     || {}
  const biz  = formData.business     || {}
  const hist = formData.history      || {}
  const uw   = formData.underwriting || {}
  const sel  = formData.carrierSelection?.checked || {}
  const state = pz.state || 'CA'
  const stateCov = (formData.coverage || {})[state] || {}
  const classes = stateCov.classes || []
  const priorTerms = hist.priorTerms || []
  const losses = hist.losses || []

  const totalPayroll = classes.reduce((sum, c) => {
    const n = parseInt(String(c.payroll || '').replace(/[^\d]/g, ''), 10)
    return sum + (Number.isFinite(n) ? n : 0)
  }, 0)
  const totalEmployees = classes.reduce((sum, c) => sum + (parseInt(c.employees, 10) || 0), 0)

  const selectedCarriers = CARRIERS.filter(c => sel[c.id] !== false)
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const heroFacts = [
    ['Entity',    ENTITY_LABELS[biz.entityType]],
    ['State',     pz.state],
    ['Effective', pz.effectiveDate],
    ['E-Mod',     uw.experienceMod],
    ['Payroll',   totalPayroll ? `$${totalPayroll.toLocaleString()}` : null],
  ].filter(([, v]) => v)

  return (
    <div id="submission-print-area" className="fixed inset-0 z-[9999] overflow-y-auto"
      style={{ background: 'white', fontFamily: "'Montserrat',sans-serif" }}>

      {/* Toolbar — screen only */}
      <div className="no-print sticky top-0 z-10 flex items-center justify-between px-6 py-3"
        style={{ background: 'white', borderBottom: '1px solid #F3F4F6' }}>
        <p className="text-sm font-bold text-gray-900">
          Application summary{biz.name ? ` — ${biz.name}` : ''}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 inline-flex items-center justify-center rounded-xl text-sm font-semibold"
            style={{ background: 'white', border: '1.5px solid #E5E7EB', color: '#6B7280' }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="h-10 px-6 inline-flex items-center gap-2 justify-center rounded-xl text-sm font-bold text-white transition hover:opacity-90"
            style={{ background: BRAND_GRADIENT, boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
            </svg>
            Print / Save as PDF
          </button>
        </div>
      </div>

      <div className="mx-auto px-8 py-8" style={{ maxWidth: 940 }}>

        {/* Header — product kicker over the brand marks */}
        <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '1px solid #D1D5DB' }}>
          <img src={norbielinkLogo} alt="NorbieLink" className="h-8" />
          <div className="text-center">
            <p className="text-xs font-bold tracking-widest uppercase"
              style={{ background: BRAND_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Workers' Compensation
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              WC-2026-048291 · Generated {today}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 tracking-wide font-semibold">POWERED BY</span>
            <img src={btisLogo} alt="btis" className="h-7" />
          </div>
        </div>

        {/* Hero — gradient-bordered figures strip, the im-figures treatment */}
        <div className="rounded-xl px-5 py-4 mb-7 flex items-center gap-10 flex-wrap"
          style={{ background: '#F9FAFB', border: '1px solid rgba(92,46,212,0.18)' }}>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-1">Named insured</p>
            <p className="text-lg font-bold text-gray-900 leading-tight">{biz.name || '—'}</p>
          </div>
          {heroFacts.map(([k, v]) => (
            <div key={k}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-1">{k}</p>
              <p className="text-sm font-semibold text-gray-700">{v}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-6">

          <Section title="Business information">
            <Row label="Legal name" value={biz.name} />
            <Row label="Entity" value={ENTITY_LABELS[biz.entityType]} />
            <Row label="FEIN" value={biz.fein} />
            <Row label="Address" value={[biz.address, biz.city, biz.state, biz.zip].filter(Boolean).join(', ')} />
            <Row label="Mailing" value={biz.mailSame === false
              ? [biz.mailAddress, biz.mailCity, biz.mailState, biz.mailZip].filter(Boolean).join(', ')
              : 'Same as physical'} />
            <Row label="CSLB license" value={biz.license} />
            <Row label="Years in business" value={biz.yearsInBusiness} />
            <Row label="Phone" value={biz.phone} />
            <Row label="Email" value={biz.email} />
          </Section>

          <Section title={`Classes & payroll — ${state}`}>
            <Row label="Primary class" value={pz.mainClass && `${pz.mainClass} — ${pz.classDescription}`} />
            <Row label="Industry" value={pz.industry} />
            {classes.length === 0
              ? <Empty>No classes scheduled.</Empty>
              : classes.map((c, i) => (
                <div key={i}>
                  <Sub label={`Class ${i + 1}`} />
                  <Row label="Code" value={c.code} />
                  <Row label="Description" value={c.description} />
                  <Row label="Employees" value={c.employees} />
                  <Row label="Annual payroll" value={c.payroll} />
                </div>
              ))
            }
            <Row label="Total employees" value={totalEmployees || null} />
            <Row label="Total payroll" value={totalPayroll ? `$${totalPayroll.toLocaleString()}` : null} />
          </Section>

          <Section title="Coverage history">
            {priorTerms.length === 0
              ? <Empty>No prior terms listed.</Empty>
              : priorTerms.map((t, i) => (
                <div key={i}>
                  <Sub label={`Term ${i + 1}`} />
                  <Row label="Carrier" value={t.carrier} />
                  <Row label="Effective" value={t.effective} />
                  <Row label="Expiration" value={t.expiration} />
                  <Row label="Premium" value={t.premium} />
                </div>
              ))
            }
            <Row label="Claims (4 yrs)" value={hist.claimCount ?? 0} />
          </Section>

          <Section title="Owners & officers">
            <Row label="Entity rule" value={ENTITY_LABELS[biz.entityType]} />
            <Row label="Officer election" value={stateCov.officerElection === 'elect' ? 'Elected change' : 'Statutory default'} />
            <Row label="Experience mod" value={uw.experienceMod && `${uw.experienceMod} · ${uw.experienceModSource || 'Manual'}`} />
            <YNRow label="Blanket waiver" value={stateCov.blanketWaiver} />
          </Section>

          <Section title="Underwriting">
            {Object.entries(UW_LABELS).every(([k]) => !uw[k])
              ? <Empty>Not yet answered.</Empty>
              : Object.entries(UW_LABELS).map(([k, label]) =>
                  uw[k] ? <YNRow key={k} label={label} value={uw[k]} /> : null
                )
            }
          </Section>

          <Section title="Markets approached">
            {selectedCarriers.length === 0
              ? <Empty>No markets selected.</Empty>
              : selectedCarriers.map(c => (
                <Row key={c.id} label={c.name}
                  value={c.reco ? 'BTIS Serviced' : c.promo ? 'Promo active' : 'Selected'} />
              ))
            }
          </Section>

          {losses.length > 0 && (
            <Section title="Loss detail">
              {losses.map((l, i) => (
                <div key={i}>
                  <Sub label={`Claim ${i + 1}`} />
                  <Row label="Date of loss" value={l.date} />
                  <Row label="Type" value={l.type} />
                  <Row label="Amount paid" value={l.amount} />
                  <Row label="Status" value={l.status} />
                </div>
              ))}
            </Section>
          )}

        </div>

        <div className="mt-8 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid #F3F4F6' }}>
          <p className="text-[11px] text-gray-400">Generated by NorbieLink · {today}</p>
          <p className="text-[11px] text-gray-400">WC-2026-048291 · Confidential</p>
        </div>

      </div>
    </div>
  )
}
