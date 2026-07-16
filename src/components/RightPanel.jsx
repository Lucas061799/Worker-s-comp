import { useMemo } from 'react'
import { CARRIERS } from '../pages/wc/CarrierSelection'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

const CARRIER_FACTORS = {
  amtrust:     0.90,
  clearspring: 0.93,
  cna:         0.98,
  employers:   1.02,
  hartford:    1.05,
  travelers:   1.10,
}

// Rough per-carrier premium — matches Indication.jsx so the right-rail
// numbers agree with what the user sees on the Price Indication screen.
function estimatePremium(formData, factor = 1) {
  const state = formData.pageZero?.state || 'CA'
  const stateData = formData.coverage?.[state] || {}
  const payroll = (stateData.classes || []).reduce((sum, c) => {
    const n = parseInt(String(c.payroll || '').replace(/[^0-9]/g, ''), 10) || 0
    return sum + n
  }, 0) || 480000
  const emod = Number(formData.underwriting?.experienceMod) || 1
  return Math.round(payroll * 0.011 * emod * factor)
}

const money = (n) => '$' + Math.round(n).toLocaleString()

// Mirrors Sidebar.jsx's completion logic — 7 phase-1 + phase-2 steps.
function computeProgress(formData) {
  const pz  = formData.pageZero || {}
  const biz = formData.business || {}
  const uw  = formData.underwriting || {}
  const bnd = formData.bind || {}
  const sel = formData.carrierSelection?.checked || {}
  const state = pz.state || 'CA'
  const stateCov = formData.coverage?.[state] || {}
  const hist = formData.history || {}

  const flags = {
    business:  !!(biz.name && biz.address && biz.city && biz.entityType && biz.fein && biz.yearsInBusiness && biz.phone && biz.email),
    history:   !!(hist.priorTerms?.length) || hist.claimCount !== undefined,
    coverages: !!(stateCov.classes && stateCov.classes.length && stateCov.classes.every(c => c.code && c.payroll)),
    questions: uw.decline_any !== undefined,
    carriers:  Object.values(sel).some(Boolean),
    carrierflow: !!bnd.selectedCarrier && !!bnd.carrierQuestions,
    quote: !!bnd.bound,
  }
  const done = Object.values(flags).filter(Boolean).length
  const total = 7
  return { pct: Math.round((done / total) * 100), flags, done, total }
}

function CarrierMark({ name, logo, size = 'sm' }) {
  const dim = size === 'lg' ? 64 : 40
  const pad = size === 'lg' ? 8 : 6
  return (
    <div
      className="rounded-xl flex items-center justify-center shrink-0"
      style={{
        width: dim, height: dim,
        background: 'white',
        border: '1px solid #E5E7EB',
        padding: pad,
      }}
    >
      <img
        src={logo}
        alt={name}
        className="max-w-full max-h-full select-none pointer-events-none"
        style={{ objectFit: 'contain' }}
      />
    </div>
  )
}

function LoadingPriceTicker() {
  return (
    <div
      className="shrink-0 relative flex items-center justify-center"
      style={{ width: 24, height: 24 }}
      aria-label="Calculating quote"
    >
      <svg
        width="24" height="24" viewBox="0 0 24 24" fill="none"
        className="absolute inset-0 animate-spin"
        style={{ animationDuration: '1.1s' }}
      >
        <defs>
          <linearGradient id="rpSpinG" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#5C2ED4"/>
            <stop offset="100%" stopColor="#A614C3"/>
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="2" />
        <path d="M22 12a10 10 0 0 0-10-10" stroke="url(#rpSpinG)" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <span
        className="relative text-[11px] font-bold"
        style={{
          background: BRAND_GRADIENT,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        $
      </span>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div
      className="rounded-xl px-3 py-3 flex items-center gap-3"
      style={{ background: '#FAFAFB', border: '1px solid #F3F4F6' }}
    >
      <div className="skel w-9 h-9 rounded-xl shrink-0" />
      <div className="flex-1 flex items-center justify-between gap-2">
        <div className="skel h-3 rounded w-14" />
        <div className="skel h-3 rounded w-12" />
      </div>
      <style>{`
        .skel { background: linear-gradient(90deg, #EEF2F7 0%, #F8FAFC 50%, #EEF2F7 100%); background-size: 200% 100%; animation: skelShimmer 1.4s ease-in-out infinite; }
        @keyframes skelShimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
      `}</style>
    </div>
  )
}

export default function RightPanel({ formData = {}, isDark = false, indicationReady = false }) {
  const pz  = formData.pageZero || {}
  const state = pz.state || 'CA'
  const stateCov = formData.coverage?.[state] || {}
  const totalPayroll = (stateCov.classes || []).reduce((sum, c) => {
    const n = parseInt(String(c.payroll || '').replace(/[^0-9]/g, ''), 10) || 0
    return sum + n
  }, 0)

  const { pct } = useMemo(() => computeProgress(formData), [formData])

  // Show carrier list as soon as class code is picked; show prices once
  // we have payroll input (from State Coverages).
  const readyToQuote = !!pz.mainClass
  const hasPayroll   = totalPayroll > 0
  const showPrices   = readyToQuote && hasPayroll

  const selected = formData.carrierSelection?.checked || {}
  const quotes = useMemo(() => {
    const list = CARRIERS
      .filter(c => selected[c.id] !== false) // default all
      .map(c => ({ ...c, premium: estimatePremium(formData, CARRIER_FACTORS[c.id] || 1) }))
    return list.sort((a, b) => a.premium - b.premium)
  }, [formData, selected])

  const showSkeleton = !readyToQuote
  const selectedCarrierId = formData.bind?.selectedCarrierId
  const top = quotes[0]

  return (
    <aside
      className="w-80 2xl:w-96 flex flex-col h-full sticky top-0 shrink-0"
      style={{
        background: isDark ? '#191D35' : 'white',
        borderLeft: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6',
      }}
    >
      <div className="p-5 flex-1 overflow-y-auto sidebar-nav">

        {/* Title */}
        <h2 className="text-lg font-bold mb-3" style={{ color: isDark ? '#F9FAFB' : undefined }}>
          Quote in Progress
        </h2>

        {/* Auto-saved + % row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="autoGradWcRp" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={isDark ? '#A78BFA' : '#5C2ED4'}/>
                  <stop offset="100%" stopColor={isDark ? '#E879F9' : '#A614C3'}/>
                </linearGradient>
              </defs>
              <path d="M12 16V9m0 0l-3 3m3-3l3 3" stroke="url(#autoGradWcRp)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6.5 18A4.5 4.5 0 016 9.1V9a6 6 0 0111.9-.9A4.5 4.5 0 0118 18H6.5z" stroke="url(#autoGradWcRp)" strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs font-medium text-gradient">All progress auto-saved</span>
          </div>
          <span className="text-xs font-bold text-gradient">{pct}%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full overflow-hidden mb-4"
          style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: BRAND_GRADIENT }} />
        </div>

        {/* Divider */}
        <div className="mb-5" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6'}` }} />

        {/* Live quotes */}
        <div className="mb-5">
          {showSkeleton ? (
            <div
              className="rounded-2xl px-5 py-6 mb-3 flex flex-col items-center gap-3"
              style={{ background: '#FAFAFB', border: '1px solid #F3F4F6' }}
            >
              <div className="skel w-14 h-14 rounded-xl" />
              <div className="skel h-8 w-32 rounded" />
              <div className="skel h-3 w-20 rounded" />
              <style>{`
                .skel { background: linear-gradient(90deg, #EEF2F7 0%, #F8FAFC 50%, #EEF2F7 100%); background-size: 200% 100%; animation: skelShimmer 1.4s ease-in-out infinite; }
                @keyframes skelShimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
              `}</style>
            </div>
          ) : showPrices && top ? (
            <div
              className="w-full rounded-2xl px-5 py-5 mb-3 flex flex-col items-center text-center relative overflow-hidden"
              style={{
                background: 'white',
                border: `1.5px solid ${selectedCarrierId === top.id ? '#5C2ED4' : '#7C3AED'}`,
                boxShadow: selectedCarrierId === top.id
                  ? '0 6px 24px rgba(92,46,212,0.22)'
                  : '0 4px 20px rgba(92,46,212,0.10)',
              }}
            >
              <div
                className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider text-white"
                style={{ background: BRAND_GRADIENT }}
              >
                BEST
              </div>
              <CarrierMark name={top.name} logo={top.logo} size="lg" />
              <div className="mt-3">
                <span
                  className="text-3xl font-bold"
                  style={{
                    background: BRAND_GRADIENT,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {money(top.premium)}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">Annual premium · {top.name}</p>
              {top.reco && (
                <p className="text-[10px] font-semibold mt-2 text-gradient">
                  BTIS Serviced
                </p>
              )}
            </div>
          ) : readyToQuote ? (
            <p className="text-[11px] text-gray-400 mb-3 leading-snug">
              Add payroll on State coverages to see live prices.
            </p>
          ) : (
            <p className="text-[11px] text-gray-400 mb-3 leading-snug">
              Pick a class code to see live quotes.
            </p>
          )}

          {/* Carrier list */}
          <div className="space-y-2">
            {showSkeleton
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
              : (showPrices ? quotes.slice(1) : quotes).map(q => (
                  <div
                    key={q.id}
                    className="w-full rounded-xl px-3 py-3 flex items-center gap-3"
                    style={{ background: 'white', border: '1.5px solid #E5E7EB' }}
                  >
                    <CarrierMark name={q.name} logo={q.logo} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold truncate text-gray-700">{q.name}</p>
                      {q.reco && !showPrices && (
                        <p className="text-[9px] font-semibold text-gradient mt-0.5">BTIS Serviced</p>
                      )}
                    </div>
                    {showPrices ? (
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold leading-tight text-gray-900">
                          {money(q.premium)}
                        </div>
                        <div className="text-[9px] text-gray-400">per year</div>
                      </div>
                    ) : (
                      <LoadingPriceTicker />
                    )}
                  </div>
                ))
            }
          </div>

          {!readyToQuote && (
            <p className="text-[10px] text-gray-400 text-left mt-3 leading-relaxed">
              Estimates appear once the class code is picked.
            </p>
          )}
        </div>

        {indicationReady && (
          <div
            className="rounded-xl p-3 mb-4"
            style={{ background: BRAND_GRADIENT, color: 'white', boxShadow: '0 6px 20px rgba(92,46,212,0.25)' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-80 mb-1">
              Price indication ready
            </p>
            <p className="text-xs opacity-90 leading-relaxed">
              Open the Price indication tab in the left rail to pick a carrier.
            </p>
          </div>
        )}

        {/* Auto-save note */}
        <div
          className="rounded-xl p-3 flex items-start gap-2.5"
          style={{
            background: isDark ? 'rgba(92,46,212,0.12)' : 'rgba(92,46,212,0.05)',
            border: isDark ? '1px solid rgba(167,139,250,0.25)' : '1px solid rgba(92,46,212,0.15)',
          }}
        >
          <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="rpSaveGWc" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={isDark ? '#A78BFA' : '#5C2ED4'}/>
                <stop offset="100%" stopColor={isDark ? '#E879F9' : '#A614C3'}/>
              </linearGradient>
            </defs>
            <path d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="url(#rpSaveGWc)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-[11px] leading-relaxed" style={{ color: isDark ? '#C4C8D4' : '#6B7280' }}>
            Every page saves on load — leave and pick up where you stopped.
          </p>
        </div>
      </div>
    </aside>
  )
}
