import React from 'react';
import { usePersona } from '../../context/PersonaContext';
import { TaxonomyTooltip, TAXONOMY_TOOLTIPS } from './TaxonomyTooltip';
import { Layers, Tag } from 'lucide-react';

interface KeyMessageSelectorProps {
  selectedCategoryId: string;
  selectedSubcategoryId: string;
  onCategoryChange: (catId: string) => void;
  onSubcategoryChange: (subId: string) => void;
  selectedTaId?: string;
  selectedBrandId?: string;
  onTaChange?: (taId: string) => void;
  onBrandChange?: (brandId: string) => void;
  compact?: boolean;
}

export const KeyMessageSelector: React.FC<KeyMessageSelectorProps> = ({
  selectedCategoryId,
  selectedSubcategoryId,
  onCategoryChange,
  onSubcategoryChange,
  selectedTaId,
  selectedBrandId,
  onTaChange,
  onBrandChange,
  compact = false
}) => {
  const { therapeuticAreas, brands, keyMessages } = usePersona();

  const activeTopic = keyMessages.find(k => k.id === selectedCategoryId) || keyMessages[0];
  const activeSubtopics = activeTopic?.subcategories || [];
  const activeSubtopic = activeSubtopics.find(s => s.id === selectedSubcategoryId);

  const filteredBrands = selectedTaId
    ? brands.filter(b => b.therapeuticAreaId === selectedTaId)
    : brands;

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl ${compact ? 'p-4' : 'p-5'} space-y-4 shadow-sm text-slate-900`}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-navy-50 text-navy-700 border border-navy-200">
            <Layers className="w-4 h-4 text-navy-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Master Topic & Subtopic Selection
              <TaxonomyTooltip {...TAXONOMY_TOOLTIPS.topic} />
            </h4>
            <p className="text-xs text-slate-500">
              Master Commercial Source of Truth • Mandated Topic & Subtopic Taxonomy Codes
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-navy-50 text-navy-700 border border-navy-200 font-mono font-bold px-2 py-0.5 rounded-md">
          Topic Engine
        </span>
      </div>

      {/* TA & Brand Selector if callbacks provided */}
      {onTaChange && onBrandChange && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 border-b border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Therapeutic Area
            </label>
            <select
              value={selectedTaId || ''}
              onChange={(e) => onTaChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-navy-500 focus:bg-white focus:ring-2 focus:ring-navy-500/20 font-medium"
            >
              <option value="">-- Select Therapeutic Area --</option>
              {therapeuticAreas.map((ta) => (
                <option key={ta.id} value={ta.id}>
                  {ta.name} ({ta.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Brand Portfolio
            </label>
            <select
              value={selectedBrandId || ''}
              onChange={(e) => onBrandChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-navy-500 focus:bg-white focus:ring-2 focus:ring-navy-500/20 font-medium"
            >
              <option value="">-- Select Brand --</option>
              {filteredBrands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Topic & Subtopic dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>1. Master Topic</span>
            <span className="text-slate-400 font-normal text-[11px]">(Required Pillar)</span>
          </label>
          <select
            value={selectedCategoryId || activeTopic?.id || ''}
            onChange={(e) => {
              const cat = keyMessages.find(k => k.id === e.target.value);
              onCategoryChange(e.target.value);
              if (cat && cat.subcategories.length > 0) {
                onSubcategoryChange(cat.subcategories[0].id);
              }
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-navy-500 focus:bg-white focus:ring-2 focus:ring-navy-500/20 font-medium"
          >
            {keyMessages.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.code}) — {cat.subcategories.length} subtopics
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>2. Master Subtopic</span>
            <span className="text-navy-700 font-mono text-[11px] font-bold">
              {activeSubtopics.length} available
            </span>
          </label>
          <select
            value={selectedSubcategoryId || ''}
            onChange={(e) => onSubcategoryChange(e.target.value)}
            disabled={activeSubtopics.length === 0}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-navy-500 focus:bg-white focus:ring-2 focus:ring-navy-500/20 font-medium disabled:opacity-50"
          >
            <option value="">-- Select Subtopic --</option>
            {activeSubtopics.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} ({sub.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected subtopic detail */}
      {activeSubtopic && (
        <div className="p-3 rounded-xl border border-navy-200 bg-navy-50/60 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-navy-700 font-mono bg-navy-100 px-2 py-0.5 rounded border border-navy-200">
              {activeSubtopic.code}
            </span>
            <span className="text-xs font-bold text-slate-900">{activeSubtopic.name}</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-normal">
            {activeSubtopic.description}
          </p>
          <div className="flex items-center flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] text-slate-500 font-medium">Target Audience:</span>
            {activeSubtopic.targetAudience.map((aud, i) => (
              <span key={i} className="text-[10px] bg-slate-200/80 text-slate-700 font-medium px-1.5 py-0.5 rounded">
                {aud}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Selected Confirmation Footer */}
      {activeSubtopic && (
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-200">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-navy-400" />
            <span className="font-semibold">Active Topic / Subtopic Mapping:</span>
            <span className="font-mono text-navy-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {activeTopic?.code} / {activeSubtopic.code}
            </span>
          </div>
          <span className="text-[10px] text-navy-400 font-bold uppercase tracking-wider">
            Validated for Veeva
          </span>
        </div>
      )}
    </div>
  );
};

