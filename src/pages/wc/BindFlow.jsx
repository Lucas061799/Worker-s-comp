import { useState } from 'react'
import { Input, FormGrid } from '../../components/FormField'
import {
  FieldGroup,
  SectionLabel,
  InfoLine,
  AlertGlyph,
  StepNav,
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

/* Documents differ by carrier. Loss runs are taken as already received — this
   is a mockup, and the agent is not the one chasing them here. */
const DOCS_BY_CARRIER = {
  amtrust:       ['Signed loss runs', 'Inclusion/exclusion forms'],
  clearspring:   ['Inclusion/exclusion forms'],
  cna:           [],
  greatamerican: ['Inclusion/exclusion forms'],
  pie:           ['Signed loss runs', 'Inclusion/exclusion forms'],
  employers:     ['Signed loss runs', 'Inclusion/exclusion forms'],
}

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

function DocBox({ title, required, uploaded, onToggle }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--surface-soft)', border: '1px solid var(--line)' }}>
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <SectionLabel className="!mb-0">
          {title}{required && <span className="text-red-400 ml-0.5">*</span>}
        </SectionLabel>
        {uploaded && <span className="im-chip im-chip-good">On file</span>}
      </div>
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

export default function BindFlow({ carrier, premium, fees, quoteNumber, effectiveDate, onBack, onBound }) {
  const [step, setStep] = useState(0)
  const required = DOCS_BY_CARRIER[carrier?.id] ?? []
  const [docs, setDocs] = useState(() => Object.fromEntries(required.map(d => [d, true])))
  const [plan, setPlan] = useState(PLANS[0].id)
  const [card, setCard] = useState({ number: '', exp: '' })
  const [paid, setPaid] = useState(false)
  const [showErrors, setShowErrors] = useState(false)

  const grandTotal = fees?.total ?? premium
  const chosen = PLANS.find(p => p.id === plan) || PLANS[0]
  const down = Math.round(premium * chosen.downPct)
  const perInstallment = chosen.installments
    ? Math.round((grandTotal - down) / chosen.installments)
    : 0
  const dueToday = down + (fees?.service || 0) + (fees?.broker || 0)

  const subjectivities = SUBJECTIVITIES_BY_CARRIER[carrier?.id] ?? []
  const allDocsIn = required.every(d => docs[d])

  const back = () => (step === 0 ? onBack() : setStep(s => s - 1))

  /* ─────────── 1. Required documents ─────────── */
  if (step === 0) {
    return (
      <div className="w-full space-y-6">
        <Stepper at={0} />
        <FieldGroup label="Required documents">
          <p className="text-[12.5px] text-gray-500 leading-relaxed mb-4">
            {required.length
              ? `Upload the documents ${carrier?.name} needs to bind.`
              : `No additional documents required for ${carrier?.name}.`}
          </p>

          {required.length ? (
            <div className="space-y-4">
              {required.map(d => (
                <DocBox key={d} title={d} required={d === 'Signed loss runs'}
                  uploaded={!!docs[d]}
                  onToggle={() => setDocs(prev => ({ ...prev, [d]: !prev[d] }))} />
              ))}
              <div className="im-info-panel rounded-xl px-4 py-3 flex items-center gap-2.5">
                <span className="im-panel-icon w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                  <AlertGlyph className="w-3 h-3" />
                </span>
                <span className="text-[12px] text-gray-500 leading-relaxed">
                  Inclusion/exclusion forms can be emailed to wcbinds@btisinc.com within 72 hours of
                  binding instead — otherwise the policy is endorsed to remove the exclusion.
                </span>
              </div>
            </div>
          ) : (
            <div className="im-info-panel rounded-xl p-4 flex items-center gap-3">
              <span className="im-panel-icon w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <p className="text-[12.5px] text-gray-600 leading-relaxed">
                <span className="font-bold text-navy">Nothing to upload.</span>{' '}
                {carrier?.name} binds without additional documents.
              </p>
            </div>
          )}
        </FieldGroup>

        <StepNav onBack={back} onContinue={() => setStep(1)} canContinue={allDocsIn}
          hint={allDocsIn ? undefined : 'Every required document has to be accounted for before binding.'} />
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
              const d = Math.round(premium * p.downPct)
              const each = p.installments ? Math.round((grandTotal - d) / p.installments) : 0
              return (
                <button key={p.id} type="button" onClick={() => setPlan(p.id)}
                  className={`w-full text-left rounded-xl px-4 py-3.5 flex items-center gap-3 transition ${on ? 'im-edge-brand' : ''}`}
                  style={{ border: `1.5px solid ${on ? '' : 'var(--line)'}`, background: on ? 'var(--surface-soft)' : 'transparent' }}>
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

          <InfoLine className="mt-5">
            Plan terms are illustrative — the split differs by carrier and billing setup.
          </InfoLine>
        </FieldGroup>

        <StepNav onBack={back} onContinue={() => setStep(2)} />
      </div>
    )
  }

  /* ─────────── 3. Payment ─────────── */
  if (step === 2) {
    const cardOk = card.number.replace(/\D/g, '').length >= 15 && /^\d{2}\s*\/\s*\d{2}$/.test(card.exp.trim())
    return (
      <div className="w-full space-y-6">
        <Stepper at={2} />

        <FieldGroup label="Policy premium &amp; fees">
          <div className="rounded-xl p-4" style={{ background: 'var(--surface-soft)', border: '1px solid var(--line)' }}>
            {[
              ["Workers' Comp Premium", money(premium)],
              ['BTIS Service Fee', money2(fees?.service || 0)],
              ['Broker Fee', money2(fees?.broker || 0)],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4 py-1">
                <span className="text-xs text-gray-500">{k}</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--ink-2)' }}>{v}</span>
              </div>
            ))}
            <div className="mt-2 pt-2 flex items-center justify-between gap-4" style={{ borderTop: '1px solid var(--line)' }}>
              <span className="text-xs font-semibold" style={{ color: 'var(--ink-2)' }}>Grand Total</span>
              <span className="text-xs font-bold" style={{ color: 'var(--ink)' }}>{money2(grandTotal)}</span>
            </div>
          </div>
          <InfoLine className="mt-3.5">
            Read-only — to change these amounts, go back to the quote.
          </InfoLine>
        </FieldGroup>

        <FieldGroup label="Amount due today">
          <p className="text-2xl font-bold mb-4" style={{ color: 'var(--ink)' }}>{money2(dueToday)}</p>
          <FormGrid>
            <Input label="Card number" required value={card.number}
              onChange={v => setCard(c => ({ ...c, number: v }))}
              placeholder="4242 4242 4242 4242" digits maxLength={16}
              error={showErrors && !cardOk} />
            <Input label="Expiration" required value={card.exp}
              onChange={v => setCard(c => ({ ...c, exp: v }))}
              placeholder="MM / YY" maxLength={7}
              error={showErrors && !cardOk} />
          </FormGrid>
        </FieldGroup>

        <StepNav
          onBack={back}
          onContinue={() => { if (!cardOk) { setShowErrors(true); return } setPaid(true); setStep(3) }}
          continueLabel={`Pay ${money2(dueToday)}`}
          canContinue={cardOk}
          hint={cardOk ? undefined : 'Card details are needed to take the down payment.'}
        />
      </div>
    )
  }

  /* ─────────── 4. Subjectivities ─────────── */
  return (
    <div className="w-full space-y-6">
      <Stepper at={3} />

      {paid && (
        <div className="im-info-panel rounded-xl p-4 flex items-center gap-3">
          <span className="im-panel-icon w-7 h-7 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <p className="text-[12.5px] text-gray-600 leading-relaxed">
            <span className="font-bold text-navy">Payment received.</span>{' '}
            Review the subjectivities below, then bind the policy.
          </p>
        </div>
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
              <span className="text-[11px] font-bold shrink-0 mt-0.5" style={{ color: '#A614C3' }}>{i + 1}</span>
              <span className="text-[12.5px] leading-relaxed" style={{ color: 'var(--ink-2)' }}>{line}</span>
            </div>
          ))}
        </div>
      </FieldGroup>

      <StepNav
        onBack={back}
        /* The summary screen renders `carrier` as text, so it gets the name;
           the id rides alongside for anything that needs the record. */
        onContinue={() => onBound({
          carrier: carrier?.name,
          carrierId: carrier?.id,
          premium, grandTotal, quoteNumber, effectiveDate,
          plan: chosen.name, down, perInstallment,
          subjectivities,
        })}
        continueLabel="Bind"
      />
    </div>
  )
}
