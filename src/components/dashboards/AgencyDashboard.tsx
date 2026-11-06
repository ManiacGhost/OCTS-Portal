import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { usePersona } from '../../context/PersonaContext';
import { useAuth } from '../../auth/AuthContext';
import { CreationStepper } from '../common/CreationStepper';
import { hasTactic, isApproved } from '../../data/approvalStatus';
import { StatusFlags } from '../common/StatusFlags';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  MESSAGING_TYPES,
  AUDIENCES,
  INDICATIONS,
  CAMPAIGN_TYPES,
  OBJECTIVES,
  buildCampaignTaxonomy,
  formulaTemplate,
} from '../../data/taxonomyFormulas';
import { Save, FilePlus, CheckCircle2, Send, Code, ArrowRight, ArrowLeft, Pencil, Layers, LayoutDashboard, Copy } from 'lucide-react';
import { CampaignTaxonomy } from '../../types';

const KIND_LABEL: Record<string, string> = { c: 'controlled', v: 'variable', m: 'machine', f: 'free text' };

// the creation flow only ever uses US
const CREATION_COUNTRIES = ['US'];

const TAS = [
  { id: 'ta-cart', label: 'Oncology', token: 'oncology' },
  { id: 'ta-hem', label: 'Hematology', token: 'hematology' },
];

const FIELD_CLS =
  'w-full bg-white border border-navy-200 ring-1 ring-navy-100 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-navy-500 font-medium';

/** 'YYYYMM-YYYYMM' → ['YYYY-MM', 'YYYY-MM'] for the month pickers. */
function parseDateRange(token: string | undefined): [string, string] | null {
  const m = /^(\d{4})(\d{2})-(\d{4})(\d{2})$/.exec(token || '');
  return m ? [`${m[1]}-${m[2]}`, `${m[3]}-${m[4]}`] : null;
}

export const AgencyDashboard: React.FC = () => {
  const { brands, activeBrand, campaigns, addCampaign, editCampaign, showToast, selectedMarket } = usePersona();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cloneId = searchParams.get('clone') || '';
  // /campaigns/:id/edit edits an existing campaign
  const editId = useParams().id || '';
  const isEdit = !!editId;

  // 1 = fill the campaign fields, 2 = review the formula
  const [step, setStep] = useState<1 | 2>(1);

  // The campaign formula fields (nothing else is asked at this stage)
  const [country, setCountry] = useState(CREATION_COUNTRIES[0]);
  const [taId, setTaId] = useState('ta-cart');
  const [brandId, setBrandId] = useState('');
  const [indication, setIndication] = useState(INDICATIONS[0]);
  const [messagingType, setMessagingType] = useState(MESSAGING_TYPES[0]);
  const [audience, setAudience] = useState(AUDIENCES[0]);
  // segment is split into name + value (free text) so a delimiter in the value can't break the string
  const [segmentName, setSegmentName] = useState('');
  const [segmentValue, setSegmentValue] = useState('');
  const [campaignType, setCampaignType] = useState(CAMPAIGN_TYPES[0]);
  const [objective, setObjective] = useState('');
  // always-on → Jan–Dec of this year; specific → the month pickers (YYYY-MM)
  const [year, setYear] = useState('2026');
  const [dateStart, setDateStart] = useState('2026-07');
  const [dateEnd, setDateEnd] = useState('2026-09');

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
    const f = c.formulaInputs || {};
    setSource(c);
    setCountry(CREATION_COUNTRIES[0]);
    setTaId(c.therapeuticAreaId === 'ta-hem' ? 'ta-hem' : 'ta-cart');
    if (c.brandId) setBrandId(c.brandId);
    if (f.indication) setIndication(f.indication);
    if (f.messagingType) setMessagingType(f.messagingType);
    if (f.audience) setAudience(f.audience);
    setSegmentName(f.segmentName || '');
    setSegmentValue(f.segmentValue || '');
    if (f.campaignType) setCampaignType(f.campaignType);
    setObjective(f.objective || '');
    const range = parseDateRange(f.date);
    if (range) {
      setYear(range[0].slice(0, 4));
      setDateStart(range[0]);
      setDateEnd(range[1]);
    }
    setStep(isEdit ? 1 : 2);
  }, [cloneId, editId, campaigns]);

  const cloning = !!source && !isEdit;
  const selectedBrand = brands.find(b => b.id === brandId);
  const isAlwaysOn = campaignType === CAMPAIGN_TYPES[0];
  // `date` is always a range, YYYYMM-YYYYMM
  const dateToken = isAlwaysOn
    ? `${year}01-${year}12`
    : `${dateStart.replace('-', '')}-${dateEnd.replace('-', '')}`;

  const formulaInputs: Record<string, string> = {
    country,
    ta: TAS.find(t => t.id === taId)?.token || 'oncology',
    product: selectedBrand?.code || '',
    indication,
    messagingType,
    audience,
    segmentName,
    segmentValue,
    campaignType,
    objective,
    date: dateToken,
  };
  const built = buildCampaignTaxonomy(formulaInputs);

  const missing: string[] = [];
  if (!brandId) missing.push('Product');
  if (!segmentName.trim()) missing.push('Segment name');
  if (!segmentValue.trim()) missing.push('Segment value');
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
        campaignName: derivedName,
        therapeuticAreaId: taId,
        brandId,
        keyMessageCategoryId: source?.keyMessageCategoryId || '',
        keyMessageSubcategoryId: source?.keyMessageSubcategoryId || '',
        formulaInputs,
        campaignCode: built.string,
        taxonomyString: built.string,
        targetAudience: audience,
        region: selectedMarket || 'US Commercial',
        quarter: `${year}-Q${Math.min(4, Math.ceil(Number((isAlwaysOn ? '01' : dateStart.slice(5, 7))) / 3))}`,
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
      const name = derivedName.trim() || 'Untitled draft';
      const quarter = `${year}-Q${Math.min(4, Math.ceil(Number((isAlwaysOn ? '01' : dateStart.slice(5, 7)) || '1') / 3))}`;
      if (isEdit && source) {
        const saved = await editCampaign(source.id, {
          campaignName: name,
          therapeuticAreaId: taId,
          brandId,
          formulaInputs,
          taxonomyString: built.string,
          quarter,
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
          agencyOwner: user?.organization || 'Klick Health',
          status: 'draft',
          notes: 'Saved as a draft',
        });
        if (!res) return;
      }
      showToast('Draft saved. Submit it for approval when it is ready.', 'success');
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
        campaignName: derivedName,
        therapeuticAreaId: taId,
        brandId,
        formulaInputs,
        taxonomyString: built.string,
        quarter: `${year}-Q${Math.min(4, Math.ceil(Number(isAlwaysOn ? '01' : dateStart.slice(5, 7)) / 3))}`,
      });
      if (saved) {
        showToast('Campaign changes submitted for approval.', 'success');
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
    if (isApproved(source.status)) setConfirmEdit(true);
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
            {isEdit ? 'Edit Campaign' : source ? 'Clone Campaign' : 'New Campaign'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isEdit
              ? 'Change the campaign fields and review the new formula'
              : source
              ? `Cloned from “${source.campaignName}” — check the formula, change what differs, then submit for approval`
              : 'Fill in the campaign fields and review the formula — it goes to the marketer when you submit — then add its tactic'}
            {' '}&mdash; {selectedMarket} &middot; {user?.organization}
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
          <p className="text-[11px] text-red-700">Make the changes below and save — the campaign goes back to the marketer for approval.</p>
        </div>
      )}

      {isEdit && source && (
        <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Status</span>
          <StatusFlags campaign={source} />
          {isApproved(source.status) && (
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
                ? 'Only the fields of the Campaign Name formula — channel and asset details come next, with the tactic.'
                : 'This is the Campaign Name taxonomy built from your fields.'}
            </p>
          </div>
          <CreationStepper current={1} />
        </div>

        {/* STEP 1 — the formula fields */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                {label('Country')}
                {select(country, setCountry, plain(CREATION_COUNTRIES))}
              </div>
              <div>
                {label('Therapeutic area')}
                {select(taId, setTaId, TAS.map(t => ({ value: t.id, label: t.label })))}
              </div>
              <div>
                {label('Product code')}
                <select
                  value={brandId}
                  onChange={e => setBrandId(e.target.value)}
                  className={`${FIELD_CLS} ${err(!brandId)}`}
                >
                  {(activeBrand ? [activeBrand] : brands).map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>
              <div>
                {label('Indication')}
                {select(indication, setIndication, plain(INDICATIONS))}
              </div>
              <div>
                {label('Messaging type')}
                {select(messagingType, setMessagingType, plain(MESSAGING_TYPES))}
              </div>
              <div>
                {label('Audience')}
                {select(audience, setAudience, plain(AUDIENCES))}
              </div>
              <div>
                {label('Segment name')}
                <input
                  type="text"
                  value={segmentName}
                  onChange={e => setSegmentName(e.target.value)}
                  placeholder="e.g. treater"
                  className={`${FIELD_CLS} ${err(!segmentName.trim())}`}
                />
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
                {select(campaignType, setCampaignType, plain(CAMPAIGN_TYPES))}
              </div>
              <div>
                {label('Objective', { optional: 'optional — left blank it stays in the string as na' })}
                {select(objective, setObjective, plain(OBJECTIVES), '— none —')}
              </div>

              <div className="sm:col-span-2">
                {label('Date')}
                {isAlwaysOn ? (
                  <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700">
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
                    <span className="font-mono font-bold text-slate-900">{dateToken}</span>
                    <span className="text-slate-400">— an always-on campaign spans Jan–Dec</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="month"
                      value={dateStart}
                      max={dateEnd || undefined}
                      onChange={e => setDateStart(e.target.value)}
                      aria-label="Start month"
                      className={`${FIELD_CLS} sm:w-44`}
                    />
                    <span className="text-xs text-slate-400">to</span>
                    <input
                      type="month"
                      value={dateEnd}
                      min={dateStart || undefined}
                      onChange={e => setDateEnd(e.target.value)}
                      aria-label="End month"
                      className={`${FIELD_CLS} sm:w-44`}
                    />
                    <span className="font-mono text-xs font-bold text-slate-700">{dateToken}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Formula so far</span>
              <div className="font-mono text-[11px] text-slate-700 break-all">{built.string}</div>
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

            {cloning && source && (
              <div className="text-xs bg-navy-50 border border-navy-200 text-navy-900 rounded-xl px-3.5 py-2.5">
                Only the campaign is copied. A tactic belongs to one campaign, so the clone starts with none — you can add its tactics once it is approved.
              </div>
            )}

            {duplicate && (
              <div className="text-xs bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-3.5 py-2.5">
                <strong>Heads up:</strong> a campaign with exactly this formula already exists (“{duplicate.campaignName}”).
                {cloning ? ' Go back and change a field — the date or segment, usually — so the clone is distinct.' : ''}
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
                  <span>{isEdit && source?.status !== 'draft' ? 'Save changes' : 'Submit for approval'}</span>
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
                {created.cloned ? 'Campaign cloned and submitted' : 'Campaign created successfully'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isApproved(created.campaign.status)
                  ? 'The campaign is approved. Next, add its tactic — channel, publisher, placement and the rest — and send that for approval too.'
                  : 'Your campaign has been created, but it is yet to be approved. Tactics can be added once the marketer approves it.'}
              </p>
              <code className="block mt-3 text-[11px] font-mono font-bold text-navy-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 break-all">
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
