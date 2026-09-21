import { useState, useEffect, useRef } from 'react'
import { Input, Select, Checkbox, FormGrid } from '../../components/FormField'
import AddressAutocomplete from '../../components/AddressAutocomplete'
import { FieldGroup, NotePanel, Tag, InfoLine } from '../../components/wc/primitives'

const ENTITY_OPTIONS = [
  { value: 'corp',    label: 'Corporation' },
  { value: 'llc',     label: 'LLC' },
  { value: 'sole',    label: 'Sole proprietor' },
  { value: 'partner', label: 'Partnership' },
]

export default function BusinessInfo({ formData, updateFormData, showErrors = false }) {
  const data = formData.business || {}
  const pageZero = formData.pageZero || {}
  const isCA = pageZero.state === 'CA'
  const isContractor = !!pageZero.isContractor

  const set = (key) => (val) => updateFormData('business', { [key]: val })
  const err = (key) => showErrors && (data[key] === undefined || data[key] === null || data[key] === '')

  const [emodStatus, setEmodStatus] = useState('idle') // idle | fetching | ready | manual | down
  const firedRef = useRef(false)

  useEffect(() => {
    const digits = (data.fein || '').replace(/\D/g, '')
    if (digits.length < 9 || firedRef.current) return
    firedRef.current = true
    if (isCA) {
      setEmodStatus('fetching')
      const t = setTimeout(() => {
        updateFormData('underwriting', { experienceMod: '0.87', experienceModSource: 'WCIRB' })
        setEmodStatus('ready')
      }, 900)
      return () => clearTimeout(t)
    } else {
      setEmodStatus('manual')
    }
  }, [data.fein, isCA, updateFormData])

  const simulateApiDown = () => setEmodStatus('down')

  const emodValue = formData.underwriting?.experienceMod

  return (
    <div className="w-full space-y-6">
      <p className="text-sm text-gray-500 -mt-2">
        Start typing the address — we'll fill in the rest.
      </p>

      <FieldGroup label="Company Information">
        <div className="space-y-5">
          <Input
            label="Legal business name"
            required
            value={data.name}
            onChange={set('name')}
            placeholder="Business name"
            error={err('name')}
          />

          <AddressAutocomplete
            label="Physical address"
            required
            value={data.address || ''}
            onChange={set('address')}
            onSelect={({ address, city, state, zip }) =>
              updateFormData('business', { address, city, state, zip })
            }
            error={err('address') ? 'This field is required' : ''}
          />

          {data.address && data.city && (
            <NotePanel title="Address parsed">
              {data.address}, {data.city}, {data.state} {data.zip}
            </NotePanel>
          )}

          <Checkbox
            label="Mailing address is the same"
            checked={data.mailSame ?? true}
            onChange={val => set('mailSame')(val)}
          />

          {data.mailSame === false && (
            <AddressAutocomplete
              label="Mailing address"
              required
              value={data.mailAddress || ''}
              onChange={set('mailAddress')}
              onSelect={({ address, city, state, zip }) =>
                updateFormData('business', {
                  mailAddress: address,
                  mailCity: city,
                  mailState: state,
                  mailZip: zip,
                })
              }
              error={err('mailAddress') ? 'This field is required' : ''}
            />
          )}

          <FormGrid>
            <Select
              label="Entity type"
              required
              options={ENTITY_OPTIONS}
              value={data.entityType || 'corp'}
              onChange={set('entityType')}
              error={err('entityType')}
            />
            <div>
              <Input
                label="FEIN"
                required
                value={data.fein}
                onChange={set('fein')}
                placeholder="94-0000000"
                error={err('fein')}
              />
              {isCA && (
                <p className="text-xs text-gray-500 mt-1.5">
                  In California we use this to pull the experience mod automatically.
                </p>
              )}
            </div>
          </FormGrid>

          {isContractor && (
            <div>
              <Input
                label="Contractor license (CSLB)"
                value={data.license}
                onChange={set('license')}
                placeholder="#0000000"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Shown because the primary class is a contracting class. Pre-fills business details when found.
              </p>
            </div>
          )}

          <FormGrid>
            <Input
              label="Years in business"
              required
              value={data.yearsInBusiness}
              onChange={set('yearsInBusiness')}
              placeholder="e.g. 8"
              error={err('yearsInBusiness')}
            />
            <div />
          </FormGrid>

          {/* Experience mod result panel */}
          {emodStatus !== 'idle' && (
            <div className="rounded-lg p-3.5" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
              {emodStatus === 'fetching' && (
                <span className="inline-flex items-center gap-2 text-xs font-semibold"
                  style={{ color: '#6B7280' }}>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#7C3AED' }} />
                  Checking WCIRB…
                </span>
              )}
              {emodStatus === 'ready' && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag tone="brand">E-Mod {emodValue} · WCIRB</Tag>
                  <span className="text-xs text-gray-500">You'll see it applied on State coverages.</span>
                  <button
                    type="button"
                    onClick={simulateApiDown}
                    className="text-xs text-gray-400 underline ml-auto"
                  >
                    Demo: what if the WCIRB API is down?
                  </button>
                </div>
              )}
              {(emodStatus === 'manual' || emodStatus === 'down') && (
                <div>
                  {emodStatus === 'down' && (
                    <p className="text-[11px] font-semibold mb-2 im-note-warn">
                      WCIRB unavailable — enter manually
                    </p>
                  )}
                  <Input
                    label={`Experience mod ${emodStatus === 'manual' ? '(enter if one exists)' : ''}`}
                    value={emodValue}
                    onChange={v => updateFormData('underwriting', { experienceMod: v, experienceModSource: 'Manual' })}
                    placeholder="1.00"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    {emodStatus === 'manual'
                      ? "Auto-pull isn't available for this state's bureau yet."
                      : 'If the bureau call fails, the agent enters the mod.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </FieldGroup>

      <FieldGroup label="Contact Details">
        <FormGrid>
          <Input label="Phone" required type="tel" value={data.phone} onChange={set('phone')} placeholder="(555) 123-4567" error={err('phone')} />
          <Input label="Email" required type="email" value={data.email} onChange={set('email')} placeholder="e.g. owner@business.com" error={err('email')} />
        </FormGrid>
      </FieldGroup>
    </div>
  )
}
