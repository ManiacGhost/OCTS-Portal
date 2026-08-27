import React, { useState } from 'react';
import { runAutoTagging } from '../../services/api';
import { AutoTagResult } from '../../types';
import {
  Sparkles,
  Bot,
  FileText,
  CheckCircle2,
  Tag,
  ArrowRight,
  RefreshCw,
  Zap,
  Sliders,
  Copy,
  Check
} from 'lucide-react';
import { usePersona } from '../../context/PersonaContext';

interface AutoTaggingToolProps {
  onApplyToCampaign?: (result: {
    keyMessageCategory: string;
    keyMessageSubcategory: string;
    taxonomyCode: string;
    suggestedTags: string[];
  }) => void;
}

export const AutoTaggingTool: React.FC<AutoTaggingToolProps> = ({ onApplyToCampaign }) => {
  const { therapeuticAreas, showToast } = usePersona();

  const [creativeText, setCreativeText] = useState<string>(
    'Trodelvy demonstrated statistically significant overall survival (OS) superiority and progression-free survival (PFS) in patients with mTNBC. Eligible commercially insured patients can enroll in the $0 Co-Pay Savings Card Program.'
  );
  const [assetName, setAssetName] = useState<string>('Trodelvy_OS_Superiority_Digital_Banner_160x600');
  const [targetAudience, setTargetAudience] = useState<string>('Oncologists');
  const [selectedTaId, setSelectedTaId] = useState<string>('ta-onc');

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [results, setResults] = useState<{
    predictions: AutoTagResult[];
    recommendedTaxonomyCode: string;
  } | null>(null);

  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const handleRunAutoTag = async () => {
    if (!creativeText && !assetName) {
      showToast('Please enter creative copy or asset name to analyze.', 'error');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await runAutoTagging({
        creativeText,
        assetName,
        targetAudience,
        therapeuticAreaId: selectedTaId
      });

      if (res.success) {
        setResults({
          predictions: res.predictions,
          recommendedTaxonomyCode: res.recommendedTaxonomyCode
        });
        showToast(`AutoTagging complete! Matches found with high confidence.`, 'success');
      }
    } catch (err) {
      showToast('AutoTagging analysis failed.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyCode = () => {
    if (results?.recommendedTaxonomyCode) {
      navigator.clipboard.writeText(results.recommendedTaxonomyCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      showToast('Taxonomy code copied to clipboard!', 'success');
    }
  };

  const sampleCopies = [
    {
      title: 'Trodelvy OS Clinical Trial Copy',
      text: 'Trodelvy demonstrated statistically significant overall survival (OS) superiority and progression-free survival (PFS) in late stage TNBC. Phase 3 trial data available.'
    },
    {
      title: 'Biktarvy Daily Pill & Viral Load',
      text: 'Achieve and maintain rapid viral suppression with Biktarvy once-daily single-tablet regimen. High barrier to resistance in treatment-naive adults.'
    },
    {
      title: 'Patient Access & Co-Pay Card',
      text: 'Discover $0 Co-Pay Savings Card options for commercially insured patients. Patient Access Support provides full insurance verification & prior authorization form support.'
    }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-6 shadow-sm text-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              AI AutoTagging & Taxonomy Predictor Engine
            </h3>
            <p className="text-xs text-slate-500">
              Analyzes creative copy, ad briefs, or asset metadata against Master Key Message taxonomy.
            </p>
          </div>
        </div>
        <span className="self-start sm:self-center text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-teal-600" /> AutoTag v2.4 Active
        </span>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Creative Copy / Ad Text / Asset Brief
            </label>
            <textarea
              rows={4}
              value={creativeText}
              onChange={(e) => setCreativeText(e.target.value)}
              placeholder="Paste campaign body copy, email subject line, or creative brief here..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 leading-relaxed font-mono font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Asset Name / Creative Filename
              </label>
              <input
                type="text"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Therapeutic Area Context
              </label>
              <select
                value={selectedTaId}
                onChange={(e) => setSelectedTaId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 font-medium"
              >
                {therapeuticAreas.map((ta) => (
                  <option key={ta.id} value={ta.id}>
                    {ta.name} ({ta.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-500">
              <span className="font-bold text-slate-700">Quick Samples:</span>
              {sampleCopies.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCreativeText(s.text)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-lg transition text-[10px] whitespace-nowrap font-bold"
                >
                  Sample #{idx + 1}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleRunAutoTag}
              disabled={isAnalyzing}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-teal-200" />
                  <span>Analyzing Copy...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AutoTag Engine</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Instructions / How AutoTagging Works */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-3 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-2">
              <Sliders className="w-4 h-4 text-teal-600" />
              How AI AutoTagging Works
            </h4>
            <ul className="space-y-2 text-slate-600 leading-relaxed font-medium">
              <li className="flex items-start gap-1.5">
                <span className="text-teal-600 font-bold">•</span>
                <span>Matches copy keywords against Master Key Message definitions.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-teal-600 font-bold">•</span>
                <span>Generates confidence score % & identifies secondary subcategories.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-teal-600 font-bold">•</span>
                <span>Produces standardized taxonomy string compatible with Veeva & SFMC.</span>
              </li>
            </ul>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 text-[11px] text-teal-900 font-medium">
            <strong>Agency Benefit:</strong> Automatically completes Key Message taxonomy coding in &lt;2 seconds, eliminating manual data entry mistakes.
          </div>
        </div>
      </div>

      {/* AutoTag Results Panel */}
      {results && (
        <div className="bg-slate-50 border border-teal-200 rounded-2xl p-5 space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <span className="text-[10px] text-teal-800 font-mono font-bold uppercase tracking-wider">
                AutoTag Prediction Output
              </span>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Key Message Matches ({results.predictions.length} detected)
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-white px-3 py-1 rounded-xl border border-slate-200 text-xs font-mono text-teal-800 flex items-center gap-2 font-bold shadow-sm">
                <span>Code:</span>
                <span className="font-extrabold text-slate-900">{results.recommendedTaxonomyCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition"
                  title="Copy Code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Matches List */}
          <div className="space-y-3">
            {results.predictions.map((pred, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {pred.keyMessageCode}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{pred.subcategory}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {Math.round(pred.confidence * 100)}% Match
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  <strong>Reasoning:</strong> {pred.reasoning}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                  <div className="flex items-center gap-1 text-slate-600">
                    <span className="font-bold text-slate-700">Matched Words:</span>
                    {pred.matchedKeywords.map((kw, i) => (
                      <span key={i} className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold">
                        "{kw}"
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 text-slate-600">
                    <span className="font-bold text-slate-700">Auto-Tags:</span>
                    {pred.suggestedTags.map((tag, i) => (
                      <span key={i} className="bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {onApplyToCampaign && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() =>
                  onApplyToCampaign({
                    keyMessageCategory: results.predictions[0].category,
                    keyMessageSubcategory: results.predictions[0].subcategory,
                    taxonomyCode: results.recommendedTaxonomyCode,
                    suggestedTags: results.predictions[0].suggestedTags
                  })
                }
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-sm"
              >
                <span>Apply AutoTag Results to Campaign Builder</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
