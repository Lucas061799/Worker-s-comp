import { useState, useMemo } from 'react'
import norbielinkLogo from '../assets/norbielink-logo.png'
import btisLogo from '../assets/btislogo.png'
import heroImg from '../assets/norbie-heroimg.png'
import jungleImg from '../assets/jungle.png'
import { Select, DateInput } from '../components/FormField'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']

// NCCI class typeahead — matches the shape used by the HTML proposal's
// step 1 typeahead. Industry is derived from the class so the user
// never has to self-select it.
const CLASSES = [
  { code: '5183', desc: 'Plumbing NOC',                     ind: 'Construction',          contractor: true },
  { code: '5645', desc: 'Carpentry — detached dwellings',   ind: 'Construction',          contractor: true },
  { code: '5474', desc: 'Painting NOC',                     ind: 'Construction',          contractor: true },
  { code: '5551', desc: 'Roofing — all kinds',              ind: 'Construction',          contractor: true },
  { code: '5190', desc: 'Electrical wiring — within bldgs', ind: 'Construction',          contractor: true },
  { code: '9079', desc: 'Restaurant — full service',        ind: 'Hospitality',           contractor: false },
  { code: '9082', desc: 'Restaurant — quick service',       ind: 'Hospitality',           contractor: false },
  { code: '8810', desc: 'Clerical office employees',        ind: 'Professional services', contractor: false },
  { code: '8742', desc: 'Salespersons — outside',           ind: 'Professional services', contractor: false },
  { code: '8017', desc: 'Store — retail NOC',               ind: 'Retail',                contractor: false },
  { code: '7228', desc: 'Trucking — local hauling',         ind: 'Transportation',        contractor: false },
  { code: '9014', desc: 'Janitorial services — contractor', ind: 'Services',              contractor: true },
  { code: '0042', desc: 'Landscape gardening',              ind: 'Services',               contractor: true },
]

export default function PageZero({ onStart }) {
  const [state, setState] = useState('')
  const [effectiveDate, setEffectiveDate] = useState('')
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState(null)
  const [showSuggest, setShowSuggest] = useState(false)

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return CLASSES.filter(c => c.code.startsWith(q) || c.desc.toLowerCase().includes(q)).slice(0, 6)
  }, [query])

  const ready = !!(state && effectiveDate && picked)

  const handlePick = (cls) => {
    setPicked(cls)
    setQuery(`${cls.code} — ${cls.desc}`)
    setShowSuggest(false)
  }

  const handleStart = () => {
    if (!ready) return
    onStart({
      productType: 'wc',
      state,
      effectiveDate,
      mainClass: picked.code,
      classDescription: picked.desc,
      industry: picked.ind,
      isContractor: picked.contractor,
    })
  }

  return (
    <div className="min-h-screen bg-white font-montserrat flex flex-col">
      {/* Header */}
      <header
        className="flex items-center justify-between bg-white border-b border-gray-100 px-5 md:px-8 shrink-0"
        style={{ height: '56px' }}
      >
        <img src={norbielinkLogo} alt="NorbieLink" className="h-7 md:h-8" />
        <div className="flex items-center gap-1.5 md:gap-2">
          <span className="text-[10px] md:text-xs text-gray-400 tracking-wide font-semibold">POWERED BY</span>
          <img src={btisLogo} alt="btis" className="h-6 md:h-7" />
        </div>
      </header>

      {/* Body — 50/50 split on lg+ */}
      <div className="flex flex-1">
        {/* Left — form column */}
        <div
          className="flex-1 lg:w-1/2 lg:flex-none overflow-y-auto relative"
          style={{ borderRight: '1px solid #F3F4F6' }}
        >
          {/* Faint jungle backdrop on narrow viewports where the right
              illustration is hidden. */}
          <img
            src={jungleImg} alt=""
            className="lg:hidden absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            style={{ opacity: 0.06 }}
          />

          <div className="relative z-10 min-h-full flex flex-col justify-center items-center py-10 px-6 md:px-[8%] lg:px-[10%]">
            <div className="w-full max-w-xl">
              <div className="mb-6">
                <h1
                  className="text-3xl md:text-4xl font-bold text-navy leading-tight mb-4"
                  style={{ fontWeight: 800 }}
                >
                  Get Multiple Quotes.<br />
                  <span className="text-gradient">One Easy Application.</span>
                </h1>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                  First, tell us a bit about the business.
                </p>
              </div>

              <div className="space-y-4 mb-6">
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

                {/* Class code typeahead */}
                <div className="relative">
                  <label className="block text-[13px] font-semibold text-gray-600 mb-1.5 tracking-wide">
                    Primary Class Code<span className="text-red-400 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setShowSuggest(true); setPicked(null) }}
                    onFocus={() => setShowSuggest(true)}
                    onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
                    placeholder='e.g. 5183 or "plumbing"'
                    className="w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]/40 transition-all"
                    style={{
                      background: 'white',
                      borderColor: picked ? '#7C3AED' : '#E5E7EB',
                      boxShadow: picked ? '0 0 0 2px rgba(124,58,237,0.1)' : 'none',
                    }}
                  />
                  {showSuggest && hits.length > 0 && (
                    <div
                      className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden z-20"
                      style={{
                        background: 'white',
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                      }}
                    >
                      {hits.map(c => (
                        <button
                          key={c.code}
                          type="button"
                          onMouseDown={() => handlePick(c)}
                          className="w-full flex items-baseline gap-3 px-3.5 py-2.5 text-left text-sm transition-all"
                          style={{ background: 'transparent', color: '#374151' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <span className="font-mono font-bold" style={{ color: '#5C2ED4' }}>{c.code}</span>
                          <span className="flex-1 truncate">{c.desc}</span>
                          <span className="text-xs text-gray-400 shrink-0">{c.ind}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {picked && (
                    <p className="mt-1.5 text-xs text-gray-500">
                      Industry: <span className="font-semibold text-gray-700">{picked.ind}</span> — derived from class {picked.code}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleStart}
                disabled={!ready}
                className={`btn-gradient force-white-text w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition ${ready ? 'hover:opacity-90' : 'cursor-not-allowed'}`}
                style={{
                  background: ready ? BRAND_GRADIENT : '#D1D5DB',
                  boxShadow: ready ? '0 4px 14px rgba(92,46,212,0.22)' : 'none',
                }}
                title={ready ? undefined : 'Fill in state, effective date and class code to continue'}
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
          style={{ width: '50%', background: 'white' }}
        >
          <img
            src={jungleImg} alt=""
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            style={{ opacity: 0.25 }}
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
