import { useMemo, useState } from 'react'
import { CARRIERS } from './CarrierSelection'
import { BRAND_GRADIENT, InfoLine, Tag } from '../../components/wc/primitives'

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


/* Inland Marine's option 3: one ringed card per carrier, the ring
   carrying the selection, with a Select pill and a bullets bar. Drawn
   in our tokens rather than its mint/navy ones. */
function bulletsFor(carrier) {
  return [
    carrier.reco ? 'BTIS-serviced' : 'Carrier-serviced',
    'Admitted',
    carrier.bind ? 'Bind online today' : null,
    turnaroundFor(carrier),
  ].filter(Boolean)
}

function turnaroundFor(carrier) {
  const m = (carrier.sla || '').match(/(\d+\D{1,2}\d+)\s*business days/i)
  return m ? `${m[1]} day endorsements` : carrier.sla
}

function CarrierCard({ carrier, selected, onSelect }) {
  const quoted = !carrier.noquote

  return (
    <div
      className="overflow-hidden rounded-2xl transition"
      style={{
        background: quoted ? 'white' : '#F9FAFB',
        boxShadow: selected
          ? '0 0 0 2px #5C2ED4, 0 6px 24px rgba(92,46,212,0.18)'
          : '0 0 0 1px #E5E7EB',
      }}
    >
      <div className="flex items-start justify-between gap-4 px-6 pt-5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className={`text-lg font-semibold ${quoted ? 'text-navy' : 'text-gray-400'}`}>
            {carrier.name}
          </span>
          {carrier.promo && <Tag tone="brand">+2% commission</Tag>}
          {carrier.reco && <Tag tone="brand">BTIS Serviced</Tag>}
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 px-6 pb-5 pt-3">
        <p className="text-xs text-gray-500 max-w-sm">
          {quoted ? carrier.sub : `No appetite — ${carrier.noquote.toLowerCase()}.`}
        </p>

        {quoted && (
          <div className="ml-auto flex items-end gap-6">
            <div className="text-right leading-none">
              <div>
                <span className="text-3xl font-bold text-navy">
                  ${carrier.price.toLocaleString()}
                </span>
                <span className="ml-1 text-sm text-gray-400">/yr</span>
              </div>
              <p className="mt-1.5 text-xs text-gray-500">Annual premium</p>
            </div>

            <button
              type="button"
              onClick={onSelect}
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition"
              style={selected
                ? { background: BRAND_GRADIENT, color: 'white', boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }
                : { background: 'white', color: '#5C2ED4', border: '1.5px solid rgba(92,46,212,0.35)' }}
            >
              {selected && (
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              )}
              {selected ? 'Selected' : 'Select'}
            </button>
          </div>
        )}
      </div>

      {quoted && (
        <div className="px-6 py-4" style={{ borderTop: '1px solid #F3F4F6' }}>
          <ul className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-gray-600">
            {bulletsFor(carrier).map((b, i) => (
              <li key={b} className={i === 0 ? 'font-semibold text-navy' : ''}>· {b}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function Indication({ formData, onPickCarrier }) {
  const checked = formData.carrierSelection?.checked || {}
  const [selected, setSelected] = useState(null)

  const results = useMemo(() => {
    return CARRIERS
      .filter(c => checked[c.id])
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
  }, [formData, checked])

  const quoted = results.filter(r => !r.noquote)
  const selectedCarrier = results.find(r => r.id === selected)

  return (
    <div className="w-full">
      <p className="text-sm text-gray-500 -mt-2">
        {quoted.length} market{quoted.length === 1 ? '' : 's'} returned a price. Sorted by annual premium.
      </p>

      <div className="mt-5 space-y-4">
        {results.map(r => (
          <CarrierCard
            key={r.id}
            carrier={r}
            selected={selected === r.id}
            onSelect={() => setSelected(prev => (prev === r.id ? null : r.id))}
          />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <InfoLine className="flex-1">
          Indications on the payroll and mod on file — the carrier's own questions come next.
        </InfoLine>
        {selectedCarrier && (
          <button
            type="button"
            onClick={() => onPickCarrier(selectedCarrier)}
            className="shrink-0 flex items-center gap-2 px-7 py-2.5 text-sm font-semibold text-white rounded-xl transition hover:opacity-90"
            style={{ background: BRAND_GRADIENT, boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }}
          >
            Continue with {selectedCarrier.name}
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
