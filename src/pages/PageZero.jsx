import { useState, useMemo } from 'react'
import norbielinkLogo from '../assets/norbielink-logo.png'
import norbielinkLogoDark from '../assets/norbielink-logo-dark.png'
import btisLogo from '../assets/btislogo.png'
import btisLogoDark from '../assets/btislogo-dark.png'
import heroImg from '../assets/wc-hero.png'
import jungleImg from '../assets/jungle.png'
import { Input, Select, DateInput } from '../components/FormField'
import { InfoDot } from '../components/wc/primitives'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']

// NCCI class typeahead — matches the shape used by the HTML proposal's
// step 1 typeahead. Industry is derived from the class so the user
// never has to self-select it.
/* The prototype's own nine demo codes, verbatim — including 5187, the
   dual-wage twin of 5183 that the Coverages popover tells the agent to
   enter but that was not selectable here. */
const CLASSES = [
  { code: '5183', desc: 'Plumbing — shop & outside (≥ $31/hr)', contractor: true },
  { code: '5187', desc: 'Plumbing — shop & outside (< $31/hr)', contractor: true },
  { code: '5645', desc: 'Carpentry — detached dwellings',       contractor: true },
  { code: '5474', desc: 'Painting or decorating',               contractor: true },
  { code: '9079', desc: 'Restaurant / food service' },
  { code: '8810', desc: 'Clerical office employees' },
  { code: '8017', desc: 'Retail store' },
  { code: '7228', desc: 'Trucking — long haul',                 transport: true },
  { code: '7229', desc: 'Trucking — local hauling',             transport: true },
]

/* Classes that come back as a likely referral rather than a clean yes. */
const LIMITED_APPETITE = ['9079']

export default function PageZero({ onStart, isDark = false }) {
  const [state, setState] = useState('')
  const [effectiveDate, setEffectiveDate] = useState('')
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState(null)
  const [showSuggest, setShowSuggest] = useState(false)
  const [payroll, setPayroll] = useState('')
  const [license, setLicense] = useState('')
  // null → not run yet. Changing the class resets it, because appetite is
  // answered for a specific class.
  const [appetite, setAppetite] = useState(null)
  const [checking, setChecking] = useState(false)

  const suggestList = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return CLASSES
    return CLASSES.filter(c => c.code.startsWith(q) || c.desc.toLowerCase().includes(q))
  }, [query])

  const canCheck = !!(state && effectiveDate && picked && payroll)
  // Nothing else is asked until we know the risk is worth the agent's time.
  const ready = canCheck && !!appetite

  const handlePick = (cls) => {
    setPicked(cls)
    // The input reads its label off `picked`, so the query stays empty —
    // writing the label into it made the filter match nothing, and
    // reopening the list showed an empty catalogue you could not re-pick
    // from.
    setQuery('')
    setShowSuggest(false)
    setAppetite(null)
  }

  const runAppetite = () => {
    if (!canCheck || checking) return
    setChecking(true)
    setTimeout(() => {
      setAppetite(LIMITED_APPETITE.includes(picked.code) ? 'limited' : 'good')
      setChecking(false)
    }, 900)
  }

  const handleStart = () => {
    if (!ready) return
    onStart({
      productType: 'wc',
      state,
      effectiveDate,
      mainClass: picked.code,
      classDescription: picked.desc,
      isContractor: picked.contractor,
      isTransportation: !!picked.transport,
      estimatedPayroll: payroll,
      contractorLicense: license,
      appetite,
    })
  }

  return (
    <div className="min-h-screen font-montserrat flex flex-col" style={{ background: 'var(--surface)' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-5 md:px-8 shrink-0"
        style={{ height: '56px', background: 'var(--surface)', borderBottom: '1px solid var(--line-soft)' }}
      >
        <img src={isDark ? norbielinkLogoDark : norbielinkLogo} alt="NorbieLink" className="h-7 md:h-8" />
        <div className="flex items-center gap-1.5 md:gap-2">
          <span className="text-[10px] md:text-xs text-gray-400 tracking-wide font-semibold">POWERED BY</span>
          <img src={isDark ? btisLogoDark : btisLogo} alt="btis" className="h-6 md:h-7" />
        </div>
      </header>

      {/* Body — 50/50 split on lg+ */}
      <div className="flex flex-1">
        {/* Left — form column */}
        <div
          className="flex-1 lg:w-1/2 lg:flex-none overflow-y-auto relative"
          style={{ borderRight: '1px solid var(--line-soft)' }}
        >
          {/* Faint jungle backdrop on narrow viewports where the right
              illustration is hidden. */}
          <img
            src={jungleImg} alt=""
            className="lg:hidden absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            style={{ opacity: 'var(--hero-wash-soft, 0.06)' }}
          />

          <div className="relative z-10 min-h-full flex flex-col justify-center items-center py-10 px-6 md:px-[8%] lg:px-[10%]">
            <div className="w-full max-w-xl">
              <div className="mb-6">
                <p className="text-xs md:text-sm font-bold tracking-widest uppercase text-gradient mb-2 md:mb-3">
                  Workers' Compensation Insurance
                </p>
                <h1
                  className="text-3xl md:text-4xl font-bold leading-tight mb-4"
                  style={{ fontWeight: 800, color: 'var(--ink)' }}
                >
                  Get Multiple Quotes.<br />
                  <span className="text-gradient">One Easy Application.</span>
                </h1>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                  First, tell us a bit about the business.
                </p>
              </div>

              {/* Two columns, as CBIC's landing form is — a single column
                  ran the page long enough to scroll past the illustration.
                  The class code spans both, since its label and its
                  suggestions need the full width. */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5 mb-6">
                <Select
                  label="Primary State"
                  required
                  options={US_STATES}
                  value={state}
                  onChange={setState}
                  placeholder="Select a state…"
                />
                <DateInput
                  label="Policy Effective Date"
                  required
                  value={effectiveDate}
                  onChange={setEffectiveDate}
                />

                {/* Class code search — mirrors Inland's ClassSearch:
                    magnifying glass on the left, chevron on the right,
                    the full catalogue when the field is empty. */}
                <div className="relative sm:col-span-2">
                  <label className="block text-[13px] font-semibold text-gray-600 mb-1.5 tracking-wide">
                    Primary Class Code<span className="text-red-400 ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={picked ? `${picked.code} — ${picked.desc}` : query}
                      onChange={e => { setQuery(e.target.value); setShowSuggest(true); setPicked(null) }}
                      onFocus={() => setShowSuggest(true)}
                      onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
                      placeholder='Start typing a trade, for example: plumbing'
                      className={`w-full border rounded-lg pl-10 pr-10 py-2.5 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 transition-all ${picked ? 'text-gray-900' : 'text-gray-800'} border-gray-200 field-fill focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]/40 hover:border-gray-300`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={showSuggest ? 'Hide classes' : 'Show all classes'}
                      onClick={() => setShowSuggest(v => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded"
                    >
                      <svg className="w-4 h-4 transition-transform"
                        style={{ transform: showSuggest ? 'rotate(180deg)' : 'rotate(0deg)', color: showSuggest ? '#7C3AED' : '#9CA3AF' }}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>
                    {showSuggest && suggestList.length > 0 && (
                      <div
                        className="absolute left-0 right-0 top-full mt-1.5 rounded-xl overflow-hidden z-40 bop-select-dropdown"
                        style={{ background: 'var(--surface-card)', border: '1px solid var(--line)', boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
                      >
                        <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: '260px' }}>
                          {suggestList.map(c => {
                            const current = picked && c.code === picked.code
                            return (
                              <button
                                key={c.code}
                                type="button"
                                onMouseDown={() => handlePick(c)}
                                className="w-full text-left px-3.5 py-3 flex items-center gap-2 transition-all"
                                style={{ background: current ? '#F5F3FF' : 'transparent' }}
                                onMouseEnter={e => { e.currentTarget.style.background = current ? '#EDE9FE' : '#F9FAFB' }}
                                onMouseLeave={e => { e.currentTarget.style.background = current ? '#F5F3FF' : 'transparent' }}
                              >
                                <span className={`text-sm truncate ${current ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                                  <span className="font-mono">{c.code}</span>
                                  <span className="text-gray-400 mx-1.5">—</span>
                                  {c.desc}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-600 mb-1.5 tracking-wide">
                    Estimated Annual Payroll<span className="text-red-400">*</span>
                    <InfoDot
                      title="Estimated annual payroll"
                      text="Enter the estimated payroll for all employees including officers if they will be included in coverage. This is an estimate only to confirm we have an available market; we'll ask for full payroll at the class code level later."
                    />
                  </label>
                  <Input
                    value={payroll}
                    onChange={val => { setPayroll(val); setAppetite(null) }}
                    placeholder="$"
                  />
                </div>

                {/* Only contracting classes need a licence number, and the
                    CSLB lookup off it pre-fills General info. */}
                {picked?.contractor && (
                  <div>
                    <label className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-600 mb-1.5 tracking-wide">
                      Contractor License Number
                      <InfoDot
                        title="Contractor license number"
                        text="Certain carriers will require this in order to bind. We'll also prefill information based on this license."
                      />
                    </label>
                    {/* Digits only, capped at 8 — CSLB numbers run to eight
                        but are often shorter, so there is no count to meet
                        and nothing to nag about. */}
                    <Input
                      value={license}
                      onChange={setLicense}
                      placeholder="e.g. 1042113"
                      digits
                      maxLength={8}
                    />
                  </div>
                )}
              </div>

              {/* Appetite gate — a class, a state and a payroll are enough
                  to say whether a market exists. */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={runAppetite}
                  disabled={!canCheck || checking}
                  /* Until appetite answers, this is the step to take, so it
                     wears the brand and Start Application stays disabled
                     below it. Once it has answered, it demotes to the house
                     ghost and the brand moves to Start Application — only
                     one action is ever the loud one. The purple outline it
                     used before was a variant nothing else in the app has. */
                  className={`w-full h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition ${
                    canCheck && !checking ? 'hover:opacity-90' : 'cursor-not-allowed'
                  } ${canCheck && !checking && !appetite ? 'btn-gradient force-white-text' : ''}`}
                  style={!canCheck || checking
                    ? { background: 'var(--fill-disabled)', color: '#9CA3AF' }
                    : appetite
                      ? { background: 'var(--surface)', border: '1.5px solid var(--line)', color: 'var(--ink-2)' }
                      : { background: BRAND_GRADIENT, color: 'white', boxShadow: '0 4px 14px rgba(92,46,212,0.22)' }}
                  title={canCheck ? undefined : 'Add state, effective date, class code and payroll first'}
                >
                  {checking ? 'Checking…' : appetite ? 'Re-run Appetite' : 'Run Appetite'}
                </button>

                {appetite === 'good' && (
                  <div className="im-info-panel rounded-xl p-4 mt-3 flex items-start gap-3">
                    <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-[12.5px] text-gray-600 leading-relaxed">
                      <span className="font-bold text-navy">Good news!</span>{' '}
                      Based on class, state and payroll, we have at least 1 carrier available.
                      Final approval is subject to full risk characteristics.
                    </p>
                  </div>
                )}

                {appetite === 'limited' && (
                  <div className="im-info-panel rounded-xl p-4 mt-3 flex items-start gap-3">
                    <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <p className="text-[12.5px] text-gray-600 leading-relaxed">
                      <span className="font-bold text-navy">
                        Limited appetite for {picked?.code} in {state} at this payroll — likely referral.
                      </span>{' '}
                      You can continue; the start is recorded either way.
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleStart}
                disabled={!ready}
                /* force-white-text only belongs on the gradient; a disabled
                   button with white text on the muted fill reads clickable. */
                className={`w-full h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition ${
                  ready ? 'btn-gradient force-white-text text-white hover:opacity-90' : 'cursor-not-allowed'
                }`}
                style={{
                  background: ready ? BRAND_GRADIENT : 'var(--fill-disabled)',
                  color: ready ? 'white' : '#9CA3AF',
                  boxShadow: ready ? '0 4px 14px rgba(92,46,212,0.22)' : 'none',
                }}
                title={ready ? undefined : 'Run Appetite to continue'}
              >
                Start Application
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right — illustration (lg+ only) */}
        <div
          className="hidden lg:flex relative overflow-hidden shrink-0 items-center justify-center"
          style={{ width: '50%', background: 'var(--surface)' }}
        >
          <img
            src={jungleImg} alt=""
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            style={{ opacity: 'var(--hero-wash, 0.25)' }}
          />
          <img
            src={heroImg}
            alt="Norbie"
            className="relative z-10 select-none pointer-events-none"
            style={{
              width: '500px',
              height: '500px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 10px 40px rgba(92,46,212,0.18))',
            }}
          />
        </div>
      </div>
    </div>
  )
}
