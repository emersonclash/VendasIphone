'use client';

import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { formatBRL, STATUS_LABEL, type AnalyzedRow, type RowStatus } from '@/lib/pricing/engine';
import { NumField } from './ConfigPanel';

type Props = {
  rows: AnalyzedRow[];
  /** Nome original da seção → nome exibido. */
  sectionNames: Record<string, string>;
  onRenameSection: (original: string, name: string) => void;
  onCompetitorPrice: (id: string, v: number | null) => void;
  onOverride: (id: string, v: number | null) => void;
  manualCompetitor: Record<string, number>;
};

const STATUS_STYLE: Record<RowStatus, string> = {
  sem_referencia: 'bg-slate-100 text-slate-700',
  competitivo: 'bg-emerald-100 text-emerald-800',
  ajustado: 'bg-blue-100 text-blue-800',
  empatado: 'bg-amber-100 text-amber-900',
  acima: 'bg-orange-100 text-orange-900',
  inviavel: 'bg-red-100 text-red-800',
};

const cellInput =
  'w-28 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-right text-sm tabular-nums text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100';

export function ResultsTable(props: Props) {
  const { rows, sectionNames, onRenameSection, onCompetitorPrice, onOverride, manualCompetitor } = props;
  const [query, setQuery] = React.useState('');
  const [status, setStatus] = React.useState<RowStatus | 'todos'>('todos');

  const counts = React.useMemo(() => {
    const c: Partial<Record<RowStatus, number>> = {};
    for (const r of rows) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [rows]);

  const filtered = rows.filter((r) => {
    if (status !== 'todos' && r.status !== status) return false;
    if (!query.trim()) return true;
    const hay = `${r.model} ${r.storage} ${r.variant} ${r.color} ${sectionNames[r.section] ?? r.section}`.toLowerCase();
    return query.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
  });

  const sections: { original: string; rows: AnalyzedRow[] }[] = [];
  for (const r of filtered) {
    const original = r.section;
    const last = sections[sections.length - 1];
    if (last && last.original === original) last.rows.push(r);
    else sections.push({ original, rows: [r] });
  }

  return (
    <section aria-labelledby="res-title" className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
        <h2 id="res-title" className="mr-auto text-base font-bold text-slate-900">Preços calculados</h2>
        <label className="relative">
          <span className="sr-only">Buscar aparelho</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar (ex.: 17 pro max)"
            className="min-h-11 w-60 rounded-lg border border-slate-300 pl-9 pr-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100" />
        </label>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 px-4 py-3" role="group" aria-label="Filtrar por situação">
        {(['todos', 'ajustado', 'competitivo', 'empatado', 'acima', 'inviavel', 'sem_referencia'] as const).map((s) => {
          const n = s === 'todos' ? rows.length : counts[s] ?? 0;
          if (s !== 'todos' && !n) return null;
          const active = status === s;
          return (
            <button key={s} type="button" aria-pressed={active} onClick={() => setStatus(s)}
              className={`min-h-9 rounded-full border px-3 text-xs font-semibold ${active ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-500'}`}>
              {s === 'todos' ? 'Todos' : STATUS_LABEL[s]} · {n}
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <th scope="col" className="px-4 py-2">Aparelho</th>
              <th scope="col" className="px-3 py-2">Cor</th>
              <th scope="col" className="px-3 py-2 text-right">Custo</th>
              <th scope="col" className="px-3 py-2 text-right">Concorrente</th>
              <th scope="col" className="px-3 py-2 text-right">Preço de venda</th>
              <th scope="col" className="px-3 py-2 text-right">Lucro</th>
              <th scope="col" className="px-3 py-2 text-right">Margem</th>
              <th scope="col" className="px-4 py-2">Situação</th>
            </tr>
          </thead>
          {sections.map((sec) => (
            <tbody key={sec.original}>
              <tr className="border-b border-slate-200 bg-slate-100/70">
                <th scope="colgroup" colSpan={8} className="px-4 py-2 text-left">
                  <label className="flex items-center gap-2">
                    <span className="sr-only">Nome da seção</span>
                    <input value={sectionNames[sec.original] ?? sec.original}
                      onChange={(e) => onRenameSection(sec.original, e.target.value)}
                      className="w-full max-w-md rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-bold text-slate-900 hover:border-slate-300 focus:border-blue-600 focus:bg-white focus:outline-none" />
                    <span className="whitespace-nowrap text-xs font-normal text-slate-600">{sec.rows.length} aparelhos</span>
                  </label>
                </th>
              </tr>
              {sec.rows.map((r) => {
                const lowProfit = r.profit < 300;
                return (
                  <tr key={r.id} className="border-b border-slate-100 align-middle hover:bg-slate-50/60">
                    <td className="px-4 py-2">
                      <div className="font-semibold text-slate-900">{r.model} <span className="font-normal text-slate-600">{r.storage}</span></div>
                      {(r.variant || r.notes) && (
                        <div className="text-xs text-slate-600">{[r.variant, r.notes].filter(Boolean).join(' · ')}</div>
                      )}
                      {r.rule && <div className="text-xs text-blue-800">Regra “{r.rule.match}”</div>}
                    </td>
                    <td className="px-3 py-2 text-slate-800">{r.color}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-slate-800">{formatBRL(r.cost)}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {r.competitor && !r.competitor.exact && manualCompetitor[r.id] === undefined && (
                          <span className="text-xs font-semibold text-amber-800" title="Preço do mesmo modelo, sem a cor">≈</span>
                        )}
                        <label className="sr-only" htmlFor={`comp-${r.id}`}>Preço do concorrente para {r.model} {r.storage} {r.color}</label>
                        <NumField id={`comp-${r.id}`} className={cellInput} allowEmpty placeholder="—"
                          value={manualCompetitor[r.id] ?? r.competitor?.price ?? null}
                          onCommit={(v) => onCompetitorPrice(r.id, v)} />
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {r.overridden && (
                          <button type="button" aria-label={`Voltar ao preço calculado (${formatBRL(r.basePrice)})`}
                            title={`Calculado: ${formatBRL(r.basePrice)}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            onClick={() => onOverride(r.id, null)}>
                            <RotateCcw className="h-4 w-4" aria-hidden="true" />
                          </button>
                        )}
                        <label className="sr-only" htmlFor={`price-${r.id}`}>Preço de venda para {r.model} {r.storage} {r.color}</label>
                        <NumField id={`price-${r.id}`} value={r.price} allowEmpty
                          className={`${cellInput} font-bold ${r.overridden ? 'border-blue-600 bg-blue-50' : ''}`}
                          onCommit={(v) => onOverride(r.id, v)} />
                      </div>
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums font-semibold ${r.profit < 0 ? 'text-red-700' : lowProfit ? 'text-amber-800' : 'text-emerald-800'}`}>
                      {formatBRL(r.profit)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-slate-800">{r.marginPct.toFixed(1).replace('.', ',')}%</td>
                    <td className="px-4 py-2">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[r.status]}`}>
                        {STATUS_LABEL[r.status]}
                      </span>
                      {r.diff !== null && r.diff !== 0 && (
                        <div className="mt-0.5 text-xs tabular-nums text-slate-600">
                          {r.diff < 0 ? `${formatBRL(-r.diff)} abaixo` : `${formatBRL(r.diff)} acima`}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          ))}
        </table>
        {!filtered.length && <p className="p-6 text-center text-sm text-slate-600">Nenhum aparelho com esse filtro.</p>}
      </div>
    </section>
  );
}
