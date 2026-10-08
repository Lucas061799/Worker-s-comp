import { useState } from 'react'
import { BRAND_GRADIENT, PrimaryButton, Banner, BrandText, CarrierLogo, Tag, Modal, ModalButton } from '../../components/wc/primitives'
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

/* The screen an agent turns toward the client. One number, the two facts
   that qualify it, and a way out — anything more is the agent's view, not
   the client's. */
function ClientPresentModal({ price, carrier, effectiveDate, businessName, onClose }) {
  return (
    <div
      className="bop-page fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(15,10,40,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="im-modal max-w-md w-full rounded-2xl px-8 py-10 text-center"
        style={{ boxShadow: '0 32px 80px rgba(15,10,40,0.28)' }}
        onClick={e => e.stopPropagation()}
      >
        <p className="text-xs text-gray-400 mb-5">
          Workers' Compensation for {businessName || 'your client'}
        </p>

        <p className="text-5xl font-bold leading-none mb-2">
          <BrandText>${price.toLocaleString()}</BrandText>
        </p>
        <p className="text-sm text-gray-500 mb-8">
          per year · ${Math.round(price / 12).toLocaleString()}/mo with premium finance
        </p>

        <p className="text-xs text-gray-500 pt-5" style={{ borderTop: '1px solid #F3F4F6' }}>
          <span className="font-semibold text-gray-800">{carrier}</span>
          <span className="mx-1.5 text-gray-300">·</span>
          Effective {effectiveDate}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-8 h-10 px-6 inline-flex items-center justify-center rounded-xl text-sm font-semibold"
          style={{ background: 'white', color: '#6B7280', border: '1.5px solid #E5E7EB' }}
        >
          Close presentation
        </button>
      </div>
    </div>
  )
}

export default function Quote({ formData, updateFormData, onBound, onBack, onRefer }) {
  const pz = formData.pageZero || {}
  const biz = formData.business || {}
  const bindData = formData.bind || {}
  const state = pz.state || 'CA'
  const stateData = formData.coverage?.[state] || {}
  const payroll = (stateData.classes || []).reduce((s, c) => {
    const n = parseInt(String(c.payroll || '').replace(/[^0-9]/g, ''), 10) || 0
    return s + n
  }, 0) || 480000
  const emod = formData.underwriting?.experienceMod || '1.00'
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

      {/* Quote summary — Inland's bind card: the carrier and price on one
          line, then the terms as label/value rows. */}
      <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
        <div className="flex items-center justify-between gap-4 pb-5" style={{ borderBottom: '1px solid #F3F4F6' }}>
          <div className="flex items-center gap-3 min-w-0">
            {carrierMeta && <CarrierLogo carrier={carrierMeta} size={44} />}
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-gray-900 leading-tight">{carrier}</p>
              <p className="text-[11.5px] text-gray-400">{carrierMeta?.sub}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-3xl font-bold leading-none">
              <BrandText>${price.toLocaleString()}</BrandText>
            </p>
            <p className="text-[12px] text-gray-400 mt-1">per year</p>
          </div>
        </div>

        <div className="pt-1">
          <SummaryRow label="Named insured" value={biz.name || 'Sierra Ridge Plumbing Inc.'} />
          <SummaryRow label="Class" value={`${pz.mainClass || '5183'} · ${state}`} />
          <SummaryRow label="Annual payroll" value={`$${payroll.toLocaleString()}`} />
          <SummaryRow label="Experience mod" value={emod} />
          <SummaryRow label="Effective date" value={pz.effectiveDate || '08/01/2026'} last />
        </div>

        <div className="mt-5 pt-5" style={{ borderTop: '1px solid #F3F4F6' }}>
          <SummaryRow label="Workers' comp premium" value={money2(price)} />
          <SummaryRow label="BTIS service fee" value={money2(fees.service)} />
          <div className="flex items-center justify-between gap-4 py-2.5" style={{ borderBottom: '1px solid #F3F4F6' }}>
            <span className="text-xs text-gray-500">Broker fee</span>
            {/* The agent's own fee, set here and carried into billing — the
                only number on this page they can move. */}
            <span className="relative inline-flex items-center">
              <span className="absolute left-3 text-xs text-gray-400 pointer-events-none">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={brokerFee}
                onChange={e => updateFormData('bind', { brokerFee: e.target.value.replace(/[^0-9]/g, '') })}
                placeholder="0"
                aria-label="Broker fee"
                className="field-fill w-28 h-9 pl-6 pr-3 rounded-lg text-xs font-semibold text-right"
                style={{ border: '1px solid #E5E7EB', color: '#1F2937' }}
              />
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 pt-3">
            <span className="text-[13px] font-semibold text-gray-700">Grand total</span>
            <span className="text-[15px] font-bold">
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
          price={price}
          carrier={carrier}
          effectiveDate={pz.effectiveDate || '08/01/2026'}
          businessName={biz.name}
          mainClass={pz.mainClass}
          classDescription={pz.classDescription}
          onClose={() => setPresenting(false)}
        />
      )}

      {emailToast && (
        <Modal
          title="Quote emailed"
          width={440}
          onDismiss={() => setEmailToast(false)}
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
