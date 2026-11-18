/**
 * Interpreta listas de preço de fornecedores no formato usado em grupos de
 * WhatsApp (emojis, cabeçalhos de modelo, uma cor por linha, preço com 💰 ou R$).
 *
 * Funciona sem IA. Para listas muito fora do padrão, a rota /api/agente
 * oferece a interpretação com Gemini, que devolve o mesmo formato de item.
 */

export type ParsedItem = {
  id: string;
  /** Seção da lista (ex.: "Seminovos americanos"). */
  section: string;
  /** Modelo normalizado (ex.: "iPhone 17 Pro Max"). */
  model: string;
  /** Armazenamento normalizado (ex.: "256GB", "1TB"). */
  storage: string;
  /** Versão / origem (ex.: "eSIM Dubai", "Indiano · chip físico + eSIM"). */
  variant: string;
  /** Observações do modelo (ex.: "Bateria 100%"). */
  notes: string;
  color: string;
  /** Preço que o fornecedor cobra, em reais. */
  cost: number;
};

export type ParseResult = {
  items: ParsedItem[];
  /** Linhas que não foram entendidas (para mostrar ao usuário). */
  unparsed: string[];
};

// ---------------------------------------------------------------------------
// Dicionários
// ---------------------------------------------------------------------------

/** Cor canônica em português → sinônimos aceitos (já normalizados). */
const COLOR_SYNONYMS: Record<string, string[]> = {
  Preto: ['preto', 'black', 'meia noite', 'meia-noite', 'midnight', 'grafite', 'graphite', 'space black', 'titanio preto', 'black titanium'],
  Branco: ['branco', 'white', 'estelar', 'starlight', 'titanio branco', 'white titanium'],
  Azul: ['azul', 'blue', 'azul sierra', 'sierra blue', 'azul pacifico', 'pacific blue', 'titanio azul', 'blue titanium', 'deep blue', 'azul profundo', 'ultramarino', 'ultramarine', 'teal', 'verde-azulado'],
  Verde: ['verde', 'green', 'verde alpino', 'alpine green', 'verde meia noite', 'sage'],
  Rosa: ['rosa', 'pink', 'rose', 'rose gold', 'ouro rosa'],
  Roxo: ['roxo', 'purple', 'roxo profundo', 'deep purple'],
  Lilás: ['lilas', 'lavanda', 'lavender', 'lilac', 'mist blue'],
  Vermelho: ['vermelho', 'red', 'product red', '(product)red'],
  Amarelo: ['amarelo', 'yellow'],
  Dourado: ['dourado', 'gold', 'ouro', 'light gold'],
  Prata: ['prata', 'silver', 'prateado'],
  Cinza: ['cinza', 'gray', 'grey', 'cinza espacial', 'space gray', 'space grey'],
  Natural: ['natural', 'titanio natural', 'natural titanium'],
  Desert: ['desert', 'deserto', 'titanio deserto', 'desert titanium'],
  Laranja: ['laranja', 'orange', 'laranja cosmico', 'cosmic orange'],
};

const COLOR_LOOKUP: Map<string, string> = (() => {
  const map = new Map<string, string>();
  for (const [canon, syns] of Object.entries(COLOR_SYNONYMS)) {
    map.set(normalize(canon), canon);
    for (const s of syns) map.set(normalize(s), canon);
  }
  return map;
})();

const STORAGE_GB = new Set([32, 64, 128, 256, 512]);

const SECTION_WORDS = /\b(seminov\w*|lacrad\w*|novos?|usados?|vitrine|recondicionad\w*|swap|cpo|outlet|promo\w*|ofertas?)\b/;
const NOTE_WORDS = /\b(garantia|somente aparelho|so aparelho|sem caixa|com caixa|acompanha|nota fiscal|nf)\b/;

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

/** Minúsculas, sem acentos, sem emojis e com espaços simples. */
export function normalize(s: string): string {
  return stripEmoji(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[*_~]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Remove emojis, seletores de variação e símbolos decorativos. */
export function stripEmoji(s: string): string {
  return s
    .replace(/[\p{Extended_Pictographic}\p{Regional_Indicator}‍️⃣]/gu, ' ')
    .replace(/[━─—–=•·|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Interpreta "1.450", "R$ 9.750,00", "14500", "8 650" → número em reais. */
export function parseBRL(token: string): number | null {
  let t = token.replace(/r\$/i, '').replace(/\s/g, '').trim();
  if (!t) return null;
  // Remove centavos ",00" / ",90"
  t = t.replace(/,(\d{1,2})$/, '');
  // Separadores de milhar: ponto ou vírgula seguidos de 3 dígitos
  if (/^\d{1,3}([.,]\d{3})+$/.test(t)) t = t.replace(/[.,]/g, '');
  if (!/^\d+$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function titleCase(s: string): string {
  return s.replace(/\p{L}+/gu, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

/** Divide linhas que o WhatsApp/colagem juntou (ex.: "💰 5.150     17 pro Max 256"). */
function splitJoinedLines(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.replace(/\r/g, '').split('\n')) {
    // Antes de marcadores de cabeçalho que aparecem no meio da linha
    let line = raw.replace(/(\S)\s*(〽️?|📱)(?=\s*\S)/gu, (m, a, b) => `${a}\n${b}`);
    // Antes de um modelo que vem depois de 3+ espaços (ex.: preço + "17 pro Max 256")
    line = line.replace(/\s{3,}(?=(?:iphone\s*)?\d{2}\s*(?:e\b|pro|plus|max|mini|air|(?:64|128|256|512|1\s*tb)\b))/giu, '\n');
    out.push(...line.split('\n'));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Reconhecimento de partes da linha
// ---------------------------------------------------------------------------

type ModelHeader = { model: string; storage: string; tail: string };

/**
 * Cabeçalho de modelo: "13 | 128GB", "IPHONE 17 PRO MAX 512GB", "iPhone Duo 256GB",
 * "17 pro Max 256 esim", "16e 128GB". Exige o armazenamento para não confundir
 * com uma linha de preço.
 */
function matchModelHeader(norm: string): ModelHeader | null {
  const re = /^(?:apple\s+)?(?:iphone\s*)?(\d{2}|duo|air|se|fold|flip)(e)?\b\s*((?:pro\s*max|pro|plus|max|mini|air|ultra|fold)\b)?\s*[-/]*\s*(\d{1,4})\s*(gb|tb)?\b(.*)$/;
  const m = norm.match(re);
  if (!m) return null;
  const [, gen, eSuffix, kind, sizeRaw, unit, tail] = m;
  const size = Number(sizeRaw);
  let storage: string;
  if (unit === 'tb' || (!unit && (size === 1 || size === 2))) storage = `${size}TB`;
  else if (STORAGE_GB.has(size)) storage = `${size}GB`;
  else return null;
  if (/^\d{2}$/.test(gen) && (Number(gen) < 6 || Number(gen) > 30)) return null;

  const genLabel = /^\d+$/.test(gen) ? gen + (eSuffix ? 'e' : '') : titleCase(gen);
  const kindLabel = kind ? ' ' + titleCase(kind.replace(/\s+/g, ' ')) : '';
  return { model: `iPhone ${genLabel}${kindLabel}`, storage, tail: tail.trim() };
}

/** Converte palavras de versão/origem em um rótulo curto. */
function describeVariant(normText: string): { variant: string[]; notes: string[] } {
  const variant: string[] = [];
  const notes: string[] = [];
  let t = ` ${normText} `;

  const battery = t.match(/bateria\s*(\d{2,3})\s*%?/);
  if (battery) {
    notes.push(`Bateria ${battery[1]}%`);
    t = t.replace(battery[0], ' ');
  }
  const origins: [RegExp, string][] = [
    [/\b(americano|americana|eua|usa|us)\b/, 'Americano'],
    [/\b(dubai|dibai|emirados)\b/, 'Dubai'],
    [/\b(japones|japonesa|japao|jp)\b/, 'Japonês'],
    [/\b(indiano|indiana|india)\b/, 'Indiano'],
    [/\b(chines|chinesa|china|hk|hong kong)\b/, 'Chinês'],
    [/\b(europeu|europeia|europa)\b/, 'Europeu'],
    [/\b(brasileiro|nacional|anatel)\b/, 'Nacional'],
    [/\bll\s*\/?\s*a\b/, 'LL/A'],
  ];
  for (const [re, label] of origins) if (re.test(t)) variant.push(label);

  const physical = /\b(\d\s*)?chip\s*fisico\b/.test(t);
  const virtual = /\b(esim|e-sim|chip\s*virtual)\b/.test(t);
  if (physical && virtual) variant.push('chip físico + eSIM');
  else if (virtual) variant.unshift('eSIM');
  else if (physical) variant.push('chip físico');

  return { variant, notes };
}

function isVariantLine(norm: string): boolean {
  return /\b(esim|e-sim|chip|americano|dubai|dibai|japones|indiano|ll\s*\/?\s*a|europeu|chines|nacional|anatel|bateria)\b/.test(norm);
}

/** Procura uma cor conhecida no texto; devolve o nome canônico. */
export function findColor(norm: string): string | null {
  const t = norm.replace(/[^a-z0-9()\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!t) return null;
  if (COLOR_LOOKUP.has(t)) return COLOR_LOOKUP.get(t)!;
  // Frases mais longas primeiro ("titanio natural" antes de "natural")
  const keys = [...COLOR_LOOKUP.keys()].sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (new RegExp(`(^|\\s)${k.replace(/[()]/g, '\\$&')}(\\s|$)`).test(t)) return COLOR_LOOKUP.get(k)!;
  }
  return null;
}

/** Acha um preço na linha (≥ R$ 100). Devolve o número e o texto sem ele. */
function extractPrice(raw: string): { price: number; rest: string } | null {
  const re = /(?:💰\s*)?(?:r\$\s*)?(\d{1,3}(?:[.\s]\d{3})+(?:,\d{2})?|\d{3,6}(?:,\d{2})?)(?!\s*(?:gb|tb|%))/giu;
  let best: { price: number; index: number; len: number } | null = null;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    const value = parseBRL(m[1]);
    if (value === null || value < 100) continue;
    const hasMarker = /💰|r\$/iu.test(m[0]);
    // Preferimos o número com 💰/R$; senão, o último número da linha.
    if (!best || hasMarker || m.index > best.index) {
      best = { price: value, index: m.index, len: m[0].length };
      if (hasMarker) break;
    }
  }
  if (!best) return null;
  const rest = (raw.slice(0, best.index) + ' ' + raw.slice(best.index + best.len)).replace(/💰/gu, ' ');
  return { price: best.price, rest };
}

function emojiPrefix(raw: string): string {
  const m = raw.match(/^[^\p{L}\p{N}]*/u);
  return (m ? m[0] : '').replace(/[\s️]/g, '');
}

// ---------------------------------------------------------------------------
// Parser principal
// ---------------------------------------------------------------------------

export function parseSupplierList(text: string): ParseResult {
  const items: ParsedItem[] = [];
  const unparsed: string[] = [];

  let section = '';
  let listIndex = 1;
  let lastPrefix: string | null = null;
  let current: { model: string; storage: string; variant: string[]; notes: string[] } | null = null;
  let pendingPrice: number | null = null;

  const sectionLabel = () => section || (listIndex > 1 ? `Lista ${listIndex}` : 'Lista');

  const pushItem = (color: string, cost: number) => {
    if (!current) return;
    items.push({
      id: `${items.length + 1}`,
      section: sectionLabel(),
      model: current.model,
      storage: current.storage,
      variant: current.variant.join(' · '),
      notes: current.notes.join(' · '),
      color,
      cost,
    });
  };

  for (const raw of splitJoinedLines(text)) {
    const norm = normalize(raw);
    if (!norm || /^[-_.\s]+$/.test(norm)) continue;

    // 1. Cabeçalho de modelo
    const header = matchModelHeader(norm);
    if (header) {
      const prefix = emojiPrefix(raw);
      // Mudança no estilo do cabeçalho = provavelmente outra lista colada junto.
      if (lastPrefix !== null && prefix !== lastPrefix) {
        listIndex += 1;
        section = '';
      }
      lastPrefix = prefix;
      const { variant, notes } = describeVariant(header.tail);
      current = { model: header.model, storage: header.storage, variant, notes };
      pendingPrice = null;
      // Tudo na mesma linha: "iPhone 13 128GB Preto R$ 2.100" / "15 Pro 256 azul 3500"
      const inline = extractPrice(header.tail);
      if (inline) {
        const color = findColor(normalize(inline.rest));
        if (color) pushItem(color, inline.price);
        else pendingPrice = inline.price;
      }
      continue;
    }

    // 2. Linha com preço (com ou sem cor)
    const priced = extractPrice(raw);
    if (priced && current) {
      const color = findColor(normalize(priced.rest));
      if (color) pushItem(color, priced.price);
      else if (!normalize(priced.rest)) pendingPrice = priced.price;
      else {
        // Cor fora do dicionário: aceita o texto como veio.
        const label = titleCase(stripEmoji(priced.rest).replace(/r\$/gi, '').trim());
        if (label && label.length <= 24 && !isVariantLine(normalize(label))) pushItem(label, priced.price);
        else unparsed.push(raw.trim());
      }
      continue;
    }

    // 3. Só a cor, depois de um preço sozinho ("💰R$5450" + "💠BRANCO")
    const onlyColor = findColor(norm);
    if (onlyColor && pendingPrice !== null && current && norm.split(' ').length <= 3) {
      pushItem(onlyColor, pendingPrice);
      pendingPrice = null;
      continue;
    }

    // 4. Versão / origem logo abaixo do modelo ("ESIM AMERICANO", "CHIP FISICO")
    if (current && isVariantLine(norm)) {
      const { variant, notes } = describeVariant(norm);
      for (const v of variant) if (!current.variant.includes(v)) current.variant.push(v);
      for (const n of notes) if (!current.notes.includes(n)) current.notes.push(n);
      continue;
    }

    // 5. Título de seção / observações gerais
    if (SECTION_WORDS.test(norm) && !priced) {
      section = stripEmoji(raw).replace(/[*_~:]+/g, ' ').replace(/\s+/g, ' ').trim();
      section = section.charAt(0) + section.slice(1).toLowerCase();
      current = null;
      pendingPrice = null;
      continue;
    }
    if (NOTE_WORDS.test(norm)) continue;

    unparsed.push(raw.trim());
  }

  return { items, unparsed };
}

/** Chave para casar o mesmo aparelho em listas diferentes. */
export function itemKey(i: Pick<ParsedItem, 'model' | 'storage' | 'color'>, variant?: string): string {
  const base = `${normalize(i.model)}|${normalize(i.storage)}|${normalize(i.color)}`;
  return variant === undefined ? base : `${base}|${normalize(variant)}`;
}
