import { useState } from 'react'
import { Input, FormGrid, Checkbox, Select, DateInput } from '../../components/FormField'
import {
  BRAND_GRADIENT,
  Modal,
  ModalButton,
  FieldGroup,
  PrimaryButton,
  SectionLabel,
  StepNav,
  InfoPanel,
  QuestionCard,
  CarrierLogo,
  YesNo,
} from '../../components/wc/primitives'

const money = (n) => '$' + Math.round(n).toLocaleString()
const money2 = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/* The prototype's plans. Down payment is a share of premium; the rest bills on
   the same day each month. */
const PLANS = [
  { id: '12pay',  name: '12-Pay',  downPct: 0.10, installments: 11 },
  { id: '10pay',  name: '10-Pay',  downPct: 0.10, installments: 9 },
  { id: '2pay',   name: '2-Pay',   downPct: 0.50, installments: 1 },
  { id: 'annual', name: 'Annual',  downPct: 1,    installments: 0 },
]

const CB_INSTALMENT_FEE = 10
const CB_INSTALMENT_SHARE = 0.326

/* The form stores an ISO date; CBIC's date field shows MM/DD/YYYY. */
function isoToUs(iso) {
  const [y, m, d] = String(iso).split('-')
  return y && m && d ? `${m}/${d}/${y}` : ''
}

/* Three treatments of the payment step, offered so the shape can be chosen
   by looking at it rather than described. */
const PAY_LAYOUTS = [
  { value: '1', label: 'Payment 1 — stacked bars' },
  { value: '2', label: 'Payment 2 — ledger beside the card' },
  { value: '3', label: "Payment 3 — CBIC's billing cards" },
]

/* Documents differ by carrier, and none of them start satisfied: binding is
   where the agent actually supplies them. */
const INCL_EXCL = 'Inclusion/exclusion forms'

const DOCS_BY_CARRIER = {
  amtrust:       ['Signed loss runs', 'Inclusion/exclusion forms'],
  clearspring:   ['Inclusion/exclusion forms'],
  cna:           [],
  greatamerican: ['Inclusion/exclusion forms'],
  pie:           ['Signed loss runs', 'Inclusion/exclusion forms'],
  employers:     ['Signed loss runs', 'Inclusion/exclusion forms'],
}

/* How the premium gets paid, which is what the bind flow's help text turns
   on. The prototype's carrier-pay carriers also take a down payment on their
   own site; that hand-off is theirs to handle, so it is left out here and only
   the invoicing difference remains. */
const BIND_TYPE = {
  amtrust: 'carrier-pay',
  clearspring: 'direct-invoice',
  cna: 'direct-invoice',
  greatamerican: 'direct-invoice',
  pie: 'carrier-pay',
  employers: 'carrier-pay',
}

function bindHelpFor(carrier) {
  const name = carrier?.name || 'the carrier'
  return BIND_TYPE[carrier?.id] === 'carrier-pay'
    ? `${name} requires signed documents up front, then the BTIS Service Fee here before we bind.`
    : `Submit the documents below, pay the BTIS Service Fee, and we bind — ${name} invoices the insured directly for premium.`
}

/* What clicking Bind actually asserts. The prototype's wording, unchanged:
   it is the record BTIS keeps in place of a signed proposal. */
const BIND_CONFIRMATIONS = [
  'I am the authorized representative/producer for the named insured and am authorized to submit this application and bind coverage on their behalf.',
  'The information submitted in this application is true, accurate, and complete to the best of my knowledge.',
  'I have reviewed the coverage, premium, effective date, exclusions, and any subjectivities shown above, and I am authorizing BTIS to bind and issue the policy on these terms.',
  'I understand this electronic submission and confirmation, together with the attached quote, constitute my acceptance of these terms in place of a signed proposal, and that BTIS will retain this record as evidence of the transaction.',
  'I agree to conduct this transaction electronically and understand that this electronic confirmation is legally equivalent to a physical signature.',
]

const SUBJECTIVITIES_BY_CARRIER = {
  amtrust: ['3 years of loss runs on file and reviewed.', 'Insured maintains a written safety program.'],
  clearspring: ['Signed ACORD 130 on file.', 'Insured does not perform any roofing or elevated work above 30ft.'],
  cna: ['CSLB exemption waiver acknowledgment on file.', 'Insured maintains an active safety program.'],
  greatamerican: ['3 years of loss runs on file and reviewed.', 'Insured does not subcontract more than 10% of total operations.'],
  pie: ['Supplemental application on file and reviewed.', 'Insured maintains a formal return-to-work program.'],
  employers: ['Experience rating worksheet reviewed and on file.', 'Insured does not do any work above 30ft.', 'No employees operate heavy equipment without certification.'],
}

const STEPS = ['Documents', 'Payment plan', 'Payment', 'Subjectivities']

function Stepper({ at }) {
  return (
    <div className="flex items-center gap-2 flex-wrap mb-5">
      {STEPS.map((label, i) => {
        const done = i < at
        const here = i === at
        return (
          <span key={label} className="flex items-center gap-2">
            <span className={`im-chip ${here ? 'im-chip-brand' : done ? 'im-chip-good' : 'im-chip-muted'}`}>
              {done ? '✓' : i + 1} {label}
            </span>
            {i < STEPS.length - 1 && <span className="text-gray-300 text-[11px]">—</span>}
          </span>
        )
      })}
    </div>
  )
}

/* A heading and a drop target. It used to wrap both in a card, which put
   a box inside a box inside the group's own card — three borders deep for
   one upload. The dashed target is the only frame it needs. */
/* CBIC's bind card, brought over for the third payment layout: two options
   stay on screen and the one chosen opens its own questions inside the same
   card, under a thin rule. */
function ChoiceCard({ selected, label, detail, onSelect, children }) {
  return (
    <div
      className={`rounded-xl transition-all field-fill ${selected ? 'im-edge-brand' : ''}`}
      style={{ border: `1.5px solid ${selected ? '' : 'var(--line)'}` }}
    >
      <button type="button" onClick={onSelect} className="w-full text-left px-4 py-3.5 flex items-start gap-3">
        <span className={`w-4 h-4 rounded-full shrink-0 mt-0.5 flex items-center justify-center border-2 ${selected ? 'yn-ring' : 'yn-off-ring'}`}>
          {selected && <span className="w-1.5 h-1.5 rounded-full yn-dot" />}
        </span>
        <span className="min-w-0">
          <span className="block text-[13.5px] font-bold" style={{ color: 'var(--ink)' }}>{label}</span>
          {detail && (
            <span className="block text-[12px] text-gray-500 leading-relaxed mt-0.5">{detail}</span>
          )}
        </span>
      </button>
      {/* What it opens lines up with the label, not the card edge. */}
      {selected && children && (
        <div className="pl-11 pr-4 pb-4">
          <div className="pt-4 space-y-4" style={{ borderTop: '1px solid var(--line)' }}>{children}</div>
        </div>
      )}
    </div>
  )
}

function ChoiceGroup({ title, children }) {
  return (
    <div>
      <p className="text-[13px] font-bold mb-1" style={{ color: 'var(--ink)' }}>{title}</p>
      {children}
    </div>
  )
}

function ChoiceRadio({ checked, onChange, label, note }) {
  return (
    <label onClick={onChange} className="flex items-start gap-2.5 cursor-pointer select-none py-1.5">
      <span className={`w-[18px] h-[18px] rounded-full shrink-0 flex items-center justify-center border-2 ${checked ? 'yn-ring' : 'yn-off-ring'}`}>
        {checked && <span className="w-1.5 h-1.5 rounded-full yn-dot" />}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] leading-[18px]" style={{ color: 'var(--ink)' }}>{label}</span>
        {note && <span className="block text-[12px] leading-snug text-gray-400 mt-0.5">{note}</span>}
      </span>
    </label>
  )
}

/* CBIC's right-hand rail: what the policy costs, kept beside the screen
   that commits to it, with the broker fee editable from here. It mounts in
   the shell next to <main>, the way this app's right rail always has —
   sticky, full height, its own surface — not inside the page's content. */
export function QuoteRail({ carrier, insured, premium, service, brokerFee, onBrokerFee, isDark = false }) {
  const fee = Number(String(brokerFee ?? '').replace(/\D/g, '')) || 0
  const gross = premium + service
  const totalDue = gross + fee
  const Row = ({ label, value, bold }) => (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className={`text-[12.5px] ${bold ? 'font-bold' : ''}`}
        style={{ color: bold ? 'var(--ink)' : 'var(--ink-2)' }}>{label}</span>
      <span className="text-[12.5px] font-bold" style={{ color: 'var(--ink)' }}>{value}</span>
    </div>
  )
  return (
    <aside
      className="w-72 2xl:w-80 flex flex-col h-full sticky top-0 shrink-0"
      style={{
        background: isDark ? '#191D35' : 'white',
        borderLeft: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6',
      }}
    >
      <div className="p-5 flex-1 overflow-y-auto sidebar-nav">
      <h3 className="text-base font-bold text-navy">Quote in Progress</h3>
      <div className="flex items-center justify-between gap-3 mt-1.5">
        <span className="text-[11.5px] text-gray-400">All progress auto-saved</span>
        <span className="text-[11.5px] font-bold text-gradient">75%</span>
      </div>
      <div className="im-progress-track h-1.5 rounded-full mt-2 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: '75%', background: BRAND_GRADIENT }} />
      </div>

      <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--line-soft)' }}>
        <h4 className="text-sm font-bold mb-4" style={{ color: 'var(--ink)' }}>Premium Breakdown</h4>

        <div className="flex items-center gap-3 mb-4">
          <CarrierLogo carrier={carrier} size={32} />
          <p className="text-[12px] font-semibold leading-snug min-w-0" style={{ color: 'var(--ink)' }}>
            {insured || carrier?.name}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-[12px] font-semibold" style={{ color: 'var(--ink)' }}>Enter your Broker Fee:</p>
            <p className="text-[10.5px] text-gray-400">(included in Total Due)</p>
          </div>
          <div className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 w-[86px] shrink-0 field-fill"
            style={{ border: '1px solid var(--line)' }}>
            <span className="text-[12px] text-gray-400">$</span>
            <input
              value={brokerFee ?? ''}
              onChange={e => onBrokerFee && onBrokerFee(e.target.value.replace(/\D/g, ''))}
              placeholder="0"
              className="w-full bg-transparent text-[12.5px] text-right focus:outline-none"
              style={{ color: 'var(--ink)' }}
            />
          </div>
        </div>

        <Row label="Workers' Comp Premium:" value={money(premium)} />
        <Row label="BTIS Service Fee:" value={money(service)} />
        <Row label="Gross Total:" value={money(gross)} bold />
        <Row label="Broker Fee:" value={money(fee)} />
        <div className="my-2" style={{ borderTop: '1px solid var(--line)' }} />
        <Row label="Total Due:" value={money(totalDue)} bold />
      </div>

      <button
        type="button"
        /* 12px, not 13: the label is long and the rail is 300px, so at the
           larger size it broke onto a second line. */
        className="w-full mt-5 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-[12px] font-bold whitespace-nowrap transition hover:opacity-90 force-white-text"
        style={{ background: BRAND_GRADIENT, color: 'white', boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12m0 0l-4-4m4 4 4-4M5 21h14" />
        </svg>
        Download Binding Application
      </button>
      </div>
    </aside>
  )
}

function DocBox({ title, required, uploaded, onToggle }) {
  return (
    <div>
      <SectionLabel className="!mb-2">
        {title}{required && <span className="text-red-400 ml-0.5">*</span>}
      </SectionLabel>
      {uploaded ? (
        <div className="flex items-center gap-2.5 rounded-lg px-3 py-2.5"
          style={{ background: 'var(--fill-subtle)', border: '1px solid var(--line-soft)' }}>
          <svg className="w-4 h-4 shrink-0" style={{ color: '#A614C3' }} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-[12.5px] truncate flex-1" style={{ color: 'var(--ink-2)' }}>
            {title.toLowerCase().replace(/[^a-z]+/g, '-')}.pdf
          </span>
          <button type="button" onClick={onToggle}
            className="im-remove w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition" aria-label="Remove">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M7 7l10 10M17 7L7 17" />
            </svg>
          </button>
        </div>
      ) : (
        <button type="button" onClick={onToggle}
          className="add-another-btn w-full flex items-center justify-center gap-2 text-xs font-semibold border border-dashed border-[#A614C3]/30 rounded-xl px-4 py-5 transition">
          <svg className="w-4 h-4" style={{ color: '#A614C3' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
          </svg>
          <span className="text-gradient">Drag &amp; drop files here, or click to upload</span>
        </button>
      )}
    </div>
  )
}

export default function BindFlow({ carrier, premium, fees, quoteNumber, effectiveDate, onBack, onBound, insuredName, brokerFee, onBrokerFee, payVariant = 1, onPayVariantChange }) {
  const [step, setStep] = useState(0)
  const required = DOCS_BY_CARRIER[carrier?.id] ?? []
  const [docs, setDocs] = useState({})
  /* The inclusion/exclusion forms have a second way out: send them within
     72 hours and accept the endorsement if they don't arrive. */
  const [inclAck, setInclAck] = useState(false)
  const [plan, setPlan] = useState(PLANS[0].id)
  const [card, setCard] = useState({ number: '', exp: '' })
  const [paid, setPaid] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  // The fee disclosure has to be acknowledged before the card is charged.
  const [authorising, setAuthorising] = useState(false)
  /* Bind is the signature, so the terms it stands for are shown before it
     is taken, not after. */
  const [confirming, setConfirming] = useState(false)
  const [bill, setBill] = useState('direct')
  const [payBy, setPayBy] = useState('complete')
  /* What the third layout asks for. It is CBIC's screen, so these are its
     fields, not this flow's: the step is reviewed and signed here rather
     than paid for. */
  const [cbEffective, setCbEffective] = useState(effectiveDate ? isoToUs(effectiveDate) : '')
  const [cbReview, setCbReview] = useState('no')
  const [cbInstalment, setCbInstalment] = useState('ten-pay')
  const [signMethod, setSignMethod] = useState('esign')
  const [insuredEmail, setInsuredEmail] = useState('')
  const [attested, setAttested] = useState(false)

  const grandTotal = fees?.total ?? premium
  const chosen = PLANS.find(p => p.id === plan) || PLANS[0]
  /* Plans divide the grand total — fees included — not the premium, and what
     is due today is that down payment on its own. Taking the share off the
     premium and then adding the fees on top billed a different number. */
  const amountsFor = (p) => {
    const d = Math.round(grandTotal * p.downPct * 100) / 100
    const remaining = Math.round((grandTotal - d) * 100) / 100
    return { down: d, inst: p.installments ? Math.round((remaining / p.installments) * 100) / 100 : 0 }
  }
  const { down, inst: perInstallment } = amountsFor(chosen)
  const dueToday = down

  /* CBIC's own schedule: a $10 fee per instalment, and the instalments
     carrying 32.6% of the financed total — back-solved from its worked
     example, and carried over here unchanged. */
  const cbOnePay = grandTotal + CB_INSTALMENT_FEE
  const cbFinanced = grandTotal + CB_INSTALMENT_FEE * 10
  const cbInstalmentAmt = Math.round((cbFinanced * CB_INSTALMENT_SHARE / 9) * 100) / 100
  const cbDown = Math.round((cbFinanced - cbInstalmentAmt * 9) * 100) / 100

  const subjectivities = SUBJECTIVITIES_BY_CARRIER[carrier?.id] ?? []
  const allDocsIn = required.every(d =>
    docs[d] || (d === INCL_EXCL && inclAck))

  const back = () => (step === 0 ? onBack() : setStep(s => s - 1))

  /* ─────────── 1. Required documents ─────────── */
  if (step === 0) {
    return (
      <div className="w-full space-y-6">
        <Stepper at={0} />
        <FieldGroup label="Required documents">
          {/* The flow differs by carrier, so the screen says how this one
              works rather than leaving the agent to infer it. */}
          <p className="text-[12.5px] text-gray-500 leading-relaxed mb-4">
            {bindHelpFor(carrier)}
          </p>

          {required.length ? (
            <div className="space-y-5">
              {required.map(d => (
                <DocBox key={d} title={d} required={d === 'Signed loss runs'}
                  uploaded={!!docs[d]}
                  onToggle={() => setDocs(prev => ({ ...prev, [d]: !prev[d] }))} />
              ))}

              {/* The forms' second path stands outside their box: it is an
                  undertaking the agent gives, not another thing in the
                  folder. */}
              {required.includes(INCL_EXCL) && (
                <Checkbox
                  align="start"
                  checked={inclAck}
                  onChange={setInclAck}
                  label={<>
                    I will email <b className="font-semibold text-navy">wcbinds@btisinc.com</b> or
                    upload within 72 hours of binding — otherwise I acknowledge the policy will be
                    endorsed to remove the exclusion/inclusion.
                  </>}
                />
              )}
            </div>
          ) : (
            <InfoPanel
              icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>}
              lead="Nothing to upload."
            >
              {carrier?.name} binds without additional documents.
            </InfoPanel>
          )}
        </FieldGroup>

        <StepNav onBack={back} onContinue={() => setStep(1)} canContinue={allDocsIn} />
      </div>
    )
  }

  /* ─────────── 2. Payment plan ─────────── */
  if (step === 1) {
    return (
      <div className="w-full space-y-6">
        <Stepper at={1} />
        <FieldGroup label="Payment plan">
          <p className="text-[12.5px] text-gray-500 leading-relaxed mb-4">
            Choose how the insured will pay. The down payment shown is due today; any remaining
            installments bill automatically on the same day each month.
          </p>

          <div className="space-y-2.5">
            {PLANS.map(p => {
              const on = p.id === plan
              const { down: d, inst: each } = amountsFor(p)
              return (
                <button key={p.id} type="button" onClick={() => setPlan(p.id)}
                  /* A card on the group's soft panel, so it takes the control
                     fill — white in light, a lifted translucent white in dark.
                     The chosen one used --surface-soft and the rest were
                     transparent, which is the panel's own colour either way:
                     four rows that were not surfaces at all, only edges. */
                  className={`w-full text-left rounded-xl px-4 py-3.5 flex items-center gap-3 transition field-fill ${on ? 'im-edge-brand' : ''}`}
                  style={{ border: `1.5px solid ${on ? '' : 'var(--line)'}` }}>
                  <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${on ? 'yn-ring' : 'yn-off-ring'}`}>
                    {on && <span className="w-1.5 h-1.5 rounded-full yn-dot" />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>{p.name}</span>
                    <span className="block text-[12px] text-gray-500">
                      {p.installments
                        ? `${money(d)} down · ${p.installments} × ${money(each)}`
                        : 'Paid in full today'}
                    </span>
                  </span>
                  <span className="text-[13px] font-bold shrink-0" style={{ color: 'var(--ink)' }}>{money(d)}</span>
                </button>
              )
            })}
          </div>
        </FieldGroup>

        <StepNav onBack={back} onContinue={() => setStep(2)} />
      </div>
    )
  }

  /* ─────────── 3. Payment ─────────── */
  if (step === 2) {
    const cardOk = card.number.replace(/\D/g, '').length >= 15 && /^\d{2}\s*\/\s*\d{2}$/.test(card.exp.trim())
    const planLine = chosen.installments
      ? `Selected plan: ${chosen.name} — ${chosen.installments} × ${money2(perInstallment)} to follow.`
      : `Selected plan: ${chosen.name} (paid in full today).`

    const ledger = [
      ["Workers' Comp Premium", money2(premium)],
      ['BTIS Service Fee', money2(fees?.service || 0)],
      ['Broker Fee', money2(fees?.broker || 0)],
    ]
    const Ledger = ({ className = '', style }) => (
      <div className={className} style={style}>
        {ledger.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-4 py-1">
            <span className="text-[13px] text-gray-500">{k}</span>
            <span className="text-[13px] font-semibold" style={{ color: 'var(--ink-2)' }}>{v}</span>
          </div>
        ))}
        <div className="mt-2.5 pt-3 flex items-center justify-between gap-4" style={{ borderTop: '1px solid var(--line)' }}>
          <span className="text-[13px] font-semibold" style={{ color: 'var(--ink-2)' }}>Grand Total</span>
          <span className="text-base font-bold" style={{ color: 'var(--ink)' }}>{money2(grandTotal)}</span>
        </div>
      </div>
    )

    const pay = () => { if (!cardOk) { setShowErrors(true); return } setAuthorising(true) }

    return (
      <div className="w-full space-y-6">
        <Stepper at={2} />

        {/* ── Layout 1: two stacked bars, the prototype's shape ── */}
        {payVariant === 1 && (
          <>
            <FieldGroup label="Policy premium &amp; fees">
              {/* The amounts on white, the note on the group's grey beneath —
                  the figures are the content of this bar and read as a block
                  rather than four lines on a background. */}
              <Ledger className="rounded-lg px-5 py-4"
                style={{ background: 'var(--surface-card)', border: '1px solid var(--line-soft)' }} />
              <p className="text-[11.5px] text-gray-400 mt-3">
                Read-only — to change these amounts, go back to the quote.
              </p>
            </FieldGroup>

            <FieldGroup label="Amount due today">
              <p className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>{money2(dueToday)}</p>
              <p className="text-[12px] text-gray-500 mt-1">{planLine}</p>
              <FormGrid className="mt-4">
                <Input label="Card number" required value={card.number}
                  onChange={v => setCard(c => ({ ...c, number: v }))}
                  placeholder="4242 4242 4242 4242" digits maxLength={16}
                  error={showErrors && !cardOk} />
                <Input label="Expiration" required value={card.exp}
                  onChange={v => setCard(c => ({ ...c, exp: v }))}
                  placeholder="MM / YY" maxLength={7}
                  error={showErrors && !cardOk} />
              </FormGrid>
              {/* The payment is taken here, beside its own status, rather than
                  from the footer — this screen advances on being paid. */}
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                <PrimaryButton onClick={pay} disabled={!cardOk}>Pay {money2(dueToday)}</PrimaryButton>
                <span className={`im-chip ${paid ? 'im-chip-good' : 'im-chip-muted'}`}>
                  {paid ? 'Paid' : 'Not yet paid'}
                </span>
              </div>
              {!cardOk && (
                <p className="text-[12px] text-gray-400 mt-2.5">
                  Card details are needed to take the down payment.
                </p>
              )}
            </FieldGroup>
          </>
        )}

        {/* ── Layout 2: what it costs beside what to do about it, the shape
               the quote screen uses one step earlier ── */}
        {payVariant === 2 && (
          <FieldGroup label="Payment">
            <div className="flex flex-col lg:flex-row lg:items-stretch gap-6 lg:gap-0">
              <div className="w-full lg:w-[400px] shrink-0 lg:pr-10">
                <Ledger />
                <p className="text-[11.5px] text-gray-400 mt-3.5">
                  Read-only — to change these amounts, go back to the quote.
                </p>
              </div>
              <div className="w-full lg:flex-1 lg:pl-10 lg:border-l" style={{ borderColor: 'var(--line)' }}>
                <SectionLabel className="!mb-1.5">Due today</SectionLabel>
                <p className="text-3xl font-bold leading-none" style={{ color: 'var(--ink)' }}>{money2(dueToday)}</p>
                <p className="text-[12px] text-gray-500 mt-2">{planLine}</p>
                <div className="space-y-4 mt-5">
                  <Input label="Card number" required value={card.number}
                    onChange={v => setCard(c => ({ ...c, number: v }))}
                    placeholder="4242 4242 4242 4242" digits maxLength={16}
                    error={showErrors && !cardOk} />
                  <Input label="Expiration" required value={card.exp}
                    onChange={v => setCard(c => ({ ...c, exp: v }))}
                    placeholder="MM / YY" maxLength={7}
                    error={showErrors && !cardOk} />
                </div>
                <PrimaryButton className="w-full mt-5" onClick={pay} disabled={!cardOk}>
                  Pay {money2(dueToday)}
                </PrimaryButton>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`im-chip ${paid ? 'im-chip-good' : 'im-chip-muted'}`}>
                    {paid ? 'Paid' : 'Not yet paid'}
                  </span>
                </div>
              </div>
            </div>
          </FieldGroup>
        )}

        {/* ── Layout 3: CBIC's — the premium read back, then billing chosen
               as a card that opens its own questions ── */}
        {/* ── Layout 3: CBIC's screen, transcribed. Its own two sections,
               its own copy, its own choices — the premium ledger and the
               card fields of the other two do not appear here, because they
               do not appear there. ── */}
        {payVariant === 3 && (
          <>
            <div>
              <SectionLabel>Step 1: Review / Edit the Application</SectionLabel>
              <FieldGroup>
                <div className="flex flex-wrap items-start gap-x-10 gap-y-5">
                  <DateInput
                    label="Effective Date"
                    required
                    value={cbEffective}
                    onChange={setCbEffective}
                    className="w-[220px]"
                  />
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-600 mb-1.5 tracking-wide">
                      Review Application:
                    </label>
                    {/* The pills are shorter than the date field, so they sit
                        centred in a box of the same height rather than riding
                        high beside it. */}
                    <div className="h-[42px] flex items-center">
                      <YesNo value={cbReview} onChange={setCbReview} name="Review application" />
                    </div>
                  </div>
                </div>
              </FieldGroup>
            </div>

            <div>
              <SectionLabel>Step 2: Select Payment and Request to Bind</SectionLabel>
              <div className="space-y-2.5">
                <ChoiceCard
                  selected={bill === 'direct'}
                  onSelect={() => setBill('direct')}
                  label={
                    <span className="inline-flex items-center flex-wrap gap-x-2 gap-y-1">
                      Direct Bill
                      <span className="px-2 py-[3px] rounded-full text-[8.5px] font-bold leading-none tracking-[0.12em] -translate-y-px"
                        style={{ background: BRAND_GRADIENT, color: 'white' }}>
                        RECOMMENDED
                      </span>
                    </span>
                  }
                  detail="The carrier bills the insured, with 1 pay or 10 pay options. $10 fee added per installment"
                >
                  <ChoiceGroup title="Select installment options">
                    <ChoiceRadio
                      checked={cbInstalment === 'one-pay'}
                      onChange={() => setCbInstalment('one-pay')}
                      label={`One payment of ${money2(cbOnePay)}`}
                    />
                    <ChoiceRadio
                      checked={cbInstalment === 'ten-pay'}
                      onChange={() => setCbInstalment('ten-pay')}
                      label={`9 payments of ${money2(cbInstalmentAmt)} with ${money2(cbDown)} down`}
                    />
                  </ChoiceGroup>

                  <ChoiceGroup title="Choose how to pay">
                    <ChoiceRadio
                      checked={payBy === 'complete'}
                      onChange={() => setPayBy('complete')}
                      label="Complete payment for Applicant"
                    />
                    <ChoiceRadio
                      checked={payBy === 'send'}
                      onChange={() => setPayBy('send')}
                      label="Send to Applicant for payment"
                    />
                  </ChoiceGroup>
                </ChoiceCard>

                <ChoiceCard
                  selected={bill === 'agency'}
                  onSelect={() => setBill('agency')}
                  label="Agency Bill"
                  detail="The agency bills the insured and collects premium."
                />
              </div>
            </div>

            <div>
              <SectionLabel>Signature</SectionLabel>
              <p className="text-[12px] text-gray-400 mb-3">
                The application has to be signed by the insured before it binds.
              </p>

              <div className="space-y-2.5">
                <ChoiceCard
                  selected={signMethod === 'esign'}
                  onSelect={() => setSignMethod('esign')}
                  label="eSign"
                  detail="(We will send the client an electronic signature request)"
                >
                  <div className="sm:max-w-sm">
                    <Input
                      label="Insured's email"
                      required
                      value={insuredEmail}
                      onChange={setInsuredEmail}
                      placeholder="name@company.com"
                    />
                  </div>
                </ChoiceCard>

                <ChoiceCard
                  selected={signMethod === 'upload'}
                  onSelect={() => setSignMethod('upload')}
                  label="Upload or email signed application"
                  detail="(You will collect the manual signature and upload the signed application)"
                >
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-semibold transition hover:opacity-90 force-white-text"
                    style={{ background: BRAND_GRADIENT, color: 'white', boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }}
                  >
                    Download Binding Application
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3v12m0 0l-4-4m4 4 4-4M5 21h14" />
                    </svg>
                  </button>
                </ChoiceCard>
              </div>

              {/* The attestation is the last thing asked for, so it gets a
                  card of its own rather than sitting loose under the
                  signature choices. */}
              <QuestionCard className="mt-5">
                <Checkbox
                  label="As an agent, I agree that information entered in this application is correct to my knowledge."
                  checked={attested}
                  onChange={setAttested}
                  align="start"
                />
                {/* Indented past the box and its gap so the note starts where
                    the agreement it qualifies starts. */}
                <p className="text-xs text-gray-400 mt-1 pl-[28px]">
                  {signMethod === 'upload'
                    ? 'Nothing binds until the signed application is checked.'
                    : 'Nothing binds until the insured signs.'}
                </p>
              </QuestionCard>

              <button
                type="button"
                disabled={!attested}
                onClick={() => attested && setStep(3)}
                className="mt-5 inline-flex items-center gap-2 h-10 px-6 rounded-xl text-sm font-bold transition disabled:cursor-not-allowed"
                style={attested
                  ? { background: BRAND_GRADIENT, color: 'white', boxShadow: '0 4px 14px rgba(92,46,212,0.25)' }
                  : { background: 'var(--fill-disabled)', color: '#9CA3AF' }}
              >
                Request to Bind
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </>
        )}
        <StepNav onBack={back} />

        {/* A demo control, not part of the flow: three treatments of this one
            step so the shape can be chosen by looking at it. The figures and
            the arithmetic are the same in all three. */}
        <div className="pt-4" style={{ borderTop: '1px solid var(--line-soft)' }}>
          <div style={{ width: 340 }}>
            <Select
              label="Payment layout"
              wideMenu
              options={PAY_LAYOUTS}
              value={String(payVariant)}
              onChange={v => onPayVariantChange && onPayVariantChange(Number(v))}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Demo only — the figures and the arithmetic are the same in all three.
          </p>
        </div>

        {authorising && (
          <Modal
            title="Authorize payment"
            width={520}
            onDismiss={() => setAuthorising(false)}
            footer={
              <>
                <ModalButton variant="ghost" onClick={() => setAuthorising(false)}>Cancel</ModalButton>
                <ModalButton onClick={() => { setAuthorising(false); setPaid(true); setStep(3) }}>
                  Authorize
                </ModalButton>
              </>
            }
          >
            <p className="text-[13.5px] text-gray-600 leading-relaxed">
              The applicable BTIS service fee for this policy is{' '}
              <b className="text-navy">{money2(fees?.service || 0)}</b>. By authorizing payment,
              you acknowledge receipt of this fee disclosure and confirm that you are responsible
              for providing any disclosures to, and obtaining any acknowledgement from, the
              applicant/insured.
            </p>
            <p className="text-[13.5px] text-gray-600 leading-relaxed mt-3">
              I authorize a one-time payment in the amount of{' '}
              <b className="text-navy">{money2(dueToday)}</b> from the card specified above
              on {new Date().toLocaleDateString('en-US')}.
            </p>
          </Modal>
        )}
      </div>
    )
  }

  /* ─────────── 4. Subjectivities ─────────── */
  return (
    <div className="w-full space-y-6">
      <Stepper at={3} />

      {paid && (
        <InfoPanel
          icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>}
          lead="Payment received."
        >
          Review the subjectivities below, then bind the policy.
        </InfoPanel>
      )}

      <FieldGroup label="Subjectivities">
        <p className="text-[12.5px] text-gray-500 leading-relaxed mb-4">
          Conditions {carrier?.name} attaches to this risk. Clicking Bind confirms them on the
          insured's behalf.
        </p>
        <div className="space-y-2.5">
          {subjectivities.map((line, i) => (
            <div key={i} className="rounded-xl px-4 py-3 flex items-start gap-2.5"
              style={{ background: 'var(--surface-soft)', border: '1px solid var(--line)' }}>
              {/* A dot, not a rank — these are conditions, and numbering
                  them implied an order they do not have. Offset to the
                  centre of the first line rather than the top of it. */}
              <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-[7px]" style={{ background: '#A614C3' }} />
              <span className="text-[12.5px] leading-relaxed" style={{ color: 'var(--ink-2)' }}>{line}</span>
            </div>
          ))}
        </div>
      </FieldGroup>

      <StepNav onBack={back} onContinue={() => setConfirming(true)} continueLabel="Bind" />

      {confirming && (
        <Modal
          title="By clicking Bind, I confirm that:"
          width={560}
          onDismiss={() => setConfirming(false)}
          footer={
            <>
              <ModalButton variant="ghost" onClick={() => setConfirming(false)}>Back</ModalButton>
              {/* The summary screen renders `carrier` as text, so it gets the
                  name; the id rides alongside for anything that needs the
                  record. */}
              <ModalButton onClick={() => onBound({
                carrier: carrier?.name,
                carrierId: carrier?.id,
                premium, grandTotal, quoteNumber, effectiveDate,
                plan: chosen.name, down, perInstallment,
                subjectivities,
              })}>
                Bind
              </ModalButton>
            </>
          }
        >
          <div className="space-y-3">
            {BIND_CONFIRMATIONS.map((line, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-[8px]" style={{ background: '#A614C3' }} />
                <span className="text-[13px] leading-relaxed" style={{ color: 'var(--ink-2)' }}>{line}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}
