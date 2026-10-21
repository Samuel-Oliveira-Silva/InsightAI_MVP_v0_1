# InsightAI — MVP demonstrativo v0.1

Primeira versão executável do InsightAI baseada nos **cinco protótipos da Sprint 3**.

## O que funciona

- Visão geral com indicadores calculados a partir dos registros de demonstração.
- Lista de calls com busca por nome/empresa/produto, filtros por resultado e etapa.
- Detalhes, resumo, trechos de transcrição e momentos decisivos de cada call.
- Escolha de um momento e de uma abordagem alternativa.
- Simulação interativa com respostas **programadas por regras** (não IA real).
- Encerramento, comparação descritiva entre o resultado registrado e o cenário simulado.
- Histórico de simulações, retomada de sessões abertas e indicadores básicos de aprendizado.
- Persistência local no navegador via `localStorage` (não sincroniza computadores).

## Avisos importantes

**Todas as calls e transcrições são fictícias.** Os nomes e as situações foram criados para demonstrar o fluxo; não há integração com TOTVS nem acesso a clientes reais.

**O motor desta versão NÃO utiliza um modelo de inteligência artificial.** As respostas são determinísticas, baseadas em regras e palavras-chave. Os resultados são qualitativos, sem probabilidades inventadas. A integração com uma API de IA e um backend autenticado são etapas futuras.

**Não existe login real**: o perfil “Vendedor Demo” é apenas demonstrativo. Sem backend, o sistema não oferece autenticação, controle de acesso multiusuário, gravação de áudio ou transcrição automática.

## Como executar (Windows / VS Code)

1. Instale [Node.js LTS](https://nodejs.org/) se ainda não tiver.
2. Extraia o ZIP em uma pasta (ex.: `Documentos/InsightAI_MVP_v0_1`).
3. No VS Code, abra a **pasta extraída**, não apenas um arquivo.
4. Abra **Terminal → New Terminal**.
5. Execute:

```bash
npm install
npm run dev
```

6. Abra a URL local mostrada no terminal (normalmente `http://localhost:5173`).

Para criar a versão de produção:

```bash
npm run build
```

Para executar os testes de lógica (Node.js 22 recomendado):

```bash
npm test
```

## Teste do fluxo completo

1. Acesse **Minhas Calls**.
2. Pesquise `Ricardo`, selecione **Ver detalhes**.
3. Consulte a aba **Transcrição** e volte para **Visão geral**.
4. Escolha `Objeção sobre investimento` e a abordagem `Explorar a objeção`.
5. Clique em **Iniciar simulação demonstrativa**.
6. Envie duas mensagens, por exemplo `Podemos estimar o retorno do investimento?` e `Podemos marcar uma reunião com a diretoria?`.
7. Clique em **Encerrar simulação**.
8. Confira **Realidade × Possibilidade** e o **Histórico de Simulações**.
9. Atualize a página e acesse **Simulações**. A sessão deve estar salva no navegador.

## Tecnologias

React, TypeScript, Vite, CSS responsivo, `localStorage`.

## Organização

- `src/data.ts` — chamadas fictícias e dados do produto.
- `src/domain.ts` — filtro, sessão, regras de resposta e persistência.
- `src/App.tsx` — telas e navegação.
- `src/styles.css` — identidade visual inspirada nos protótipos.
- `tests/domain.test.mjs` — testes automatizados da lógica.

## Próximas etapas

1. Validar o projeto rodando no computador e revisar a aparência com o protótipo.
2. Criar API backend em Python para persistência e autenticação real.
3. Integrar modelo de IA de forma segura **no backend**, sem expor chaves no navegador.
4. Executar testes de aceitação EF-01 e EF-02 e preparar vídeo de até 3 minutos.
