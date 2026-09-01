import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';

export interface TaxonomyTooltipProps {
  fieldName: string;
  taxonomyCode?: string;
  description: string;
  purpose?: string;
  size?: 'sm' | 'md';
  inline?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'bottom-left' | 'bottom-right';
}

export const TaxonomyTooltip: React.FC<TaxonomyTooltipProps> = ({
  fieldName,
  taxonomyCode,
  description,
  purpose,
  size = 'sm',
  inline = true,
  position = 'top'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  const positionClasses = {
    'top': 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    'bottom': 'top-full mt-2 left-1/2 -translate-x-1/2',
    'left': 'right-full mr-2 top-1/2 -translate-y-1/2',
    'right': 'left-full ml-2 top-1/2 -translate-y-1/2',
    'bottom-right': 'top-full mt-2 left-0',
    'bottom-left': 'top-full mt-2 right-0'
  }[position];

  const arrowClasses = {
    'top': 'top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900',
    'bottom': 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-slate-900',
    'left': 'left-full top-1/2 -translate-y-1/2 -ml-1 border-4 border-transparent border-l-slate-900',
    'right': 'right-full top-1/2 -translate-y-1/2 -mr-1 border-4 border-transparent border-r-slate-900',
    'bottom-right': 'bottom-full left-4 -mb-1 border-4 border-transparent border-b-slate-900',
    'bottom-left': 'bottom-full right-4 -mb-1 border-4 border-transparent border-b-slate-900'
  }[position];

  return (
    <span className={`relative ${inline ? 'inline-flex items-center ml-1' : 'block'}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-slate-400 hover:text-rose-600 transition-colors focus:outline-none p-0.5 rounded-full hover:bg-rose-50"
        title={`Taxonomy info for ${fieldName}`}
        aria-label={`Taxonomy info for ${fieldName}`}
      >
        <HelpCircle className={iconSize} />
      </button>

      {isOpen && (
        <div
          className={`absolute z-[9999] ${positionClasses} w-64 p-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs space-y-1.5 pointer-events-auto transition-all animate-fade-in`}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-rose-300 flex items-center gap-1.5 text-[11px]">
              <Info className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              {fieldName} Taxonomy
            </span>
            {taxonomyCode && (
              <span className="font-mono text-[10px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded border border-rose-800 font-bold">
                {taxonomyCode}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-slate-300 leading-snug text-[11px] font-normal">
            {description}
          </p>

          {/* Purpose */}
          {purpose && (
            <div className="pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
              <strong className="text-slate-200">Used For:</strong> {purpose}
            </div>
          )}

          {/* Arrow */}
          <div className={`absolute ${arrowClasses}`}></div>
        </div>
      )}
    </span>
  );
};

// Dictionary of standard tooltip definitions for quick lookup
export const TAXONOMY_TOOLTIPS: Record<string, { fieldName: string; taxonomyCode?: string; description: string; purpose?: string }> = {
  therapeuticArea: {
    fieldName: 'Therapeutic Area',
    taxonomyCode: 'TA',
    description: 'The top-level medical domain classification (e.g. Cell Therapy / CAR-T, Hematologic Malignancies, Oncology).',
    purpose: 'Categorizes budgets, clinical trial data, and brand portfolios across the Kite cell-therapy operation.'
  },
  brand: {
    fieldName: 'Brand Code',
    taxonomyCode: 'BRD',
    description: '3-letter unique product code (e.g. YES for Yescarta®, TEC for Tecartus®).',
    purpose: 'Forms the primary anchor for all campaign taxonomy strings and asset tagging.'
  },
  topic: {
    fieldName: 'Topic (Key Message Category)',
    taxonomyCode: 'TOPIC',
    description: 'High-level commercial message category (e.g. Efficacy & Clinical Outcomes, Safety, Dosing).',
    purpose: 'Drives Share of Voice (SOV) tracking, content strategy alignment, and competitive message benchmarking.'
  },
  subtopic: {
    fieldName: 'Subtopic (Key Message Subcategory)',
    taxonomyCode: 'SUBTOPIC',
    description: 'Specific claim code (e.g. KM-EFF-01 Overall Survival Superiority vs Standard Chemo).',
    purpose: 'Required for medical legal review (MLR) validation, Veeva CRM detailer slide tracking, and SFMC email triggers.'
  },
  channel: {
    fieldName: 'Channel Taxonomy',
    taxonomyCode: 'CHN',
    description: 'Omnichannel distribution vector (e.g. E-mail, Veeva CRM, Paid Social, HCP Portal).',
    purpose: 'Maps content to distribution engines and configures UTM source parameters automatically.'
  },
  region: {
    fieldName: 'Region / Market Scope',
    taxonomyCode: 'MKT',
    description: 'Geographic commercial territory (US Commercial, EU Commercial, JPAC, LATAM, Global).',
    purpose: 'Controls regulatory compliance rules (FDA vs EMA vs PMDA) and regional Veeva Vault environments.'
  },
  targetAudience: {
    fieldName: 'Target Audience',
    taxonomyCode: 'AUD',
    description: 'Primary recipient persona classification (e.g. Oncologists, Infectiologists, Patients, Caregivers).',
    purpose: 'Determines message tone, MLR review requirements, and SFMC subscriber segment filters.'
  },
  quarter: {
    fieldName: 'Quarter / Timeframe',
    taxonomyCode: 'QTR',
    description: 'Commercial fiscal quarter (Q1, Q2, Q3, Q4) and year indicator.',
    purpose: 'Aligns campaign launches with brand budget cycles and quarterly performance reporting.'
  },
  sequence: {
    fieldName: 'Sequence Code',
    taxonomyCode: 'SEQ',
    description: 'Incremental 3-digit campaign execution index (e.g. 001, 002).',
    purpose: 'Guarantees unique campaign string generation and prevents duplicate tracking collisions.'
  },
  utmSource: {
    fieldName: 'UTM Source',
    taxonomyCode: 'UTM_SRC',
    description: 'Downstream analytics platform identifier (e.g. veeva_crm, sfmc_email, linkedin_ads).',
    purpose: 'Feeds Google Analytics 4 and Adobe Analytics attribution models for omnichannel ROI measurement.'
  },
  utmMedium: {
    fieldName: 'UTM Medium',
    taxonomyCode: 'UTM_MED',
    description: 'Marketing medium classification (e.g. email, crm_detailer, display_ad, paid_social).',
    purpose: 'Categorizes engagement touchpoints across digital and field force channels.'
  },
  utmCampaign: {
    fieldName: 'UTM Campaign',
    taxonomyCode: 'UTM_CMP',
    description: 'Normalized campaign slug generated from brand, quarter, and campaign name.',
    purpose: 'Binds web traffic sessions back to master Gilead campaign records.'
  },
  complianceScore: {
    fieldName: 'Compliance Score',
    taxonomyCode: 'COMP',
    description: 'Automated 0-100% score checking code syntax, brand alignment, and mandatory fields.',
    purpose: 'Prevents non-compliant campaign codes from reaching SFMC or Veeva production environments.'
  },
  agencyOwner: {
    fieldName: 'Agency Owner',
    taxonomyCode: 'AGY',
    description: 'External creative/media agency responsible for campaign submission (e.g. Klick Health, Real Chemistry, CMI Media Group).',
    purpose: 'Tracks agency taxonomy accuracy and enforces approval workflows before marketing sign-off.'
  },
  tactic: {
    fieldName: 'Tactical Asset',
    taxonomyCode: 'TACTIC',
    description: 'Individual execution asset under a campaign (e.g. 300x250 Banner Ad, Veeva CRM Slide Deck, Email Nurture).',
    purpose: 'Establishes granular tracking for creative variations and media channel performance.'
  }
};
