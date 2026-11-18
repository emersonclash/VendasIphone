'use client';

import React from 'react';
import { Plus, Trash2, SlidersHorizontal } from 'lucide-react';
import type { CompetitorMode, PricingConfig, PricingRule, Rounding } from '@/lib/pricing/engine';

type Props = {
  config: PricingConfig;
  onChange: (c: PricingConfig) => void;
  approxMatch: boolean;
  onApproxChange: (v: boolean) => void;
};

const ROUNDING: { value: Rounding; label: string }[] = [
  { value: 'centena', label: 'Valor fechado (2.100)' },
  { value: 'final90', label: 'Final 90 (2.090)' },
  { value: 'cinquenta', label: 'De 50 em 50 (2.150)' },
  { value: 'nenhum', label: 'Sem arredondar' },
];

const MODES: { value: CompetitorMode; label: string }[] = [
  { value: 'bater', label: 'Ficar abaixo do concorrente' },
  { value: 'igualar', label: 'Igualar o concorrente' },
  { value: 'ignorar', label: 'Ignorar concorrente' },
];

const label = 'block text-xs font-semibold text-slate-600 mb-1';
export const input =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100';

function parseNum(v: string): number | null {
  let t = v.trim().replace(/^r\$\s*/i, '');
  if (t === '') return null;
  // "1.450" e "1.450,50" usam ponto de milhar; "13.5" e "13,5" são decimais.
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** Campo numérico que aceita vírgula e só publica o valor quando ele é válido. */
export function NumField({ id, value, onCommit, placeholder, allowEmpty = false, className = input }: {
  id: string;
  value: number | null;
  onCommit: (v: number | null) => void;
  placeholder?: string;
  allowEmpty?: boolean;
  className?: string;
}) {
  const fmt = (v: number | null) => (v === null ? '' : String(v).replace('.', ','));
  const [text, setText] = React.useState(fmt(value));
  React.useEffect(() => {
    setText((t) => (parseNum(t) === value ? t : fmt(value)));
  }, [value]);
  return (
    <input id={id} inputMode="decimal" className={className} value={text} placeholder={placeholder}
      onChange={(e) => {
        setText(e.target.value);
        const n = parseNum(e.target.value);
        if (n !== null) onCommit(n);
        else if (allowEmpty && e.target.value.trim() === '') onCommit(null);
      }}
      onBlur={() => setText(fmt(value))} />
  );
}

export function ConfigPanel({ config, onChange, approxMatch, onApproxChange }: Props) {
  const set = <K extends keyof PricingConfig>(k: K, v: PricingConfig[K]) => onChange({ ...config, [k]: v });
  const setRule = (id: string, patch: Partial<PricingRule>) =>
    set('rules', config.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <section aria-labelledby="cfg-title" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 id="cfg-title" className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
        <SlidersHorizontal className="h-4 w-4 text-blue-700" aria-hidden="true" />
        Regras de preço
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="cfg-markup" className={label}>Margem padrão (%)</label>
          <NumField id="cfg-markup" value={config.markupPct} onCommit={(v) => set('markupPct', v ?? 0)} />
        </div>
        <div>
          <label htmlFor="cfg-min" className={label}>Lucro mínimo (R$)</label>
          <NumField id="cfg-min" value={config.minProfit} onCommit={(v) => set('minProfit', v ?? 0)} />
        </div>
        <div className="col-span-2">
          <label htmlFor="cfg-round" className={label}>Arredondamento</label>
          <select id="cfg-round" className={input} value={config.rounding}
            onChange={(e) => set('rounding', e.target.value as Rounding)}>
            {ROUNDING.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
      </div>

      <h3 className="mt-5 mb-2 text-sm font-bold text-slate-800">Concorrente</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label htmlFor="cfg-mode" className={label}>Estratégia</label>
          <select id="cfg-mode" className={input} value={config.competitorMode}
            onChange={(e) => set('competitorMode', e.target.value as CompetitorMode)}>
            {MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        {config.competitorMode === 'bater' && (
          <div>
            <label htmlFor="cfg-under" className={label}>Quanto abaixo (R$)</label>
            <NumField id="cfg-under" value={config.undercut} onCommit={(v) => set('undercut', v ?? 0)} />
          </div>
        )}
        <label className="col-span-2 flex items-start gap-2 text-sm text-slate-700">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-blue-700" checked={approxMatch}
            onChange={(e) => onApproxChange(e.target.checked)} />
          <span>Usar o preço do mesmo modelo quando o concorrente não informa a cor <span className="text-slate-500">(marcado com ≈)</span></span>
        </label>
      </div>

      <h3 className="mt-5 mb-1 text-sm font-bold text-slate-800">Regras por modelo</h3>
      <p className="mb-3 text-xs text-slate-600">
        A primeira regra que casar vale. Use gerações (<code>12, 13, 14</code> ou <code>12-14</code>) ou palavras
        (<code>pro max</code>, <code>dubai</code>, <code>seminovos</code>).
      </p>
      <ul className="flex flex-col gap-3">
        {config.rules.map((r, idx) => (
          <li key={r.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600">Regra {idx + 1}</span>
              <button type="button" aria-label={`Remover regra ${idx + 1}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-red-700"
                onClick={() => set('rules', config.rules.filter((x) => x.id !== r.id))}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <label htmlFor={`rule-m-${r.id}`} className={label}>Modelos</label>
            <input id={`rule-m-${r.id}`} className={input} value={r.match} placeholder="12, 13, 14"
              onChange={(e) => setRule(r.id, { match: e.target.value })} />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label htmlFor={`rule-p-${r.id}`} className={label}>Margem (%)</label>
                <NumField id={`rule-p-${r.id}`} value={r.markupPct} allowEmpty placeholder={`${String(config.markupPct).replace('.', ',')} (padrão)`}
                  onCommit={(v) => setRule(r.id, { markupPct: v })} />
              </div>
              <div>
                <label htmlFor={`rule-a-${r.id}`} className={label}>Somar (R$)</label>
                <NumField id={`rule-a-${r.id}`} value={r.addValue} onCommit={(v) => setRule(r.id, { addValue: v ?? 0 })} />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <button type="button"
        className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border border-dashed border-slate-400 px-3 text-sm font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700"
        onClick={() => set('rules', [...config.rules, { id: `r${Date.now()}`, match: '', markupPct: null, addValue: 0 }])}>
        <Plus className="h-4 w-4" aria-hidden="true" /> Adicionar regra
      </button>
    </section>
  );
}
