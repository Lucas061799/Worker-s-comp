import { useMemo } from 'react'
import { CARRIERS } from './CarrierSelection'
import { BRAND_GRADIENT, CarrierLogo, InfoLine, SectionLabel, Tag } from '../../components/wc/primitives'

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

  const cheapest = quoted[0]?.id

  return (
    <div className="w-full space-y-5">
      <p className="text-sm text-gray-500 -mt-2">
        {quoted.length} market{quoted.length === 1 ? '' : 's'} returned a price.
        Pick a carrier to continue into its flow — you can come back and switch.
      </p>

      {/* Inland's comparison grid: one card per carrier, three up. */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {results.map(r => (
          <OutcomeCard
            key={r.id}
            carrier={r}
            best={r.id === cheapest}
            onSelect={() => onPickCarrier(r)}
          />
        ))}
      </div>

      <InfoLine>
        Prices are indications on the payroll and mod on file. The carrier's own
        questions come next, and the bound premium can move if an answer changes
        the rate.
      </InfoLine>
    </div>
  )
}

/* One carrier's answer: a price when they have one, and the reason in their
   own words when they do not — an agent should never have to guess why a
   carrier is missing from the list. */
function OutcomeCard({ carrier, best, onSelect }) {
  const isQuoted = !carrier.noquote

  return (
    <div
      className="rounded-2xl p-5 flex flex-col"
      style={{
        background: isQuoted ? 'white' : '#F9FAFB',
        border: `1.5px solid ${best ? '#5C2ED4' : '#E5E7EB'}`,
        boxShadow: best ? '0 6px 24px rgba(92,46,212,0.18)' : 'none',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <CarrierLogo carrier={carrier} size={56} />
        <div className="min-w-0">
          <p className={`text-[15px] font-bold leading-tight ${isQuoted ? 'text-gray-900' : 'text-gray-500'}`}>
            {carrier.name}
          </p>
          <p className="text-[11.5px] text-gray-400">{carrier.sub}</p>
        </div>
      </div>

      {!isQuoted && (
        <>
          <span className="im-chip im-chip-muted self-start mb-2.5">No appetite</span>
          <p className="text-[12.5px] text-gray-500 leading-relaxed">{carrier.noquote}.</p>
        </>
      )}

      {isQuoted && (
        <>
          <SectionLabel className="mb-1">Premium</SectionLabel>
          <span className="text-[30px] font-bold leading-none text-gray-900">
            ${carrier.price.toLocaleString()}
          </span>
          <p className="text-[12px] text-gray-400 mt-1">per year</p>

          <div className="mt-4 im-rule pt-3 space-y-1">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[12px] text-gray-500">Servicing</span>
              <span className="text-[12px] font-semibold text-gray-700">
                {carrier.reco ? 'BTIS' : 'Carrier'}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[12px] text-gray-500">Endorsements</span>
              <span className="text-[12px] font-semibold text-gray-700">
                {(carrier.sla || '').replace(/^Endorsements\s*/i, '')}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3.5">
            {carrier.bind && (
              <span className="im-chip im-chip-good">
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
                Bind online today
              </span>
            )}
            {carrier.reco && <Tag tone="brand">BTIS Serviced</Tag>}
            {carrier.promo && <Tag tone="brand">+2% commission</Tag>}
          </div>

          {/* mt-auto so the buttons land on one line however much sits above. */}
          <div className="mt-auto pt-5">
            <button
              type="button"
              onClick={onSelect}
              className="w-full h-10 inline-flex items-center justify-center rounded-xl text-[13px] font-bold transition-all force-white-text"
              style={{ background: BRAND_GRADIENT, color: 'white', boxShadow: '0 4px 16px rgba(92,46,212,0.25)' }}
            >
              Select
            </button>
          </div>
        </>
      )}
    </div>
  )
}
