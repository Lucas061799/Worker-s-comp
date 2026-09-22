import { CARRIERS } from '../pages/wc/CarrierSelection'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

const ICONS = {
  user:     'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  building: 'M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1M9 13h1m4 0h1M9 17h1m4 0h1',
  doc:      'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  shield:   'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  tools:    'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  clock:    'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
}

const ENTITY_LABELS = {
  corp: 'Corporation', llc: 'LLC', sole: 'Sole proprietor', partner: 'Partnership',
}

const UW_LABELS = {
  decline_any:      'Knockout Conditions Apply',
  safety_program:   'Written Safety Program',
  toolbox_talks:    'Toolbox Talks / Safety Meetings',
  osha_training:    'OSHA-Compliant Training',
  sub_certificates: 'Sub Certificates Collected',
  sub_25_pct:       'Subs > 25% of Receipts',
}

/* The teal chip all the products use on these summary panels — the one
   place they step outside the purple. */
function Panel({ title, icon = 'shield', children }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'white', border: '1px solid #E5E7EB', breakInside: 'avoid' }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(115,201,183,0.12)' }}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="#73C9B7" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[icon] || ICONS.shield} />
          </svg>
        </div>
        <h3 className="text-xs font-bold text-navy">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  )
}

function Row({ label, value }) {
  if (value === '' || value == null) return null
  return (
    <div className="flex items-start justify-between gap-4 py-1.5" style={{ borderBottom: '1px solid #F3F4F6' }}>
      <span className="text-[10px] leading-snug flex-1 min-w-0" style={{ color: '#9CA3AF' }}>{label}</span>
      <span className="text-[10px] font-semibold text-right leading-snug max-w-[55%] text-navy">{value}</span>
    </div>
  )
}

const yesNo = (v) => (v === 'yes' || v === true ? 'Yes' : v === 'no' || v === false ? 'No' : '')
const money = (n) => (n ? `$${Number(n).toLocaleString()}` : '')

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

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto uw-preview-backdrop"
      style={{ background: 'rgba(15,10,40,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="mx-auto my-8 px-4" style={{ maxWidth: 940 }} onClick={e => e.stopPropagation()}>

        <div id="submission-print-area" className="rounded-2xl overflow-hidden"
          style={{ background: 'white', border: '1px solid #F3F4F6' }}>
          <div className="h-1" style={{ background: BRAND_GRADIENT }} />

          {/* Header */}
          <div className="flex items-start gap-4 px-6 pt-5 pb-4">
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
              <h1 className="text-xl font-bold mb-1 text-navy">Application summary</h1>
              <p className="text-xs text-gray-400 leading-relaxed">
                {biz.name || 'This submission'} — everything captured so far.
              </p>
            </div>

            <div className="screen-only flex items-center gap-2 shrink-0">
              <button
                type="button"
                title="Print / Save as PDF"
                onClick={() => setTimeout(() => window.print(), 50)}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                style={{ background: 'white', border: '1px solid #E5E7EB' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="wcSumPrintG" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#5C2ED4" /><stop offset="100%" stopColor="#A614C3" />
                    </linearGradient>
                  </defs>
                  <path stroke="url(#wcSumPrintG)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </button>
              <button
                type="button"
                title="Close"
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                style={{ background: 'white', border: '1px solid #E5E7EB' }}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Facts strip */}
          <div className="grid grid-cols-3 divide-x divide-gray-100" style={{ borderTop: '1px solid #F3F4F6' }}>
            <div className="px-6 py-4">
              <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: '#9CA3AF' }}>
                Submission Number
              </p>
              <p className="text-sm font-bold text-gradient">WC-2026-048291</p>
            </div>
            <div className="px-6 py-4">
              <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: '#9CA3AF' }}>
                Effective Date
              </p>
              <p className="text-sm font-bold text-navy">{pz.effectiveDate || '—'}</p>
            </div>
            <div className="px-6 py-4">
              <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: '#9CA3AF' }}>
                Primary State
              </p>
              <p className="text-sm font-bold text-navy">{state}</p>
            </div>
          </div>

          {/* Panels */}
          <div style={{ borderTop: '1px solid #F3F4F6' }}>
            <div className="px-5 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                <Panel title="Business" icon="building">
                  <Row label="Legal Name" value={biz.name} />
                  <Row label="Structure" value={ENTITY_LABELS[biz.entityType]} />
                  <Row label="FEIN" value={biz.fein} />
                  <Row label="Contractor Licence" value={biz.license} />
                  <Row label="Years in Business" value={biz.yearsInBusiness} />
                </Panel>

                <Panel title="Contact" icon="user">
                  <Row label="Phone" value={biz.phone} />
                  <Row label="Email" value={biz.email} />
                  <Row label="Address" value={biz.address} />
                  <Row label="City / State / Zip" value={[biz.city, biz.state, biz.zip].filter(Boolean).join(', ')} />
                  <Row label="Mailing" value={biz.mailSame === false
                    ? [biz.mailAddress, biz.mailCity, biz.mailState, biz.mailZip].filter(Boolean).join(', ')
                    : 'Same as physical'} />
                </Panel>

                <Panel title="Classifications" icon="doc">
                  <Row label="Primary Class" value={pz.mainClass && `${pz.mainClass} — ${pz.classDescription}`} />
                  <Row label="Industry" value={pz.industry} />
                  {classes.filter(c => c.code).map((c, i) => (
                    <Row key={i} label={`${c.code} — ${c.description || ''}`} value={c.payroll} />
                  ))}
                </Panel>

                <Panel title="Payroll" icon="shield">
                  <Row label="Total Employees" value={totalEmployees || ''} />
                  <Row label="Total Annual Payroll" value={money(totalPayroll)} />
                  <Row label="Experience Mod" value={uw.experienceMod && `${uw.experienceMod} · ${uw.experienceModSource || 'Manual'}`} />
                  <Row label="Blanket Waiver" value={yesNo(stateCov.blanketWaiver)} />
                  <Row label="Officer Election" value={stateCov.officerElection === 'elect' ? 'Elected change' : 'Statutory default'} />
                </Panel>

                <Panel title="Coverage History" icon="clock">
                  {priorTerms.filter(t => t.carrier).map((t, i) => (
                    <Row key={i} label={t.carrier} value={[t.effective, t.expiration].filter(Boolean).join(' – ')} />
                  ))}
                  <Row label="Claims (4 yrs)" value={hist.claimCount ?? 0} />
                  {losses.filter(l => l.date).map((l, i) => (
                    <Row key={i} label={`Claim ${i + 1} · ${l.type || ''}`} value={[l.amount, l.status].filter(Boolean).join(' · ')} />
                  ))}
                </Panel>

                <Panel title="Underwriting" icon="tools">
                  {Object.entries(UW_LABELS).map(([k, label]) => (
                    <Row key={k} label={label} value={yesNo(uw[k])} />
                  ))}
                </Panel>

                <Panel title="Markets Approached" icon="shield">
                  {selectedCarriers.length === 0
                    ? <Row label="Selected" value="None" />
                    : selectedCarriers.map(c => (
                      <Row key={c.id} label={c.name}
                        value={c.reco ? 'BTIS Serviced' : c.promo ? 'Promo active' : 'Selected'} />
                    ))}
                </Panel>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
