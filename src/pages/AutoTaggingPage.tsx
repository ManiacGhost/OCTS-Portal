import React from 'react';
import { Sparkles, Bell } from 'lucide-react';

export const AutoTaggingPage: React.FC = () => (
  <div className="space-y-4">
    <div>
      <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Auto Tagging</h1>
      <p className="text-sm text-slate-500 mt-0.5">
        ML-assisted taxonomy tagging for campaign content.
      </p>
    </div>

    <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm max-w-xl mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto">
        <Sparkles className="w-7 h-7" />
      </div>
      <h2 className="text-lg font-extrabold text-slate-900 mt-4">Coming soon</h2>
      <p className="text-sm text-slate-500 leading-relaxed mt-2">
        ML-powered taxonomy tagging for campaign codes. Paste creative copy or an asset name and
        review, approve, or modify the AI-generated Topic &amp; Subtopic assignments before they
        flow into the taxonomy string.
      </p>
      <button
        disabled
        className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 cursor-not-allowed"
      >
        <Bell className="w-4 h-4" />
        Notify me when it&rsquo;s ready
      </button>
    </div>
  </div>
);
