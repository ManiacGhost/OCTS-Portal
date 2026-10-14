import React, { useEffect, useState } from 'react';
import { LifeBuoy, BookOpen, HelpCircle, Mail, X, ChevronDown, Send, Copy, ArrowRight } from 'lucide-react';
import { usePersona } from '../context/PersonaContext';
import { useAuth } from '../auth/AuthContext';

/** Where the "Reach out to us" email goes. Left blank on purpose — set the real support
 *  address here once the client confirms it; until then the sender types it in the To field. */
const SUPPORT_EMAIL = '';

// ---------------------------------------------------------------------------
// Documentation content (shown in the "How to use & Docs" window)
// ---------------------------------------------------------------------------

type Block =
  | { kind: 'p'; text: string }
  | { kind: 'steps'; items: string[] }
  | { kind: 'list'; items: string[] }
  | { kind: 'terms'; items: { term: string; def: string }[] };

interface DocSection {
  id: string;
  title: string;
  blocks: Block[];
}

const DOCS: DocSection[] = [
  {
    id: 'overview',
    title: 'What is Tagging360?',
    blocks: [
      {
        kind: 'p',
        text: 'Tagging360 is the single place to define how every piece of Kite promotional content is tagged, named and tracked. It keeps agencies, marketers and analytics teams working from the same taxonomy so reporting lines up across channels.',
      },
      {
        kind: 'list',
        items: [
          'Tagging Strategy — decide which dimensions each brand tags on each channel, and see which business questions that answers.',
          'Campaigns — build a campaign’s taxonomy string from the approved formula, starting from its Asset and Tactic.',
          'UTM Generator — turn a campaign and a tagging strategy into a taxonomy string and a tracking URL.',
          'Dictionary — browse every approved value and abbreviation.',
          'Auto Tagging — review the AI’s suggested tags for IVA slides and give feedback.',
        ],
      },
      {
        kind: 'p',
        text: 'Which screens you see depends on your role (agency, marketer, analytics or administrator). The left-hand menu always shows the ones available to you.',
      },
    ],
  },
  {
    id: 'start',
    title: 'Getting started',
    blocks: [
      {
        kind: 'steps',
        items: [
          'Sign in with your account, or use one of the demo roles on the sign-in page.',
          'From the home screen, open Tagging Strategy and pick a brand, a channel and (if the channel has them) a sub-channel.',
          'Tick the dimensions that brand tags and give each a default value.',
          'Create a campaign from Campaigns → Create campaign.',
          'Open the UTM Generator, link the campaign, and copy the taxonomy string or tracking URL.',
        ],
      },
      {
        kind: 'p',
        text: 'Your work is saved in this browser, so it is still there when you come back on the same device. It is not yet shared between people.',
      },
    ],
  },
  {
    id: 'strategy',
    title: 'Tagging Strategy',
    blocks: [
      {
        kind: 'p',
        text: 'This screen answers: for this brand, on this channel, what do we tag — and what can analytics learn from it?',
      },
      {
        kind: 'steps',
        items: [
          'Choose Brand, Channel and Sub-channel from the dropdowns at the top. The list of dimensions is the set the data sources for that channel actually carry.',
          'Tick the dimensions this brand tags. Use the checkbox in the header to tick or clear them all.',
          'Type a Default value for any dimension that usually takes the same value. Dimension names and what they capture are fixed.',
          'Watch the counters on the Business questions & KPIs card — Covered, Partial and Not tagged — as you tick.',
        ],
      },
      {
        kind: 'p',
        text: 'Business questions come in two groups. Cross-channel questions are the same on every channel. Channel-specific questions only appear for the channel they belong to. Pick one from either dropdown to see its status, the KPIs it feeds and the dimensions it needs (green = already ticked).',
      },
      {
        kind: 'p',
        text: 'A small target badge next to a dimension’s name shows how many business questions it feeds.',
      },
    ],
  },
  {
    id: 'campaigns',
    title: 'Creating a campaign',
    blocks: [
      {
        kind: 'p',
        text: 'Open Campaigns and choose Create campaign. The builder has five steps; you can jump between them at the top.',
      },
      {
        kind: 'steps',
        items: [
          'Asset & Tactic — the Asset ID of the promotional asset and the Tactic ID it runs under. Both are required, and every later step is anchored to them.',
          'Campaign Context — the campaign name, market and target quarter.',
          'Topic & Subtopic — therapeutic area, brand, and the topic and subtopic the campaign is about.',
          'Channel & Formula — the promotional channel (and sub-channel). Fill the highlighted fields; the rest fill automatically and the taxonomy string builds live from the approved formula for that channel.',
          'Review & Submit — check the summary and submit. The campaign goes to the marketer for approval.',
        ],
      },
      {
        kind: 'p',
        text: 'After submitting, you’ll find the campaign on the Campaigns overview, grouped by channel. Click any campaign for its full detail.',
      },
    ],
  },
  {
    id: 'formula',
    title: 'Reading a taxonomy string',
    blocks: [
      {
        kind: 'p',
        text: 'A taxonomy string is made of tokens joined by underscores, in the order the approved formula for the channel defines. For example us_display_yes_branded_cart_hcp_lbcl_2026_ab12 reads: US, Display, Yescarta, branded messaging, CAR-T, HCP, LBCL, 2026, and a machine code.',
      },
      {
        kind: 'terms',
        items: [
          { term: '(c) controlled', def: 'Chosen from a fixed list.' },
          { term: '(v) variable', def: 'Varies by campaign.' },
          { term: '(m) machine', def: 'Generated for you.' },
          { term: '(f) free text', def: 'Typed in.' },
        ],
      },
      {
        kind: 'p',
        text: 'Digital campaigns include a messaging type. Social, Search and Email campaigns include a platform instead.',
      },
    ],
  },
  {
    id: 'utm',
    title: 'UTM Generator',
    blocks: [
      {
        kind: 'steps',
        items: [
          'Optionally choose a campaign from the Campaign dropdown. Its brand, indication, audience, market, launch date and slug fill in and lock.',
          'With no campaign chosen, fill those details yourself.',
          'Choose the channel (and sub-channel). The dimensions you ticked in Tagging Strategy appear as fields; any the campaign already answers are filled and marked “from campaign”.',
          'Copy the taxonomy string, or the campaign tracking URL, using the buttons beside each.',
        ],
      },
      {
        kind: 'p',
        text: 'If you see “No tagging strategy set”, go to Tagging Strategy and tick the dimensions for that brand and channel first.',
      },
    ],
  },
  {
    id: 'dictionary',
    title: 'Dictionary',
    blocks: [
      {
        kind: 'steps',
        items: [
          'Pick a field from the dropdown — it lists every controlled-vocabulary field from the Kite / Evoke taxonomy sheet, with the number of values.',
          'Browse the approved values in the left column and their abbreviations in the right.',
          'Use Filter to search the values and abbreviations of the field you’re in.',
        ],
      },
    ],
  },
  {
    id: 'autotag',
    title: 'Auto Tagging',
    blocks: [
      {
        kind: 'p',
        text: 'Auto Tagging covers IVA (rep slide decks). Each row is a deck; the collapsed row shows its key message, status, quarter and how many slides you have reviewed.',
      },
      {
        kind: 'steps',
        items: [
          'Expand a deck to see every slide with the AI’s suggested brand, indication, topic and subtopic, and a confidence bar.',
          'Use the thumbs up / down on a slide to say whether the suggestion is right, and add a comment if you like.',
        ],
      },
    ],
  },
  {
    id: 'roles',
    title: 'Approvals, compliance & administration',
    blocks: [
      {
        kind: 'list',
        items: [
          'Marketers — Approvals lists agency submissions. Approve a campaign, or reject it back to the agency with notes.',
          'Analytics — Compliance shows taxonomy compliance by platform and agency, flagged discrepancies you can mark resolved, and CSV exports of campaigns and the topic dictionary.',
          'Administrators — Administration onboards agencies, manages marketer and analytics users, edits the master topic and subtopic list, and shows the audit trail of every action.',
        ],
      },
    ],
  },
  {
    id: 'glossary',
    title: 'Glossary',
    blocks: [
      {
        kind: 'terms',
        items: [
          { term: 'Taxonomy string', def: 'The underscore-joined campaign name built from the approved formula.' },
          { term: 'Dimension', def: 'A tagged field such as Campaign ID, Topic or Audience.' },
          { term: 'KBQ', def: 'Key Business Question — something analytics needs to be able to answer, e.g. which topics drive engagement.' },
          { term: 'KPI', def: 'Key Performance Indicator — the measure a KBQ is answered with.' },
          { term: 'Cross-channel / channel-specific', def: 'Whether a business question applies the same way to every channel, or only to one.' },
          { term: 'Asset ID', def: 'The identifier of the promotional asset a campaign is built around.' },
          { term: 'Tactic ID', def: 'The identifier of the tactic the asset is promoted under.' },
          { term: 'Topic / Subtopic', def: 'The master key-message taxonomy every asset is classified against.' },
          { term: 'IVA', def: 'Interactive visual aid — the slide decks reps present in the field.' },
          { term: 'Sub-channel', def: 'A more specific route within a channel, e.g. 3P Email within Digital.' },
        ],
      },
    ],
  },
  {
    id: 'trouble',
    title: 'Troubleshooting',
    blocks: [
      {
        kind: 'list',
        items: [
          'A field is greyed out in the UTM Generator — a campaign is linked. Clear the Campaign dropdown to edit it.',
          'No dimensions appear in the UTM Generator — nothing is ticked for that brand and channel yet. Tick some in Tagging Strategy.',
          'I can’t continue past step 1 of the campaign builder — both the Asset ID and the Tactic ID are required.',
          'My campaign is missing after a long time away — work is stored in this browser; clearing site data or using a different browser or device will not show it.',
        ],
      },
      { kind: 'p', text: 'Still stuck? Use “Reach out to us” on this page.' },
    ],
  },
];

const FAQS = [
  {
    q: 'How is a Campaign Name taxonomy string built?',
    a: 'The Campaign Builder applies the approved Kite formula for the channel you pick (Digital, Social, Search, Email or IVA). You fill a few controlled fields; the rest auto-fill from your earlier choices, and the string is assembled token-by-token.',
  },
  {
    q: 'What happens after I submit a campaign?',
    a: 'It moves to the marketer’s approval queue with a "Pending" status. The marketer can approve it or reject it back to you with notes.',
  },
  {
    q: 'Why can’t I edit a dimension’s name in Tagging Strategy?',
    a: 'Dimension names and what they capture come from the Kite C360 taxonomy and are fixed. You choose which ones a brand tags and set a default value for each.',
  },
  {
    q: 'Why are some fields locked in the UTM Generator?',
    a: 'When a campaign is linked, its brand, indication, audience, market, date and slug are taken from that campaign. Clear the campaign selection to enter them manually.',
  },
  {
    q: 'Is my work saved?',
    a: 'Yes, in this browser. Campaigns and strategy choices persist across reloads on the same device; they are not yet shared between people.',
  },
  {
    q: 'Who do I contact about taxonomy governance?',
    a: 'Use “Reach out to us” on this page, or your Kite commercial operations contact.',
  },
];

const inputCls =
  'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-navy-500 font-medium';

// ---------------------------------------------------------------------------

const DocBlock: React.FC<{ block: Block }> = ({ block }) => {
  if (block.kind === 'p') return <p className="text-sm text-slate-700 leading-relaxed">{block.text}</p>;
  if (block.kind === 'steps')
    return (
      <ol className="space-y-2.5">
        {block.items.map((s, i) => (
          <li key={s} className="flex gap-3 text-sm text-slate-700">
            <span className="w-6 h-6 shrink-0 rounded-full bg-navy-600 text-white text-[11px] font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <span className="leading-relaxed pt-0.5">{s}</span>
          </li>
        ))}
      </ol>
    );
  if (block.kind === 'list')
    return (
      <ul className="space-y-2 list-disc list-outside pl-5 text-sm text-slate-700 leading-relaxed">
        {block.items.map(s => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    );
  return (
    <dl className="border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
      {block.items.map(({ term, def }) => (
        <div key={term} className="px-4 py-2.5 sm:flex sm:gap-4">
          <dt className="text-sm font-bold text-navy-700 sm:w-52 shrink-0">{term}</dt>
          <dd className="text-sm text-slate-600 leading-relaxed">{def}</dd>
        </div>
      ))}
    </dl>
  );
};

const DocsWindow: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeId, setActiveId] = useState(DOCS[0].id);
  const idx = DOCS.findIndex(d => d.id === activeId);
  const section = DOCS[idx];
  const next = DOCS[idx + 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-8">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div
        role="dialog"
        aria-label="How to use & Docs"
        className="relative w-full max-w-5xl h-full max-h-[44rem] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-navy-600 text-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <BookOpen className="w-5 h-5 shrink-0" />
            <div className="text-sm font-extrabold truncate">How to use &amp; Documentation</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-white/15 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col sm:flex-row">
          <nav className="sm:w-60 shrink-0 bg-slate-50 border-b sm:border-b-0 sm:border-r border-slate-200 overflow-y-auto p-2 flex sm:block gap-1">
            {DOCS.map(d => (
              <button
                key={d.id}
                type="button"
                onClick={() => setActiveId(d.id)}
                className={`block w-full text-left shrink-0 whitespace-nowrap sm:whitespace-normal px-3 py-2 rounded-lg text-xs font-bold transition ${
                  d.id === activeId ? 'bg-navy-600 text-white' : 'text-slate-600 hover:bg-white'
                }`}
              >
                {d.title}
              </button>
            ))}
          </nav>

          <div className="flex-1 min-w-0 overflow-y-auto p-6 sm:p-8">
            <h2 className="text-lg font-extrabold text-slate-900 mb-4">{section.title}</h2>
            <div className="space-y-4">
              {section.blocks.map((b, i) => (
                <DocBlock key={i} block={b} />
              ))}
            </div>
            {next && (
              <button
                type="button"
                onClick={() => setActiveId(next.id)}
                className="mt-8 flex items-center gap-1.5 text-xs font-bold text-navy-600 hover:text-navy-800"
              >
                Next: {next.title}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FaqList: React.FC = () => (
  <div className="space-y-2">
    {FAQS.map(({ q, a }) => (
      <details key={q} className="group bg-white border border-slate-200 rounded-xl shadow-sm">
        <summary className="flex items-center justify-between gap-3 cursor-pointer list-none px-4 py-3.5 text-sm font-bold text-slate-900">
          {q}
          <ChevronDown className="w-4 h-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
        </summary>
        <p className="px-4 pb-4 text-xs text-slate-600 leading-relaxed">{a}</p>
      </details>
    ))}
  </div>
);

const TOPICS = ['Taxonomy question', 'Campaign Builder help', 'Tagging Strategy help', 'Report a problem', 'Something else'];

const ContactEmail: React.FC = () => {
  const { showToast } = usePersona();
  const { user } = useAuth();
  const [to, setTo] = useState(SUPPORT_EMAIL);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState('');

  const subject = `[Tagging360] ${topic}`;
  const body = `${message.trim()}\n\n— ${user?.name || 'Tagging360 user'}${user?.roleTitle ? `, ${user.roleTitle}` : ''}${user?.organization ? ` (${user.organization})` : ''}`;
  const valid = /^\S+@\S+\.\S+$/.test(to.trim());

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return showToast('Enter the recipient email address first.', 'error');
    if (!message.trim()) return showToast('Please write a message first.', 'error');
    // Static app, no mail server — hand the draft to the user's own email app.
    window.location.href = `mailto:${to.trim()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showToast('Opening your email app with the message ready to send.', 'info');
  };

  const copy = () => {
    navigator.clipboard?.writeText(`To: ${to}\nSubject: ${subject}\n\n${body}`);
    showToast('Email draft copied.', 'success');
  };

  return (
    <form onSubmit={send} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-navy-50 text-navy-600 border border-navy-100 flex items-center justify-center">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-extrabold text-slate-900">Reach out to us</div>
          <div className="text-xs text-slate-500">Write your message and it opens in your email app.</div>
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">To</label>
        <input type="email" value={to} onChange={e => setTo(e.target.value)} placeholder="support email address" className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Topic</label>
        <select value={topic} onChange={e => setTopic(e.target.value)} className={inputCls}>
          {TOPICS.map(t => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Message</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="Tell us what you need help with…" className={inputCls} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" className="flex items-center gap-2 bg-navy-600 hover:bg-navy-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm">
          <Send className="w-4 h-4" />
          Send email
        </button>
        <button type="button" onClick={copy} className="flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition">
          <Copy className="w-4 h-4" />
          Copy draft
        </button>
      </div>
    </form>
  );
};

export const HelpPage: React.FC = () => {
  const [docsOpen, setDocsOpen] = useState(false);

  useEffect(() => {
    if (!docsOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDocsOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [docsOpen]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <LifeBuoy className="w-5 h-5 text-navy-600" />
          Help &amp; Support
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Answers to common questions, and a way to reach us.</p>
      </div>

      {/* Floating tile above the FAQ + contact form — opens the full documentation window */}
      <button
        type="button"
        onClick={() => setDocsOpen(true)}
        className="w-full flex items-center gap-4 text-left bg-gradient-to-br from-navy-700 to-navy-500 text-white rounded-2xl p-5 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition duration-200 group"
      >
        <div className="w-12 h-12 shrink-0 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
          <BookOpen className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-extrabold">How to use &amp; Documentation</div>
          <div className="text-xs text-navy-100 mt-0.5">
            The complete guide to Tagging360 — every screen step by step, how taxonomy strings are built, a glossary and troubleshooting.
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold shrink-0">
          Open
          <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
        </div>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
        <section className="lg:col-span-3 space-y-3">
          <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-navy-600" />
            Frequently asked questions
          </h2>
          <FaqList />
        </section>
        <section className="lg:col-span-2">
          <ContactEmail />
        </section>
      </div>

      {docsOpen && <DocsWindow onClose={() => setDocsOpen(false)} />}
    </div>
  );
};
