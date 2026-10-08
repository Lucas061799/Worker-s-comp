import { useState, useEffect } from 'react'
import { Tag, CarrierLogo, Modal, ModalButton } from '../../components/wc/primitives'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

/* The roster, names and servicing detail are the prototype's. Clear Spring was
   this carrier's old name — the prototype calls it Berkshire Hathaway GUARD on
   the same `clearspring` id. The Hartford and Travelers appear in neither the
   prototype nor either BRD, so they are gone; Great American, Pie and
   ICW/Zenith were missing. Logos are the generic set we hold, reused as
   placeholders until real marks arrive. */
export const CARRIERS = [
  {
    id: 'amtrust',    name: 'AmTrust',
    sub: 'Agency bill only · +2% promo',
    tagline: 'Instant on eligible classes',
    promo: true,
    sla: 'Instant on eligible classes',
    own: 'Turnaround in BTIS control',
    billing: 'Agency bill only',
    endorsementSla: '24 hrs',
    why: 'Instant on eligible classes; turnaround stays in BTIS control.',
  },
  {
    id: 'clearspring', name: 'Berkshire Hathaway GUARD',
    sub: 'Agency or direct bill',
    tagline: 'Same-day turnaround, held inside BTIS',
    sla: 'Same-day',
    own: 'Turnaround in BTIS control',
    billing: 'Agency or direct bill',
    endorsementSla: 'Same-day',
    why: 'Same-day service with turnaround in BTIS control.',
  },
  {
    id: 'cna',        name: 'CNA',
    sub: 'Agency bill · premium finance available',
    tagline: 'BTIS handles endorsements and billing end-to-end',
    reco: true,
    sla: '~2 hrs',
    own: 'BTIS handles endorsements + billing',
    billing: 'Agency bill · premium finance available',
    endorsementSla: 'Same-day (BTIS handled)',
    why: 'Fastest service path — everything stays inside BTIS control.',
  },
  {
    id: 'greatamerican', name: 'Great American',
    sub: 'Agency or direct bill',
    tagline: 'Same-day turnaround, held inside BTIS',
    sla: 'Same-day',
    own: 'Turnaround in BTIS control',
    billing: 'Agency or direct bill',
    endorsementSla: 'Same-day',
    why: 'Same-day service with turnaround in BTIS control.',
  },
  {
    id: 'pie',        name: 'Pie',
    sub: 'Direct bill only',
    tagline: 'Carrier-controlled turnaround',
    sla: '1 business day',
    own: 'Carrier-controlled turnaround',
    billing: 'Direct bill only',
    endorsementSla: '2 business days',
    why: 'Competitive where the class fits; underwriting reviews the risk.',
  },
  {
    id: 'employers',  name: 'Employers',
    sub: 'Direct bill only',
    tagline: 'Strong small-business appetite',
    sla: '1-2 business days',
    own: 'Carrier-controlled turnaround',
    billing: 'Direct bill only',
    endorsementSla: '3 business days',
    why: 'Strong small-business appetite; underwriting reviews the risk.',
  },
  {
    id: 'icwzenith',  name: 'ICW / Zenith',
    sub: 'Direct bill only',
    tagline: 'Carrier-controlled turnaround',
    sla: '2 business days',
    own: 'Carrier-controlled turnaround',
    billing: 'Direct bill only',
    endorsementSla: '3-5 business days',
    why: 'Combined ICW and Zenith appetite.',
  },
]

function InfoPop({ carrier, onClose }) {
  return (
    <div
      className="im-info-pop absolute right-2 top-14 w-72 rounded-2xl overflow-hidden text-xs z-20"
      onClick={e => e.stopPropagation()}
    >
      <div className="im-info-pop-head flex items-center justify-between gap-3 px-4 py-3">
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
    <Modal
      title="APPROACH THESE MARKETS?"
      width={460}
      onDismiss={onCancel}
      footer={
        <>
          <ModalButton variant="ghost" onClick={onCancel}>Go back</ModalButton>
          <ModalButton onClick={onConfirm}>Yes — approach carriers</ModalButton>
        </>
      }
    >
      <p className="text-[14px] text-gray-600 leading-relaxed mb-4">
        BTIS will submit this risk to the carriers below and be registered as your
        broker with each.{' '}
        <b className="text-navy">These markets then can't be approached directly for this risk.</b>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        {carriers.map(c => (
          <li key={c.id} className="text-[14px] text-gray-700">{c.name}</li>
        ))}
      </ul>
    </Modal>
  )
}

/* The prototype is careful here: this is a heads-up, not a nudge. Our version
   warned the promotion "won't apply", which reads as pressure to keep the
   carrier checked — theirs says plainly that removing them is the agent's call
   and affects nothing else. */
function PromoModal({ onKeep, onUncheck }) {
  return (
    <Modal
      title="Before you remove AmTrust"
      width={520}
      onDismiss={onKeep}
      footer={
        <>
          <ModalButton variant="ghost" onClick={onUncheck}>Remove AmTrust anyway</ModalButton>
          <ModalButton onClick={onKeep}>Keep AmTrust</ModalButton>
        </>
      }
    >
      <p className="text-[14px] text-gray-600 leading-relaxed">
        FYI: AmTrust is running <b className="text-navy">+2% commission</b> on CA artisan
        classes bound by Sept 30. This is informational only — removing them is entirely
        your call and doesn't affect other markets.
      </p>
    </Modal>
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
    <div className="w-full space-y-6">
      <p className="text-sm text-gray-500 -mt-2">
        All markets are checked by default — get your price indication, or uncheck any
        you'd like to skip.
      </p>

      {/* gap-y is larger than gap-x: the ribbons straddle the top border,
          so each row needs room to clear the card above it. */}
      <div className="grid sm:grid-cols-2 gap-x-3 gap-y-5">
        {CARRIERS.map(c => {
          const isChecked = !!checked[c.id]
          return (
            <div
              key={c.id}
              className="relative rounded-xl transition-all cursor-pointer group"
              /* Every card is checked by default, so a brand border on the
                 selected state painted the whole grid purple. The checkbox
                 already says which markets are in. */
              style={{
                background: 'white',
                border: '1.5px solid #E5E7EB',
              }}
              onClick={() => toggle(c.id)}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(124,58,237,0.55)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#E5E7EB'
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
                <CarrierLogo carrier={c} size={48} />

                {/* Name + tagline */}
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold truncate mb-0.5" style={{ color: '#1F2937' }}>
                    {c.name}
                  </p>
                  <p className="text-[11px] text-gray-500 leading-snug line-clamp-2">
                    {c.tagline}
                  </p>
                </div>

                {/* Info + check — the sidebar's step-marker tile: a
                    rounded-md square, tinted when on, grey when off. */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setOpenInfo(prev => prev === c.id ? null : c.id) }}
                    aria-label={`About ${c.name}`}
                    data-open={openInfo === c.id}
                    className="im-info-dot w-4 h-4 text-[10px] rounded-full flex items-center justify-center font-bold shrink-0"
                  >
                    i
                  </button>
                  {/* The Checkbox primitive's own look, so this toggle
                      matches every other checkbox in the app. */}
                  <div
                    /* Checked is the gradient alone — the magenta ring on top
                       of it read as a second state stacked on the first. Same
                       treatment as the shared Checkbox: no border when filled,
                       and the control fill rather than a hardcoded white,
                       which stayed white on navy. */
                    className={`w-5 h-5 rounded-[5px] flex items-center justify-center shrink-0 transition ${isChecked ? '' : 'field-fill'}`}
                    style={{
                      ...(isChecked ? { background: BRAND_GRADIENT } : {}),
                      border: isChecked ? 'none' : '1.5px solid var(--line-strong)',
                    }}
                  >
                    {isChecked && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 10 10">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

      {/* What checking a market actually commits the agent to — the prototype
          puts it under the tiles rather than in the lead paragraph. */}
      <p className="text-xs text-gray-400 leading-relaxed">
        Checked markets will be approached by BTIS and blocked for direct submission elsewhere.
      </p>

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
        </div>
        <button
          type="button"
          disabled={selected.length === 0}
          onClick={() => setShowApproach(true)}
          className="btn-gradient force-white-text px-8 py-3 rounded-xl text-sm font-bold transition-all"
          style={{
            background: selected.length ? BRAND_GRADIENT : 'var(--fill-disabled)',
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
