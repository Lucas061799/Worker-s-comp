import { useEffect, useState } from 'react'
import { Tag } from '../../components/wc/primitives'

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
    <div className="w-full max-w-xl mx-auto text-center py-14 md:py-20">
      <div className="mb-5 flex justify-center">
        <Tag tone="brand">Rating in progress</Tag>
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-navy mb-3">Building your comparison</h2>
      <p className="text-sm md:text-base text-gray-500 leading-relaxed mb-10 max-w-md mx-auto">
        Multi-carrier rating usually takes 30–60 seconds. We save as we go — you won't lose anything.
      </p>

      <div className="max-w-md mx-auto">
        <div className="h-1.5 rounded-full overflow-hidden mb-8" style={{ background: '#F3F4F6' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: BRAND_GRADIENT }} />
        </div>

        {/* Steps — the rail's numbered-step shape. */}
        <div className="text-left space-y-4 mb-10">
          {STEPS.map((label, i) => {
            const done = current > i
            const active = current === i
            return (
              <div key={label} className="flex items-center gap-3.5">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold shrink-0"
                  style={done || active
                    ? { background: 'linear-gradient(88.09deg, rgba(92,46,212,0.12) 0%, rgba(166,20,195,0.12) 100%)', color: '#5C2ED4' }
                    : { background: '#F3F4F6', color: '#9CA3AF' }}
                >
                  {done ? '✓' : i + 1}
                </span>
                <span
                  className={`text-sm ${active ? 'font-semibold' : done ? 'font-medium' : ''}`}
                  style={{ color: done ? '#4B5563' : active ? '#111827' : '#9CA3AF' }}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>

        {/* While you wait — the canonical info panel, not a gradient slab. */}
        <div className="rounded-xl p-4 mb-8 flex items-start gap-3 text-left"
          style={{ background: 'rgba(92,46,212,0.05)', border: '1px solid rgba(92,46,212,0.18)' }}>
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="#5C2ED4" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5" strokeLinecap="round" />
            <circle cx="12" cy="16.5" r="0.6" fill="#5C2ED4" />
          </svg>
          <p className="text-[12.5px] text-gray-600 leading-relaxed">
            <span className="font-bold text-navy">Q3 promotion — +2% boosted commission on AmTrust binds.</span>{' '}
            Applies to policies bound with AmTrust through BTIS this quarter.
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
    </div>
  )
}
