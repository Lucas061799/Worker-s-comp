import norbielinkLogo from '../assets/norbielink-logo.png'
import btisLogo from '../assets/btislogo.png'

/* ─── Micro helpers ─────────────────────────────────────────────────────── */
const GR = 'linear-gradient(88deg,#5C2ED4 0%,#A614C3 100%)'

function Row({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex gap-1.5 py-[3px]" style={{ borderBottom: '1px solid #F3F4F6' }}>
      <span className="text-[9px] font-semibold uppercase tracking-wide shrink-0 pt-px" style={{ color: '#9CA3AF', width: '7rem' }}>{label}</span>
      <span className="text-[10px] font-medium leading-tight" style={{ color: '#111827' }}>{value}</span>
    </div>
  )
}

function YNRow({ label, value }) {
  if (!value) return null
  const yes = value === 'Yes'
  return (
    <div className="flex items-center gap-1.5 py-[3px]" style={{ borderBottom: '1px solid #F3F4F6' }}>
      <span className="text-[9px] font-semibold uppercase tracking-wide shrink-0" style={{ color: '#9CA3AF', width: '7rem' }}>{label}</span>
      <span className="px-1.5 py-px rounded-full text-[9px] font-bold" style={{ background: yes ? 'rgba(52,211,153,0.12)' : 'rgba(156,163,175,0.12)', color: yes ? '#059669' : '#6B7280' }}>{value}</span>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB', breakInside: 'avoid' }}>
      <div>
        <div style={{ height: 2, background: GR }} />
        <div className="px-3 py-1.5" style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
          <span className="text-[9px] font-bold tracking-widest uppercase" style={{ background: GR, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{title}</span>
        </div>
      </div>
      <div className="px-3 py-1.5">{children}</div>
    </div>
  )
}

function Sub({ label }) {
  return (
    <div className="text-[9px] font-bold uppercase tracking-wide pt-1.5 pb-0.5" style={{ background: GR, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{label}</div>
  )
}

const ELIG = [
  ['q1','Long-haul trucking (>300 mi)'],['q2','Hazardous materials'],
  ['q3','Semi-trucks / trailers'],['q4','Snow plowing'],
  ['q5','2+ losses in 3 yrs'],['q6','Rideshare (Uber/Lyft)'],
  ['q7','Food/beverage delivery'],['q8','Drivers under 21'],
  ['q9','DUI/DWI past 5 yrs'],['q10','Suspended license 3 yrs'],
  ['q11','Outside US/Canada'],['q12','Racing / exhibition'],
  ['q13','Salvage / rebuilt title'],['q14','Towing / recovery'],
  ['q15','Mobile business'],
]

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function PrintSummary({ formData, visible, onClose }) {
  if (!visible) return null

  const ap  = formData.applicant || {}
  const veh = formData.vehicles?.vehicles || []
  const drv = formData.drivers?.drivers || []
  const eli = formData.eligibility || {}
  const cov = formData.coverage || {}
  const ai  = formData.additionalInsured || {}
  const lp  = formData.lossPayee || {}
  const ph  = formData.priorHistory || {}
  const cl  = formData.claims || {}
  const pay = formData.payment || {}
  const bl  = formData.blanket || {}
  const cmt = formData.comments?.text || ''
  const today = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })

  return (
    <div id="print-summary" className="fixed inset-0 z-[9999] overflow-y-auto" style={{ background: 'white', fontFamily: "'Montserrat',sans-serif" }}>

      {/* Toolbar */}
      <div className="no-print sticky top-0 z-10 flex items-center justify-between px-6 py-2.5" style={{ background:'white', borderBottom:'1px solid #E5E7EB', boxShadow:'0 1px 8px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: GR }} />
          <span className="text-sm font-semibold" style={{ color:'#111827' }}>Application Summary{ap.namedInsured ? ` — ${ap.namedInsured}` : ''}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: GR, boxShadow:'0 2px 10px rgba(92,46,212,0.3)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Print / Save as PDF
          </button>
          <button onClick={onClose} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium" style={{ color:'#6B7280', border:'1px solid #E5E7EB' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            Close
          </button>
        </div>
      </div>

      {/* ── Print body ── */}
      <div className="mx-auto px-8 py-6" style={{ maxWidth: 900 }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '2px solid #F3F4F6' }}>
          <img src={norbielinkLogo} alt="NorbieLink" className="h-7" />
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest uppercase" style={{ color:'#9CA3AF' }}>Commercial Auto — Application Summary</p>
            <p className="text-[9px] mt-0.5" style={{ color:'#C4B5D4' }}>Submission ID #CA0094894 · Submitted {today}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] tracking-wide" style={{ color:'#9CA3AF' }}>POWERED BY</span>
            <img src={btisLogo} alt="btis" className="h-6" />
          </div>
        </div>

        {/* Hero strip */}
        <div className="rounded-xl mb-4 overflow-hidden" style={{ border:'1px solid #E5E7EB' }}>
          <div style={{ height: 3, background: GR }} />
          <div className="px-5 py-3 flex items-center gap-8">
            <div>
              <p className="text-[8px] font-bold tracking-widest uppercase mb-0.5" style={{ color:'#9CA3AF' }}>Named Insured</p>
              <p className="text-base font-bold" style={{ color:'#111827' }}>{ap.namedInsured || '—'}</p>
            </div>
            {[['Entity', ap.entity], ['Effective', ap.effectiveDate], ['Phone', ap.phone], ['Email', ap.email]].filter(([,v])=>v).map(([k,v])=>(
              <div key={k}>
                <p className="text-[8px] font-bold tracking-widest uppercase mb-0.5" style={{ color:'#9CA3AF' }}>{k}</p>
                <p className="text-[11px] font-medium" style={{ color:'#374151' }}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 2-column grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">

          {/* Applicant */}
          <Card title="1 · Applicant Information">
            <Row label="Address" value={[ap.address, ap.suite].filter(Boolean).join(', ')} />
            <Row label="City/State/Zip" value={[ap.city, ap.state, ap.zip].filter(Boolean).join(', ')} />
            <Row label="Years in Business" value={ap.yearsInBusiness} />
            <Row label="Business Desc." value={ap.businessDesc} />
          </Card>

          {/* Coverage */}
          <Card title="5 · Coverage">
            <Row label="Liability Limit" value={cov.liabilityLimit} />
            <Row label="Med. Payments" value={cov.medicalPayments} />
            <Row label="Uninsured UM" value={cov.uninsuredMotorist} />
            <Row label="Hired Auto" value={cov.hiredAuto} />
            <Row label="Non-Owned Auto" value={cov.nonOwnedAuto} />
            <Row label="Towing & Labor" value={cov.towingLabor} />
          </Card>

          {/* Vehicles */}
          <Card title="2 · Vehicles">
            {veh.length === 0
              ? <p className="text-[10px] py-1" style={{ color:'#9CA3AF' }}>No vehicles added.</p>
              : veh.map((v,i) => (
                <div key={i}>
                  {i > 0 && <div className="my-1" style={{ borderTop:'1px solid #E5E7EB' }} />}
                  <Sub label={`Vehicle #${i+1}`} />
                  <Row label="Year/Make/Model" value={[v.year,v.make,v.model].filter(Boolean).join(' ')} />
                  <Row label="VIN" value={v.vin} />
                  <Row label="Use / Radius" value={[v.use, v.radius ? `${v.radius} mi` : null].filter(Boolean).join(' · ')} />
                  <Row label="GVW / Zip" value={[v.gvw, v.garagingZip].filter(Boolean).join(' / ')} />
                </div>
              ))
            }
          </Card>

          {/* Eligibility */}
          <Card title="4 · Eligibility">
            <div className="grid grid-cols-2 gap-x-3">
              {ELIG.map(([k,q]) => eli[k] ? (
                <YNRow key={k} label={q} value={eli[k]} />
              ) : null)}
            </div>
          </Card>

          {/* Drivers */}
          <Card title="3 · Drivers">
            {drv.length === 0
              ? <p className="text-[10px] py-1" style={{ color:'#9CA3AF' }}>No drivers added.</p>
              : drv.map((d,i) => (
                <div key={i}>
                  {i > 0 && <div className="my-1" style={{ borderTop:'1px solid #E5E7EB' }} />}
                  <Sub label={`Driver #${i+1}`} />
                  <Row label="Name" value={[d.firstName,d.lastName].filter(Boolean).join(' ')} />
                  <Row label="DOB / State" value={[d.dob, d.licenseState].filter(Boolean).join(' / ')} />
                  <Row label="License #" value={d.licenseNumber} />
                  <Row label="Yrs Licensed" value={d.yearsLicensed} />
                </div>
              ))
            }
          </Card>

          {/* Prior History */}
          <Card title="8 · Prior Insurance">
            <YNRow label="Currently insured?" value={ph.hasCurrent} />
            <Row label="Prior Carrier" value={ph.carrier} />
            <Row label="Policy #" value={ph.policyNumber} />
            <Row label="Expiration" value={ph.expirationDate} />
            <YNRow label="Continuous?" value={ph.continuous} />
            <Row label="Lapse Reason" value={ph.lapseReason} />
          </Card>

          {/* Additional Insured */}
          <Card title="6 · Additional Insured">
            <YNRow label="Has additionals?" value={ai.hasAdditional} />
            {bl.blanketAI  && <Row label="Blanket AI"  value="Selected" />}
            {bl.blanketWOS && <Row label="Blanket WOS" value="Selected" />}
            {(ai.insureds||[]).map((ins,i) => (
              <div key={i}>
                <Sub label={`Insured #${i+1}`} />
                <Row label="Name" value={ins.name} />
                <Row label="Address" value={[ins.address,ins.city,ins.state,ins.zip].filter(Boolean).join(', ')} />
                <YNRow label="WOS?" value={ins.waiverSubrogation} />
              </div>
            ))}
          </Card>

          {/* Claims */}
          <Card title="9 · Claims">
            <YNRow label="Claims (3 yrs)?" value={cl.hasClaims} />
            {(cl.claims||[]).map((c,i) => (
              <div key={i}>
                <Sub label={`Claim #${i+1}`} />
                <Row label="Date / Type" value={[c.date,c.type].filter(Boolean).join(' · ')} />
                <Row label="Description" value={c.description} />
                <Row label="Amount Paid" value={c.amount} />
              </div>
            ))}
          </Card>

          {/* Loss Payee */}
          <Card title="7 · Loss Payee">
            <YNRow label="Has payees?" value={lp.hasPayee} />
            {(lp.payees||[]).map((p,i) => (
              <div key={i}>
                <Sub label={`Payee #${i+1}`} />
                <Row label="Name" value={p.name} />
                <Row label="Address" value={[p.address,p.city,p.state,p.zip].filter(Boolean).join(', ')} />
                <Row label="Type" value={p.type} />
              </div>
            ))}
          </Card>

          {/* Payment */}
          <Card title="10 · Payment Plan">
            <YNRow label="Paperless?" value={pay.paperless} />
            <YNRow label="Reminder?" value={pay.reminder} />
            <Row label="Plan Duration" value={pay.planDuration} />
            <Row label="Selected Plan" value={pay.planOption} />
          </Card>

        </div>

        {/* Comments */}
        {cmt && (
          <Card title="Comments / Special Instructions">
            <p className="text-[10px] leading-relaxed py-1" style={{ color:'#374151' }}>{cmt}</p>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop:'1px solid #E5E7EB' }}>
          <p className="text-[8px]" style={{ color:'#9CA3AF' }}>Generated by NorbieLink · {today}</p>
          <p className="text-[8px]" style={{ color:'#9CA3AF' }}>Submission #CA0094894 · Confidential</p>
        </div>

      </div>
    </div>
  )
}
