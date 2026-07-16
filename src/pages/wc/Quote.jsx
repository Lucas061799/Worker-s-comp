import { useState } from 'react'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

function ClientPresentModal({ price, carrier, effectiveDate, businessName, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(15,10,40,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="max-w-xl w-full rounded-3xl p-12 text-center"
        style={{
          background: '#1B0750',
          color: 'white',
          boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-4"
          style={{ color: '#A78BFA' }}>
          Workers' Compensation Quote
        </p>
        <p className="text-5xl md:text-6xl font-bold font-mono mb-1">${price.toLocaleString()}</p>
        <p className="text-sm mb-8" style={{ color: '#C4B5FD' }}>
          per year · ${Math.round(price / 12).toLocaleString()}/mo with premium finance
        </p>
        <div className="grid grid-cols-3 gap-4 pt-6 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: '#A78BFA' }}>Carrier</p>
            <p className="font-mono text-white">{carrier}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: '#A78BFA' }}>Effective</p>
            <p className="font-mono text-white">{effectiveDate}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: '#A78BFA' }}>Prepared for</p>
            <p className="text-white truncate">{businessName || '—'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-8 px-5 py-2 rounded-lg text-sm"
          style={{ background: 'transparent', color: '#C4B5FD', border: '1px solid rgba(255,255,255,0.2)' }}
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
      {/* Eligibility banner */}
      <div
        className="rounded-lg p-4 flex items-start gap-3"
        style={{ background: '#F3F0FF', border: '1px solid rgba(92,46,212,0.15)' }}
      >
        <span
          className="w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: BRAND_GRADIENT }}
        >
          ✓
        </span>
        <p className="text-sm text-gray-700 leading-relaxed">
          <b className="text-gray-900">Bind-online eligible.</b>{' '}
          Nothing here refers to underwriting — if a risk will refer, you'll always see that <i>before</i> you submit.
        </p>
      </div>

      {/* Quote hero */}
      <div
        className="rounded-2xl p-6 md:p-8"
        style={{
          background: 'linear-gradient(180deg, #FBFAFF 0%, #F3F0FF 100%)',
          border: '1px solid rgba(92,46,212,0.15)',
        }}
      >
        <div className="flex items-start gap-8 flex-wrap">
          <div className="flex-1 min-w-[220px]">
            <span
              className="inline-block text-[10px] font-bold px-2 py-1 rounded-md text-white mb-3"
              style={{ background: BRAND_GRADIENT }}
            >
              BTIS Serviced
            </span>
            <p className="text-4xl md:text-5xl font-bold font-mono text-navy">
              ${price.toLocaleString()}
              <span className="text-base text-gray-500 font-normal ml-2">/yr</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {carrier} · effective <span className="font-mono">{pz.effectiveDate || '08/01/2026'}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 flex-1 min-w-[220px]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-0.5">Insured</p>
              <p className="text-sm text-gray-900 truncate">{biz.name || 'Sierra Ridge Plumbing Inc.'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-0.5">Class</p>
              <p className="text-sm text-gray-900 font-mono">{pz.mainClass || '5183'} · {state}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-0.5">Payroll</p>
              <p className="text-sm text-gray-900 font-mono">${payroll.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-0.5">E-Mod</p>
              <p className="text-sm text-gray-900 font-mono">{emod}</p>
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
            className="px-5 py-3.5 rounded-xl text-sm font-semibold mr-auto"
            style={{ background: 'white', color: '#6B7280', border: '1.5px solid #E5E7EB' }}
          >
            ← Back
          </button>
        )}
        <button
          type="button"
          disabled={binding}
          onClick={handleBind}
          className="btn-gradient force-white-text px-8 py-3.5 rounded-xl text-sm font-bold"
          style={{
            background: BRAND_GRADIENT,
            boxShadow: '0 4px 20px rgba(92,46,212,0.3)',
            cursor: binding ? 'not-allowed' : 'pointer',
            opacity: binding ? 0.7 : 1,
          }}
        >
          {binding ? 'Binding…' : 'Bind online'}
        </button>
        <button
          type="button"
          onClick={() => setPresenting(true)}
          className="px-6 py-3.5 rounded-xl text-sm font-semibold transition"
          style={{ background: 'white', color: '#5C2ED4', border: '1.5px solid rgba(92,46,212,0.35)' }}
        >
          Present quote on screen
        </button>
        <button
          type="button"
          onClick={handleEmail}
          className="px-6 py-3.5 rounded-xl text-sm font-semibold transition"
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
          onClose={() => setPresenting(false)}
        />
      )}

      {emailToast && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full text-sm text-white z-50"
          style={{ background: '#1B0750', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
        >
          Quote proposal emailed (placeholder).
        </div>
      )}
    </div>
  )
}
