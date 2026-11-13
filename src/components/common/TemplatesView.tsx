import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, FileSpreadsheet, AlertTriangle, CheckCircle2, BookOpen, Plus, Trash2 } from 'lucide-react';
import { useDictionary, DictAttribute } from '../../data/kiteDictionary';
import { PLD_CUSTOM_EXAMPLES, PLD_FILE_FORMAT, PLD_SEED, PldSeedRow } from '../../data/pldSeed';
import { usePersona } from '../../context/PersonaContext';
import { buildXlsx, downloadBlob, Cell } from '../../utils/xlsx';

/**
 * The PLD Data template. Its columns are fixed — segment, field name, definition, required, metadata field and
 * managed-by are shown exactly as in Kite's template. Only the Example is chosen: for a field that has a list in the
 * dictionary (Brand, Indication, Channel …) the example is picked from that dictionary field's attributes.
 * "Download template" writes the finished Excel.
 */

const INPUT = 'w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-navy-500';
// a dictionary pick that still has to be made stands out from the filled ones
const EMPTY_PICK = 'w-full bg-amber-50 border-2 border-amber-400 rounded-lg px-2 py-1.5 text-xs font-semibold text-amber-900 focus:outline-none focus:border-amber-500 ring-2 ring-amber-100';
const TH = 'text-left text-[10px] font-semibold text-navy-800 uppercase tracking-wider px-2 py-2.5 align-bottom';

const stamp = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
};

const CUSTOM_SEGMENT = 'Custom Fields';
// the template's own rows; custom fields the user adds follow them (the template's Attribute_n placeholder slots are not used)
const FIXED = PLD_SEED.filter(r => r.segment !== CUSTOM_SEGMENT);
const SEGMENTS = [...new Set(FIXED.map(r => r.segment))];
const CUSTOM_DEFINITION = 'Vendor-specific custom field';

interface CustomField {
  id: number;
  name: string;
  value: string;
}

export const TemplatesView: React.FC = () => {
  const dict = useDictionary();
  const { activeBrand, showToast } = usePersona();

  const optionsOf = (key: string): DictAttribute[] => dict.fields.find(f => f.key === key)?.attributes || [];
  const fieldLabel = (key: string) => dict.fields.find(f => f.key === key)?.label || key;
  // in a brand's workspace only that brand is offered; without one, the real brands (not UNBRANDED / UNKNOWN)
  const activeShort = activeBrand ? activeBrand.name.split(/[ (®™]/)[0].toLowerCase() : '';
  const realBrands = optionsOf('brd').map(a => a.value).filter(b => b !== 'UNKNOWN' && b !== 'UNBRANDED');
  const brandOpts = activeShort && realBrands.some(b => b.toLowerCase() === activeShort) ? realBrands.filter(b => b.toLowerCase() === activeShort) : realBrands;

  // chosen examples, by field name; fields without a dictionary list keep the template's own example
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const [vendor, setVendor] = useState('Agency');
  const [brand, setBrand] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [custom, setCustom] = useState<CustomField[]>([]);
  const [nextCustomId, setNextCustomId] = useState(1);
  const addCustom = () => {
    setCustom(c => [...c, { id: nextCustomId, name: '', value: '' }]);
    setNextCustomId(n => n + 1);
    setSegmentFilter(f => (f === 'all' || f === CUSTOM_SEGMENT ? f : CUSTOM_SEGMENT));
  };
  const editCustom = (id: number, patch: Partial<CustomField>) => setCustom(c => c.map(x => (x.id === id ? { ...x, ...patch } : x)));

  const brandValue = brandOpts.includes(brand) ? brand : brandOpts[0] || '';
  const fileName = `${vendor.trim() || '<VendorName>'}_Kite_${brandValue || '<BrandName>'}_PLD_YYYYMMDDhhmmss.csv`;

  // the Brand example is always the brand being worked in
  const valueOf = (r: PldSeedRow) => (r.dictField === 'brd' ? brandValue : chosen[r.name] || '');
  const exampleOf = (r: PldSeedRow) => (r.dictField ? valueOf(r) : r.example);
  const optionsFor = (r: PldSeedRow) => (r.dictField === 'brd' ? brandOpts.map(v => ({ value: v })) : optionsOf(r.dictField));

  const problems = useMemo(() => {
    const out: string[] = [];
    FIXED.forEach(r => {
      if (!r.dictField) return;
      const v = valueOf(r);
      if (!v) out.push(`${r.name}: pick an example from the dictionary (${fieldLabel(r.dictField)}).`);
      else if (!optionsOf(r.dictField).some(a => a.value === v)) out.push(`${r.name}: “${v}” is no longer in the dictionary.`);
    });
    custom.forEach((c, i) => {
      if (!c.name.trim()) out.push(`Custom field ${i + 1}: enter its name, or remove it.`);
    });
    if (!vendor.trim()) out.push('Enter the vendor name for the file name.');
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosen, dict, vendor, custom]);

  const download = () => {
    if (problems.length) return;
    const head = (v: string): Cell => ({ v, s: 'header' });
    const cell = (v: string | number | undefined): Cell => ({ v: v ?? '', s: 'wrap' });
    const sheetRows: (Cell | string | number | null)[][] = [
      [null, null, { v: 'File Format:', s: 'label' }, PLD_FILE_FORMAT],
      [null, null, { v: 'File Naming Convention:', s: 'label' }, fileName],
      [],
      [null, head('#'), head('Field Segment'), head('Field Name'), head('Field Definition'), head('Required'), head('Metadata Field'), head('Metadata Manage by'), head('Examples'), head('Comments')],
      ...FIXED.map((r, i) => [null, cell(i + 1), cell(r.segment), cell(r.name), cell(r.definition), cell(r.required), cell(r.metadata), cell(r.managedBy), cell(exampleOf(r)), cell('')]),
      // the custom fields the user added: named by them, in the template's usual Partner-managed form
      ...custom.map((c, i) => [null, cell(FIXED.length + i + 1), cell(CUSTOM_SEGMENT), cell(c.name.trim()), cell(CUSTOM_DEFINITION), cell('P3'), cell('N'), cell('Partner'), cell(c.value.trim()), cell('')]),
      [],
      ...PLD_CUSTOM_EXAMPLES.map((t, i) => [null, null, { v: t[0], s: i === 0 ? ('label' as const) : ('plain' as const) }, t[1] || null]),
    ];
    const blob = buildXlsx({ name: 'PLD Template', rows: sheetRows, widths: [3, 6, 22, 26, 62, 11, 15, 19, 36, 26], freezeRow: 4 });
    downloadBlob(blob, `PLD_Template_${vendor.trim().replace(/\s+/g, '')}_${brandValue}_${stamp()}.xlsx`);
    showToast('PLD template downloaded', 'success');
  };

  const shown = FIXED.filter(r => segmentFilter === 'all' || r.segment === segmentFilter);
  const showCustom = segmentFilter === 'all' || segmentFilter === CUSTOM_SEGMENT;
  const dictRows = FIXED.filter(r => r.dictField);
  const picked = dictRows.filter(r => valueOf(r)).length;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-navy-50 text-navy-700 border border-navy-100"><FileSpreadsheet className="w-5 h-5" /></div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">PLD Data template</h3>
              <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
                The template's fields are fixed. Choose the example for each field that has a list in the dictionary ({dictRows.length} of them), then download the finished Excel.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={download}
            disabled={problems.length > 0}
            className="flex items-center gap-2 text-sm font-bold text-white bg-navy-600 hover:bg-navy-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl px-5 py-2.5 shadow-sm transition"
          >
            <Download className="w-4 h-4" /> Download template
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-5">
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">File format</span>
            <div className="mt-1 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">{PLD_FILE_FORMAT}</div>
          </div>
          <label className="block">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Vendor name</span>
            <input value={vendor} onChange={e => setVendor(e.target.value)} className={`${INPUT} mt-1 py-2`} placeholder="e.g. AgencyName" />
          </label>
          <label className="block">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Brand (dictionary)</span>
            <select value={brandValue} onChange={e => setBrand(e.target.value)} disabled={brandOpts.length < 2} className={`${INPUT} mt-1 py-2 disabled:bg-slate-50 disabled:text-slate-600`}>
              {brandOpts.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </label>
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">File naming convention</span>
            <div className="mt-1 text-xs font-mono text-navy-700 bg-navy-50/60 border border-navy-100 rounded-lg px-3 py-2 break-all">{fileName}</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {problems.length === 0 ? (
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> All {dictRows.length} dictionary examples chosen. Ready to download.
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" /> {picked} of {dictRows.length} examples chosen: {problems.length} thing{problems.length === 1 ? '' : 's'} to finish
            </span>
          )}
          <Link to="/dictionary" className="flex items-center gap-1.5 text-navy-700 hover:underline font-semibold">
            <BookOpen className="w-3.5 h-3.5" /> Need another value? Propose it in the dictionary
          </Link>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 px-4 py-3 border-b border-slate-100">
          {['all', ...SEGMENTS, CUSTOM_SEGMENT].map(sg => (
            <button
              key={sg}
              type="button"
              onClick={() => setSegmentFilter(sg)}
              className={`text-[11px] font-semibold px-3 py-1 rounded-full border transition ${segmentFilter === sg ? 'bg-navy-600 text-white border-navy-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              {sg === 'all' ? `All (${FIXED.length + custom.length})` : `${sg} (${sg === CUSTOM_SEGMENT ? custom.length : FIXED.filter(r => r.segment === sg).length})`}
            </button>
          ))}
        </div>

        <datalist id="pld-custom-suggestions">
          {PLD_CUSTOM_EXAMPLES.slice(1).map(t => <option key={t[0]} value={t[0]} />)}
        </datalist>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] border-collapse table-fixed">
            <thead className="bg-navy-100 border-b border-navy-200">
              <tr>
                <th className={`${TH} w-[1.75rem]`}>#</th>
                <th className={`${TH} w-[10.5rem]`}>Field name</th>
                <th className={TH}>Field definition</th>
                <th className={`${TH} w-[4.25rem]`}>Required</th>
                <th className={`${TH} w-[4.5rem]`}>Metadata field</th>
                <th className={`${TH} w-[6rem]`}>Managed by</th>
                <th className={`${TH} w-[12.5rem]`}>Example</th>
              </tr>
            </thead>
            <tbody>
              {shown.map(r => (
                <tr key={r.name} className="border-b border-slate-100 align-top hover:bg-navy-50/30">
                  <td className="px-2 py-2 text-xs text-slate-400">{FIXED.indexOf(r) + 1}</td>
                  <td className="px-2 py-2">
                    <div className="text-xs font-mono font-medium text-navy-700 break-all">{r.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{r.segment}</div>
                  </td>
                  <td className="px-2 py-2 text-[11px] leading-snug text-slate-600">{r.definition}</td>
                  <td className="px-2 py-2 text-xs text-slate-700">{r.required}</td>
                  <td className="px-2 py-2 text-xs text-slate-700">{r.metadata}</td>
                  <td className="px-2 py-2 text-xs text-slate-700">{r.managedBy}</td>
                  <td className="px-2 py-2">
                    {r.dictField ? (
                      <select
                        value={valueOf(r)}
                        onChange={e => setChosen(c => ({ ...c, [r.name]: e.target.value }))}
                        className={valueOf(r) ? INPUT : EMPTY_PICK}
                        aria-label={`Example for ${r.name}`}
                        title={`From the dictionary: ${fieldLabel(r.dictField)}`}
                      >
                        <option value="">Pick from the dictionary…</option>
                        {optionsFor(r).map(a => <option key={a.value} value={a.value}>{a.value}</option>)}
                      </select>
                    ) : (
                      <span className="text-xs text-slate-600 break-words">{r.example || <span className="text-slate-300">-</span>}</span>
                    )}
                  </td>
                </tr>
              ))}
              {showCustom &&
                custom.map((c, i) => (
                  <tr key={`c${c.id}`} className="border-b border-slate-100 align-top bg-navy-50/30">
                    <td className="px-2 py-2 text-xs text-slate-400">{FIXED.length + i + 1}</td>
                    <td className="px-2 py-2">
                      <input
                        list="pld-custom-suggestions"
                        value={c.name}
                        onChange={e => editCustom(c.id, { name: e.target.value })}
                        placeholder="Field name, e.g. Ad Size"
                        aria-label={`Custom field ${i + 1} name`}
                        className={c.name.trim() ? INPUT : EMPTY_PICK}
                      />
                      <div className="text-[10px] text-slate-400 mt-0.5">{CUSTOM_SEGMENT}</div>
                    </td>
                    <td className="px-2 py-2 text-[11px] leading-snug text-slate-600">{CUSTOM_DEFINITION}</td>
                    <td className="px-2 py-2 text-xs text-slate-700">P3</td>
                    <td className="px-2 py-2 text-xs text-slate-700">N</td>
                    <td className="px-2 py-2 text-xs text-slate-700">Partner</td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1.5">
                        <input value={c.value} onChange={e => editCustom(c.id, { value: e.target.value })} placeholder="Example value" aria-label={`Custom field ${i + 1} example`} className={INPUT} />
                        <button
                          type="button"
                          title="Remove this custom field"
                          aria-label={`Remove custom field ${i + 1}`}
                          onClick={() => setCustom(cs => cs.filter(x => x.id !== c.id))}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {segmentFilter === CUSTOM_SEGMENT && custom.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-slate-400">No custom fields yet. Use “Add custom field” to add one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-100">
          <p className="text-[11px] text-slate-400">
            {custom.length === 0 ? 'Need a vendor-specific field? Add it here: only the custom fields you add go into the template.' : `${custom.length} custom field${custom.length === 1 ? '' : 's'} will be added to the template.`}
          </p>
          <button type="button" onClick={addCustom} className="flex items-center gap-1.5 text-xs font-bold text-navy-700 bg-navy-50 hover:bg-navy-100 border border-navy-200 rounded-lg px-3.5 py-2 shrink-0">
            <Plus className="w-3.5 h-3.5" /> Add custom field
          </button>
        </div>
      </div>

    </div>
  );
};
