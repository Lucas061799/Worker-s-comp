import { useState } from 'react'
import { Input } from '../../components/FormField'
import { PrimaryButton, Banner, BrandText, CarrierLogo, SectionLabel, Modal, ModalButton } from '../../components/wc/primitives'
import { CARRIERS } from './CarrierSelection'
import { feesFor } from './Indication'

const money2 = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function SummaryRow({ label, value, last }) {
  return (
    <div
      className="flex items-center justify-between gap-4 py-2.5"
      style={last ? undefined : { borderBottom: '1px solid #F3F4F6' }}
    >
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-semibold text-gray-800 text-right">{value}</span>
    </div>
  )
}

/* Sep 1, 2026 — the date on a document handed to a client, not the ISO
   string the form stores. Accepts either shape and leaves anything it
   doesn't recognise alone. */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function prettyDate(raw) {
  if (!raw) return '—'
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw)
  const us = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(raw)
  const [y, m, d] = iso ? [iso[1], iso[2], iso[3]] : us ? [us[3], us[1], us[2]] : []
  if (!y) return raw
  return `${MONTHS[Number(m) - 1]} ${Number(d)}, ${y}`
}

/* The default plan the bind flow opens on, so the figure the client is
   shown is the one they will be billed. It is too long for half a sheet,
   so it breaks where it reads — the down payment, then the instalments —
   rather than wherever the column happens to run out. */
const DOWN_PCT = 0.10
const INSTALLMENTS = 11
function paymentLines(total) {
  const down = Math.round(total * DOWN_PCT)
  const each = Math.round((total - down) / INSTALLMENTS)
  return [
    `12-Pay · $${down.toLocaleString()} (10%) down`,
    `${INSTALLMENTS} × $${each.toLocaleString()}`,
  ]
}

function ProposalField({ label, lines }) {
  return (
    <div className="min-w-0">
      <SectionLabel className="!mb-1 !text-[10px] !pl-0">{label}</SectionLabel>
      {[].concat(lines).map((line, i) => (
        <p key={i} className="text-[13.5px] font-semibold leading-snug" style={{ color: 'var(--ink)' }}>
          {line}
        </p>
      ))}
    </div>
  )
}

/* The screen an agent turns toward the client: a proposal, not a dialog.
   It is the house sheet like every other modal — the facts left-aligned
   because that is how they are read, and the number last, since everything
   above it is what the number is for. The number shares its line with the
   way out, so the sheet ends on something rather than on a corner of white
   with a button parked in it. */
function ClientPresentModal({ total, carrier, effectiveDate, businessName, onClose }) {
  return (
    <Modal title="Workers' Compensation proposal" width={520} onDismiss={onClose}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 items-start">
        <ProposalField label="Prepared for" lines={businessName || 'Your client'} />
        <ProposalField label="Carrier" lines={carrier} />
        <ProposalField label="Effective" lines={prettyDate(effectiveDate)} />
        <ProposalField label="Payment" lines={paymentLines(total)} />
      </div>

      <div
        className="mt-6 pt-5 flex flex-wrap items-end justify-between gap-4"
        style={{ borderTop: '1px solid var(--line-soft)' }}
      >
        <p className="text-4xl font-bold leading-none">
          <BrandText>${total.toLocaleString()}</BrandText>
          <span className="text-[15px] font-semibold text-gray-400 ml-1.5">/ yr</span>
        </p>
        <ModalButton onClick={onClose}>Close presentation</ModalButton>
      </div>
    </Modal>
  )
}

export default function Quote({ formData, updateFormData, onBound, onBack, onRefer }) {
  const pz = formData.pageZero || {}
  const biz = formData.business || {}
  const bindData = formData.bind || {}
  const carrier = bindData.selectedCarrier || 'CNA'
  const carrierMeta = CARRIERS.find(c => c.name === carrier)
  const price = bindData.premium || 5240
  const brokerFee = bindData.brokerFee ?? ''
  const fees = feesFor(price, Number(brokerFee) || 0)

  const [presenting, setPresenting] = useState(false)
  const [emailToast, setEmailToast] = useState(false)
  const [binding, setBinding] = useState(false)

  const handleBind = () => {
    if (binding) return
    setBinding(true)
    setTimeout(() => {
      updateFormData('bind', { bound: true, boundAt: new Date().toISOString() })
      onBound && onBound({ premium: price, carrier })
    }, 900)
  }

  const handleEmail = () => setEmailToast(true)

  return (
    <div className="w-full space-y-6">
      {/* Eligibility banner — reuses the shared Banner primitive */}
      <Banner icon="check">
        <b className="text-gray-900">Good news!</b>{' '}
        This policy is eligible for Bind Online without underwriting review.
      </Banner>

      {/* Quote summary — the market it is with, and what it costs. The
          risk's own details are on the pages behind this one; repeating
          them here only pushed the total below the fold. */}
      <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
        <div className="flex items-center gap-3 min-w-0 pb-5" style={{ borderBottom: '1px solid #F3F4F6' }}>
          {carrierMeta && <CarrierLogo carrier={carrierMeta} size={44} />}
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-gray-900 leading-tight">{carrier}</p>
            <p className="text-[11.5px] text-gray-400">{carrierMeta?.sub}</p>
          </div>
        </div>

        <div className="pt-1">
          <SummaryRow label="Workers' comp premium" value={money2(price)} />
          <SummaryRow label="BTIS service fee" value={money2(fees.service)} />
          <div className="flex items-center justify-between gap-4 py-2.5" style={{ borderBottom: '1px solid #F3F4F6' }}>
            <span className="text-xs text-gray-500">Broker fee</span>
            {/* The agent's own fee, set here and carried into billing — the
                only number on this page they can move. */}
            {/* The house Input, not a hand-rolled one — the raw element
                missed focus:outline-none and wore Chrome's amber focus
                ring, which read as a validation error. */}
            <span className="relative inline-flex items-center w-32">
              <span className="absolute left-3.5 text-sm text-gray-400 pointer-events-none z-10">$</span>
              <Input
                className="w-full"
                align="right"
                digits
                value={brokerFee}
                onChange={v => updateFormData('bind', { brokerFee: v })}
                placeholder="0"
              />
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 pt-4">
            <span className="text-sm font-semibold text-gray-700">Grand total</span>
            <span className="text-2xl font-bold leading-none">
              <BrandText>{money2(fees.total)}</BrandText>
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="h-10 px-6 min-w-[112px] inline-flex items-center justify-center rounded-xl text-sm font-semibold mr-auto"
            style={{ background: 'white', color: '#6B7280', border: '1.5px solid #E5E7EB' }}
          >
            Back
          </button>
        )}
        <PrimaryButton onClick={handleBind} disabled={binding}>
          {binding ? 'Binding…' : 'Bind online'}
        </PrimaryButton>
        <button
          type="button"
          onClick={() => setPresenting(true)}
          className="h-10 px-6 min-w-[112px] inline-flex items-center justify-center rounded-xl text-sm font-semibold"
          style={{ background: 'white', color: '#5C2ED4', border: '1.5px solid rgba(92,46,212,0.35)' }}
        >
          Present quote
        </button>
        <button
          type="button"
          onClick={handleEmail}
          className="h-10 px-6 min-w-[112px] inline-flex items-center justify-center rounded-xl text-sm font-semibold"
          style={{ background: 'white', color: '#6B7280', border: '1.5px solid #E5E7EB' }}
        >
          Email quote
        </button>
      </div>

      {onRefer && (
        <div className="rounded-xl p-4 flex flex-wrap items-center justify-between gap-3"
          style={{ background: 'var(--surface-soft)', border: '1px solid var(--line)' }}>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-gray-700">Didn't find the right quote?</p>
            <p className="text-[12px] text-gray-500">Refer this submission to an underwriter for manual review.</p>
          </div>
          <button
            type="button"
            onClick={onRefer}
            className="h-9 px-4 inline-flex items-center justify-center rounded-lg text-xs font-semibold shrink-0"
            style={{ background: 'white', color: '#5C2ED4', border: '1.5px solid rgba(92,46,212,0.35)' }}
          >
            Refer to underwriter
          </button>
        </div>
      )}

      {presenting && (
        <ClientPresentModal
          total={fees.total}
          carrier={carrier}
          effectiveDate={pz.effectiveDate || '08/01/2026'}
          businessName={biz.name}
          onClose={() => setPresenting(false)}
        />
      )}

      {emailToast && (
        <Modal
          title="Quote emailed"
          width={440}
          onDismiss={() => setEmailToast(false)}
          footerAlign="end"
          footer={<ModalButton onClick={() => setEmailToast(false)}>OK</ModalButton>}
        >
          <p className="text-[14px] text-gray-600 leading-relaxed">
            Quote emailed to <b className="text-navy">Agent@btisinc.com</b>.
            Please contact BTIS if this email is incorrect.
          </p>
        </Modal>
      )}
    </div>
  )
}
