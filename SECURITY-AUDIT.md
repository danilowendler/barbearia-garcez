# Relatório de Auditoria de Segurança — Barbearia Garcez — 2026-07-07

## Escopo
- **Stack detectada:** Next.js 16.2.10 (App Router, Server Actions, proxy.ts) · TypeScript · Supabase (Postgres + RLS + Auth) · deploy alvo Vercel · sem mobile, sem IA, sem pagamento, single-tenant
- **Superfícies de ataque:** Server Actions públicas (`getSlotsAction`, `createBookingAction`), Server Actions admin (status/bloqueios/serviços), páginas `/admin/*`, login Supabase Auth, formulários (wizard, login, bloqueios, serviços), iframe Google Maps (outbound), links wa.me
- **Fases aplicáveis:** 0–8, 12, 14 | **N/A:** 9 (não é SaaS/sem billing), 10 (sem mobile), 11 (sem IA/integrações — só embed estático de mapa), 13 (sem pipeline CI/CD ainda — recomendação registrada)

## Resumo
- Críticas: **0** | Altas: **0** | Médias: **2 (corrigidas)** | Baixas: **4 (3 recomendações + 1 aceita)**

## Verificações que passaram (evidência de teste real)
- **F0 CVE:** Next 16.2.10 não afetado pelo CVE-2025-29927 (bypass de middleware, <14.2.25/<15.2.3)
- **F1 Segredos:** `.env*` fora do git (0 arquivos versionados, histórico limpo); sem chaves hardcoded (grep sk-/pk_live/AKIA/ghp_/sb_secret_); `NEXT_PUBLIC_*` só contém URL + publishable key (públicas por design); service key usada apenas em `lib/supabase/admin.ts` com guarda `import "server-only"`. **Chaves JWT legacy que vazaram no início do projeto foram desativadas — testado: HTTP 401**
- **F2 Rotas:** `/admin/*` protegido por `proxy.ts` (gate otimista) **e** re-checagem de sessão no layout e em cada Server Action (`requireUser`) — defesa em profundidade; testado E2E (redirect sem sessão ✓)
- **F3 Auth:** Supabase Auth (bcrypt gerenciado); **signups públicos desativados — testado: HTTP 422 `signup_disabled`** (crítico porque as policies dão acesso total a `authenticated`); rate limit de login embutido no Supabase Auth
- **F4 Validação:** `createBookingAction` valida UUID/data/hora/nome/telefone no servidor; constraints do Postgres revalidam (checks de domínio + exclusão anti-overlap, testada com conflito real → 23P01); sem `dangerouslySetInnerHTML`/`eval`; sem uploads; sem fetch de URLs do usuário (sem SSRF)
- **F5 CSRF:** Server Actions têm verificação Origin/Host nativa do Next
- **F6 Banco:** RLS em 100% das tabelas — anon lê só catálogo, `appointments`/`time_blocks` invisíveis (testado: `[]` + INSERT 401); zero SQL concatenado (só PostgREST); IDs uuid (sem enumeração)
- **F7 Exposição:** actions retornam DTOs mínimos (slots = só horários; booking = resumo); erros genéricos ao cliente, detalhe só em log de servidor
- **F14 Logs:** sem senhas/tokens/telefones em logs

## Vulnerabilidades encontradas

### [MÉDIA] Headers de segurança ausentes — CORRIGIDA
- Fase: 5 | Arquivo: `next.config.ts`
- Problema: sem X-Frame-Options, nosniff, Referrer-Policy, HSTS, Permissions-Policy; `X-Powered-By` exposto.
- Correção aplicada: headers em `next.config.ts` + `poweredByHeader: false`. Verificado por curl ✓.

### [MÉDIA] Agendamento público sem limite de abuso — CORRIGIDA
- Fase: 8 | Arquivo: `lib/booking/actions.ts`
- Problema: qualquer pessoa podia lotar a agenda com reservas falsas (nega serviço ao negócio).
- Correção aplicada: máx. 3 agendamentos futuros ativos por telefone, verificado no servidor. **Testado E2E: 4ª tentativa recusada com mensagem amigável ✓.** Defesa complementar: dedo duro natural — o dono cancela pendentes falsos no admin, liberando os slots.

### [BAIXA] npm audit: 2 moderate (postcss < 8.5.10, transitivo do Next) — ACEITA
- Fase: 0/13 | `node_modules/next/node_modules/postcss`
- Problema: XSS teórico no stringify do postcss — dependência **de build** do Next, não roda em produção; o "fix" do npm rebaixaria o Next para 9.x (absurdo).
- Decisão: aceitar e reavaliar a cada upgrade do Next.

### [BAIXA] MFA não habilitado para o admin — RECOMENDADA
- Fase: 3 | Supabase Dashboard → Authentication → Multi-Factor
- Único usuário com acesso total; MFA (TOTP) elevaria o custo de comprometimento da senha.

### [BAIXA] Sem CSP (Content-Security-Policy) — RECOMENDADA
- Fase: 5 | `next.config.ts`
- CSP estrita exige nonces nos scripts do Next + allowlist do iframe do Maps; adiada para não quebrar a home. Próximo passo documentado.

### [BAIXA] Rotina de backup/restauração não testada — RECOMENDADA
- Fase: 6/14 | Supabase (free tier tem backup diário limitado)
- Recomendação: no plano Pro ativar PITR; testar restauração; exportar dump mensal (`pg_dump`) como redundância.

## Próximos passos recomendados
1. Ativar MFA TOTP para o usuário admin (5 min, dashboard)
2. CSP com nonce quando o site estabilizar (pós-launch)
3. Ao criar repositório remoto/CI: branch protection, gitleaks + npm audit no pipeline, Dependabot
4. Plano de incidente mínimo: rotacionar chaves Supabase (novas `sb_*` são revogáveis individualmente), desativar deploy na Vercel, preservar logs
5. Reavaliar rate-limit por IP (Vercel WAF/Firewall) se houver abuso real após o launch
