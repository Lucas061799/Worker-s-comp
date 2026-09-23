import { useState } from 'react'
import { BRAND_GRADIENT, PrimaryButton, Banner, BrandText, CarrierLogo, Tag } from '../../components/wc/primitives'
import { CARRIERS } from './CarrierSelection'

/* The screen an agent turns toward the client. One number, the two facts
   that qualify it, and a way out — anything more is the agent's view, not
   the client's. */
function ClientPresentModal({ price, carrier, effectiveDate, businessName, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(15,10,40,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="max-w-md w-full rounded-2xl px-8 py-10 text-center"
        style={{ background: 'white', boxShadow: '0 32px 80px rgba(15,10,40,0.28)' }}
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

export default function Quote({ formData, updateFormData, onBound, onBack }) {
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

  const handleEmail = () => {
    setEmailToast(true)
    setTimeout(() => setEmailToast(false), 2500)
  }

  return (
    <div className="w-full space-y-6">
      {/* Eligibility banner — reuses the shared Banner primitive */}
      <Banner>
        <b className="text-gray-900">Bind-online eligible.</b>{' '}
        Nothing here refers to underwriting — if a risk will refer, you'll always see that <i>before</i> you submit.
      </Banner>

      {/* Quote hero — the price over the terms it was rated on, stacked
          rather than split across an empty gutter. */}
      <div className="rounded-2xl p-6 md:p-8" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
        <div className="flex items-center gap-4 mb-5 flex-wrap">
          {carrierMeta && <CarrierLogo carrier={carrierMeta} size={48} />}
          <div className="min-w-0">
            <p className="text-4xl md:text-5xl font-bold leading-none">
              <BrandText>${price.toLocaleString()}</BrandText>
              <span className="text-base text-gray-500 font-normal ml-2">/yr</span>
            </p>
            <p className="text-sm text-gray-500 mt-1.5">
              {carrier} · effective {pz.effectiveDate || '08/01/2026'}
            </p>
          </div>
          {carrierMeta?.reco && <Tag tone="brand">BTIS Serviced</Tag>}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 pt-5" style={{ borderTop: '1px solid #E5E7EB' }}>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-1">Insured</p>
            <p className="text-sm text-gray-900">{biz.name || 'Sierra Ridge Plumbing Inc.'}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-1">Class</p>
            <p className="text-sm text-gray-900">{pz.mainClass || '5183'} · {state}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-1">Payroll</p>
            <p className="text-sm text-gray-900">${payroll.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-1">E-Mod</p>
            <p className="text-sm text-gray-900">{emod}</p>
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
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full text-sm z-50"
          style={{ background: '#252948', color: 'white', boxShadow: '0 8px 24px rgba(15,10,40,0.28)' }}
        >
          Quote proposal emailed (placeholder).
        </div>
      )}
    </div>
  )
}
