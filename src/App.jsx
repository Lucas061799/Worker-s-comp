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
import CarrierSelection, { CARRIERS } from './pages/wc/CarrierSelection'
import Loading from './pages/wc/Loading'
import Locations from './pages/wc/Locations'
import SubClassCode from './pages/wc/SubClassCode'
import Referral, { ReferralSubmitted } from './pages/wc/Referral'
import BindFlow from './pages/wc/BindFlow'
import { feesFor, FACTORS } from './pages/wc/Indication'
import Indication from './pages/wc/Indication'
import CarrierFlow from './pages/wc/CarrierFlow'
import Quote from './pages/wc/Quote'
import WcSubmission from './pages/wc/WcSubmission'

// Two-phase step list — Application (1) then Carrier flow (2), with the
// Price indication gate rendered between them by Sidebar.
const BASE_STEPS = [
  { id: 1, num: '1',  key: 'business',    label: 'Business info',          phase: 1 },
  { id: 2, num: '2',  key: 'history',     label: 'Coverage history',       phase: 1 },
  { id: 3, num: '2b', key: 'losses',      label: 'Loss history',           phase: 1, cond: true },
  { id: 9, num: '2c', key: 'locations',   label: 'Locations',              phase: 1, condLocations: true },
  { id: 4, num: '3',  key: 'coverages',   label: 'State coverages',        phase: 1 },
  { id: 5, num: '4',  key: 'questions',   label: 'Credit opportunity',     phase: 1 },
  { id: 6, num: '5',  key: 'carriers',    label: 'Carrier selection',      phase: 1 },
  { id: 7, num: '6',  key: 'carrierflow', label: 'Carrier questions',      phase: 2 },
  { id: 8, num: '7',  key: 'quote',       label: 'Quote & bind',           phase: 2 },
]

/* Save-per-page resume. The agent's answers and where they had got to are
   written on every change and read back on load, so a reload — or coming back
   tomorrow — picks up where they left off instead of dropping them on an empty
   landing page. Only the application itself is kept: the Loading interstitial
   and the bind confirmation are moments, not state worth restoring into. */
const SAVE_KEY = 'wc-submission'

function loadSaved() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw)
    return saved && typeof saved === 'object' ? saved : null
  } catch {
    return null   // private window, or something else wrote over the key
  }
}

function App() {
  const restored = useRef(loadSaved()).current

  const [formData, setFormData] = useState(() => restored?.formData || {})
  const [activeStep, setActiveStep] = useState(() => restored?.activeStep || 1)
  const [pageZeroDone, setPageZeroDone] = useState(() => !!restored?.pageZeroDone)

  // Rating flow state
  const [rating, setRating] = useState(false)          // showing the Loading interstitial
  /* Restored with the rest: it gates which steps the nav shows, so dropping it
     would strand a resumed agent on a page the nav no longer lists. */
  const [indicationReady, setIndicationReady] = useState(() => !!restored?.indicationReady)   // results computed → gate unlocked
  const [showingIndication, setShowingIndication] = useState(false) // currently on the Indication screen

  /* Whether a referral is already in play. The prototype's uwStatus carries a
     good deal more, but the markets callout only asks this much: it hides once
     one is running. The Referral screen itself is still to come, so this
     records the intent and says so rather than pretending to submit. */
  const [referralInPlay, setReferralInPlay] = useState(() => !!restored?.referralInPlay)

  /* Carrier flow asks for sub-class descriptors before the carrier's own
     questions, so the step has two screens rather than one. */
  const [subclassDone, setSubclassDone] = useState(false)
  // null → not referring · 'form' → filling it in · 'submitted' → sent
  const [referralStage, setReferralStage] = useState(null)
  const [binding, setBinding] = useState(false)

  const [submitted, setSubmitted] = useState(false)
  const [bindSummary, setBindSummary] = useState(null)

  const [showSummary, setShowSummary] = useState(false)
  /* Dark mode survives a reload, and an agent whose machine is already dark
     gets a dark app on first load rather than a white flash and a light
     header — the logos key off this, so starting light showed the navy
     wordmark where the white one belongs. */
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('wc-theme')
      if (saved === 'dark' || saved === 'light') return saved === 'dark'
    } catch { /* private window — fall through to the OS preference */ }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  })
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [attemptedQuote, setAttemptedQuote] = useState(false)

  const scrollContainerRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-dark', darkMode ? 'true' : 'false')
    try { localStorage.setItem('wc-theme', darkMode ? 'dark' : 'light') } catch { /* nothing to persist to */ }
  }, [darkMode])

  const updateFormData = useCallback((section, data) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], ...data } }))
  }, [])

  /* updateFormData merges, so a section can be added to but never pruned —
     removing a state left its class and payroll behind, where rating still
     read it. This hands over the whole section instead. */
  const replaceFormSection = useCallback((section, data) => {
    setFormData(prev => ({ ...prev, [section]: data }))
  }, [])

  // 1–3 claims get the detail screen; 4 or more skip it and go to an
  // underwriter with loss runs instead.
  const claimCount = formData.history?.claimCount || 0
  const hasLosses = claimCount > 0 && claimCount < 4
  /* Phase 2 is behind the indication gate and stays out of the nav until it
     opens, rather than sitting there greyed — per the VP note, the nav never
     shows more pages than the agent is ready to think about. */
  /* Locations is asked only when General Info says there are more of them. */
  const hasLocations = formData.business?.additionalLocations === 'yes'
  const steps = BASE_STEPS
    .filter(s => (!s.cond || hasLosses)
      && (!s.condLocations || hasLocations)
      && (s.phase !== 2 || indicationReady))
    .sort((a, b) => a.num.localeCompare(b.num, undefined, { numeric: true }))

  const sectionRefs = useRef({})
  const isScrollingToRef = useRef(false)

  // Application-phase step keys — these all render in ONE scrolling
  // page. Clicking the sidebar scrolls to that section instead of
  // switching views.
  const APP_KEYS = ['business', 'history', 'losses', 'locations', 'coverages', 'questions']

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
    setSubclassDone(false)
    setActiveStep(7) // carrier flow — sub-class first, then the questions
  }

  const handleContinueToQuote = () => setActiveStep(8)

  const handleBound = (summary) => {
    setBindSummary(summary)
    setSubmitted(true)
  }

  /* One write per change. The payload is small and this is the only place it
     is persisted, so there is nothing to keep in step by hand. */
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        formData, activeStep, pageZeroDone, indicationReady, referralInPlay,
      }))
    } catch { /* nothing to persist to */ }
  }, [formData, activeStep, pageZeroDone, indicationReady, referralInPlay])

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
    setReferralInPlay(false)
    setSubclassDone(false)
    setReferralStage(null)
    setBinding(false)
    try { localStorage.removeItem(SAVE_KEY) } catch { /* nothing to clear */ }
  }

  /* A whole CA plumbing contractor, so a quick-jump lands on a page with
     something to look at. Indication filters carriers by
     carrierSelection.checked and prices off scheduled payroll, so a
     partial seed reads as "0 markets returned a price". */
  const seedDemoData = () => {
    updateFormData('pageZero', {
      productType: 'wc', state: 'CA', effectiveDate: '2026-04-01',
      mainClass: '5183', classDescription: 'Plumbing — shop & outside (≥ $31/hr)',
      isContractor: true,
    })
    updateFormData('business', {
      name: 'Sierra Ridge Plumbing Inc.',
      address: '1420 Prospect Rd', city: 'Saratoga', state: 'CA', zip: '95070',
      mailSame: true,
      entityType: 'corp',
      fein: '94-3827155',
      license: '#1085512',
      firstName: 'Dana',
      lastName: 'Ruiz',
      website: 'www.sierraridgeplumbing.com',
      hasDba: false,
      mailSame: true,
      additionalLocations: 'no',
      yearEstablished: '2014',
      industryExperience: '10+',
      phone: '(408) 555-1234',
      email: 'ops@sierraridgeplumbing.com',
    })
    updateFormData('history', {
      coverageStatus: 'inforce',
      priorYears: '4+',
      currentCarrier: 'State Fund',
      currentPremium: '$5,980',
      operations: 'Residential and light commercial plumbing — repipes, water heater replacement, drain and sewer service, and fixture installation across the greater Sacramento area.',
      claimsPast4: 'yes',
      claimCount: 1,
      losses: [
        { date: '2025-08-14', type: 'Medical', amount: '$3,200', description: 'Technician strained back lifting a water heater.' },
      ],
    })
    updateFormData('coverage', {
      elLimits: '$1M / $1M / $1M',
      officers: [
        { name: 'Marcus Ruiz', title: 'President', status: 'include' },
      ],
      CA: {
        classes: [
          { location: 'Location 1', code: '5183', description: 'Plumbing NOC', payroll: '$480,000', ftEmployees: '6', ptEmployees: '1' },
          { location: 'Location 1', code: '8810', description: 'Clerical office employees', payroll: '$96,000', ftEmployees: '2', ptEmployees: '0' },
        ],
        usesSubs: 'yes',
        subPercent: '15',
        subCertificates: 'Yes',
        blanketWaiver: false,
      },
    })
    updateFormData('underwriting', {
      experienceMod: '0.87', experienceModSource: 'WCIRB',
owner_involved: 'yes',
      ten_years_exp: 'yes',
      supervisor_ratio: 'yes',
      turnover_rate: 'Under 10%',
      safety_program: 'yes',
      safety_committee: 'yes',
      safety_meetings: 'yes',
      orientation_program: 'yes',
      accident_procedures: 'yes',
      ppe_required: 'yes',
      machines_guarded: 'yes',
      first_aid: 'yes',
      benefits_provided: 'yes',
      drug_testing: 'yes',
      return_to_work: 'yes',
      cleaning_frequency: 'Daily',
    })
    updateFormData('carrierSelection', {
      checked: Object.fromEntries(CARRIERS.map(c => [c.id, true])),
    })
    setPageZeroDone(true)
  }

  /* Jumping is a demo shortcut, so it always reseeds — otherwise a jump
     made after a partial run lands on a half-empty page. */
  const jumpToStep = (stepId) => {
    seedDemoData()
    setActiveStep(stepId)
    setShowingIndication(false)
    setSubmitted(false)
  }

  const jumpToIndication = () => {
    seedDemoData()
    setIndicationReady(true)
    setShowingIndication(true)
    setSubmitted(false)
  }

  const jumpToSubmission = () => {
    seedDemoData()
    updateFormData('bind', {
      selectedCarrier: 'CNA',
      premium: 5174,
      carrierQuestions: true,
      bound: true,
    })
    setBindSummary({ carrier: 'CNA', premium: 5174 })
    setIndicationReady(true)
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
          isDark={darkMode}
          onStart={(data) => {
            updateFormData('pageZero', data)
            setPageZeroDone(true)
          }}
        />
        <DemoBar jumps={demoJumps} active={demoActive} isDark={darkMode} />
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

  /* The market the agent went forward with — the bind flow and the carrier
     questions both key off it. */
  const selectedCarrier = CARRIERS.find(c => c.id === formData.bind?.selectedCarrierId) || null
  const selectedPremium = formData.bind?.premium || 0

  const titles = {
    business:    'Business information',
    history:     'Coverage history',
    losses:      'Loss history',
    locations:   'Locations',
    coverages:   'State coverages',
    questions:   'Credit opportunity',
    carriers:    'Choose the markets to approach',
    loading:     'Rating',
    indication:  'Price indication',
    subclass:    'Sub-class code',
    carrierflow: 'Carrier questions',
    referral:    'Refer to underwriter',
    referred:    'Referral submitted',
    bind:        'Bind',
    quote:       'Your quote',
  }

  // App-phase sections — rendered stacked in one scroll page. Loss
  // detail is conditionally included when the user reported claims > 0.
  const appSections = [
    { id: 1, key: 'business',  title: titles.business,  el: <BusinessInfo formData={formData} updateFormData={updateFormData} showErrors={attemptedQuote} /> },
    { id: 2, key: 'history',   title: titles.history,   el: <CoverageHistory formData={formData} updateFormData={updateFormData} /> },
    ...(hasLosses ? [{ id: 3, key: 'losses', title: titles.losses, el: <LossDetail formData={formData} updateFormData={updateFormData} /> }] : []),
    ...(hasLocations ? [{ id: 9, key: 'locations', title: titles.locations, el: (
      <Locations formData={formData} updateFormData={updateFormData}
        onBack={() => goToStep(hasLosses ? 3 : 2)} onContinue={() => goToStep(4)} />
    ) }] : []),
    { id: 4, key: 'coverages', title: titles.coverages, el: <StateCoverages formData={formData} updateFormData={updateFormData} replaceFormSection={replaceFormSection} /> },
    { id: 5, key: 'questions', title: titles.questions, el: (
      <UnderwritingQuestions
        formData={formData}
        updateFormData={updateFormData}
        showErrors={attemptedQuote}
        onValidateAll={() => {
          if (formData.underwriting?.safety_program !== undefined) return true
          setAttemptedQuote(true)
          return false
        }}
        onGetIndication={() => goToStep(6)}
        onGoToStep={goToStep}
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
                  <StepHeader title={
                    referralStage === 'form' ? titles.referral
                      : referralStage === 'submitted' ? titles.referred
                        : binding ? titles.bind
                          : currentKey === 'carrierflow' && !subclassDone ? titles.subclass
                            : (titles[currentKey] || '')
                  } />
                </div>
                <div className="px-4 md:px-6 pb-8 md:pb-10">
                  {rating && (
                    <Loading onDone={handleRatingDone} onSkip={handleRatingDone} />
                  )}
                  {!rating && !referralStage && showingIndication && (
                    <Indication
                      formData={formData}
                      onPickCarrier={handlePickCarrier}
                      referralInPlay={referralInPlay}
                      onRefer={() => setReferralStage('form')}
                    />
                  )}
                  {!rating && !showingIndication && !referralStage && currentKey === 'carriers' && (
                    <CarrierSelection
                      formData={formData}
                      updateFormData={updateFormData}
                      onGetIndication={handleGetIndication}
                      onBack={() => goToStep(5)}
                    />
                  )}
                  {!rating && referralStage === 'form' && (
                    <Referral
                      formData={formData}
                      updateFormData={updateFormData}
                      carrierName={selectedCarrier?.name}
                      carrierMandated={!!selectedCarrier && !(FACTORS[selectedCarrier.id] || {}).bind}
                      onBack={() => setReferralStage(null)}
                      onSubmit={() => { setReferralStage('submitted'); setReferralInPlay(true) }}
                    />
                  )}
                  {!rating && referralStage === 'submitted' && (
                    <ReferralSubmitted
                      quoteNumber="WC-2026-048291"
                      onBackToQuote={() => setReferralStage(null)}
                    />
                  )}
                  {!rating && !showingIndication && !referralStage && currentKey === 'carrierflow' && !subclassDone && (
                    <SubClassCode
                      formData={formData}
                      updateFormData={updateFormData}
                      carrierName={selectedCarrier?.name || 'the carrier'}
                      onBack={goToIndication}
                      onContinue={() => setSubclassDone(true)}
                    />
                  )}
                  {!rating && !showingIndication && !referralStage && currentKey === 'carrierflow' && subclassDone && (
                    <CarrierFlow
                      formData={formData}
                      updateFormData={updateFormData}
                      onContinueToQuote={handleContinueToQuote}
                      onGoToStep={goToStep}
                      onBack={() => setSubclassDone(false)}
                    />
                  )}
                  {!rating && !showingIndication && !referralStage && currentKey === 'quote' && !binding && (
                    <Quote
                      formData={formData}
                      updateFormData={updateFormData}
                      onBound={() => setBinding(true)}
                      onBack={() => setActiveStep(7)}
                    />
                  )}
                  {!rating && !showingIndication && !referralStage && currentKey === 'quote' && binding && (
                    <BindFlow
                      carrier={selectedCarrier}
                      premium={selectedPremium}
                      fees={feesFor(selectedPremium)}
                      quoteNumber="WC-2026-048291"
                      effectiveDate={formData.pageZero?.effectiveDate}
                      onBack={() => setBinding(false)}
                      onBound={handleBound}
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
        onEdit={goToStep}
      />
    </div>
  )
}

export default App
