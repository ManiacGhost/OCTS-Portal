import React from 'react';
import { usePersona } from '../../context/PersonaContext';
import { TaxonomyTooltip, TAXONOMY_TOOLTIPS } from './TaxonomyTooltip';
import { Layers, Tag, Info, Check, Sparkles } from 'lucide-react';

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
          <div className="p-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            <Layers className="w-4 h-4 text-rose-600" />
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
        <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-mono font-bold px-2 py-0.5 rounded-md">
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20 font-medium"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20 font-medium"
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

      {/* Topic Selection */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
          <span>1. Master Topic</span>
          <span className="text-slate-400 font-normal text-[11px]">(Required Pillar)</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {keyMessages.map((cat) => {
            const isSelected = cat.id === (selectedCategoryId || activeTopic?.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onCategoryChange(cat.id);
                  if (cat.subcategories.length > 0) {
                    onSubcategoryChange(cat.subcategories[0].id);
                  }
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-rose-50 border-rose-500 text-rose-950 shadow-sm ring-1 ring-rose-500'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold truncate">{cat.name}</span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {cat.code}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-1">
                  {cat.subcategories.length} Subtopics Available
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subtopic List */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
          <span>2. Master Subtopic</span>
          <span className="text-rose-700 font-mono text-[11px] font-bold">
            {activeSubtopics.length} available under {activeTopic?.name}
          </span>
        </label>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {activeSubtopics.map((sub) => {
            const isSubSelected = sub.id === selectedSubcategoryId;
            return (
              <div
                key={sub.id}
                onClick={() => onSubcategoryChange(sub.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  isSubSelected
                    ? 'bg-rose-50/80 border-rose-500 text-slate-900 shadow-sm ring-1 ring-rose-500/40'
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-700 font-mono bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                      {sub.code}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{sub.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    {sub.description}
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 font-medium">Target Audience:</span>
                    {sub.targetAudience.map((aud, i) => (
                      <span key={i} className="text-[10px] bg-slate-200/80 text-slate-700 font-medium px-1.5 py-0.2 rounded">
                        {aud}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 pt-0.5">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSubSelected ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {isSubSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Confirmation Footer */}
      {activeSubtopic && (
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-200">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-rose-400" />
            <span className="font-semibold">Active Topic / Subtopic Mapping:</span>
            <span className="font-mono text-rose-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {activeTopic?.code} / {activeSubtopic.code}
            </span>
          </div>
          <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">
            Validated for Veeva
          </span>
        </div>
      )}
    </div>
  );
};

