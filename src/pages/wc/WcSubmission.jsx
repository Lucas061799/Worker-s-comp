import { useState, useEffect, useMemo } from 'react'
import norbielinkLogo from '../../assets/norbielink-logo.png'
import norbielinkLogoDark from '../../assets/norbielink-logo-dark.png'
import btisLogo from '../../assets/btislogo.png'
import btisLogoDark from '../../assets/btislogo-dark.png'
import norbieface from '../../assets/norbieface.png'
import sidebarBg from '../../assets/sidebar-bg.png'
import sellMoreBg from '../../assets/sell-more-bg.png'
import { DemoJump } from '../../components/DemoJump'
import { premiumForCarrier } from './Indication'
import CrossSell from '../../components/CrossSell'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

// Step labels mirror the sidebar's Application + Carrier flow phases — every
// step is marked complete on this page, with "Application Summary" as the
// active tab.
const STEP_LABELS = [
  'Business info',
  'Coverage history',
  'Loss history',
  'State coverages',
  'Credit opportunity',
  'Carrier selection',
  'Carrier questions',
  'Quote & bind',
]

function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 2,
    color: ['#5C2ED4', '#A614C3', '#A78BFA', '#F0ABFC', '#7C3AED'][i % 5],
    size: 6 + Math.random() * 8,
    rotate: Math.random() * 360,
  }))
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: '-20px',
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.id % 3 === 0 ? '50%' : '2px',
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
            transform: `rotate(${p.rotate}deg)`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(100vh) rotate(720deg); }
        }
      `}</style>
    </div>
  )
}

function SectionCard({ title, icon, isDark = false, children }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: isDark ? '#252948' : 'white',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        {/* The teal chip GL uses on these summary panels — the one place
            the products step outside the purple. */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(115,201,183,0.12)' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="#73C9B7" strokeWidth={1.5} viewBox="0 0 24 24">
            {icon}
          </svg>
        </div>
        <h3 className="text-xs font-bold" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  )
}

function Field({ label, value, isDark = false }) {
  if (!value && value !== 0) return null
  return (
    <div
      className="flex items-center justify-between py-1.5"
      style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #F3F4F6' }}
    >
      <span className="text-[10px]" style={{ color: '#9CA3AF' }}>{label}</span>
      <span className="text-[10px] font-semibold text-right" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{value}</span>
    </div>
  )
}

const ICONS = {
  briefcase: <><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
  pin:       <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
  shield:    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
  check:     <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
  card:      <><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>,
}

export default function WcSubmission({ formData, summary, onBack, isDark = false, onToggleDark, demoJumps, demoActive }) {
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 4500)
    return () => clearTimeout(t)
  }, [])

  const quoteId = useMemo(() => 'WC' + Math.floor(20000000 + Math.random() * 80000000), [])
  const generatedAt = useMemo(
    () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    [],
  )

  const pageZero = formData.pageZero || {}
  const business = formData.business || {}
  const uw       = formData.underwriting || {}
  const bind     = formData.bind || {}
  const state    = pageZero.state || 'CA'
  const stateCov = formData.coverage?.[state] || {}
  const totalPayroll = (stateCov.classes || []).reduce((s, c) => {
    const n = parseInt(String(c.payroll || '').replace(/[^0-9]/g, ''), 10) || 0
    return s + n
  }, 0)

  const carrier   = summary?.carrier   || bind.selectedCarrier
  /* Price the carrier when nothing was written down. The receipt used to read
     whatever happened to be on the submission, so a route that never set a
     premium printed a bound policy with no number on it. */
  const premium   = summary?.premium ?? bind.premium
    ?? premiumForCarrier(formData, bind.selectedCarrierId || 'cna')

  const money = (n) => (n == null ? '—' : '$' + Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 }))

  return (
    <div className="flex flex-col h-screen font-montserrat overflow-hidden" style={{ background: isDark ? '#131629' : 'white' }}>
      {showConfetti && <Confetti />}

      {/* Top header */}
      <header
        className="no-print flex items-center justify-between shrink-0 z-10"
        style={{
          height: '56px',
          background: isDark ? '#191D35' : 'white',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6',
        }}
      >
        <div className="flex items-center h-full px-4 md:px-5 md:w-64 md:shrink-0 gap-2">
          <button onClick={onBack} className="md:hidden p-1.5 rounded-lg focus:outline-none" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button onClick={onBack} className="focus:outline-none">
            <img src={isDark ? norbielinkLogoDark : norbielinkLogo} alt="NorbieLink" className="h-7 md:h-8" />
          </button>
        </div>
        <div className="flex items-center gap-2 px-4 md:px-8">
          <span className="text-xs text-gray-400 tracking-wide">POWERED BY</span>
          <img src={isDark ? btisLogoDark : btisLogo} alt="btis" className="h-7" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Once it is bound there is nowhere to navigate — the steps are behind
            you and cannot be reopened — so the rail goes and only Norbie stays,
            floating. No Quick Jump and no theme toggle with it: the receipt is
            a record, not somewhere to change settings or skip elsewhere. The
            card shrinks to the avatar, since a full-width one with no rail
            around it reads as a piece of one that was taken away. CBIC's
            receipt does exactly this. */}
        <div className="no-print fixed bottom-4 left-4 w-56 z-30">
          <div className="group relative w-12">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'var(--glass)', border: '1.5px solid var(--line)', backdropFilter: 'blur(6px)' }}>
              <img src={norbieface} alt="Chat with Norbie" className="w-7 h-7 rounded-full object-cover" />
            </div>
            <span
              className="absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-lg px-3 py-1.5
                         opacity-0 -translate-x-1 pointer-events-none transition-all duration-150
                         group-hover:opacity-100 group-hover:translate-x-0"
              style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--line)',
                boxShadow: '0 6px 20px rgba(17,24,39,0.12)',
                fontSize: '12.5px',
                color: 'var(--ink-2)',
              }}
            >
              Chat with Norbie
            </span>
          </div>
        </div>

        {/* Main */}
        <main className="flex-1 overflow-y-auto custom-scroll bop-page" style={{ background: isDark ? '#131629' : 'white' }}>
          <div className="max-w-5xl 2xl:max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-8 space-y-5">

            {/* Submission Complete card */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: isDark ? '#1A1E38' : 'white',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6',
              }}
            >
              <div className="h-1" style={{ background: BRAND_GRADIENT }} />

              {/* Header row */}
              <div className="flex items-start gap-4 px-6 pt-5 pb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: isDark
                      ? 'linear-gradient(88.09deg, rgba(92,46,212,0.45) 0%, rgba(166,20,195,0.45) 100%)'
                      : 'linear-gradient(88.09deg, rgba(92,46,212,0.12) 0%, rgba(166,20,195,0.12) 100%)',
                  }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id="wcSubCheckG" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={isDark ? '#A78BFA' : '#5C2ED4'}/>
                        <stop offset="100%" stopColor={isDark ? '#E879F9' : '#A614C3'}/>
                      </linearGradient>
                    </defs>
                    <path d="M5 13l4 4L19 7" stroke="url(#wcSubCheckG)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold mb-1" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
                    {carrier ? 'Your application has been bound' : 'Your application has been submitted'}
                  </h1>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {carrier
                      ? <>Your policy with <span className="font-semibold">{carrier}</span> is bound. A receipt and policy documents will arrive by email shortly.</>
                      : 'Your application has been received and is being processed.'
                    }
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  title="Print / Save as PDF"
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all"
                  style={{
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E5E7EB',
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                  }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id="wcSubPrintG" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={isDark ? '#A78BFA' : '#5C2ED4'}/>
                        <stop offset="100%" stopColor={isDark ? '#E879F9' : '#A614C3'}/>
                      </linearGradient>
                    </defs>
                    <path stroke="url(#wcSubPrintG)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                  </svg>
                </button>
              </div>

              {/* Info row */}
              <div
                className="grid grid-cols-3"
                style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}` }}
              >
                {[
                  { label: 'Quote Number', value: quoteId,     gradient: true },
                  { label: 'Generated',    value: generatedAt },
                  { label: 'Status',       value: 'Bound',     pill: true },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className="px-5 py-4"
                    style={{ borderLeft: i === 0 ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}` }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{item.label}</p>
                    {item.pill ? (
                      <p
                        className="text-sm font-bold flex items-center gap-1.5"
                        style={{
                          background: BRAND_GRADIENT,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: '#5C2ED4', WebkitTextFillColor: 'initial' }}
                        />
                        {item.value}
                      </p>
                    ) : item.gradient ? (
                      <p
                        className="text-sm font-bold truncate font-mono"
                        style={{
                          background: BRAND_GRADIENT,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        {item.value}
                      </p>
                    ) : (
                      <p className="text-sm font-semibold truncate" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
                        {item.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Bound summary footer */}
              {carrier && (
                <div
                  className="flex items-center gap-4 flex-wrap px-6 py-4"
                  style={{
                    background: isDark ? '#1A1E38' : 'white',
                    borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}`,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
                      Policy bound with {carrier}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Class <span className="font-mono">{pageZero.mainClass || '—'} · {state}</span>
                      {uw.experienceMod && <> · E-Mod {uw.experienceMod}</>}
                      {' · '}Annual premium {money(premium)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Annual premium</div>
                    <div className="text-xl font-bold" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{money(premium)}</div>
                  </div>
                </div>
              )}

              {/* Full submission */}
              <div
                id="bop-submission-print-area"
                className="px-6 pb-6 pt-4 grid md:grid-cols-2 gap-3"
                style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6' }}
              >
                  <SectionCard title="Business" isDark={isDark} icon={ICONS.briefcase}>
                    <Field label="Legal name"      value={business.name} isDark={isDark} />
                    <Field label="Entity type"     value={business.entityType} isDark={isDark} />
                    <Field label="FEIN"            value={business.fein} isDark={isDark} />
                    <Field label="Year established" value={business.yearEstablished} isDark={isDark} />
                    <Field label="Effective date"  value={pageZero.effectiveDate} isDark={isDark} />
                  </SectionCard>

                  <SectionCard title="Address" isDark={isDark} icon={ICONS.pin}>
                    <Field label="Address" value={business.address} isDark={isDark} />
                    <Field label="City"    value={business.city} isDark={isDark} />
                    <Field label="State"   value={business.state || state} isDark={isDark} />
                    <Field label="Zip"     value={business.zip} isDark={isDark} />
                  </SectionCard>

                  <SectionCard title="Coverage" isDark={isDark} icon={ICONS.shield}>
                    <Field label="Primary class" value={pageZero.mainClass ? `${pageZero.mainClass} — ${pageZero.classDescription}` : null} isDark={isDark} />
                    <Field label="Total payroll" value={totalPayroll ? money(totalPayroll) : null} isDark={isDark} />
                    <Field label="Experience mod" value={uw.experienceMod} isDark={isDark} />
                    <Field label="Officers" value={`${((formData.coverage || {}).officers || []).length} listed`} isDark={isDark} />
                    <Field label="Blanket waiver" value={stateCov.blanketWaiver ? 'Yes' : 'No'} isDark={isDark} />
                  </SectionCard>

                  <SectionCard title="Bind" isDark={isDark} icon={ICONS.card}>
                    <Field label="Carrier"   value={carrier} isDark={isDark} />
                    <Field label="Quote #"   value={quoteId} isDark={isDark} />
                    <Field label="Premium"   value={money(premium)} isDark={isDark} />
                    <Field label="Status"    value="Bound" isDark={isDark} />
                  </SectionCard>
              </div>
            </div>


            {/* The block every product in the house closes on. It took the
                jungle banner's place: that one's only link led away from the
                receipt, this one leads to the next sale. */}
            <CrossSell />

            <div className="pb-8" />
          </div>
        </main>

      </div>
    </div>
  )
}
