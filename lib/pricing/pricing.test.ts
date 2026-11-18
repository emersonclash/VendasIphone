/**
 * Testes da lógica de preço (sem dependências).
 * Rodar: npm test   (usa node --experimental-strip-types, Node 22+)
 */
import { parseSupplierList, parseBRL } from './parser.ts';
import { analyze, DEFAULT_CONFIG, matchCompetitor, roundPrice, formatShareList, type PricingConfig } from './engine.ts';
import { SAMPLE_SUPPLIER_LIST } from './sample.ts';

let failed = 0;
function check(cond: boolean, msg: string) {
  if (cond) console.log(`  ✓ ${msg}`);
  else {
    failed += 1;
    console.error(`  ✗ ${msg}`);
  }
}

console.log('Leitura da lista do fornecedor');
const { items, unparsed } = parseSupplierList(SAMPLE_SUPPLIER_LIST);
check(items.length === 68, `68 aparelhos lidos (leu ${items.length})`);
check(unparsed.length === 0, `nenhuma linha perdida (${unparsed.join(' / ')})`);
const find = (model: string, storage: string, color: string, variant = '') =>
  items.find((i) => i.model === model && i.storage === storage && i.color === color && i.variant.includes(variant));
check(find('iPhone 12', '128GB', 'Lilás')?.notes === 'Bateria 100%', 'iPhone 12 com "Bateria 100%"');
check(find('iPhone 17 Pro Max', '256GB', 'Laranja', 'eSIM')?.cost === 7300, 'linha colada "5.150   17 pro Max 256 esim" separada');
check(find('iPhone 17 Pro Max', '512GB', 'Prata', 'LL/A')?.cost === 8750, 'Silver → Prata, "LL A" → LL/A');
check(find('iPhone 17 Pro', '256GB', 'Laranja', 'Dubai')?.cost === 6950, '"ESIM DIBAI" → eSIM · Dubai');
check(find('iPhone 17', '256GB', 'Branco', 'Japonês')?.cost === 5450, 'preço na linha de cima da cor (Japonês)');
check(find('iPhone 15', '128GB', 'Rosa', 'Americano')?.cost === 4050, '"ROSE" → Rosa, chip físico americano');
check(find('iPhone Duo', '256GB', 'Branco')?.cost === 14700, 'iPhone Duo');
check(find('iPhone 15', '128GB', 'Preto')?.section === 'Seminovos americanos', 'seção "Seminovos americanos"');
check(parseBRL('R$ 9.750,00') === 9750 && parseBRL('14500') === 14500 && parseBRL('1.450') === 1450, 'formatos de preço em reais');

console.log('Preço');
check(roundPrice(2072, 'final90') === 2090, 'final 90');
check(roundPrice(10271, 'centena', 'down') === 10200, 'centena para baixo');
const competitor = parseSupplierList('📱 18 Pro Max | 256GB\n🔵 Azul 💰 10.300\n\n📱 13 | 128GB\n⚫ Preto 💰 1.900').items;
const rows = analyze(items, DEFAULT_CONFIG, matchCompetitor(items, competitor, false));
const row = (m: string, s: string, c: string) => rows.find((r) => r.model === m && r.storage === s && r.color === c)!;
check(row('iPhone 18 Pro Max', '256GB', 'Azul').price === 10200, '18 Pro Max Azul fica R$ 100 abaixo do concorrente (10.200)');
check(row('iPhone 18 Pro Max', '256GB', 'Azul').status === 'ajustado', '…e aparece como "Ajustado p/ bater"');
check(row('iPhone 12', '128GB', 'Lilás').price === 1900, 'regra 12–14: 22% + R$ 100 → 1.900');
check(row('iPhone 14 Pro Max', '256GB', 'Preto').price === 4300, '14 Pro Max → 4.300');
check(row('iPhone 13', '128GB', 'Preto').status === 'inviavel', 'concorrente abaixo do lucro mínimo → "Não dá p/ bater"');
check(row('iPhone 13', '128GB', 'Verde').competitor === null, 'sem casamento aproximado quando desligado');
check(rows.every((r) => r.profit >= DEFAULT_CONFIG.minProfit), 'todo aparelho respeita o lucro mínimo');

const igualar: PricingConfig = { ...DEFAULT_CONFIG, competitorMode: 'igualar' };
const r2 = analyze(items, igualar, matchCompetitor(items, competitor));
check(r2.find((r) => r.model === 'iPhone 18 Pro Max' && r.color === 'Azul')!.status === 'empatado', 'modo igualar → empatado');

const manual = analyze(items, DEFAULT_CONFIG, {}, { [row('iPhone 12', '128GB', 'Lilás').id]: 2000 });
check(manual.find((r) => r.model === 'iPhone 12' && r.color === 'Lilás')!.price === 2000, 'preço digitado à mão prevalece');

const share = formatShareList(rows, { header: 'LISTA DE HOJE' });
check(share.startsWith('LISTA DE HOJE') && share.includes('🔵 Azul 💰 R$ 10.200'), 'lista para divulgar');

if (failed) {
  console.error(`\n${failed} teste(s) falharam`);
  process.exit(1);
}
console.log('\nTudo certo.');
