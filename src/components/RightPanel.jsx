import { useMemo } from 'react'
import { CARRIERS } from '../pages/wc/CarrierSelection'
import { CarrierLogo, PriceTicker, BrandText } from './wc/primitives'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

const CARRIER_FACTORS = {
  amtrust:     0.90,
  clearspring: 0.93,
  cna:         0.98,
  employers:   1.02,
  hartford:    1.05,
  travelers:   1.10,
}

/* Rough per-carrier premium — matches Indication.jsx so the right-rail
   numbers agree with what the user sees on the Price Indication screen. */
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

/* Mirrors Sidebar.jsx's completion logic — 7 steps total. */
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
  return { pct: Math.round((done / 7) * 100), flags }
}

export default function RightPanel({ formData = {}, isDark = false, indicationReady = false, onDownloadSummary }) {
  const pz = formData.pageZero || {}
  const state = pz.state || 'CA'
  const stateCov = formData.coverage?.[state] || {}
  const totalPayroll = (stateCov.classes || []).reduce((sum, c) => {
    const n = parseInt(String(c.payroll || '').replace(/[^0-9]/g, ''), 10) || 0
    return sum + n
  }, 0)

  const { pct } = useMemo(() => computeProgress(formData), [formData])

  const readyToQuote = !!pz.mainClass
  const hasPayroll   = totalPayroll > 0
  const showPrices   = readyToQuote && hasPayroll

  const selected = formData.carrierSelection?.checked || {}
  const quotes = useMemo(() => {
    const list = CARRIERS
      .filter(c => selected[c.id] !== false)
      .map(c => ({ ...c, premium: estimatePremium(formData, CARRIER_FACTORS[c.id] || 1) }))
    return list.sort((a, b) => a.premium - b.premium)
  }, [formData, selected])

  return (
    <aside
      className="w-72 2xl:w-80 flex flex-col h-full sticky top-0 shrink-0"
      style={{
        background: isDark ? '#191D35' : 'white',
        borderLeft: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6',
      }}
    >
      <div className="p-5 flex-1 overflow-y-auto sidebar-nav">
        <h2 className="text-lg font-bold mb-3" style={{ color: isDark ? '#F9FAFB' : undefined }}>
          Submission in progress
        </h2>

        {/* Auto-saved + % */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium">
            <BrandText>All progress auto-saved</BrandText>
          </span>
          <span className="text-xs font-bold">
            <BrandText>{pct}%</BrandText>
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="w-full h-1.5 rounded-full overflow-hidden mb-5"
          style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: BRAND_GRADIENT }}
          />
        </div>

        <div className="im-rule mb-5" />

        {/* Carrier list — logo · name · price or ticker */}
        <div className="space-y-2 mb-5">
          {!readyToQuote && (
            <p className="text-[11px] text-gray-400 mb-3 leading-snug">
              Pick a class code to see live quotes.
            </p>
          )}
          {readyToQuote && !hasPayroll && (
            <p className="text-[11px] text-gray-400 mb-3 leading-snug">
              Add payroll on State coverages to see live prices.
            </p>
          )}
          {readyToQuote && quotes.map(q => (
            <div
              key={q.id}
              className="rounded-xl px-3 py-3 flex items-center gap-3"
              style={{ background: 'white', border: '1.5px solid #E5E7EB' }}
            >
              <CarrierLogo carrier={q} size={36} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold truncate text-gray-700">{q.name}</p>
                {q.reco && (
                  <p className="text-[9px] font-semibold mt-0.5">
                    <BrandText>BTIS Serviced</BrandText>
                  </p>
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
                <PriceTicker isDark={isDark} />
              )}
            </div>
          ))}
          {!readyToQuote && Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl px-3 py-3 flex items-center gap-3"
              style={{ background: '#FAFAFB', border: '1px solid #F3F4F6' }}
            >
              <div className="im-skel w-9 h-9 rounded-xl shrink-0" />
              <div className="flex-1 flex items-center justify-between gap-2">
                <div className="im-skel h-3 rounded w-14" />
                <div className="im-skel h-3 rounded w-12" />
              </div>
            </div>
          ))}
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

        {/* Form Review — Commercial Auto's affordance, verbatim. */}
        <button
          onClick={onDownloadSummary}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition"
          style={{
            color: isDark ? '#D8B4FE' : '#A614C3',
            border: isDark ? '1px solid rgba(216,180,254,0.35)' : '1px solid rgba(166,20,195,0.3)',
            background: isDark ? 'rgba(167,139,250,0.08)' : 'white',
          }}
          onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(167,139,250,0.15)' : 'rgba(166,20,195,0.06)'}
          onMouseLeave={e => e.currentTarget.style.background = isDark ? 'rgba(167,139,250,0.08)' : 'white'}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Form Review
        </button>
      </div>
    </aside>
  )
}
