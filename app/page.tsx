'use client';

import React from 'react';
import { Bot, Calculator, ClipboardPaste, Copy, Check, Download, Sparkles, TriangleAlert, Trash2 } from 'lucide-react';
import { itemKey, parseSupplierList, type ParsedItem } from '@/lib/pricing/parser';
import {
  analyze,
  DEFAULT_CONFIG,
  formatBRL,
  formatShareList,
  matchCompetitor,
  summarize,
  toCSV,
  type CompetitorPrice,
  type PricingConfig,
} from '@/lib/pricing/engine';
import { SAMPLE_COMPETITOR_LIST, SAMPLE_SUPPLIER_LIST } from '@/lib/pricing/sample';
import { ConfigPanel } from '@/components/analyzer/ConfigPanel';
import { ResultsTable } from '@/components/analyzer/ResultsTable';

const STORAGE_KEY = 'analisador-preco:v1';

type Saved = {
  supplierText: string;
  competitorText: string;
  config: PricingConfig;
  approx: boolean;
  manualCompetitor: Record<string, number>;
  overrides: Record<string, number>;
  sectionNames: Record<string, string>;
  header: string;
  footer: string;
};

/** IDs estáveis (seção + modelo + cor + versão) para que preços digitados sobrevivam a uma nova colagem. */
function withStableIds(items: ParsedItem[]): ParsedItem[] {
  const seen = new Map<string, number>();
  return items.map((i) => {
    const base = `${i.section}|${itemKey(i, i.variant)}`;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return { ...i, id: n > 1 ? `${base}#${n}` : base };
  });
}

const textarea =
  'min-h-56 w-full resize-y rounded-xl border border-slate-300 bg-white p-3 font-mono text-sm leading-relaxed text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100';
const btn =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60';
const btnPrimary = `${btn} bg-blue-700 text-white hover:bg-blue-800`;
const btnGhost = `${btn} border border-slate-300 bg-white text-slate-800 hover:border-slate-500`;

export default function AnalisadorPage() {
  const [supplierText, setSupplierText] = React.useState('');
  const [competitorText, setCompetitorText] = React.useState('');
  const [config, setConfig] = React.useState<PricingConfig>(DEFAULT_CONFIG);
  const [approx, setApprox] = React.useState(true);
  const [manualCompetitor, setManualCompetitor] = React.useState<Record<string, number>>({});
  const [overrides, setOverrides] = React.useState<Record<string, number>>({});
  const [sectionNames, setSectionNames] = React.useState<Record<string, string>>({});
  const [header, setHeader] = React.useState('');
  const [footer, setFooter] = React.useState('Valores à vista no Pix · Consulte parcelamento');
  const [aiItems, setAiItems] = React.useState<ParsedItem[] | null>(null);
  const [aiBusy, setAiBusy] = React.useState<'interpretar' | 'analisar' | null>(null);
  const [aiError, setAiError] = React.useState<string | null>(null);
  const [analysis, setAnalysis] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  // Carrega e salva o trabalho no navegador
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Partial<Saved>;
        if (s.supplierText !== undefined) setSupplierText(s.supplierText);
        if (s.competitorText !== undefined) setCompetitorText(s.competitorText);
        if (s.config) setConfig({ ...DEFAULT_CONFIG, ...s.config });
        if (s.approx !== undefined) setApprox(s.approx);
        if (s.manualCompetitor) setManualCompetitor(s.manualCompetitor);
        if (s.overrides) setOverrides(s.overrides);
        if (s.sectionNames) setSectionNames(s.sectionNames);
        if (s.header !== undefined) setHeader(s.header);
        if (s.footer !== undefined) setFooter(s.footer);
      }
    } catch {
      /* armazenamento indisponível: segue sem salvar */
    }
    setLoaded(true);
  }, []);

  React.useEffect(() => {
    if (!loaded) return;
    const s: Saved = { supplierText, competitorText, config, approx, manualCompetitor, overrides, sectionNames, header, footer };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      /* ignora */
    }
  }, [loaded, supplierText, competitorText, config, approx, manualCompetitor, overrides, sectionNames, header, footer]);

  // Cálculo
  const local = React.useMemo(() => parseSupplierList(supplierText), [supplierText]);
  const items = React.useMemo(() => withStableIds(aiItems ?? local.items), [aiItems, local.items]);
  const competitorItems = React.useMemo(() => parseSupplierList(competitorText).items, [competitorText]);

  const competitor = React.useMemo(() => {
    const auto = matchCompetitor(items, competitorItems, approx);
    const merged: Record<string, CompetitorPrice> = { ...auto };
    for (const [id, price] of Object.entries(manualCompetitor)) merged[id] = { price, exact: true };
    return merged;
  }, [items, competitorItems, approx, manualCompetitor]);

  // Preço digitado à mão vale só enquanto o custo do fornecedor for o mesmo.
  const overrideKey = (i: Pick<ParsedItem, 'id' | 'cost'>) => `${i.id}@${i.cost}`;
  const activeOverrides = React.useMemo(() => {
    const out: Record<string, number> = {};
    for (const i of items) {
      const v = overrides[overrideKey(i)];
      if (v !== undefined) out[i.id] = v;
    }
    return out;
  }, [items, overrides]);

  const rows = React.useMemo(() => analyze(items, config, competitor, activeOverrides), [items, config, competitor, activeOverrides]);
  const summary = React.useMemo(() => summarize(rows), [rows]);
  const displayRows = React.useMemo(
    () => rows.map((r) => ({ ...r, section: sectionNames[r.section]?.trim() || r.section })),
    [rows, sectionNames],
  );
  const shareText = React.useMemo(() => formatShareList(displayRows, { header, footer }), [displayRows, header, footer]);

  // Ações
  const setMap = (setter: React.Dispatch<React.SetStateAction<Record<string, number>>>) => (id: string, v: number | null) =>
    setter((m) => {
      const next = { ...m };
      if (v === null) delete next[id];
      else next[id] = v;
      return next;
    });

  async function callAgent<T>(payload: object): Promise<T> {
    const res = await fetch('/api/agente', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'O agente não respondeu.');
    return data as T;
  }

  async function interpretarComIA() {
    setAiBusy('interpretar');
    setAiError(null);
    try {
      const { items: found } = await callAgent<{ items: ParsedItem[] }>({ action: 'interpretar', text: supplierText });
      if (!found.length) throw new Error('O agente não encontrou aparelhos com preço nessa lista.');
      setAiItems(found);
    } catch (e) {
      setAiError((e as Error).message);
    } finally {
      setAiBusy(null);
    }
  }

  async function pedirAnalise() {
    setAiBusy('analisar');
    setAiError(null);
    setAnalysis(null);
    try {
      const compact = displayRows.map((r) => ({
        secao: r.section, modelo: r.model, armazenamento: r.storage, versao: r.variant, cor: r.color,
        custo: r.cost, preco: r.price, lucro: r.profit, margem: Number(r.marginPct.toFixed(1)),
        concorrente: r.competitor?.price ?? null, situacao: r.status,
      }));
      const { analysis: text } = await callAgent<{ analysis: string }>({
        action: 'analisar',
        rows: compact,
        config: { margemPadrao: config.markupPct, lucroMinimo: config.minProfit, estrategia: config.competitorMode, abaixoDoConcorrente: config.undercut, regras: config.rules },
      });
      setAnalysis(text);
    } catch (e) {
      setAiError((e as Error).message);
    } finally {
      setAiBusy(null);
    }
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      const el = document.getElementById('share-text') as HTMLTextAreaElement | null;
      el?.select();
      document.execCommand('copy');
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function baixarCSV() {
    const blob = new Blob(['﻿' + toCSV(displayRows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `precos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function limpar() {
    setSupplierText('');
    setCompetitorText('');
    setManualCompetitor({});
    setOverrides({});
    setSectionNames({});
    setAiItems(null);
    setAnalysis(null);
  }

  const hasItems = rows.length > 0;

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white">
            <Calculator className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="mr-auto">
            <h1 className="text-lg font-bold text-slate-900">Analisador de Preço · iPhone</h1>
            <p className="text-sm text-slate-600">Cole a lista do fornecedor, compare com o concorrente e gere a lista de venda.</p>
          </div>
          <button type="button" className={btnGhost} onClick={limpar}>
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Limpar tudo
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* 1. Listas */}
          <section aria-labelledby="in-title" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 id="in-title" className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
              <ClipboardPaste className="h-4 w-4 text-blue-700" aria-hidden="true" /> Listas
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <label htmlFor="supplier" className="text-sm font-semibold text-slate-800">Lista do fornecedor</label>
                  <button type="button" className="text-sm font-semibold text-blue-700 underline-offset-2 hover:underline"
                    onClick={() => { setSupplierText(SAMPLE_SUPPLIER_LIST); setCompetitorText(SAMPLE_COMPETITOR_LIST); setAiItems(null); }}>
                    Usar exemplo
                  </button>
                </div>
                <textarea id="supplier" className={textarea} value={supplierText} spellCheck={false}
                  placeholder={'📱 13 | 128GB\n⚫ Preto 💰 1.750\n⚪ Branco 💰 1.800'}
                  onChange={(e) => { setSupplierText(e.target.value); setAiItems(null); }} />
                <p className="mt-2 text-xs text-slate-600" aria-live="polite">
                  {aiItems
                    ? `${aiItems.length} aparelhos lidos pelo agente de IA.`
                    : supplierText.trim()
                      ? `${local.items.length} aparelhos lidos${local.unparsed.length ? ` · ${local.unparsed.length} linhas não entendidas` : ''}.`
                      : 'Cole a lista como veio do WhatsApp — emojis e R$ podem ficar.'}
                </p>
              </div>
              <div>
                <label htmlFor="competitor" className="mb-1 block text-sm font-semibold text-slate-800">
                  Lista do concorrente <span className="font-normal text-slate-600">(opcional)</span>
                </label>
                <textarea id="competitor" className={textarea} value={competitorText} spellCheck={false}
                  placeholder={'📱 18 Pro Max | 256GB\n🔵 Azul 💰 10.300'}
                  onChange={(e) => setCompetitorText(e.target.value)} />
                <p className="mt-2 text-xs text-slate-600">
                  {competitorItems.length
                    ? `${competitorItems.length} preços do concorrente · ${summary.withCompetitor} aparelhos seus com referência.`
                    : 'Também dá para digitar o preço do concorrente direto na tabela.'}
                </p>
              </div>
            </div>

            {!aiItems && local.unparsed.length > 0 && (
              <details className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <summary className="cursor-pointer font-semibold">
                  {local.unparsed.length} linhas não foram entendidas
                </summary>
                <ul className="mt-2 list-disc pl-5 font-mono text-xs">
                  {local.unparsed.slice(0, 30).map((l, i) => <li key={i}>{l}</li>)}
                </ul>
                <p className="mt-2">Se faltar aparelho, use “Interpretar com IA”.</p>
              </details>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" className={btnGhost} disabled={!supplierText.trim() || aiBusy !== null} onClick={interpretarComIA}>
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {aiBusy === 'interpretar' ? 'Lendo a lista…' : 'Interpretar com IA'}
              </button>
              {aiItems && (
                <button type="button" className={btnGhost} onClick={() => setAiItems(null)}>Voltar à leitura automática</button>
              )}
            </div>
            {aiError && (
              <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {aiError}
              </p>
            )}
          </section>

          {/* 2. Resumo */}
          {hasItems && (
            <section aria-label="Resumo" className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: 'Aparelhos', value: String(summary.count) },
                { label: 'Margem média', value: `${summary.avgMarginPct.toFixed(1).replace('.', ',')}%` },
                { label: 'Lucro (1 de cada)', value: formatBRL(summary.totalProfit) },
                {
                  label: 'Abaixo do concorrente',
                  value: summary.withCompetitor ? `${summary.beating} de ${summary.withCompetitor}` : '—',
                  hint: summary.inviable ? `${summary.inviable} não dá para bater` : undefined,
                },
              ].map((c) => (
                <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold text-slate-600">{c.label}</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{c.value}</p>
                  {c.hint && <p className="mt-1 text-xs font-semibold text-red-700">{c.hint}</p>}
                </div>
              ))}
            </section>
          )}

          {/* 3. Tabela */}
          {hasItems && (
            <ResultsTable
              rows={rows}
              sectionNames={sectionNames}
              onRenameSection={(orig, name) => setSectionNames((m) => ({ ...m, [orig]: name }))}
              onCompetitorPrice={setMap(setManualCompetitor)}
              onOverride={(id, v) => {
                const item = items.find((i) => i.id === id);
                if (item) setMap(setOverrides)(overrideKey(item), v);
              }}
              manualCompetitor={manualCompetitor}
            />
          )}

          {/* 4. Agente */}
          {hasItems && (
            <section aria-labelledby="ag-title" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <h2 id="ag-title" className="mr-auto flex items-center gap-2 text-base font-bold text-slate-900">
                  <Bot className="h-4 w-4 text-blue-700" aria-hidden="true" /> Análise do agente
                </h2>
                <button type="button" className={btnPrimary} disabled={aiBusy !== null} onClick={pedirAnalise}>
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  {aiBusy === 'analisar' ? 'Analisando…' : 'Pedir análise'}
                </button>
              </div>
              <div aria-live="polite">
                {analysis ? (
                  <div className="mt-4 whitespace-pre-line rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">{analysis}</div>
                ) : (
                  <p className="mt-3 text-sm text-slate-600">
                    O agente lê a tabela e aponta margens baixas, onde dá para subir o preço e onde não compensa bater o concorrente.
                  </p>
                )}
              </div>
            </section>
          )}

          {/* 5. Lista de venda */}
          {hasItems && (
            <section aria-labelledby="sh-title" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <h2 id="sh-title" className="mr-auto text-base font-bold text-slate-900">Lista para divulgar</h2>
                <button type="button" className={btnGhost} onClick={baixarCSV}>
                  <Download className="h-4 w-4" aria-hidden="true" /> Planilha (CSV)
                </button>
                <button type="button" className={btnPrimary} onClick={copiar}>
                  {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  {copied ? 'Copiado' : 'Copiar lista'}
                </button>
              </div>
              <div className="mb-3 grid gap-3 md:grid-cols-2">
                <div>
                  <label htmlFor="sh-header" className="mb-1 block text-xs font-semibold text-slate-600">Texto do topo</label>
                  <input id="sh-header" value={header} onChange={(e) => setHeader(e.target.value)} placeholder="Ex.: LISTA DE HOJE · Pronta entrega"
                    className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label htmlFor="sh-footer" className="mb-1 block text-xs font-semibold text-slate-600">Texto do rodapé</label>
                  <input id="sh-footer" value={footer} onChange={(e) => setFooter(e.target.value)}
                    className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
              </div>
              <label htmlFor="share-text" className="sr-only">Lista pronta</label>
              <textarea id="share-text" readOnly value={shareText} className={`${textarea} min-h-96`} />
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-6">
          <ConfigPanel config={config} onChange={setConfig} approxMatch={approx} onApproxChange={setApprox} />
          <p className="px-1 text-xs leading-relaxed text-slate-600">
            Os preços são calculados aqui mesmo, sem IA: margem sobre o custo, regra do modelo, arredondamento e lucro
            mínimo. O agente só lê listas difíceis e comenta a tabela. Margens abaixo de ~10% costumam sumir no cartão
            parcelado.
          </p>
        </aside>
      </main>
    </div>
  );
}
