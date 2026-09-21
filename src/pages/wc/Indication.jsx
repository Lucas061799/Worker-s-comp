import { useMemo } from 'react'
import { CARRIERS } from './CarrierSelection'
import { CarrierLogo, PrimaryButton } from '../../components/wc/primitives'

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
    <div className="w-full space-y-3">
      <p className="text-sm text-gray-500 -mt-2">
        {quoted.length} market{quoted.length === 1 ? '' : 's'} returned a price.
        Pick a carrier to continue into its flow — you can come back and switch.
      </p>

      {quoted.map(r => (
        <div
          key={r.id}
          className="rounded-xl p-5 flex items-center gap-4 flex-wrap"
          style={{
            background: 'white',
            border: r.reco ? '1.5px solid #7C3AED' : '1.5px solid #E5E7EB',
            boxShadow: r.reco ? '0 4px 20px rgba(92,46,212,0.10)' : 'none',
          }}
        >
          <CarrierLogo carrier={r} size={40} />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="text-base font-bold text-gray-900">{r.name}</p>
              {r.reco && (
                <span className="im-chip"
                  style={{ background: 'linear-gradient(88.09deg, rgba(92,46,212,0.12) 0%, rgba(166,20,195,0.12) 100%)', color: '#5C2ED4' }}>
                  BTIS Serviced
                </span>
              )}
              {r.bind && <span className="im-chip im-chip-good">Bind online today</span>}
              {r.promo && <span className="im-chip im-chip-warn">+2% commission</span>}
            </div>
            <p className="text-xs text-gray-500">
              {r.reco ? 'Endorsements & billing handled by BTIS' : 'Carrier-serviced'} · {r.sla}
            </p>
          </div>

          <div className="text-right shrink-0">
            <p className="text-2xl font-bold leading-none text-gray-900">
              ${r.price.toLocaleString()}
              <span className="text-xs font-medium text-gray-400 ml-1">/yr</span>
            </p>
          </div>

          <PrimaryButton onClick={() => onPickCarrier(r)}>Continue</PrimaryButton>
        </div>
      ))}

      {noQuote.map(r => (
        <div
          key={r.id}
          className="rounded-xl p-4 text-sm text-gray-500 flex items-center gap-3"
          style={{ border: '1px dashed #E5E7EB', background: 'white' }}
        >
          <CarrierLogo carrier={r} size={32} />
          <span><b className="text-gray-800">{r.name}</b> — no quote: {r.noquote}.</span>
        </div>
      ))}
    </div>
  )
}
