import React, { useEffect, useMemo, useState } from 'react';
import { Route, Tag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePersona } from '../context/PersonaContext';
import { channelsForBrand } from '../data/utmStrategyModel';
import { dimensionGroupsFor, subChannelsWithDimensions } from '../data/taggableDimensions';
import { useBrandStrategy } from '../data/brandStrategyStore';
import { MediaChannelType } from '../types';

const SCOPE_STYLE: Record<string, string> = {
  Core: 'bg-slate-100 text-slate-600 border-slate-200',
  Channel: 'bg-navy-100 text-navy-800 border-navy-200',
  'Sub-channel': 'bg-navy-600 text-white border-navy-600',
};

const CELL_INPUT =
  'w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-navy-500 focus:bg-white rounded px-2 py-1 text-xs text-slate-900 focus:outline-none transition';

export const TagStrategyPage: React.FC = () => {
  const { campaigns, channels, brands } = usePersona();

  const [brandId, setBrandId] = useState<string>(brands[0]?.id || '');
  const [channelId, setChannelId] = useState<string>('');
  const [subChannel, setSubChannel] = useState<string>('');

  const brand = brands.find(b => b.id === brandId) || brands[0];

  const brandChannels = useMemo(
    () => channelsForBrand(brand?.id || '', campaigns, channels),
    [brand, campaigns, channels],
  );
  const activeChannel = brandChannels.find(bc => bc.channel.id === channelId)?.channel || null;
  const channelType = (activeChannel?.name as MediaChannelType) || null;
  const subChannelList = channelType ? subChannelsWithDimensions(channelType) : [];

  const pickChannel = (id: string) => {
    setChannelId(id);
    const ct = brandChannels.find(bc => bc.channel.id === id)?.channel?.name as MediaChannelType;
    setSubChannel(ct ? subChannelsWithDimensions(ct)[0] || '' : '');
  };

  const pickBrand = (id: string) => {
    setBrandId(id);
    setChannelId('');
    setSubChannel('');
  };

  // Default to the Digital channel (fall back to the brand's first channel).
  useEffect(() => {
    if (channelId || brandChannels.length === 0) return;
    const target = brandChannels.find(bc => bc.channel.name === 'Digital') || brandChannels[0];
    pickChannel(target.channel.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandChannels, channelId]);

  const bs = useBrandStrategy();
  const hasSubChannels = subChannelList.length > 0;
  const ready = !!channelType && (!hasSubChannels || !!subChannel);
  const groups = ready && channelType ? dimensionGroupsFor(channelType, subChannel) : [];
  const totalDimensions = groups.reduce((n, g) => n + g.dimensions.length, 0);
  const scopeLabel = hasSubChannels && subChannel ? `${activeChannel?.name} → ${subChannel}` : activeChannel?.name;

  const bId = brand?.id || brandId;
  const selected = channelType ? bs.getSelected(bId, channelType, subChannel) : [];
  const selectedCount = selected.length;
  const toggle = (name: string) => channelType && bs.toggle(bId, channelType, subChannel, name);
  const setGroup = (names: string[], on: boolean) => {
    if (!channelType) return;
    const set = new Set(selected);
    names.forEach(n => (on ? set.add(n) : set.delete(n)));
    bs.setSelected(bId, channelType, subChannel, Array.from(set));
  };
  const editDim = (name: string, patch: { name?: string; captures?: string; defaultValue?: string }) =>
    channelType && bs.setEdit(bId, channelType, subChannel, name, patch);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Route className="w-5 h-5 text-navy-600" />
          Tagging Strategy
        </h1>
        <p className="text-sm text-slate-500 mt-0.5 max-w-3xl">
          Define the brand&rsquo;s strategy per channel and sub-channel: tick the dimensions this brand
          uses, and edit each one&rsquo;s name, what it captures, and a default value. The ticked rows
          become the editable UTM fields in the Campaign Builder&rsquo;s Code &amp; UTM Generator.
        </p>
      </div>

      {/* Step 1 — Brand */}
      <div>
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">1 · Brand</div>
        <div className="flex flex-wrap gap-2">
          {brands.map(b => {
            const on = b.id === brand?.id;
            return (
              <button
                key={b.id}
                onClick={() => pickBrand(b.id)}
                className={`text-left rounded-2xl border px-4 py-3 transition ${
                  on
                    ? 'bg-navy-600 text-white border-navy-600 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm">{b.name.split(/[ (]/)[0]}</span>
                  <span
                    className={`font-mono text-[10px] font-bold rounded px-1 py-0.5 border ${
                      on ? 'bg-white/15 border-white/30 text-white' : 'bg-navy-50 border-navy-200 text-navy-700'
                    }`}
                  >
                    {b.code}
                  </span>
                </div>
                <div className={`text-[11px] mt-0.5 ${on ? 'text-navy-50' : 'text-slate-400'}`}>{b.indication}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2 — Channel */}
      <div>
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          2 · Channel {brand ? `for ${brand.name.split(/[ (]/)[0]}` : ''}
        </div>
        {brandChannels.length === 0 ? (
          <div className="text-xs text-slate-400 bg-white border border-slate-200 rounded-xl px-3 py-2.5">
            No campaigns recorded for this brand yet.
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {brandChannels.map(bc => {
              const on = bc.channel.id === channelId;
              return (
                <button
                  key={bc.channel.id}
                  onClick={() => pickChannel(bc.channel.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    on
                      ? 'bg-navy-600 text-white border-navy-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {bc.channel.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Step 3 — Sub-channel (only for channels that have them) */}
      {activeChannel && subChannelList.length > 0 && (
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            3 · Sub-channel in {activeChannel.name}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {subChannelList.map(sc => {
              const on = sc === subChannel;
              return (
                <button
                  key={sc}
                  onClick={() => setSubChannel(sc)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    on
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {sc}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Taggable-dimension catalogue + selection */}
      {ready && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Tag className="w-4 h-4 text-navy-600" />
              <span>
                <b className="text-slate-800">{selectedCount}</b> of {totalDimensions} dimensions in the
                strategy for <b className="text-slate-800">{scopeLabel}</b> &mdash; tick the fields this brand
                tags on this {hasSubChannels ? 'sub-channel' : 'channel'}.
              </span>
            </div>
            <Link
              to="/campaigns"
              className="flex items-center gap-1 text-[11px] font-bold text-navy-700 bg-navy-50 border border-navy-200 rounded-lg px-2.5 py-1.5 hover:bg-navy-100 transition"
            >
              Use in Code &amp; UTM Generator
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {groups.map(group => {
            const names = group.dimensions.map(d => d.name);
            const chosen = names.filter(n => selected.includes(n)).length;
            const allOn = chosen === names.length && names.length > 0;
            return (
              <div key={group.title} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900">{group.title}</h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide border rounded-full px-2 py-0.5 ${
                        SCOPE_STYLE[group.scope]
                      }`}
                    >
                      {group.scope}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">
                    {chosen}/{names.length} selected
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-200">
                      <tr>
                        <th className="p-3 w-10">
                          <input
                            type="checkbox"
                            aria-label="Select all in this group"
                            title={allOn ? 'Clear all' : 'Select all'}
                            ref={el => {
                              if (el) el.indeterminate = chosen > 0 && !allOn;
                            }}
                            checked={allOn}
                            onChange={() => setGroup(names, !allOn)}
                            className="w-3.5 h-3.5 accent-navy-600 cursor-pointer"
                          />
                        </th>
                        <th className="p-3 w-56">Dimension</th>
                        <th className="p-3">Captures</th>
                        <th className="p-3">Default value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {group.dimensions.map(d => {
                        const on = selected.includes(d.name);
                        const ed = channelType ? bs.getEdit(bId, channelType, subChannel, d.name) : {};
                        return (
                          <tr key={d.name} className={`align-top ${on ? 'bg-navy-50/50' : ''}`}>
                            <td className="p-3">
                              <input
                                type="checkbox"
                                checked={on}
                                onChange={() => toggle(d.name)}
                                className="w-3.5 h-3.5 accent-navy-600 cursor-pointer mt-1"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                value={ed.name ?? d.name}
                                onChange={e => editDim(d.name, { name: e.target.value })}
                                className={`${CELL_INPUT} font-bold`}
                              />
                            </td>
                            <td className="p-2">
                              <input
                                value={ed.captures ?? d.captures}
                                onChange={e => editDim(d.name, { captures: e.target.value })}
                                className={CELL_INPUT}
                              />
                            </td>
                            <td className="p-2">
                              <input
                                value={ed.defaultValue ?? ''}
                                placeholder={d.example}
                                onChange={e => editDim(d.name, { defaultValue: e.target.value })}
                                className={`${CELL_INPUT} font-mono text-[11px] text-slate-600`}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
