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

/* ─────────── Pieces the three versions share ─────────── */

/* What is left once the two turnarounds are on the face: the servicing
   facts, which are the same whoever is reading them. */
function detailRows(carrier) {
  return [
    ['Billing', carrier.billing],
    ['Servicing', carrier.own],
    ['Underwriting', carrier.reco ? 'BTIS authority' : 'Carrier'],
  ].filter(([, v]) => v)
}

function DetailPanel({ carrier, className = '', style }) {
  return (
    <dl className={`px-5 pt-3.5 pb-4 space-y-2 ${className}`}
      style={{ borderTop: '1px solid var(--line)', background: 'var(--surface-soft)', ...style }}>
      {detailRows(carrier).map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 text-[11.5px] leading-snug">
          <dt className="font-semibold shrink-0 text-navy">{label}</dt>
          <dd className="text-right" style={{ color: 'var(--ink-2)' }}>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

/* How fast the market moves, beside what it costs — the one fact an agent
   trades price against, so it is on the face rather than behind the
   chevron. Two rows on every tile, so the grid stays level and the figures
   line up to be read across it. */
function SlaRows({ carrier, className = '' }) {
  return (
    <dl className={className} style={{ borderTop: '1px solid var(--line)' }}>
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
  )
}

/* The badge says there is a promotion; it does not say what one is. Pressing
   it tells you, rather than leaving the agent to find out at commission
   time. */
function PromoBadge({ carrier }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`What the ${carrier.name} promotion is`}
        className="inline-flex rounded-full transition hover:opacity-80"
      >
        <Tag tone="brand">Promo</Tag>
      </button>
      {open && (
        <Modal
          title="Q3 promotion"
          width={420}
          onDismiss={() => setOpen(false)}
          footerAlign="end"
          footer={<ModalButton onClick={() => setOpen(false)}>Got it</ModalButton>}
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
    </>
  )
}

function RecoDot() {
  return (
    <InfoDot
      title="Why BTIS Recommended?"
      label="Why BTIS Recommended?"
      text="BTIS holds full authority with this carrier for all processing — quicker quoting, faster endorsement turnaround, and in-house billing that collects your broker fee at new business and at renewal."
    />
  )
}

function Chevron({ open, label, onToggle, className = '' }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={`${label} servicing details`}
      className={`im-tile-chevron w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition ${className}`}
    >
      <svg className="w-3 h-3 transition-transform" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: open ? 'rotate(180deg)' : 'none' }} aria-hidden="true">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  )
}

function SelectButton({ onClick, className = '' }) {
  /* Outlined, not filled. Six solid gradient buttons in a grid read as six
     carriers already chosen; the choice has not been made yet, and filling
     in is what Bind does. */
  return (
    <button
      type="button"
      onClick={onClick}
      className={`im-btn-outline inline-flex items-center justify-center rounded-xl font-bold transition ${className}`}
    >
      Select
    </button>
  )
}

/* ─────────── Version 1 — the carrier leads ─────────── */

/* One carrier, one tile, identified first: the mark and the name across the
   top, the price under them, and what the carrier will do with the
   submission as a chip above the button. */
function CarrierTileV1({ carrier, onSelect, open, onToggle }) {
  const quoted = !carrier.noquote

  return (
    <div
      /* Every tile is drawn the same. The cheapest used to carry a brand
         edge and a glow, which read as a market already chosen rather than
         the one that happens to be first in a list sorted by price. */
      className="rounded-2xl overflow-hidden flex flex-col transition"
      style={{
        background: quoted ? 'var(--surface-card)' : 'var(--surface-soft)',
        border: '1.5px solid var(--line)',
      }}
    >
      {carrier.reco && quoted && (
        <div className="im-reco-banner px-3 py-1.5 flex items-center justify-center gap-1.5">
          <span className="text-[10px] font-bold tracking-wide">★ BTIS Recommended</span>
          <RecoDot />
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* The name sits beside its mark rather than under it — they are
              one piece of identification, and it buys the tile a line. */}
          <span className="flex items-center gap-2.5 min-w-0">
            <CarrierLogo carrier={carrier} size={40} />
            <span className={`text-sm font-bold leading-tight ${quoted ? 'text-gray-900' : 'text-gray-700'}`}>
              {carrier.name}
            </span>
          </span>
          <Chevron open={open} onToggle={onToggle} label={carrier.name} className="self-start mt-1" />
        </div>

        {quoted ? (
          <>
            {/* The unit rides with the figure rather than taking a line of
                its own. */}
            <p className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl font-bold leading-none" style={{ color: 'var(--ink)' }}>
                {money(carrier.price)}
              </span>
              <span className="text-[11px] text-gray-400">/ yr indication</span>
            </p>

            <SlaRows carrier={carrier} className="mt-3.5 pt-3 space-y-1.5" />

            {/* What the carrier will do with this submission leads — it is
                the thing that changes what happens next. */}
            <div className="flex flex-wrap items-center gap-2 mt-auto pt-3.5">
              <span className={`im-chip ${carrier.bind ? 'im-chip-good' : 'im-chip-muted'}`}>
                {carrier.bind ? 'Instant bind' : 'Refer to underwriter'}
              </span>
              {carrier.promo && <PromoBadge carrier={carrier} />}
            </div>

            {/* Two auto margins — here and above the chips — so a row stays
                level and the height the recommended banner adds to one tile
                is shared between its siblings' gaps instead of opening a
                hole in one of them. */}
            <div className="mt-auto pt-5">
              <SelectButton onClick={onSelect} className="w-full h-10 text-sm" />
            </div>
          </>
        ) : (
          <>
            {/* Muted, because the tile is not an option — but a step
                darker than it was: it still has to be read. */}
            <p className="text-[13px] font-semibold text-gray-700">Carrier declined this risk</p>
            <p className="text-[12px] text-gray-500 leading-relaxed mt-1.5">{carrier.noquote}.</p>
          </>
        )}
      </div>

      {open && <DetailPanel carrier={carrier} />}
    </div>
  )
}

/* ─────────── Version 2 — the price leads ─────────── */

/* The production screen's order, in our own chrome: the price is the first
   thing on the card, the carrier signs the bottom, and what decides what
   happens after Select is a tab notched into the card's top edge. */
function CarrierTileV2({ carrier, onSelect, open, onToggle }) {
  const quoted = !carrier.noquote

  return (
    <div
      /* No overflow clip: the status tab has to hang over the top edge, so
         the detail panel rounds its own corners. */
      className="rounded-2xl relative flex flex-col transition"
      style={{
        background: quoted ? 'var(--surface-card)' : 'var(--surface-soft)',
        border: '1.5px solid var(--line)',
      }}
    >
      <div className="relative px-5 pb-5 pt-7 flex-1 flex flex-col">
        {/* A referral is stated rather than left to be inferred from a
            missing tab, so every card in the row reads the same way. */}
        {quoted && (
          <span
            className={`absolute -top-[10px] left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-[3px] rounded-md text-[9.5px] font-extrabold tracking-[0.08em] ${
              carrier.bind ? 'im-bind-tab' : 'im-bind-tab-soft'
            }`}
          >
            {carrier.bind ? 'INSTANT BIND' : 'UNDERWRITER REVIEW'}
          </span>
        )}

        {/* The corner, because the price owns the centre line here. */}
        <Chevron open={open} onToggle={onToggle} label={carrier.name} className="absolute top-3 right-3" />

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
          <SlaRows carrier={carrier} className="mt-4 pt-3.5 space-y-1.5" />
        ) : (
          <p className="mt-4 pt-3.5 text-center text-[11.5px] leading-relaxed text-gray-500"
            style={{ borderTop: '1px solid var(--line)' }}>
            {carrier.noquote}.
          </p>
        )}

        {/* The carrier signs the card: the logo on its own line, as the
            production card has it, and the name under it with whatever marks
            that carrier carries. Both the stack and the name line have
            floors, so a card that carries a mark keeps its logo level with
            one that does not. */}
        <div className="mt-auto pt-5 flex flex-col items-center gap-2 min-h-[75px]">
          <CarrierLogo carrier={carrier} size={40} />
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 min-h-[27px]">
            <span className={`text-[13px] font-bold leading-tight ${quoted ? 'text-gray-900' : 'text-gray-700'}`}>
              {carrier.name}
            </span>
            {carrier.reco && quoted && (
              <span className="im-reco-mark">★ BTIS RECOMMENDED<RecoDot /></span>
            )}
            {carrier.promo && quoted && <PromoBadge carrier={carrier} />}
          </div>
        </div>

        {quoted && (
          <div className="pt-4">
            <SelectButton onClick={onSelect} className="w-full h-10 text-sm" />
          </div>
        )}
      </div>

      {open && <DetailPanel carrier={carrier} className="rounded-b-2xl" />}
    </div>
  )
}

/* ─────────── Version 3 — one market per line ─────────── */

/* The densest of the three: every market on one screen with nothing to
   scroll past, columns headed once instead of labelled on every card, and
   the figures stacked straight under each other to be compared. */
const V3_COLS = 'minmax(0,1fr) 104px 118px 132px 124px 92px 28px'

function QuoteTableHead() {
  return (
    <div
      className="im-quote-head grid items-center gap-3 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.06em]"
      style={{ gridTemplateColumns: V3_COLS, borderBottom: '1px solid var(--line)' }}
    >
      <span>Carrier</span>
      <span className="text-right">Est. annual</span>
      <span className="text-right">Quote</span>
      <span className="text-right">Endorsement</span>
      <span className="text-right">Status</span>
      <span aria-hidden="true" />
      <span aria-hidden="true" />
    </div>
  )
}

function CarrierRowV3({ carrier, onSelect, open, onToggle, last }) {
  const quoted = !carrier.noquote

  return (
    <div style={last ? undefined : { borderBottom: '1px solid var(--line)' }}>
      <div
        className="im-quote-row grid items-center gap-3 px-4 py-3"
        style={{ gridTemplateColumns: V3_COLS }}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <CarrierLogo carrier={carrier} size={32} />
          <span className="min-w-0">
            <span className={`block text-[13px] font-bold leading-tight ${quoted ? 'text-gray-900' : 'text-gray-700'}`}>
              {carrier.name}
            </span>
            {/* The marks ride under the name rather than taking a column of
                their own — only two carriers carry one. */}
            {quoted && (carrier.reco || carrier.promo) && (
              <span className="flex flex-wrap items-center gap-1.5 mt-1">
                {carrier.reco && <span className="im-reco-mark">★ BTIS RECOMMENDED<RecoDot /></span>}
                {carrier.promo && <PromoBadge carrier={carrier} />}
              </span>
            )}
          </span>
        </span>

        {quoted ? (
          <>
            <span className="text-right text-[15px] font-bold leading-none" style={{ color: 'var(--ink)' }}>
              {money(carrier.price)}
            </span>
            <span className="text-right text-[11.5px] font-semibold text-navy">
              {carrier.slaShort || carrier.sla}
            </span>
            <span className="text-right text-[11.5px] font-semibold text-navy">
              {carrier.endorsementSla}
            </span>
            <span className="flex justify-end">
              <span className={`im-chip ${carrier.bind ? 'im-chip-good' : 'im-chip-muted'}`}>
                {carrier.bind ? 'Instant bind' : 'Refer to UW'}
              </span>
            </span>
            <SelectButton onClick={onSelect} className="w-full h-8 text-[12.5px]" />
          </>
        ) : (
          <>
            <span className="text-right text-[13px] font-semibold text-gray-500">—</span>
            {/* The reason takes the two turnaround columns, which a declined
                market has nothing to put in. */}
            <span className="col-span-2 text-[11.5px] leading-snug text-gray-500">
              {carrier.noquote}.
            </span>
            <span className="flex justify-end">
              <span className="im-chip im-chip-muted">Declined</span>
            </span>
            <span aria-hidden="true" />
          </>
        )}

        <Chevron open={open} onToggle={onToggle} label={carrier.name} />
      </div>

      {open && (
        <dl className="grid gap-x-8 gap-y-1.5 px-4 pt-3 pb-3.5 sm:grid-cols-3"
          style={{ borderTop: '1px solid var(--line)', background: 'var(--surface-soft)' }}>
          {detailRows(carrier).map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3 text-[11.5px] leading-snug">
              <dt className="text-gray-500 shrink-0">{label}</dt>
              <dd className="font-semibold text-right text-navy">{value}</dd>
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

/* The three treatments, named where the switcher reads them. */
export const INDICATION_VERSIONS = [
  { value: 1, label: 'V1', title: 'Carrier-led cards' },
  { value: 2, label: 'V2', title: 'Price-led cards' },
  { value: 3, label: 'V3', title: 'Comparison table' },
]

export default function Indication({
  formData, onPickCarrier, onRefer, referralInPlay = false, version = 2,
}) {
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
      {/* Select is the decision — it carries straight on to the carrier's
          own questions, as the prototype's tiles do. The switch is one for
          the whole grid: these rows are here to be read across carriers,
          and opening them together is also what keeps a row level. */}
      {version === 3 ? (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface-card)', border: '1.5px solid var(--line)' }}>
          <QuoteTableHead />
          {results.map((r, i) => (
            <CarrierRowV3
              key={r.id}
              carrier={r}
              last={i === results.length - 1}
              onSelect={() => onPickCarrier(r)}
              open={detailsOpen}
              onToggle={() => setDetailsOpen(o => !o)}
            />
          ))}
        </div>
      ) : (
        /* V2's rows are set wider apart than its columns because the status
           tab hangs over each card's top edge — at an even 12px gap it came
           within a couple of pixels of the Select button on the card above.
           V1 has no tab, so its rows sit at the column gap. */
        <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 items-stretch ${
          version === 1 ? 'gap-3' : 'gap-x-3 gap-y-7'
        }`}>
          {results.map(r => {
            const Tile = version === 1 ? CarrierTileV1 : CarrierTileV2
            return (
              <Tile
                key={r.id}
                carrier={r}
                onSelect={() => onPickCarrier(r)}
                open={detailsOpen}
                onToggle={() => setDetailsOpen(o => !o)}
              />
            )
          })}
        </div>
      )}

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
