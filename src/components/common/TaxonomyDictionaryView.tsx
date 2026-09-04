import React, { useState } from 'react';
import { usePersona } from '../../context/PersonaContext';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Tag,
  Building2,
  Layers,
  ChevronRight,
  Download,
  Plus
} from 'lucide-react';

export const TaxonomyDictionaryView: React.FC = () => {
  const { therapeuticAreas, brands, keyMessages, channels } = usePersona();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'keymessages' | 'therapeutic' | 'brands' | 'channels'>('keymessages');

  const q = (searchQuery || '').toLowerCase();
  const filteredKeyMessages = keyMessages.map(km => {
    const subs = km.subcategories || km.subtopics || [];
    return {
      ...km,
      subcategories: subs.filter(sub =>
        (sub.name || '').toLowerCase().includes(q) ||
        (sub.code || '').toLowerCase().includes(q) ||
        (sub.description || '').toLowerCase().includes(q) ||
        (km.name || '').toLowerCase().includes(q)
      )
    };
  }).filter(km => (km.subcategories && km.subcategories.length > 0) || (km.name || '').toLowerCase().includes(q));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-6 shadow-sm text-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-navy-600 text-white shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Master Taxonomy Dictionary
            </h3>
            <p className="text-xs text-slate-500">
              Single source of truth for Topics & Subtopics, Therapeutic Areas, Brands, and Channels.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/export/csv?type=keymessages"
            download
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition border border-slate-200 flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-navy-600" />
            <span>Export Topic Dictionary (CSV)</span>
          </a>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('keymessages')}
            className={`px-3 py-1.5 rounded-lg transition font-bold whitespace-nowrap ${
              activeTab === 'keymessages' ? 'bg-navy-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Topics & Subtopics ({keyMessages.length})
          </button>
          <button
            onClick={() => setActiveTab('therapeutic')}
            className={`px-3 py-1.5 rounded-lg transition font-bold whitespace-nowrap ${
              activeTab === 'therapeutic' ? 'bg-navy-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Therapeutic Areas ({therapeuticAreas.length})
          </button>
          <button
            onClick={() => setActiveTab('brands')}
            className={`px-3 py-1.5 rounded-lg transition font-bold whitespace-nowrap ${
              activeTab === 'brands' ? 'bg-navy-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Brands ({brands.length})
          </button>
          <button
            onClick={() => setActiveTab('channels')}
            className={`px-3 py-1.5 rounded-lg transition font-bold whitespace-nowrap ${
              activeTab === 'channels' ? 'bg-navy-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Channels ({channels.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search taxonomy..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-navy-500 font-medium"
          />
        </div>
      </div>

      {/* Tab Content 1: Topics & Subtopics */}
      {activeTab === 'keymessages' && (
        <div className="space-y-4">
          {filteredKeyMessages.map((cat) => (
            <div key={cat.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-navy-800 bg-navy-50 px-2 py-0.5 rounded border border-navy-200">
                    {cat.code}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900">{cat.name}</h4>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">{cat.subcategories.length} Subtopics</span>
              </div>

              <p className="text-xs text-slate-600 font-medium">{cat.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                {cat.subcategories.map((sub) => (
                  <div key={sub.id} className="bg-white border border-slate-200 rounded-lg p-3 space-y-1 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-navy-800">{sub.code}</span>
                      <span className="text-[10px] bg-navy-50 text-navy-700 px-2 py-0.5 rounded border border-navy-200 font-bold">
                        {sub.status.toUpperCase()}
                      </span>
                    </div>
                    <h5 className="font-bold text-xs text-slate-900">{sub.name}</h5>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{sub.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content 2: Therapeutic Areas */}
      {activeTab === 'therapeutic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {therapeuticAreas.map((ta) => (
            <div key={ta.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-navy-800 bg-navy-50 px-2 py-0.5 rounded border border-navy-200">
                  {ta.code}
                </span>
                <span className="text-xs text-slate-500 font-medium">{ta.brands.length} Brands</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">{ta.name}</h4>
              <p className="text-xs text-slate-600 font-medium">{ta.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content 3: Brands */}
      {activeTab === 'brands' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {brands.map((b) => {
            const ta = therapeuticAreas.find(t => t.id === b.therapeuticAreaId);
            return (
              <div key={b.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-navy-800 bg-navy-50 px-2 py-0.5 rounded border border-navy-200">
                    {b.code}
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">
                    {ta?.name || 'Oncology'}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">{b.name}</h4>
                <p className="text-xs text-slate-600 font-medium">
                  <strong>Indication:</strong> {b.indication}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab Content 4: Channels */}
      {activeTab === 'channels' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {channels.map((c) => (
            <div key={c.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-navy-800 bg-navy-50 px-2 py-0.5 rounded border border-navy-200">
                  {c.code}
                </span>
                <span className="text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">
                  Platform: {c.downstreamPlatform}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">{c.name}</h4>
              <div className="text-xs text-slate-600 pt-1 font-medium">
                <strong>Supported Formats:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {c.formats.map((f, i) => (
                    <span key={i} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px] text-slate-700 font-bold">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

