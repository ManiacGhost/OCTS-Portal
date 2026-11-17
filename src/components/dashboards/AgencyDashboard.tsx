import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { usePersona } from '../../context/PersonaContext';
import { useAuth } from '../../auth/AuthContext';
import { selfApproves } from '../../auth/permissions';
import { CreationStepper } from '../common/CreationStepper';
import { hasTactic, isApproved, campaignDates } from '../../data/approvalStatus';
import { StatusFlags } from '../common/StatusFlags';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { buildCampaignTaxonomy, formulaTemplate } from '../../data/taxonomyFormulas';
import {
  useDictValues,
  dictValues,
  canonicalizeFormulaInputs,
  dictBrandValue,
  isAlwaysOnType,
} from '../../data/kiteDictionary';
import { Save, FilePlus, CheckCircle2, Send, Code, ArrowRight, ArrowLeft, Pencil, Layers, LayoutDashboard, Copy } from 'lucide-react';
import { CampaignTaxonomy } from '../../types';

const KIND_LABEL: Record<string, string> = { c: 'controlled', v: 'variable', m: 'machine', f: 'free text' };

/** Dropdown options: the dictionary's values, plus a value an older record already holds so it isn't lost. */
const withCurrent = (list: string[], current: string) => (current && !list.includes(current) ? [...list, current] : list);

const FIELD_CLS =
  'w-full bg-white border border-navy-200 ring-1 ring-navy-100 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-navy-500 font-medium';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const AgencyDashboard: React.FC = () => {
  const { brands, activeBrand, campaigns, addCampaign, editCampaign, showToast, selectedMarket } = usePersona();
  const { user } = useAuth();
  // the marketer approves campaigns, so what they create or change is approved straight away
  const autoApprove = selfApproves(user?.role);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cloneId = searchParams.get('clone') || '';
  // /campaigns/:id/edit edits an existing campaign
  const editId = useParams().id || '';
  const isEdit = !!editId;

  // 1 = fill the campaign fields, 2 = review the formula
  const [step, setStep] = useState<1 | 2>(1);

  // The campaign formula fields (nothing else is asked at this stage)
  // every field below except the free-text ones is a dropdown fed by the dictionary (field → attributes)
  const countries = useDictValues('country');
  const tas = useDictValues('ta');
  const indications = useDictValues('indc');
  const messagingTypes = useDictValues('messaging_type');
  const audiences = useDictValues('target');
  const campaignTypes = useDictValues('alrt_typ');
  const objectives = useDictValues('objective');
  const segmentNames = useDictValues('segment_name');

  const [country, setCountry] = useState(() => dictValues('country').find(v => v === 'US') || dictValues('country')[0] || '');
  const [taValue, setTaValue] = useState(() => dictValues('ta')[0] || '');
  // the internal therapeutic-area record follows the dictionary value
  const taId = /hem/i.test(taValue) ? 'ta-hem' : 'ta-cart';
  const [brandId, setBrandId] = useState('');
  const [indication, setIndication] = useState(() => dictValues('indc')[0] || '');
  const [messagingType, setMessagingType] = useState(() => dictValues('messaging_type').find(v => v === 'Branded') || dictValues('messaging_type')[0] || '');
  const [audience, setAudience] = useState(() => dictValues('target').find(v => v === 'HCP') || dictValues('target')[0] || '');
  // segment is split into name + value (free text) so a delimiter in the value can't break the string
  const [segmentName, setSegmentName] = useState('');
  const [segmentValue, setSegmentValue] = useState('');
  const [campaignType, setCampaignType] = useState(() => dictValues('alrt_typ').find(v => isAlwaysOnType(v)) || dictValues('alrt_typ')[0] || '');
  const [objective, setObjective] = useState('');
  // free-text name for the campaign; not part of the formula
  const [marketingName, setMarketingName] = useState('');
  // The dates go into the formula's date token as YYYYMM-YYYYMM.
  // always on → a year and the month it starts in (it runs through December); specific → a start and end date
  const [year, setYear] = useState('2026');
  const [startMonth, setStartMonth] = useState('01');
  const [dateStart, setDateStart] = useState('2026-07-01');
  const [dateEnd, setDateEnd] = useState('2026-09-30');

  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [created, setCreated] = useState<{ campaign: CampaignTaxonomy; cloned: boolean } | null>(null);
  // the campaign being cloned (its tactics do not come along: a tactic belongs to one campaign only)
  const [source, setSource] = useState<CampaignTaxonomy | null>(null);
  const clonedOnce = useRef(false);

  // the product is always the brand the portal is scoped to
  useEffect(() => {
    const b = activeBrand || brands[0];
    if (b && brandId !== b.id) setBrandId(b.id);
  }, [activeBrand, brands, brandId]);

  // Clone: fill every field from the source campaign and jump straight to the review step.
  useEffect(() => {
    const srcId = editId || cloneId;
    if (!srcId || clonedOnce.current) return;
    const c = campaigns.find(x => x.id === srcId);
    if (!c) return;
    clonedOnce.current = true;
    const f = canonicalizeFormulaInputs(c.formulaInputs || {});
    setSource(c);
    if (f.country) setCountry(f.country);
    if (f.ta) setTaValue(f.ta);
    if (c.brandId) setBrandId(c.brandId);
    if (f.indication) setIndication(f.indication);
    if (f.messagingType) setMessagingType(f.messagingType);
    if (f.audience) setAudience(f.audience);
    setSegmentName(f.segmentName || '');
    setSegmentValue(f.segmentValue || '');
    if (f.campaignType) setCampaignType(f.campaignType);
    setObjective(f.objective || '');
    setMarketingName(isEdit ? c.campaignName : `${c.campaignName} (copy)`);
    const d = campaignDates(c);
    if (d.start) {
      setYear(d.start.slice(0, 4));
      setStartMonth(d.start.slice(5, 7));
      setDateStart(d.start);
      setDateEnd(d.end || d.start);
    }
    setStep(isEdit ? 1 : 2);
  }, [cloneId, editId, campaigns]);

  const cloning = !!source && !isEdit;
  const selectedBrand = brands.find(b => b.id === brandId);
  const isAlwaysOn = isAlwaysOnType(campaignType);
  const campaignStart = isAlwaysOn ? `${year}-${startMonth}-01` : dateStart;
  const campaignEnd = isAlwaysOn ? `${year}-12-31` : dateEnd;
  const quarterToken = `${campaignStart.slice(0, 4)}-Q${Math.ceil(Number(campaignStart.slice(5, 7) || '1') / 3)}`;

  const formulaInputs: Record<string, string> = {
    country,
    ta: taValue,
    product: selectedBrand ? dictBrandValue(selectedBrand.name, selectedBrand.code) : '',
    indication,
    messagingType,
    audience,
    segmentName,
    segmentValue,
    campaignType,
    objective,
    // YYYYMM-YYYYMM from the campaign's start and end dates
    date: campaignStart && campaignEnd ? `${campaignStart.slice(0, 7).replace('-', '')}-${campaignEnd.slice(0, 7).replace('-', '')}` : '',
  };
  const built = buildCampaignTaxonomy(formulaInputs);

  const missing: string[] = [];
  if (!brandId) missing.push('Product');
  if (!segmentName.trim()) missing.push('Segment name');
  if (!segmentValue.trim()) missing.push('Segment value');
  if (!objective) missing.push('Objective');
  if (!marketingName.trim()) missing.push('Campaign name');
  if (!isAlwaysOn && (!dateStart || !dateEnd || dateStart > dateEnd)) missing.push('Date range');

  const duplicate = campaigns.find(c => c.taxonomyString === built.string && c.id !== editId);

  const goReview = () => {
    if (missing.length) {
      setShowErrors(true);
      showToast(`Please complete: ${missing.join(', ')}`, 'error');
      return;
    }
    setStep(2);
  };

  // The campaign's display name is derived from its fields — there's no separate title to type.
  const derivedName =
    `${selectedBrand?.name.split(/[ (]/)[0] || 'Campaign'} ${indication} · ${segmentValue || segmentName}` +
    ` (${campaignType}${objective ? `, ${objective}` : ''})`;

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      const cloned = cloning;
      const res = await addCampaign({
        campaignName: marketingName.trim(),
        startDate: campaignStart,
        endDate: campaignEnd,
        therapeuticAreaId: taId,
        brandId,
        keyMessageCategoryId: source?.keyMessageCategoryId || '',
        keyMessageSubcategoryId: source?.keyMessageSubcategoryId || '',
        formulaInputs,
        campaignCode: built.string,
        taxonomyString: built.string,
        targetAudience: audience,
        region: selectedMarket || 'US Commercial',
        quarter: quarterToken,
        agencyOwner: user?.organization || 'Klick Health',
        // every campaign goes to the marketer as soon as it is created, tactic or not
        status: 'submitted',
        notes: cloned ? `Cloned from ${source?.campaignName}` : 'Created via the Campaign Creation flow',
      });
      if (res) setCreated({ campaign: res, cloned });
    } finally {
      setIsSubmitting(false);
    }
  };

  // A draft is saved as it is (no fields are required) and is not sent to the marketer.
  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      const name = marketingName.trim() || derivedName.trim() || 'Untitled draft';
      const quarter = quarterToken;
      if (isEdit && source) {
        const saved = await editCampaign(source.id, {
          campaignName: name,
          therapeuticAreaId: taId,
          brandId,
          formulaInputs,
          taxonomyString: built.string,
          quarter,
          startDate: campaignStart,
          endDate: campaignEnd,
          asDraft: source.status === 'draft',
        });
        if (!saved) return;
      } else {
        const res = await addCampaign({
          campaignName: name,
          therapeuticAreaId: taId,
          brandId,
          keyMessageCategoryId: source?.keyMessageCategoryId || '',
          keyMessageSubcategoryId: source?.keyMessageSubcategoryId || '',
          formulaInputs,
          campaignCode: built.string,
          taxonomyString: built.string,
          targetAudience: audience,
          region: selectedMarket || 'US Commercial',
          quarter,
          startDate: campaignStart,
          endDate: campaignEnd,
          agencyOwner: user?.organization || 'Klick Health',
          status: 'draft',
          notes: 'Saved as a draft',
        });
        if (!res) return;
      }
      showToast(autoApprove ? 'Draft saved. Create it when it is ready.' : 'Draft saved. Submit it for approval when it is ready.', 'success');
      navigate('/overview');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- editing an existing campaign ----
  const [confirmEdit, setConfirmEdit] = useState(false);
  const editChanged = isEdit && !!source && built.string !== source.taxonomyString;
  const applyEdit = async () => {
    if (!source) return;
    setIsSubmitting(true);
    try {
      const saved = await editCampaign(source.id, {
        campaignName: marketingName.trim(),
        startDate: campaignStart,
        endDate: campaignEnd,
        therapeuticAreaId: taId,
        brandId,
        formulaInputs,
        taxonomyString: built.string,
        quarter: quarterToken,
      });
      if (saved) {
        showToast(autoApprove ? 'Campaign changes saved and approved.' : 'Campaign changes submitted for approval.', 'success');
        navigate('/overview');
      }
    } finally {
      setIsSubmitting(false);
      setConfirmEdit(false);
    }
  };
  const handleSaveEdit = () => {
    if (!source) return;
    if (!editChanged && source.status !== 'draft') {
      showToast('No changes to save.', 'info');
      return;
    }
    // changing an approved campaign sends it back for approval — ask first
    if (isApproved(source.status) && !autoApprove) setConfirmEdit(true);
    else applyEdit();
  };

  const label = (text: string, opts?: { optional?: string; hint?: string }) => (
    <label className="block text-xs font-bold text-slate-700 mb-1">
      {text}
      {opts?.optional ? (
        <span className="text-slate-400 font-normal"> ({opts.optional})</span>
      ) : (
        <span className="text-navy-500"> *</span>
      )}
      {opts?.hint && <span className="text-slate-400 font-normal"> ({opts.hint})</span>}
    </label>
  );
  const err = (bad: boolean) => (showErrors && bad ? 'border-red-400 ring-red-100' : '');

  const select = (
    value: string,
    set: (v: string) => void,
    options: { value: string; label: string }[],
    blank?: string
  ) => (
    <select value={value} onChange={e => set(e.target.value)} className={FIELD_CLS}>
      {blank && <option value="">{blank}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
  const plain = (xs: string[]) => xs.map(x => ({ value: x, label: x }));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            <FilePlus />
            {isEdit ? 'Edit Campaign' : source ? 'Clone Campaign' : 'New Campaign'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isEdit
              ? 'Change the campaign fields and review the new formula'
              : source
              ? `Cloned from “${source.campaignName}”: check the formula, change what differs, then ${autoApprove ? 'create it' : 'submit for approval'}`
              : autoApprove
              ? 'Fill in the campaign fields and review the formula, then add its tactic. As the marketer, what you create is approved straight away'
              : 'Fill in the campaign fields and review the formula (it goes to the marketer when you submit), then add its tactic'}
            {' '}&middot; {selectedMarket} &middot; {user?.organization}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/overview')}
          className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2 hover:border-navy-300 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Campaigns
        </button>
      </div>

      {isEdit && source && source.status === 'rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-xs text-red-900 space-y-1" role="note">
          <div className="font-extrabold">The marketer rejected this campaign</div>
          <p className="leading-relaxed">“{source.reviewNotes?.campaign || source.notes || 'No comment was left.'}”</p>
          <p className="text-[11px] text-red-700">Make the changes below and save: the campaign goes back to the marketer for approval.</p>
        </div>
      )}

      {isEdit && source && (
        <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Status</span>
          <StatusFlags campaign={source} />
          {isApproved(source.status) && !autoApprove && (
            <span className="text-[11px] text-slate-500">
              Saving a change sends the campaign back for approval; the tactic is not affected.
            </span>
          )}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-6 shadow-sm text-slate-900">
        <div className="border-b border-slate-100 pb-5 space-y-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <FilePlus className="w-5 h-5 text-navy-600" />
              {step === 1 ? 'Campaign details' : 'Review campaign formula'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {step === 1
                ? 'The campaign name, the formula fields and the campaign dates. Channel and asset details come next, with the tactic.'
                : 'This is the Campaign Name taxonomy built from your fields.'}
            </p>
          </div>
          <CreationStepper current={1} />
        </div>

        {/* STEP 1 — the formula fields */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                {label('Campaign name')}
                <input
                  type="text"
                  value={marketingName}
                  onChange={e => setMarketingName(e.target.value)}
                  placeholder="e.g. Yescarta 2L LBCL - ORR awareness push"
                  className={`${FIELD_CLS} ${err(!marketingName.trim())}`}
                />
              </div>
              <div>
                {label('Country')}
                {select(country, setCountry, plain(withCurrent(countries, country)))}
              </div>
              <div>
                {label('Therapeutic area')}
                {select(taValue, setTaValue, plain(withCurrent(tas, taValue)))}
              </div>
              <div>
                {label('Product code')}
                <select
                  value={brandId}
                  onChange={e => setBrandId(e.target.value)}
                  className={`${FIELD_CLS} ${err(!brandId)}`}
                >
                  {(activeBrand ? [activeBrand] : brands).map(b => (
                    <option key={b.id} value={b.id}>{dictBrandValue(b.name, b.code)}</option>
                  ))}
                </select>
              </div>
              <div>
                {label('Indication')}
                {select(indication, setIndication, plain(withCurrent(indications, indication)))}
              </div>
              <div>
                {label('Messaging type')}
                {select(messagingType, setMessagingType, plain(withCurrent(messagingTypes, messagingType)))}
              </div>
              <div>
                {label('Audience')}
                {select(audience, setAudience, plain(withCurrent(audiences, audience)))}
              </div>
              <div>
                {label('Segment name')}
                {select(segmentName, setSegmentName, plain(withCurrent(segmentNames, segmentName)), 'Select…')}
              </div>
              <div>
                {label('Segment value')}
                <input
                  type="text"
                  value={segmentValue}
                  onChange={e => setSegmentValue(e.target.value)}
                  placeholder="e.g. P1-CART-Treaters"
                  className={`${FIELD_CLS} ${err(!segmentValue.trim())}`}
                />
              </div>
              <div>
                {label('Campaign type')}
                {select(campaignType, setCampaignType, plain(withCurrent(campaignTypes, campaignType)))}
              </div>
              <div>
                {label('Objective')}
                <select
                  value={objective}
                  onChange={e => setObjective(e.target.value)}
                  className={`${FIELD_CLS} ${err(!objective)}`}
                >
                  <option value="">Select…</option>
                  {withCurrent(objectives, objective).map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                {label('Campaign dates')}
                {isAlwaysOn ? (
                  <div className="flex flex-wrap items-center gap-2 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700">
                    <span className="font-semibold text-slate-500">Starts</span>
                    <select
                      value={startMonth}
                      onChange={e => setStartMonth(e.target.value)}
                      aria-label="Start month"
                      className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold"
                    >
                      {MONTHS.map((m, i) => (
                        <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={year}
                      onChange={e => setYear(e.target.value)}
                      aria-label="Year"
                      className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold"
                    >
                      {['2026', '2027', '2028'].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <span className="text-slate-400"> · an always-on campaign runs through December {year}</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="date"
                      value={dateStart}
                      max={dateEnd || undefined}
                      onChange={e => setDateStart(e.target.value)}
                      aria-label="Start date"
                      className={`${FIELD_CLS} sm:w-48 ${err(!dateStart || dateStart > dateEnd)}`}
                    />
                    <span className="text-xs text-slate-400">to</span>
                    <input
                      type="date"
                      value={dateEnd}
                      min={dateStart || undefined}
                      onChange={e => setDateEnd(e.target.value)}
                      aria-label="End date"
                      className={`${FIELD_CLS} sm:w-48 ${err(!dateEnd || dateStart > dateEnd)}`}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl border border-slate-200 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save as draft</span>
              </button>
              <button
                type="button"
                onClick={goReview}
                className="bg-navy-600 hover:bg-navy-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm"
              >
                <span>Next: Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — review the formula */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Code className="w-4 h-4 text-navy-400" />
                  Approved Campaign Name formula
                </h4>
                {cloning && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                    <Copy className="w-3 h-3" /> Clone
                  </span>
                )}
              </div>
              <div className="font-mono text-[11px] text-slate-300 break-words">{formulaTemplate()}</div>
              <div className="text-[10px] text-slate-500">
                (c) controlled &nbsp;·&nbsp; (v) variable &nbsp;·&nbsp; (m) machine &nbsp;·&nbsp; (f) free text
              </div>

              <div className="space-y-1">
                {built.tokens.map((tok, i) => (
                  <div key={tok.key} className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-500 w-5 text-right">{i + 1}.</span>
                    <span className="text-slate-400 w-40 shrink-0">
                      {tok.label} <span className="text-slate-600">({KIND_LABEL[tok.kind]})</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-300 truncate">{tok.value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Campaign Name taxonomy string
                </span>
                <div className="font-mono text-xs text-navy-300 font-bold break-all">{built.string}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
              <div>
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Campaign name</span>
                <span className="font-bold text-slate-900">{marketingName || '-'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Campaign dates</span>
                <span className="font-bold text-slate-900">{campaignStart || '-'} → {campaignEnd || '-'}</span>
              </div>
              <p className="sm:col-span-2 text-[11px] text-slate-400">The campaign name is a campaign detail: it is not part of the formula above. The dates make up its date token (YYYYMM-YYYYMM). A system-generated Campaign ID is assigned when you submit.</p>
            </div>

            {cloning && source && (
              <div className="text-xs bg-navy-50 border border-navy-200 text-navy-900 rounded-xl px-3.5 py-2.5">
                Only the campaign is copied. A tactic belongs to one campaign, so the clone starts with none: you can add its tactics once it is approved.
              </div>
            )}

            {duplicate && (
              <div className="text-xs bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-3.5 py-2.5">
                <strong>Heads up:</strong> a campaign with exactly this formula already exists (“{duplicate.campaignName}”).
                {cloning ? ' Go back and change a field (the date or segment, usually) so the clone is distinct.' : ''}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                <span>Edit details</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl border border-slate-200 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save as draft</span>
                </button>
                <button
                  type="button"
                  onClick={isEdit ? handleSaveEdit : handleCreate}
                  disabled={isSubmitting || missing.length > 0}
                  className="bg-navy-600 hover:bg-navy-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs px-8 py-3 rounded-xl transition flex items-center gap-2 shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>{isEdit && source?.status !== 'draft' ? 'Save changes' : autoApprove ? 'Create campaign' : 'Submit for approval'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {confirmEdit && (
        <ConfirmDialog
          title="Submit changes to an approved campaign?"
          message="This campaign is already approved. If you submit these changes it goes back to the marketer and shows as pending approval until they approve it again. Its tactic stays as it is."
          confirmLabel="Yes, submit changes"
          busy={isSubmitting}
          onConfirm={applyEdit}
          onCancel={() => setConfirmEdit(false)}
        />
      )}

      {/* Campaign created — go on to the tactic, or back to the listing */}
      {created && (
        <div
          className="fixed inset-0 z-[130] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Campaign created successfully"
        >
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {created.cloned ? (isApproved(created.campaign.status) ? 'Campaign cloned and approved' : 'Campaign cloned and submitted') : 'Campaign created successfully'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isApproved(created.campaign.status)
                  ? 'The campaign is approved. Next, add its tactic (channel, publisher, placement and the rest). Tactics need no approval.'
                  : 'Your campaign has been created, but it is yet to be approved. Tactics can be added once the marketer approves it.'}
              </p>
              {created.campaign.campaignId && (
                <p className="mt-3 text-xs text-slate-600">Campaign ID: <span className="font-mono font-bold text-navy-700">{created.campaign.campaignId}</span></p>
              )}
              <code className="block mt-2 text-[11px] font-mono font-bold text-navy-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 break-all">
                {created.campaign.taxonomyString}
              </code>
            </div>
            {isApproved(created.campaign.status) && <p className="text-xs text-slate-600">What would you like to do next?</p>}
            <div className="flex flex-col sm:flex-row gap-2">
              {isApproved(created.campaign.status) && (
                <button
                  type="button"
                  onClick={() => navigate(`/campaigns/${created.campaign.id}/tactic`)}
                  className="flex-1 bg-navy-600 hover:bg-navy-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Layers className="w-4 h-4" />
                  Go to Tactic creation
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate('/overview')}
                className="flex-1 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Campaign listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
