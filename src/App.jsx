import { useState, useRef, useEffect, useCallback } from 'react'
import norbielinkLogo from './assets/norbielink-logo.png'
import norbielinkLogoDark from './assets/norbielink-logo-dark.png'
import btisLogo from './assets/btislogo.png'
import btisLogoDark from './assets/btislogo-dark.png'
import Sidebar from './components/Sidebar'
import RightPanel from './components/RightPanel'
import PageZero from './pages/PageZero'
import BusinessInfo from './pages/wc/BusinessInfo'
import CoverageHistory from './pages/wc/CoverageHistory'
import LossDetail from './pages/wc/LossDetail'
import StateCoverages from './pages/wc/StateCoverages'
import UnderwritingQuestions from './pages/wc/UnderwritingQuestions'
import CarrierSelection from './pages/wc/CarrierSelection'
import Loading from './pages/wc/Loading'
import Indication from './pages/wc/Indication'
import CarrierFlow from './pages/wc/CarrierFlow'
import Quote from './pages/wc/Quote'
import WcSubmission from './pages/wc/WcSubmission'

// Two-phase step list — Application (1) then Carrier flow (2), with the
// Price indication gate rendered between them by Sidebar.
const BASE_STEPS = [
  { id: 1, num: '1',  key: 'business',    label: 'Business info',          phase: 1 },
  { id: 2, num: '2',  key: 'history',     label: 'Coverage history',       phase: 1 },
  { id: 3, num: '2b', key: 'losses',      label: 'Loss detail',            phase: 1, cond: true },
  { id: 4, num: '3',  key: 'coverages',   label: 'State coverages',        phase: 1 },
  { id: 5, num: '4',  key: 'questions',   label: 'Underwriting questions', phase: 1 },
  { id: 6, num: '5',  key: 'carriers',    label: 'Carrier selection',      phase: 1 },
  { id: 7, num: '6',  key: 'carrierflow', label: 'Carrier questions',      phase: 2 },
  { id: 8, num: '7',  key: 'quote',       label: 'Quote & bind',           phase: 2 },
]

function App() {
  const [formData, setFormData] = useState({})
  const [activeStep, setActiveStep] = useState(1)
  const [pageZeroDone, setPageZeroDone] = useState(false)

  // Rating flow state
  const [rating, setRating] = useState(false)          // showing the Loading interstitial
  const [indicationReady, setIndicationReady] = useState(false)   // results computed → gate unlocked
  const [showingIndication, setShowingIndication] = useState(false) // currently on the Indication screen

  const [submitted, setSubmitted] = useState(false)
  const [bindSummary, setBindSummary] = useState(null)

  const [darkMode, setDarkMode] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [attemptedQuote, setAttemptedQuote] = useState(false)

  const scrollContainerRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-dark', darkMode ? 'true' : 'false')
  }, [darkMode])

  const updateFormData = useCallback((section, data) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], ...data } }))
  }, [])

  const hasLosses = (formData.history?.claimCount || 0) > 0
  const steps = BASE_STEPS.filter(s => !s.cond || hasLosses)

  const goToStep = useCallback((stepId) => {
    setActiveStep(stepId)
    setShowingIndication(false)
    setTimeout(() => {
      if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }, 50)
  }, [])

  const goToIndication = () => {
    setShowingIndication(true)
    setTimeout(() => {
      if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }, 50)
  }

  const handleGetIndication = () => {
    setRating(true)
    setTimeout(() => {
      if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }, 50)
  }

  const handleRatingDone = () => {
    setRating(false)
    setIndicationReady(true)
    setShowingIndication(true)
  }

  const handlePickCarrier = (result) => {
    updateFormData('bind', { selectedCarrier: result.name, selectedCarrierId: result.id, premium: result.price })
    setShowingIndication(false)
    setActiveStep(7) // carrier flow
  }

  const handleContinueToQuote = () => setActiveStep(8)

  const handleBound = (summary) => {
    setBindSummary(summary)
    setSubmitted(true)
  }

  const resetAll = () => {
    setFormData({})
    setActiveStep(1)
    setPageZeroDone(false)
    setRating(false)
    setIndicationReady(false)
    setShowingIndication(false)
    setSubmitted(false)
    setBindSummary(null)
    setAttemptedQuote(false)
  }

  if (!pageZeroDone) {
    return (
      <PageZero
        onStart={(data) => {
          updateFormData('pageZero', data)
          setPageZeroDone(true)
        }}
      />
    )
  }

  if (submitted) {
    return (
      <WcSubmission
        formData={formData}
        summary={bindSummary}
        onBack={resetAll}
        isDark={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
      />
    )
  }

  // Current screen key
  const currentKey = showingIndication
    ? 'indication'
    : rating
      ? 'loading'
      : (steps.find(s => s.id === activeStep)?.key || 'business')

  const titles = {
    business:    'Business information',
    history:     'Coverage history',
    losses:      'Loss detail',
    coverages:   'State coverages',
    questions:   'Underwriting questions',
    carriers:    'Choose the markets to approach',
    loading:     'Rating',
    indication:  'Price indication',
    carrierflow: 'Carrier questions',
    quote:       'Your quote',
  }

  return (
    <div className="flex flex-col h-screen font-montserrat overflow-hidden"
      style={{ background: darkMode ? '#131629' : 'white' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between shrink-0 z-10"
        style={{
          height: '56px',
          background: darkMode ? '#191D35' : 'white',
          borderBottom: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6',
        }}
      >
        <div className="flex items-center h-full px-3 md:px-5 w-auto md:w-64 2xl:md:w-72 md:shrink-0">
          <button
            className="md:hidden mr-3 p-1.5 rounded-lg"
            style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}
            onClick={() => setMobileSidebarOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <img src={darkMode ? norbielinkLogoDark : norbielinkLogo} alt="Norbielink" className="h-8" />
        </div>
        <div className="flex items-center gap-2 px-3 md:px-8">
          <span className="hidden sm:inline text-xs text-gray-400 tracking-wide whitespace-nowrap">POWERED BY</span>
          <img src={darkMode ? btisLogoDark : btisLogo} alt="btis" className="h-6 md:h-7" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-30 md:hidden"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
        <div className={`fixed md:relative inset-y-0 left-0 z-40 h-full shrink-0 transition-transform duration-300 ease-in-out ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
          style={{ top: 0 }}>
          <Sidebar
            steps={steps}
            activeStep={activeStep}
            onStepClick={(id) => { goToStep(id); setMobileSidebarOpen(false) }}
            formData={formData}
            isDark={darkMode}
            onToggleDark={() => setDarkMode(d => !d)}
            indicationReady={indicationReady}
            onGateClick={goToIndication}
          />
        </div>

        <main
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto custom-scroll relative"
          style={{ background: darkMode ? '#131629' : 'white' }}
        >
          <div className="mx-auto px-4 md:px-10 py-6 md:py-8 max-w-5xl 2xl:max-w-6xl xl:max-w-none">
            <section className="rounded-2xl bop-page" style={{ background: 'transparent', border: 'none' }}>
              <SectionHeader title={titles[currentKey] || ''} isDark={darkMode} />
              <div className="px-4 md:px-10 pt-4 md:pt-5 pb-8 md:pb-10">
                {rating && (
                  <Loading onDone={handleRatingDone} onSkip={handleRatingDone} />
                )}
                {!rating && showingIndication && (
                  <Indication formData={formData} onPickCarrier={handlePickCarrier} />
                )}
                {!rating && !showingIndication && currentKey === 'business' && (
                  <BusinessInfo formData={formData} updateFormData={updateFormData} showErrors={attemptedQuote} />
                )}
                {!rating && !showingIndication && currentKey === 'history' && (
                  <CoverageHistory formData={formData} updateFormData={updateFormData} />
                )}
                {!rating && !showingIndication && currentKey === 'losses' && (
                  <LossDetail formData={formData} updateFormData={updateFormData} />
                )}
                {!rating && !showingIndication && currentKey === 'coverages' && (
                  <StateCoverages formData={formData} updateFormData={updateFormData} />
                )}
                {!rating && !showingIndication && currentKey === 'questions' && (
                  <UnderwritingQuestions
                    formData={formData}
                    updateFormData={updateFormData}
                    showErrors={attemptedQuote}
                    onValidateAll={() => {
                      if (formData.underwriting?.decline_any) return true
                      setAttemptedQuote(true)
                      return false
                    }}
                    onGetIndication={() => setActiveStep(6)}
                    onBack={() => goToStep(activeStep - 1)}
                  />
                )}
                {!rating && !showingIndication && currentKey === 'carriers' && (
                  <CarrierSelection
                    formData={formData}
                    updateFormData={updateFormData}
                    onGetIndication={handleGetIndication}
                    onBack={() => goToStep(activeStep - 1)}
                  />
                )}
                {!rating && !showingIndication && currentKey === 'carrierflow' && (
                  <CarrierFlow
                    formData={formData}
                    updateFormData={updateFormData}
                    onContinueToQuote={handleContinueToQuote}
                    onGoToStep={goToStep}
                    onBack={goToIndication}
                  />
                )}
                {!rating && !showingIndication && currentKey === 'quote' && (
                  <Quote
                    formData={formData}
                    updateFormData={updateFormData}
                    onBound={handleBound}
                    onBack={() => setActiveStep(7)}
                  />
                )}
              </div>

              {/* Bottom nav — Back / Continue between steps */}
              {!rating && !showingIndication && (
                <StepNav
                  currentKey={currentKey}
                  steps={steps}
                  activeStep={activeStep}
                  onGoToStep={goToStep}
                  hasLosses={hasLosses}
                />
              )}
            </section>

            <div className="pb-8" />
          </div>
        </main>

        {/* Right rail — Submission summary. Only on desktop; hidden on
            narrow viewports where it would push the form content. */}
        <div className="hidden xl:block">
          <RightPanel
            formData={formData}
            isDark={darkMode}
            indicationReady={indicationReady}
          />
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ title, isDark }) {
  return (
    <div className="px-4 md:px-10 pt-6 md:pt-8 pb-0">
      <div className="flex items-center justify-between pb-3 md:pb-4"
        style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#D1D5DB'}` }}>
        <h2 className="text-base md:text-lg font-bold" style={{ color: isDark ? '#F9FAFB' : undefined }}>{title}</h2>
      </div>
    </div>
  )
}

// Back / Continue nav for pages that don't own their own primary CTA.
// OWNS_CTA pages render their own Back+Continue row inline so both
// buttons stay on the same visual line.
function StepNav({ currentKey, steps, activeStep, onGoToStep }) {
  const OWNS_CTA = new Set(['questions', 'carriers', 'carrierflow', 'quote'])
  if (OWNS_CTA.has(currentKey)) return null

  const idx = steps.findIndex(s => s.id === activeStep)
  const prev = idx > 0 ? steps[idx - 1] : null
  const next = idx >= 0 && idx < steps.length - 1 ? steps[idx + 1] : null

  return (
    <div className="px-4 md:px-10 pb-6 md:pb-8 flex items-center justify-between gap-3">
      {prev ? (
        <button
          type="button"
          onClick={() => onGoToStep(prev.id)}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold"
          style={{ background: 'white', color: '#6B7280', border: '1.5px solid #E5E7EB' }}
        >
          ← Back
        </button>
      ) : <span />}

      {next && (
        <button
          type="button"
          onClick={() => onGoToStep(next.id)}
          className="btn-gradient force-white-text px-8 py-2.5 rounded-lg text-sm font-bold"
          style={{
            background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)',
            boxShadow: '0 4px 14px rgba(92,46,212,0.25)',
          }}
        >
          Continue →
        </button>
      )}
    </div>
  )
}

export default App
