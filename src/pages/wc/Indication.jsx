import { useMemo, useState } from 'react'
import { CARRIERS } from './CarrierSelection'
import {
  CarrierLogo, InfoDot, InfoPanel,
  Modal, ModalButton, Tag,
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

/* One carrier, one tile. The price leads and the carrier signs the bottom,
   which is the order the production screen puts them in — an agent reading
   this grid is comparing numbers, not looking a carrier up. What decides what
   happens after Select is a tab on the card's top edge, so it is read before
   the price rather than found underneath it. */
function CarrierTile({ carrier, onSelect, open }) {
  const quoted = !carrier.noquote
  const [promoOpen, setPromoOpen] = useState(false)

  /* What is left once the two turnarounds are on the face: the servicing
     facts, which are the same whoever is reading them. One switch opens them
     across the whole grid and sits above it — these rows exist to be read
     across carriers, and a chevron on every card promised a per-card panel it
     never was. */
  const details = [
    ['Billing', carrier.billing],
    ['Servicing', carrier.own],
    ['Underwriting', carrier.reco ? 'BTIS authority' : 'Carrier'],
  ].filter(([, v]) => v)

  return (
    <div
      /* Every tile is drawn the same. The cheapest used to carry a brand
         edge and a glow, which read as a market already chosen rather than
         the one that happens to be first in a list sorted by price.

         No overflow clip any more: the status tab has to hang over the top
         edge, so the banner and the detail panel round their own corners. */
      className="rounded-2xl relative flex flex-col transition"
      style={{
        background: quoted ? 'var(--surface-card)' : 'var(--surface-soft)',
        border: '1.5px solid var(--line)',
      }}
    >
      <div className="relative px-5 pb-5 pt-7 flex-1 flex flex-col">
        {/* The tab straddles the card's own top edge. A referral is stated
            rather than left to be inferred from a missing tab, so every card
            in the row reads the same way. */}
        {quoted && (
          <span
            className={`absolute -top-[10px] left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-[3px] rounded-md text-[9.5px] font-extrabold tracking-[0.08em] ${
              carrier.bind ? 'im-bind-tab' : 'im-bind-tab-soft'
            }`}
          >
            {carrier.bind ? 'INSTANT BIND' : 'UNDERWRITER REVIEW'}
          </span>
        )}

        {quoted ? (
          <>
            {/* Solid, not the brand gradient. The gradient made the one
                number on the tile the decorative thing on it. */}
            <p className="text-center text-[28px] font-bold leading-none" style={{ color: 'var(--ink)' }}>
              {money(carrier.price)}
            </p>
            <p className="text-center text-[11px] text-gray-500 mt-1.5">Est. annual</p>
          </>
        ) : (
          <>
            {/* Where the price would be, so the card still lines up with the
                row it sits in. */}
            <p className="text-center text-[17px] font-bold leading-none text-gray-700">Not available</p>
            <p className="text-center text-[11px] text-gray-500 mt-1.5">Carrier declined this risk</p>
          </>
        )}

        {quoted ? (
          /* How fast the market moves, beside what it costs. These were
             behind the chevron, which made the one fact an agent trades
             price against the one fact they had to go looking for. */
          <dl className="mt-4 pt-3.5 space-y-1.5" style={{ borderTop: '1px solid var(--line)' }}>
            {[
              ['Quote', carrier.slaShort || carrier.sla],
              ['Endorsement', carrier.endorsementSla],
            ].map(([label, value]) => (
              <div key={label}
                className="flex items-baseline justify-between gap-3 text-[11.5px] leading-snug">
                <dt className="text-gray-500 shrink-0">{label}</dt>
                <dd className="font-semibold text-right text-navy">{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-4 pt-3.5 text-center text-[11.5px] leading-relaxed text-gray-500"
            style={{ borderTop: '1px solid var(--line)' }}>
            {carrier.noquote}.
          </p>
        )}

        {/* The carrier signs the card: the logo on its own line, as the
            production card has it, and the name under it with whatever marks
            that carrier carries. Stacked rather than strung along one row
            because the recommended chip and a name together ran past the
            card and wrapped, which lifted that logo clear of its row-mates'.
            The floor is the stack's own height, so a name that wraps —
            Berkshire Hathaway GUARD — still leaves the row level. */}
        <div className="mt-auto pt-5 flex flex-col items-center gap-2 min-h-[75px]">
          <CarrierLogo carrier={carrier} size={40} />
          {/* The floor is the tallest mark a name can carry, so the cards
              that carry one keep their logo on the same line as the cards
              that do not. */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 min-h-[27px]">
          <span className={`text-[13px] font-bold leading-tight ${quoted ? 'text-gray-900' : 'text-gray-700'}`}>
            {carrier.name}
          </span>
          {/* The carrier BTIS writes itself. This was a banner across the
              top of the card, which is the one place the status tab now
              needs — and which gave that one tile a taller head, dropping
              its price a line below its row-mates'. */}
          {carrier.reco && quoted && (
            <span className="im-reco-mark">
              ★ BTIS RECOMMENDED
              <InfoDot
                title="Why BTIS Recommended?"
                label="Why BTIS Recommended?"
                text="BTIS holds full authority with this carrier for all processing — quicker quoting, faster endorsement turnaround, and in-house billing that collects your broker fee at new business and at renewal."
              />
            </span>
          )}
          {/* The badge says there is a promotion; it does not say what one
              is. Pressing it tells you, rather than leaving the agent to
              find out at commission time. It signs on with the carrier,
              because that is what it is a fact about — not this price. */}
          {carrier.promo && quoted && (
            <button
              type="button"
              onClick={() => setPromoOpen(true)}
              aria-label={`What the ${carrier.name} promotion is`}
              className="inline-flex rounded-full transition hover:opacity-80"
            >
              <Tag tone="brand">Promo</Tag>
            </button>
          )}
          </div>
        </div>

        {quoted && (
          <div className="pt-4">
            {/* Outlined, not filled. Six solid gradient buttons in a grid
                read as six carriers already chosen; the choice has not
                been made yet, and filling in is what Bind does. */}
            <button
              type="button"
              onClick={onSelect}
              className="im-btn-outline w-full h-10 inline-flex items-center justify-center rounded-xl text-sm font-bold transition"
            >
              Select
            </button>
          </div>
        )}
      </div>

      {promoOpen && (
        <Modal
          title="Q3 promotion"
          width={420}
          onDismiss={() => setPromoOpen(false)}
          footerAlign="end"
          footer={<ModalButton onClick={() => setPromoOpen(false)}>Got it</ModalButton>}
        >
          <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-2)' }}>
            <b className="font-semibold text-navy">
              +2% boosted commission on {carrier.name} binds.
            </b>{' '}
            Applies to policies bound with {carrier.name} through BTIS this quarter.
            Nothing to enrol in — the uplift is applied when the policy binds, on
            new business and at renewal.
          </p>
        </Modal>
      )}

      {open && (
        <dl className="rounded-b-2xl px-5 pt-3.5 pb-4 space-y-2"
          style={{ borderTop: '1px solid var(--line)', background: 'var(--surface-soft)' }}>
          {details.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 text-[11.5px] leading-snug">
              <dt className="font-semibold shrink-0 text-navy">{label}</dt>
              <dd className="text-right" style={{ color: 'var(--ink-2)' }}>{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

/* The prototype's threshold: the callout is offered only once prices are back
   and only when the cheapest of them is over this, so most submissions never
   see it. */
const REFERRAL_THRESHOLD = 20000

export default function Indication({ formData, onPickCarrier, onRefer, referralInPlay = false }) {
  /* No market-selection screen any more, so an absent list means every
     carrier rather than none. A record written when that screen existed
     still narrows to what it chose. */
  const checked = formData.carrierSelection?.checked

  const results = useMemo(() => {
    return CARRIERS
      .filter(c => !checked || checked[c.id])
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

  const lowest = quoted.length ? Math.min(...quoted.map(r => r.price)) : null
  const showRefer = !referralInPlay && lowest !== null && lowest > REFERRAL_THRESHOLD

  /* One switch for the grid rather than one per tile: these rows exist to
     be read across carriers, and opening them together keeps the row level
     — a single tile growing stretches its row-mates and opens a gap above
     their buttons. */
  const [detailsOpen, setDetailsOpen] = useState(false)

  return (
    <div className="w-full">
      {/* The switch sits above the grid because that is what it does: one
          press opens the panel on every card. Seven chevrons promised seven
          separate panels and delivered one. */}
      <div className="flex justify-end mb-3.5">
        <button
          type="button"
          onClick={() => setDetailsOpen(o => !o)}
          aria-expanded={detailsOpen}
          className="im-link-razz inline-flex items-center gap-1.5 text-[12px] font-semibold transition"
        >
          {detailsOpen ? 'Hide servicing details' : 'Show servicing details'}
          <svg className="w-3 h-3 transition-transform" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: detailsOpen ? 'rotate(180deg)' : 'none' }} aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* The rows are set wider apart than the columns because the status tab
          hangs over each card's top edge — at a even 12px gap it came within a
          couple of pixels of the Select button on the card above. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-3 gap-y-7 items-stretch">
        {results.map(r => (
          <CarrierTile
            key={r.id}
            carrier={r}
            /* Select is the decision — it carries straight on to the
               carrier's own questions, as the prototype's tiles do. */
            onSelect={() => onPickCarrier(r)}
            open={detailsOpen}
          />
        ))}
      </div>

      {showRefer && (
        <div className="rounded-xl p-4 mt-3.5"
          /* The card surface, not --surface-soft: that is the page's own
             colour, so the panel had nothing but its dashed edge. */
          style={{ background: 'var(--surface-card)', border: '1px dashed var(--line-strong)' }}>
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
              className="im-btn-outline px-4 py-2 rounded-lg text-xs font-bold transition shrink-0"
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

      {/* The one thing on this screen worth a footnote is the badge, since
          it decides whether an underwriter sees the submission at all. */}
      {/* The card rule, not the soft one: this line sits on the page's own
          background rather than on a card, and --line-soft is a shade off it. */}
      <p className="text-[11.5px] text-gray-500 leading-relaxed mt-6 pt-5"
        style={{ borderTop: '1px solid var(--line)' }}>
        <b className="font-semibold text-navy">*INSTANT BIND</b> — This risk qualifies for instant
        binding. Complete the carrier-specific questions to confirm eligibility and bind without
        underwriting referral required.
      </p>

    </div>
  )
}
