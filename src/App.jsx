import { useState, useRef, useEffect, useCallback } from 'react'
import norbielinkLogo from './assets/norbielink-logo.png'
import norbielinkLogoDark from './assets/norbielink-logo-dark.png'
import btisLogo from './assets/btislogo.png'
import btisLogoDark from './assets/btislogo-dark.png'
import Sidebar from './components/Sidebar'
import RightPanel from './components/RightPanel'
import PrintSummary from './components/PrintSummary'
import { StepHeader } from './components/wc/primitives'
import PageZero from './pages/PageZero'
import DemoBar from './components/DemoJump'
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

  const [showSummary, setShowSummary] = useState(false)
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

  const sectionRefs = useRef({})
  const isScrollingToRef = useRef(false)

  // Application-phase step keys — these all render in ONE scrolling
  // page. Clicking the sidebar scrolls to that section instead of
  // switching views.
  const APP_KEYS = ['business', 'history', 'losses', 'coverages', 'questions']

  const goToStep = useCallback((stepId) => {
    const step = BASE_STEPS.find(s => s.id === stepId)
    const inAppPhase = step && APP_KEYS.includes(step.key)
    setActiveStep(stepId)
    setShowingIndication(false)
    setTimeout(() => {
      if (!scrollContainerRef.current) return
      isScrollingToRef.current = true
      if (inAppPhase) {
        const el = sectionRefs.current[stepId]
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        else scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
      }
      setTimeout(() => { isScrollingToRef.current = false }, 800)
    }, 50)
  }, [])

  // Scroll observer — while user is in the Application-phase scroll,
  // update activeStep to whichever section is nearest the top.
  const handleMainScroll = useCallback(() => {
    if (isScrollingToRef.current) return
    const container = scrollContainerRef.current
    if (!container) return
    const containerRect = container.getBoundingClientRect()
    const threshold = containerRect.height * 0.35
    let current = 1
    BASE_STEPS.filter(s => APP_KEYS.includes(s.key)).forEach(step => {
      const el = sectionRefs.current[step.id]
      if (el) {
        const top = el.getBoundingClientRect().top - containerRect.top
        if (top <= threshold) current = step.id
      }
    })
    setActiveStep(prev => prev !== current && current >= 1 && current <= 5 ? current : prev)
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

  // Prefill a plumbing-in-CA demo so a quick-jump lands on a filled form.
  const seedDemoData = () => {
    updateFormData('pageZero', {
      productType: 'wc', state: 'CA', effectiveDate: '2026-04-01',
      mainClass: '5183', classDescription: 'Plumbing NOC',
      industry: 'Construction', isContractor: true,
    })
    setPageZeroDone(true)
  }

  const jumpToStep = (stepId) => {
    if (!pageZeroDone) seedDemoData()
    setActiveStep(stepId)
    setShowingIndication(false)
    setSubmitted(false)
  }

  const jumpToIndication = () => {
    if (!pageZeroDone) seedDemoData()
    setIndicationReady(true)
    setShowingIndication(true)
    setSubmitted(false)
  }

  const jumpToSubmission = () => {
    if (!pageZeroDone) seedDemoData()
    setBindSummary({ carrierId: 'cna', premium: 5174 })
    setSubmitted(true)
  }

  const demoJumps = [
    { key: 'landing',    label: 'Landing',           go: resetAll },
    { key: 'form',       label: 'Application form',  go: () => jumpToStep(1) },
    { key: 'indication', label: 'Price indication',  go: jumpToIndication },
    { key: 'submission', label: 'Submission',        go: jumpToSubmission },
  ]

  const demoActive = submitted ? 'submission'
    : !pageZeroDone ? 'landing'
    : showingIndication ? 'indication'
    : 'form'

  if (!pageZeroDone) {
    return (
      <>
        <PageZero
          onStart={(data) => {
            updateFormData('pageZero', data)
            setPageZeroDone(true)
          }}
        />
        <DemoBar jumps={demoJumps} active={demoActive} />
      </>
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
        demoJumps={demoJumps}
        demoActive={demoActive}
      />
    )
  }

  // Current screen key
  const currentKey = showingIndication
    ? 'indication'
    : rating
      ? 'loading'
      : (steps.find(s => s.id === activeStep)?.key || 'business')

  const inAppPhase = APP_KEYS.includes(currentKey)

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

  // App-phase sections — rendered stacked in one scroll page. Loss
  // detail is conditionally included when the user reported claims > 0.
  const appSections = [
    { id: 1, key: 'business',  title: titles.business,  el: <BusinessInfo formData={formData} updateFormData={updateFormData} showErrors={attemptedQuote} /> },
    { id: 2, key: 'history',   title: titles.history,   el: <CoverageHistory formData={formData} updateFormData={updateFormData} /> },
    ...(hasLosses ? [{ id: 3, key: 'losses', title: titles.losses, el: <LossDetail formData={formData} updateFormData={updateFormData} /> }] : []),
    { id: 4, key: 'coverages', title: titles.coverages, el: <StateCoverages formData={formData} updateFormData={updateFormData} /> },
    { id: 5, key: 'questions', title: titles.questions, el: (
      <UnderwritingQuestions
        formData={formData}
        updateFormData={updateFormData}
        showErrors={attemptedQuote}
        onValidateAll={() => {
          if (formData.underwriting?.decline_any !== undefined) return true
          setAttemptedQuote(true)
          return false
        }}
        onGetIndication={() => goToStep(6)}
      />
    ) },
  ]

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
            demoJumps={demoJumps}
            demoActive={demoActive}
          />
        </div>

        <main
          ref={scrollContainerRef}
          onScroll={inAppPhase ? handleMainScroll : undefined}
          className="flex-1 overflow-y-auto custom-scroll relative"
          style={{ background: darkMode ? '#131629' : 'white' }}
        >
          <div className="mx-auto px-4 md:px-10 py-6 md:py-8 max-w-5xl 2xl:max-w-6xl">
            {/* App-phase = all 5 sections stacked in one scroll */}
            {inAppPhase && appSections.map(section => (
              <section
                key={section.id}
                ref={el => { sectionRefs.current[section.id] = el }}
                id={`section-${section.id}`}
                className="bop-page mb-6"
              >
                <div className="px-4 md:px-6">
                  <StepHeader title={section.title} />
                </div>
                <div className="px-4 md:px-6 pb-8 md:pb-10">
                  {section.el}
                </div>
              </section>
            ))}

            {/* Non-app-phase = single full-page view */}
            {!inAppPhase && (
              <section className="bop-page">
                <div className="px-4 md:px-6">
                  <StepHeader title={titles[currentKey] || ''} />
                </div>
                <div className="px-4 md:px-6 pb-8 md:pb-10">
                  {rating && (
                    <Loading onDone={handleRatingDone} onSkip={handleRatingDone} />
                  )}
                  {!rating && showingIndication && (
                    <Indication formData={formData} onPickCarrier={handlePickCarrier} />
                  )}
                  {!rating && !showingIndication && currentKey === 'carriers' && (
                    <CarrierSelection
                      formData={formData}
                      updateFormData={updateFormData}
                      onGetIndication={handleGetIndication}
                      onBack={() => goToStep(5)}
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
              </section>
            )}

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
            onDownloadSummary={() => setShowSummary(true)}
          />
        </div>
      </div>

      <PrintSummary
        formData={formData}
        visible={showSummary}
        onClose={() => setShowSummary(false)}
      />
    </div>
  )
}

export default App
