import { useState, useEffect } from 'react'
import { Tag, CarrierLogo } from '../../components/wc/primitives'
import logoCna          from '../../assets/carrier-cna.png'
import logoCoterie      from '../../assets/carrier-coterie.png'
import logoHiscox       from '../../assets/carrier-hiscox.png'
import logoGreatAmerican from '../../assets/carrier-greatamerican.png'
import logoUsli         from '../../assets/carrier-usli.png'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

export const CARRIERS = [
  {
    id: 'amtrust',    name: 'AmTrust',
    logo: logoCoterie,
    sub: 'Promo active · direct-appointment sensitive',
    tagline: 'Broad contractor appetite · instant bind on most classes',
    promo: true,
    sla: 'Endorsements 3–5 business days',
    own: 'Billing & endorsements serviced by AmTrust',
    why: 'Broad contractor appetite; instant bind on most classes.',
  },
  {
    id: 'clearspring', name: 'Clear Spring',
    logo: logoUsli,
    sub: 'Agency bill through BTIS',
    tagline: 'Competitive on higher-mod risks',
    sla: 'Endorsements 5–7 business days',
    own: 'BTIS bills; endorsements route to the carrier',
    why: 'Competitive on higher-mod risks.',
  },
  {
    id: 'cna',        name: 'CNA',
    logo: logoCna,
    sub: 'CNA 2.0',
    tagline: 'Fastest service path — everything stays inside BTIS control',
    reco: true,
    sla: 'Endorsements 1–2 business days (BTIS)',
    own: 'BTIS services endorsements and billing end-to-end',
    why: 'Fastest service path — everything stays inside BTIS control.',
  },
  {
    id: 'employers',  name: 'Employers',
    logo: logoHiscox,
    sub: 'Direct bill',
    tagline: 'Strong small-business appetite',
    sla: 'Endorsements 4–6 business days',
    own: 'Carrier-serviced',
    why: 'Strong small-business appetite.',
  },
  {
    id: 'hartford',   name: 'The Hartford',
    logo: logoGreatAmerican,
    sub: 'Broad market',
    tagline: 'Best fit for larger risks & higher payrolls',
    sla: 'Endorsements 4–6 business days',
    own: 'Carrier-serviced',
    why: 'Best fit for larger risks & higher payrolls.',
  },
  {
    id: 'travelers',  name: 'Travelers',
    logo: logoCoterie,
    sub: 'Direct bill',
    tagline: 'Reliable across most classes',
    sla: 'Endorsements 4–6 business days',
    own: 'Carrier-serviced',
    why: 'Reliable across most classes.',
  },
]

function InfoPop({ carrier, onClose }) {
  return (
    <div
      className="im-info-pop absolute right-2 top-14 w-72 rounded-2xl overflow-hidden text-xs z-20"
      onClick={e => e.stopPropagation()}
    >
      <div className="im-info-pop-head flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-gray-900 truncate">{carrier.name}</h4>
          <p className="text-[11px] text-gray-500 mt-0.5">{carrier.sla}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="im-info-pop-close w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="px-4 py-3 text-[12.5px] text-gray-600 leading-relaxed">
        <ul className="space-y-1.5 list-disc pl-4">
          <li>{carrier.own}</li>
          <li>{carrier.why}</li>
          <li>Checked = BTIS approaches this market and it's blocked for direct submission on this risk.</li>
        </ul>
      </div>
    </div>
  )
}

function ApproachModal({ carriers, onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(15,10,40,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <div
        className="max-w-lg w-full rounded-2xl overflow-hidden"
        style={{ background: 'white', boxShadow: '0 32px 80px rgba(15,10,40,0.28)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Same shape as the Application Overview modal: round icon tile,
            a ruled header, the body, then a ruled footer. */}
        <div className="flex items-start gap-4 px-5 pt-4 pb-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(88.09deg, rgba(92,46,212,0.12) 0%, rgba(166,20,195,0.12) 100%)' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="approachHdrG" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#5C2ED4"/>
                  <stop offset="100%" stopColor="#A614C3"/>
                </linearGradient>
              </defs>
              <path
                d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                stroke="url(#approachHdrG)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-navy leading-tight">
              Approach {carriers.length} {carriers.length === 1 ? 'market' : 'markets'}?
            </h2>
            <p className="text-xs mt-0.5 text-gray-500 leading-relaxed">
              BTIS is registered as your broker with each one you submit to.
            </p>
          </div>
        </div>

        <div className="px-5 py-5">
          <div className="flex flex-wrap gap-1.5 mb-4">
            {carriers.map(c => <Tag key={c.id} tone="brand">{c.name}</Tag>)}
          </div>
          <div className="rounded-xl p-4 flex items-start gap-3"
            style={{ background: 'rgba(92,46,212,0.05)', border: '1px solid rgba(92,46,212,0.18)' }}>
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="#5C2ED4" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5" strokeLinecap="round" />
              <circle cx="12" cy="16.5" r="0.6" fill="#5C2ED4" />
            </svg>
            <p className="text-[12.5px] text-gray-600 leading-relaxed">
              <span className="font-bold text-navy">This closes them to a direct submission.</span>{' '}
              You won't be able to approach these markets yourself for this risk.
            </p>
          </div>
        </div>

        <div className="px-5 py-3.5 flex items-center justify-between gap-3" style={{ borderTop: '1px solid #F3F4F6' }}>
          <button
            type="button"
            onClick={onCancel}
            className="h-10 px-5 inline-flex items-center justify-center rounded-xl text-sm font-semibold transition"
            style={{ background: 'white', color: '#6B7280', border: '1.5px solid #E5E7EB' }}
          >
            Go back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-2 px-7 py-2.5 text-sm font-semibold text-white rounded-xl transition hover:opacity-90"
            style={{ background: BRAND_GRADIENT, boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }}
          >
            Yes — approach carriers
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function PromoModal({ onKeep, onUncheck }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(15,18,40,0.55)', backdropFilter: 'blur(3px)' }}
      onClick={onKeep}
    >
      <div
        className="max-w-md w-full rounded-2xl p-7"
        style={{ background: 'white', boxShadow: '0 32px 80px rgba(0,0,0,0.22)' }}
        onClick={e => e.stopPropagation()}
      >
        <span className="im-chip im-chip-warn mb-3 inline-flex">Q3 PROMOTION ACTIVE</span>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Unchecking AmTrust?</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          Policies bound with AmTrust through BTIS currently earn <b>+2% boosted commission</b>.
          If you uncheck, BTIS won't approach AmTrust and this promotion won't apply to this risk.
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onUncheck}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: 'white', color: '#6B7280', border: '1.5px solid #E5E7EB' }}
          >
            Uncheck anyway
          </button>
          <button
            type="button"
            onClick={onKeep}
            className="btn-gradient force-white-text px-5 py-2.5 rounded-lg text-sm font-bold"
            style={{ background: BRAND_GRADIENT, boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }}
          >
            Keep AmTrust checked
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CarrierSelection({ formData, updateFormData, onGetIndication, onBack }) {
  const data = formData.carrierSelection || {}
  const checked = data.checked || Object.fromEntries(CARRIERS.map(c => [c.id, true]))

  const [openInfo, setOpenInfo] = useState(null)
  const [showApproach, setShowApproach] = useState(false)
  const [showPromo, setShowPromo] = useState(false)

  // Persist the default all-checked state so downstream screens see it.
  useEffect(() => {
    if (!data.checked) {
      updateFormData('carrierSelection', { checked })
    }
  }, [data.checked, checked, updateFormData])

  const toggle = (carrierId) => {
    if (carrierId === 'amtrust' && checked.amtrust) {
      setShowPromo(true)
      return
    }
    updateFormData('carrierSelection', { checked: { ...checked, [carrierId]: !checked[carrierId] } })
  }
  const forceUncheckAmtrust = () => {
    updateFormData('carrierSelection', { checked: { ...checked, amtrust: false } })
    setShowPromo(false)
  }

  const selected = CARRIERS.filter(c => checked[c.id])

  return (
    <div className="w-full space-y-4">
      <p className="text-sm text-gray-500 -mt-2">
        Submitting registers BTIS as your broker with each checked carrier — that market is then closed to a direct submission for this risk.
        Uncheck any market you plan to approach directly.
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        {CARRIERS.map(c => {
          const isChecked = !!checked[c.id]
          return (
            <div
              key={c.id}
              className="relative rounded-xl transition-all cursor-pointer group"
              style={{
                background: 'white',
                border: `1.5px solid ${isChecked ? '#7C3AED' : '#E5E7EB'}`,
                boxShadow: isChecked ? '0 4px 14px rgba(92,46,212,0.10)' : 'none',
              }}
              onClick={() => toggle(c.id)}
              onMouseEnter={e => {
                if (!isChecked) {
                  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.35)'
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(92,46,212,0.06)'
                }
              }}
              onMouseLeave={e => {
                if (!isChecked) {
                  e.currentTarget.style.borderColor = '#E5E7EB'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              {/* Corner ribbon badges — straddle the top border of the
                  card so they read as "attached" tags instead of
                  floating inside. */}
              {(c.reco || c.promo) && (
                <div
                  className="absolute right-3 flex items-center gap-1.5 z-10"
                  style={{ top: '-9px' }}
                >
                  {c.reco && (
                    <span
                      className="text-[9px] font-bold px-2 py-1 rounded-md text-white uppercase tracking-wider shrink-0"
                      style={{ background: BRAND_GRADIENT, boxShadow: '0 2px 8px rgba(92,46,212,0.35)' }}
                    >
                      BTIS Serviced
                    </span>
                  )}
                  {c.promo && (
                    <span
                      className="text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shrink-0"
                      style={{
                        background: 'white',
                        color: '#A614C3',
                        border: '1.5px solid #A614C3',
                        boxShadow: '0 2px 8px rgba(166,20,195,0.15)',
                      }}
                    >
                      Promo
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 px-5 py-4">
                {/* Logo — big, borderless, sits on the card */}
                <div className="w-12 h-12 flex items-center justify-center shrink-0">
                  <img
                    src={c.logo}
                    alt={c.name}
                    className="max-w-full max-h-full select-none pointer-events-none"
                    style={{ objectFit: 'contain' }}
                  />
                </div>

                {/* Name + tagline */}
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold truncate mb-0.5" style={{ color: '#1F2937' }}>
                    {c.name}
                  </p>
                  <p className="text-[11px] text-gray-500 leading-snug truncate">
                    {c.tagline}
                  </p>
                </div>

                {/* Info + check */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setOpenInfo(prev => prev === c.id ? null : c.id) }}
                    aria-label={`About ${c.name}`}
                    className="im-info-dot w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  >
                    <span className="text-[10px] font-bold leading-none">i</span>
                  </button>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition"
                    style={isChecked
                      ? { background: BRAND_GRADIENT, boxShadow: '0 2px 8px rgba(92,46,212,0.3)' }
                      : { background: 'white', border: '1.5px solid #D1D5DB' }
                    }
                  >
                    {isChecked && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              {openInfo === c.id && (
                <InfoPop carrier={c} onClose={() => setOpenInfo(null)} />
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between gap-3 pt-3">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold"
              style={{ background: 'white', color: '#6B7280', border: '1.5px solid #E5E7EB' }}
            >
              ← Back
            </button>
          )}
          <p className="text-xs text-gray-500">
            {selected.length} of {CARRIERS.length} markets selected
          </p>
        </div>
        <button
          type="button"
          disabled={selected.length === 0}
          onClick={() => setShowApproach(true)}
          className="btn-gradient force-white-text px-8 py-3 rounded-xl text-sm font-bold transition-all"
          style={{
            background: selected.length ? BRAND_GRADIENT : '#D1D5DB',
            boxShadow: selected.length ? '0 4px 20px rgba(92,46,212,0.3)' : 'none',
            cursor: selected.length ? 'pointer' : 'not-allowed',
          }}
        >
          Get price indication →
        </button>
      </div>

      {showApproach && (
        <ApproachModal
          carriers={selected}
          onCancel={() => setShowApproach(false)}
          onConfirm={() => { setShowApproach(false); onGetIndication && onGetIndication() }}
        />
      )}
      {showPromo && (
        <PromoModal
          onKeep={() => setShowPromo(false)}
          onUncheck={forceUncheckAmtrust}
        />
      )}
    </div>
  )
}
