import { useEffect } from 'react'
import { Input, Select, Checkbox, FormGrid } from '../../components/FormField'
import AddressAutocomplete from '../../components/AddressAutocomplete'
import {FieldGroup, NotePanel, YesNo, InfoPanel } from '../../components/wc/primitives'

const ENTITY_OPTIONS = [
  { value: 'corp',    label: 'Corporation' },
  { value: 'llc',     label: 'LLC' },
  { value: 'sole',    label: 'Sole proprietor' },
  { value: 'partner', label: 'Partnership' },
]

/* 0 through 10, where 10 reads as the open-ended top of the range. */
const EXPERIENCE_OPTIONS = Array.from({ length: 11 }, (_, i) =>
  i === 10 ? '10+' : String(i)
)

/* A question whose answer is a pill pair rather than a text box — same
   label typography as Input so the column reads as one form. */
function PillField({ label, required, value, onChange, children }) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-gray-600 mb-2.5 tracking-wide">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <YesNo value={value} onChange={onChange} name={label} />
      {children}
    </div>
  )
}

export default function BusinessInfo({ formData, updateFormData, showErrors = false }) {
  const data = formData.business || {}
  const pageZero = formData.pageZero || {}
  const isCA = pageZero.state === 'CA'
  const isContractor = !!pageZero.isContractor
  const isTransportation = !!pageZero.isTransportation

  const set = (key) => (val) => updateFormData('business', { [key]: val })
  const err = (key) => showErrors && (data[key] === undefined || data[key] === null || data[key] === '')

  /* A contracting class started with a licence number means CSLB has already
     been asked, and what it returns lands on this screen. The agent is told so
     and asked to check it, rather than finding fields filled in with no
     explanation. */
  const cslbLicense = isContractor ? (pageZero.contractorLicense || '') : ''
  const cslbFound = !!cslbLicense && !!data.cslbPrefilled

  /* Gated on what it writes rather than a ref: a ref latched before a timer
     that the cleanup cancels never fires at all under StrictMode's
     mount/unmount/mount, because the second pass returns early. */
  useEffect(() => {
    if (!cslbLicense || data.cslbPrefilled) return
    const t = setTimeout(() => {
      updateFormData('business', {
        cslbPrefilled: true,
        ...(data.name ? {} : { name: 'Sierra Ridge Plumbing, Inc.' }),
        ...(data.entityType ? {} : { entityType: 'corp' }),
        ...(data.yearEstablished ? {} : { yearEstablished: '2014' }),
      })
    }, 700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cslbLicense, data.cslbPrefilled])

  /* The bureau lookup still fires off the FEIN and pre-fills the mod; State
     coverages is where it surfaces, and where the agent confirms it. Nothing
     is said about it here. */
  useEffect(() => {
    const digits = (data.fein || '').replace(/\D/g, '')
    if (digits.length < 9 || !isCA || formData.underwriting?.experienceMod) return
    const t = setTimeout(() => {
      updateFormData('underwriting', { experienceMod: '0.87', experienceModSource: 'WCIRB' })
    }, 900)
    return () => clearTimeout(t)
  }, [data.fein, isCA, formData.underwriting?.experienceMod, updateFormData])

  return (
    <div className="w-full space-y-6">
      {cslbFound && (
        <InfoPanel
          icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>}
          lead={<>CSLB licence {cslbLicense} found.</>}
        >
          Fields on screen prefilled — please confirm before continuing.
        </InfoPanel>
      )}

      <FieldGroup label="Company Information">
        <div className="space-y-5">
          {/* The DBA question qualifies the legal name, so it sits under it
              rather than floating across the group on its own line. */}
          <FormGrid>
            <div>
              <Input
                label="Legal business name"
                required
                value={data.name}
                onChange={set('name')}
                placeholder="Business name"
                error={err('name')}
              />
              <Checkbox
                className="mt-3"
                label="Operates under a DBA (doing business as)"
                checked={!!data.hasDba}
                onChange={val => updateFormData('business', { hasDba: val, ...(val ? {} : { dbaName: '' }) })}
              />
            </div>
            <div>
              <Input
                label="FEIN"
                required
                value={data.fein}
                onChange={set('fein')}
                placeholder="94-0000000"
                error={err('fein')}
              />
            </div>
          </FormGrid>

          {/* DBA name leads when the box above is ticked — it qualifies the
              legal name, so it belongs next to it rather than after the
              website. Website takes the row on its own otherwise. */}
          <FormGrid>
            {data.hasDba && (
              <Input
                label="DBA name"
                value={data.dbaName}
                onChange={set('dbaName')}
                placeholder="e.g. Sierra Ridge Plumbing & Rooter"
              />
            )}
            <Input
              label="Website"
              value={data.website}
              onChange={set('website')}
              placeholder="e.g. www.sierraridgeplumbing.com"
            />
          </FormGrid>
        </div>
      </FieldGroup>

      <FieldGroup label="Physical Address">
        <div className="space-y-5">
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

          <PillField
            label="Is the mailing address the same as the physical address?"
            required
            value={data.mailSame === false ? 'no' : 'yes'}
            onChange={val => set('mailSame')(val === 'yes')}
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

          {/* Answering Yes adds the Locations step to the sidebar. */}
          <PillField
            label="Do you have additional locations?"
            required
            value={data.additionalLocations || 'no'}
            onChange={set('additionalLocations')}
          />

          {/* Transportation classes carry their own permit numbers. */}
          {isTransportation && (
            <FormGrid>
              <Input
                label="Public Utilities Commission (PUC) number"
                value={data.pucNumber}
                onChange={set('pucNumber')}
                placeholder="Permit number"
              />
              <Input
                label="California Motor Carrier Permit number"
                value={data.motorCarrierNumber}
                onChange={set('motorCarrierNumber')}
                placeholder="Permit number"
              />
            </FormGrid>
          )}
        </div>
      </FieldGroup>

      <FieldGroup label="Contact Info">
        <div className="space-y-5">
          <FormGrid>
            <Input label="First name" required value={data.firstName} onChange={set('firstName')} placeholder="First name" error={err('firstName')} />
            <Input label="Last name"  required value={data.lastName}  onChange={set('lastName')}  placeholder="Last name"  error={err('lastName')} />
          </FormGrid>
          <FormGrid>
            <Input label="Phone" required type="tel"   value={data.phone} onChange={set('phone')} placeholder="(555) 123-4567" error={err('phone')} />
            <Input label="Email" required type="email" value={data.email} onChange={set('email')} placeholder="e.g. owner@business.com" error={err('email')} />
          </FormGrid>
        </div>
      </FieldGroup>

      <FieldGroup label="Entity">
        <div className="space-y-5">
          <FormGrid>
            <Select
              label="Entity type"
              required
              options={ENTITY_OPTIONS}
              value={data.entityType || 'corp'}
              onChange={set('entityType')}
              error={err('entityType')}
            />
            <Input
              label="Year business was established"
              required
              value={data.yearEstablished}
              onChange={set('yearEstablished')}
              placeholder="e.g. 2014"
              error={err('yearEstablished')}
            />
          </FormGrid>
          <FormGrid>
            <Select
              label="Years of industry experience"
              required
              options={EXPERIENCE_OPTIONS}
              value={data.industryExperience}
              onChange={set('industryExperience')}
              error={err('industryExperience')}
            />
          </FormGrid>
        </div>
      </FieldGroup>
    </div>
  )
}
