# Analisador de Preço · iPhone

Agente para revenda de iPhones: você cola a lista do fornecedor (do jeito que vem no WhatsApp), ele calcula o preço de venda com a sua margem, compara com o concorrente e gera a lista pronta para divulgar.

## O que ele faz

1. **Lê a lista do fornecedor.** Entende emojis, cabeçalhos como `📱 13 | 128GB` ou `〽️IPHONE 17 PRO MAX 256GB`, versões (`ESIM DUBAI`, `LL A`, `CHIP FISICO CHIP VIRTUAL`), cores em inglês (`Orange`, `Silver`, `Rose`) e preços como `1.450`, `R$14500` ou `9.750,00`. Linhas que vieram coladas umas nas outras são separadas. Quando a lista é muito fora do padrão, o botão **Interpretar com IA** usa o Gemini.
2. **Calcula o preço de venda.**
   - Margem padrão sobre o custo.
   - Regras por modelo, por exemplo `12, 13, 14` → 22% + R$ 100. A primeira regra que casar com o aparelho é a que vale.
   - Arredondamento: valor fechado (2.100), final 90 (2.090) ou de 50 em 50.
   - Lucro mínimo por aparelho: o preço nunca fica abaixo dele.
3. **Compara com o concorrente.** Cole a lista do concorrente ou digite o preço direto na tabela. Há três estratégias:
   - *Ficar abaixo*: fica R$ X abaixo do concorrente.
   - *Igualar*: usa o mesmo preço do concorrente.
   - *Ignorar*: não usa o concorrente no cálculo.

   Se bater o concorrente deixar o lucro abaixo do mínimo, o aparelho aparece como **Não dá p/ bater**.
4. **Gera a lista para divulgar.** O texto sai no estilo da lista do fornecedor, com topo e rodapé editáveis, e pode ser copiado com um botão. Também dá para exportar uma planilha CSV que abre direto no Excel em português.
5. **Análise do agente** (opcional). O Gemini lê a tabela calculada e aponta margens baixas, onde dá para subir o preço e distorções entre cores.

O preço é sempre calculado pelo código (`lib/pricing/engine.ts`), nunca pela IA. A IA só lê listas difíceis e comenta os números.

Tudo o que você digita fica salvo no navegador. Um preço digitado à mão só vale enquanto o custo do fornecedor daquele aparelho continuar o mesmo.

## Rodar

```bash
npm install
cp .env.example .env.local   # coloque sua GEMINI_API_KEY (opcional)
npm run dev
```

Sem `GEMINI_API_KEY`, tudo funciona, exceto os dois botões de IA. `GEMINI_MODEL` troca o modelo (o padrão é `gemini-2.5-flash`).

## Testes

```bash
npm test
```

Os testes rodam a leitura e o cálculo com uma lista real de fornecedor (`lib/pricing/__fixtures__/fornecedor.txt`). Precisa do Node 22 ou mais novo.

## Estrutura

| Arquivo | O que faz |
|---|---|
| `lib/pricing/parser.ts` | Lê listas de fornecedor/concorrente |
| `lib/pricing/engine.ts` | Margem, regras, arredondamento, concorrente, lista e CSV |
| `app/api/agente/route.ts` | Agente Gemini: interpretar lista e analisar tabela |
| `app/page.tsx` | Tela do analisador |
| `components/analyzer/` | Painel de regras e tabela de preços |
