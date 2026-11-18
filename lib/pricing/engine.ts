/**
 * Motor de preço: margem sobre o custo, regras por modelo, arredondamento,
 * lucro mínimo e comparação com o preço do concorrente.
 * Tudo aqui é cálculo determinístico — a IA nunca decide o preço.
 */
import { itemKey, normalize, type ParsedItem } from './parser.ts';

export type Rounding = 'centena' | 'final90' | 'cinquenta' | 'nenhum';
export type CompetitorMode = 'bater' | 'igualar' | 'ignorar';

export type PricingRule = {
  id: string;
  /**
   * Termos separados por vírgula. Um número casa com a geração ("13"),
   * um texto casa com modelo, armazenamento, versão ou seção ("pro max", "dubai").
   */
  match: string;
  /** Margem própria da regra; vazio = usa a margem padrão. */
  markupPct: number | null;
  /** Valor fixo somado depois da margem (ex.: +100). */
  addValue: number;
};

export type PricingConfig = {
  markupPct: number;
  rounding: Rounding;
  /** Lucro mínimo em reais por aparelho. */
  minProfit: number;
  rules: PricingRule[];
  competitorMode: CompetitorMode;
  /** Quanto ficar abaixo do concorrente quando o modo é "bater". */
  undercut: number;
};

export const DEFAULT_CONFIG: PricingConfig = {
  markupPct: 13.5,
  rounding: 'centena',
  minProfit: 150,
  rules: [{ id: 'r1', match: '12, 13, 14', markupPct: 22, addValue: 100 }],
  competitorMode: 'bater',
  undercut: 100,
};

export type CompetitorPrice = { price: number; exact: boolean };

export type RowStatus =
  | 'sem_referencia'
  | 'competitivo'
  | 'empatado'
  | 'ajustado'
  | 'inviavel'
  | 'acima';

export type AnalyzedRow = ParsedItem & {
  rule: PricingRule | null;
  markupPct: number;
  /** Preço pela margem, antes de olhar o concorrente. */
  basePrice: number;
  price: number;
  profit: number;
  /** Lucro sobre o custo, em %. */
  marginPct: number;
  competitor: CompetitorPrice | null;
  /** Preço − concorrente (negativo = mais barato). */
  diff: number | null;
  status: RowStatus;
  overridden: boolean;
};

// ---------------------------------------------------------------------------
// Arredondamento
// ---------------------------------------------------------------------------

type Dir = 'nearest' | 'down' | 'up';

export function roundPrice(v: number, mode: Rounding, dir: Dir = 'nearest'): number {
  const f = dir === 'down' ? Math.floor : dir === 'up' ? Math.ceil : Math.round;
  switch (mode) {
    case 'centena':
      return f(v / 100) * 100;
    case 'cinquenta':
      return f(v / 50) * 50;
    case 'final90':
      // 2.090, 2.190… — o "−10" é aplicado sobre a centena
      return f((v + 10) / 100) * 100 - 10;
    default:
      return dir === 'nearest' ? Math.round(v) : f(v);
  }
}

// ---------------------------------------------------------------------------
// Regras
// ---------------------------------------------------------------------------

function generationOf(model: string): string | null {
  const m = model.match(/(\d{2})/);
  return m ? m[1] : null;
}

export function ruleMatches(rule: PricingRule, item: ParsedItem): boolean {
  const terms = rule.match
    .split(/[,;]/)
    .map((t) => normalize(t))
    .filter(Boolean);
  if (!terms.length) return false;
  const gen = generationOf(item.model);
  const hay = normalize(`${item.model} ${item.storage} ${item.variant} ${item.section} ${item.notes}`);
  return terms.some((t) => {
    if (/^\d{2}$/.test(t)) return gen === t;
    if (/^\d{2}\s*[-a]\s*\d{2}$/.test(t)) {
      // Intervalo "12-14" ou "12 a 14"
      const [a, b] = t.split(/\s*[-a]\s*/).map(Number);
      return gen !== null && Number(gen) >= a && Number(gen) <= b;
    }
    return new RegExp(`(^|\\s)${t.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}(\\s|$)`).test(hay);
  });
}

// ---------------------------------------------------------------------------
// Concorrente
// ---------------------------------------------------------------------------

/**
 * Casa cada item com a lista do concorrente: primeiro pelo mesmo modelo,
 * armazenamento, cor e versão; depois sem a versão; por último só modelo
 * e armazenamento (menor preço, marcado como aproximado).
 */
export function matchCompetitor(
  items: ParsedItem[],
  competitor: ParsedItem[],
  allowApprox = true,
): Record<string, CompetitorPrice> {
  const withVariant = new Map<string, number>();
  const noVariant = new Map<string, number>();
  const noColor = new Map<string, number>();
  const keep = (m: Map<string, number>, k: string, v: number) => m.set(k, Math.min(v, m.get(k) ?? Infinity));
  for (const c of competitor) {
    keep(withVariant, itemKey(c, c.variant), c.cost);
    keep(noVariant, itemKey(c), c.cost);
    keep(noColor, `${normalize(c.model)}|${normalize(c.storage)}`, c.cost);
  }
  const out: Record<string, CompetitorPrice> = {};
  for (const i of items) {
    const a = withVariant.get(itemKey(i, i.variant));
    if (a !== undefined) { out[i.id] = { price: a, exact: true }; continue; }
    const b = noVariant.get(itemKey(i));
    if (b !== undefined) { out[i.id] = { price: b, exact: true }; continue; }
    if (!allowApprox) continue;
    const c = noColor.get(`${normalize(i.model)}|${normalize(i.storage)}`);
    if (c !== undefined) out[i.id] = { price: c, exact: false };
  }
  return out;
}

// ---------------------------------------------------------------------------
// Análise
// ---------------------------------------------------------------------------

export function analyze(
  items: ParsedItem[],
  config: PricingConfig,
  competitor: Record<string, CompetitorPrice> = {},
  overrides: Record<string, number> = {},
): AnalyzedRow[] {
  return items.map((item) => {
    const rule = config.rules.find((r) => ruleMatches(r, item)) ?? null;
    const markupPct = rule?.markupPct ?? config.markupPct;
    const raw = item.cost * (1 + markupPct / 100) + (rule?.addValue ?? 0);
    const floor = roundPrice(item.cost + config.minProfit, config.rounding, 'up');
    const basePrice = Math.max(roundPrice(raw, config.rounding), floor);

    const comp = config.competitorMode === 'ignorar' ? null : competitor[item.id] ?? null;
    let price = basePrice;
    let status: RowStatus = 'sem_referencia';

    if (comp) {
      const target = config.competitorMode === 'bater' ? comp.price - config.undercut : comp.price;
      const targetRounded = roundPrice(target, config.rounding, 'down');
      if (basePrice > targetRounded) {
        if (targetRounded >= floor) {
          price = targetRounded;
          status = 'ajustado';
        } else {
          price = floor;
          status = 'inviavel';
        }
      }
    }

    const overridden = overrides[item.id] !== undefined && Number.isFinite(overrides[item.id]);
    if (overridden) price = overrides[item.id];

    if (comp && (overridden || status !== 'inviavel')) {
      if (price < comp.price) status = !overridden && price < basePrice ? 'ajustado' : 'competitivo';
      else if (price === comp.price) status = 'empatado';
      else status = 'acima';
    }

    const profit = price - item.cost;
    return {
      ...item,
      rule,
      markupPct,
      basePrice,
      price,
      profit,
      marginPct: item.cost > 0 ? (profit / item.cost) * 100 : 0,
      competitor: comp,
      diff: comp ? price - comp.price : null,
      status,
      overridden,
    };
  });
}

export type Summary = {
  count: number;
  totalCost: number;
  totalProfit: number;
  avgMarginPct: number;
  minProfit: AnalyzedRow | null;
  withCompetitor: number;
  beating: number;
  inviable: number;
};

export function summarize(rows: AnalyzedRow[]): Summary {
  const totalCost = rows.reduce((s, r) => s + r.cost, 0);
  const totalProfit = rows.reduce((s, r) => s + r.profit, 0);
  const withCompetitor = rows.filter((r) => r.competitor);
  return {
    count: rows.length,
    totalCost,
    totalProfit,
    avgMarginPct: totalCost ? (totalProfit / totalCost) * 100 : 0,
    minProfit: rows.reduce<AnalyzedRow | null>((m, r) => (!m || r.profit < m.profit ? r : m), null),
    withCompetitor: withCompetitor.length,
    beating: withCompetitor.filter((r) => r.competitor && r.price < r.competitor.price).length,
    inviable: rows.filter((r) => r.status === 'inviavel').length,
  };
}

// ---------------------------------------------------------------------------
// Saída
// ---------------------------------------------------------------------------

export function formatBRL(v: number): string {
  return 'R$ ' + Math.round(v).toLocaleString('pt-BR');
}

const COLOR_EMOJI: Record<string, string> = {
  Preto: '⚫', Branco: '⚪', Azul: '🔵', Verde: '🟢', Rosa: '🩷', Roxo: '🟣', Lilás: '🟣',
  Vermelho: '🔴', Amarelo: '🟡', Dourado: '🟡', Prata: '🩶', Cinza: '🩶', Natural: '🩶',
  Desert: '🟤', Laranja: '🟠',
};

export type ShareOptions = { header?: string; footer?: string; showSections?: boolean };

/** Lista pronta para colar no WhatsApp/Instagram, no mesmo estilo da lista do fornecedor. */
export function formatShareList(rows: AnalyzedRow[], opts: ShareOptions = {}): string {
  const out: string[] = [];
  if (opts.header?.trim()) out.push(opts.header.trim(), '');
  let lastSection = '';
  let lastGroup = '';
  for (const r of rows) {
    if (opts.showSections !== false && r.section !== lastSection) {
      if (out.length && out[out.length - 1] !== '') out.push('');
      out.push('━━━━━━━━━━━━━━', r.section.toUpperCase(), '━━━━━━━━━━━━━━', '');
      lastSection = r.section;
      lastGroup = '';
    }
    const group = `${r.model}|${r.storage}|${r.variant}|${r.notes}`;
    if (group !== lastGroup) {
      if (lastGroup) out.push('');
      const extra = [r.variant, r.notes].filter(Boolean).join(' · ');
      out.push(`📱 ${r.model} | ${r.storage}${extra ? ` | ${extra}` : ''}`);
      lastGroup = group;
    }
    out.push(`${COLOR_EMOJI[r.color] ?? '▫️'} ${r.color} 💰 ${formatBRL(r.price)}`);
  }
  if (opts.footer?.trim()) out.push('', opts.footer.trim());
  return out.join('\n');
}

export function toCSV(rows: AnalyzedRow[]): string {
  const head = ['Seção', 'Modelo', 'Armazenamento', 'Versão', 'Obs', 'Cor', 'Custo', 'Preço', 'Lucro', 'Margem %', 'Concorrente', 'Diferença', 'Status'];
  const esc = (v: string | number) => {
    const s = String(v);
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = rows.map((r) =>
    [r.section, r.model, r.storage, r.variant, r.notes, r.color, r.cost, r.price, r.profit, r.marginPct.toFixed(1).replace('.', ','), r.competitor?.price ?? '', r.diff ?? '', STATUS_LABEL[r.status]]
      .map(esc)
      .join(';'),
  );
  // ";" e vírgula decimal abrem direto no Excel em português
  return [head.join(';'), ...lines].join('\n');
}

export const STATUS_LABEL: Record<RowStatus, string> = {
  sem_referencia: 'Sem concorrente',
  competitivo: 'Mais barato',
  empatado: 'Empatado',
  ajustado: 'Ajustado p/ bater',
  inviavel: 'Não dá p/ bater',
  acima: 'Mais caro',
};
