import { useEffect } from 'react'
import { Input, Select, Checkbox, FormGrid } from '../../components/FormField'
import AddressAutocomplete from '../../components/AddressAutocomplete'
import { FieldGroup, YesNo, InfoPanel, Tag, InfoDot } from '../../components/wc/primitives'
import { US_STATES } from '../PageZero'

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

/* A field label that can carry more than its own name: the required mark, an
   "Optional" marker, the CSLB chip that says where a prefilled answer came
   from, and an ⓘ for the fields that need a sentence of explanation the
   column has no room to print. Passed to Input/Select as the label, so one
   definition keeps every column on the same baseline. */
function fieldLabel(text, { required, optional, tag, info } = {}) {
  return (
    <span className="flex items-center gap-2 min-h-5">
      <span>
        {text}
        {required && <span className="text-red-400 ml-0.5">*</span>}
        {optional && <span className="font-medium ml-1.5" style={{ color: '#9CA3AF' }}>Optional</span>}
      </span>
      {tag && <Tag size="sm" tone="teal">{tag}</Tag>}
      {info && <InfoDot title={info.title} text={info.text} />}
    </span>
  )
}

/* A question whose answer is a pill pair rather than a text box — same
   label typography as Input so the column reads as one form. */
function PillField({ label, required, value, onChange, help }) {
  return (
    <div>
      {/* A <label>, not a span: the page's ink treatment darkens `label`,
          and a span beside it comes out a whole step lighter. */}
      <label className="block text-[13px] font-semibold text-gray-600 mb-2.5 tracking-wide">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <YesNo value={value} onChange={onChange} name={label} />
      {help && <p className="text-xs text-gray-500 mt-2">{help}</p>}
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
     explanation. The chip marks which fields it filled. */
  const cslbLicense = isContractor ? (pageZero.contractorLicense || '') : ''
  const cslbFound = !!cslbLicense && !!data.cslbPrefilled
  const cslb = cslbFound ? 'CSLB' : undefined

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
          tone="good"
          lead={<>CSLB licence {cslbLicense} found.</>}
        >
          We prefilled the fields tagged CSLB. Please confirm them.
        </InfoPanel>
      )}

      <FieldGroup label="Company">
        <div className="space-y-5">
          {/* The name takes two columns of the three the row below uses, so
              the legal name has room to be read and FEIN keeps the width its
              nine digits need. */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
            <Input
              className="sm:col-span-2"
              label={fieldLabel('Legal business name', { required: true, tag: cslb })}
              value={data.name}
              onChange={set('name')}
              placeholder="Business name"
              error={err('name')}
            />
            <Input
              label={fieldLabel('FEIN', { required: true })}
              value={data.fein}
              onChange={set('fein')}
              placeholder="00-0000000"
              error={err('fein')}
            />
            {/* The DBA question qualifies the legal name, so it sits
                directly under it and takes the same two columns rather
                than running the width of the card. */}
            <div className="sm:col-span-2">
              <Checkbox
                label="Operates under a DBA (doing business as)"
                checked={!!data.hasDba}
                onChange={val => updateFormData('business', { hasDba: val, ...(val ? {} : { dbaName: '' }) })}
              />
            </div>
            {data.hasDba && (
              <Input
                className="sm:col-span-2"
                label={fieldLabel('DBA name', { required: true })}
                value={data.dbaName}
                onChange={set('dbaName')}
                placeholder="Name customers know the business by"
                error={err('dbaName')}
              />
            )}
          </div>

          {/* What the business is, how long it has been it, and how long the
              owner has done the trade — one row, because all three qualify
              the same thing. */}
          <FormGrid cols={3}>
            <Select
              label={fieldLabel('Entity type', { required: true, tag: cslb })}
              options={ENTITY_OPTIONS}
              value={data.entityType || 'corp'}
              onChange={set('entityType')}
              error={err('entityType')}
            />
            <Input
              label={fieldLabel('Year business was established', { required: true })}
              value={data.yearEstablished}
              onChange={set('yearEstablished')}
              placeholder="e.g. 2014"
              digits
              maxLength={4}
              error={err('yearEstablished')}
            />
            <Select
              label={fieldLabel('Years of industry experience', {
                required: true,
                info: {
                  title: 'Years of industry experience',
                  text: "Owner's experience in this trade, including before this business.",
                },
              })}
              options={EXPERIENCE_OPTIONS}
              value={data.industryExperience}
              onChange={set('industryExperience')}
              error={err('industryExperience')}
            />
          </FormGrid>

          {/* Transportation classes carry their own permit numbers. */}
          {isTransportation && (
            <FormGrid>
              <Input
                label={fieldLabel('Public Utilities Commission (PUC) number')}
                value={data.pucNumber}
                onChange={set('pucNumber')}
                placeholder="Permit number"
              />
              <Input
                label={fieldLabel('California Motor Carrier Permit number')}
                value={data.motorCarrierNumber}
                onChange={set('motorCarrierNumber')}
                placeholder="Permit number"
              />
            </FormGrid>
          )}

          <FormGrid>
            <Input
              label={fieldLabel('Website', { optional: true })}
              value={data.website}
              onChange={set('website')}
              placeholder="e.g. www.sierraridgeplumbing.com"
            />
          </FormGrid>
        </div>
      </FieldGroup>

      <FieldGroup label="Physical address">
        <div className="space-y-5">
          {/* The street still autocompletes — picking a suggestion fills the
              three boxes below, which stay editable rather than being
              reported back in a panel the agent cannot correct. */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
            <AddressAutocomplete
              className="sm:col-span-2"
              label={fieldLabel('Street address', { required: true, tag: cslb })}
              value={data.address || ''}
              onChange={set('address')}
              onSelect={({ address, city, state, zip }) =>
                updateFormData('business', { address, city, state, zip })
              }
              error={err('address') ? 'This field is required' : ''}
            />
            <Input
              label={fieldLabel('Suite / unit', { optional: true })}
              value={data.suite}
              onChange={set('suite')}
              placeholder="Suite (optional)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-x-6 gap-y-5">
            <Input
              label={fieldLabel('City', { required: true })}
              value={data.city}
              onChange={set('city')}
              placeholder="City"
              error={err('city')}
            />
            <Select
              label={fieldLabel('State', { required: true })}
              options={US_STATES}
              value={data.state}
              onChange={set('state')}
              error={err('state')}
            />
            <Input
              label={fieldLabel('ZIP', { required: true })}
              value={data.zip}
              onChange={set('zip')}
              placeholder="00000"
              digits
              maxLength={5}
              error={err('zip')}
            />
          </div>

          <PillField
            label="Is the mailing address the same?"
            required
            value={data.mailSame === false ? 'no' : 'yes'}
            onChange={val => set('mailSame')(val === 'yes')}
          />

          {data.mailSame === false && (
            <AddressAutocomplete
              label={fieldLabel('Mailing address', { required: true })}
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
        </div>
      </FieldGroup>

      <FieldGroup label="Insured contact info">
        <div className="space-y-5">
          <FormGrid>
            <Input
              label={fieldLabel('First name', { required: true })}
              value={data.firstName}
              onChange={set('firstName')}
              placeholder="First name"
              error={err('firstName')}
            />
            <Input
              label={fieldLabel('Last name', { required: true })}
              value={data.lastName}
              onChange={set('lastName')}
              placeholder="Last name"
              error={err('lastName')}
            />
          </FormGrid>
          {/* The two numbers share a row, so the company's and the
              contact's are read against each other rather than a column
              apart. */}
          <FormGrid>
            <Input
              label={fieldLabel('Business phone', { required: true })}
              type="tel"
              value={data.businessPhone}
              onChange={set('businessPhone')}
              placeholder="(555) 000-0000"
              error={err('businessPhone')}
            />
            <Input
              label={fieldLabel('Phone', { required: true })}
              type="tel"
              value={data.phone}
              onChange={set('phone')}
              placeholder="(555) 123-4567"
              error={err('phone')}
            />
          </FormGrid>
          <FormGrid>
            <Input
              label={fieldLabel('Email', { required: true })}
              type="email"
              value={data.email}
              onChange={set('email')}
              placeholder="e.g. owner@business.com"
              error={err('email')}
            />
          </FormGrid>
        </div>
      </FieldGroup>
    </div>
  )
}
