# 🗺️ ROADMAP - IRON BRAIN PROJECT

## 📋 Visão Geral

Sistema de treinos com IA para academia, utilizando Next.js 15, Prisma, Zod e periodização inteligente.

**Versão Atual:** 1.1.0
**Última Atualização:** 06/04/2026 16:53

---

## 🎯 Fases do Projeto

### ✅ Fase 1: Fundação (CONCLUÍDA)

- [x] Criar estrutura de pastas do projeto (Sandboxing)
- [x] Inicializar Next.js 15 com TypeScript
- [x] Instalar dependências (Zod, Framer Motion, Lucide, Recharts)
- [x] Inicializar Prisma ORM
- [x] Criar pastas de persistência (.sdd)
- [x] Definir schema do banco de dados (com EquipmentType)
- [x] Popular base de exercícios com categorização por equipamento (100 exercícios)
- [x] Configurar rotas da API

### ✅ Fase 2: Backend Core (CONCLUÍDA)

- [x] Criar models do Prisma (User, Exercise, WorkoutPlan, WorkoutSession, WorkoutSet)
- [x] Implementar validações Zod para inputs (6 schemas)
- [x] Criar APIs de CRUD para exercícios (GET/POST/PUT/DELETE com filtros)
- [x] Implementar cálculo de volume semanal por grupo muscular
- [x] Criar previsão de 1RM (Brzycki + Epley com porcentagens 60%-95%)
- [x] Criar API de progressão de carga (INCREASE/MAINTAIN/DELOAD)

### ✅ Fase 3: Motor de IA (CONCLUÍDA)

- [x] Criar lógica de periodização (Hipertrofia, Força, Deload)
- [x] Implementar geração de treinos via IA (POST /api/workout-plans?action=generate)
- [x] Criar sistema de progressão de carga (Regra 2 do TRAINING_LOGIC.md)
- [x] Validação biológica dos treinos (checkBiomechanicalBalance - push/pull ratio)
- [x] Seleção inteligente de exercícios por equipamento disponível
- [x] Lógica de split por nível (BEGINNER/INTERMEDIATE/ADVANCED)
- [x] Progressão automática entre fases (determineNextPhase)

### ✅ Fase 4: Frontend (CONCLUÍDA)

- [x] Dashboard principal (stats cards, quick actions, fase atual)
- [x] Página de exercícios (busca, filtros por músculo e equipamento)
- [x] Central de treinos (abas: Gerar Treino, Calcular 1RM, Registrar)
- [x] Tema dark com Tailwind CSS
- [x] Tela de registro de treino (src/app/workouts/log/page.tsx)
- [x] Visualização de progresso com Recharts (src/app/progress/page.tsx)
- [x] Animações com Framer Motion (PageTransition, stagger children)

### ✅ Fase 5: Testes (CONCLUÍDA)

- [x] Testes unitários com Vitest (25 testes passando)
- [x] API de Progresso com dados reais do banco
- [x] Página de Progresso conectada com API
- [x] Playwright instalado e configurado
- [x] Testes E2E criados (Dashboard, Exercises, Workouts)
- [ ] Testes de integração das APIs (requer banco ativo)
- [ ] Executar testes E2E (requer servidor rodando)

### ✅ Fase 6: Autenticação e Painel Admin (CONCLUÍDA)

- [x] Sistema de autenticação (JWT com jose)
- [x] Tela de Login (/auth/login)
- [x] Tela de Cadastro (/auth/register)
- [x] Model User atualizada com password hash, role, subscription
- [x] Painel Admin (/admin)
  - [x] Lista de clientes (com paginação e busca)
  - [x] Gerenciar assinaturas (UI pronta)
  - [x] Estatísticas de uso
  - [x] Criar cadastro de clientes pelo admin (POST /api/admin/users)
  - [x] Formulário de cadastro na página admin
  - [x] Tela de pagamento após cadastro do cliente
- [x] Conta bancária para pagamentos (UI Stripe pronta)
- [x] Sistema de assinatura/pagamento (UI pronta)
- [x] Middleware de proteção de rotas por role
- [x] API de logout (/api/auth/logout)
- [x] API de admin para usuários (/api/admin/users - GET/PUT/DELETE/POST)

### 📋 Fase 7: Deploy e Produção (PENDENTE)

- [ ] Executar `npx prisma db push` (banco necessário)
- [ ] Criar script de seed para admin user
- [ ] Configurar Stripe (API keys reais)
- [ ] Deploy em produção (Vercel/Neon)
- [ ] Executar testes E2E em produção

---

## 📊 Resumo Técnico

### APIs Implementadas

| Endpoint                             | Método              | Descrição                     |
| ------------------------------------ | ------------------- | ----------------------------- |
| `/api/exercises`                     | GET/POST/PUT/DELETE | CRUD Exercícios               |
| `/api/workout-plans`                 | GET/POST            | CRUD + Geração IA             |
| `/api/workout-plans?action=generate` | POST                | Gera treino via IA            |
| `/api/calculate/one-rm`              | POST                | Calcula 1RM (Brzycki+Epley)   |
| `/api/calculate/weekly-volume`       | POST                | Calcula volume semanal        |
| `/api/calculate/overload`            | POST                | Progressão de carga           |
| `/api/progress`                      | GET                 | Dados de progresso do usuário |
| `/api/auth/login`                    | POST                | Login JWT                     |
| `/api/auth/register`                 | POST                | Cadastro de usuário           |
| `/api/auth/logout`                   | POST                | Logout                        |
| `/api/admin/users`                   | GET/POST/PUT/DELETE | CRUD Admin de usuários        |

### Arquivos do Projeto

```
projects/iron-brain/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Dashboard
│   │   ├── exercises/page.tsx          # Catálogo de Exercícios
│   │   ├── workouts/page.tsx           # Central de Treinos
│   │   ├── workouts/log/page.tsx       # Registrar Treino
│   │   ├── progress/page.tsx           # Progresso (Gráficos)
│   │   ├── auth/login/page.tsx         # Login
│   │   ├── auth/register/page.tsx      # Cadastro
│   │   ├── admin/page.tsx              # Painel Admin
│   │   ├── middleware.ts               # Proteção de rotas
│   │   └── api/
│   │       ├── exercises/route.ts      # CRUD Exercícios
│   │       ├── workout-plans/route.ts  # CRUD + Geração IA
│   │       ├── auth/
│   │       │   ├── login/route.ts      # Login JWT
│   │       │   ├── register/route.ts   # Cadastro
│   │       │   └── logout/route.ts     # Logout
│   │       ├── admin/users/route.ts    # CRUD Admin
│   │       ├── progress/route.ts       # Dados de Progresso
│   │       └── calculate/
│   │           ├── one-rm/route.ts     # Previsão 1RM
│   │           ├── weekly-volume/route.ts # Volume Semanal
│   │           └── overload/route.ts   # Progressão de Carga
│   └── lib/
│       ├── zod-schemas.ts              # 6 schemas de validação
│       ├── training-utils.ts           # 1RM, Volume, Overload
│       └── periodization-engine.ts     # Motor de IA completo
├── prisma/
│   ├── schema.prisma                   # 5 models + enums
│   └── seed.ts                         # 100 exercícios
├── e2e/
│   ├── dashboard.spec.ts
│   ├── exercises.spec.ts
│   └── workouts.spec.ts
├── .env.example
├── vercel.json
└── README.md
```

### Stack Tecnológica

- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript 5+ (Strict Mode)
- **ORM:** Prisma v7.6.0
- **Database:** PostgreSQL
- **Validação:** Zod
- **UI:** Tailwind CSS + Lucide Icons
- **Animações:** Framer Motion (PageTransition, stagger children)
- **Gráficos:** Recharts (Progresso - carga, volume, RPE)
- **Auth:** JWT (jose) + bcryptjs
- **Testes:** Vitest + Playwright

---

## 📁 Estrutura de Memória

- `ROADMAP.md` - Este arquivo (checklist do projeto)
- `MEMORY.md` - Snapshots de progresso detalhados
- `CURRENT_STATE.json` - Estado atual da sessão
- `KNOWLEDGE_BASE.md` - Lições aprendidas (erros e acertos)
- `LOGBOOK.md` - Registro de decisões técnicas
- `implementation_plan.md` - Plano de implementação
