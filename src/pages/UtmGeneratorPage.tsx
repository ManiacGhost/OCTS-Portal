import React from 'react';
import { Link2 } from 'lucide-react';
import { TaxonomyCodeGenerator } from '../components/common/TaxonomyCodeGenerator';

export const UtmGeneratorPage: React.FC = () => (
  <div className="space-y-5">
    <div>
      <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
        <Link2 className="w-5 h-5 text-navy-600" />
        UTM Generator
      </h1>
      <p className="text-sm text-slate-500 mt-0.5 max-w-3xl">
        Link a campaign and its brand tagging strategy to build the taxonomy string and campaign
        tracking URL.
      </p>
    </div>
    <TaxonomyCodeGenerator />
  </div>
);
