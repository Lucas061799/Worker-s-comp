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


const money = (n) => '$' + Math.round(n).toLocaleString()

function turnaroundFor(carrier) {
  const m = (carrier.sla || '').match(/(\d+\D{1,2}\d+)\s*business days/i)
  return m ? `${m[1]} business days` : carrier.sla
}

/* Broker fee and statutory loads, so the row can show what the agent
   will actually be charged rather than the premium alone. */
function feesFor(premium) {
  const service = 95
  const tax = Math.round(premium * 0.0235)
  const stamping = Math.round(premium * 0.002)
  return { service, tax, stamping, total: premium + service + tax + stamping }
}

function FeeRow({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className={`text-xs ${bold ? 'font-semibold text-gray-700' : 'text-gray-500'}`}>{label}</span>
      <span className={`text-xs ${bold ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>{value}</span>
    </div>
  )
}

/* GL-BOP's Compare row: a stacked list where each carrier expands to
   show the fee breakdown, or why it did not quote. */
function CarrierRow({ carrier, best, expanded, onToggle, selected, onSelect }) {
  const quoted = !carrier.noquote
  const fees = quoted ? feesFor(carrier.price) : null

  return (
    <div
      className="rounded-lg transition overflow-hidden"
      style={{
        background: quoted ? 'white' : '#FAFAFB',
        border: `1.5px solid ${selected ? '#5C2ED4' : best ? '#7C3AED' : '#E5E7EB'}`,
        boxShadow: selected || best ? '0 2px 12px rgba(92,46,212,0.12)' : 'none',
      }}
    >
      <div className="px-4 py-3.5 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
            <span
              className="rounded-full shrink-0"
              style={{ width: 8, height: 8, background: BRAND_GRADIENT, opacity: quoted ? 1 : 0.4 }}
            />
            <span className={`text-sm font-semibold truncate ${quoted ? 'text-gray-800' : 'text-gray-500'}`}>
              {carrier.name}
            </span>
            {best && quoted && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white whitespace-nowrap"
                style={{ background: BRAND_GRADIENT }}
              >
                Best Value
              </span>
            )}
            {carrier.reco && <Tag tone="brand">BTIS Serviced</Tag>}
            {carrier.promo && <Tag tone="brand">+2% commission</Tag>}
            {!quoted && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{ background: 'rgba(156,163,175,0.18)', color: '#6B7280', border: '1px solid rgba(156,163,175,0.35)' }}
              >
                Not a fit
              </span>
            )}
          </div>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"
            style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          {quoted ? (
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-gray-800">{money(carrier.price)}</span>
                <span className="text-xs text-gray-400">/yr</span>
              </div>
              <div className="text-[11px] text-gray-400">
                {money(carrier.price / 12)}/mo · Total {money(fees.total)}
              </div>
            </div>
          ) : (
            <span className="text-xs text-gray-500 flex-1 min-w-0">
              {carrier.name} isn't quoting this risk today.
              <span className="font-semibold ml-1" style={{ color: '#5C2ED4' }}>
                {expanded ? 'Hide details' : 'See why →'}
              </span>
            </span>
          )}

          {quoted && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onSelect() }}
              className="px-4 py-2 rounded-lg text-xs font-bold transition shrink-0"
              style={selected || best
                ? { background: BRAND_GRADIENT, color: '#fff' }
                : { background: 'white', color: '#5C2ED4', border: '1.5px solid rgba(92,46,212,0.35)' }}
            >
              {selected ? '✓ Selected' : 'Select'}
            </button>
          )}
        </div>
      </div>

      {expanded && quoted && (
        <div className="px-4 pb-4 pt-3" style={{ borderTop: '1px solid #F3F4F6' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl p-4" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-2.5">Fee breakdown</div>
              <FeeRow label="Premium" value={money(carrier.price)} />
              <FeeRow label="Service fee" value={money(fees.service)} />
              <FeeRow label="Tax" value={money(fees.tax)} />
              <FeeRow label="Stamping fee" value={money(fees.stamping)} />
              <div className="mt-2 pt-2" style={{ borderTop: '1px solid #E5E7EB' }}>
                <FeeRow label="Total annual cost" value={money(fees.total)} bold />
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-2.5">Servicing</div>
              <FeeRow label="Handled by" value={carrier.reco ? 'BTIS' : 'Carrier'} />
              <FeeRow label="Endorsements" value={turnaroundFor(carrier)} />
              <FeeRow label="Billing" value={carrier.sub} />
              <FeeRow label="Bind online" value={carrier.bind ? 'Yes' : 'No'} />
            </div>
          </div>
        </div>
      )}

      {expanded && !quoted && (
        <div className="px-4 pb-4 pt-3" style={{ borderTop: '1px solid #E5E7EB' }}>
          <div className="rounded-xl p-4" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(124,58,237,0.18)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5C2ED4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-snug text-gray-800">
                  Why {carrier.name} didn't quote
                </p>
                <p className="text-[11px] leading-relaxed mt-0.5 text-gray-500">
                  Knowing this carrier's appetite helps you place future clients faster.
                </p>
              </div>
            </div>
            <p className="text-[12px] text-gray-700">{carrier.noquote}.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Indication({ formData, onPickCarrier }) {
  const checked = formData.carrierSelection?.checked || {}
  const [selected, setSelected] = useState(null)
  const [expanded, setExpanded] = useState(null)

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

      <div className="mt-5 space-y-2.5">
        {results.map(r => (
          <CarrierRow
            key={r.id}
            carrier={r}
            best={r.id === quoted[0]?.id}
            expanded={expanded === r.id}
            onToggle={() => setExpanded(prev => (prev === r.id ? null : r.id))}
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
