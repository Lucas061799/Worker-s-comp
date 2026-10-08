import { useEffect, useState } from 'react'
import { Tag, BrandText, InfoPanel } from '../../components/wc/primitives'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

/* The two waits in the flow. Rating fans out across the markets; finalizing
   is the single call that turns an indication into a bindable number, so it
   is shorter, says less, and sells nothing while it runs. */
export const RATING = {
  tag: 'Rating in progress',
  heading: 'Building your comparison',
  lead: "Multi-carrier rating usually takes 30–60 seconds. We save as we go — you won't lose anything.",
  steps: [
    'Checking class eligibility by market',
    'Rating with 5 carriers',
    'Building your comparison',
  ],
  /* [when the step finishes, where the bar sits once it has] */
  marks: [[1100, 45], [2600, 82], [3800, 100]],
  start: 12,
}

export const FINALIZING = {
  tag: 'Carrier call in progress',
  heading: 'Finalizing your quote',
  lead: 'One more call to the carrier to lock the final price with your remaining answers.',
  steps: [
    'Submitting carrier-specific answers',
    'Loading final price',
  ],
  marks: [[900, 55], [2200, 100]],
  start: 10,
}

export default function Loading({ plan = RATING, children, onDone, onSkip }) {
  const { tag, heading, lead, steps, marks, start } = plan
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(start)

  /* The plan is a module constant, so this runs once per interstitial; the
     reset keeps a second visit from opening on the last run's full bar. */
  useEffect(() => {
    setCurrent(0)
    setProgress(start)
    const timers = marks.map(([at, pct], i) =>
      setTimeout(() => { setCurrent(i + 1); setProgress(pct) }, at))
    timers.push(setTimeout(() => onDone && onDone(), marks[marks.length - 1][0] + 500))
    return () => timers.forEach(clearTimeout)
  }, [plan, onDone])

  return (
    <div className="w-full">
      <div className="rounded-2xl p-6 md:p-7" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <Tag tone="brand">{tag}</Tag>
          <BrandText className="text-xs font-bold">{progress}%</BrandText>
        </div>

        <h2 className="text-lg font-bold text-navy mb-1">{heading}</h2>
        <p className="text-[12.5px] text-gray-500 leading-relaxed mb-5">{lead}</p>

        <div className="im-progress-track h-1.5 rounded-full overflow-hidden mb-6">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: BRAND_GRADIENT }} />
        </div>

        {/* Steps — the rail's numbered-step shape. */}
        <div className={`space-y-3 ${children ? 'mb-6' : ''}`}>
          {steps.map((label, i) => {
            const done = current > i
            const active = current === i
            return (
              <div key={label} className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    done || active ? '' : 'im-step-pending'}`}
                  style={done || active
                    ? { background: 'linear-gradient(88.09deg, rgba(92,46,212,0.12) 0%, rgba(166,20,195,0.12) 100%)', color: '#5C2ED4' }
                    : undefined}
                >
                  {done ? '✓' : i + 1}
                </span>
                <span
                  className={`text-[13px] ${active ? 'font-semibold' : done ? 'font-medium' : ''}`}
                  style={{ color: done ? '#4B5563' : active ? '#111827' : '#9CA3AF' }}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>

        {children}
      </div>

      <div className="mt-4">
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

/* What the rating wait fills its spare moment with. Finalizing gets none —
   it is seconds long and the agent is already on the way to a price. */
export function RatingPromo() {
  return (
    <InfoPanel lead="Q3 promotion — +2% boosted commission on AmTrust binds.">
      Applies to policies bound with AmTrust through BTIS this quarter.
    </InfoPanel>
  )
}
