# PLAN.md — Site + Agendamento · Barbearia Garcez

> Desenvolvimento dividido em milestones. Um milestone por vez, com verificação ao final de cada um antes de avançar. Marcar `[x]` conforme concluído.

## Visão geral

| Item | Definição |
|---|---|
| **Produto** | Site institucional + agendamento online (cliente sem login) + painel admin |
| **Stack** | Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Supabase · Vercel |
| **Estrutura** | Wireframe/copy do Relume ([relume-export/](relume-export/)) |
| **Identidade visual** | [DESIGN-bmw.md](DESIGN-bmw.md) — azul #1c69d4 único CTA, cantos retos 0px, Inter 700/300, canvas claro + bandas navy #1a2129 |
| **Timezone/idioma** | America/Sao_Paulo · pt-BR |

**Decisão de design (paleta Relume descartada):** as cores dourado/preto e botões pill do export eram aleatórias. Usamos os tokens BMW já aplicados em [app/globals.css](app/globals.css). A tipografia segue o DESIGN-bmw.md: **Inter** 700 (display) / 300 (body) — a fonte Phudu do Relume não será usada. O ritmo de seções segue a regra BMW: claro → herói escuro → claro → ... (nunca duas bandas iguais consecutivas).

---

## ✅ M0 — Setup (concluído)

- [x] Skills instaladas (revenue-centric-design, frontend-design, code-reviewer, supabase-postgres-best-practices, security-audit)
- [x] Scaffold Next.js 16 + TS + Tailwind v4 na raiz
- [x] shadcn/ui init + 13 componentes base
- [x] Deps: `@supabase/ssr`, `@supabase/supabase-js`, `date-fns`, `date-fns-tz`
- [x] Tokens do DESIGN-bmw.md aplicados em `app/globals.css`
- [x] Export do Relume recebido e analisado

---

## ✅ M1 — Fundação visual (layout, navbar, footer) (concluído)

**Objetivo:** esqueleto do site navegável com identidade aplicada.

- [x] Fonte Inter (300/400/700) via `next/font` no `app/layout.tsx`, lang `pt-BR`, metadata básica
- [x] Logo: wordmark tipográfico "BARBEARIA / GARCEZ" em `components/site/logo.tsx` (SVGs do Relume eram placeholder genérico — descartados)
- [x] `components/site/navbar.tsx` — sticky 64px, canvas branco, links (Início, Serviços, Galeria, Sobre, Localização) + CTA azul "Agendar horário" (ref: navbar-05, mega-dropdown de blog descartado — fora do escopo)
- [x] `components/site/footer.tsx` — surface-soft, 4 colunas (marca, páginas, contato, horários), Instagram/WhatsApp/Maps, copyright (ref: footer-09, newsletter fake substituída por links reais)
- [x] Rota `/agendar` placeholder + layout do grupo `(site)` + home provisória com copy do hero
- [x] Mobile: menu hamburguer full-screen
- [x] `lib/site.ts` — constantes centralizadas (endereço, WhatsApp, Instagram, horários) p/ troca única no M6

**Notas técnicas:** shadcn desta versão usa Base UI (prop `render`, não `asChild`); lucide-react removeu ícones de marca (Instagram = SVG inline).

---

## ✅ M2 — Landing page (Home completa, dados estáticos) (concluído)

**Objetivo:** Home com as 8 seções do sitemap Relume, copy do export, visual BMW. Dados de serviços em `lib/data.ts` (já modelados como o banco: centavos/minutos) — migram para o Supabase no M3.

Seções (ordem do [sitemap](relume-export/sitemap.md), esquemas re-mapeados para BMW):

- [x] **Hero** (ref: header-149) — banda navy, "O corte que define o homem.", CTAs + foto full-bleed
- [x] **Serviços** (ref: layout-506) — tabs verticais com 6 serviços, preço/duração, tab ativa azul, CTA Agendar
- [x] **Galeria** (ref: gallery-09) — surface-soft, grid 2fr/1fr/1fr linkando para o Instagram
- [x] **Sobre** (ref: layout-145) — banda navy, história + imagem
- [x] **Depoimentos** (ref: testimonial-09) — grid de 3 com hairlines (carrossel descartado — sem dependência extra)
- [x] **Localização** (ref: contact-30) — endereço + horários + WhatsApp + **mapa Google embed real** (substituiu fotos placeholder)
- [x] Revisão responsiva 390px/1440px + zero warnings no console

**Verificação feita:** screenshots desktop/mobile via Edge headless + puppeteer-core (devDep); overflow check programático (scrollWidth 390 = viewport ✓); imagens lazy abaixo da dobra é comportamento esperado do next/image.

---

## ✅ M3 — Supabase (banco, RLS, seed) (concluído)

**Objetivo:** banco modelado e seguro.

- [x] `.env.local` (gitignored) + `.env.example` (com exceção `!.env.example` no .gitignore)
- [x] Migration `supabase/migrations/0001_init.sql`: 5 tabelas + checks de domínio (preço ≥ 0, telefone 10–13 dígitos, etc.)
- [x] Anti double-booking: `btree_gist` + `EXCLUDE USING gist` — **testado com conflito real: HTTP 400/23P01** ✓
- [x] RLS: catálogo público; `appointments`/`time_blocks` sem acesso anon — **testado: SELECT retorna [], INSERT anon = 401** ✓
- [x] Índices FK + agenda
- [x] Seed aplicado: 6 serviços, 2 barbeiros (Garcez + Matheus), 12 faixas de horário
- [x] Clients em `lib/supabase/` (`server.ts` anon, `admin.ts` service-role com `server-only`) + tipos TS
- [x] Home lê serviços do banco (`lib/services.ts`, revalidate 300s, fallback estático) — confirmado sem fallback nos logs
- [x] Usuário admin criado via API (danilowendler@gmail.com, senha temporária entregue)
- [x] Signups públicos: pedido para desativar no dashboard (política dá acesso total a `authenticated`)

**Pendências de segurança anotadas:** rotacionar a service role key (foi colada no chat); trocar a senha temporária do admin.

---

## ✅ M4 — Agendamento do cliente (/agendar) (concluído)

**Objetivo:** wizard funcional de ponta a ponta.

- [x] `lib/booking/availability.ts` — slots = working_hours − appointments ativos − time_blocks (passo = duração do serviço, TZ São Paulo, antecedência mín. 30 min, horizonte 14 dias); núcleo `computeFreeSlots` puro
- [x] Wizard `components/booking/wizard.tsx`: serviço → barbeiro (ou "sem preferência" = primeiro livre) → data (dias fechados desabilitados) → horário → nome + WhatsApp (máscara BR)
- [x] Server Actions `lib/booking/actions.ts`: validação manual completa (UUID/data/hora/nome/fone — zod dispensado: 2 campos e o banco revalida tudo), revalidação do slot, INSERT via service role, 23P01 → mensagem amigável
- [x] Tela de confirmação com resumo + wa.me pré-preenchido
- [x] Loading/erro via useTransition; `/agendar` degrada para CTA WhatsApp sem banco

**Verificação (E2E com browser real, `scripts/e2e-booking.mjs`):** fluxo completo → "Horário reservado!" ✓ · `pending` no banco ✓ · horário some da agenda do barbeiro ✓ · limpeza ✓. **Bug achado no screenshot e corrigido:** token date-fns `"c"` desalinhava o weekday (sábado aparecia fechado) — trocado por `"i"` e validado dia a dia.

---

## ✅ M5 — Painel admin (concluído)

**Objetivo:** o dono gerencia tudo.

- [x] `/admin/login` — Supabase Auth email/senha (`lib/supabase/ssr.ts` + `@supabase/ssr`); `proxy.ts` (rename do middleware no Next 16) protege `/admin/*` e renova a sessão; páginas/actions re-checam auth (defesa em profundidade) e usam o client da sessão → RLS `authenticated` vale
- [x] **Agenda** (`/admin`) — visão dia/semana via querystring, navegação ←/hoje/→, filtro por barbeiro, badge de status colorido; ações pendente→confirmar/cancelar, confirmado→concluir/cancelar; wa.me com mensagem pronta por cliente
- [x] **Bloqueios** (`/admin/bloqueios`) — form (barbeiro ou loja toda, data, início/fim, motivo) + lista de futuros com remoção
- [x] **Serviços** (`/admin/servicos`) — dialog criar/editar (nome, nome curto, preço, duração, ordem, descrição, ativo), desativar/reativar inline; revalida a home
- [x] Logout + layout admin dark navy

**Verificação (E2E `scripts/e2e-admin.mjs`, admin temporário criado/deletado via API): 12/12** — gate de auth ✓ login ✓ agenda mostra agendamento ✓ confirmar persiste ✓ bloqueio via UI zera slots do wizard ✓ remoção via UI (verdade = banco) ✓ serviços listados ✓ logout ✓. **Bug real achado pelo E2E:** Button do Base UI usa `type="button"` por padrão — os botões de form action não submetiam; corrigido com `type="submit"` em todos.

---

## ✅ M5.5 — Ajustes de design (animações e movimento) (concluído)

**Objetivo:** tirar o site do "estático": momento de assinatura visual no lugar das fotos largadas, navegação suave e galeria viva. **Prioridade: item 1.**

**Resultado:** tesoura line-art que se desenha, desliza tesourando e corta o fio (hero) · máquina que se desenha e flutua com pelos caindo (sobre) · carrossel embla com autoplay/setas/dots (galeria) · scroll suave + scrollspy na navbar · **scroll reveal** (fade + translateY sutil, stagger nos cards de produtos/depoimentos — `components/site/reveal.tsx`, mesmo padrão zero-dependência, reduced-motion sempre visível).

⚠️ **Percalço recorrente do Turbopack (dev):** mudanças em `app/globals.css` às vezes não invalidam o cache persistente — sintoma: regra ausente das stylesheets mesmo após restart. **Fix: matar o server, apagar `.next/` e reiniciar.** Hook `useScrollProgress` (components/site/scroll-art.tsx) grava `--progress` via IntersectionObserver+rAF; todo movimento é CSS calc/clamp — zero dependência de animação. Verificado por screenshots em 5 posições de scroll + emulação de `prefers-reduced-motion` (arte estática pronta, sem animações, scroll auto ✓). Percalço: Turbopack serviu CSS stale no dev (regras novas ausentes do chunk) — resolvido reiniciando o server/matando o processo da porta; bisseção com sondas confirmou o pipeline íntegro.

### 1. Animações de scroll no Hero e no Sobre (foco principal)

**Conceito — "O corte":** substituir as fotos placeholder por ilustrações line-art em SVG (traço branco fino sobre a banda navy, 100% na linguagem do design system) animadas pelo scroll:

- **Hero — a tesoura que corta:** uma tesoura gigante em line-art + um "fio" (linha tracejada horizontal atravessando a banda). Conforme o usuário scrolla:
  1. o traço da tesoura **se desenha** (técnica stroke-dashoffset: o SVG nasce invisível e vai sendo "riscado")
  2. a tesoura **desliza pela linha** com as lâminas abrindo/fechando (2–3 "tesouradas")
  3. atrás dela, o fio **se divide em dois** (a metade cortada desce alguns px e perde opacidade)
- **Sobre — a máquina:** uma máquina de barbear line-art que se desenha ao entrar na viewport + flutuação sutil (2–3px, parallax leve) enquanto visível; pequenos traços de "pelos" caindo com fade.

**Técnica (recomendada): hook próprio, zero dependências.**
- `useScrollProgress` (client): IntersectionObserver liga/desliga um listener de scroll com requestAnimationFrame que calcula o progresso 0→1 da seção pela viewport e grava em CSS vars (`--progress`, `--blade`) no elemento
- O SVG anima só com CSS `calc()` sobre essas vars (stroke-dashoffset, translate, rotate) → roda no compositor, 60fps, sem lib
- `prefers-reduced-motion`: sem listener; ilustração aparece no estado final (desenhada)
- SSR-safe: estado inicial = traço invisível, hidrata e anima
- Alternativas descartadas: CSS scroll-driven animations (suporte Safari ainda irregular), Lottie/motion (dependência + asset externo, menos controle da identidade)

**Assets:** desenho as ilustrações à mão em SVG paths (tesoura: 2 lâminas + pivô + cabos; máquina: corpo + dentes + detalhes) — traço 1.5–2px, cantos retos, sem preenchimento.

- [ ] Hook `useScrollProgress` + CSS vars
- [ ] SVG tesoura + coreografia do corte no hero (substitui a foto)
- [ ] SVG máquina + desenho/flutuação no sobre (substitui a foto)
- [ ] `prefers-reduced-motion` + fallback estático verificados

### 2. Scroll suave na navegação por âncoras

- [ ] `scroll-behavior: smooth` no `html` (CSS puro, embrulhado em `@media (prefers-reduced-motion: no-preference)`) — as seções já têm `scroll-mt-16`, então o offset da navbar fica correto
- [ ] Scrollspy sutil: link ativo na navbar ganha cor primária conforme a seção visível (IntersectionObserver) — reforça o "clean"

### 3. Carrossel em Trabalhos recentes

- [ ] Trocar o grid por carrossel: componente `carousel` do shadcn (embla-carousel — mesma base do wireframe Relume original)
- [ ] 4 imagens curadas, loop infinito, arrastável no touch
- [ ] Setas retangulares no estilo da identidade + indicador discreto (dots/contador)
- [ ] Autoplay suave (~5s) com pausa no hover/interação
- [ ] Link do Instagram permanece abaixo

**Ordem de implementação:** 1-hero → 1-sobre → 3-carrossel → 2-scroll (trivial) → verificação visual completa (screenshots + reduced-motion).

**Pronto quando:** hero e sobre têm o momento de assinatura animado, navegação desliza suave, galeria roda em carrossel — tudo a 60fps e com fallback para reduced-motion.

---

## M6 — Conteúdo real, polish e auditoria (quase concluído)

**Objetivo:** pronto para produção.

- [x] WhatsApp real (5515996254233), horários oficiais (seg 13–19, ter–qui 9–20, sex 9–22, sáb 9–15), 8 cortes reais R$35/40min (site + banco, migration 0003), seed antigo desativado
- [x] **Seção Produtos** nova: 6 produtos com fotos reais + CTA "Reservar" no WhatsApp
- [x] SEO: metadata + OG image gerada (next/og), sitemap.xml, robots.txt (bloqueia /admin), icon.svg
- [x] Skill `security-audit` executada — relatório em `SECURITY-AUDIT.md`: 0 críticas/altas; 2 médias corrigidas e testadas (headers de segurança em next.config.ts; anti-abuso máx. 3 agendamentos futuros por telefone — 4ª tentativa bloqueada em teste E2E); signups confirmados desativados (HTTP 422)
- [x] Skill `code-reviewer` executada — ESLint zerado (3 erros reais corrigidos: setState-em-effect no service-dialog/navbar; relume-export excluído do lint; python indisponível p/ scripts da skill, checklist manual aplicado)
- [x] Build limpo + regressão E2E completa (booking 5/5, admin 12/12) com o catálogo real
- [ ] ⚠️ **Pendente (depende de você):** fotos reais dos cortes p/ galeria e depoimentos (hoje: placeholders Relume — **não dá para lançar assim**); nomes reais dos barbeiros (Matheus é placeholder); MFA no admin (recomendação da auditoria)

**Pronto quando:** fotos reais na galeria + barbeiros confirmados.

---

## M7 — Deploy

- [ ] Instalar Vercel CLI (`npm i -g vercel`) e linkar projeto
- [ ] Env vars na Vercel (produção) — service role só server-side
- [ ] Deploy preview → validação → deploy produção
- [ ] Teste pós-deploy: agendamento real em produção
- [ ] (Opcional) domínio próprio

---

## Inputs pendentes do usuário

| Input | Necessário para |
|---|---|
| Credenciais Supabase (URL, anon key, service role) | M3 |
| Fotos reais (cortes, barbeiros, fachada) | M6 |
| Lista real de serviços/preços/duração | M3 (seed) / M6 |
| Horários reais de funcionamento por barbeiro | M3 (seed) / M6 |
| Nº WhatsApp da barbearia + Instagram | M2 (links) / M6 |
| Email/senha para o admin | M3 |
