import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Layers, Link2, Send } from 'lucide-react';
import { usePersona } from '../context/PersonaContext';
import { CreationStepper } from '../components/common/CreationStepper';
import { VaultCombobox } from '../components/common/VaultCombobox';
import { useDictValues, channelTypeOf, channelFromType } from '../data/kiteDictionary';
import { hasTactic, isApproved, tacticStatusOf, tacticCode, campaignIdOf, campaignDates } from '../data/approvalStatus';
import { StatusFlags } from '../components/common/StatusFlags';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import type { MediaChannelType } from '../types';

const CHANNEL_ID: Record<MediaChannelType, string> = {
  Digital: 'chan-digital',
  Social: 'chan-social',
  Search: 'chan-search',
  Email: 'chan-email',
  IVA: 'chan-iva',
  Website: 'chan-website',
};

const FIELD_CLS =
  'w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-navy-500 font-medium';

/** Dropdown options: the dictionary's values, plus a value an older tactic already holds so it isn't lost. */
const withCurrent = (list: string[], current: string) => (current && !list.includes(current) ? [...list, current] : list);

export const TacticPage: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { campaigns, isLoading, saveTactic, submitForApproval, showToast, brands } = usePersona();
  const campaign = campaigns.find(c => c.id === id);
  const [searchParams] = useSearchParams();
  // "Add tactic" on a campaign that already has one: build a new tactic instead of editing the first
  const isNew = searchParams.get('new') === '1' && !!campaign && hasTactic(campaign);
  // once a new tactic is saved, everything after (submit, UTM) acts on that record
  const newId = useRef<string | null>(null);
  const targetId = () => newId.current ?? campaign!.id;

  // every field here except placement, landing page and dates is a dropdown fed by the dictionary
  const channels = useDictValues('chnl');
  const subChannels = useDictValues('sub_chnl');
  const publishers = useDictValues('src');
  const audiences = useDictValues('target');
  const assetValues = useDictValues('aset_id');
  const assetItems = useMemo(() => assetValues.map(v => ({ id: v, name: v })), [assetValues]);

  const [channel, setChannel] = useState('');
  // the portal's own channel category follows the dictionary channel
  const channelType: MediaChannelType = channelTypeOf(channel);
  const [subChannel, setSubChannel] = useState('');
  const [publisher, setPublisher] = useState('');
  const [placement, setPlacement] = useState('');
  const [assetId, setAssetId] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [landingPageUrl, setLandingPageUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  // which action is waiting on the 'submit changes to an approved tactic?' pop-up
  const [confirm, setConfirm] = useState<null | 'utm' | 'submit'>(null);

  // Fill from the saved tactic (editing) or sensible defaults from the campaign (first time).
  useEffect(() => {
    if (!campaign || loaded) return;
    setLoaded(true);
    const t = isNew ? undefined : campaign.tactic;
    if (!isNew) {
      setChannel(campaign.tactic?.channel || channelFromType(campaign.channelType));
      setSubChannel(campaign.subChannel || '');
    }
    setAssetId(isNew ? '' : campaign.assetId || '');
    setTargetAudience(t?.targetAudience || campaign.formulaInputs?.audience || campaign.targetAudience || '');
    setPublisher(t?.publisher || '');
    setPlacement(t?.placement || '');
    setLandingPageUrl(t?.landingPageUrl || campaign.contentAssetUrl || '');
    const d = campaignDates(campaign);
    setStartDate(t?.startDate || d.start);
    setEndDate(t?.endDate || d.end);
  }, [campaign, loaded]);

  const problems = useMemo(() => {
    const p: Record<string, string> = {};
    if (!channel) p.channel = 'Choose the channel.';
    if (!subChannel) p.subChannel = 'Choose the sub-channel.';
    if (!publisher.trim()) p.publisher = 'Choose the publisher or platform.';
    if (!targetAudience) p.targetAudience = 'Choose the target audience.';
    if (!placement.trim()) p.placement = 'Enter the placement.';
    if (!assetId.trim()) p.assetId = 'Choose the creative / asset ID.';
    if (!/^https?:\/\/\S+\.\S+/i.test(landingPageUrl.trim())) p.landingPageUrl = 'Enter a full URL, starting with https://';
    if (!startDate) p.startDate = 'Pick a start date.';
    if (!endDate) p.endDate = 'Pick an end date.';
    else if (startDate && endDate < startDate) p.endDate = 'The end date is before the start date.';
    return p;
  }, [channel, subChannel, publisher, placement, targetAudience, assetId, landingPageUrl, startDate, endDate]);

  if (isLoading) return <div className="p-10 text-center text-sm text-slate-400">Loading…</div>;
  if (!campaign) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
        <p className="text-sm text-slate-600">That campaign could not be found.</p>
        <button
          type="button"
          onClick={() => navigate('/overview')}
          className="text-xs font-bold text-navy-700 underline underline-offset-2"
        >
          Back to the campaign listing
        </button>
      </div>
    );
  }

  // tactics can only be created for an approved campaign (an existing tactic can still be edited)
  if (!isApproved(campaign.status) && !hasTactic(campaign)) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
        <p className="text-sm text-slate-600">
          This campaign is yet to be approved. Tactics can be added once the marketer approves it.
        </p>
        <button
          type="button"
          onClick={() => navigate('/overview')}
          className="text-xs font-bold text-navy-700 underline underline-offset-2"
        >
          Back to the campaign listing
        </button>
      </div>
    );
  }

  const brand = brands.find(b => b.id === campaign.brandId);
  const tStatus = isNew && !newId.current ? undefined : tacticStatusOf(campaign);

  // Has anything in the tactic changed since it was last saved?
  const saved = isNew && !newId.current ? undefined : campaign.tactic;
  const changed =
    !saved ||
    channel !== (saved.channel ?? channelFromType(campaign.channelType)) ||
    subChannel !== (campaign.subChannel || '') ||
    assetId !== (campaign.assetId || '') ||
    publisher.trim() !== saved.publisher ||
    placement.trim() !== saved.placement ||
    targetAudience !== saved.targetAudience ||
    landingPageUrl.trim() !== saved.landingPageUrl ||
    startDate !== saved.startDate ||
    endDate !== saved.endDate;
  const tacticApproved = isApproved(tStatus);

  const persist = async (resubmit = false): Promise<boolean> => {
    if (Object.keys(problems).length) {
      setShowErrors(true);
      showToast('Please complete the highlighted tactic fields.', 'error');
      return false;
    }
    const result = await saveTactic(targetId(), {
      resubmit,
      asNew: isNew && !newId.current,
      channelId: CHANNEL_ID[channelType],
      channelType,
      subChannel,
      assetId,
      tactic: {
        channel,
        publisher: publisher.trim(),
        placement: placement.trim(),
        targetAudience,
        landingPageUrl: landingPageUrl.trim(),
        startDate,
        endDate,
      },
    });
    if (result) newId.current = result.id;
    return !!result;
  };

  const goUtm = () => navigate(`/utm?tactic=${targetId()}`);

  /** Run an action, asking first when it would change an approved tactic. */
  const guard = (action: 'utm' | 'submit') => {
    if (Object.keys(problems).length) {
      setShowErrors(true);
      showToast('Please complete the highlighted tactic fields.', 'error');
      return;
    }
    if (tacticApproved && !changed) {
      // nothing changed: the tactic stays approved, no re-approval needed
      showToast('No changes to the tactic: it stays approved.', 'info');
      if (action === 'utm') goUtm();
      else navigate('/overview');
      return;
    }
    if (tacticApproved && changed) {
      setConfirm(action);
      return;
    }
    run(action, false);
  };

  const run = async (action: 'utm' | 'submit', resubmit: boolean) => {
    setBusy(true);
    try {
      if (!(await persist(resubmit))) return;
      if (action === 'utm') {
        showToast('Tactic saved.', 'success');
        goUtm();
      } else {
        // a changed approved tactic was already re-submitted by the save; otherwise send it now
        if (resubmit || (await submitForApproval(targetId()))) {
          showToast('Tactic submitted to the marketer for approval.', 'success');
          navigate('/overview');
        }
      }
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  const fieldErr = (k: string) => (showErrors && problems[k] ? 'border-red-400 ring-1 ring-red-100' : '');
  const errMsg = (k: string) =>
    showErrors && problems[k] ? <p className="text-[11px] font-bold text-red-600 mt-1">{problems[k]}</p> : null;
  const req = <span className="text-navy-500"> *</span>;

  // already with the marketer / approved, nothing left to send
  const alreadySent = tStatus === 'submitted' && !changed;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            <Layers />
            Tactic Creation
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 truncate">
            {brand?.name.split(/[ (]/)[0]} &middot; {campaign.campaignName}
          </p>
          {hasTactic(campaign) && !isNew && (
            <p className="text-[11px] font-mono font-bold text-navy-700 mt-0.5">Campaign ID: {campaignIdOf(campaign)} · Tactic ID: {tacticCode(campaign)}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => navigate('/overview')}
          className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2 hover:border-navy-300 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Campaign listing
        </button>
      </div>

      {tStatus === 'rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-xs text-red-900 space-y-1" role="note">
          <div className="font-extrabold">The marketer rejected this tactic</div>
          <p className="leading-relaxed">“{campaign.reviewNotes?.tactic || 'No comment was left.'}”</p>
          <p className="text-[11px] text-red-700">The campaign stays approved. Make the changes below and resubmit the tactic for approval.</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Status</span>
        <StatusFlags campaign={campaign} />
        {hasTactic(campaign) && tacticApproved && (
          <span className="text-[11px] text-slate-500">
            This tactic is approved: only changes to it go back for approval.
          </span>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-6 shadow-sm text-slate-900">
        <div className="border-b border-slate-100 pb-5 space-y-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-navy-600" />
              Tactic details
            </h3>
            <code className="block mt-1 text-[11px] font-mono text-slate-500 break-all">{campaign.taxonomyString}</code>
          </div>
          <CreationStepper current={2} campaignId={campaign.id} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="t-channel" className="block text-xs font-bold text-slate-700 mb-1">Channel{req}</label>
            <select id="t-channel" value={channel} onChange={e => setChannel(e.target.value)} className={`${FIELD_CLS} ${fieldErr('channel')}`}>
              <option value="">Select…</option>
              {withCurrent(channels, channel).map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            {errMsg('channel')}
          </div>

          <div>
            <label htmlFor="t-subchannel" className="block text-xs font-bold text-slate-700 mb-1">Sub-channel{req}</label>
            <select id="t-subchannel" value={subChannel} onChange={e => setSubChannel(e.target.value)} className={`${FIELD_CLS} ${fieldErr('subChannel')}`}>
              <option value="">Select…</option>
              {withCurrent(subChannels, subChannel).map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            {errMsg('subChannel')}
          </div>

          <div>
            <label htmlFor="t-publisher" className="block text-xs font-bold text-slate-700 mb-1">Publisher / Platform{req}</label>
            <select id="t-publisher" value={publisher} onChange={e => setPublisher(e.target.value)} className={`${FIELD_CLS} ${fieldErr('publisher')}`}>
              <option value="">Select…</option>
              {withCurrent(publishers, publisher).map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            {errMsg('publisher')}
          </div>

          <div>
            <label htmlFor="t-placement" className="block text-xs font-bold text-slate-700 mb-1">Placement{req}</label>
            <input
              id="t-placement"
              value={placement}
              onChange={e => setPlacement(e.target.value)}
              placeholder="e.g. Homepage banner - 728x90"
              className={`${FIELD_CLS} ${fieldErr('placement')}`}
            />
            {errMsg('placement')}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Creative / Asset ID{req}</label>
            <VaultCombobox
              value={assetId}
              onChange={setAssetId}
              items={assetItems}
              ariaLabel="Creative / Asset ID"
              placeholder="Search or select an asset ID…"
            />
            {errMsg('assetId')}
          </div>

          <div>
            <label htmlFor="t-audience" className="block text-xs font-bold text-slate-700 mb-1">Target audience{req}</label>
            <select
              id="t-audience"
              value={targetAudience}
              onChange={e => setTargetAudience(e.target.value)}
              className={`${FIELD_CLS} ${fieldErr('targetAudience')}`}
            >
              <option value="">Select…</option>
              {withCurrent(audiences, targetAudience).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errMsg('targetAudience')}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="t-url" className="block text-xs font-bold text-slate-700 mb-1">Landing page URL{req}</label>
            <input
              id="t-url"
              type="url"
              value={landingPageUrl}
              onChange={e => setLandingPageUrl(e.target.value)}
              placeholder="https://www.yescarta.com/…"
              className={`${FIELD_CLS} ${fieldErr('landingPageUrl')}`}
            />
            {errMsg('landingPageUrl')}
          </div>

          <div>
            <label htmlFor="t-start" className="block text-xs font-bold text-slate-700 mb-1">Start date{req}</label>
            <input
              id="t-start"
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={e => setStartDate(e.target.value)}
              className={`${FIELD_CLS} ${fieldErr('startDate')}`}
            />
            {errMsg('startDate')}
          </div>
          <div>
            <label htmlFor="t-end" className="block text-xs font-bold text-slate-700 mb-1">End date{req}</label>
            <input
              id="t-end"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={e => setEndDate(e.target.value)}
              className={`${FIELD_CLS} ${fieldErr('endDate')}`}
            />
            {errMsg('endDate')}
          </div>
        </div>

        {alreadySent && (
          <div className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3.5 py-2.5">
            Campaign is <strong>{campaign.status}</strong> and tactic is <strong>{tStatus}</strong>: there is nothing left to send for approval.
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 max-w-sm">
            The campaign is already with the marketer; the tactic is approved separately, and UTMs need no approval.
            You can generate UTMs before or after sending the tactic.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => guard('utm')}
              disabled={busy}
              className="bg-white hover:bg-navy-50 disabled:opacity-60 text-navy-700 font-bold text-xs px-5 py-2.5 rounded-xl border border-navy-200 transition flex items-center justify-center gap-2"
            >
              <Link2 className="w-4 h-4" />
              Save &amp; go to UTM Generator
            </button>
            <button
              type="button"
              onClick={() => guard('submit')}
              disabled={busy || alreadySent}
              className="bg-navy-600 hover:bg-navy-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs px-6 py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              {tacticApproved ? 'Save changes' : tStatus === 'rejected' ? 'Save & resubmit for approval' : 'Save & submit for approval'}
            </button>
          </div>
        </div>
      </div>
      {confirm && (
        <ConfirmDialog
          title="Submit changes to an approved tactic?"
          message="This tactic is already approved. If you submit these changes it goes back to the marketer and shows as pending approval until they approve it again."
          confirmLabel="Yes, submit changes"
          busy={busy}
          onConfirm={() => run(confirm, true)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
};
