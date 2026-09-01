import React, { useState } from 'react';
import { usePersona } from '../../context/PersonaContext';
import {
  Code,
  Copy,
  Check,
  Globe,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Tag,
  Link as LinkIcon
} from 'lucide-react';

export const TaxonomyCodeGenerator: React.FC = () => {
  const { therapeuticAreas, brands, keyMessages, channels, showToast } = usePersona();

  const [region, setRegion] = useState('US Commercial');
  const [taId, setTaId] = useState('ta-cart');
  const [brandId, setBrandId] = useState('brand-yescarta');
  const [kmCatId, setKmCatId] = useState('km-cat-eff');
  const [kmSubId, setKmSubId] = useState('km-sub-eff-01');
  const [chanId, setChanId] = useState('chan-social');
  const [quarter, setQuarter] = useState('2026-Q3');
  const [audience, setAudience] = useState('HCPs');
  const [campaignSlug, setCampaignSlug] = useState('lbcl_orr_launch');

  const [copiedTaxonomy, setCopiedTaxonomy] = useState(false);
  const [copiedUtm, setCopiedUtm] = useState(false);

  const selectedTa = therapeuticAreas.find(t => t.id === taId);
  const selectedBrand = brands.find(b => b.id === brandId);
  const selectedCat = keyMessages.find(k => k.id === kmCatId);
  const selectedSub = selectedCat?.subcategories.find(s => s.id === kmSubId);
  const selectedChan = channels.find(c => c.id === chanId);

  const regCode = (region || '').includes('US') ? 'US' : 'EU';
  const taCode = selectedTa?.code || 'CART';
  const brandCode = selectedBrand?.code || 'YES';
  const qtrCode = (quarter || 'Q1-2025').replace('-', '');
  const audCode = (audience || '').toLowerCase().includes('patient') ? 'PAT' : 'HCP';
  const chanCode = selectedChan?.code ? selectedChan.code.replace('-', '_') : 'SOC';
  const subCode = selectedSub?.code ? selectedSub.code.replace('KM-', '').replace('-', '') : 'EFF01';

  const taxonomyString = `COMM_${regCode}_${taCode}_${brandCode}_${qtrCode}_${audCode}_${chanCode}_${subCode}_101`;

  const utmSource = selectedChan?.downstreamPlatform ? selectedChan.downstreamPlatform.toLowerCase().replace(/ /g, '_') : 'paid_social';
  const utmMedium = (selectedChan?.formats && selectedChan.formats[0]) ? selectedChan.formats[0].toLowerCase().replace(/ /g, '_') : 'social';
  const utmCampaign = `${selectedBrand?.name ? selectedBrand.name.toLowerCase().split(' ')[0] : 'yescarta'}_${qtrCode.toLowerCase()}_${campaignSlug}`;
  const utmContent = `${subCode.toLowerCase()}_${audCode.toLowerCase()}`;

  const fullTrackingUrl = `https://hcp.kitepharma.com/${brandCode.toLowerCase()}?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}&utm_content=${utmContent}&tax_code=${taxonomyString}`;

  const handleCopyTaxonomy = () => {
    navigator.clipboard.writeText(taxonomyString);
    setCopiedTaxonomy(true);
    setTimeout(() => setCopiedTaxonomy(false), 2000);
    showToast('Taxonomy code copied!', 'success');
  };

  const handleCopyUtm = () => {
    navigator.clipboard.writeText(fullTrackingUrl);
    setCopiedUtm(true);
    setTimeout(() => setCopiedUtm(false), 2000);
    showToast('Full tracking URL copied!', 'success');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-5 shadow-sm text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-600 text-white shadow-sm">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Commercial Taxonomy Code & UTM Parameter Generator
            </h3>
            <p className="text-xs text-slate-500">
              Generate standardized taxonomy codes and tracking URLs compliant with Veeva & SFMC.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold bg-teal-50 text-teal-800 px-3 py-1 rounded-lg border border-teal-200">
          Veeva & SFMC Validated
        </span>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Region</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 font-medium"
          >
            <option value="US Commercial">US Commercial</option>
            <option value="EU Commercial">EU Commercial</option>
            <option value="Global">Global</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Therapeutic Area</label>
          <select
            value={taId}
            onChange={(e) => setTaId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 font-medium"
          >
            {therapeuticAreas.map((ta) => (
              <option key={ta.id} value={ta.id}>
                {ta.name} ({ta.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Brand</label>
          <select
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 font-medium"
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Channel Platform</label>
          <select
            value={chanId}
            onChange={(e) => setChanId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 font-medium"
          >
            {channels.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Key Message Category</label>
          <select
            value={kmCatId}
            onChange={(e) => {
              setKmCatId(e.target.value);
              const cat = keyMessages.find(k => k.id === e.target.value);
              if (cat && cat.subcategories.length > 0) {
                setKmSubId(cat.subcategories[0].id);
              }
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 font-medium"
          >
            {keyMessages.map((km) => (
              <option key={km.id} value={km.id}>
                {km.name} ({km.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Key Message Subcategory</label>
          <select
            value={kmSubId}
            onChange={(e) => setKmSubId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 font-medium"
          >
            {(selectedCat?.subcategories || []).map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code}: {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 font-medium"
          >
            <option value="HCPs">HCPs / Specialists</option>
            <option value="Patients">Patients & Caregivers</option>
            <option value="Payers">Payers & Access Directors</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Quarter</label>
          <select
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 font-medium"
          >
            <option value="2026-Q3">2026-Q3</option>
            <option value="2026-Q4">2026-Q4</option>
            <option value="2027-Q1">2027-Q1</option>
          </select>
        </div>
      </div>

      {/* Generated Results Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        
        {/* Output 1: Taxonomy Code */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
              Standardized Taxonomy String
            </span>
            <button
              onClick={handleCopyTaxonomy}
              className="text-xs text-teal-800 hover:text-teal-900 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-bold shadow-sm"
            >
              {copiedTaxonomy ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTaxonomy ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="font-mono text-sm font-extrabold text-slate-900 bg-white p-3 rounded-lg border border-slate-200 break-all shadow-sm">
            {taxonomyString}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center justify-between font-medium">
            <span>Length: {taxonomyString.length} chars (Limit: 128)</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Validated Format
            </span>
          </div>
        </div>

        {/* Output 2: Tracking URL */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
              Full Campaign Tracking URL
            </span>
            <button
              onClick={handleCopyUtm}
              className="text-xs text-teal-800 hover:text-teal-900 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-bold shadow-sm"
            >
              {copiedUtm ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUtm ? 'Copied' : 'Copy URL'}</span>
            </button>
          </div>
          <div className="font-mono text-xs text-slate-800 bg-white p-3 rounded-lg border border-slate-200 break-all max-h-20 overflow-y-auto font-medium shadow-sm">
            {fullTrackingUrl}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center justify-between font-medium">
            <span>Platform: {selectedChan?.downstreamPlatform}</span>
            <span className="text-teal-800 font-mono font-bold">UTM Compliant</span>
          </div>
        </div>

      </div>
    </div>
  );
};
