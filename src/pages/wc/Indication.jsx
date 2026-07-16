import { useMemo } from 'react'
import { CARRIERS } from './CarrierSelection'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

// Rough WC premium: 3% of payroll × ex-mod × per-carrier factor.
function estimatePremium(formData, factor = 1) {
  const pz = formData.pageZero || {}
  const state = pz.state || 'CA'
  const stateData = formData.coverage?.[state] || {}
  const totalPayroll = (stateData.classes || []).reduce((sum, c) => {
    const n = parseInt(String(c.payroll || '').replace(/[^0-9]/g, ''), 10) || 0
    return sum + n
  }, 0) || 480000
  const emod = Number(formData.underwriting?.experienceMod) || 1
  return Math.round(totalPayroll * 0.011 * emod * factor)
}

const FACTORS = {
  amtrust:     { factor: 0.90, bind: true },
  clearspring: { factor: 0.93, bind: true },
  cna:         { factor: 0.98, bind: true },
  employers:   { factor: 1.02, bind: true },
  hartford:    { factor: 1.05, bind: false, noquote: 'Class outside appetite for this state' },
  travelers:   { factor: 1.10, bind: true },
}

export default function Indication({ formData, onPickCarrier }) {
  const selected = formData.carrierSelection?.checked || {}

  const results = useMemo(() => {
    return CARRIERS
      .filter(c => selected[c.id])
      .map(c => {
        const meta = FACTORS[c.id] || { factor: 1, bind: true }
        return {
          ...c,
          price: estimatePremium(formData, meta.factor),
          bind: meta.bind,
          noquote: meta.noquote,
        }
      })
      .sort((a, b) => a.price - b.price)
  }, [formData, selected])

  const quoted = results.filter(r => !r.noquote)
  const noQuote = results.filter(r => r.noquote)

  return (
    <div className="w-full space-y-4">
      <p className="text-sm text-gray-500 -mt-2">
        {quoted.length} market{quoted.length === 1 ? '' : 's'} returned a price.
        Pick a carrier to continue into its flow — you can come back and switch.
      </p>

      {quoted.map((r, idx) => (
        <div
          key={r.id}
          className="rounded-xl p-5 flex items-center gap-4 flex-wrap"
          style={{
            background: 'white',
            border: r.reco ? '1.5px solid #7C3AED' : '1.5px solid #E5E7EB',
            boxShadow: r.reco ? '0 4px 20px rgba(92,46,212,0.12)' : 'none',
          }}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="text-base font-bold text-gray-900">{r.name}</p>
              {r.reco && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                  style={{ background: BRAND_GRADIENT }}>BTIS Serviced</span>
              )}
              {r.bind && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                  style={{ background: '#F3F0FF', color: '#5C2ED4', border: '1px solid rgba(92,46,212,0.15)' }}>
                  Instant bind
                </span>
              )}
              {r.promo && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                  style={{ background: 'rgba(166,20,195,0.10)', color: '#A614C3', border: '1px solid rgba(166,20,195,0.25)' }}>
                  +2% commission
                </span>
              )}
              {idx === 0 && !r.reco && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                  style={{ background: BRAND_GRADIENT }}>Best price</span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {r.reco ? 'Endorsements & billing handled by BTIS' : 'Carrier-serviced'} · {r.sla}
            </p>
          </div>

          <div className="text-right shrink-0">
            <p
              className="text-2xl font-bold leading-none"
              style={{
                background: BRAND_GRADIENT,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ${r.price.toLocaleString()}
              <span className="text-xs font-medium text-gray-400 ml-1"
                style={{ WebkitTextFillColor: '#9CA3AF' }}>
                /yr
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => onPickCarrier(r)}
            className="btn-gradient force-white-text shrink-0 px-6 py-2.5 rounded-lg text-sm font-bold"
            style={{ background: BRAND_GRADIENT, boxShadow: '0 2px 12px rgba(92,46,212,0.25)' }}
          >
            Continue →
          </button>
        </div>
      ))}

      {noQuote.map(r => (
        <div
          key={r.id}
          className="rounded-xl p-4 text-sm text-gray-500"
          style={{ border: '1px dashed #E5E7EB', background: 'white' }}
        >
          <b className="text-gray-800">{r.name}</b> — no quote: {r.noquote}.
        </div>
      ))}
    </div>
  )
}
