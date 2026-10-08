import { useState } from 'react'
import { Input, Textarea } from '../../components/FormField'
import {
  FieldGroup,
  InfoDot,
  InfoLine,
  AlertGlyph,
  StepNav,
  InfoPanel,
} from '../../components/wc/primitives'

/* A file already on the submission. This is a mockup, so loss runs are taken
   as received rather than made the agent's problem — the gate itself is still
   modelled, it just starts satisfied. */
const SEEDED_FILES = [{ name: 'sierra-ridge-loss-runs-2023-2026.pdf', size: '1.2 MB' }]

function FileRow({ file, onRemove }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg px-3 py-2.5"
      style={{ background: 'var(--fill-subtle)', border: '1px solid var(--line-soft)' }}>
      <svg className="w-4 h-4 shrink-0" style={{ color: '#A614C3' }} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className="text-[12.5px] truncate flex-1" style={{ color: 'var(--ink-2)' }}>{file.name}</span>
      <span className="text-[11px] text-gray-400 shrink-0">{file.size}</span>
      <button type="button" onClick={onRemove}
        className="im-remove w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition"
        aria-label={`Remove ${file.name}`}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" d="M7 7l10 10M17 7L7 17" />
        </svg>
      </button>
    </div>
  )
}

function DropZone({ onAdd, label }) {
  return (
    <button type="button" onClick={() => onAdd()}
      className="add-another-btn w-full flex items-center justify-center gap-2 text-xs font-semibold border border-dashed border-[#A614C3]/30 rounded-xl px-4 py-5 transition">
      <svg className="w-4 h-4" style={{ color: '#A614C3' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
      </svg>
      <span className="text-gradient">{label}</span>
    </button>
  )
}

export function ReferralSubmitted({ quoteNumber, onBackToQuote }) {
  const next = [
    "You'll receive an email notification.",
    'Underwriter review typically takes 1–2 business days.',
    `This submission is read-only until a decision is made — contact BTIS at 877.649.6682 if a change is needed before then.`,
  ]
  return (
    <div className="w-full space-y-6">
      <div className="rounded-2xl p-7 text-center"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--line)' }}>
        <span className="im-chip-good w-12 h-12 rounded-full inline-flex items-center justify-center mb-3.5">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.6" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <h2 className="text-xl font-bold mb-1.5" style={{ color: 'var(--ink)' }}>Referral submitted</h2>
        <p className="text-[13px] text-gray-500 leading-relaxed max-w-md mx-auto">
          Your submission has been sent to an underwriter for review.
          We'll notify you when a decision is available.
        </p>
        {quoteNumber && (
          <p className="text-[12px] text-gray-400 mt-2.5">Quote {quoteNumber}</p>
        )}
      </div>

      <FieldGroup label="What happens next?">
        <div className="space-y-2.5">
          {next.map((line, i) => (
            <div key={i} className="im-info-panel rounded-xl px-4 py-3 flex items-center gap-2.5">
              <span className="im-panel-icon w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                <AlertGlyph className="w-3 h-3" />
              </span>
              <span className="text-[12px] text-gray-500 leading-relaxed">{line}</span>
            </div>
          ))}
        </div>
      </FieldGroup>

      <StepNav onBack={onBackToQuote} onContinue={onBackToQuote} continueLabel="Back to the submission" />
    </div>
  )
}

export default function Referral({
  formData,
  updateFormData,
  carrierName,
  /* Carrier-mandated referrals already know what they need, so Target Premium
     is optional there; the agent-initiated paths have to say what they are
     aiming at. */
  carrierMandated = false,
  onBack,
  onSubmit,
}) {
  const data = formData.referral || {}
  const [files, setFiles] = useState(SEEDED_FILES)
  const [showErrors, setShowErrors] = useState(false)

  const set = (key) => (val) => updateFormData('referral', { [key]: val })

  const claimCount = formData.history?.claimCount || 0
  /* Loss runs are demanded when the carrier itself requires review, or when
     the submission carries four or more claims. */
  const lossRunsRequired = carrierMandated || claimCount >= 4

  const needsTarget = !carrierMandated
  const missingTarget = needsTarget && !data.targetPremium
  const missingInfo = !data.additionalInfo
  const missingFiles = lossRunsRequired && files.length === 0
  const canSubmit = !missingTarget && !missingInfo && !missingFiles

  const submit = () => {
    if (!canSubmit) { setShowErrors(true); return }
    onSubmit()
  }

  return (
    <div className="w-full space-y-6">
      <FieldGroup label="Refer to underwriter">
        <p className="text-[12.5px] text-gray-500 leading-relaxed mb-4">
          One screen, one submit — no separate review step. An underwriter will follow up directly.
        </p>

        <div className="space-y-5">
          <Input
            label="Target premium"
            required={needsTarget}
            value={data.targetPremium}
            onChange={set('targetPremium')}
            placeholder="$"
            help={carrierMandated
              ? `Optional — ${carrierName || 'this carrier'} requires underwriting review regardless.`
              : undefined}
            error={showErrors && missingTarget}
          />

          <Textarea
            label="Additional information"
            required
            rows={4}
            value={data.additionalInfo}
            onChange={set('additionalInfo')}
            placeholder="Tell the underwriter what you're looking for — pricing flexibility, a coverage question, a risk outside current guidelines."
            error={showErrors && missingInfo}
          />
        </div>
      </FieldGroup>

      {lossRunsRequired && (
        <InfoPanel
          lead="Currently valued loss runs are required"
        >
          before an underwriter can review. Attach them below, or email them to{' '}
          <b className="font-semibold text-navy">comp@btisinc.com</b>
          and refer anyway — review can't finish until they arrive. Reference the quote number above.
        </InfoPanel>
      )}

      <FieldGroup label="Attachments">
        <div className="flex items-center gap-1.5 mb-3">
          <p className="text-[12.5px] text-gray-500">
            A competitor quote, loss runs, or anything else that helps the underwriter.
          </p>
          <InfoDot
            title="Attachments"
            text="Anything that supports the request — a competitor quote, currently valued loss runs, or notes on how the risk is controlled."
          />
        </div>

        <div className="space-y-2.5">
          {files.map((f, i) => (
            <FileRow key={f.name} file={f} onRemove={() => setFiles(fs => fs.filter((_, n) => n !== i))} />
          ))}
          <DropZone
            label={files.length ? 'Add another file' : 'Drag & drop files here, or click to upload'}
            onAdd={() => setFiles(fs => [...fs, { name: `attachment-${fs.length + 1}.pdf`, size: '480 KB' }])}
          />
        </div>

        {showErrors && missingFiles && (
          <p className="text-[12px] mt-2.5" style={{ color: '#B91C1C' }}>
            Attach the loss runs, or email them and remove this requirement with your underwriter.
          </p>
        )}
      </FieldGroup>

      <InfoLine>
        Submitting goes straight to confirmation — there is no separate review step.
      </InfoLine>

      <StepNav
        onBack={onBack}
        onContinue={submit}
        canContinue={canSubmit}
        continueLabel="Submit to underwriter"
        hint={canSubmit ? undefined : 'Target premium and additional information are needed before referring.'}
      />
    </div>
  )
}
