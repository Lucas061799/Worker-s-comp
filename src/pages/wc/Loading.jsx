import { useEffect, useState } from 'react'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

const STEPS = [
  'Checking class eligibility by market',
  'Rating with 5 carriers',
  'Building your comparison',
]

export default function Loading({ onDone, onSkip }) {
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(12)

  useEffect(() => {
    const timers = [
      setTimeout(() => { setCurrent(1); setProgress(45) }, 1100),
      setTimeout(() => { setCurrent(2); setProgress(82) }, 2600),
      setTimeout(() => { setCurrent(3); setProgress(100) }, 3800),
      setTimeout(() => onDone && onDone(), 4300),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onDone])

  return (
    <div className="w-full max-w-2xl mx-auto text-center py-8">
      <p className="text-xs font-bold uppercase tracking-[0.15em] mb-3"
        style={{
          background: BRAND_GRADIENT,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
        Rating in progress
      </p>
      <h2 className="text-2xl md:text-3xl font-bold text-navy mb-3">Building your comparison</h2>
      <p className="text-sm text-gray-500 mb-8">
        Multi-carrier rating usually takes 30–60 seconds. We save as we go — you won't lose anything.
      </p>

      {/* Progress bar */}
      <div className="h-2 rounded-full overflow-hidden max-w-md mx-auto mb-6"
        style={{ background: '#E5E7EB' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, background: BRAND_GRADIENT }} />
      </div>

      {/* Steps */}
      <div className="max-w-md mx-auto text-left space-y-3 mb-8">
        {STEPS.map((label, i) => {
          const done = current > i
          const active = current === i
          return (
            <div key={label} className="flex items-center gap-3 text-sm"
              style={{ color: done || active ? '#111827' : '#9CA3AF', fontWeight: active || done ? 600 : 400 }}>
              <span
                className="w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-mono font-bold shrink-0"
                style={done
                  ? { background: BRAND_GRADIENT, color: 'white' }
                  : { background: 'white', color: '#9CA3AF', border: '2px solid #E5E7EB' }
                }
              >
                {done ? '✓' : i + 1}
              </span>
              {label}
            </div>
          )
        })}
      </div>

      {/* Promo */}
      <div
        className="max-w-md mx-auto rounded-2xl p-5 text-left mb-6"
        style={{
          background: BRAND_GRADIENT,
          color: 'white',
          boxShadow: '0 10px 30px rgba(92,46,212,0.25)',
        }}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-80 mb-1">
          While you wait · Q3 promotion
        </p>
        <h3 className="text-base font-bold mb-1">+2% boosted commission on AmTrust binds</h3>
        <p className="text-xs opacity-90">
          Marketing slot — the one screen an agent reliably reads for 30–60 seconds.
        </p>
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="text-xs text-gray-400 underline hover:text-gray-600"
      >
        Skip the wait (demo only)
      </button>
    </div>
  )
}
