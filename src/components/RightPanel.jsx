import { useMemo } from 'react'
import { CARRIERS } from '../pages/wc/CarrierSelection'
import { premiumForCarrier, FACTORS } from '../pages/wc/Indication'
import { CarrierLogo, PriceTicker, BrandText } from './wc/primitives'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

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
    business:  !!(biz.name && biz.address && biz.city && biz.entityType && biz.fein && biz.yearEstablished && biz.phone && biz.email),
    history:   !!hist.coverageStatus && hist.claimsPast4 !== undefined,
    coverages: !!(stateCov.classes && stateCov.classes.length && stateCov.classes.every(c => c.code && c.payroll)),
    questions: uw.safety_program !== undefined,
    carriers:  Object.values(sel).some(Boolean),
    carrierflow: !!bnd.selectedCarrier && !!bnd.carrierQuestions,
    quote: !!bnd.bound,
  }
  const done = Object.values(flags).filter(Boolean).length
  return { pct: Math.round((done / 7) * 100), flags }
}

/* The application summary is not handed out yet. One flag so turning it
   back on is a single edit rather than a hunt through the rail. */
const SUMMARY_DOWNLOADABLE = false

export default function RightPanel({ formData = {}, isDark = false, indicationReady = false, onDownloadSummary, selectedCarrierId = null }) {
  const pz = formData.pageZero || {}
  const state = pz.state || 'CA'
  const stateCov = formData.coverage?.[state] || {}
  const totalPayroll = (stateCov.classes || []).reduce((sum, c) => {
    const n = parseInt(String(c.payroll || '').replace(/[^0-9]/g, ''), 10) || 0
    return sum + n
  }, 0)

  const { pct } = useMemo(() => computeProgress(formData), [formData])

  const readyToQuote = !!pz.mainClass
  const canDownload  = SUMMARY_DOWNLOADABLE && readyToQuote
  const hasPayroll   = totalPayroll > 0
  const showPrices   = readyToQuote && hasPayroll

  const selected = formData.carrierSelection?.checked || {}
  const quotes = useMemo(() => {
    const list = CARRIERS
      .filter(c => selected[c.id] !== false)
      .map(c => ({ ...c, premium: premiumForCarrier(formData, c.id),
                   noquote: (FACTORS[c.id] || {}).noquote }))
    /* A market that declines has no price to sort on, so it goes last rather
       than landing wherever its unused factor happens to put it. */
    return list.sort((a, b) => (!!a.noquote - !!b.noquote) || a.premium - b.premium)
  }, [formData, selected])

  /* Whichever was chosen on the indication leads; the others keep the list. */
  const featured = quotes.find(q => q.id === selectedCarrierId) || null
  const rest = featured ? quotes.filter(q => q.id !== featured.id) : quotes

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
              Add payroll on Coverages to see live prices.
            </p>
          )}
          {/* The chosen market is promoted out of the list and shown large, as
              Builder's Risk does on its compare stage — the rail should answer
              "which one did I pick" at a glance rather than make the agent
              hunt for it among six identical rows. */}
          {readyToQuote && featured && (
            <div
              className="rounded-2xl px-4 py-5 mb-3 flex flex-col items-center text-center relative"
              style={{
                background: isDark ? 'rgba(255,255,255,0.04)' : 'white',
                border: `1.5px solid ${isDark ? 'rgba(124,58,237,0.55)' : '#7C3AED'}`,
                boxShadow: '0 4px 20px rgba(92,46,212,0.10)',
              }}
            >
              <span
                className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider text-white"
                style={{ background: BRAND_GRADIENT, boxShadow: '0 2px 6px rgba(92,46,212,0.25)' }}
              >
                SELECTED
              </span>
              <CarrierLogo carrier={featured} size={52} />
              <p className="text-sm font-bold mt-2.5" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
                {featured.name}
              </p>
              {featured.reco && (
                <p className="text-[9px] font-semibold mt-0.5"><BrandText>BTIS Serviced</BrandText></p>
              )}
              {showPrices && !featured.noquote && (
                <div className="mt-3">
                  <span className="text-2xl font-bold" style={{
                    background: BRAND_GRADIENT,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>{money(featured.premium)}</span>
                  <p className="text-[10px] text-gray-400 mt-0.5">Annual premium</p>
                </div>
              )}
            </div>
          )}

          {readyToQuote && rest.map(q => (
            <div
              key={q.id}
              className="rounded-xl px-3 py-3 flex items-center gap-3"
              style={{
                background: isDark ? 'rgba(255,255,255,0.04)' : 'white',
                border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}`,
              }}
            >
              <CarrierLogo carrier={q} size={36} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold truncate" style={{ color: isDark ? '#F9FAFB' : '#374151' }}>{q.name}</p>
                {q.reco && (
                  <p className="text-[9px] font-semibold mt-0.5">
                    <BrandText>BTIS Serviced</BrandText>
                  </p>
                )}
              </div>
              {showPrices ? (
                <div className="text-right shrink-0">
                  {q.noquote ? (
                    <div className="text-[11px] font-semibold text-gray-400">Not a fit</div>
                  ) : (
                    <>
                      <div className="text-sm font-bold leading-tight" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
                        {money(q.premium)}
                      </div>
                      <div className="text-[9px] text-gray-400">per year</div>
                    </>
                  )}
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
              style={{
                background: isDark ? 'rgba(255,255,255,0.03)' : '#FAFAFB',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}`,
              }}
            >
              <div className="im-skel w-9 h-9 rounded-xl shrink-0" />
              <div className="flex-1 flex items-center justify-between gap-2">
                <div className="im-skel h-3 rounded w-14" />
                <div className="im-skel h-3 rounded w-12" />
              </div>
            </div>
          ))}
        </div>

        <div className="my-5" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6'}` }} />

        {/* con-gl's rail CTA — gradient when there is enough on file to be
            worth reading back, greyed out before that.

            Held in the greyed state for now: the summary is not something
            we hand out yet. Flip SUMMARY_DOWNLOADABLE to true and the
            readyToQuote gate takes over again. */}
        <button
          type="button"
          onClick={onDownloadSummary}
          disabled={!canDownload}
          title={canDownload ? undefined : SUMMARY_DOWNLOADABLE
            ? 'Pick a class code to build the summary'
            : 'Coming soon'}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition disabled:cursor-not-allowed enabled:hover:opacity-90"
          style={canDownload
            ? { background: BRAND_GRADIENT, color: 'white', boxShadow: '0 4px 14px rgba(92,46,212,0.22)' }
            : isDark
              ? { background: 'rgba(255,255,255,0.04)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.08)' }
              : { background: '#FAFAFB', color: '#9CA3AF', border: '1px solid #E5E7EB' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" />
          </svg>
          Download Application Summary
        </button>
      </div>
    </aside>
  )
}
