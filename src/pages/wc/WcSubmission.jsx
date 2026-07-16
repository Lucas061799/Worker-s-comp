import { useState, useEffect, useMemo } from 'react'
import norbielinkLogo from '../../assets/norbielink-logo.png'
import norbielinkLogoDark from '../../assets/norbielink-logo-dark.png'
import btisLogo from '../../assets/btislogo.png'
import btisLogoDark from '../../assets/btislogo-dark.png'
import norbieface from '../../assets/norbieface.png'
import sidebarBg from '../../assets/sidebar-bg.png'
import iconGL from '../../assets/icon-general-liability.png'
import iconBO from '../../assets/icon-business-owner.png'
import iconWorker from '../../assets/icon-worker.png'
import sellMoreBg from '../../assets/sell-more-bg.png'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

// Step labels mirror the sidebar's Application + Carrier flow phases — every
// step is marked complete on this page, with "Application Summary" as the
// active tab.
const STEP_LABELS = [
  'Business info',
  'Coverage history',
  'State coverages',
  'Underwriting questions',
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
    color: ['#5C2ED4', '#A614C3', '#ACD697', '#75C9B7', '#FFD700', '#FF6B6B', '#4ECDC4'][i % 7],
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

export default function WcSubmission({ formData, summary, onBack, isDark = false, onToggleDark }) {
  const [showConfetti, setShowConfetti] = useState(true)
  const [summaryOpen, setSummaryOpen] = useState(false)

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
  const premium   = summary?.premium   || bind.premium

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
        {/* Sidebar — every step done, "Application Summary" active */}
        <aside
          className="no-print hidden md:flex w-64 2xl:w-72 flex-col h-full shrink-0 relative overflow-hidden"
          style={{
            background: isDark ? '#191D35' : 'white',
            borderRight: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #F3F4F6',
          }}
        >
          <div className="px-5 pt-5 pb-3 relative z-10">
            <h2 className="text-base font-bold leading-tight" style={{ color: isDark ? '#F9FAFB' : undefined }}>Workers' Compensation</h2>
            <p className="text-xs mt-0.5 font-mono" style={{ color: '#9CA3AF' }}>Quote Number: {quoteId}</p>
            <div className="mt-3" style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6'}` }} />
          </div>

          <nav className="flex-1 py-1 px-3 overflow-y-auto sidebar-nav relative z-10">
            {[...STEP_LABELS, 'Application Summary'].map((label, i) => {
              const isLast = i === STEP_LABELS.length
              return (
                <div key={label} className="relative mb-0.5">
                  {isLast && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full z-20"
                      style={{ background: 'linear-gradient(180deg, #5C2ED4 0%, #A614C3 100%)' }} />
                  )}
                  <div
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    style={isLast
                      ? isDark
                        ? { background: 'linear-gradient(180deg, rgba(42,28,70,0.28) 0%, rgba(166,20,195,0.68) 100%)', border: '1.5px solid rgba(166,20,195,0.65)', boxShadow: '0 4px 24px rgba(166,20,195,0.25)' }
                        : { background: '#ffffff', border: '1.5px solid #7C3AED', boxShadow: '0 2px 12px rgba(92,46,212,0.12)' }
                      : { border: '1.5px solid transparent' }}
                  >
                    <span
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                      style={{ background: isLast
                        ? isDark ? 'rgba(255,255,255,0.2)' : BRAND_GRADIENT
                        : isDark ? 'rgba(166,20,195,0.28)' : 'rgba(166,20,195,0.10)' }}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                        <defs>
                          <linearGradient id={`wcSubStep${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#5C2ED4"/>
                            <stop offset="100%" stopColor="#A614C3"/>
                          </linearGradient>
                        </defs>
                        <path d="M2.5 7l3 3 6-6"
                          stroke={isLast ? '#FFFFFF' : (isDark ? '#D8A8F0' : `url(#wcSubStep${i})`)}
                          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <span
                      className={`text-xs truncate ${isLast ? 'font-semibold' : 'font-medium'}`}
                      style={isLast
                        ? isDark
                          ? { color: '#FFFFFF' }
                          : { background: BRAND_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }
                        : { color: isDark ? '#9CA3AF' : '#6B7280' }
                      }
                    >
                      {label}
                    </span>
                  </div>
                </div>
              )
            })}
          </nav>

          {/* Norbie */}
          <div className="px-3 pb-2 relative z-10">
            <div className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)', border: isDark ? '1.5px solid transparent' : '1.5px solid #E5E7EB' }}>
              <img src={norbieface} alt="Norbie" className="w-8 h-8 rounded-full shrink-0 object-cover" />
              <div>
                <p className="text-sm font-normal" style={{ color: isDark ? '#F9FAFB' : '#374151' }}>Chat with Norbie</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>AI Assistant</p>
              </div>
            </div>
          </div>

          {/* Dark mode */}
          <div className="px-3 pb-4 relative z-10">
            <button onClick={onToggleDark} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
              style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)', border: isDark ? '1.5px solid transparent' : '1.5px solid #E5E7EB' }}>
              <div className="w-10 h-5 rounded-full relative transition-all shrink-0"
                style={{ background: isDark ? '#E8622A' : '#D1D5DB' }}>
                <div className="absolute top-0.5 w-4 h-4 rounded-full shadow transition-all flex items-center justify-center"
                  style={{ left: isDark ? '22px' : '2px', background: 'white' }}>
                  {isDark ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5"/>
                      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                  )}
                </div>
              </div>
              <span style={{ fontSize: '14.5px', fontWeight: 400, color: isDark ? '#F9FAFB' : '#6B7280' }}>Dark Mode</span>
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-full pointer-events-none select-none">
            <img src={sidebarBg} alt="" className="absolute bottom-0 left-0 w-full h-full object-cover object-bottom"
              style={{ opacity: isDark ? 0.6 : 0.58, clipPath: 'inset(0 1px 0 0)' }} />
          </div>
        </aside>

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
                    Workers' Compensation Application Summary
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

              {/* Expandable full submission */}
              <button
                onClick={() => setSummaryOpen(o => !o)}
                className="w-full flex items-center justify-between px-6 py-3.5 border-t transition-all"
                style={{
                  borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6',
                  background: summaryOpen
                    ? isDark ? 'rgba(92,46,212,0.18)' : 'linear-gradient(88.09deg, rgba(92,46,212,0.06) 0%, rgba(166,20,195,0.06) 100%)'
                    : isDark ? 'rgba(92,46,212,0.08)' : 'linear-gradient(88.09deg, rgba(92,46,212,0.03) 0%, rgba(166,20,195,0.03) 100%)',
                }}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id="wcSubExpandG" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={isDark ? '#A78BFA' : '#5C2ED4'}/>
                        <stop offset="100%" stopColor={isDark ? '#E879F9' : '#A614C3'}/>
                      </linearGradient>
                    </defs>
                    <path stroke="url(#wcSubExpandG)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                  </svg>
                  <span
                    className="text-xs font-semibold"
                    style={{
                      background: BRAND_GRADIENT,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Print &amp; View Full Submission
                  </span>
                </span>
                <svg
                  className="w-4 h-4 shrink-0 transition-transform"
                  fill="none" viewBox="0 0 24 24"
                  style={{ transform: summaryOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <path stroke="url(#wcSubExpandG)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {summaryOpen && (
                <div
                  id="bop-submission-print-area"
                  className="px-6 pb-6 pt-4 grid md:grid-cols-2 gap-3"
                  style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6' }}
                >
                  <SectionCard title="Business" isDark={isDark} icon={ICONS.briefcase}>
                    <Field label="Legal name"      value={business.name} isDark={isDark} />
                    <Field label="Entity type"     value={business.entityType} isDark={isDark} />
                    <Field label="FEIN"            value={business.fein} isDark={isDark} />
                    <Field label="Years in biz"    value={business.yearsInBusiness} isDark={isDark} />
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
                    <Field label="Officer election" value={stateCov.officerElection === 'elect' ? 'Elected' : 'Default'} isDark={isDark} />
                    <Field label="Blanket waiver" value={stateCov.blanketWaiver ? 'Yes' : 'No'} isDark={isDark} />
                  </SectionCard>

                  <SectionCard title="Bind" isDark={isDark} icon={ICONS.card}>
                    <Field label="Carrier"   value={carrier} isDark={isDark} />
                    <Field label="Quote #"   value={quoteId} isDark={isDark} />
                    <Field label="Premium"   value={money(premium)} isDark={isDark} />
                    <Field label="Status"    value="Bound" isDark={isDark} />
                  </SectionCard>
                </div>
              )}
            </div>

            {/* Cross-sell */}
            <div
              className="rounded-2xl p-5 md:p-6"
              style={{
                background: isDark ? '#1A1E38' : 'white',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6',
              }}
            >
              <div className="mb-4">
                <h3 className="text-lg md:text-xl font-bold mb-1" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
                  Round out the coverage. {' '}
                  <span
                    style={{
                      background: BRAND_GRADIENT,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Why wait?
                  </span>
                </h3>
                <p className="text-xs md:text-sm text-gray-400">Client info is already saved — adding coverages takes minutes.</p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    name: 'General Liability',
                    desc: 'Third-party bodily injury & property damage',
                    price: '$820/year',
                    badge: 'TOP PICK',
                    badgeBg: BRAND_GRADIENT,
                    iconImg: iconGL,
                  },
                  {
                    name: 'Business Owners Policy',
                    desc: 'GL + property + business income in one bundle',
                    price: '$1,450/year',
                    badge: 'RECOMMENDED',
                    badgeBg: '#73C9B7',
                    iconImg: iconBO,
                  },
                  {
                    name: 'Commercial Auto',
                    desc: 'Coverage for vehicles used for business',
                    price: '$960/year',
                    badge: 'BEST VALUE',
                    badgeBg: '#73C9B7',
                    iconImg: iconWorker,
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="rounded-2xl overflow-hidden hover:shadow-sm transition"
                    style={{ border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #F3F4F6' }}
                  >
                    <div className="flex items-center gap-3 px-4 py-4">
                      <div
                        className="cross-sell-icon-tile w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: isDark ? 'rgba(92,46,212,0.15)' : 'rgba(92,46,212,0.06)' }}
                      >
                        <img src={item.iconImg} alt={item.name} className="w-6 h-6 object-contain" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <p className="text-sm font-bold leading-tight" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{item.name}</p>
                          <span
                            className="text-[8px] font-bold px-1.5 py-0.5 rounded-md text-white shrink-0"
                            style={{ background: item.badgeBg }}
                          >
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-snug">{item.desc}</p>
                      </div>

                      <div className="hidden md:flex items-center gap-4 shrink-0 ml-2">
                        <div className="text-right">
                          <p
                            className="text-base font-bold leading-tight"
                            style={{
                              background: BRAND_GRADIENT,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                            }}
                          >
                            {item.price}
                          </p>
                          <p className="text-[10px] text-gray-400">estimated</p>
                        </div>
                        <button
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl transition whitespace-nowrap hover:opacity-90"
                          style={{ background: BRAND_GRADIENT }}
                        >
                          Get Quote Now →
                        </button>
                      </div>
                    </div>

                    <div
                      className="md:hidden flex items-center justify-between px-4 py-3"
                      style={{
                        borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6',
                        background: isDark ? 'rgba(255,255,255,0.02)' : '#FAFAFA',
                      }}
                    >
                      <div>
                        <p
                          className="text-sm font-bold leading-tight"
                          style={{
                            background: BRAND_GRADIENT,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                          }}
                        >
                          {item.price}
                        </p>
                        <p className="text-[10px] text-gray-400">estimated</p>
                      </div>
                      <button
                        className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-white rounded-xl transition whitespace-nowrap hover:opacity-90"
                        style={{ background: BRAND_GRADIENT }}
                      >
                        Get Quote Now →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Return to NorbieLink CTA */}
            <div
              className="jungle-cta rounded-2xl relative cursor-pointer hover:opacity-95 transition overflow-hidden"
              onClick={onBack}
              style={{ minHeight: '100px' }}
            >
              <img src={sellMoreBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="px-8 py-6 relative z-10">
                <p className="text-lg font-bold mb-1" style={{ color: '#111827' }}>Return to the Jungle?</p>
                <p className="text-xs text-gray-400">
                  Head back to{' '}
                  <span
                    className="font-semibold underline underline-offset-2"
                    style={{
                      background: BRAND_GRADIENT,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Norbielink
                  </span>
                </p>
              </div>
            </div>

            <div className="pb-8" />
          </div>
        </main>

        {/* Right rail — Bind Received + What's Next */}
        <aside
          className="no-print hidden md:flex w-80 2xl:w-96 flex-col shrink-0"
          style={{
            background: isDark ? '#191D35' : 'white',
            borderLeft: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6',
          }}
        >
          <div className="p-5 flex-1 overflow-y-auto custom-scroll">
            <h2 className="text-lg font-bold mb-3" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>Bind Received</h2>

            {/* Auto-saved + 100% row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <linearGradient id="autoGradWcSub" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={isDark ? '#A78BFA' : '#5C2ED4'}/>
                      <stop offset="100%" stopColor={isDark ? '#E879F9' : '#A614C3'}/>
                    </linearGradient>
                  </defs>
                  <path d="M12 16V9m0 0l-3 3m3-3l3 3" stroke="url(#autoGradWcSub)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.5 18A4.5 4.5 0 016 9.1V9a6 6 0 0111.9-.9A4.5 4.5 0 0118 18H6.5z" stroke="url(#autoGradWcSub)" strokeWidth="1.8" strokeLinejoin="round"/>
                </svg>
                <span
                  className="text-xs font-medium"
                  style={{
                    background: BRAND_GRADIENT,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  All progress auto-saved
                </span>
              </div>
              <span
                className="text-xs font-bold"
                style={{
                  background: BRAND_GRADIENT,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                100%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full overflow-hidden mb-4"
              style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }}>
              <div className="h-full rounded-full w-full transition-all duration-500"
                style={{ background: BRAND_GRADIENT }} />
            </div>

            {/* Divider */}
            <div className="mb-5" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6'}` }} />

            {/* What's Next */}
            <div className="mb-6">
              <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-4 pl-0.5">
                What's Next?
              </div>
              <div className="space-y-5">
                {[
                  { n: 1, t: 'Review & Processing', d: 'Your application will be reviewed as soon as possible.' },
                  { n: 2, t: 'Email Confirmation',  d: "You'll receive detailed policy confirmation via email." },
                  { n: 3, t: 'Policy in Force',     d: 'Coverage starts on the effective date you selected.' },
                ].map(step => (
                  <div key={step.n} className="flex gap-3">
                    <span
                      className="w-9 h-9 rounded-full text-sm font-bold flex items-center justify-center shrink-0"
                      style={{ background: 'linear-gradient(88.09deg, rgba(92,46,212,0.25) 0%, rgba(166,20,195,0.25) 100%)' }}
                    >
                      <span
                        style={{
                          background: BRAND_GRADIENT,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        {step.n}
                      </span>
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold leading-tight" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{step.t}</p>
                      <p className="text-[11px] mt-1 leading-relaxed" style={{ color: isDark ? '#9CA3AF' : '#9CA3AF' }}>{step.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
