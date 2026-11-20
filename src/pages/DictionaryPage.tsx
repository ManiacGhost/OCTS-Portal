import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, FileSpreadsheet } from 'lucide-react';
import { DictionaryView } from '../components/common/DictionaryView';
import { TemplatesView } from '../components/common/TemplatesView';

/** Two global sections side by side: the dictionary (with its own pending changes / notifications) and the templates built from it. */
export const DictionaryPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const view = params.get('view') === 'templates' ? 'templates' : 'dictionary';

  const section = (id: 'dictionary' | 'templates', icon: React.ReactNode, label: string) => (
    <button
      type="button"
      onClick={() => setParams(id === 'templates' ? { view: 'templates' } : {})}
      aria-current={view === id ? 'page' : undefined}
      className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 -mb-px transition ${
        view === id ? 'border-navy-600 text-navy-700' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="space-y-5 text-slate-900">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          <BookOpen />
          Dictionary and Templates
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {view === 'templates'
            ? 'Templates built strictly from dictionary values.'
            : 'The Kite dictionary: every field, its values and abbreviation, who owns it and who last changed it. Changes need approval.'}
        </p>
      </div>

      <div className="flex items-center gap-1 border-b border-slate-200">
        {section('dictionary', <BookOpen className="w-4 h-4" />, 'Dictionary')}
        {section('templates', <FileSpreadsheet className="w-4 h-4" />, 'Templates')}
      </div>

      {view === 'templates' ? <TemplatesView /> : <DictionaryView hideHeader />}
    </div>
  );
};
