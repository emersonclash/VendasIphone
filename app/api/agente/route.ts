/**
 * Agente de preço (Gemini).
 *
 *   POST { action: "interpretar", text }  → { items }   lista bagunçada → itens estruturados
 *   POST { action: "analisar", rows, config } → { analysis }  comentário sobre a tabela calculada
 *
 * O Gemini nunca define o preço: ele só lê listas e comenta números que o
 * motor (lib/pricing/engine.ts) já calculou.
 */
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import type { ParsedItem } from '@/lib/pricing/parser';

export const runtime = 'nodejs';

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const MAX_TEXT = 30_000;
const MAX_ROWS = 300;

function client(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY') return null;
  return new GoogleGenAI({ apiKey: key });
}

function textOf(res: unknown): string {
  const t = (res as { text?: unknown }).text;
  return typeof t === 'function' ? String((t as () => string)()) : String(t ?? '');
}

const ITEM_SCHEMA = {
  type: 'OBJECT',
  properties: {
    items: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          section: { type: 'STRING', description: 'Título da seção da lista, ex.: "Seminovos americanos". Vazio se não houver.' },
          model: { type: 'STRING', description: 'Modelo no formato "iPhone 17 Pro Max".' },
          storage: { type: 'STRING', description: 'Armazenamento no formato "256GB" ou "1TB".' },
          variant: { type: 'STRING', description: 'Versão/origem, ex.: "eSIM · Dubai", "Indiano · chip físico + eSIM", "LL/A". Vazio se não houver.' },
          notes: { type: 'STRING', description: 'Observações do aparelho, ex.: "Bateria 100%". Vazio se não houver.' },
          color: { type: 'STRING', description: 'Cor em português, primeira letra maiúscula (Preto, Branco, Azul, Laranja, Prata...).' },
          cost: { type: 'NUMBER', description: 'Preço em reais, só o número (1.450 → 1450).' },
        },
        required: ['section', 'model', 'storage', 'variant', 'notes', 'color', 'cost'],
      },
    },
  },
  required: ['items'],
};

const PARSE_INSTRUCTIONS = `Você extrai listas de preço de iPhones enviadas por fornecedores no WhatsApp.
Cada linha de cor com preço vira um item; o modelo, armazenamento e versão vêm do cabeçalho mais próximo acima.
Regras:
- Não invente aparelhos, cores ou preços. Se uma linha não tiver preço, ignore.
- Traduza cores para português (Orange → Laranja, Silver → Prata, Rose → Rosa).
- "ESIM" → "eSIM"; "CHIP FISICO CHIP VIRTUAL" → "chip físico + eSIM"; "DIBAI" → "Dubai"; "LL A" → "LL/A".
- Preços estão em reais: "1.450", "R$14500" e "14.500,00" são números inteiros de reais.`;

const ANALYSIS_INSTRUCTIONS = `Você é um analista de preços de uma revenda de iPhones no Brasil.
Recebe uma tabela já calculada (custo do fornecedor, preço sugerido, lucro, margem e, quando houver, o preço do concorrente).
Escreva em português do Brasil, em até 8 tópicos curtos, começando cada um com "- ":
- onde a margem está baixa ou o lucro em reais é pequeno demais para cobrir garantia/defeito;
- onde dá para subir o preço porque está bem abaixo do concorrente;
- onde não dá para bater o concorrente com o lucro mínimo;
- distorções (cores do mesmo modelo com preços muito diferentes, modelo mais novo mais barato que o antigo).
Use só os números da tabela, cite modelo, armazenamento e cor, e não invente preços de mercado.
Lembre que margem abaixo de ~10% costuma sumir com taxa de cartão parcelado.`;

export async function POST(req: Request) {
  let body: { action?: string; text?: string; rows?: unknown[]; config?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 });
  }

  const ai = client();
  if (!ai) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY não configurada. O cálculo de preços funciona sem ela; só o agente de IA fica desligado.' },
      { status: 503 },
    );
  }

  try {
    if (body.action === 'interpretar') {
      const text = String(body.text ?? '').slice(0, MAX_TEXT);
      if (!text.trim()) return NextResponse.json({ error: 'Cole uma lista primeiro.' }, { status: 400 });
      const res = await ai.models.generateContent({
        model: MODEL,
        contents: `Lista do fornecedor:\n\n${text}`,
        config: {
          systemInstruction: PARSE_INSTRUCTIONS,
          responseMimeType: 'application/json',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          responseSchema: ITEM_SCHEMA as any,
          temperature: 0,
        },
      });
      const parsed = JSON.parse(textOf(res) || '{"items":[]}') as { items?: Partial<ParsedItem>[] };
      const items: ParsedItem[] = (parsed.items ?? [])
        .map((i, idx) => ({
          id: `ia-${idx + 1}`,
          section: String(i.section ?? '').trim() || 'Lista',
          model: String(i.model ?? '').trim(),
          storage: String(i.storage ?? '').trim().toUpperCase().replace(/\s+/g, ''),
          variant: String(i.variant ?? '').trim(),
          notes: String(i.notes ?? '').trim(),
          color: String(i.color ?? '').trim(),
          cost: Math.round(Number(i.cost)),
        }))
        .filter((i) => i.model && i.color && Number.isFinite(i.cost) && i.cost >= 100);
      return NextResponse.json({ items });
    }

    if (body.action === 'analisar') {
      const rows = Array.isArray(body.rows) ? body.rows.slice(0, MAX_ROWS) : [];
      if (!rows.length) return NextResponse.json({ error: 'Nada para analisar.' }, { status: 400 });
      const res = await ai.models.generateContent({
        model: MODEL,
        contents: `Configuração usada:\n${JSON.stringify(body.config)}\n\nTabela (JSON):\n${JSON.stringify(rows)}`,
        config: { systemInstruction: ANALYSIS_INSTRUCTIONS, temperature: 0.3 },
      });
      return NextResponse.json({ analysis: textOf(res).trim() });
    }

    return NextResponse.json({ error: 'Ação desconhecida.' }, { status: 400 });
  } catch (err) {
    console.error('[agente]', err);
    return NextResponse.json({ error: 'O agente não respondeu. Tente de novo em instantes.' }, { status: 502 });
  }
}
