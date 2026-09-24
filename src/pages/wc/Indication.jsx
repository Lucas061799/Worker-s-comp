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


/* Option 4's layout — a hairline between quotes, type doing the
   ranking, and the row itself as the control — drawn in our tokens
   rather than Inland Marine's navy/yellow/teal. */
function Radio({ checked }) {
  return (
    <span
      className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition"
      style={{ borderColor: checked ? '#A614C3' : '#D1D5DB' }}
    >
      {checked && (
        <span className="w-2 h-2 rounded-full" style={{ background: BRAND_GRADIENT }} />
      )}
    </span>
  )
}

/* Short phrases joined with a middot, so the line stays scannable. */
function bulletsFor(carrier) {
  return [
    carrier.reco ? 'BTIS-serviced' : 'Carrier-serviced',
    'Admitted',
    carrier.bind ? 'Bind online' : null,
  ].filter(Boolean).join(' · ')
}

function turnaroundFor(carrier) {
  const m = (carrier.sla || '').match(/(\d+\D{1,2}\d+)\s*business days/i)
  return m ? `${m[1]} day endorsements` : carrier.sla
}

function CarrierRow({ carrier, selected, onSelect }) {
  const quoted = !carrier.noquote

  return (
    <div style={{ borderTop: '1px solid #E5E7EB' }}>
      <button
        type="button"
        onClick={quoted ? onSelect : undefined}
        aria-pressed={selected}
        disabled={!quoted}
        className={`flex w-full items-start gap-4 py-5 text-left transition ${quoted ? '' : 'cursor-default'}`}
      >
        {quoted ? <Radio checked={selected} /> : <span className="mt-1 h-5 w-5 shrink-0" />}

        <div className="flex min-w-0 flex-1 items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-base ${selected ? 'font-bold' : 'font-semibold'} ${quoted ? 'text-navy' : 'text-gray-400'}`}>
                {carrier.name}
              </span>
              {carrier.promo && <Tag tone="brand">+2% commission</Tag>}
              {carrier.reco && <Tag tone="brand">BTIS Serviced</Tag>}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {quoted ? bulletsFor(carrier) : `No appetite — ${carrier.noquote.toLowerCase()}.`}
            </p>
          </div>

          {quoted && (
            <div className="shrink-0 text-right leading-none">
              <div>
                <span className="text-2xl font-bold text-navy">
                  ${carrier.price.toLocaleString()}
                </span>
                <span className="ml-1 text-xs text-gray-400">/yr</span>
              </div>
              <p className="mt-1.5 text-xs text-gray-500">{turnaroundFor(carrier)}</p>
            </div>
          )}
        </div>
      </button>
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

      <div className="mt-6" style={{ borderBottom: '1px solid #E5E7EB' }}>
        {results.map(r => (
          <CarrierRow
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
