import { useState } from 'react'
import { BRAND_GRADIENT, PrimaryButton, Banner, BrandText, CarrierLogo, Tag } from '../../components/wc/primitives'
import { CARRIERS } from './CarrierSelection'
import norbielinkLogo from '../../assets/norbielink-logo.png'
import btisLogo from '../../assets/btislogo.png'

function PresentRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2" style={{ borderBottom: '1px solid #F3F4F6' }}>
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-semibold text-gray-800 text-right truncate">{value || '—'}</span>
    </div>
  )
}

/* The screen an agent turns toward the client, so it reads as a proposal
   rather than a bare number: brand lockup at the top, the carrier's mark
   beside the price, and the terms underneath. */
function ClientPresentModal({ price, carrier, effectiveDate, businessName, mainClass, classDescription, onClose }) {
  const carrierMeta = CARRIERS.find(c => c.name === carrier)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(15,10,40,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="max-w-lg w-full rounded-2xl overflow-hidden"
        style={{ background: 'white', boxShadow: '0 32px 80px rgba(15,10,40,0.28)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Brand lockup — this card gets shown to the insured. */}
        <div className="flex items-center justify-between px-7 py-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
          <img src={norbielinkLogo} alt="NorbieLink" className="h-7" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 tracking-wide font-semibold">POWERED BY</span>
            <img src={btisLogo} alt="btis" className="h-6" />
          </div>
        </div>

        <div className="px-7 py-7">
          <div className="flex items-center gap-2 mb-5">
            <Tag tone="brand">Workers' Compensation</Tag>
            <span className="text-xs text-gray-400">Prepared for {businessName || 'your client'}</span>
          </div>

          {/* Price beside the carrier's mark — the two facts that matter. */}
          <div className="flex items-center gap-5 mb-6">
            {carrierMeta && <CarrierLogo carrier={carrierMeta} size={56} />}
            <div className="min-w-0">
              <p className="text-4xl md:text-5xl font-bold leading-none mb-1.5">
                <BrandText>${price.toLocaleString()}</BrandText>
              </p>
              <p className="text-sm text-gray-500">
                per year · ${Math.round(price / 12).toLocaleString()}/mo with premium finance
              </p>
            </div>
          </div>

          <div className="rounded-xl px-4 py-2 mb-6" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
            <PresentRow label="Carrier" value={carrier} />
            <PresentRow label="Effective date" value={effectiveDate} />
            <PresentRow label="Class" value={mainClass && `${mainClass} — ${classDescription}`} />
            <PresentRow label="Named insured" value={businessName} />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full h-10 inline-flex items-center justify-center rounded-xl text-sm font-semibold"
            style={{ background: 'white', color: '#6B7280', border: '1.5px solid #E5E7EB' }}
          >
            Close presentation
          </button>
        </div>
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

      {/* Quote hero — im-figures gradient border, no font-mono */}
      <div className="im-figures rounded-2xl p-6 md:p-8">
        <div className="flex items-start gap-8 flex-wrap">
          <div className="flex-1 min-w-[220px]">
            <span className="im-chip"
              style={{ background: 'linear-gradient(88.09deg, rgba(92,46,212,0.12) 0%, rgba(166,20,195,0.12) 100%)', color: '#5C2ED4', marginBottom: 12 }}>
              BTIS Serviced
            </span>
            <p className="text-4xl md:text-5xl font-bold text-navy mt-3">
              <BrandText>${price.toLocaleString()}</BrandText>
              <span className="text-base text-gray-500 font-normal ml-2">/yr</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {carrier} · effective {pz.effectiveDate || '08/01/2026'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 flex-1 min-w-[220px]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-0.5">Insured</p>
              <p className="text-sm text-gray-900 truncate">{biz.name || 'Sierra Ridge Plumbing Inc.'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-0.5">Class</p>
              <p className="text-sm text-gray-900">{pz.mainClass || '5183'} · {state}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-0.5">Payroll</p>
              <p className="text-sm text-gray-900">${payroll.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-0.5">E-Mod</p>
              <p className="text-sm text-gray-900">{emod}</p>
            </div>
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
