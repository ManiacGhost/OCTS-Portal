import React from 'react';
import { LifeBuoy } from 'lucide-react';

const FAQS = [
  {
    q: 'How is a Campaign Name taxonomy string built?',
    a: 'The Campaign Builder applies the approved Kite formula for the channel you pick (Digital, Social, Search, or SFMC). You fill a few controlled fields; the rest auto-fill from your earlier choices, and the string is assembled token-by-token.',
  },
  {
    q: 'What happens after I submit a campaign?',
    a: 'It moves to the marketer’s approval queue with a "Pending" status. The marketer can approve it or reject it back to you with notes.',
  },
  {
    q: 'Who do I contact about taxonomy governance?',
    a: 'Reach the Master Taxonomy Governance team via your Kite commercial operations contact. A ticketing workflow will be available here soon.',
  },
];

export const HelpPage: React.FC = () => (
  <div className="space-y-4">
    <div>
      <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Help &amp; Support</h1>
      <p className="text-sm text-slate-500 mt-0.5">Answers to common questions about Omnia.</p>
    </div>

    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-2xl">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-11 h-11 rounded-xl bg-navy-50 text-navy-600 border border-navy-100 flex items-center justify-center">
          <LifeBuoy className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm font-extrabold text-slate-900">Support Center</div>
          <div className="text-xs text-slate-500">
            Full ticketing &amp; knowledge base &mdash; <span className="font-semibold">coming soon</span>.
          </div>
        </div>
      </div>

      <dl className="divide-y divide-slate-100">
        {FAQS.map(({ q, a }) => (
          <div key={q} className="py-4">
            <dt className="text-sm font-bold text-slate-900">{q}</dt>
            <dd className="text-xs text-slate-600 leading-relaxed mt-1">{a}</dd>
          </div>
        ))}
      </dl>
    </div>
  </div>
);
