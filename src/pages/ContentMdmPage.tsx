import React from 'react';
import { Database, Hammer } from 'lucide-react';

/** Placeholder while Content MDM is being built. */
export const ContentMdmPage: React.FC = () => (
  <div className="space-y-6">
    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
      <Database className="w-5 h-5 text-navy-600" />
      Content MDM
    </h1>
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-14 text-center max-w-xl">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-navy-50 border border-navy-100 text-navy-600 flex items-center justify-center">
        <Hammer className="w-5 h-5" />
      </div>
      <h2 className="text-base font-extrabold text-slate-900 mt-4">Development in progress</h2>
      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
        Content MDM &mdash; the governed business information and taxonomy that content metadata refers to &mdash; is
        being built and will appear here.
      </p>
    </div>
  </div>
);
