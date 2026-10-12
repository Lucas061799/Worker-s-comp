import { useMemo, useState } from 'react'
import { CARRIERS } from './CarrierSelection'
import {
  BRAND_GRADIENT, BrandText, CarrierLogo, InfoDot, InfoLine, InfoPanel, Tag,
} from '../../components/wc/primitives'

/* Rough WC premium: rate × payroll × ex-mod × per-carrier factor. The rate is
   set so the prototype's reference risk prices out where its own figures do —
   the old 0.011 came out around a quarter of that, which put every market far
   under the $20,000 referral threshold and made that rule unreachable. */
export const WC_RATE = 0.0494

// Rough WC premium: rate of payroll × ex-mod × per-carrier factor.
export function estimatePremium(formData, factor = 1) {
  const pz = formData.pageZero || {}
  const state = pz.state || 'CA'
  const stateData = formData.coverage?.[state] || {}
  const totalPayroll = (stateData.classes || []).reduce((sum, c) => {
    const n = parseInt(String(c.payroll || '').replace(/[^0-9]/g, ''), 10) || 0
    return sum + n
  }, 0) || 480000
  const emod = Number(formData.underwriting?.experienceMod) || 1
  return Math.round(totalPayroll * WC_RATE * emod * factor)
}

/* Factors are the prototype's own prices expressed as ratios, so the reference
   risk it was drawn against — $480K CA plumbing payroll, 0.87 mod — lands back
   on its figures while everything still scales with payroll. ICW/Zenith always
   declines there, which is the only way the declined-market state is reachable
   at all. Pie and Employers quote but need underwriting, so they do not bind
   online. */
export const FACTORS = {
  amtrust:       { factor: 1.000, bind: true },
  clearspring:   { factor: 1.178, bind: true },
  cna:           { factor: 1.274, bind: true },
  greatamerican: { factor: 1.074, bind: true },
  pie:           { factor: 1.445, bind: false },
  employers:     { factor: 1.673, bind: false },
  icwzenith:     { factor: 1, bind: false,
                   noquote: 'This class and payroll combination falls outside their current underwriting appetite' },
}


/* One way in for anyone who needs a carrier's number — the right rail used to
   carry its own copy of the rate and the factor table, which is exactly the
   sort of pair that drifts apart. */
export function premiumForCarrier(formData, carrierId) {
  return estimatePremium(formData, (FACTORS[carrierId] || { factor: 1 }).factor)
}

const money = (n) => '$' + Math.round(n).toLocaleString()

/* The prototype's breakdown exactly: premium, a flat BTIS service fee and
   the agent's own broker fee, totalled. It carries no tax and no stamping
   fee — the 2.35% and 0.2% lines that used to sit here were invented, and a
   quote is the wrong place to invent a charge. The broker fee is the agent's
   to set, so it is passed in rather than derived. */
const SERVICE_FEE = 250

export function feesFor(premium, brokerFee = 0) {
  return {
    service: SERVICE_FEE,
    broker: brokerFee,
    total: premium + SERVICE_FEE + brokerFee,
  }
}

/* One carrier, one tile — the prototype's grid rather than a stacked
   accordion, so every market and its price is on screen at once. What the
   accordion hid behind a chevron is behind the ⓘ instead: the servicing
   facts that are the same whoever is reading them. */
function CarrierTile({ carrier, best, selected, onSelect }) {
  const quoted = !carrier.noquote

  return (
    <div
      className={`rounded-2xl overflow-hidden flex flex-col transition ${selected ? 'im-edge-brand' : best ? 'im-edge-best' : ''}`}
      style={{
        background: quoted ? 'var(--surface-card)' : 'var(--surface-soft)',
        border: `1.5px solid ${selected ? '#5C2ED4' : best ? '#7C3AED' : 'var(--line)'}`,
        boxShadow: selected || best ? '0 2px 12px rgba(92,46,212,0.12)' : 'none',
      }}
    >
      {/* The carrier BTIS writes itself gets a banner across the top rather
          than a badge in the row, as the prototype has it. */}
      {carrier.reco && quoted && (
        <div
          className="px-3 py-1.5 flex items-center justify-center gap-1.5"
          style={{
            background: 'linear-gradient(88.09deg, rgba(92,46,212,0.12) 0%, rgba(166,20,195,0.12) 100%)',
            borderBottom: '1px solid var(--line-soft)',
          }}
        >
          <span className="text-[10px] font-bold tracking-wide">
            <BrandText>★ BTIS Recommended</BrandText>
          </span>
          <InfoDot
            title="Why BTIS Recommended?"
            label="Why BTIS Recommended?"
            text="BTIS holds full authority with this carrier for all processing — quicker quoting, faster endorsement turnaround, and in-house billing that collects your broker fee at new business and at renewal."
          />
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* The name sits beside its mark rather than under it — they are
              one piece of identification, and it buys the tile a line. */}
          <span className="flex items-center gap-2.5 min-w-0">
            <CarrierLogo carrier={carrier} size={40} />
            <span className={`text-sm font-bold leading-tight ${quoted ? 'text-gray-900' : 'text-gray-500'}`}>
              {carrier.name}
            </span>
          </span>
          <span className="flex items-center gap-1.5 shrink-0 self-start mt-1">
            {carrier.promo && quoted && <Tag tone="brand">Promo</Tag>}
            <InfoDot
              title={carrier.name}
              label={`${carrier.name} servicing details`}
              text={
                <span className="block space-y-1.5">
                  <span className="flex justify-between gap-4"><b className="font-semibold">Quote SLA</b>{carrier.sla}</span>
                  <span className="flex justify-between gap-4"><b className="font-semibold">Endorsement SLA</b>{carrier.endorsementSla}</span>
                  <span className="flex justify-between gap-4"><b className="font-semibold">Billing</b>{carrier.billing}</span>
                  <span className="flex justify-between gap-4"><b className="font-semibold">Underwriting</b>{carrier.reco ? 'BTIS authority' : 'Carrier'}</span>
                </span>
              }
            />
          </span>
        </div>

        {quoted ? (
          <>
            {/* The unit rides with the figure rather than taking a line of
                its own. The fee total is on the quote, where it is the
                number being paid — here it only competed with the price. */}
            <p className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl font-bold leading-none">
                <BrandText>{money(carrier.price)}</BrandText>
              </span>
              <span className="text-[11px] text-gray-400">/ yr indication</span>
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-3.5">
              {best && <Tag tone="brand">Best value</Tag>}
              <span className={`im-chip ${carrier.bind ? 'im-chip-good' : 'im-chip-muted'}`}>
                {carrier.bind ? 'Instant bind' : 'Refer'}
              </span>
            </div>

            {/* mt-auto floors the button however tall the rest of the tile
                runs, so a row of them ends on one line — and the padding is
                on the wrapper, because an auto margin collapses to nothing
                on the tile that happens to be the tallest, which left the
                button against the chips. */}
            <div className="mt-auto pt-5">
              <button
                type="button"
                onClick={onSelect}
                className="w-full h-10 inline-flex items-center justify-center rounded-xl text-sm font-bold transition"
                style={selected
                  ? { background: BRAND_GRADIENT, color: '#fff', boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }
                  : { background: 'var(--surface-card)', color: '#5C2ED4', border: '1.5px solid rgba(92,46,212,0.35)' }}
              >
                {selected ? '✓ Selected' : 'Select'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[13px] font-semibold text-gray-500">Carrier declined this risk</p>
            <p className="text-[11.5px] text-gray-400 leading-relaxed mt-1.5">{carrier.noquote}.</p>
          </>
        )}
      </div>
    </div>
  )
}

/* The prototype's threshold: the callout is offered only once prices are back
   and only when the cheapest of them is over this, so most submissions never
   see it. */
const REFERRAL_THRESHOLD = 20000

export default function Indication({ formData, onPickCarrier, onRefer, referralInPlay = false, onSelectionChange }) {
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
      /* A market that declined has no price to sort on, so it goes last
         rather than landing wherever its unused factor puts it. */
      .sort((a, b) => (!!a.noquote - !!b.noquote) || a.price - b.price)
  }, [formData, checked])

  const quoted = results.filter(r => !r.noquote)
  const selectedCarrier = results.find(r => r.id === selected)

  const lowest = quoted.length ? Math.min(...quoted.map(r => r.price)) : null
  const showRefer = !referralInPlay && lowest !== null && lowest > REFERRAL_THRESHOLD

  return (
    <div className="w-full">
      <p className="text-sm text-gray-500 -mt-2">
        {quoted.length} market{quoted.length === 1 ? '' : 's'} returned a price. Sorted by annual premium.
      </p>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 items-stretch">
        {results.map(r => (
          <CarrierTile
            key={r.id}
            carrier={r}
            best={r.id === quoted[0]?.id}
            selected={selected === r.id}
            /* The rail mirrors this, so the choice is announced rather than
               kept to this screen. */
            onSelect={() => setSelected(prev => {
              const next = prev === r.id ? null : r.id
              onSelectionChange && onSelectionChange(next)
              return next
            })}
          />
        ))}
      </div>

      {showRefer && (
        <div className="rounded-xl p-4 mt-3.5"
          style={{ background: 'var(--surface-soft)', border: '1px dashed var(--line-strong)' }}>
          {/* The copy is one block and the button sits against it. The
              prototype stacks the heading above a space-between row, which at
              this width left the sentence stranded far from the button. */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold mb-1" style={{ color: 'var(--ink)' }}>
                Didn't find the right quote?
              </p>
              <p className="text-[12.5px] text-gray-500">
                You can refer this submission to an underwriter for manual review.
              </p>
            </div>
            {/* The brand outline this page already gives Select — a grey
                button in a callout asking the agent to act read as disabled
                beside it. */}
            <button
              type="button"
              onClick={onRefer}
              className="px-4 py-2 rounded-lg text-xs font-bold transition shrink-0 hover:opacity-80"
              style={{ background: 'var(--surface-card)', color: '#5C2ED4', border: '1.5px solid rgba(92,46,212,0.35)' }}
            >
              Refer to Underwriter
            </button>
          </div>
        </div>
      )}

      {referralInPlay && (
        <InfoPanel
          lead="Referred to an underwriter."
          className="mt-3.5"
        >
          We'll notify you by email once a decision is available — typically 1–2 business days.
          Contact BTIS at 877.649.6682 for any changes.
        </InfoPanel>
      )}

      <InfoLine className="mt-6">
        Indications on the payroll and mod on file — the carrier's own questions come next.
      </InfoLine>

      {selectedCarrier && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => onPickCarrier(selectedCarrier)}
            className="flex items-center gap-2 px-7 py-2.5 text-sm font-semibold text-white rounded-xl transition hover:opacity-90"
            style={{ background: BRAND_GRADIENT, boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }}
          >
            Continue with {selectedCarrier.name}
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
