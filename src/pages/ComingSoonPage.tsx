import React from 'react';
import { Tags, Clock } from 'lucide-react';

/** Placeholder for a section that isn't switched on yet. */
export const ComingSoonPage: React.FC<{ title: string; blurb?: string }> = ({ title, blurb }) => (
  <div className="space-y-6">
    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
      <Tags className="w-5 h-5 text-navy-600" />
      {title}
    </h1>
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-14 text-center max-w-xl">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-navy-50 border border-navy-100 text-navy-600 flex items-center justify-center">
        <Clock className="w-5 h-5" />
      </div>
      <h2 className="text-base font-extrabold text-slate-900 mt-4">Coming soon</h2>
      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
        {blurb || `${title} isn't available yet. It will appear here once it is ready.`}
      </p>
    </div>
  </div>
);
