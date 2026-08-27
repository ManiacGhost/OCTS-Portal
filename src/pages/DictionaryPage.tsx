import React from 'react';
import { TaxonomyDictionaryView } from '../components/common/TaxonomyDictionaryView';

export const DictionaryPage: React.FC = () => (
  <div className="space-y-4">
    <div>
      <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Master Taxonomy Dictionary</h1>
      <p className="text-sm text-slate-500 mt-0.5">
        Single source of truth for Topics &amp; Subtopics, Therapeutic Areas, Brands, and Channels.
      </p>
    </div>
    <TaxonomyDictionaryView />
  </div>
);
